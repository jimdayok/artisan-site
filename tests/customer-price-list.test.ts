import assert from "node:assert/strict";
import test from "node:test";
import { customerFacingPriceList } from "../lib/pricing/customerPriceList.ts";
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
      row("Eyezen Start", { brand: "Varilux", materialRaw: "B60", material: "Hi-Index 1.60" }),
      row("Eyezen Start", { brand: "Varilux", materialRaw: "PLY" }),
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
  assert.equal(result.rows.filter((entry) => entry.designStyle === "Eyezen Start").length, 1);
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
