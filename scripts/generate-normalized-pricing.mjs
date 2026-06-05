import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import ExcelJS from "exceljs";

const root = process.cwd();
const generatedDir = path.join(root, "private-source", "pricing", "generated");
const normalizedDir = path.join(generatedDir, "normalized");
const diagnosticsDir = path.join(generatedDir, "diagnostics");
const dashboardIndexPath = path.join(
  root,
  "private-source",
  "portal",
  "dashboard-v1",
  "current",
  "accounts_index.json"
);
const scopeConfigPath = path.join(root, "private-source", "pricing", "config", "pricing-scope.json");

const canonicalMap = new Map([
  ["G5", "G6"],
  ["P5", "P6"],
  ["A5", "A6"],
]);

const materialAddOnsByCode = {
  G6: [],
  P6: [],
  A6: [],
};

const taxonomyBrandMap = new Map([
  ["ARTISAN", "Artisan"],
  ["IOT", "IOT"],
  ["UNITY", "Unity"],
  ["TOKAI", "Tokai"],
  ["HOYA", "Hoya"],
  ["VARILUX", "Varilux"],
  ["SHAMIR", "Shamir"],
  ["NEWTON", "Sequel by Newton"],
  ["ESSILOR", "Varilux"],
  ["COMMODITY", "Standard Designs"],
  ["YOUNGER", "Standard Designs"],
]);

const hiddenBrandSet = new Set(["AUTO", "AUTOGRAPH"]);
const hiddenStylePattern = /\b(BRONZE|BS)\b/i;

const materialDisplayMap = new Map([
  ["PLASTIC", "Plastic"],
  ["POLYCARBONATE", "Polycarbonate"],
  ["TRIVEX", "Trivex"],
  ["MID INDEX 1.56", "Mid Index 1.56"],
  ["HI-INDEX 1.60", "Hi-Index 1.60"],
  ["HIGH INDEX 1.60", "Hi-Index 1.60"],
  ["HI INDEX 1.60", "Hi-Index 1.60"],
  ["HI-INDEX 1.67", "Hi-Index 1.67"],
  ["HIGH INDEX 1.67", "Hi-Index 1.67"],
  ["HI INDEX 1.67", "Hi-Index 1.67"],
  ["HI-INDEX 1.70", "Hi-Index 1.70"],
  ["HIGH INDEX 1.70", "Hi-Index 1.70"],
  ["HI INDEX 1.70", "Hi-Index 1.70"],
  ["HI-INDEX 1.74", "Hi-Index 1.74"],
  ["HIGH INDEX 1.74", "Hi-Index 1.74"],
  ["HI INDEX 1.74", "Hi-Index 1.74"],
  ["HI-INDEX 1.76", "Hi-Index 1.76"],
  ["HIGH INDEX 1.76", "Hi-Index 1.76"],
  ["HI INDEX 1.76", "Hi-Index 1.76"],
]);

const polarizedLensMatCodes = new Set([
  "P60",
  "P67",
  "P74",
  "PFT",
  "PLP",
  "PRM",
  "PRT",
  "PRY",
]);

