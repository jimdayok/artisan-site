import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import type { GeneratedPriceListData, PriceListAddOnSection, PriceListArCoating } from "@/lib/pricing/types";
import { getPricingLookupData, stripSdPrefix } from "@/lib/pricing/lookupData.mjs";

type DviRow = {
  priceListCode: string;
  productStyleCode: string;
  productStyleDescription: string;
  materialCode: string;
  materialLensType?: string;
  basePrice: number;
  sourceRefs?: {
    styleRow?: {
      Name?: string;
      UncutDeduct?: string;
      Fin?: string;
      Col?: string;
      COL?: string;
      COT?: string;
    };
  };
  linkedSchedules?: {
    coating?: Array<{ Code?: string; Price?: string | number }>;
  };
};

type DviPayload = {
  rows?: DviRow[];
  scheduleCatalog?: {
    coating?: Array<{
      entries?: Array<{ Code?: string; Price?: string | number }>;
    }>;
  };
};

function readJson<T>(filePath: string): T | undefined {
  if (!existsSync(filePath)) return undefined;
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

function readGzipJson<T>(filePath: string): T | undefined {
  if (!existsSync(filePath)) return undefined;
  return JSON.parse(gunzipSync(readFileSync(filePath)).toString("utf8")) as T;
}

function toNumber(value: unknown) {
  const parsed = Number.parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeColor(col?: string) {
  const normalized = String(col || "").trim().toUpperCase();
  if (normalized === "CLR" || normalized === "CLEAR") return "Clear";
  if (!normalized) return "Clear";
  return normalized;
}

function normalizeLookupKey(value: string) {
  return String(value || "")
    .toUpperCase()
    .replace(/[™®]/g, "")
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalPriceListCode(code: string) {
  return code.trim().toUpperCase();
}

function normalizeDesignStyleName(value: string) {
  return stripSdPrefix(String(value || ""))
    .replace(/[™®]/g, "")
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeMaterialDisplayName(value: string) {
  const normalized = normalizeLookupKey(value);
  if (normalized === "POLYCARB" || normalized === "POLYCARBONATE") return "Polycarbonate";
  if (normalized === "PLASTIC") return "Plastic";
  if (normalized === "TRIVEX") return "Trivex";
  if (normalized === "HI INDEX 1.60" || normalized === "HI-INDEX 1.60" || normalized === "HIGH INDEX 1.60") return "Hi-Index 1.60";
  if (normalized === "HI INDEX 1.67" || normalized === "HI-INDEX 1.67" || normalized === "HIGH INDEX 1.67") return "Hi-Index 1.67";
  if (normalized === "HI INDEX 1.74" || normalized === "HI-INDEX 1.74" || normalized === "HIGH INDEX 1.74") return "Hi-Index 1.74";
  return String(value || "").trim();
}

const materialDeltaTargets = [
  { codes: ["P"], material: "Plastic" },
  { codes: ["H53"], material: "Trivex" },
  { codes: ["H60"], material: "Hi-Index 1.60" },
  { codes: ["H67"], material: "Hi-Index 1.67" },
  { codes: ["H74"], material: "Hi-Index 1.74" },
];

const polycarbonateBaselineMaterialCodes = ["PLY", "TPY", "SPY", "PRY", "BLY"];

function formatAddOnPrice(addOn: number) {
  if (addOn === 0) return "$0";
  const sign = addOn < 0 ? "-" : "";
  return `${sign}$${Math.abs(addOn).toFixed(2).replace(/\.00$/u, "")}`;
}

function mostCommonNumber(values: number[]) {
  const counts = new Map<number, number>();
  for (const value of values) {
    const normalized = Number(value.toFixed(2));
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }
  return [...counts.entries()].sort(
    (a, b) => b[1] - a[1] || Math.abs(a[0]) - Math.abs(b[0]) || a[0] - b[0]
  )[0]?.[0];
}

function deriveMaterialAddOnsFromRows(rows: Array<{
  brand: string;
  designType: string;
  designStyle: string;
  materialRaw?: string;
  materialColor: string;
  colorRaw: string[];
  edgedPrice: number;
}>) {
  const groups = new Map<string, Map<string, number>>();
  for (const row of rows) {
    const materialCode = normalizeLookupKey(row.materialRaw || "");
    if (!materialCode || !Number.isFinite(row.edgedPrice)) continue;
    const color = normalizeLookupKey(row.colorRaw?.[0] || "CLR");
    const key = [
      normalizeLookupKey(row.brand),
      normalizeLookupKey(row.designType),
      normalizeLookupKey(row.designStyle),
      normalizeLookupKey(row.materialColor),
      color,
    ].join("|");
    const group = groups.get(key) ?? new Map<string, number>();
    group.set(materialCode, row.edgedPrice);
    groups.set(key, group);
  }

  return materialDeltaTargets.flatMap((target) => {
    const deltas: number[] = [];
    for (const materialPrices of groups.values()) {
      const baselineCode = polycarbonateBaselineMaterialCodes.find((code) => materialPrices.has(code));
      if (!baselineCode) continue;
      const baseline = materialPrices.get(baselineCode);
      if (typeof baseline !== "number" || !Number.isFinite(baseline)) continue;
      for (const targetCode of target.codes) {
        const targetPrice = materialPrices.get(targetCode);
        if (typeof targetPrice === "number" && Number.isFinite(targetPrice)) {
          deltas.push(Number((targetPrice - baseline).toFixed(2)));
        }
      }
    }
    const addOn = mostCommonNumber(deltas);
    return Number.isFinite(addOn) ? [{ material: target.material, addOn: addOn! }] : [];
  });
}

function addInferredMaterialSection(
  addOnSections: PriceListAddOnSection[],
  materialAddOns: Array<{ material: string; addOn: number }>
) {
  if (
    !materialAddOns.length ||
    addOnSections.some((section) => /add for material/i.test(section.title))
  ) {
    return addOnSections;
  }
  return [
    {
      title: "Add for Material",
      items: materialAddOns.map((entry) => ({
        name: entry.material,
        price: formatAddOnPrice(entry.addOn),
      })),
    },
    ...addOnSections,
  ];
}

type LookupMaps = {
  productByDvi: Map<string, { name: string; designType: string; brand: string }>;
  materialByDvi: Map<
    string,
    {
      name: string;
      materialColor: string;
      colorBrand: string;
      photochromic: string;
      polarized: string;
    }
  >;
  arByCode: Map<string, { name: string; brand: string }>;
};

let lookupMapsPromise: Promise<LookupMaps> | null = null;

async function loadLookupMaps(): Promise<LookupMaps> {
  if (lookupMapsPromise) return lookupMapsPromise;
  lookupMapsPromise = (async () => {
    const lookupData = await getPricingLookupData({ rootDir: process.cwd() });

    const productByDvi = new Map<string, { name: string; designType: string; brand: string }>();
    for (const row of lookupData.workbooks.products.rows) {
      const dvi = normalizeLookupKey(row.lenstyle || "");
      const name = stripSdPrefix(row.styleconsollidated || "");
      if (!dvi || !name) continue;
      productByDvi.set(dvi, {
        name,
        designType: String(row["Type Revised"] || "").trim(),
        brand: String(row.lensbrand || "").trim(),
      });
    }

    const materialByDvi = new Map<
      string,
      {
        name: string;
        materialColor: string;
        colorBrand: string;
        photochromic: string;
        polarized: string;
      }
    >();
    for (const row of lookupData.workbooks.materials.rows) {
      const dvi = normalizeLookupKey(row.lensmat || "");
      const name = String(row["Material Name"] || "").trim();
      if (!dvi || !name) continue;
      materialByDvi.set(dvi, {
        name,
        materialColor: String(row["Material Color"] || "").trim(),
        colorBrand: String(row["Material Color Brand"] || "").trim(),
        photochromic: String(row.Photochromic || "").trim(),
        polarized: String(row.Polarized || "").trim(),
      });
    }

    const arByCode = new Map<string, { name: string; brand: string }>();
    for (const row of lookupData.workbooks.ar.rows) {
      const dviCode = normalizeLookupKey(row.dvi || "");
      const name = String(row.name || "").trim();
      const brand = String(row.brand || "").trim();
      if (!dviCode || !name) continue;
      arByCode.set(dviCode, { name, brand });
    }

    return { productByDvi, materialByDvi, arByCode };
  })();
  return lookupMapsPromise;
}

function dedupePricingRows<T extends {
  brand: string;
  designType: string;
  designStyle: string;
  material: string;
  materialColor: string;
  colorBrand: string;
  edgedPrice: number;
  uncutDeduct: number;
  uncutPrice: number;
  rawProductNames: string[];
  sourceCodes: string[];
  colorRaw: string[];
  availableColors: string[];
  coatingOptions?: Array<{ code: string; name: string; price: number; sourceSchedule: string; unresolved: boolean; brandFamily: string }>;
}>(
  rows: T[]
) {
  const byKey = new Map<string, T>();
  for (const row of rows) {
    const key = [
      row.brand.toUpperCase(),
      row.designType.toUpperCase(),
      row.designStyle.toUpperCase(),
      row.material.toUpperCase(),
      row.materialColor.toUpperCase(),
      row.colorBrand.toUpperCase(),
      row.edgedPrice,
      row.uncutDeduct,
      row.uncutPrice,
    ].join("|");
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, row);
      continue;
    }
    existing.rawProductNames = [...new Set([...existing.rawProductNames, ...row.rawProductNames])];
    existing.sourceCodes = [...new Set([...existing.sourceCodes, ...row.sourceCodes])];
    existing.colorRaw = [...new Set([...existing.colorRaw, ...row.colorRaw])];
    existing.availableColors = [...new Set([...existing.availableColors, ...row.availableColors])];
    if (row.coatingOptions?.length) {
      const merged = new Map(
        (existing.coatingOptions ?? []).map((coating) => [
          `${coating.code}|${coating.name}|${coating.price}`,
          coating,
        ])
      );
      for (const coating of row.coatingOptions) {
        merged.set(`${coating.code}|${coating.name}|${coating.price}`, coating);
      }
      existing.coatingOptions = [...merged.values()];
    }
  }
  return [...byKey.values()];
}

function mergeArCoating(
  arMap: Map<string, PriceListArCoating>,
  coating: {
    code: string;
    name: string;
    brandFamily: string;
    price: number;
    sourceSchedule: string;
    unresolved?: boolean;
  }
) {
  if (coating.unresolved || !coating.code) return;
  const key = `${coating.code}|${coating.name}|${coating.sourceSchedule}`;
  const existing = arMap.get(key);
  if (!existing || coating.price < existing.price) {
    arMap.set(key, {
      code: coating.code,
      name: coating.name || coating.code,
      brandFamily: coating.brandFamily || "AR Coatings",
      price: coating.price,
      sourceSchedule: coating.sourceSchedule,
      unresolved: Boolean(coating.unresolved),
      notes: coating.unresolved
        ? `Confirm availability. Unresolved AR code ${coating.code} from COT schedule ${coating.sourceSchedule}.`
        : `Price sourced from COT schedule ${coating.sourceSchedule}.`,
      recommended: false,
      outsourced: false,
    });
  }
}

function deriveArCoatingsFromRows(
  rows: Array<{
    coatingOptions?: Array<{
      code: string;
      name: string;
      brandFamily: string;
      price: number;
      sourceSchedule: string;
      unresolved?: boolean;
    }>;
  }>,
  scheduleCatalog?: DviPayload["scheduleCatalog"],
  arByCode?: LookupMaps["arByCode"]
) {
  const arMap = new Map<string, PriceListArCoating>();
  for (const row of rows) {
    for (const coating of row.coatingOptions ?? []) {
      mergeArCoating(arMap, coating);
    }
  }

  for (const schedule of scheduleCatalog?.coating ?? []) {
    for (const entry of schedule.entries ?? []) {
      const code = String(entry.Code ?? "").trim().toUpperCase();
      if (!code) continue;
      const match = arByCode?.get(normalizeLookupKey(code));
      mergeArCoating(arMap, {
        code,
        name: match?.name || code,
        brandFamily: match?.brand ? `${match.brand} AR Coatings` : "AR Coatings",
        price: toNumber(entry.Price),
        sourceSchedule: "Supplemental",
        unresolved: !match,
      });
    }
  }

  return [...arMap.values()].sort(
    (a, b) =>
      a.brandFamily.localeCompare(b.brandFamily) ||
      a.name.localeCompare(b.name) ||
      (a.code || "").localeCompare(b.code || "")
  );
}

async function dviToGenerated(code: string, payload: DviPayload): Promise<GeneratedPriceListData> {
  const lookups = await loadLookupMaps();
  const rows = payload.rows ?? [];
  const rawPricingRows = rows.map((row, index) => {
    const uncutDeduct = toNumber(row.sourceRefs?.styleRow?.UncutDeduct);
    const edgedPrice = toNumber(row.basePrice);
    const color = normalizeColor(row.sourceRefs?.styleRow?.Col);
    const coatingScheduleRef = String(row.sourceRefs?.styleRow?.COT || "").trim();
    const productLookupKey = normalizeLookupKey(
      row.sourceRefs?.styleRow?.Name || row.productStyleCode || row.productStyleDescription || ""
    );
    const productLookup =
      lookups.productByDvi.get(productLookupKey) ||
      lookups.productByDvi.get(normalizeLookupKey(row.productStyleCode || "")) ||
      lookups.productByDvi.get(normalizeLookupKey(row.productStyleDescription || ""));
    const mappedProductName =
      productLookup?.name ||
      row.productStyleDescription ||
      row.productStyleCode;
    const normalizedStyle = normalizeDesignStyleName(mappedProductName);
    const fallbackDesignType = row.sourceRefs?.styleRow?.Fin === "S" ? "Single Vision" : "Progressive";
    const designType =
      productLookup?.designType ||
      (normalizeLookupKey(productLookup?.brand || normalizedStyle).includes("VARILUX") ? "Progressive" : fallbackDesignType);
    const coatingOptions = (row.linkedSchedules?.coating ?? []).map((coating) => ({
      code: String(coating.Code ?? "").trim().toUpperCase(),
      name:
        lookups.arByCode.get(normalizeLookupKey(String(coating.Code ?? "")))?.name ||
        String(coating.Code ?? "").trim(),
      brandFamily: (() => {
        const brand = lookups.arByCode.get(normalizeLookupKey(String(coating.Code ?? "")))?.brand || "";
        return brand ? `${brand} AR Coatings` : "AR Coatings";
      })(),
      price: toNumber(coating.Price),
      sourceSchedule: coatingScheduleRef || "Unknown",
      unresolved: !lookups.arByCode.has(normalizeLookupKey(String(coating.Code ?? ""))),
    }));

    const materialLookup = lookups.materialByDvi.get(normalizeLookupKey(row.materialCode || ""));
    const mappedMaterial = normalizeMaterialDisplayName(
      materialLookup?.name ||
        row.materialLensType ||
        row.materialCode ||
        ""
    );
    const materialColor =
      normalizeLookupKey(materialLookup?.polarized || "") === "YES"
        ? "Polarized"
        : normalizeLookupKey(materialLookup?.photochromic || "") === "YES"
          ? "Photochromic"
          : color === "CLEAR"
            ? "Clear"
            : "Photochromic";

    return {
      code,
      id: `${code}-${index}`,
      brand: productLookup?.brand || normalizeDesignStyleName((row.productStyleDescription || "Design").split(" ")[0] || "Design"),
      designType,
      designStyle: normalizedStyle,
      rawProductNames: [row.productStyleCode].filter(Boolean),
      sourceCodes: [row.productStyleCode, row.materialCode].filter(Boolean),
      materialRaw: row.materialCode,
      material: mappedMaterial,
      materialColor,
      colorRaw: [color],
      availableColors: [color],
      colorBrand: materialLookup?.colorBrand || color,
      edgedPrice,
      uncutDeduct,
      uncutPrice: Number((edgedPrice - uncutDeduct).toFixed(2)),
      recommended: false,
      outsourced: false,
      serviceNotes: [],
      duplicateSourceRows: 1,
      coatingScheduleRef,
      coatingOptions,
    };
  });
  const pricingRows = dedupePricingRows(rawPricingRows).map((row, index) => ({
    ...row,
    id: `${code}-${index}`,
  }));

  const arCoatings = deriveArCoatingsFromRows(
    pricingRows,
    payload.scheduleCatalog,
    lookups.arByCode
  );

  const materialAddOns = deriveMaterialAddOnsFromRows(pricingRows);
  const addOnSections: PriceListAddOnSection[] = addInferredMaterialSection([
    {
      title: "Program Notes",
      items: [
        {
          name: "DVI-driven pricing",
          price: "Generated from current DVI XML source",
        },
      ],
    },
  ], materialAddOns);

  return {
    code,
    rows: pricingRows,
    arCoatings,
    materialAddOns,
    addOnSections,
    report: {
      sourceFiles: [`dvi-${code.toLowerCase()}-pricing.json`],
      rowCount: pricingRows.length,
      rawSourceRowsProcessed: pricingRows.length,
      rowsExcludedMissingLookup: 0,
      displayRowCount: pricingRows.length,
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
      assumptions: ["DVI fallback interactive mode."],
    },
  };
}

export async function loadGeneratedPriceListByCode(code: string): Promise<GeneratedPriceListData | null> {
  const normalizedCode = canonicalPriceListCode(code);
  if (!normalizedCode) return null;
  const generatedDir = path.join(process.cwd(), "private-source", "pricing", "generated");
  const normalizedPath = path.join(
    generatedDir,
    "normalized",
    `${normalizedCode}.json`
  );
  const normalizedPayload = readJson<GeneratedPriceListData>(normalizedPath);
  if (
    normalizedPayload?.rows &&
    Array.isArray(normalizedPayload.rows) &&
    normalizedPayload.rows.length > 0
  ) {
    return normalizedPayload;
  }
  const packagedNormalizedPath = path.join(
    process.cwd(),
    "lib",
    "pricing",
    "generated",
    "normalized",
    `${normalizedCode}.json.gz`
  );
  const packagedNormalized =
    readGzipJson<GeneratedPriceListData>(packagedNormalizedPath);
  if (
    packagedNormalized?.rows &&
    Array.isArray(packagedNormalized.rows) &&
    packagedNormalized.rows.length > 0
  ) {
    return packagedNormalized;
  }
  const standardPath = path.join(generatedDir, `${normalizedCode.toLowerCase()}-pricing.json`);
  const standard = readJson<GeneratedPriceListData>(standardPath);
  if (standard?.rows && Array.isArray(standard.rows) && standard.rows.length > 0) {
    if (!Array.isArray(standard.arCoatings) || standard.arCoatings.length === 0) {
      return {
        ...standard,
        arCoatings: deriveArCoatingsFromRows(standard.rows),
      };
    }
    return standard;
  }

  const dviPath = path.join(generatedDir, `dvi-${normalizedCode.toLowerCase()}-pricing.json`);
  const dvi = readJson<DviPayload>(dviPath);
  if (!dvi?.rows || !Array.isArray(dvi.rows) || dvi.rows.length === 0) return null;
  return dviToGenerated(normalizedCode, dvi);
}
