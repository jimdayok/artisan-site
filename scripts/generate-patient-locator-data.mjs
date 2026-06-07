import ExcelJS from "exceljs";
import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SOURCE = path.join(process.cwd(), "private-source/portal/location_data.xlsx");
const ACCOUNT_SOURCES = [
  path.join(process.cwd(), "private-source/portal/acct_data_1.xlsx"),
  path.join(process.cwd(), "private-source/portal/acct_data_2.xlsx"),
  path.join(process.cwd(), "private-source/portal/acct_data_3.xlsx"),
];
const OUTPUT = path.join(process.cwd(), "lib/patient-locator/practices.ts");
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  textNodeName: "text",
  removeNSPrefix: true,
});

const labNamePattern = /\b(artisan labs?|artisan lab network|pacific artisan|peak artisan|pike artisan|laborator(?:y|ies)| optical lab| lab\b)\b/i;

function cellText(value) {
  if (value == null) return "";
  if (typeof value === "object") return String(value.text ?? value.result ?? value.hyperlink ?? "").trim();
  return String(value).trim();
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function normalizeYes(value) {
  return /^yes$/i.test(cellText(value));
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function inlineText(value) {
  if (!value) return "";
  const direct = value.t;
  if (typeof direct === "string" || typeof direct === "number") return String(direct).trim();
  if (direct?.text) return String(direct.text).trim();
  return asArray(value.r)
    .map((run) => (typeof run.t === "string" ? run.t : run.t?.text ?? ""))
    .join("")
    .trim();
}

function accountFlagValue(current, candidate) {
  return current || candidate;
}

async function readAccountFlags(filePath) {
  const zip = await JSZip.loadAsync(await readFile(filePath));
  const sheetXml = await zip.file("xl/worksheets/sheet1.xml")?.async("text");
  if (!sheetXml) return [];

  const worksheet = xmlParser.parse(sheetXml).worksheet;
  const rows = asArray(worksheet?.sheetData?.row);
  const values = rows.map((row) =>
    asArray(row.c).map((cell) => {
      if (cell.t === "inlineStr") return inlineText(cell.is);
      if (cell.v !== undefined) return cellText(cell.v);
      return "";
    })
  );
  const headers = values[0] ?? [];

  return values.slice(1).map((row) =>
    Object.fromEntries(headers.map((header, columnIndex) => [header, row[columnIndex] ?? ""]))
  );
}

const accountFlagsByAcctId = new Map();
for (const accountSource of ACCOUNT_SOURCES) {
  const rows = await readAccountFlags(accountSource);
  for (const row of rows) {
    const acctId = cellText(row["Acct ID"]);
    if (!acctId) continue;

    const current = accountFlagsByAcctId.get(acctId) ?? {
      tokai: false,
      artisanPartner: false,
    };
    accountFlagsByAcctId.set(acctId, {
      tokai: accountFlagValue(current.tokai, normalizeYes(row["Tokai Usage"])),
      artisanPartner: accountFlagValue(
        current.artisanPartner,
        cellText(row["Last Division"]).toUpperCase() === "PART"
      ),
    });
  }
}

function cleanWebsite(value) {
  const raw = cellText(value);
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

function cleanLocations(value) {
  const parsed = Number(cellText(value));
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 1;
}

function parseCityState(address) {
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  const last = parts.at(-1) ?? "";
  const stateZip = last.match(/\b([A-Z]{2})\b\s*(\d{4,5}(?:-\d{4})?)?$/);
  const state = stateZip?.[1] ?? "";
  const zip = stateZip?.[2] ?? "";
  const city = parts.length >= 2 ? parts.at(-2) ?? "" : "";
  return { city, state, zip };
}

function splitInsurance(value) {
  return cellText(value)
    .split(/[,;|\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(SOURCE);
const worksheet = workbook.worksheets[0];
const headers = worksheet.getRow(1).values.slice(1).map(cellText);
const index = new Map(headers.map((header, i) => [header, i + 1]));

function get(row, header) {
  return cellText(row.getCell(index.get(header) ?? 0).value);
}

const practices = [];
for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
  const row = worksheet.getRow(rowNumber);
  if (!normalizeYes(get(row, "Organization - Locator Tool"))) continue;

  const name = get(row, "Organization - Name");
  const address = get(row, "Organization - Full/combined address of Address") || get(row, "Organization - Address");
  const phone = get(row, "Organization - Practice Phone Number");
  const website = cleanWebsite(get(row, "Organization - Website"));
  const insurances = splitInsurance(get(row, "Organization - Managed Vision Care"));
  const numberOfLocations = cleanLocations(get(row, "Organization - Number of Locations"));
  const acctId = get(row, "Organization - Acct ID");
  const accountNumber = get(row, "Organization - Account Number");
  const { city, state, zip } = parseCityState(address);
  const accountFlags = accountFlagsByAcctId.get(acctId) ?? {
    tokai: false,
    artisanPartner: false,
  };

  if (!name || !address || !city || !state) continue;
  if (labNamePattern.test(name) || labNamePattern.test(address)) continue;

  practices.push({
    id: slug(`${acctId || accountNumber || name}-${address}`),
    name,
    acctId,
    accountNumber,
    address,
    city,
    state,
    zip,
    phone,
    website,
    insurances,
    numberOfLocations,
    placeId: "",
    tokai: accountFlags.tokai,
    artisanPartner: accountFlags.artisanPartner,
  });
}

const uniquePractices = [...new Map(practices.map((practice) => [practice.id, practice])).values()];
uniquePractices.sort((a, b) => a.name.localeCompare(b.name) || a.address.localeCompare(b.address));

const output = `// Generated by scripts/generate-patient-locator-data.mjs from private-source/portal/location_data.xlsx\n// Source of truth rule: only rows with Organization - Locator Tool = Yes are included.\n\nimport type { ApprovedPractice } from "./types";\n\nexport const approvedPatientPractices: ApprovedPractice[] = ${JSON.stringify(uniquePractices, null, 2)};\n`;

await mkdir(path.dirname(OUTPUT), { recursive: true });
await writeFile(OUTPUT, output);
console.log(`Generated ${uniquePractices.length} approved patient locator practices.`);
