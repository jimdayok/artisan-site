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
    const mappedMaterial =
      materialLookup?.name ||
      row.materialLensType ||
      row.materialCode;
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

  const addOnSections: PriceListAddOnSection[] = [
    {
      title: "Program Notes",
      items: [
        {
          name: "DVI-driven pricing",
          price: "Generated from current DVI XML source",
        },
      ],
    },
  ];

  return {
    code,
    rows: pricingRows,
    arCoatings,
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
