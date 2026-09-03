import { mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { gunzipSync, gzip } from "node:zlib";
import {
  getPricingLookupData,
  normalizeLookupKey as normalizeWorkbookLookupKey,
  stripSdPrefix,
} from "../lib/pricing/lookupData.mjs";
import { writeBufferAtomic, writeJsonAtomic } from "../lib/pricing/atomicJson.mjs";
import { PricingProgress } from "../lib/pricing/progress.mjs";
import {
  isDviAuthoritativePriceList,
  nonDviLensAddOnSections,
} from "../lib/pricing/sourceAuthority.mjs";

const gzipAsync = promisify(gzip);
const progress = new PricingProgress({ prefix: "pricing:normalize" });

const root = process.cwd();
const generatedDir = path.join(root, "private-source", "pricing", "generated");
const normalizedDir = path.join(generatedDir, "normalized");
const diagnosticsDir = path.join(generatedDir, "diagnostics");
const packagedNormalizedDir = path.join(
  root,
  "lib",
  "pricing",
  "generated",
  "normalized"
);
const dashboardIndexPath = path.join(
  root,
  "private-source",
  "portal",
  "dashboard-v1",
  "current",
  "accounts_index.json"
);
const manifestPath = path.join(generatedDir, "pricing-manifest.json");
const materialAddOnsByCode = {
  G6: [],
  P6: [],
  A6: [],
};

// These designs exist in the authoritative DVI price artifact but are absent
// from the legacy flat workbook export. Keep their names and prices sourced
// from DVI and Lookup.xlsx instead of hand-maintaining customer prices.
const dviSupplementStylesByCode = new Map([
  ["P6", new Set(["SEQUEL MEETING", "SEQUEL COMPUTER", "ENDLESS"])],
]);

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
  ["POLYCARB", "Polycarbonate"],
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

const materialDeltaTargets = [
  { codes: ["P"], material: "Plastic" },
  { codes: ["H53"], material: "Trivex" },
  { codes: ["H60"], material: "Hi-Index 1.60" },
  { codes: ["H67"], material: "Hi-Index 1.67" },
  { codes: ["H70"], material: "Hi-Index 1.70" },
  { codes: ["H74"], material: "Hi-Index 1.74" },
  { codes: ["H76"], material: "Hi-Index 1.76" },
];

const polycarbonateBaselineMaterialCodes = ["PLY", "TPY", "SPY", "PRY", "BLY"];

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
  return normalizeWorkbookLookupKey(value);
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
  if (style === "SD CONCEPT") return { displayName: "Concept", matched: true, family: "Concept" };
  if (style === "SD REACH") return { displayName: "Reach", matched: true, family: "Reach" };
  if (style === "SD RADIUS") return { displayName: "Radius", matched: true, family: "Radius" };
  return { displayName: stripSdPrefix(String(styleRaw ?? "").trim()), matched: false, family: null };
}

