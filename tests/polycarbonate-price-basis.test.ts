import assert from "node:assert/strict";
import test from "node:test";
import {
  lowestPolycarbonateRow,
  priceForMode,
  selectSummaryPrice,
  usesPolycarbonatePriceBasis,
} from "../lib/pricing/polycarbonatePriceBasis.ts";
import type { PriceListPricingRow } from "../lib/pricing/types.ts";
import {
  CHEMISTRIE_CLIPS_SECTION_TITLE,
  chemistrieClipItems,
} from "../lib/pricing/chemistrieClips.ts";

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

test("every price list uses the complete Chemistrie Clips add-on catalog", () => {
  assert.equal(CHEMISTRIE_CLIPS_SECTION_TITLE, "Chemistrie Clips");
  assert.deepEqual(
    chemistrieClipItems.map(({ name, price }) => [name, price]),
    [
      ["ChemClip Solid Sunlens", 85.5],
      ["ChemClip Drive", 117],
      ["ChemClip Solid Sunlens with Backside AR", 88.5],
      ["ChemClip Gradient Sunlens with Backside AR", 90.5],
      ["ChemClip Mirror Sunlens", 92.5],
      ["ChemClip Color", 119],
      ["ChemClip Readers Blue", 97],
      ["ChemClip Therapeutic", 132],
      ["ChemClip Avulux", 335],
      ["Swarovski Crystal add on", 20.5],
    ]
  );
});

test("polycarbonate selection respects edged and uncut modes", () => {
  const rows = [
    row("Polycarbonate", "Clear", 44, 40),
    row("Polycarbonate", "Clear", 46, 36),
  ];
  assert.equal(lowestPolycarbonateRow(rows, "Clear", "edged")?.edgedPrice, 44);
  assert.equal(lowestPolycarbonateRow(rows, "Clear", "uncut")?.uncutPrice, 36);
});

test("TOKAI summaries select and label Hi Index 1.60", () => {
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
  assert.equal(selected.basisLabel, "Hi Index 1.60");
  assert.equal(selected.basisShortLabel, "Hi Index 1.60");
});

test("Eyezen clear summaries identify the blue-filter polycarbonate basis", () => {
  const selected = selectSummaryPrice(
    [
      row("Plastic", "Clear", 87, 79, {
        brand: "Essilor",
        designStyle: "Eyezen+",
        materialRaw: "B50",
      }),
      row("Polycarbonate", "Clear", 95, 87, {
        brand: "Essilor",
        designStyle: "Eyezen+",
        materialRaw: "BLY",
      }),
    ],
    "Clear",
    "edged"
  );

  assert.equal(selected.row?.materialRaw, "BLY");
  assert.equal(selected.basisLabel, "Blue Filter Polycarbonate");
  assert.equal(selected.basisShortLabel, "Blue Filter Polycarbonate");
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
    [row("Trivex", "Photochromic", 159, 151, { materialRaw: "S53" })],
    "Photochromic",
    "edged"
  );
  assert.equal(selected.row?.material, "Trivex");
  assert.equal(selected.basisLabel, "Trivex only");
});

test("Photo and Trans/Xtra summaries use separate material families", () => {
  const rows = [
    row("Polycarbonate", "Photochromic", 93, 85, {
      materialRaw: "SPY",
      colorRaw: ["NCG"],
      colorBrand: "Neochromes",
    }),
    row("Polycarbonate", "Photochromic", 122, 114, {
      materialRaw: "TPY",
      colorRaw: ["TGY", "X2G"],
      colorBrand: "Transitions",
    }),
  ];

  assert.equal(selectSummaryPrice(rows, "Photochromic", "edged").row?.edgedPrice, 93);
  assert.equal(selectSummaryPrice(rows, "Transitions", "edged").row?.edgedPrice, 122);
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
