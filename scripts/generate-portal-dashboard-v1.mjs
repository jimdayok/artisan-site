import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, cpSync, renameSync } from "node:fs";
import path from "node:path";
import ExcelJS from "exceljs";
import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";

const root = process.cwd();
const portalDir = path.join(root, "private-source", "portal");
const defaultAccountInputCandidates = [
  path.join(portalDir, "acct_data.xlsx"),
  path.join(portalDir, "Acct_Data.xlsx"),
  path.join(portalDir, "acct_data.csv"),
  path.join(portalDir, "Acct_Data.csv"),
];
const defaultUserInputCandidates = [
  path.join(portalDir, "user_data.xlsx"),
  path.join(portalDir, "User_Data.xlsx"),
  path.join(portalDir, "user_data.csv"),
  path.join(portalDir, "User_Data.csv"),
];
const outputBaseDir = path.join(portalDir, "dashboard-v1");
const releasesDir = path.join(outputBaseDir, "releases");
const currentDir = path.join(outputBaseDir, "current");
const tempCurrentDir = path.join(outputBaseDir, "current.tmp");
const previousCurrentDir = path.join(outputBaseDir, "current.prev");
const validationErrorsDir = path.join(outputBaseDir, "validation-errors");

const REQUIRED_ACCOUNT_COLUMNS = [
  "Acct ID",
  "Last Business Name",
  "All Account Numbers",
  "Last Full Address",
  "Last Division",
  "Latest Date Shipped",
  "Primary PAL Brand (Private Pay)",
  "Primary PAL Brand (VSP)",
  "Last Lab Name",
  "Last Phone Number",
  "Last State",
  "Modern Pkg Usage",
  "Modern Frm Usage",
  "ChemClip Usage",
  "SpecCheck Usage",
  "Tokai Usage",
  "Previous Month Tier Rank by Acct ID",
  "PPM Jobs",
  "PM Jobs",
  "CM Jobs",
  "PPM Sales",
  "PM Sales",
  "CM Sales",
  "PPM NL Jobs",
  "PM NL Jobs",
  "CM NL Jobs",
  "PPM SQL Jobs",
  "PM SQL Jobs",
  "CM SQL Jobs",
  "PPM VSP Jobs",
  "PM VSP Jobs",
  "CM VSP Jobs",
  "Data Refresh Date",
];

const REQUIRED_USER_COLUMNS = [
  "Person - Name",
  "Person - Organization",
  "Person - Role Type",
  "Person - Email - Work",
  "Person - Email - Home",
  "Person - Email - Other",
  "Organization - Division",
  "Organization - Targeted Programs",
  "Organization - All Account Numbers",
  "Person - Marketing status",
  "Organization - Acct ID",
  "Organization - Numeric ID",
];

const ACCOUNT_HEADER_ALIASES = {
  "Acct ID": ["Acct ID", "Last Account Number", "Organization - Account Number", "Account Number"],
  "Pipedrive ID": ["Pipedrive ID"],
  "Last Business Name": ["Last Business Name", "Account Name", "Organization - Name", "Person - Organization"],
  "All Account Numbers": ["All Account Numbers"],
  "Last Full Address": ["Last Full Address", "Full Address"],
  "Last Division": ["Last Division", "Division", "Organization - Division"],
  "Latest Date Shipped": ["Latest Date Shipped", "Last Shipped Date", "Last Order Shipped", "Organization - Last Order Shipped"],
  "Primary PAL Brand (Private Pay)": ["Primary PAL Brand (Private Pay)"],
  "Primary PAL Brand (VSP)": ["Primary PAL Brand (VSP)"],
  "Last Lab Name": ["Last Lab Name", "Organization - Artisan Lab"],
  "Last Phone Number": ["Last Phone Number", "Phone Number"],
  "Last State": ["Last State", "State"],
  "Modern Pkg Usage": ["Modern Pkg Usage"],
  "Modern Frm Usage": ["Modern Frm Usage"],
  "ChemClip Usage": ["ChemClip Usage"],
  "SpecCheck Usage": ["SpecCheck Usage"],
  "Tokai Usage": ["Tokai Usage"],
  "Previous Month Tier Rank by Acct ID": ["Previous Month Tier Rank by Acct ID", "CM/PM Tier", "Tier"],
  "PPM Jobs": ["PPM Jobs"],
  "PM Jobs": ["PM Jobs"],
  "CM Jobs": ["CM Jobs"],
  "PPM Sales": ["PPM Sales"],
  "PM Sales": ["PM Sales"],
  "CM Sales": ["CM Sales"],
  "PPM NL Jobs": ["PPM NL Jobs"],
  "PM NL Jobs": ["PM NL Jobs"],
  "CM NL Jobs": ["CM NL Jobs"],
  "PPM SQL Jobs": ["PPM SQL Jobs"],
  "PM SQL Jobs": ["PM SQL Jobs"],
  "CM SQL Jobs": ["CM SQL Jobs"],
  "PPM VSP Jobs": ["PPM VSP Jobs"],
  "PM VSP Jobs": ["PM VSP Jobs"],
  "CM VSP Jobs": ["CM VSP Jobs"],
  "Used Price Lists": ["Used Price Lists", "Used Price List", "Price Lists", "Associated Price Lists"],
  "PPM Lab Redo %": ["PPM Lab Redo %"],
  "PM Lab Redo %": ["PM Lab Redo %"],
  "CM Lab Redo %": ["CM Lab Redo %"],
  "PPM Office Redo %": ["PPM Office Redo %", "PPM Office Redo%"],
  "PM Office Redo %": ["PM Office Redo %", "PM Office Redo%"],
  "CM Office Redo %": ["CM Office Redo %", "CM Office Redo%"],
  "PPM Warranty %": ["PPM Warranty %"],
  "PM Warranty %": ["PM Warranty %"],
  "CM Warranty %": ["CM Warranty %"],
  "PPM Non-Adapt %": ["PPM Non-Adapt %", "PPM Non Adapt %"],
  "PM Non-Adapt %": ["PM Non-Adapt %", "PM Non Adapt %"],
  "CM Non-Adapt %": ["CM Non-Adapt %", "CM Non Adapt %"],
  "Is Enrolled in ARSQL26": ["Is Enrolled in ARSQL26"],
  "Is Enrolled in ARPMP26": ["Is Enrolled in ARPMP26"],
  "Is Enrolled in ARUTY26": ["Is Enrolled in ARUTY26"],
  "Data Refresh Date": ["Data Refresh Date", "Last Shipped Date (Global)"],
};

