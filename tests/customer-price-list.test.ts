import assert from "node:assert/strict";
import test from "node:test";
import { customerFacingPriceList } from "../lib/pricing/customerPriceList.ts";
import { priceDisplayCategory } from "../lib/pricing/displayTaxonomy.ts";
import type {
  GeneratedPriceListData,
  PriceListPricingRow,
} from "../lib/pricing/types.ts";

function row(
  designStyle: string,
  overrides: Partial<PriceListPricingRow> = {}
): PriceListPricingRow {
  return {
    code: "G6",
    id: designStyle,
    brand: "Standard Designs",
    designType: "SV",
    designStyle,
    rawProductNames: [],
    sourceCodes: [],
    materialRaw: "PLY",
    material: "Polycarbonate",
    materialColor: "Clear",
    colorRaw: ["CLR"],
    availableColors: ["Clear"],
    colorBrand: "Clear",
    edgedPrice: 44,
    uncutDeduct: 8,
    uncutPrice: 36,
    recommended: false,
    outsourced: false,
    serviceNotes: [],
    duplicateSourceRows: 1,
    ...overrides,
  };
}

function priceList(rows: PriceListPricingRow[]): GeneratedPriceListData {
  return {
    code: "G6",
    rows,
    arCoatings: [
      { code: "ARC", name: "ARC", brandFamily: "Artisan AR Coatings", price: 30, recommended: false, outsourced: false },
      { code: "QRB", name: "Retinal Bliss", brandFamily: "Artisan AR Coatings", price: 88, recommended: false, outsourced: false },
      { code: "SPU", name: "Sentinel Plus UV", brandFamily: "Artisan AR Coatings", price: 66, recommended: false, outsourced: false },
      { code: "UEU", name: "Unity Elite UV", brandFamily: "TechShield AR Coatings", price: 77, recommended: false, outsourced: false },
      { code: "AEM", name: "Emerald", brandFamily: "Artisan AR Coatings", price: 68, recommended: false, outsourced: false },
      { code: "TSE", name: "Techshield Elite", brandFamily: "Techshield AR Coatings", price: 88, recommended: false, outsourced: false },
    ],
    materialAddOns: [],
    addOnSections: [],
    report: {
      sourceFiles: [],
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

test("customer pricing applies durable design, availability, and status rules", () => {
  const result = customerFacingPriceList(
    priceList([
      row("Digital SV", { brand: "SD", designType: "Digital SV" }),
      row("Gold Series", { brand: "Artisan", designType: "Digital SV" }),
      row("TACT", { brand: "TACT", designType: "SV" }),
      row("Eyezen Start", { brand: "Varilux", materialRaw: "BLY", material: "Polycarbonate" }),
      row("Eyezen Start", { brand: "Varilux", materialRaw: "PLY" }),
      row("Eyezen Start", { brand: "Varilux", materialRaw: "TPY", materialColor: "Photochromic", colorRaw: ["TGY"] }),
      row("Eyezen Start", { brand: "Varilux", materialRaw: "PRY", materialColor: "Polarized", colorRaw: ["G15"] }),
      row("Eyezen Start", { brand: "Varilux", materialRaw: "SPY", materialColor: "Photochromic", colorRaw: ["SYG"] }),
      row("Eyezen Kids", { brand: "Varilux" }),
      row("SD*", { brand: "Artisan", designType: "Enhanced SV" }),
      row("SUN INTL SV", { brand: "SUN" }),
      row("XR Track", { brand: "VX", rawProductNames: ["VX XR TRACK TE"] }),
      row("X Design", { brand: "Varilux", designType: "Progressive" }),
      row("X Design 4D", { brand: "Varilux", designType: "Progressive" }),
      row("X Fit", { brand: "Varilux", designType: "Progressive" }),
      row("Bi-AS", { brand: "Tokai", designType: "SV", materialRaw: "H60", material: "Hi-Index 1.60" }),
      row("Physio W3+", { brand: "Varilux", designType: "Progressive" }),
    ])
  );

  const digital = result.rows.find((entry) => entry.designStyle === "SD Digital");
  assert.equal(digital?.brand, "Artisan");
  assert.equal(digital?.designType, "Enhanced SV");
  assert.equal(result.rows.find((entry) => entry.designStyle === "Gold Series")?.designType, "Progressive");
  assert.equal(result.rows.find((entry) => entry.designStyle === "Tact")?.brand, "Hoya");
  const eyezen = result.rows.filter((entry) => entry.designStyle === "Eyezen Start");
  assert.equal(eyezen.length, 3);
  assert.equal(eyezen.every((entry) => entry.brand === "Essilor"), true);
  assert.equal(eyezen.every((entry) => entry.designType === "Enhanced SV"), true);
  assert.deepEqual(eyezen.map((entry) => entry.materialRaw), ["BLY", "TPY", "PRY"]);
  assert.equal(result.rows.some((entry) => /^(?:Eyezen Kids|SD\*|SUN INTL|XR Track)/i.test(entry.designStyle)), false);
  assert.equal(result.rows.find((entry) => entry.designStyle === "X Design")?.outsourced, false);
  assert.equal(result.rows.find((entry) => entry.designStyle === "X Design 4D")?.outsourced, true);
  assert.equal(result.rows.find((entry) => entry.designStyle === "X Fit")?.outsourced, true);
  assert.equal(result.rows.find((entry) => entry.brand === "Tokai")?.outsourced, true);
  assert.equal(
    result.rows.find((entry) => entry.designStyle === "Physio W3+")?.serviceNotes.some((note) => /phasing out/i.test(note)),
    true
  );
});

test("customer pricing removes retired AR and labels TechShield as VSP", () => {
  const result = customerFacingPriceList(priceList([row("SV")]));
  assert.deepEqual(result.arCoatings.map((entry) => entry.code), ["AEM", "TSE"]);
  assert.equal(result.arCoatings[1].brandFamily, "TechShield by VSP AR Coatings");
});

test("standard SV contains only SV and aspheric SV designs", () => {
  assert.equal(priceDisplayCategory(row("SV")), "Standard SV");
  assert.equal(priceDisplayCategory(row("Aspheric SV")), "Standard SV");
  assert.equal(priceDisplayCategory(row("SV Aspheric")), "Standard SV");
  assert.equal(priceDisplayCategory(row("InMotion SV")), "Enhanced SV");
  assert.equal(priceDisplayCategory(row("SD Digital")), "Enhanced SV");
});

test("customer pricing removes unavailable S-material Photo rows from named designs", () => {
  const result = customerFacingPriceList(
    priceList([
      row("Camber Pure", { designType: "Progressive", materialRaw: "SPY", materialColor: "Photochromic" }),
      row("Camber Pure", { designType: "Progressive", materialRaw: "TPY", materialColor: "Photochromic" }),
      row("Camber Steady Plus", { designType: "Progressive", materialRaw: "S60", materialColor: "Photochromic" }),
      row("Diamond Series", { designType: "Progressive", materialRaw: "S50", materialColor: "Photochromic" }),
      row("Diamond Series", { designType: "Progressive", materialRaw: "PLY", materialColor: "Clear" }),
    ])
  );

  assert.deepEqual(
    result.rows.map((entry) => `${entry.designStyle}:${entry.materialRaw}`),
    ["Camber Pure:TPY", "Diamond Series:PLY"]
  );
});
