import assert from "node:assert/strict";
import test from "node:test";
import {
  lowestPolycarbonateRow,
  priceForMode,
  usesPolycarbonatePriceBasis,
} from "../lib/pricing/polycarbonatePriceBasis.ts";
import type { PriceListPricingRow } from "../lib/pricing/types.ts";

function row(
  material: string,
  materialColor: string,
  edgedPrice: number,
  uncutPrice = edgedPrice - 8
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