const USER_HEADER_ALIASES = {
  "Person - Name": ["Person - Name"],
  "Person - Organization": ["Person - Organization"],
  "Person - Role Type": ["Person - Role Type"],
  "Person - Email - Work": ["Person - Email - Work"],
  "Person - Email - Home": ["Person - Email - Home"],
  "Person - Email - Other": ["Person - Email - Other"],
  "Organization - Division": ["Organization - Division"],
  "Organization - Targeted Programs": ["Organization - Targeted Programs"],
  "Organization - All Account Numbers": ["Organization - All Account Numbers", "All Account Numbers"],
  "Person - Marketing status": ["Person - Marketing status"],
  "Organization - Acct ID": ["Organization - Acct ID"],
  "Organization - Numeric ID": ["Organization - Numeric ID"],
};

const ACCT_ID_PATTERN = /^[A-Za-z0-9]+-[A-Za-z0-9-]+$/;
const CORE_ACCOUNT_METRIC_COLUMNS = ["PPM Jobs", "PM Jobs", "CM Jobs", "PPM Sales", "PM Sales", "CM Sales"];
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  textNodeName: "text",
  removeNSPrefix: true,
});

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    accountInput: "",
    userInput: "",
    accountSheet: "Export",
    userSheet: "person list",
    allowDuplicateAcctId: false,
    ignoreEmptySummaryRows: false,
    allowInvalidUserAccountLinks: false,
  };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--input") parsed.accountInput = args[++i] ?? "";
    else if (arg === "--account-input") parsed.accountInput = args[++i] ?? "";
    else if (arg === "--user-input") parsed.userInput = args[++i] ?? "";
    else if (arg === "--sheet") parsed.accountSheet = args[++i] ?? "Export";
    else if (arg === "--account-sheet") parsed.accountSheet = args[++i] ?? "Export";
    else if (arg === "--user-sheet") parsed.userSheet = args[++i] ?? "person list";
    else if (arg === "--allow-duplicate-acct-id") parsed.allowDuplicateAcctId = true;
    else if (arg === "--ignore-empty-summary-rows") parsed.ignoreEmptySummaryRows = true;
    else if (arg === "--allow-invalid-user-account-links") parsed.allowInvalidUserAccountLinks = true;
  }
  return parsed;
}

function toText(value) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object") {
    if ("text" in value) return toText(value.text);
    if ("result" in value) return toText(value.result);
  }
  return String(value).trim();
}

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(toText(value).replace(/[$,%\s,]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function toIsoDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const text = toText(value);
  if (!text) return "";
  const serial = Number(text);
  if (Number.isFinite(serial) && serial > 0 && !text.includes("-")) {
    const epoch = Date.UTC(1899, 11, 30);
    const date = new Date(epoch + serial * 24 * 60 * 60 * 1000);
    return date.toISOString().slice(0, 10);
  }
  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return text;
}

function normalizeAcctId(value) {
  return toText(value).replace(/\.0$/, "").toUpperCase();
}

function safeFileName(value) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function canonicalHeader(rawHeader, aliasMap) {
  const normalized = toText(rawHeader).toLowerCase();
  if (!normalized) return "";
  for (const [canonical, aliases] of Object.entries(aliasMap)) {
    if (aliases.map((entry) => entry.toLowerCase()).includes(normalized)) return canonical;
  }
  return toText(rawHeader);
}

function worksheetToRecords(worksheet, aliasMap) {
  const rows = [];
  const headers = worksheet.getRow(1).values.slice(1).map((value) => canonicalHeader(value, aliasMap));
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = row.values.slice(1);
    const record = {};
    let hasValue = false;
    for (let idx = 0; idx < headers.length; idx += 1) {
      const header = headers[idx];
      if (!header) continue;
      record[header] = values[idx];
      if (toText(values[idx])) hasValue = true;
    }
    if (hasValue) rows.push(record);
  });
  return rows;
}

