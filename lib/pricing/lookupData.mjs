import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import XLSX from "xlsx";

const PRODUCT_LOOKUP_CANDIDATES = [
  path.join("private-source", "price-lists", "Lookup.xlsx"),
];

const MATERIAL_LOOKUP_CANDIDATES = [
  path.join("private-source", "portal", "lookup_docs", "Lookup_Mat.xlsx"),
  path.join("private-source", "price-lists", "Lookup_Mat.xlsx"),
];

const AR_LOOKUP_CANDIDATES = [
  path.join("private-source", "portal", "lookup_docs", "Lookup_AR.xlsx"),
  path.join("private-source", "price-lists", "Lookup_AR.xlsx"),
];

const AUTHORITATIVE_AR_OVERRIDES = [
  { dvi: "MMI", name: "Mirror Matched", brand: "Mirror Treatments" },
  { dvi: "GMR", name: "Gradient Mirror", brand: "Mirror Treatments" },
  { dvi: "DDE", name: "Diamond Defence", brand: "Protection Options" },
];

export const LOOKUP_SNAPSHOT_PATH = path.join(
  "lib",
  "pricing",
  "generated",
  "lookupData.json"
);

function normalizeText(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object" && "text" in value) {
    return String(value.text ?? "").trim();
  }
  return String(value).trim();
}

