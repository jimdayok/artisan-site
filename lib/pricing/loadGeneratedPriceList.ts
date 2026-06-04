import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import ExcelJS from "exceljs";
import type { GeneratedPriceListData, PriceListAddOnSection, PriceListArCoating } from "@/lib/pricing/types";

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

function readJson<T>(filePath: string): T | undefined {
  if (!existsSync(filePath)) return undefined;
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
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
  const normalized = code.trim().toUpperCase();
  if (normalized === "G5") return "G6";
  if (normalized === "P5") return "P6";
  if (normalized === "A5") return "A6";
  return normalized;
}

function normalizeDesignStyleName(value: string) {
  return String(value || "")
    .replace(/[™®]/g, "")
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

type LookupMaps = {
  productByDvi: Map<string, { name: string; designType: string; brand: string }>;
  materialByDvi: Map<string, string>;
  arByCode: Map<string, { name: string; brand: string }>;
};

let lookupMapsPromise: Promise<LookupMaps> | null = null;

async function readFirstWorksheetRows(filePath: string) {
  if (!existsSync(filePath)) return [] as string[][];
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [] as string[][];
  const rows: string[][] = [];
  worksheet.eachRow((row) => {
    const values = Array.isArray(row.values) ? row.values.slice(1) : [];
    rows.push(values.map((value) => String(value ?? "").trim()));
  });
  return rows;
}

async function loadLookupMaps(): Promise<LookupMaps> {
  if (lookupMapsPromise) return lookupMapsPromise;
  lookupMapsPromise = (async () => {
    const root = process.cwd();
    const docsDir = path.join(root, "private-source", "portal", "lookup_docs");
    const lookupRows = await readFirstWorksheetRows(path.join(docsDir, "Lookup.xlsx"));
    const materialRows = await readFirstWorksheetRows(path.join(docsDir, "Lookup_Mat.xlsx"));
    const arRows = await readFirstWorksheetRows(path.join(docsDir, "Lookup_AR.xlsx"));

    const productByDvi = new Map<string, { name: string; designType: string; brand: string }>();
    for (const row of lookupRows.slice(1)) {
      const dvi = normalizeLookupKey(row[0] || "");
      const name = (row[1] || "").trim();
      if (!dvi || !name) continue;
      productByDvi.set(dvi, {
        name,
        designType: (row[3] || "").trim(),
        brand: (row[5] || "").trim(),
      });
    }

    const materialByDvi = new Map<string, string>();
    for (const row of materialRows.slice(1)) {
      const dvi = normalizeLookupKey(row[0] || "");
      const name = (row[1] || "").trim();
      if (!dvi || !name) continue;
      materialByDvi.set(dvi, name);
    }

    const arByCode = new Map<string, { name: string; brand: string }>();
    for (const row of arRows.slice(1)) {
      const dviCode = normalizeLookupKey(row[0] || "");
      const name = (row[1] || "").trim();
      const brand = (row[2] || "").trim();
      if (!dviCode || !name) continue;
      arByCode.set(dviCode, { name, brand });
    }

    // Authoritative ALN overrides.
    arByCode.set("MMI", { name: "Mirror Matched", brand: "Mirror Treatments" });
    arByCode.set("GMR", { name: "Gradient Mirror", brand: "Mirror Treatments" });
    arByCode.set("DDE", { name: "Diamond Defense", brand: "Protection Options" });

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
  }>
) {
  const arMap = new Map<string, PriceListArCoating>();
  for (const row of rows) {
    for (const coating of row.coatingOptions ?? []) {
      if (coating.unresolved) continue;
      if (!coating.code) continue;
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
  }
  return [...arMap.values()].sort(
    (a, b) =>
      a.brandFamily.localeCompare(b.brandFamily) ||
      a.name.localeCompare(b.name) ||
      (a.code || "").localeCompare(b.code || "")
  );
}

async function dviToGenerated(code: string, rows: DviRow[]): Promise<GeneratedPriceListData> {
  const lookups = await loadLookupMaps();
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

    const mappedMaterial =
      lookups.materialByDvi.get(normalizeLookupKey(row.materialCode || "")) ||
      row.materialLensType ||
      row.materialCode;

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
      materialColor: color === "CLEAR" ? "Clear" : "Photochromic",
      colorRaw: [color],
      availableColors: [color],
      colorBrand: color,
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

  const arCoatings = deriveArCoatingsFromRows(pricingRows);

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
  if (normalizedPayload?.rows && Array.isArray(normalizedPayload.rows)) {
    return normalizedPayload;
  }
  const standardPath = path.join(generatedDir, `${normalizedCode.toLowerCase()}-pricing.json`);
  const standard = readJson<GeneratedPriceListData>(standardPath);
  if (standard?.rows && Array.isArray(standard.rows)) {
    if (!Array.isArray(standard.arCoatings) || standard.arCoatings.length === 0) {
      return {
        ...standard,
        arCoatings: deriveArCoatingsFromRows(standard.rows),
      };
    }
    return standard;
  }

  const dviPath = path.join(generatedDir, `dvi-${normalizedCode.toLowerCase()}-pricing.json`);
  const dvi = readJson<{ rows?: DviRow[] }>(dviPath);
  if (!dvi?.rows || !Array.isArray(dvi.rows)) return null;
  return dviToGenerated(normalizedCode, dvi.rows);
}