async function readRows(inputFile, sheetName, aliasMap) {
  const ext = path.extname(inputFile).toLowerCase();
  if (ext === ".csv") {
    const workbook = new ExcelJS.Workbook();
    const worksheet = await workbook.csv.readFile(inputFile);
    return worksheetToRecords(worksheet, aliasMap);
  }
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(inputFile);
    const worksheet = workbook.getWorksheet(sheetName) ?? workbook.worksheets[0];
    if (!worksheet) return [];
    return worksheetToRecords(worksheet, aliasMap);
  } catch {
    return readRowsFromXlsxZip(inputFile, sheetName, aliasMap);
  }
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function columnIndex(cellRef) {
  const letters = String(cellRef || "A").match(/[A-Z]+/i)?.[0] || "A";
  return [...letters.toUpperCase()].reduce((total, letter) => total * 26 + letter.charCodeAt(0) - 64, 0) - 1;
}

function sharedStringText(sharedString) {
  if (!sharedString) return "";
  if (sharedString.t !== undefined && typeof sharedString.t !== "object") return toText(sharedString.t);
  if (sharedString.t?.text) return sharedString.t.text;
  return asArray(sharedString.r)
    .map((run) => (typeof run.t === "string" ? run.t : run.t?.text || ""))
    .join("");
}

