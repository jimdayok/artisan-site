import type { PriceListPricingRow } from "@/lib/pricing/types";

export type PriceMode = "edged" | "uncut";
export type PriceMaterialGroup = "Clear" | "Photochromic" | "Polarized";

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

export function lowestPolycarbonateRow(
  rows: PriceListPricingRow[],
  materialGroup: PriceMaterialGroup,
  mode: PriceMode
) {
  return rows
    .filter(
      (row) =>
        row.materialColor === materialGroup &&
        isPolycarbonatePricingRow(row) &&
        priceForMode(row, mode) > 0
    )
    .sort((a, b) => priceForMode(a, mode) - priceForMode(b, mode))[0];
}