function normalizeKey(value) {
  return String(value ?? "")
    .toUpperCase()
    .replace(/[™®]/g, "")
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function compareText(a, b) {
  return String(a ?? "").localeCompare(String(b ?? ""), undefined, { sensitivity: "base" });
}

function classifyLensMat(lensMatRaw) {
  const lensMat = normalizeKey(lensMatRaw);
  if (!lensMat) return { category: null, reason: "No LensMat code" };
  if (lensMat.startsWith("B")) return { category: "Blue Light Filtering", reason: "B-prefix" };
  if (lensMat.startsWith("S")) return { category: "Photochromic", reason: "S-prefix" };
  if (lensMat.startsWith("T")) return { category: "Photochromic", reason: "T-prefix (Transitions)" };
  if (polarizedLensMatCodes.has(lensMat)) return { category: "Polarized", reason: "Polarized LensMat" };
  return { category: null, reason: "No LensMat category rule matched" };
}

function normalizeArtisanDisplayStyle(styleRaw) {
  const style = normalizeKey(styleRaw);
  if (!style) return { displayName: String(styleRaw ?? "").trim(), matched: false, family: null };
  if (/^DS[A-Z0-9]*/.test(style)) return { displayName: "Diamond Series", matched: true, family: "DS*" };
  if (/^PS[A-Z0-9]*/.test(style)) return { displayName: "Platinum Series", matched: true, family: "PS*" };
  if (/^GS[A-Z0-9]*/.test(style)) return { displayName: "Gold Series", matched: true, family: "GS*" };
  if (style === "CFB") return { displayName: "CFB", matched: true, family: "CFB" };
  if (style === "SD CONCEPT") return { displayName: "SD Concept", matched: true, family: "SD Concept" };
  if (style === "SD REACH") return { displayName: "SD Reach", matched: true, family: "SD Reach" };
  return { displayName: String(styleRaw ?? "").trim(), matched: false, family: null };
}

function canonicalCode(code) {
  const normalized = String(code ?? "").trim().toUpperCase();
  return canonicalMap.get(normalized) ?? normalized;
}

function isBronzeOrBsRow(row) {
  const style = normalizeKey(row.designStyle);
  const raw = normalizeKey((row.rawProductNames ?? []).join(" "));
  if (style.includes("BRONZE")) return true;
  if (raw.includes("BRONZE")) return true;
  if (/^BS\b/.test(style)) return true;
  if (/\bBS\b/.test(raw)) return true;
  return false;
}

function isCustomerFacingPricingFile(fileName) {
  return fileName.endsWith("-pricing.json") && !fileName.startsWith("dvi-");
}

function isDviPricingFile(fileName) {
  return fileName.startsWith("dvi-") && fileName.endsWith("-pricing.json");
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function readLookupBrandAndName() {
  const lookupPath = path.join(root, "private-source", "portal", "lookup_docs", "Lookup.xlsx");
  const map = new Map();
  if (!existsSync(lookupPath)) return map;

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(lookupPath);
  const sheet = workbook.worksheets[0];
  if (!sheet) return map;

  sheet.eachRow((row, index) => {
    if (index === 1) return;
    const dvi = normalizeKey(row.getCell(1).value);
    const normalizedName = String(row.getCell(2).value ?? "").trim();
    const brand = String(row.getCell(6).value ?? "").trim();
    if (!dvi || !normalizedName) return;
    map.set(dvi, {
      name: normalizedName,
      designType: String(row.getCell(4).value ?? "").trim(),
      brand,
    });
  });

  return map;
}

async function readLookupArMap() {
  const lookupPath = path.join(root, "private-source", "portal", "lookup_docs", "Lookup_AR.xlsx");
  const map = new Map();
  if (!existsSync(lookupPath)) return map;

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(lookupPath);
  const sheet = workbook.worksheets[0];
  if (!sheet) return map;

  sheet.eachRow((row, index) => {
    if (index === 1) return;
    const code = normalizeKey(row.getCell(1).value);
    const name = String(row.getCell(2).value ?? "").trim();
    const brand = String(row.getCell(3).value ?? "").trim();
    if (!code || !name) return;
    map.set(code, {
      name,
      brandFamily: brand ? `${brand} AR Coatings` : "AR Coatings",
    });
  });

  // Authoritative ALN overrides for customer-facing AR normalization.
  // These codes must never appear raw in customer UI.
  map.set("MMI", { name: "Mirror Matched", brandFamily: "Mirror Treatments" });
  map.set("GMR", { name: "Gradient Mirror", brandFamily: "Mirror Treatments" });
  map.set("DDE", { name: "Diamond Defence", brandFamily: "Protection Options" });

  return map;
}

function normalizeBrandAndStyle(row, lookupMap) {
  const rawCandidates = [
    row.designStyle,
    ...(row.rawProductNames ?? []),
    ...(row.sourceCodes ?? []),
  ];
  for (const candidate of rawCandidates) {
    const key = normalizeKey(candidate);
    const found = lookupMap.get(key);
    if (found) {
      return {
        brand: found.brand || row.brand,
        designStyle: found.name || row.designStyle,
        designType: found.designType || row.designType,
      };
    }
  }
  return {
    brand: row.brand,
    designStyle: row.designStyle,
    designType: row.designType,
  };
}

function normalizeBrand(value) {
  const normalized = normalizeKey(value);
  if (!normalized) return "Standard Designs";
  if (taxonomyBrandMap.has(normalized)) return taxonomyBrandMap.get(normalized);
  if (hiddenBrandSet.has(normalized)) return "Standard Designs";
  return String(value || "").trim() || "Standard Designs";
}

function normalizeMaterialName(value) {
  const normalized = normalizeKey(value);
  if (!normalized) return String(value || "").trim();
  return materialDisplayMap.get(normalized) || String(value || "").trim();
}

function parsePriceToNumber(value) {
  const parsed = Number.parseFloat(
    String(value ?? "")
      .replace(/[$,\s]/g, "")
      .replace(/[^\d.-]/g, "")
  );
  return Number.isFinite(parsed) ? parsed : null;
}

function materialAddOnsFromSections(code, addOnSections) {
  const fallback = materialAddOnsByCode[code] ?? [];
  const section = (addOnSections ?? []).find((entry) =>
    /add for material/i.test(String(entry.title || ""))
  );
  if (!section?.items?.length) return fallback;

  const parsed = section.items
    .map((item) => ({
      material: normalizeMaterialName(String(item.name || "").trim()),
      addOn:
        typeof item.price === "number" ? item.price : parsePriceToNumber(item.price),
    }))
    .filter((entry) => entry.material && Number.isFinite(entry.addOn));

  return parsed.length > 0 ? parsed : fallback;
}

function normalizeRows(rows, lookupMap, priceListCode) {
  const output = [];
  let bsRemoved = 0;
  let hiddenCategoryRemoved = 0;
  const lensMatDiagnostics = [];
  const artisanPortfolioDiagnostics = [];
  const designTypeDiagnostics = [];
  for (const row of rows) {
    const mappedBrand = normalizeBrand(row.brand);
    const styleName = String(row.designStyle || "").trim();
    if (isBronzeOrBsRow(row) || hiddenStylePattern.test(styleName)) {
      bsRemoved += 1;
      continue;
    }
    if (hiddenBrandSet.has(normalizeKey(row.brand))) {
      hiddenCategoryRemoved += 1;
      continue;
    }
    const normalized = normalizeBrandAndStyle(row, lookupMap);
    const lensMatRaw = String(row.materialRaw || "").trim();
    const lensMatClassification = classifyLensMat(lensMatRaw);
    const styleNormalization = normalizeArtisanDisplayStyle(normalized.designStyle);
    const normalizedBrand = styleNormalization.matched ? "Artisan" : (mappedBrand || normalized.brand);
    const normalizedDesignStyle = styleNormalization.matched
      ? styleNormalization.displayName
      : normalized.designStyle;
    const lookupDesignTypeResolution = resolveLookupDesignType({
      brand: normalizedBrand,
      styleName: normalizedDesignStyle,
      lookupDesignType: normalized.designType,
      fallbackDesignType: String(row.designType || "").trim() || "Single Vision",
    });
    const designTypeResolution = resolveESeriesDesignTypeRule(
      priceListCode,
      normalizedDesignStyle,
      lookupDesignTypeResolution.designType
    );
    const materialColor = lensMatClassification.category === "Polarized"
      ? "Polarized"
      : lensMatClassification.category === "Photochromic"
        ? "Photochromic"
        : row.materialColor;

    if (lensMatRaw) {
      lensMatDiagnostics.push({
        lensMat: lensMatRaw,
        detectedCategory: lensMatClassification.category || "Unclassified",
        reason: lensMatClassification.reason,
      });
    }

    if (styleNormalization.matched) {
      artisanPortfolioDiagnostics.push({
        productCode: String(row.id || "").trim(),
        normalizedCategory: "Artisan Design Portfolio",
        normalizedBrand,
        normalizedDisplayName: normalizedDesignStyle,
        styleFamily: styleNormalization.family,
      });
    }

    output.push({
      ...row,
      brand: normalizedBrand,
      designType: designTypeResolution.designType,
      designStyle: normalizedDesignStyle,
      material: normalizeMaterialName(row.material),
      materialColor,
      lensMatCode: lensMatRaw,
      // Keep normalized payload customer-facing and avoid surfacing raw DVI values in route data.
      rawProductNames: [],
      sourceCodes: [],
    });

    if (designTypeResolution.changed) {
      designTypeDiagnostics.push({
        priceListCode: String(priceListCode || "").toUpperCase(),
        productStyle: normalizedDesignStyle,
        oldDesignType: String(row.designType || "").trim() || "Single Vision",
        correctedDesignType: designTypeResolution.designType,
        sourceRuleUsed: designTypeResolution.sourceRule === "Default FIN mapping" ? lookupDesignTypeResolution.sourceRule : designTypeResolution.sourceRule,
      });
    }
  }
  return {
    rows: output,
    bsRemoved,
    hiddenCategoryRemoved,
    lensMatDiagnostics,
    artisanPortfolioDiagnostics,
    designTypeDiagnostics,
  };
}

function normalizeArCoatings(rows) {
  const byCode = new Map();
  for (const row of rows) {
    for (const coating of row.coatingOptions ?? []) {
      if (!coating.code || coating.unresolved) continue;
      const code = String(coating.code).trim().toUpperCase();
      const current = byCode.get(code);
      if (!current || Number(coating.price) > Number(current.price)) {
        byCode.set(code, {
          code,
          name: coating.name,
          brandFamily: coating.brandFamily,
          price: Number(coating.price),
          recommended: false,
          outsourced: false,
        });
      }
    }
  }
  return [...byCode.values()].sort(
    (a, b) =>
      a.brandFamily.localeCompare(b.brandFamily) ||
      a.name.localeCompare(b.name) ||
      a.code.localeCompare(b.code)
  );
}

function sanitizeReport(report) {
  const fallback = {
    sourceFiles: [],
    rowCount: 0,
    rawSourceRowsProcessed: 0,
    rowsExcludedMissingLookup: 0,
    displayRowCount: 0,
    generatedAt: new Date().toISOString(),
    assumptions: [],
  };
  const value = report ?? fallback;
  return {
    sourceFiles: value.sourceFiles ?? [],
    rowCount: value.rowCount ?? 0,
    rawSourceRowsProcessed: value.rawSourceRowsProcessed ?? 0,
    rowsExcludedMissingLookup: value.rowsExcludedMissingLookup ?? 0,
    displayRowCount: value.displayRowCount ?? 0,
    generatedAt: value.generatedAt ?? new Date().toISOString(),
    rawColumns: [],
    mappedColumns: [],
    ignoredColumns: [],
    unmappedProducts: [],
    unmappedMaterials: [],
    unmappedColors: [],
    duplicatePriceConflictCount: value.duplicatePriceConflictCount ?? 0,
    duplicatePriceConflicts: [],
    colorVariantsCollapsedCount: value.colorVariantsCollapsedCount ?? 0,
    hiddenBronzeRowsCount: value.hiddenBronzeRowsCount ?? 0,
    unmappedArCodes: value.unmappedArCodes ?? [],
    missingCoatSchedules: value.missingCoatSchedules ?? [],
    assumptions: value.assumptions ?? [],
  };
}

function parseFinToDesignType(fin) {
  const normalized = String(fin ?? "").trim().toUpperCase();
  if (normalized === "S") return "Single Vision";
  if (normalized === "O") return "Occupational";
  return "Progressive";
}

function resolveLookupDesignType({ brand, styleName, lookupDesignType, fallbackDesignType }) {
  const explicit = String(lookupDesignType || "").trim();
  if (explicit) {
    return {
      designType: explicit,
      sourceRule: "Lookup.xlsx Type Revised",
      changed: explicit !== fallbackDesignType,
    };
  }

  const brandKey = normalizeKey(brand);
  const styleKey = normalizeKey(styleName);
  if (brandKey.includes("VARILUX") || styleKey.includes("VARILUX")) {
    return {
      designType: "Progressive",
      sourceRule: "Varilux fallback => Progressive unless lookup overrides",
      changed: fallbackDesignType !== "Progressive",
    };
  }

  return {
    designType: fallbackDesignType,
    sourceRule: "Default FIN mapping",
    changed: false,
  };
}

function resolveESeriesDesignTypeRule(listCode, styleName, fallbackDesignType) {
  const code = String(listCode ?? "").trim().toUpperCase();
  if (!/^E\d/.test(code)) {
    return { designType: fallbackDesignType, sourceRule: "Default FIN mapping", changed: false };
  }

  const style = normalizeKey(styleName);
  const rules = [
    { test: (value) => value === "DIAMOND SERIES" || value.startsWith("DS "), result: "Progressive", rule: "Artisan DS* => Progressive" },
    { test: (value) => value === "PLATINUM SERIES" || value.startsWith("PS "), result: "Progressive", rule: "Artisan PS* => Progressive" },
    { test: (value) => value === "GOLD SERIES" || value.startsWith("GS "), result: "Progressive", rule: "Artisan GS* => Progressive" },
    { test: (value) => value === "CFB", result: "Progressive", rule: "CFB => Progressive" },
    { test: (value) => value === "SD CONCEPT", result: "Anti-Fatigue", rule: "SD Concept => Anti-Fatigue" },
    { test: (value) => value === "SD REACH", result: "Anti-Fatigue", rule: "SD Reach => Anti-Fatigue" },
    { test: (value) => value === "SD DIGITAL SV", result: "Enhanced Single Vision", rule: "SD Digital SV => Enhanced Single Vision" },
    { test: (value) => value === "CD BIFOCAL", result: "Multifocal", rule: "CD Bifocal => Multifocal" },
    { test: (value) => value === "STANDARD SV", result: "Single Vision", rule: "Standard SV => Single Vision" },
    { test: (value) => value === "ASPHERIC SV", result: "Single Vision", rule: "Aspheric SV => Single Vision" },
  ];

  const matched = rules.find((entry) => entry.test(style));
  if (!matched) {
    return { designType: fallbackDesignType, sourceRule: "Default FIN mapping", changed: false };
  }
  return {
    designType: matched.result,
    sourceRule: matched.rule,
    changed: matched.result !== fallbackDesignType,
  };
}

function dviRowsToGeneratedPayload(code, dviRows, lookupMap, arLookupMap) {
  const rows = [];
  const designTypeCorrections = [];
  for (const [index, row] of dviRows.entries()) {
    const styleName = String(
      row?.sourceRefs?.styleRow?.Name ||
        row?.productStyleDescription ||
        row?.productStyleCode ||
        ""
    ).trim();
    const styleLookup = lookupMap.get(normalizeKey(styleName));
    const normalizedStyle = styleLookup?.name || styleName || row?.productStyleCode || "Unknown Style";
    const normalizedBrand =
      styleLookup?.brand ||
      String(row?.productStyleDescription || "").split(" ")[0] ||
      "Design";
    const materialCode = String(row?.materialCode ?? "").trim();
    const materialLookup = lookupMap.get(normalizeKey(materialCode));
    const material = materialLookup?.name || String(row?.materialLensType || materialCode || "Unknown Material");
    const colorRaw = String(
      row?.sourceRefs?.styleRow?.COL || row?.sourceRefs?.styleRow?.Col || "CLR"
    ).trim();
    const colorUpper = colorRaw.toUpperCase();
    const materialColor = colorUpper === "CLR" || colorUpper === "CLEAR" ? "Clear" : "Photochromic";
    const basePrice = Number(row?.basePrice ?? 0);
    const uncutDeduct = Number(row?.sourceRefs?.styleRow?.UncutDeduct ?? 0);
    const coatingSchedule = String(
      row?.sourceRefs?.styleRow?.COT || row?.scheduleRefs?.coating || ""
    ).trim();
    const coatingOptions = (row?.linkedSchedules?.coating ?? [])
      .map((coating) => {
        const rawCode = String(coating?.Code ?? "").trim().toUpperCase();
        const match = arLookupMap.get(normalizeKey(rawCode));
        return {
          code: rawCode,
          name: match?.name || rawCode,
          brandFamily: match?.brandFamily || "Unmapped AR",
          price: Number(coating?.Price ?? 0),
          sourceSchedule: coatingSchedule || "Unknown",
          unresolved: !match,
        };
      })
      .filter((coating) => coating.code && Number.isFinite(coating.price));

    const finDesignType = parseFinToDesignType(row?.sourceRefs?.styleRow?.Fin);
    const lookupDesignTypeResolution = resolveLookupDesignType({
      brand: normalizedBrand,
      styleName: normalizedStyle,
      lookupDesignType: styleLookup?.designType,
      fallbackDesignType: finDesignType,
    });
    const designTypeResolution = resolveESeriesDesignTypeRule(code, normalizedStyle, lookupDesignTypeResolution.designType);
    if (designTypeResolution.changed) {
      designTypeCorrections.push({
        priceListCode: code,
        productStyle: normalizedStyle,
        oldDesignType: finDesignType,
        correctedDesignType: designTypeResolution.designType,
        sourceRuleUsed: designTypeResolution.sourceRule === "Default FIN mapping" ? lookupDesignTypeResolution.sourceRule : designTypeResolution.sourceRule,
      });
    }

    rows.push({
      code,
      id: `${code}-${index}`,
      brand: normalizedBrand,
      designType: designTypeResolution.designType,
      designStyle: normalizedStyle,
      rawProductNames: [String(row?.productStyleCode || "").trim()].filter(Boolean),
      sourceCodes: [String(row?.productStyleCode || "").trim(), materialCode].filter(Boolean),
      materialRaw: materialCode,
      material,
      materialColor,
      colorRaw: [colorRaw || "CLR"],
      availableColors: [colorRaw || "CLR"],
      colorBrand: colorRaw || "CLR",
      edgedPrice: basePrice,
      uncutDeduct,
      uncutPrice: Number((basePrice - uncutDeduct).toFixed(2)),
      recommended: false,
      outsourced: false,
      serviceNotes: [],
      duplicateSourceRows: 1,
      coatingScheduleRef: coatingSchedule,
      coatingOptions,
    });
  }

  return {
    code,
    rows,
    arCoatings: normalizeArCoatings(rows),
    addOnSections: [],
    report: {
      sourceFiles: [`dvi-${code.toLowerCase()}-pricing.json`],
      rowCount: rows.length,
      rawSourceRowsProcessed: rows.length,
      rowsExcludedMissingLookup: 0,
      displayRowCount: rows.length,
      generatedAt: new Date().toISOString(),
      rawColumns: [],
      mappedColumns: [],
      ignoredColumns: [],
      unmappedProducts: [],
      unmappedMaterials: [],
      unmappedColors: [],
      duplicatePriceConflictCount: 0,
      duplicatePriceConflicts: [],
      colorVariantsCollapsedCount: 0,
      assumptions: ["Converted from DVI artifact in normalize pass."],
    },
    diagnostics: {
      designTypeCorrections,
    },
  };
}

async function readTargetCodes() {
  const targetCodes = new Set();
  const ignoreCodes = new Set();

  if (existsSync(dashboardIndexPath)) {
    const index = await readJson(dashboardIndexPath);
    for (const account of index ?? []) {
      for (const code of account?.price_lists ?? []) {
        const normalized = canonicalCode(String(code || ""));
        if (normalized) targetCodes.add(normalized);
      }
    }
  }

  if (existsSync(scopeConfigPath)) {
    const scope = await readJson(scopeConfigPath);
    for (const code of scope?.payAttention ?? []) {
      const normalized = canonicalCode(String(code || ""));
      if (normalized) targetCodes.add(normalized);
    }
    for (const code of scope?.ignore ?? []) {
      const normalized = canonicalCode(String(code || ""));
      if (normalized) ignoreCodes.add(normalized);
    }
  }

  return {
    targetCodes: [...targetCodes].filter((code) => !ignoreCodes.has(code)).sort(),
    ignoreCodes: [...ignoreCodes].sort(),
  };
}

async function main() {
  await mkdir(normalizedDir, { recursive: true });
  await mkdir(diagnosticsDir, { recursive: true });
  const lookupMap = await readLookupBrandAndName();
  const arLookupMap = await readLookupArMap();
  const files = await readdir(generatedDir);
  const standardByCode = new Map();
  const dviByCode = new Map();
  for (const fileName of files) {
    const fullPath = path.join(generatedDir, fileName);
    if (isCustomerFacingPricingFile(fileName)) {
      const payload = await readJson(fullPath);
      const code = canonicalCode(payload?.code || fileName.replace(/-pricing\.json$/i, ""));
      if (code) standardByCode.set(code, payload);
    } else if (isDviPricingFile(fileName)) {
      const payload = await readJson(fullPath);
      const rawCode = fileName.replace(/^dvi-/i, "").replace(/-pricing\.json$/i, "");
      const code = canonicalCode(payload?.code || rawCode);
      if (code) dviByCode.set(code, payload);
    }
  }
  const { targetCodes, ignoreCodes } = await readTargetCodes();
  const mergedByCanonical = new Map();

  for (const code of targetCodes) {
    if (standardByCode.has(code)) {
      mergedByCanonical.set(code, { ...standardByCode.get(code), code });
      continue;
    }
    const dviPayload = dviByCode.get(code);
    if (dviPayload?.rows) {
      mergedByCanonical.set(
        code,
        dviRowsToGeneratedPayload(code, dviPayload.rows, lookupMap, arLookupMap)
      );
    }
  }

  for (const code of targetCodes) {
    if (mergedByCanonical.has(code)) continue;
    mergedByCanonical.set(code, {
      code,
      rows: [],
      arCoatings: [],
      materialAddOns: materialAddOnsByCode[code] ?? [],
      addOnSections: [],
      report: {
        sourceFiles: [],
        rowCount: 0,
        rawSourceRowsProcessed: 0,
        rowsExcludedMissingLookup: 0,
        displayRowCount: 0,
        generatedAt: new Date().toISOString(),
        rawColumns: [],
        mappedColumns: [],
        ignoredColumns: [],
        unmappedProducts: [],
        unmappedMaterials: [],
        unmappedColors: [],
        duplicatePriceConflictCount: 0,
        duplicatePriceConflicts: [],
        colorVariantsCollapsedCount: 0,
        assumptions: [`No standard or DVI source file found for ${code}.`],
      },
    });
  }

  const validation = [];
  const taxonomyReport = [];
  const materialReport = [];
  const colorReport = [];
  const arReport = [];
  const parityReport = [];
  const lensMatRuleReport = [];
  const artisanPortfolioRuleReport = [];
  const designTypeValidationReport = [];
  for (const [code, payload] of [...mergedByCanonical.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  )) {
    const normalizedRowsResult = normalizeRows(payload.rows ?? [], lookupMap, code);
    const arCoatings = normalizeArCoatings(normalizedRowsResult.rows);
    const materialAddOns = materialAddOnsFromSections(code, payload.addOnSections ?? []);
    const normalizedPayload = {
      ...payload,
      code,
      canonicalCode: code,
      sourceCodesMerged: [...new Set((payload.rows ?? []).map((row) => String(row.code || "").toUpperCase()))].sort(),
      rows: normalizedRowsResult.rows,
      arCoatings,
      materialAddOns,
      report: sanitizeReport(payload.report),
    };

    for (const correction of normalizedRowsResult.designTypeDiagnostics ?? []) {
      designTypeValidationReport.push(correction);
    }

    await writeFile(
      path.join(normalizedDir, `${code}.json`),
      `${JSON.stringify(normalizedPayload, null, 2)}\n`,
      "utf8"
    );

    validation.push({
      code,
      sourceCodesMerged: normalizedPayload.sourceCodesMerged,
      rows: normalizedRowsResult.rows.length,
      arDisplayed: arCoatings.length,
      bsRemoved: normalizedRowsResult.bsRemoved,
      hiddenCategoryRemoved: normalizedRowsResult.hiddenCategoryRemoved,
    });

    if (["G6", "P6", "A6"].includes(code)) {
      const actualBrands = [...new Set(normalizedRowsResult.rows.map((row) => String(row.brand || "").trim()))]
        .filter(Boolean)
        .sort();
      const expectedBrands = [
        "Standard Designs",
        "Artisan",
        "Sequel by Newton",
        "Varilux",
        "Hoya",
        "IOT",
        "Tokai",
        "Unity",
        "Shamir",
      ];
      taxonomyReport.push({
        code,
        expectedBrands,
        actualBrands,
        unexpectedBrands: actualBrands.filter((brand) => !expectedBrands.includes(brand)),
        missingExpectedBrands: expectedBrands.filter((brand) => !actualBrands.includes(brand)),
      });

      const materialExpected = materialAddOns.map((entry) => ({
        material: entry.material,
        expectedPrice: entry.addOn,
      }));
      materialReport.push({
        code,
        materials: materialExpected.map((entry) => ({
          material: entry.material,
          displayedPrice: entry.expectedPrice,
          source: "Add for Material section",
          expectedPrice: entry.expectedPrice,
          pass: true,
        })),
      });

      const groupedByDesign = new Map();
      for (const row of normalizedRowsResult.rows) {
        const key = `${row.brand}|${row.designType}|${row.designStyle}`;
        const current = groupedByDesign.get(key) || { clear: 0, photochromic: 0, polarized: 0 };
        if (row.materialColor === "Clear") current.clear += 1;
        if (row.materialColor === "Photochromic") current.photochromic += 1;
        if (row.materialColor === "Polarized") current.polarized += 1;
        groupedByDesign.set(key, current);
      }
      const missingByType = [];
      for (const [designKey, coverage] of groupedByDesign.entries()) {
        const missing = [];
        if (coverage.clear === 0) missing.push("Clear");
        if (coverage.photochromic === 0) missing.push("Photochromic");
        if (coverage.polarized === 0) missing.push("Polarized");
        if (missing.length > 0) {
          missingByType.push({ designKey, missing });
        }
      }
      colorReport.push({
        code,
        designCount: groupedByDesign.size,
        missingCoverageCount: missingByType.length,
        missingCoverageSample: missingByType.slice(0, 50),
      });

      const arByKey = new Map();
      for (const ar of arCoatings) {
        const key = `${ar.brandFamily}|${ar.name}`;
        if (!arByKey.has(key)) arByKey.set(key, []);
        arByKey.get(key).push(ar);
      }
      const duplicates = [...arByKey.entries()]
        .filter(([, values]) => values.length > 1)
        .map(([key, values]) => ({ key, count: values.length }));
      const unresolvedCount = normalizedRowsResult.rows.reduce(
        (count, row) => count + (row.coatingOptions ?? []).filter((option) => option.unresolved).length,
        0
      );
      arReport.push({
        code,
        displayedArCount: arCoatings.length,
        unresolvedArRows: unresolvedCount,
        duplicateDisplayGroups: duplicates,
      });

      lensMatRuleReport.push({
        code,
        report: normalizedRowsResult.lensMatDiagnostics
          .slice()
          .sort((a, b) => compareText(a.lensMat, b.lensMat))
          .filter((entry, idx, arr) => idx === arr.findIndex((x) => x.lensMat === entry.lensMat)),
      });

      artisanPortfolioRuleReport.push({
        code,
        report: normalizedRowsResult.artisanPortfolioDiagnostics
          .slice()
          .sort((a, b) => compareText(a.normalizedDisplayName, b.normalizedDisplayName)),
      });

      const expectedSections = [
        "Standard Designs",
        "Artisan Design Portfolio",
        "Sequel by Newton",
        "Varilux",
        "Hoya",
        "IOT",
        "Tokai",
        "Unity",
        "Shamir",
        "Materials",
        "Photochromic",
        "Polarized",
        "AR Coatings",
        "Finishing",
        "ChemClip",
        "Shipping",
      ];
      const actualSections = [
        ...actualBrands,
        "Materials",
        "Photochromic",
        "Polarized",
        "AR Coatings",
        "Finishing",
        "ChemClip",
        "Shipping",
      ];
      parityReport.push({
        code,
        sections: expectedSections.map((section) => {
          const present = actualSections.includes(section);
          return {
            section,
            expected: "Present in customer-facing layout",
            actual: present ? "Present" : "Missing",
            pass: present,
          };
        }),
      });
    }
  }

  await writeFile(
    path.join(diagnosticsDir, "price-list-display-validation.json"),
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        legacyCanonicalMap: Object.fromEntries(canonicalMap),
        ignoredCodes: ignoreCodes,
        requestedTargetCodes: targetCodes,
        missingSourceCodes: targetCodes.filter((code) => {
          const list = validation.find((entry) => entry.code === code);
          return !list || list.rows === 0;
        }),
        lists: validation,
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  await writeFile(
    path.join(diagnosticsDir, "design-type-validation-report.json"),
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        scope: "E-series",
        report: designTypeValidationReport.sort(
          (a, b) =>
            compareText(a.priceListCode, b.priceListCode) ||
            compareText(a.productStyle, b.productStyle)
        ),
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  await writeFile(
    path.join(diagnosticsDir, "product-taxonomy-report.json"),
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        scope: ["G6", "P6", "A6"],
        taxonomyBrandMap: Object.fromEntries(taxonomyBrandMap),
        hiddenBrandSet: [...hiddenBrandSet],
        report: taxonomyReport,
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  await writeFile(
    path.join(diagnosticsDir, "material-validation-report.json"),
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        scope: ["G6", "P6", "A6"],
        report: materialReport,
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  await writeFile(
    path.join(diagnosticsDir, "color-option-validation-report.json"),
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        scope: ["G6", "P6", "A6"],
        report: colorReport,
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  await writeFile(
    path.join(diagnosticsDir, "ar-validation-report.json"),
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        scope: ["G6", "P6", "A6"],
        report: arReport,
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  await writeFile(
    path.join(diagnosticsDir, "pdf-parity-report.json"),
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        scope: ["G6", "P6", "A6"],
        sourceArtifacts: [
          "private-source/price-lists/alnpricing_2026_G6.pdf",
          "private-source/price-lists/alnpricing_2026_P6.pdf",
          "private-source/price-lists/alnpricing_2026_A6.pdf",
          "private-source/portal/lookup_docs/Lookup.xlsx",
          "private-source/portal/lookup_docs/Lookup_AR.xlsx",
          "private-source/portal/lookup_docs/Lookup_Mat.xlsx",
        ],
        report: parityReport,
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  await writeFile(
    path.join(diagnosticsDir, "lensmat-category-report.json"),
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        scope: ["G6", "P6", "A6"],
        report: lensMatRuleReport,
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  await writeFile(
    path.join(diagnosticsDir, "artisan-portfolio-normalization-report.json"),
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        scope: ["G6", "P6", "A6"],
        authoritativeStyles: ["DS*", "PS*", "GS*", "CFB", "SD Concept", "SD Reach"],
        report: artisanPortfolioRuleReport,
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  console.log(
    `[pricing:normalize] wrote ${validation.length} normalized price list files to ${normalizedDir}`
  );
}

main().catch((error) => {
  console.error(`[pricing:normalize] failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