async function readRowsFromXlsxZip(filePath, sheetName, aliasMap) {
  const zip = await JSZip.loadAsync(readFileSync(filePath));
  const workbookXml = await zip.file("xl/workbook.xml")?.async("text");
  const relsXml = await zip.file("xl/_rels/workbook.xml.rels")?.async("text");
  if (!workbookXml || !relsXml) return [];

  const workbook = xmlParser.parse(workbookXml).workbook;
  const rels = xmlParser.parse(relsXml).Relationships;
  const sheets = asArray(workbook.sheets?.sheet);
  const sheet = sheets.find((entry) => entry.name === sheetName) ?? sheets[0];
  if (!sheet) return [];

  const relId = sheet["r:id"] ?? sheet.id;
  const rel = asArray(rels.Relationship).find((entry) => entry.Id === relId);
  const target = rel?.Target?.replace(/^\/?xl\//, "");
  const sheetPath = target ? `xl/${target}` : "";
  const sheetXml = sheetPath ? await zip.file(sheetPath)?.async("text") : "";
  if (!sheetXml) return [];

  const sharedStringsXml = await zip.file("xl/sharedStrings.xml")?.async("text");
  const sharedStrings = sharedStringsXml
    ? asArray(xmlParser.parse(sharedStringsXml).sst?.si).map(sharedStringText)
    : [];
  const parsedSheet = xmlParser.parse(sheetXml).worksheet;
  const sheetRows = asArray(parsedSheet.sheetData?.row).map((row) => {
    const output = [];
    let sequentialIndex = 0;
    for (const cell of asArray(row.c)) {
      const index = cell.r ? columnIndex(cell.r) : sequentialIndex;
      let value = "";
      if (cell.t === "s") value = sharedStrings[Number(cell.v)] ?? "";
      else if (cell.t === "inlineStr") value = sharedStringText(cell.is);
      else if (cell.v !== undefined) value = cell.v;
      output[index] = value;
      sequentialIndex = index + 1;
    }
    return output;
  });

  if (!sheetRows.length) return [];
  const headers = [];
  for (let i = 0; i < sheetRows[0].length; i += 1) headers[i] = canonicalHeader(sheetRows[0][i], aliasMap);
  const rows = [];
  for (let rowIndex = 1; rowIndex < sheetRows.length; rowIndex += 1) {
    const values = sheetRows[rowIndex];
    const record = {};
    let hasValue = false;
    for (let index = 0; index < headers.length; index += 1) {
      const header = headers[index];
      if (!header) continue;
      const value = values[index] ?? "";
      record[header] = value;
      if (toText(value)) hasValue = true;
    }
    if (hasValue) rows.push(record);
  }
  return rows;
}

function pct(numerator, denominator) {
  if (!denominator) return 0;
  return numerator / denominator;
}

function trendDirection(current, previous) {
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "flat";
}

function growthRate(current, previous) {
  if (previous === 0) return current > 0 ? 1 : 0;
  return (current - previous) / Math.abs(previous);
}

function truthyUsage(value) {
  const normalized = toText(value).toLowerCase();
  if (!normalized) return false;
  return !["no", "none", "0", "0%", "false", "n/a", "na"].includes(normalized);
}

function parseUsedPriceLists(value) {
  return [...new Set(
    toText(value)
      .split(/[;,|/]/)
      .flatMap((entry) => entry.split(/\s+/))
      .map((entry) => entry.trim().toUpperCase())
      .filter((entry) => /^[A-Z0-9]{2,4}$/.test(entry))
  )];
}

function isPowerBiArtifactText(value) {
  const text = toText(value).toLowerCase();
  return (
    text.startsWith("applied filters:") ||
    text.includes("applied filters:") ||
    text.includes("excluded") ||
    text.includes("account name") ||
    text.includes("phone number")
  );
}

function isUserSummaryArtifactRow(row) {
  const acctId = normalizeAcctId(row["Organization - Acct ID"]);
  const org = toText(row["Person - Organization"]);
  const name = toText(row["Person - Name"]);
  const work = toText(row["Person - Email - Work"]);
  const home = toText(row["Person - Email - Home"]);
  const other = toText(row["Person - Email - Other"]);
  const division = toText(row["Organization - Division"]);
  const programs = toText(row["Organization - Targeted Programs"]);
  const allAccountNumbers = toText(row["Organization - All Account Numbers"]);

  const emailText = `${work} ${home} ${other}`.toLowerCase();
  const hasEmail = /[^\s@]+@[^\s@]+\.[^\s@]+/.test(emailText);
  const hasIdentity = Boolean(name || org || division || programs || allAccountNumbers);
  const acctLooksInvalid = !acctId || !ACCT_ID_PATTERN.test(acctId);
  const hasSummaryText =
    isPowerBiArtifactText(name) ||
    isPowerBiArtifactText(org) ||
    emailText.includes("applied filters") ||
    emailText.includes("excluded");

  // Safe skip for trailing report artifacts: no emails + invalid acct id + summary/filter text.
  return acctLooksInvalid && !hasEmail && (hasSummaryText || !hasIdentity);
}

function isClearSummaryArtifactRow(row) {
  const acctIdText = toText(row["Acct ID"]);
  const businessName = toText(row["Last Business Name"]);
  const allAccountNumbers = toText(row["All Account Numbers"]);
  const pipedriveId = toText(row["Pipedrive ID"]);
  const lastLabName = toText(row["Last Lab Name"]);
  const lastState = toText(row["Last State"]);
  const refreshDate = toIsoDate(row["Data Refresh Date"]);
  const hasIdentity = Boolean(allAccountNumbers || pipedriveId || lastLabName || lastState || refreshDate);
  const noMetrics = CORE_ACCOUNT_METRIC_COLUMNS.every((column) => toNumber(row[column]) === 0);
  return !hasIdentity && noMetrics && (isPowerBiArtifactText(acctIdText) || isPowerBiArtifactText(businessName));
}

function looksLikeRealAccountRow(row) {
  const signals = [
    toText(row["Last Business Name"]),
    toText(row["All Account Numbers"]),
    toText(row["Pipedrive ID"]),
    toText(row["Last Lab Name"]),
    toText(row["Last State"]),
    toIsoDate(row["Data Refresh Date"]),
  ];
  const hasMetric = CORE_ACCOUNT_METRIC_COLUMNS.some((column) => toNumber(row[column]) > 0);
  return signals.some(Boolean) || hasMetric;
}

function toCsvLine(values) {
  return values
    .map((value) => {
      const text = toText(value);
      if (text.includes(",") || text.includes("\"") || text.includes("\n")) return `"${text.replace(/"/g, "\"\"")}"`;
      return text;
    })
    .join(",");
}

function writeCsvReport(fileName, headers, rows) {
  mkdirSync(validationErrorsDir, { recursive: true });
  const csv = [toCsvLine(headers), ...rows.map((row) => toCsvLine(headers.map((h) => row[h] ?? "")))].join("\n");
  writeFileSync(path.join(validationErrorsDir, fileName), `${csv}\n`);
}

function validateAccountRows(rows, allowDuplicateAcctId, ignoreEmptySummaryRows) {
  if (!rows.length) throw new Error("No account rows found in source export.");
  const headerSet = new Set(Object.keys(rows[0]));
  const missingColumns = REQUIRED_ACCOUNT_COLUMNS.filter((column) => !headerSet.has(column));
  if (missingColumns.length > 0) throw new Error(`Missing required account columns: ${missingColumns.join(", ")}`);

  const acctIdCounts = new Map();
  const refreshDates = new Set();
  const cleanedRows = [];
  const invalidAcctIdRows = [];
  const missingAcctIdRows = [];
  let skippedSummaryRows = 0;

  for (const row of rows) {
    const acctIdRaw = toText(row["Acct ID"]);
    const acctId = normalizeAcctId(row["Acct ID"]);
    if (!acctId) {
      if (ignoreEmptySummaryRows && isClearSummaryArtifactRow(row)) {
        skippedSummaryRows += 1;
        continue;
      }
      missingAcctIdRows.push({
        "Acct ID": acctIdRaw,
        "Last Business Name": toText(row["Last Business Name"]),
        "All Account Numbers": toText(row["All Account Numbers"]),
        "Pipedrive ID": toText(row["Pipedrive ID"]),
        "Last Lab Name": toText(row["Last Lab Name"]),
        "Last State": toText(row["Last State"]),
        "Data Refresh Date": toIsoDate(row["Data Refresh Date"]),
      });
      continue;
    }

    if (!ACCT_ID_PATTERN.test(acctId)) {
      if (ignoreEmptySummaryRows && isClearSummaryArtifactRow(row)) {
        skippedSummaryRows += 1;
        continue;
      }
      invalidAcctIdRows.push({
        "Acct ID": acctIdRaw,
        "Last Business Name": toText(row["Last Business Name"]),
        "All Account Numbers": toText(row["All Account Numbers"]),
        "Pipedrive ID": toText(row["Pipedrive ID"]),
        "Last Lab Name": toText(row["Last Lab Name"]),
        "Last State": toText(row["Last State"]),
        "Data Refresh Date": toIsoDate(row["Data Refresh Date"]),
        "Looks Like Real Account Data": looksLikeRealAccountRow(row) ? "yes" : "no",
      });
      continue;
    }

    cleanedRows.push(row);
    acctIdCounts.set(acctId, (acctIdCounts.get(acctId) ?? 0) + 1);
    const refreshDate = toIsoDate(row["Data Refresh Date"]);
    if (refreshDate) refreshDates.add(refreshDate);
  }

  if (missingAcctIdRows.length > 0) {
    writeCsvReport(
      "missing-acct-id.csv",
      ["Acct ID", "Last Business Name", "All Account Numbers", "Pipedrive ID", "Last Lab Name", "Last State", "Data Refresh Date"],
      missingAcctIdRows
    );
    throw new Error(`Validation failed: ${missingAcctIdRows.length} rows are missing Acct ID.`);
  }

  if (invalidAcctIdRows.length > 0) {
    writeCsvReport(
      "invalid-acct-id.csv",
      ["Acct ID", "Last Business Name", "All Account Numbers", "Pipedrive ID", "Last Lab Name", "Last State", "Data Refresh Date", "Looks Like Real Account Data"],
      invalidAcctIdRows
    );
    throw new Error(`Validation failed: ${invalidAcctIdRows.length} rows have invalid Acct ID format.`);
  }

  const duplicates = [...acctIdCounts.entries()].filter(([, count]) => count > 1);
  if (duplicates.length > 0 && !allowDuplicateAcctId) {
    throw new Error(
      `Validation failed: duplicate Acct ID values found (${duplicates
        .slice(0, 12)
        .map(([acctId, count]) => `${acctId}x${count}`)
        .join(", ")}). Use --allow-duplicate-acct-id to permit merge behavior.`
    );
  }

  return {
    rowCount: rows.length,
    effectiveRowCount: cleanedRows.length,
    duplicateAcctIds: duplicates.length,
    refreshDates: [...refreshDates].sort(),
    skippedSummaryRows,
    cleanedRows,
  };
}

function normalizeEmail(value) {
  return toText(value).toLowerCase();
}

function splitEmails(value) {
  return normalizeEmail(value)
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry));
}

