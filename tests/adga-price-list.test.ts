import assert from "node:assert/strict";
import test from "node:test";
import { buildAdgaPreferredPriceList } from "../lib/pricing/adgaPriceList.ts";
import type {
  GeneratedPriceListData,
  PriceListPricingRow,
} from "../lib/pricing/types.ts";

function row(
  code: string,
  designStyle: string,
  edgedPrice: number,
  overrides: Partial<PriceListPricingRow> = {}
): PriceListPricingRow {
  return {
    code,
    id: `${code}-${designStyle}`,
    brand: "Standard Designs",
    designType: "Progressive",
    designStyle,
    rawProductNames: [],
    sourceCodes: [],
    materialRaw: "PLY",
    material: "Polycarbonate",
    materialColor: "Clear",
    colorRaw: ["CLR"],
    availableColors: ["Clear"],
    colorBrand: "Clear",
    edgedPrice,
    uncutDeduct: 8,
    uncutPrice: edgedPrice - 8,
    recommended: false,
    outsourced: false,
    serviceNotes: [],
    duplicateSourceRows: 1,
    ...overrides,
  };
}

function priceList(code: string, rows: PriceListPricingRow[]): GeneratedPriceListData {
  return {
    code,
    rows,
    arCoatings: [],
    materialAddOns: [],
    addOnSections: [],
    report: {
      sourceFiles: [`${code}.xml`],
      rowCount: rows.length,
      rawSourceRowsProcessed: rows.length,
      rowsExcludedMissingLookup: 0,
      displayRowCount: rows.length,
      generatedAt: "2026-08-28T00:00:00.000Z",
      rawColumns: [],
      mappedColumns: [],
      ignoredColumns: [],
      unmappedProducts: [],
      unmappedMaterials: [],
      unmappedColors: [],
      duplicatePriceConflictCount: 0,
      duplicatePriceConflicts: [],
      colorVariantsCollapsedCount: 0,
      assumptions: [],
    },
  };
}

test("ADG&A combines J1, then J2, then A6 fallback without duplicate designs", () => {
  const combined = buildAdgaPreferredPriceList({
    j1: priceList("J1", [
      row("J1", "SV", 45, { brand: "Standard Designs", designType: "SV" }),
    ]),
    j2: priceList("J2", [
      row("J2", "SV", 81.9, { brand: "Standard Designs", designType: "SV" }),
      row("J2", "Autograph Intelligence", 267.99, { brand: "Shamir" }),
      row("J2", "iD MyStyle 2", 228.4, { brand: "Hoya" }),
      row("J2", "Gold Series", 128, { brand: "Artisan", designType: "Digital SV" }),
      row("J2", "Platinum Series", 148, { brand: "Artisan", designType: "Digital SV" }),
      row("J2", "InMotion SV", 121.88, { brand: "Artisan", designType: "SV" }),
    ]),
    a6: priceList("A6", [
      row("A6", "Autograph Intelligence", 356, { brand: "Shamir" }),
      row("A6", "Genesis HD", 201, { brand: "Shamir" }),
      row("A6", "iD MyStyle 3", 315, { brand: "Hoya" }),
    ]),
  });

  const byStyle = new Map(combined.rows.map((entry) => [entry.designStyle, entry]));
  assert.equal(byStyle.get("SV")?.priceGuideCode, "J1");
  assert.equal(byStyle.get("SV")?.edgedPrice, 45);
  assert.equal(byStyle.get("Autograph Intelligence")?.priceGuideCode, "J2");
  assert.equal(byStyle.get("Autograph Intelligence")?.edgedPrice, 267.99);
  assert.equal(byStyle.get("iD MyStyle 2")?.priceGuideCode, "J2");
  assert.equal(byStyle.get("Genesis HD")?.priceGuideCode, "A6");
  assert.equal(byStyle.get("iD MyStyle 3")?.priceGuideCode, "A6");
  assert.equal(byStyle.get("Gold Series")?.designType, "Progressive");
  assert.equal(byStyle.get("Platinum Series")?.designType, "Progressive");
  assert.equal(byStyle.get("InMotion SV")?.designType, "Progressive");
  assert.deepEqual(
    [...new Set(combined.rows.map((entry) => entry.priceGuideCode))],
    ["J1", "J2", "A6"]
  );
});
