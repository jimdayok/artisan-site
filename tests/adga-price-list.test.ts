import assert from "node:assert/strict";
import test from "node:test";
import {
  ADGA_J1_STANDARD_AR_PRICE,
  ADGA_TRANSITIONS_UPCHARGE,
  buildOfficialAdgaPriceList,
} from "../lib/pricing/adgaPriceList.ts";
import type {
  GeneratedPriceListData,
  PriceListArCoating,
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
    id: `${code}-${designStyle}-${edgedPrice}`,
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
    edgedPrice,
    uncutDeduct: 6,
    uncutPrice: edgedPrice - 6,
    recommended: false,
    outsourced: false,
    serviceNotes: [],
    duplicateSourceRows: 1,
    ...overrides,
  };
}

function coating(code: string, name: string, brandFamily: string, price: number): PriceListArCoating {
  return {
    code,
    name,
    brandFamily,
    price,
    sourceSchedule: "test",
    notes: "",
    recommended: false,
    outsourced: false,
  };
}

function priceList(
  code: string,
  rows: PriceListPricingRow[],
  arCoatings: PriceListArCoating[] = []
): GeneratedPriceListData {
  return {
    code,
    rows,
    arCoatings,
    materialAddOns: [],
    addOnSections: [
      { title: "Photochromic and Transitions Upcharges", items: [] },
    ],
    report: {
      sourceFiles: [`${code}.xml`],
      rowCount: rows.length,
      rawSourceRowsProcessed: rows.length,
      rowsExcludedMissingLookup: 0,
      displayRowCount: rows.length,
      generatedAt: "2026-09-02T00:00:00.000Z",
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

test("J1 adds the official Standard AR rows and leaves Aspheric SV unavailable", () => {
  const source = priceList(
    "J1",
    [
      row("J1", "SV", 15),
      row("J1", "SV", 45, {
        materialRaw: "TPY",
        materialColor: "Photochromic",
        colorRaw: ["TGY", "TBN"],
        colorBrand: "Transitions",
      }),
    ],
    [coating("AST", "Standard", "Artisan Coatings", 22.91)]
  );

  const result = buildOfficialAdgaPriceList({ source, guide: "J1" });
  const enhancedRows = result.rows.filter((entry) => entry.designStyle === "SV with Standard AR");
  const enhancedClear = enhancedRows.find((entry) => entry.materialRaw === "PLY");
  const enhancedTransitions = enhancedRows.find((entry) => entry.colorBrand === "Transitions");
  const unavailable = result.rows.find(
    (entry) => entry.designStyle === "Aspheric SV with Standard AR"
  );

  assert.equal(enhancedClear?.edgedPrice, 40);
  assert.equal(enhancedTransitions?.edgedPrice, 90);
  assert.equal(unavailable?.edgedPrice, 0);
  assert.equal(unavailable?.material, "Unavailable");
  assert.match(unavailable?.serviceNotes.join(" ") ?? "", /no J1 Aspheric SV base price/i);
  assert.equal(result.arCoatings.find((entry) => entry.code === "AST")?.price, ADGA_J1_STANDARD_AR_PRICE);
  assert.equal(result.code, "J1");
  assert.deepEqual(result.sourceCodesMerged, ["J1"]);
});

test("official J1 and J2 show only Transitions at a $50 upcharge", () => {
  for (const guide of ["J1", "J2"] as const) {
    const source = priceList(guide, [
      row(guide, "SV", guide === "J1" ? 15 : 28.13),
      row(guide, "SV", 99, {
        materialRaw: "TPY",
        materialColor: "Photochromic",
        colorRaw: ["TGY", "TBN", "X2G"],
        colorBrand: "Transitions",
      }),
      row(guide, "SV", 75, {
        materialRaw: "SPY",
        materialColor: "Photochromic",
        colorRaw: ["NCG"],
        colorBrand: "Neochromes",
      }),
    ]);
    const result = buildOfficialAdgaPriceList({ source, guide });
    const clear = result.rows.find((entry) => entry.designStyle === "SV" && entry.materialRaw === "PLY");
    const transitions = result.rows.find(
      (entry) => entry.designStyle === "SV" && entry.colorBrand === "Transitions"
    );
    assert.equal(transitions?.edgedPrice, (clear?.edgedPrice ?? 0) + ADGA_TRANSITIONS_UPCHARGE);
    assert.equal(result.rows.some((entry) => /Neochromes/i.test(entry.colorBrand)), false);
    assert.equal(result.addOnSections.some((section) => /Photochromic/i.test(section.title)), false);
    assert.equal(result.addOnSections.find((section) => section.title === "Transitions")?.items[0]?.price, "$50.00 upcharge");
  }
});

test("J2 uses AEM at $50 and excludes Standard, Shamir, Hoya, and Crizal AR coatings", () => {
  const source = priceList(
    "J2",
    [
      row("J2", "Autograph Intelligence", 267.99, { brand: "Shamir", designType: "Progressive" }),
      row("J2", "iD MyStyle 2", 228.4, { brand: "Hoya", designType: "Progressive" }),
    ],
    [
      coating("AEM", "Artisan Emerald", "Artisan Coatings", 53.13),
      coating("AST", "Artisan Standard", "Artisan Coatings", 22.91),
      coating("EXP", "Super HiVision EX3+", "Hoya", 60),
      coating("SHM", "Glacier", "Shamir", 70),
      coating("CRI", "Sapphire", "Crizal", 80),
      coating("AAR", "Artisan Armour", "Artisan Coatings", 65),
    ]
  );

  const result = buildOfficialAdgaPriceList({ source, guide: "J2" });
  assert.equal(result.arCoatings.find((entry) => entry.code === "AEM")?.price, 50);
  assert.equal(
    result.arCoatings.some((entry) => /\b(?:AST|Shamir|Hoya|Crizal)\b/i.test(`${entry.code} ${entry.brandFamily} ${entry.name}`)),
    false
  );
  assert.equal(result.arCoatings.some((entry) => entry.code === "AAR"), true);
  assert.equal(result.rows.some((entry) => entry.brand === "Shamir"), true);
  assert.equal(result.rows.some((entry) => entry.brand === "Hoya"), true);
});