function mergeDuplicateRows(rows) {
  const grouped = new Map();
  for (const row of rows) {
    const acctId = normalizeAcctId(row["Acct ID"]);
    grouped.set(acctId, [...(grouped.get(acctId) ?? []), row]);
  }

  return [...grouped.values()].map((groupRows) => {
    if (groupRows.length === 1) return groupRows[0];
    const latest = [...groupRows].sort((a, b) => toIsoDate(b["Data Refresh Date"]).localeCompare(toIsoDate(a["Data Refresh Date"])))[0];
    const merged = { ...latest };
    for (const column of CORE_ACCOUNT_METRIC_COLUMNS.concat([
      "PPM NL Jobs",
      "PM NL Jobs",
      "CM NL Jobs",
      "PPM SQL Jobs",
      "PM SQL Jobs",
      "CM SQL Jobs",
      "PPM VSP Jobs",
      "PM VSP Jobs",
      "CM VSP Jobs",
    ])) {
      merged[column] = groupRows.reduce((total, row) => total + toNumber(row[column]), 0);
    }
    merged["All Account Numbers"] = [...new Set(groupRows.map((row) => toText(row["All Account Numbers"])).filter(Boolean))].join(", ");
    return merged;
  });
}

function classifyAccount(row) {
  const cmJobs = toNumber(row["CM Jobs"]);
  const pmJobs = toNumber(row["PM Jobs"]);
  const ppmJobs = toNumber(row["PPM Jobs"]);
  const cmSales = toNumber(row["CM Sales"]);
  const pmSales = toNumber(row["PM Sales"]);
  const ppmSales = toNumber(row["PPM Sales"]);
  const cmNlJobs = toNumber(row["CM NL Jobs"]);
  const cmSqlJobs = toNumber(row["CM SQL Jobs"]);
  const cmVspJobs = toNumber(row["CM VSP Jobs"]);
  const vspShare = pct(cmVspJobs, cmJobs);
  const privatePayMix = Math.max(0, 1 - vspShare);

  const programUsage = {
    modern_package_usage: toText(row["Modern Pkg Usage"]),
    modern_frame_usage: toText(row["Modern Frm Usage"]),
    chemclip_usage: toText(row["ChemClip Usage"]),
    speccheck_usage: toText(row["SpecCheck Usage"]),
    tokai_usage: toText(row["Tokai Usage"]),
  };

  const qualityRates = {
    lab_redo_pct: {
      ppm: toNumber(row["PPM Lab Redo %"]),
      pm: toNumber(row["PM Lab Redo %"]),
      cm: toNumber(row["CM Lab Redo %"]),
    },
    office_redo_pct: {
      ppm: toNumber(row["PPM Office Redo %"]),
      pm: toNumber(row["PM Office Redo %"]),
      cm: toNumber(row["CM Office Redo %"]),
    },
    warranty_pct: {
      ppm: toNumber(row["PPM Warranty %"]),
      pm: toNumber(row["PM Warranty %"]),
      cm: toNumber(row["CM Warranty %"]),
    },
    non_adapt_pct: {
      ppm: toNumber(row["PPM Non-Adapt %"]),
      pm: toNumber(row["PM Non-Adapt %"]),
      cm: toNumber(row["CM Non-Adapt %"]),
    },
  };

  const programEnrollment = {
    arsql26: truthyUsage(row["Is Enrolled in ARSQL26"]),
    arpmp26: truthyUsage(row["Is Enrolled in ARPMP26"]),
    aruty26: truthyUsage(row["Is Enrolled in ARUTY26"]),
  };

  const metrics = {
    jobs_trend: trendDirection(cmJobs, pmJobs),
    sales_trend: trendDirection(cmSales, pmSales),
    jobs_growth_vs_last_month: growthRate(cmJobs, pmJobs),
    sales_growth_vs_last_month: growthRate(cmSales, pmSales),
    net_lens_share: pct(cmNlJobs, cmJobs),
    sql_share: pct(cmSqlJobs, cmJobs),
    vsp_share: vspShare,
    private_pay_mix: privatePayMix,
  };

  const insights = [];
  if (cmJobs < pmJobs) insights.push("Current-month jobs are down versus last month. Review volume recovery opportunities.");
  if (cmSales > pmSales) insights.push("Current-month sales are up versus last month. Momentum is improving.");
  if (metrics.vsp_share > 0.65) insights.push("VSP share is high this month. Evaluate private-pay growth opportunities.");
  if (metrics.net_lens_share < 0.25) insights.push("Net lens share is low this month. Net lens conversion opportunity identified.");
  if (!toText(programUsage.tokai_usage)) insights.push("Tokai usage is not recorded. Consider Tokai program activation.");
  if (!toText(programUsage.chemclip_usage)) insights.push("ChemClip usage is not recorded. Consider ChemClip usage outreach.");
  if (toText(row["Previous Month Tier Rank by Acct ID"])) {
    insights.push(`Previous month tier rank: ${toText(row["Previous Month Tier Rank by Acct ID"])}.`);
  }

  return {
    account_id: normalizeAcctId(row["Acct ID"]),
    pipedrive_id: toText(row["Pipedrive ID"]),
    business_name: toText(row["Last Business Name"]),
    all_account_numbers: toText(row["All Account Numbers"]),
    address: toText(row["Last Full Address"]),
    division: toText(row["Last Division"]),
    latest_ship_date: toIsoDate(row["Latest Date Shipped"]),
    primary_pal_brand_private_pay: toText(row["Primary PAL Brand (Private Pay)"]),
    primary_pal_brand_vsp: toText(row["Primary PAL Brand (VSP)"]),
    lab_name: toText(row["Last Lab Name"]),
    phone: toText(row["Last Phone Number"]),
    state: toText(row["Last State"]),
    used_price_lists: parseUsedPriceLists(row["Used Price Lists"]),
    data_refresh_date: toIsoDate(row["Data Refresh Date"]),
    tier_status: {
      previous_month_tier_rank_by_acct_id: toText(row["Previous Month Tier Rank by Acct ID"]) || "Unranked",
    },
    purchase_summary: {
      jobs: { ppm: ppmJobs, pm: pmJobs, cm: cmJobs },
      sales: { ppm: ppmSales, pm: pmSales, cm: cmSales },
    },
    product_mix: {
      net_lens_jobs: { ppm: toNumber(row["PPM NL Jobs"]), pm: toNumber(row["PM NL Jobs"]), cm: cmNlJobs },
      sql_jobs: { ppm: toNumber(row["PPM SQL Jobs"]), pm: toNumber(row["PM SQL Jobs"]), cm: cmSqlJobs },
    },
    vsp_private_pay_mix: {
      vsp_jobs: { ppm: toNumber(row["PPM VSP Jobs"]), pm: toNumber(row["PM VSP Jobs"]), cm: cmVspJobs },
      net_lens_share: metrics.net_lens_share,
      sql_share: metrics.sql_share,
      vsp_share: metrics.vsp_share,
      private_pay_mix: metrics.private_pay_mix,
      primary_pal_brand_private_pay: toText(row["Primary PAL Brand (Private Pay)"]),
      primary_pal_brand_vsp: toText(row["Primary PAL Brand (VSP)"]),
    },
    program_usage: {
      ...programUsage,
      flags: {
        modern_package: truthyUsage(programUsage.modern_package_usage),
        modern_frame: truthyUsage(programUsage.modern_frame_usage),
        chemclip: truthyUsage(programUsage.chemclip_usage),
        speccheck: truthyUsage(programUsage.speccheck_usage),
        tokai: truthyUsage(programUsage.tokai_usage),
      },
    },
    quality_metrics: qualityRates,
    program_enrollment: programEnrollment,
    customer_insights: {
      suggestions: insights,
      metrics,
    },
  };
}

