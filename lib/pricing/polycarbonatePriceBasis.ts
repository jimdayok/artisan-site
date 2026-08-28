import type { PriceListPricingRow } from "@/lib/pricing/types";

export type PriceMode = "edged" | "uncut";
export type PriceMaterialGroup =
  | "Clear"
  | "Photochromic"
  | "Transitions"
  | "Polarized";

export type SummaryPriceSelection = {
  row?: PriceListPricingRow;
  basisLabel?: string;
  basisShortLabel?: string;
};

const POLYCARBONATE_BASIS_PRICE_LIST_CODES = new Set([
  "A6",
  "B5",
  "E5",
  "E6",
  "G6",
  "J1",
  "J2",
  "P6",
  "S5",
  "VD",
  "VX",
]);

export function usesPolycarbonatePriceBasis(code: string) {
  return POLYCARBONATE_BASIS_PRICE_LIST_CODES.has(code.trim().toUpperCase());
}

export function priceForMode(
  row: PriceListPricingRow | undefined,
  mode: PriceMode
) {
  if (!row) return Number.POSITIVE_INFINITY;
  return mode === "uncut" ? row.uncutPrice : row.edgedPrice;
}

export function isPolycarbonatePricingRow(row: PriceListPricingRow) {
  return row.material.trim().toUpperCase() === "POLYCARBONATE";
}

function lowestPositiveRow(
  rows: PriceListPricingRow[],
  materialGroup: PriceMaterialGroup,
  mode: PriceMode,
  predicate: (row: PriceListPricingRow) => boolean = () => true
) {
  return rows
    .filter(
      (row) =>
        rowMatchesMaterialGroup(row, materialGroup) &&
        predicate(row) &&
        priceForMode(row, mode) > 0
    )
    .sort((a, b) => priceForMode(a, mode) - priceForMode(b, mode))[0];
}

const TRANSITIONS_COLOR_CODES = new Set([
  "TGY",
  "TBN",
  "TGN",
  "X2G",
  "X2B",
]);

export function isTransitionsPricingRow(row: PriceListPricingRow) {
  const materialCode = row.materialRaw.trim().toUpperCase();
  return (
    row.materialColor === "Photochromic" &&
    (materialCode.startsWith("T") ||
      row.colorRaw.some((code) => TRANSITIONS_COLOR_CODES.has(code.trim().toUpperCase())))
  );
}

export function rowMatchesMaterialGroup(
  row: PriceListPricingRow,
  materialGroup: PriceMaterialGroup
) {
  if (materialGroup === "Transitions") return isTransitionsPricingRow(row);
  if (materialGroup === "Photochromic") {
    return (
      row.materialColor === "Photochromic" &&
      row.materialRaw.trim().toUpperCase().startsWith("S") &&
      !isTransitionsPricingRow(row)
    );
  }
  return row.materialColor === materialGroup;
}

export function lowestPolycarbonateRow(
  rows: PriceListPricingRow[],
  materialGroup: PriceMaterialGroup,
  mode: PriceMode
) {
  return lowestPositiveRow(rows, materialGroup, mode, isPolycarbonatePricingRow);
}

function isTokaiProduct(rows: PriceListPricingRow[]) {
  return rows.some((row) => {
    const source = [row.brand, row.designStyle, ...row.rawProductNames].join(" ");
    return /\bTOKAI\b/i.test(source);
  });
}

function isEyezenProduct(rows: PriceListPricingRow[]) {
  return rows.some((row) => /^Eyezen(?: Start|\+)$/i.test(row.designStyle.trim()));
}

function isBlueFilterPolycarbonateRow(row: PriceListPricingRow) {
  return (
    row.materialRaw.trim().toUpperCase() === "BLY" &&
    isPolycarbonatePricingRow(row)
  );
}

function isOneSixtyRow(row: PriceListPricingRow) {
  return /\b1\.60\b/.test(row.material);
}

function isPlasticSummaryRow(row: PriceListPricingRow) {
  if (row.material.trim().toUpperCase() === "PLASTIC") return true;

  // The source system identifies Executive Bifocal as H56 / Mid Index 1.56,
  // while the customer-facing material availability is plastic only.
  return (
    row.designStyle.trim().toUpperCase() === "EXECUTIVE BIFOCAL" &&
    (row.materialRaw.trim().toUpperCase() === "H56" ||
      row.material.trim().toUpperCase() === "MID INDEX 1.56")
  );
}

function summaryMaterialLabel(row: PriceListPricingRow) {
  if (isPlasticSummaryRow(row)) return "Plastic";
  return row.material.trim() || "Available material";
}

export function selectSummaryPrice(
  rows: PriceListPricingRow[],
  materialGroup: PriceMaterialGroup,
  mode: PriceMode
): SummaryPriceSelection {
  if (!usesPolycarbonatePriceBasis(rows[0]?.code ?? "")) {
    return { row: lowestPositiveRow(rows, materialGroup, mode) };
  }

  if (isTokaiProduct(rows)) {
    return {
      row: lowestPositiveRow(rows, materialGroup, mode, isOneSixtyRow),
      basisLabel: "Hi Index 1.60",
      basisShortLabel: "Hi Index 1.60",
    };
  }

  if (isEyezenProduct(rows) && materialGroup === "Clear") {
    const blueFilterPolycarbonate = lowestPositiveRow(
      rows,
      materialGroup,
      mode,
      isBlueFilterPolycarbonateRow
    );
    if (blueFilterPolycarbonate) {
      return {
        row: blueFilterPolycarbonate,
        basisLabel: "Blue Filter Polycarbonate",
        basisShortLabel: "Blue Filter Polycarbonate",
      };
    }
  }

  const polycarbonate = lowestPolycarbonateRow(rows, materialGroup, mode);
  if (polycarbonate) {
    return {
      row: polycarbonate,
      basisLabel: "Polycarbonate",
      basisShortLabel: "Polycarbonate",
    };
  }

  const categoryRows = rows.filter(
    (row) => rowMatchesMaterialGroup(row, materialGroup) && priceForMode(row, mode) > 0
  );
  const plastic = lowestPositiveRow(
    rows,
    materialGroup,
    mode,
    isPlasticSummaryRow
  );
  const selected = plastic ?? lowestPositiveRow(rows, materialGroup, mode);
  if (!selected) return {};

  const materialLabel = summaryMaterialLabel(selected);
  const availableMaterials = new Set(categoryRows.map(summaryMaterialLabel));
  const only = availableMaterials.size === 1;

  return {
    row: selected,
    basisLabel: `${materialLabel}${only ? " only" : ""}`,
    basisShortLabel: `${materialLabel}${only ? " only" : ""}`,
  };
}
