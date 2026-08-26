import assert from "node:assert/strict";
import test from "node:test";
import {
  lowestPolycarbonateRow,
  priceForMode,
  selectSummaryPrice,
  usesPolycarbonatePriceBasis,
} from "../lib/pricing/polycarbonatePriceBasis.ts";
import type { PriceListPricingRow } from "../lib/pricing/types.ts";

function row(
  material: string,
  materialColor: string,
  edgedPrice: number,
  uncutPrice = edgedPrice - 8,
  overrides: Partial<PriceListPricingRow> = {}
): PriceListPricingRow {
  return {
    code: "G6",
    id: `${material}-${materialColor}-${edgedPrice}`,
    brand: "Standard Designs",
    designType: "Single Vision",
    designStyle: "SV",
    rawProductNames: [],
    sourceCodes: [],
    materialRaw: material === "Polycarbonate" ? "PLY" : "P",
    material,
    materialColor,
    colorRaw: ["CLR"],
    availableColors: ["Clear"],
    colorBrand: "Clear",
    edgedPrice,
    uncutDeduct: edgedPrice - uncutPrice,
    uncutPrice,
    recommended: false,
    outsourced: false,
    serviceNotes: [],
    duplicateSourceRows: 1,
    ...overrides,
  };
}

test("summary pricing ignores cheaper plastic and selects polycarbonate", () => {
  const rows = [row("Plastic", "Clear", 33), row("Polycarbonate", "Clear", 44)];
  const selected = lowestPolycarbonateRow(rows, "Clear", "edged");
  assert.equal(selected?.material, "Polycarbonate");
  assert.equal(priceForMode(selected, "edged"), 44);
});

test("polycarbonate selection respects edged and uncut modes", () => {
  const rows = [
    row("Polycarbonate", "Clear", 44, 40),
    row("Polycarbonate", "Clear", 46, 36),
  ];
  assert.equal(lowestPolycarbonateRow(rows, "Clear", "edged")?.edgedPrice, 44);
  assert.equal(lowestPolycarbonateRow(rows, "Clear", "uncut")?.uncutPrice, 36);
});

test("TOKAI summaries select 1.60 and carry the availability note", () => {
  const rows = [
    row("Plastic", "Clear", 89, 81, { brand: "Tokai", designStyle: "Bi-AS" }),
    row("Hi-Index 1.60", "Clear", 119, 111, {
      brand: "Tokai",
      designStyle: "Bi-AS",
      materialRaw: "H60",
    }),
    row("Hi-Index 1.67", "Clear", 149, 141, {
      brand: "Tokai",
      designStyle: "Bi-AS",
      materialRaw: "H67",
    }),
  ];
  const selected = selectSummaryPrice(rows, "Clear", "edged");
  assert.equal(selected.row?.material, "Hi-Index 1.60");
  assert.equal(selected.row?.edgedPrice, 119);
  assert.equal(selected.basisLabel, "Only available in 1.60 index and above");
  assert.equal(selected.basisShortLabel, "1.60 index+ only");
});

test("Executive Bifocal H56 is presented as its plastic-only price", () => {
  const selected = selectSummaryPrice(
    [
      row("Mid Index 1.56", "Clear", 128, 120, {
        designType: "Multifocal",
        designStyle: "Executive Bifocal",
        materialRaw: "H56",
      }),
    ],
    "Clear",
    "edged"
  );
  assert.equal(selected.row?.edgedPrice, 128);
  assert.equal(selected.basisLabel, "Plastic only");
});

test("non-poly summaries prefer plastic and distinguish mixed availability", () => {
  const selected = selectSummaryPrice(
    [row("Trivex", "Clear", 110), row("Plastic", "Clear", 120)],
    "Clear",
    "edged"
  );
  assert.equal(selected.row?.material, "Plastic");
  assert.equal(selected.row?.edgedPrice, 120);
  assert.equal(selected.basisLabel, "Plastic");
});

test("single-material fallbacks identify the only available material", () => {
  const selected = selectSummaryPrice(
    [row("Trivex", "Photochromic", 159)],
    "Photochromic",
    "edged"
  );
  assert.equal(selected.row?.material, "Trivex");
  assert.equal(selected.basisLabel, "Trivex only");
});

test("polycarbonate summary basis covers every audited customer price list", () => {
  for (const code of [
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
  ]) {
    assert.equal(usesPolycarbonatePriceBasis(code.toLowerCase()), true, code);
  }
  assert.equal(usesPolycarbonatePriceBasis("A5"), false);
});