function buildUserAccess(userRows, validAccountIds, allowInvalidUserAccountLinks) {
  if (!userRows.length) throw new Error("No user rows found in source export.");
  const headerSet = new Set(Object.keys(userRows[0]));
  const missingColumns = REQUIRED_USER_COLUMNS.filter((column) => !headerSet.has(column));
  if (missingColumns.length > 0) throw new Error(`Missing required user columns: ${missingColumns.join(", ")}`);

  const usersToAccountsMap = new Map();
  const accountToUsersMap = new Map();
  const invalidUserLinks = [];
  let skippedUserSummaryRows = 0;
  let userRowsWithAccount = 0;

  for (const row of userRows) {
    if (isUserSummaryArtifactRow(row)) {
      skippedUserSummaryRows += 1;
      continue;
    }

    const acctId = normalizeAcctId(row["Organization - Acct ID"]);
    const emails = [...new Set([
      ...splitEmails(row["Person - Email - Work"]),
      ...splitEmails(row["Person - Email - Home"]),
      ...splitEmails(row["Person - Email - Other"]),
    ])];
    if (!acctId || emails.length === 0) continue;
    userRowsWithAccount += 1;

    if (!validAccountIds.has(acctId)) {
      invalidUserLinks.push({
        "Organization - Acct ID": acctId,
        "Person - Name": toText(row["Person - Name"]),
        "Person - Organization": toText(row["Person - Organization"]),
        "Person - Email - Work": toText(row["Person - Email - Work"]),
        "Person - Email - Home": toText(row["Person - Email - Home"]),
        "Person - Email - Other": toText(row["Person - Email - Other"]),
      });
      continue;
    }

    const userMetadata = {
      name: toText(row["Person - Name"]),
      organization: toText(row["Person - Organization"]),
      marketing_status: toText(row["Person - Marketing status"]),
      role_type: toText(row["Person - Role Type"]),
      division: toText(row["Organization - Division"]),
      targeted_programs: toText(row["Organization - Targeted Programs"]),
      all_account_numbers: toText(row["Organization - All Account Numbers"]),
      organization_acct_id: acctId,
      organization_numeric_id: toText(row["Organization - Numeric ID"]),
    };

    for (const email of emails) {
      const current = usersToAccountsMap.get(email) ?? { email, account_ids: new Set(), user_profiles: [] };
      current.account_ids.add(acctId);
      current.user_profiles.push(userMetadata);
      usersToAccountsMap.set(email, current);

      const byAccount = accountToUsersMap.get(acctId) ?? [];
      byAccount.push({ email, ...userMetadata });
      accountToUsersMap.set(acctId, byAccount);
    }
  }

  if (invalidUserLinks.length > 0) {
    writeCsvReport(
      "users-with-invalid-acct-id-links.csv",
      [
        "Organization - Acct ID",
        "Person - Name",
        "Person - Organization",
        "Person - Email - Work",
        "Person - Email - Home",
        "Person - Email - Other",
      ],
      invalidUserLinks
    );
    if (!allowInvalidUserAccountLinks) {
      throw new Error(
        `Validation failed: ${invalidUserLinks.length} user rows reference non-existent Organization - Acct ID values.`
      );
    }
  }

  const usersToAccounts = [...usersToAccountsMap.values()]
    .map((entry) => ({
      email: entry.email,
      account_ids: [...entry.account_ids].sort(),
      user_profiles: entry.user_profiles,
    }))
    .sort((a, b) => a.email.localeCompare(b.email));

  return {
    usersToAccounts,
    accountToUsersMap,
    userRowsCount: userRows.length,
    userRowsWithAccount,
    invalidUserLinksCount: invalidUserLinks.length,
    uniqueUserEmails: usersToAccounts.length,
    skippedUserSummaryRows,
  };
}

