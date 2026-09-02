import { customerFacingPriceList } from "./customerPriceList.ts";
import type {
  GeneratedPriceListData,
  PriceListArCoating,
  PriceListPricingRow,
} from "./types.ts";

export const ADGA_GUIDE_ORDER = ["J1", "J2", "A6"] as const;
export type AdgaGuideCode = (typeof ADGA_GUIDE_ORDER)[number];
export type OfficialAdgaGuideCode = Extract<AdgaGuideCode, "J1" | "J2">;
export const ADGA_TRANSITIONS_UPCHARGE = 50;
export const ADGA_J1_STANDARD_AR_PRICE = 25;

export const ADGA_PHOTO_PRICING_NOTE =
  "Transitions is the only photochromic option shown and is a $50.00 upcharge from the displayed clear price.";

function normalizeKey(value: string) {
  return String(value ?? "")
    .toUpperCase()
    .replace(/[™®*]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function designKey(row: PriceListPricingRow) {
  return `${normalizeKey(row.brand)}|${normalizeKey(row.designStyle)}`;
}

function normalizeAdgaDesign(row: PriceListPricingRow) {
  return /^(?:Gold Series|Platinum Series|InMotion SV)$/i.test(row.designStyle)
    ? { ...row, brand: "Artisan", designType: "Progressive" }
    : row;
}

function isStandardTransitionsRow(row: PriceListPricingRow) {
  return (
    /^TPY$/i.test(row.materialRaw) &&
    /TRANSITIONS/i.test(row.colorBrand) &&
    row.colorRaw.some((code) => /^(?:TGY|TBN)$/i.test(code))
  );
}

function isPhotoOptionRow(row: PriceListPricingRow) {
  return /^Photochromic$/i.test(row.materialColor);
}

function isPolarizedPhotoRow(row: PriceListPricingRow) {
  const source = `${row.colorBrand} ${row.colorRaw.join(" ")} ${row.availableColors.join(" ")}`;
  return /POLAR|DRIVEWEAR/i.test(source);
}

function addNote(notes: string[], note: string) {
  return notes.some((value) => value.toLowerCase() === note.toLowerCase())
    ? notes
    : [...notes, note];
}

function polyClearBaseline(rows: PriceListPricingRow[]) {
  return rows
    .filter(
      (row) =>
        /^PLY$/i.test(row.materialRaw) &&
        /^Clear$/i.test(row.materialColor) &&
        row.colorRaw.some((code) => /^CLR$/i.test(code))
    )
    .sort((a, b) => a.edgedPrice - b.edgedPrice)[0];
}

function normalizeAdgaTransitionsPricing(
  rows: PriceListPricingRow[],
  guide: OfficialAdgaGuideCode
) {
  const groups = new Map<string, PriceListPricingRow[]>();
  for (const row of rows) {
    const key = `${row.priceGuideCode ?? ""}|${normalizeKey(row.brand)}|${normalizeKey(row.designStyle)}`;
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }

  return [...groups.values()].flatMap((designRows) => {
    const clear = polyClearBaseline(designRows);
    const transitionsSource = designRows.find(isStandardTransitionsRow);
    const retainedRows = designRows.filter(
      (row) => !isPhotoOptionRow(row) || isPolarizedPhotoRow(row)
    );
    if (!clear || !transitionsSource) return retainedRows;

    return [
      ...retainedRows,
      {
        ...transitionsSource,
        code: guide,
        priceGuideCode: guide,
        id: `${transitionsSource.id}-adga-transitions`,
        materialColor: "Photochromic",
        colorBrand: "Transitions",
        colorRaw: transitionsSource.colorRaw.filter((code) => /^(?:TGY|TBN)$/i.test(code)),
        availableColors: ["Brown", "Gray"],
        edgedPrice: Number((clear.edgedPrice + ADGA_TRANSITIONS_UPCHARGE).toFixed(2)),
        uncutPrice: Number((clear.uncutPrice + ADGA_TRANSITIONS_UPCHARGE).toFixed(2)),
        serviceNotes: addNote(
          transitionsSource.serviceNotes,
          `Transitions is a $${ADGA_TRANSITIONS_UPCHARGE.toFixed(2)} upcharge from clear.`
        ),
      },
    ];
  });
}

function withEmeraldPrice(coatings: PriceListArCoating[]) {
  return coatings.map((coating) =>
    String(coating.code ?? "").toUpperCase() === "AEM" ||
    /^Artisan Emerald$/i.test(coating.name)
      ? {
          ...coating,
          code: "AEM",
          name: "Artisan Emerald",
          price: 50,
          sourceSchedule: "Official ADG&A pricing",
          notes: "Official ADG&A price.",
          unresolved: false,
        }
      : coating
  );
}

function officialArCoatings(
  coatings: PriceListArCoating[],
  guide: OfficialAdgaGuideCode
) {
  if (guide === "J1") {
    const withoutStandard = coatings.filter(
      (coating) => String(coating.code ?? "").toUpperCase() !== "AST"
    );
    return [
      ...withoutStandard,
      {
        code: "AST",
        name: "Artisan Standard",
        brandFamily: "Artisan Coatings",
        price: ADGA_J1_STANDARD_AR_PRICE,
        sourceSchedule: "Official J1 pricing",
        notes: "Official J1 Standard AR price.",
        recommended: false,
        outsourced: false,
        unresolved: false,
      },
    ];
  }

  return withEmeraldPrice(
    coatings.filter((coating) => {
      const identity = `${coating.code ?? ""} ${coating.name} ${coating.brandFamily}`;
      return !/^AST\b/i.test(identity) && !/\b(?:Shamir|Hoya|Crizal)\b/i.test(identity);
    })
  );
}

function standardArRows(rows: PriceListPricingRow[]) {
  const svRows = rows.filter((row) => /^SV$/i.test(row.designStyle));
  const clear = polyClearBaseline(svRows);
  if (!clear) return [];
  const transitions = svRows.find(isStandardTransitionsRow);
  const enhancedClear: PriceListPricingRow = {
    ...clear,
    id: `${clear.id}-standard-ar`,
    designStyle: "SV with Standard AR",
    edgedPrice: Number((clear.edgedPrice + ADGA_J1_STANDARD_AR_PRICE).toFixed(2)),
    uncutPrice: Number((clear.uncutPrice + ADGA_J1_STANDARD_AR_PRICE).toFixed(2)),
    serviceNotes: addNote(clear.serviceNotes, "Includes Artisan Standard AR (AST)."),
  };
  const enhancedRows = [enhancedClear];
  if (transitions) {
    enhancedRows.push({
      ...transitions,
      id: `${transitions.id}-standard-ar`,
      designStyle: "SV with Standard AR",
      edgedPrice: Number((enhancedClear.edgedPrice + ADGA_TRANSITIONS_UPCHARGE).toFixed(2)),
      uncutPrice: Number((enhancedClear.uncutPrice + ADGA_TRANSITIONS_UPCHARGE).toFixed(2)),
      serviceNotes: addNote(transitions.serviceNotes, "Includes Artisan Standard AR (AST)."),
    });
  }
  return enhancedRows;
}

function unavailableAsphericStandardArRow(
  template: PriceListPricingRow
): PriceListPricingRow {
  return {
    ...template,
    id: "J1-aspheric-sv-standard-ar-unavailable",
    code: "J1",
    priceGuideCode: "J1",
    brand: "Standard Designs",
    designType: "SV",
    designStyle: "Aspheric SV with Standard AR",
    materialRaw: "N/A",
    material: "Unavailable",
    materialColor: "Clear",
    colorRaw: [],
    availableColors: [],
    colorBrand: "Unavailable",
    edgedPrice: 0,
    uncutPrice: 0,
    uncutDeduct: 0,
    serviceNotes: ["Unavailable - no J1 Aspheric SV base price is defined."],
    rawProductNames: ["Aspheric SV with Standard AR"],
    sourceCodes: [],
  };
}

export function buildOfficialAdgaPriceList({
  source,
  guide,
}: {
  source: GeneratedPriceListData;
  guide: OfficialAdgaGuideCode;
}): GeneratedPriceListData {
  const customerList = customerFacingPriceList(source);
  let rows: PriceListPricingRow[] = customerList.rows
    .map(normalizeAdgaDesign)
    .map((row) => ({ ...row, code: guide, priceGuideCode: guide }));

  if (guide === "J1") {
    const template = rows.find((row) => /^SV$/i.test(row.designStyle));
    rows = [
      ...rows,
      ...standardArRows(rows),
      ...(template ? [unavailableAsphericStandardArRow(template)] : []),
    ];
  }
  rows = normalizeAdgaTransitionsPricing(rows, guide);

  return {
    ...customerList,
    code: guide,
    canonicalCode: guide,
    sourceCodesMerged: [guide],
    rows,
    arCoatings: officialArCoatings(customerList.arCoatings, guide),
    addOnSections: [
      ...customerList.addOnSections.filter(
        (section) => !/(?:Photochromic|Transitions)/i.test(section.title)
      ),
      {
        title: "Transitions",
        items: [
          {
            name: "Transitions",
            price: `$${ADGA_TRANSITIONS_UPCHARGE.toFixed(2)} upcharge`,
            notes: "Added to the displayed clear price when Transitions is available.",
          },
        ],
      },
    ],
    report: {
      ...customerList.report,
      rowCount: rows.length,
      displayRowCount: rows.length,
      assumptions: [
        ...customerList.report.assumptions,
        `${guide} is produced as a separate official ADG&A price guide.`,
        ADGA_PHOTO_PRICING_NOTE,
        ...(guide === "J1"
          ? [
              "J1 Standard AR is $25.00.",
              "J1 Aspheric SV with Standard AR is displayed as unavailable because no J1 Aspheric SV base price is defined.",
            ]
          : [
              "J2 excludes Standard AR and the Shamir, Hoya, and Crizal AR coating families.",
            ]),
      ],
    },
  };
}

// Retained for compatibility with the earlier combined review artifact.
export function buildAdgaPreferredPriceList({
  j1,
  j2,
  a6,
}: {
  j1: GeneratedPriceListData;
  j2: GeneratedPriceListData;
  a6: GeneratedPriceListData;
}): GeneratedPriceListData {
  const selectedDesigns = new Set<string>();
  const combinedRows: PriceListPricingRow[] = [];
  for (const [guide, source] of [
    ["J1", j1],
    ["J2", j2],
    ["A6", a6],
  ] as const) {
    const byDesign = new Map<string, PriceListPricingRow[]>();
    for (const row of customerFacingPriceList(source).rows.map(normalizeAdgaDesign)) {
      const key = designKey(row);
      byDesign.set(key, [...(byDesign.get(key) ?? []), row]);
    }
    for (const [key, designRows] of byDesign) {
      if (selectedDesigns.has(key)) continue;
      selectedDesigns.add(key);
      combinedRows.push(
        ...designRows.map((row) => ({ ...row, code: "J2", priceGuideCode: guide }))
      );
    }
  }
  const base = buildOfficialAdgaPriceList({ source: j2, guide: "J2" });
  return {
    ...base,
    rows: combinedRows,
    sourceCodesMerged: [...ADGA_GUIDE_ORDER],
    report: { ...base.report, rowCount: combinedRows.length, displayRowCount: combinedRows.length },
  };
}