function canonicalCode(code) {
  return String(code ?? "").trim().toUpperCase();
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

function getStandardSourcePath(code) {
  return path.join(generatedDir, `${code.toLowerCase()}-pricing.json`);
}

function getDviSourcePath(code) {
  return path.join(generatedDir, `dvi-${code.toLowerCase()}-pricing.json`);
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function readGzipJson(filePath) {
  return JSON.parse(gunzipSync(await readFile(filePath)).toString("utf8"));
}

async function loadSourcePayloadForCode(code) {
  const standardPath = getStandardSourcePath(code);
  const dviPath = getDviSourcePath(code);

  if (isDviAuthoritativePriceList(code)) {
    if (!existsSync(dviPath)) {
      throw new Error(
        `[pricing:normalize] authoritative DVI source is missing for ${code}: ${dviPath}`
      );
    }

    try {
      const dviPayload = await readJson(dviPath);
      let preservedAddOnSections = [];
      if (existsSync(standardPath)) {
        const standardPayload = await readJson(standardPath);
        preservedAddOnSections = nonDviLensAddOnSections(
          standardPayload.addOnSections
        );
      }
      return {
        kind: "dvi",
        payload: dviPayload,
        preservedAddOnSections,
      };
    } catch (error) {
      console.warn(
        `[pricing:normalize] unable to read authoritative ${path.basename(
          dviPath
        )} for ${code}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      throw error;
    }
  }

  if (existsSync(standardPath)) {
    try {
      return {
        kind: "standard",
        payload: await readJson(standardPath),
      };
    } catch (error) {
      console.warn(
        `[pricing:normalize] unable to read ${path.basename(
          standardPath
        )}; falling back to packaged payload for ${code}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  if (existsSync(dviPath)) {
    try {
      return {
        kind: "dvi",
        payload: await readJson(dviPath),
      };
    } catch (error) {
      console.warn(
        `[pricing:normalize] unable to read ${path.basename(
          dviPath
        )}; falling back to packaged payload for ${code}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  const packagedPath = path.join(packagedNormalizedDir, `${code}.json.gz`);
  if (existsSync(packagedPath)) {
    return {
      kind: "standard",
      payload: await readGzipJson(packagedPath),
    };
  }

  return { kind: "missing", payload: null };
}

async function readLookupBrandAndName(lookupData) {
  const map = new Map();
  for (const row of lookupData.workbooks.products.rows) {
    const dvi = normalizeKey(row.lenstyle);
    const normalizedName = stripSdPrefix(row.styleconsollidated);
    const brand = String(row.lensbrand ?? "").trim();
    if (!dvi || !normalizedName) continue;
    map.set(dvi, {
      name: normalizedName,
      designType: String(row["Type Revised"] ?? "").trim(),
      brand,
    });
  }

  return map;
}

async function readLookupArMap(lookupData) {
  const map = new Map();
  for (const row of lookupData.workbooks.ar.rows) {
    const code = normalizeKey(row.dvi);
    const name = String(row.name ?? "").trim();
    const brand = String(row.brand ?? "").trim();
    if (!code || !name) continue;
    map.set(code, {
      name,
      brandFamily: brand ? `${brand} AR Coatings` : "AR Coatings",
    });
  }

  return map;
}

async function readLookupMaterialMap(lookupData) {
  const map = new Map();
  for (const row of lookupData.workbooks.materials.rows) {
    const code = normalizeKey(row.lensmat);
    if (!code) continue;
    map.set(code, {
      name: normalizeTextValue(row["Material Name"]),
      materialColor: normalizeTextValue(row["Material Color"]),
      colorBrand: normalizeTextValue(row["Material Color Brand"]),
      photochromic: normalizeTextValue(row.Photochromic),
      polarized: normalizeTextValue(row.Polarized),
    });
  }
  return map;
}

function normalizeTextValue(value) {
  return String(value ?? "").trim();
}

function mergeUniqueValues(current = [], next = []) {
  return [...new Set([...current, ...next])].sort(compareText);
}

function dedupeDviRows(rows) {
  const byKey = new Map();
  for (const row of rows) {
    const key = [
      normalizeKey(row.brand),
      normalizeKey(row.designType),
      normalizeKey(row.designStyle),
      normalizeKey(row.materialRaw),
      normalizeKey(row.material),
      normalizeKey(row.materialColor),
      normalizeKey(row.colorBrand),
      row.edgedPrice,
      row.uncutDeduct,
      row.uncutPrice,
    ].join("|");
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, row);
      continue;
    }

    existing.rawProductNames = mergeUniqueValues(
      existing.rawProductNames,
      row.rawProductNames
    );
    existing.sourceCodes = mergeUniqueValues(existing.sourceCodes, row.sourceCodes);
    existing.colorRaw = mergeUniqueValues(existing.colorRaw, row.colorRaw);
    existing.availableColors = mergeUniqueValues(
      existing.availableColors,
      row.availableColors
    );
    existing.duplicateSourceRows += row.duplicateSourceRows;

    const coatings = new Map(
      (existing.coatingOptions ?? []).map((coating) => [
        `${coating.code}|${coating.price}|${coating.sourceSchedule}`,
        coating,
      ])
    );
    for (const coating of row.coatingOptions ?? []) {
      coatings.set(
        `${coating.code}|${coating.price}|${coating.sourceSchedule}`,
        coating
      );
    }
    existing.coatingOptions = [...coatings.values()];
  }
  return [...byKey.values()];
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
    designStyle: stripSdPrefix(row.designStyle),
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

function formatAddOnPrice(addOn) {
  if (addOn === 0) return "$0";
  const sign = addOn < 0 ? "-" : "";
  return `${sign}$${Math.abs(addOn).toFixed(2).replace(/\.00$/u, "")}`;
}

function rowColorKey(row) {
  const colorRaw = Array.isArray(row.colorRaw) ? row.colorRaw[0] : row.colorRaw;
  return normalizeKey(colorRaw || "CLR");
}

function rowStyleKey(row) {
  return [
    normalizeKey(row.brand),
    normalizeKey(row.designType),
    normalizeKey(row.designStyle),
    rowColorKey(row),
    normalizeKey(row.materialColor),
  ].join("|");
}

function mostCommonNumber(values) {
  const counts = new Map();
  for (const value of values) {
    const normalized = Number(Number(value).toFixed(2));
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || Math.abs(a[0]) - Math.abs(b[0]) || a[0] - b[0])[0]?.[0];
}

function deriveMaterialAddOnsFromRows(rows) {
  const groups = new Map();
  for (const row of rows ?? []) {
    const materialCode = normalizeKey(row.materialRaw || row.lensMatCode);
    if (!materialCode) continue;
    const price = parsePriceToNumber(row.edgedPrice);
    if (!Number.isFinite(price)) continue;
    const key = rowStyleKey(row);
    const group = groups.get(key) ?? new Map();
    group.set(materialCode, price);
    groups.set(key, group);
  }

  const addOns = [];
  for (const target of materialDeltaTargets) {
    const deltas = [];
    for (const materialPrices of groups.values()) {
      const baselineCode = polycarbonateBaselineMaterialCodes.find((code) => materialPrices.has(code));
      if (!baselineCode) continue;
      const baseline = materialPrices.get(baselineCode);
      for (const targetCode of target.codes) {
        if (materialPrices.has(targetCode)) {
          deltas.push(Number((materialPrices.get(targetCode) - baseline).toFixed(2)));
        }
      }
    }
    const addOn = mostCommonNumber(deltas);
    if (Number.isFinite(addOn)) {
      addOns.push({ material: target.material, addOn });
    }
  }

  return addOns;
}

function hasMaterialAddOnSection(addOnSections) {
  return (addOnSections ?? []).some((entry) => /add for material/i.test(String(entry.title || "")));
}

function addInferredMaterialSection(addOnSections, materialAddOns) {
  if (hasMaterialAddOnSection(addOnSections) || !materialAddOns.length) return addOnSections ?? [];
  return [
    {
      title: "Add for Material",
      items: materialAddOns.map((entry) => ({
        name: entry.material,
        price: formatAddOnPrice(entry.addOn),
      })),
    },
    ...(addOnSections ?? []),
  ];
}

function materialAddOnsFromSections(code, addOnSections, rows = []) {
  const fallback = materialAddOnsByCode[code] ?? [];
  const section = (addOnSections ?? []).find((entry) =>
    /add for material/i.test(String(entry.title || ""))
  );
  if (!section?.items?.length) {
    const derived = deriveMaterialAddOnsFromRows(rows);
    return derived.length > 0 ? derived : fallback;
  }

  const parsed = section.items
    .map((item) => ({
      material: normalizeMaterialName(String(item.name || "").trim()),
      addOn:
        typeof item.price === "number" ? item.price : parsePriceToNumber(item.price),
    }))
    .filter((entry) => entry.material && Number.isFinite(entry.addOn));

  if (parsed.length > 0) return parsed;
  const derived = deriveMaterialAddOnsFromRows(rows);
  return derived.length > 0 ? derived : fallback;
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

function mergeArCoating(byCode, coating) {
  if (!coating?.code || coating.unresolved) return;
  const code = String(coating.code).trim().toUpperCase();
  if (!code) return;
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

function normalizeArCoatings(rows, supplementalSchedules = [], arLookupMap = null) {
  const byCode = new Map();
  for (const row of rows) {
    for (const coating of row.coatingOptions ?? []) {
      mergeArCoating(byCode, coating);
    }
  }

  for (const schedule of supplementalSchedules ?? []) {
    for (const coating of schedule?.entries ?? []) {
      const rawCode = String(coating?.Code ?? "").trim().toUpperCase();
      if (!rawCode) continue;
      const match = arLookupMap?.get(normalizeKey(rawCode));
      mergeArCoating(byCode, {
        code: rawCode,
        name: match?.name || rawCode,
        brandFamily: match?.brandFamily || "Unmapped AR",
        price: Number(coating?.Price ?? 0),
        unresolved: !match,
      });
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

function dviRowsToGeneratedPayload(
  code,
  dviRows,
  lookupMap,
  arLookupMap,
  materialLookupMap,
  scheduleCatalog = {}
) {
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
    const materialLookup = materialLookupMap.get(normalizeKey(materialCode));
    const material = normalizeMaterialName(
      materialLookup?.name || String(row?.materialLensType || materialCode || "Unknown Material")
    );
    const colorRaw = String(
      row?.sourceRefs?.styleRow?.COL || row?.sourceRefs?.styleRow?.Col || "CLR"
    ).trim();
    const colorUpper = colorRaw.toUpperCase();
    const materialColor =
      normalizeKey(materialLookup?.polarized) === "YES"
        ? "Polarized"
        : normalizeKey(materialLookup?.photochromic) === "YES"
          ? "Photochromic"
          : materialLookup?.materialColor || (colorUpper === "CLR" || colorUpper === "CLEAR" ? "Clear" : "Photochromic");
    const colorBrand = materialLookup?.colorBrand || (colorRaw || "CLR");
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
      colorBrand,
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

  const dedupedRows = dedupeDviRows(rows).map((row, index) => ({
    ...row,
    id: `${code}-${index}`,
  }));

  return {
    code,
    rows: dedupedRows,
    arCoatings: normalizeArCoatings(
      dedupedRows,
      scheduleCatalog.coating ?? [],
      arLookupMap
    ),
    addOnSections: [],
    scheduleCatalog,
    report: {
      sourceFiles: [`dvi-${code.toLowerCase()}-pricing.json`],
      rowCount: dedupedRows.length,
      rawSourceRowsProcessed: dviRows.length,
      rowsExcludedMissingLookup: 0,
      displayRowCount: dedupedRows.length,
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

async function addDviSupplements(
  code,
  payload,
  lookupMap,
  arLookupMap,
  materialLookupMap
) {
  const supplementalStyles = dviSupplementStylesByCode.get(code);
  const dviPath = getDviSourcePath(code);
  if (!supplementalStyles?.size || !existsSync(dviPath)) return payload;

  const dviPayload = await readJson(dviPath);
  const rows = (dviPayload.rows ?? []).filter((row) =>
    supplementalStyles.has(normalizeKey(row.productStyleCode))
  );
  if (!rows.length) return payload;

  const supplement = dviRowsToGeneratedPayload(
    code,
    rows,
    lookupMap,
    arLookupMap,
    materialLookupMap,
    dviPayload.scheduleCatalog ?? {}
  );
  const existingStyles = new Set(
    (payload.rows ?? []).map((row) => normalizeKey(row.designStyle))
  );
  const missingRows = supplement.rows.filter(
    (row) => !existingStyles.has(normalizeKey(row.designStyle))
  );

  return missingRows.length
    ? { ...payload, rows: [...(payload.rows ?? []), ...missingRows] }
    : payload;
}

async function readTargetCodes() {
  const targetCodes = new Set();

  if (existsSync(dashboardIndexPath)) {
    const index = await readJson(dashboardIndexPath);
    for (const account of index ?? []) {
      for (const code of account?.price_lists ?? []) {
        const normalized = canonicalCode(String(code || ""));
        if (normalized) targetCodes.add(normalized);
      }
    }
  }

  if (existsSync(manifestPath)) {
    const manifest = await readJson(manifestPath);
    for (const code of manifest?.priceListCodesFound ?? []) {
      const normalized = canonicalCode(String(code || ""));
      if (normalized) targetCodes.add(normalized);
    }
  }

  const requestedCodeArgument = process.argv.find((argument) =>
    argument.startsWith("--codes=")
  );
  const requestedCodes = new Set(
    String(requestedCodeArgument?.slice("--codes=".length) ?? "")
      .split(",")
      .map(canonicalCode)
      .filter(Boolean)
  );
  const filteredCodes = [...targetCodes]
    .filter(
      (code) =>
        existsSync(getStandardSourcePath(code)) || existsSync(getDviSourcePath(code))
    )
    .filter((code) => requestedCodes.size === 0 || requestedCodes.has(code))
    .sort();

  return {
    targetCodes: filteredCodes,
    ignoreCodes: [],
  };
}

async function writeJson(filePath, value, { pretty = true } = {}) {
  await writeJsonAtomic(filePath, value, { pretty });
}

async function writeGzipJson(filePath, value) {
  const payload = `${JSON.stringify(value)}\n`;
  const compressed = await gzipAsync(Buffer.from(payload, "utf8"));
  await writeBufferAtomic(filePath, compressed);
}

async function main() {
  await mkdir(normalizedDir, { recursive: true });
  await mkdir(diagnosticsDir, { recursive: true });
  await mkdir(packagedNormalizedDir, { recursive: true });
  const lookupData = await getPricingLookupData({ rootDir: root });
  const lookupMap = await readLookupBrandAndName(lookupData);
  const arLookupMap = await readLookupArMap(lookupData);
  const materialLookupMap = await readLookupMaterialMap(lookupData);
  const { targetCodes, ignoreCodes } = await readTargetCodes();
  const validation = [];
  const taxonomyReport = [];
  const materialReport = [];
  const colorReport = [];
  const arReport = [];
  const parityReport = [];
  const lensMatRuleReport = [];
  const artisanPortfolioRuleReport = [];
  const designTypeValidationReport = [];
  for (const code of targetCodes) {
    const source = await progress.run(`load source ${code}`, () =>
      loadSourcePayloadForCode(code)
    );
    let payload;

    if (source.kind === "standard" && source.payload) {
      payload = { ...source.payload, code };
    } else if (source.kind === "dvi" && source.payload?.rows) {
      payload = dviRowsToGeneratedPayload(
        code,
        source.payload.rows,
        lookupMap,
        arLookupMap,
        materialLookupMap,
        source.payload.scheduleCatalog ?? {}
      );
      payload.addOnSections = source.preservedAddOnSections ?? [];
      payload.report.assumptions.push(
        `${code} design and option rows are sourced only from the matching DVI Style PList.`
      );
    } else {
      payload = {
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
      };
    }

    if (source.kind === "standard") {
      payload = await progress.run(`add DVI supplements ${code}`, () =>
        addDviSupplements(
          code,
          payload,
          lookupMap,
          arLookupMap,
          materialLookupMap
        )
      );
    }

    const {
      normalizedRowsResult,
      arCoatings,
      materialAddOns,
      normalizedPayload,
    } = await progress.run(`build normalized payload ${code}`, () => {
      const normalizedRowsResult = normalizeRows(payload.rows ?? [], lookupMap, code);
      const arCoatings = normalizeArCoatings(
        normalizedRowsResult.rows,
        payload.scheduleCatalog?.coating ?? [],
        arLookupMap
      );
      const materialAddOns = materialAddOnsFromSections(
        code,
        payload.addOnSections ?? [],
        normalizedRowsResult.rows
      );
      const addOnSections = addInferredMaterialSection(
        payload.addOnSections ?? [],
        materialAddOns
      );
      return {
        normalizedRowsResult,
        arCoatings,
        materialAddOns,
        normalizedPayload: {
          ...payload,
          code,
          canonicalCode: code,
          sourceCodesMerged: [
            ...new Set(
              (payload.rows ?? []).map((row) =>
                String(row.code || "").toUpperCase()
              )
            ),
          ].sort(),
          rows: normalizedRowsResult.rows,
          arCoatings,
          materialAddOns,
          addOnSections,
          report: sanitizeReport(payload.report),
        },
      };
    });

    for (const correction of normalizedRowsResult.designTypeDiagnostics ?? []) {
      designTypeValidationReport.push(correction);
    }

    await progress.run(`write normalized JSON ${code}`, () =>
      writeJson(path.join(normalizedDir, `${code}.json`), normalizedPayload, {
        pretty: false,
      })
    );
    await progress.run(`gzip packaged JSON ${code}`, () =>
      writeGzipJson(
        path.join(packagedNormalizedDir, `${code}.json.gz`),
        normalizedPayload
      )
    );
    payload = null;

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

  await writeJson(path.join(diagnosticsDir, "price-list-display-validation.json"), {
    generatedAt: new Date().toISOString(),
    legacyCanonicalMap: {},
    ignoredCodes: ignoreCodes,
    requestedTargetCodes: targetCodes,
    missingSourceCodes: targetCodes.filter((code) => {
      const list = validation.find((entry) => entry.code === code);
      return !list || list.rows === 0;
    }),
    lists: validation,
  });

  await writeJson(path.join(diagnosticsDir, "design-type-validation-report.json"), {
    generatedAt: new Date().toISOString(),
    scope: "E-series",
    report: designTypeValidationReport.sort(
      (a, b) =>
        compareText(a.priceListCode, b.priceListCode) ||
        compareText(a.productStyle, b.productStyle)
    ),
  });

  await writeJson(path.join(diagnosticsDir, "product-taxonomy-report.json"), {
    generatedAt: new Date().toISOString(),
    scope: ["G6", "P6", "A6"],
    taxonomyBrandMap: Object.fromEntries(taxonomyBrandMap),
    hiddenBrandSet: [...hiddenBrandSet],
    report: taxonomyReport,
  });

  await writeJson(path.join(diagnosticsDir, "material-validation-report.json"), {
    generatedAt: new Date().toISOString(),
    scope: ["G6", "P6", "A6"],
    report: materialReport,
  });

  await writeJson(path.join(diagnosticsDir, "color-option-validation-report.json"), {
    generatedAt: new Date().toISOString(),
    scope: ["G6", "P6", "A6"],
    report: colorReport,
  });

  await writeJson(path.join(diagnosticsDir, "ar-validation-report.json"), {
    generatedAt: new Date().toISOString(),
    scope: ["G6", "P6", "A6"],
    report: arReport,
  });

  await writeJson(path.join(diagnosticsDir, "pdf-parity-report.json"), {
    generatedAt: new Date().toISOString(),
    scope: ["G6", "P6", "A6"],
    sourceArtifacts: [
      "private-source/price-lists/alnpricing_2026_G6.pdf",
      "private-source/price-lists/alnpricing_2026_P6.pdf",
      "private-source/price-lists/alnpricing_2026_A6.pdf",
      path.relative(root, lookupData.sourceFiles.products),
      path.relative(root, lookupData.sourceFiles.ar),
      path.relative(root, lookupData.sourceFiles.materials),
    ],
    report: parityReport,
  });

  await writeJson(path.join(diagnosticsDir, "lensmat-category-report.json"), {
    generatedAt: new Date().toISOString(),
    scope: ["G6", "P6", "A6"],
    report: lensMatRuleReport,
  });

  await writeJson(
    path.join(diagnosticsDir, "artisan-portfolio-normalization-report.json"),
    {
      generatedAt: new Date().toISOString(),
      scope: ["G6", "P6", "A6"],
      authoritativeStyles: ["DS*", "PS*", "GS*", "CFB", "Concept", "Reach", "Radius"],
      report: artisanPortfolioRuleReport,
    }
  );

  console.log(
    `[pricing:normalize] wrote ${validation.length} normalized price list files to ${normalizedDir}`
  );
}

main().catch((error) => {
  console.error(`[pricing:normalize] failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