function summarizeAuthorizedUsers(users = []) {
  const uniqueEmails = [...new Set(users.map((user) => user.email).filter(Boolean))].sort();
  const marketingStatusCounts = {};
  for (const user of users) {
    const key = toText(user.marketing_status) || "Unknown";
    marketingStatusCounts[key] = (marketingStatusCounts[key] ?? 0) + 1;
  }
  return {
    authorized_user_count: uniqueEmails.length,
    primary_emails: uniqueEmails.slice(0, 10),
    marketing_status_summary: marketingStatusCounts,
  };
}

function detailedAuthorizedUsers(users = []) {
  const byEmail = new Map();
  for (const user of users) {
    const email = toText(user.email).toLowerCase();
    if (!email) continue;
    if (!byEmail.has(email)) {
      byEmail.set(email, {
        name: toText(user.name),
        email,
        role_type: toText(user.role_type),
        marketing_status: toText(user.marketing_status),
        organization: toText(user.organization),
      });
    }
  }
  return [...byEmail.values()].sort((a, b) => a.email.localeCompare(b.email));
}

function writeJson(filePath, data) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function resolveInputPath(explicitPath, candidates, label) {
  if (explicitPath) return path.isAbsolute(explicitPath) ? explicitPath : path.join(root, explicitPath);
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) throw new Error(`No default ${label} input found. Checked: ${candidates.map((c) => path.relative(root, c)).join(", ")}`);
  return found;
}

function copyDir(source, destination) {
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(path.dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true });
}

