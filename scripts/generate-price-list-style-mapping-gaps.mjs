import { existsSync } from "node:fs";
import { createReadStream } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import readline from "node:readline";
import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";

const root = process.cwd();
const generatedDir = path.join(root, "private-source", "pricing", "generated");
const registryPath = path.join(generatedDir, "price-list-registry.json");
const lookupWorkbookPath = path.join(
  root,
  "private-source",
  "portal",
  "lookup_docs",
  "Lookup.xlsx"
);
const reportOutputPath = path.join(generatedDir, "price-list-style-mapping-gaps.json");
const runtimeOutputPath = path.join(
  root,
  "lib",
  "portal",
  "generated",
  "priceListStyleMappingGaps.json"
);

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  textNodeName: "_text",
});

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeKey(value) {
  return String(value ?? "")
    .toUpperCase()
    .replace(/[™®]/g, "")
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function columnLetters(cellRef) {
  return String(cellRef ?? "").replace(/\d+/g, "");
}

function excelCellValue(cell, sharedStrings) {
  if (!cell) return "";
  if (cell.t === "s") return String(sharedStrings[Number(cell.v)] ?? "").trim();
  if (cell.t === "inlineStr") return String(cell.is?.t?._text ?? cell.is?.t ?? "").trim();
  return String(cell.v ?? "").trim();
}

function extractJsonStringValues(arrayBody) {
  const values = [];
  const pattern = /"((?:[^"\\]|\\.)*)"/g;
  let match;
  while ((match = pattern.exec(arrayBody))) {
    values.push(JSON.parse(`"${match[1]}"`));
  }
  return values;
}

function collectRawProductNames(serializedPricingFile) {
  const names = [];
  const pattern = /"rawProductNames"\s*:\s*\[([\s\S]*?)\]/g;
  let match;
  while ((match = pattern.exec(serializedPricingFile))) {
    names.push(...extractJsonStringValues(match[1]));
  }
  return names;
}

async function collectRawProductNamesFromFile(filePath) {
  const names = [];
  const stream = createReadStream(filePath, { encoding: "utf8" });
  const lines = readline.createInterface({
    input: stream,
    crlfDelay: Number.POSITIVE_INFINITY,
  });
  let collecting = false;
  let buffer = "";

  for await (const line of lines) {
    if (!collecting && line.includes('"rawProductNames"')) {
      collecting = true;
      buffer = `${line}\n`;
      if (line.includes("]")) {
        names.push(...collectRawProductNames(buffer));
        collecting = false;
        buffer = "";
      }
      continue;
    }

    if (collecting) {
      buffer += `${line}\n`;
      if (line.includes("]")) {
        names.push(...collectRawProductNames(buffer));
        collecting = false;
        buffer = "";
      }
    }
  }

  return names;
}

async function readLookupKeys() {
  if (!existsSync(lookupWorkbookPath)) return new Set();

  const zip = await JSZip.loadAsync(await readFile(lookupWorkbookPath));
  const sharedStringsXml = await zip.file("xl/sharedStrings.xml")?.async("string");
  const sheetXml = await zip.file("xl/worksheets/sheet1.xml")?.async("string");
  if (!sheetXml) return new Set();

  const sharedStrings = sharedStringsXml
    ? asArray(xmlParser.parse(sharedStringsXml).sst?.si).map((entry) =>
        asArray(entry?.t)
          .map((part) =>
            typeof part === "object" ? String(part._text ?? "") : String(part ?? "")
          )
          .join("")
      )
    : [];
  const sheet = xmlParser.parse(sheetXml);
  const keys = new Set();

  for (const row of asArray(sheet.worksheet?.sheetData?.row)) {
    for (const cell of asArray(row.c)) {
      if (columnLetters(cell.r) !== "A") continue;
      const key = normalizeKey(excelCellValue(cell, sharedStrings));
      if (key) keys.add(key);
    }
  }

  return keys;
}

async function readRegistry() {
  return JSON.parse(await readFile(registryPath, "utf8"));
}

async function main() {
  const [lookupKeys, registry] = await Promise.all([readLookupKeys(), readRegistry()]);
  const byStyle = new Map();
  const entries = (registry.visibleEntries ?? registry.entries ?? []).filter(
    (entry) => entry.generated
  );

  for (const entry of entries) {
    const code = String(entry.code ?? "").trim().toUpperCase();
    if (!code) continue;

    const sourcePath = path.join(generatedDir, `${code.toLowerCase()}-pricing.json`);
    if (!existsSync(sourcePath)) continue;

    const rawNames = await collectRawProductNamesFromFile(sourcePath);
    for (const rawName of rawNames) {
      const rawStyleName = String(rawName ?? "").trim();
      const normalizedStyleKey = normalizeKey(rawStyleName);
      if (!rawStyleName || !normalizedStyleKey || lookupKeys.has(normalizedStyleKey)) {
        continue;
      }

      const current =
        byStyle.get(normalizedStyleKey) ?? {
          rawStyleName,
          normalizedStyleKey,
          priceListCodes: new Set(),
          rowCount: 0,
        };
      current.priceListCodes.add(code);
      current.rowCount += 1;
      byStyle.set(normalizedStyleKey, current);
    }
  }

  const unmappedProducts = [...byStyle.values()]
    .map((entry) => ({
      rawStyleName: entry.rawStyleName,
      normalizedStyleKey: entry.normalizedStyleKey,
      priceListCodes: [...entry.priceListCodes].sort(),
      rowCount: entry.rowCount,
    }))
    .sort(
      (a, b) =>
        b.priceListCodes.length - a.priceListCodes.length ||
        b.rowCount - a.rowCount ||
        a.normalizedStyleKey.localeCompare(b.normalizedStyleKey)
    );

  const report = {
    generatedAt: new Date().toISOString(),
    sourceFiles: {
      styleRows: "private-source/pricing/generated/*-pricing.json",
      lookupWorkbook: "private-source/portal/lookup_docs/Lookup.xlsx",
    },
    lookupKeyCount: lookupKeys.size,
    priceListCountScanned: entries.length,
    unmappedProductCount: unmappedProducts.length,
    unmappedProducts,
  };

  const serialized = `${JSON.stringify(report, null, 2)}\n`;
  await mkdir(generatedDir, { recursive: true });
  await mkdir(path.dirname(runtimeOutputPath), { recursive: true });
  await writeFile(reportOutputPath, serialized, "utf8");
  await writeFile(runtimeOutputPath, serialized, "utf8");

  console.log(`[pricing:style-mapping] unmapped products: ${report.unmappedProductCount}`);
  console.log(`[pricing:style-mapping] report: ${reportOutputPath}`);
  console.log(`[pricing:style-mapping] runtime report: ${runtimeOutputPath}`);
}

main().catch((error) => {
  console.error(
    `[pricing:style-mapping] failed: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exit(1);
});