export function normalizeLookupKey(value) {
  return normalizeText(value)
    .toUpperCase()
    .replace(/\*/g, "")
    .replace(/[™®]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function stripSdPrefix(value) {
  return normalizeText(value).replace(/^SD\s+/i, "").trim();
}

function normalizeHeader(value) {
  return normalizeLookupKey(value).replace(/[^A-Z0-9]+/g, "");
}

function resolveExistingFile(rootDir, candidates) {
  for (const candidate of candidates) {
    const fullPath = path.join(rootDir, candidate);
    if (existsSync(fullPath)) return fullPath;
  }
  return null;
}

function requireFile(rootDir, candidates, label) {
  const filePath = resolveExistingFile(rootDir, candidates);
  if (!filePath) {
    throw new Error(
      `${label} does not exist. Tried: ${candidates.join(", ")}`
    );
  }
  return filePath;
}

async function readWorkbook(filePath, label) {
  try {
    const workbook = XLSX.readFile(filePath, {
      cellDates: false,
      cellFormula: false,
      cellHTML: false,
      dense: false,
    });

    return workbook.SheetNames.map((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils
        .sheet_to_json(worksheet, {
          header: 1,
          raw: false,
          defval: "",
          blankrows: false,
        })
        .map((row) => row.map((value) => normalizeText(value)));

      const headers = rows[0] ?? [];
      const headerMap = new Map(
        headers.map((header, index) => [normalizeHeader(header), index])
      );
      return {
        name: sheetName,
        headers,
        headerMap,
        rows,
        dataRows: rows
          .slice(1)
          .filter((row) => row.some((cell) => normalizeText(cell))),
      };
    });
  } catch (error) {
    throw new Error(
      `Unable to open ${label} at ${filePath}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

function findColumnIndex(sheet, aliases) {
  for (const alias of aliases) {
    const header = normalizeHeader(alias);
    const index = sheet.headerMap.get(header);
    if (index !== undefined) return index;
  }
  return -1;
}

function requireColumnIndex(sheet, aliases, label, workbookLabel) {
  const index = findColumnIndex(sheet, aliases);
  if (index < 0) {
    throw new Error(
      `${workbookLabel} sheet "${sheet.name}" is missing required column "${label}".`
    );
  }
  return index;
}

function productSheetsFromWorkbook(sheets, workbookLabel) {
  const candidates = sheets
    .map((sheet) => {
      const lenstyleIndex = findColumnIndex(sheet, ["lenstyle"]);
      const styleIndex = findColumnIndex(sheet, ["styleconsollidated"]);
      const typeIndex = findColumnIndex(sheet, ["Type Revised"]);
      const brandIndex = findColumnIndex(sheet, ["lensbrand"]);
      if ([lenstyleIndex, styleIndex, typeIndex, brandIndex].some((index) => index < 0)) {
        return null;
      }
      return { sheet, lenstyleIndex, styleIndex, typeIndex, brandIndex };
    })
    .filter(Boolean);

  if (candidates.length === 0) {
    throw new Error(
      `${workbookLabel} is missing a worksheet with required columns: lenstyle, styleconsollidated, Type Revised, lensbrand.`
    );
  }

  const rows = [];
  const entriesByKey = new Map();
  const conflictingDuplicates = [];
  for (const candidate of candidates) {
    for (const row of candidate.sheet.dataRows) {
      const lenstyle = normalizeText(row[candidate.lenstyleIndex]);
      if (!lenstyle) continue;
      const key = normalizeLookupKey(lenstyle);
      const entry = {
        lenstyle,
        styleconsollidated: stripSdPrefix(row[candidate.styleIndex]),
        "Type Revised": normalizeText(row[candidate.typeIndex]),
        lensbrand: normalizeText(row[candidate.brandIndex]),
        sourceSheet: candidate.sheet.name,
      };
      if (!entry.styleconsollidated) {
        throw new Error(
          `${workbookLabel} sheet "${candidate.sheet.name}" has a blank styleconsollidated value for lenstyle "${lenstyle}".`
        );
      }
      const existing = entriesByKey.get(key);
      if (!existing) {
        entriesByKey.set(key, entry);
        rows.push(entry);
        continue;
      }

      const signature = JSON.stringify({
        styleconsollidated: entry.styleconsollidated,
        typeRevised: entry["Type Revised"],
        lensbrand: entry.lensbrand,
      });
      const existingSignature = JSON.stringify({
        styleconsollidated: existing.styleconsollidated,
        typeRevised: existing["Type Revised"],
        lensbrand: existing.lensbrand,
      });

      if (signature !== existingSignature) {
        conflictingDuplicates.push({
          key,
          kept: existing,
          ignored: entry,
        });
      }
    }
  }

  if (conflictingDuplicates.length > 0) {
    console.warn(
      `[lookup] ${workbookLabel} contains conflicting duplicate lenstyle keys. Keeping the first occurrence for: ${conflictingDuplicates
        .map((duplicate) => duplicate.key)
        .sort()
        .join(", ")}`
    );
  }

  return rows;
}

function materialRowsFromWorkbook(sheets, workbookLabel) {
  const parsedRows = [];
  let matchedSheetCount = 0;
  for (const sheet of sheets) {
    const lensMatIndex = findColumnIndex(sheet, ["lensmat"]);
    const materialNameIndex = findColumnIndex(sheet, ["Material Name"]);
    if (lensMatIndex < 0 || materialNameIndex < 0) continue;
    matchedSheetCount += 1;
    const materialColorIndex = findColumnIndex(sheet, ["Material Color"]);
    const materialColorBrandIndex = findColumnIndex(sheet, ["Material Color Brand"]);
    const photochromicIndex = findColumnIndex(sheet, ["Photochromic"]);
    const polarizedIndex = findColumnIndex(sheet, ["Polarized"]);
    for (const row of sheet.dataRows) {
      const lensmat = normalizeText(row[lensMatIndex]);
      if (!lensmat) continue;
      parsedRows.push({
        lensmat,
        "Material Name": normalizeText(row[materialNameIndex]),
        "Material Color": normalizeText(row[materialColorIndex]),
        "Material Color Brand": normalizeText(row[materialColorBrandIndex]),
        Photochromic: normalizeText(row[photochromicIndex]),
        Polarized: normalizeText(row[polarizedIndex]),
        sourceSheet: sheet.name,
      });
    }
  }

  if (matchedSheetCount === 0) {
    throw new Error(
      `${workbookLabel} is missing a worksheet with required columns: lensmat, Material Name.`
    );
  }

  const duplicates = new Set();
  const keys = new Set();
  for (const row of parsedRows) {
    const key = normalizeLookupKey(row.lensmat);
    if (keys.has(key)) duplicates.add(row.lensmat);
    keys.add(key);
  }
  if (duplicates.size > 0) {
    throw new Error(
      `${workbookLabel} contains duplicate lensmat keys: ${[...duplicates]
        .sort()
        .join(", ")}`
    );
  }

  return parsedRows;
}

function arRowsFromWorkbook(sheets, workbookLabel) {
  const parsedRows = [];
  let matchedSheetCount = 0;
  for (const sheet of sheets) {
    const dviIndex = findColumnIndex(sheet, ["dvi", "arcoat", "column a"]);
    const nameIndex = findColumnIndex(sheet, ["name", "ar name", "column b"]);
    const brandIndex = findColumnIndex(sheet, ["brand", "ar brand", "column c"]);
    if ([dviIndex, nameIndex, brandIndex].some((index) => index < 0)) continue;
    matchedSheetCount += 1;
    for (const row of sheet.dataRows) {
      const dvi = normalizeText(row[dviIndex]);
      if (!dvi) continue;
      parsedRows.push({
        dvi,
        name: normalizeText(row[nameIndex]) || dvi,
        brand: normalizeText(row[brandIndex]),
        sourceSheet: sheet.name,
      });
    }
  }

  if (matchedSheetCount === 0) {
    throw new Error(
      `${workbookLabel} is missing a worksheet with required columns: dvi/name/brand.`
    );
  }

  const duplicates = new Set();
  const keys = new Set();
  for (const row of parsedRows) {
    const key = normalizeLookupKey(row.dvi);
    if (keys.has(key)) duplicates.add(row.dvi);
    keys.add(key);
  }
  if (duplicates.size > 0) {
    throw new Error(
      `${workbookLabel} contains duplicate DVI keys: ${[...duplicates]
        .sort()
        .join(", ")}`
    );
  }

  for (const override of AUTHORITATIVE_AR_OVERRIDES) {
    if (!keys.has(normalizeLookupKey(override.dvi))) parsedRows.push(override);
  }

  return parsedRows;
}

function workbookLogLabel(filePath) {
  return path.relative(process.cwd(), filePath);
}

export async function loadPricingLookupData({
  rootDir = process.cwd(),
  log = false,
} = {}) {
  const productPath = requireFile(rootDir, PRODUCT_LOOKUP_CANDIDATES, "Lookup.xlsx");
  const materialPath = requireFile(rootDir, MATERIAL_LOOKUP_CANDIDATES, "Lookup_Mat.xlsx");
  const arPath = requireFile(rootDir, AR_LOOKUP_CANDIDATES, "Lookup_AR.xlsx");

  if (log) console.log("Loading Lookup.xlsx...");
  const productSheets = await readWorkbook(productPath, "Lookup.xlsx");
  if (log) {
    console.log("Workbook loaded.");
    console.log("Sheets:");
    for (const sheet of productSheets) console.log(sheet.name);
  }
  const productRows = productSheetsFromWorkbook(productSheets, "Lookup.xlsx");
  const materialSheets = await readWorkbook(materialPath, "Lookup_Mat.xlsx");
  const materialRows = materialRowsFromWorkbook(materialSheets, "Lookup_Mat.xlsx");
  const arSheets = await readWorkbook(arPath, "Lookup_AR.xlsx");
  const arRows = arRowsFromWorkbook(arSheets, "Lookup_AR.xlsx");

  if (log) {
    console.log("Rows loaded:");
    console.log(`Products: ${productRows.length}`);
    console.log(`Materials: ${materialRows.length}`);
    console.log(`Coatings: ${arRows.length}`);
  }

  return {
    generatedAt: new Date().toISOString(),
    sourceFiles: {
      products: productPath,
      materials: materialPath,
      ar: arPath,
    },
    workbooks: {
      products: {
        filePath: productPath,
        workbookLabel: workbookLogLabel(productPath),
        sheets: productSheets.map((sheet) => ({
          name: sheet.name,
          rowCount: sheet.dataRows.length,
          headers: sheet.headers,
        })),
        rows: productRows,
      },
      materials: {
        filePath: materialPath,
        workbookLabel: workbookLogLabel(materialPath),
        sheets: materialSheets.map((sheet) => ({
          name: sheet.name,
          rowCount: sheet.dataRows.length,
          headers: sheet.headers,
        })),
        rows: materialRows,
      },
      ar: {
        filePath: arPath,
        workbookLabel: workbookLogLabel(arPath),
        sheets: arSheets.map((sheet) => ({
          name: sheet.name,
          rowCount: sheet.dataRows.length,
          headers: sheet.headers,
        })),
        rows: arRows,
      },
    },
  };
}

export async function writePricingLookupSnapshot(snapshot, {
  rootDir = process.cwd(),
} = {}) {
  const filePath = path.join(rootDir, LOOKUP_SNAPSHOT_PATH);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  return filePath;
}

export async function readPricingLookupSnapshot({
  rootDir = process.cwd(),
} = {}) {
  const filePath = path.join(rootDir, LOOKUP_SNAPSHOT_PATH);
  if (!existsSync(filePath)) return null;
  return JSON.parse(await readFile(filePath, "utf8"));
}

export async function getPricingLookupData({
  rootDir = process.cwd(),
  preferSnapshot = true,
  log = false,
} = {}) {
  if (preferSnapshot) {
    const snapshot = await readPricingLookupSnapshot({ rootDir });
    if (snapshot) return snapshot;
  }
  return loadPricingLookupData({ rootDir, log });
}