async function main() {
  const args = parseArgs();
  const accountInputPath = resolveInputPath(args.accountInput, defaultAccountInputCandidates, "account");
  const userInputPath = resolveInputPath(args.userInput, defaultUserInputCandidates, "user");
  const accountRows = await readRows(accountInputPath, args.accountSheet, ACCOUNT_HEADER_ALIASES);
  const userRows = await readRows(userInputPath, args.userSheet, USER_HEADER_ALIASES);

  const accountValidation = validateAccountRows(accountRows, args.allowDuplicateAcctId, args.ignoreEmptySummaryRows);
  const normalizedAccountRows = args.allowDuplicateAcctId
    ? mergeDuplicateRows(accountValidation.cleanedRows)
    : accountValidation.cleanedRows;

  const classifiedAccounts = normalizedAccountRows.map(classifyAccount);
  const accountIds = new Set(classifiedAccounts.map((account) => account.account_id));
  const userAccess = buildUserAccess(userRows, accountIds, args.allowInvalidUserAccountLinks);

  const releaseId = new Date().toISOString().replace(/[:.]/g, "-");
  const releaseDir = path.join(releasesDir, releaseId);
  mkdirSync(releaseDir, { recursive: true });

  const accountsIndex = [];
  const refreshDateCandidates = new Set();
  let accountsWithoutUsers = 0;

  for (const account of classifiedAccounts) {
    refreshDateCandidates.add(account.data_refresh_date);
    const usersForAccount = userAccess.accountToUsersMap.get(account.account_id) ?? [];
    if (usersForAccount.length === 0) accountsWithoutUsers += 1;

    const accountOutput = {
      ...account,
      authorized_users_summary: summarizeAuthorizedUsers(usersForAccount),
      authorized_users: detailedAuthorizedUsers(usersForAccount),
    };

    accountsIndex.push({
      account_id: account.account_id,
      business_name: account.business_name,
      account_name: account.business_name,
      pipedrive_id: account.pipedrive_id,
      all_account_numbers: account.all_account_numbers,
      last_lab_name: account.lab_name,
      lab: account.lab_name,
      state: account.state,
      division: account.division,
      latest_date_shipped: account.latest_ship_date,
      data_refresh_date: account.data_refresh_date,
      customer_type: account.division || "",
      sales_rep: "",
      cm_sales: Number(account.purchase_summary?.sales?.cm ?? 0),
      cm_jobs: Number(account.purchase_summary?.jobs?.cm ?? 0),
      cm_jpd: null,
      authorized_user_count: accountOutput.authorized_users_summary.authorized_user_count,
      price_lists: account.used_price_lists ?? [],
    });

    writeJson(path.join(releaseDir, "accounts", `${safeFileName(account.account_id)}.json`), accountOutput);
  }

  accountsIndex.sort((a, b) => a.account_id.localeCompare(b.account_id));
  const latestRefreshDate = [...refreshDateCandidates].filter(Boolean).sort().slice(-1)[0] ?? "";

  writeJson(path.join(releaseDir, "users_to_accounts.json"), userAccess.usersToAccounts);
  writeJson(path.join(releaseDir, "accounts_index.json"), accountsIndex);

  const manifest = {
    snapshot_id: releaseId,
    source_account_file: path.relative(root, accountInputPath),
    source_user_file: path.relative(root, userInputPath),
    generated_at: new Date().toISOString(),
    row_count_input_accounts: accountValidation.rowCount,
    row_count_effective_accounts: accountValidation.effectiveRowCount,
    row_count_output_accounts: accountsIndex.length,
    row_count_input_users: userAccess.userRowsCount,
    row_count_users_with_account_id: userAccess.userRowsWithAccount,
    unique_user_emails: userAccess.uniqueUserEmails,
    users_mapped_to_accounts: userAccess.usersToAccounts.length,
    accounts_without_users: accountsWithoutUsers,
    users_with_invalid_account_ids: userAccess.invalidUserLinksCount,
    data_refresh_date: latestRefreshDate,
    allow_duplicate_acct_id: args.allowDuplicateAcctId,
    ignore_empty_summary_rows: args.ignoreEmptySummaryRows,
    allow_invalid_user_account_links: args.allowInvalidUserAccountLinks,
    duplicate_acct_id_count: accountValidation.duplicateAcctIds,
    skipped_summary_rows: accountValidation.skippedSummaryRows,
    skipped_user_summary_rows: userAccess.skippedUserSummaryRows,
    refresh_dates_detected: accountValidation.refreshDates,
    required_account_columns: REQUIRED_ACCOUNT_COLUMNS,
    required_user_columns: REQUIRED_USER_COLUMNS,
    acct_id_pattern: ACCT_ID_PATTERN.source,
  };
  writeJson(path.join(releaseDir, "latest_snapshot_manifest.json"), manifest);

  mkdirSync(outputBaseDir, { recursive: true });
  copyDir(releaseDir, tempCurrentDir);
  rmSync(previousCurrentDir, { recursive: true, force: true });
  if (existsSync(currentDir)) renameSync(currentDir, previousCurrentDir);
  renameSync(tempCurrentDir, currentDir);

  console.log(`[portal-dashboard-v1] source accounts: ${path.relative(root, accountInputPath)}`);
  console.log(`[portal-dashboard-v1] source users: ${path.relative(root, userInputPath)}`);
  console.log(`[portal-dashboard-v1] input account rows: ${accountValidation.rowCount}`);
  console.log(`[portal-dashboard-v1] skipped artifact rows: ${accountValidation.skippedSummaryRows}`);
  console.log(`[portal-dashboard-v1] valid account count: ${accountsIndex.length}`);
  console.log(`[portal-dashboard-v1] user rows: ${userAccess.userRowsCount}`);
  console.log(`[portal-dashboard-v1] unique user emails: ${userAccess.uniqueUserEmails}`);
  console.log(`[portal-dashboard-v1] users mapped to accounts: ${userAccess.usersToAccounts.length}`);
  console.log(`[portal-dashboard-v1] accounts without users: ${accountsWithoutUsers}`);
  console.log(`[portal-dashboard-v1] users with invalid account IDs: ${userAccess.invalidUserLinksCount}`);
  console.log(`[portal-dashboard-v1] skipped user summary rows: ${userAccess.skippedUserSummaryRows}`);
  console.log(`[portal-dashboard-v1] snapshot refresh date: ${latestRefreshDate || "unknown"}`);
  console.log(`[portal-dashboard-v1] current output: ${path.relative(root, currentDir)}`);
}

main().catch((error) => {
  console.error("[portal-dashboard-v1] failed:", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
