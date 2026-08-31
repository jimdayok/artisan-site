import { customerFacingPriceList } from "./customerPriceList.ts";
import type {
  GeneratedPriceListData,
  PriceListArCoating,
  PriceListPricingRow,
} from "./types.ts";

export const ADGA_GUIDE_ORDER = ["J1", "J2", "A6"] as const;
export type AdgaGuideCode = (typeof ADGA_GUIDE_ORDER)[number];
export const ADGA_TRANSITIONS_INVOICE_DEDUCTION = 4.99;
export const ADGA_TRANSITIONS_UPCHARGE = 50;
export const ADGA_NEOCHROMES_DEDUCTION = 6.43;

export const ADGA_PHOTO_PRICING_NOTE =
  "Transitions is the standard photochromic option at a $50.00 upcharge. Displayed Transitions prices include the automatic $4.99 invoice deduction. Neochromes is available at a $6.43 deduction from the displayed Transitions price.";

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

function isNeochromesRow(row: PriceListPricingRow) {
  return (
    /^SPY$/i.test(row.materialRaw) &&
    row.colorRaw.some((code) => /^(?:NCG|NCB)$/i.test(code))
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

function normalizeAdgaPhotoPricing(rows: PriceListPricingRow[]) {
  const groups = new Map<string, PriceListPricingRow[]>();
  for (const row of rows) {
    const key = `${row.priceGuideCode ?? ""}|${normalizeKey(row.brand)}|${normalizeKey(row.designStyle)}`;
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }

  return [...groups.values()].flatMap((designRows) => {
    const clear = polyClearBaseline(designRows);
    if (!clear) return designRows;

    const transitionsSource = designRows.find(isStandardTransitionsRow);
    const neochromesSource = designRows.find(isNeochromesRow) ?? transitionsSource;
    const retainedRows = designRows.filter(
      (row) => !isPhotoOptionRow(row) || isPolarizedPhotoRow(row)
    );
    const options: PriceListPricingRow[] = [];

    if (transitionsSource) {
      options.push({
        ...transitionsSource,
        code: "J2",
        id: `${transitionsSource.id}-adga-transitions`,
        materialColor: "Photochromic",
        colorBrand: "Transitions",
        colorRaw: transitionsSource.colorRaw.filter((code) => /^(?:TGY|TBN)$/i.test(code)),
        availableColors: ["Brown", "Gray"],
        edgedPrice: Number((clear.edgedPrice + ADGA_TRANSITIONS_UPCHARGE).toFixed(2)),
        uncutPrice: Number((clear.uncutPrice + ADGA_TRANSITIONS_UPCHARGE).toFixed(2)),
        serviceNotes: addNote(
          transitionsSource.serviceNotes,
          `Includes the automatic $${ADGA_TRANSITIONS_INVOICE_DEDUCTION.toFixed(2)} invoice deduction; net upcharge is $${ADGA_TRANSITIONS_UPCHARGE.toFixed(2)}.`
        ),
      });
    }

    if (neochromesSource) {
      const neochromesUpcharge =
        ADGA_TRANSITIONS_UPCHARGE - ADGA_NEOCHROMES_DEDUCTION;
      options.push({
        ...neochromesSource,
        code: "J2",
        id: `${neochromesSource.id}-adga-neochromes`,
        materialRaw: "SPY",
        materialColor: "Photochromic",
        colorBrand: "Neochromes",
        colorRaw: ["NCG", "NCB"],
        availableColors: ["Brown", "Gray"],
        edgedPrice: Number((clear.edgedPrice + neochromesUpcharge).toFixed(2)),
        uncutPrice: Number((clear.uncutPrice + neochromesUpcharge).toFixed(2)),
        serviceNotes: addNote(
          neochromesSource.serviceNotes,
          `Deduct $${ADGA_NEOCHROMES_DEDUCTION.toFixed(2)} from the displayed Transitions price.`
        ),
      });
    }

    return [...retainedRows, ...options];
  });
}

function withAdgaEmeraldFee(coatings: PriceListArCoating[]) {
  const emerald: PriceListArCoating = {
    code: "AEM",
    name: "Artisan Emerald",
    brandFamily: "Artisan Coatings",
    price: 50,
    sourceSchedule: "ADG&A invoice-level fee",
    notes: "Special ADG&A fee applied at the invoice level.",
    recommended: true,
    outsourced: false,
  };
  return [
    ...coatings.filter(
      (coating) =>
        String(coating.code ?? "").toUpperCase() !== "AEM" &&
        !/^Artisan Emerald$/i.test(coating.name)
    ),
    emerald,
  ];
}

function rowsForGuide(
  priceList: GeneratedPriceListData,
  guide: AdgaGuideCode,
  selectedDesigns: Set<string>
) {
  const customerList = customerFacingPriceList(priceList);
  const availableDesigns = new Set(
    customerList.rows.map(designKey).filter((key) => !selectedDesigns.has(key))
  );
  for (const key of availableDesigns) selectedDesigns.add(key);

  return customerList.rows
    .filter((row) => availableDesigns.has(designKey(row)))
    .map(normalizeAdgaDesign)
    .map((row) => ({ ...row, code: "J2", priceGuideCode: guide }));
}

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
  const j2CustomerList = customerFacingPriceList(j2);
  const rows = normalizeAdgaPhotoPricing([
    ...rowsForGuide(j1, "J1", selectedDesigns),
    ...rowsForGuide(j2, "J2", selectedDesigns),
    ...rowsForGuide(a6, "A6", selectedDesigns),
  ]);

  return {
    ...j2CustomerList,
    code: "J2",
    canonicalCode: "J2",
    sourceCodesMerged: [...ADGA_GUIDE_ORDER],
    rows,
    arCoatings: withAdgaEmeraldFee(j2CustomerList.arCoatings),
    addOnSections: [
      ...j2CustomerList.addOnSections.filter(
        (section) => !/^Photochromic and Transitions Upcharges$/i.test(section.title)
      ),
      {
        title: "ADG&A Photochromic Pricing",
        items: [
          {
            name: "Transitions",
            price: `$${ADGA_TRANSITIONS_UPCHARGE.toFixed(2)} upcharge`,
            notes: `Standard photochromic option; the displayed price includes the automatic $${ADGA_TRANSITIONS_INVOICE_DEDUCTION.toFixed(2)} invoice deduction.`,
          },
          {
            name: "Neochromes",
            price: `-$${ADGA_NEOCHROMES_DEDUCTION.toFixed(2)}`,
            notes: "Deduct from the displayed Transitions price.",
          },
        ],
      },
    ],
    report: {
      ...j2CustomerList.report,
      sourceFiles: [
        ...new Set([
          ...j1.report.sourceFiles,
          ...j2.report.sourceFiles,
          ...a6.report.sourceFiles,
        ]),
      ],
      rowCount: rows.length,
      displayRowCount: rows.length,
      assumptions: [
        ...j2CustomerList.report.assumptions,
        "ADG&A combines J1 first, J2 second, and A6 only for designs absent from both J1 and J2.",
        ADGA_PHOTO_PRICING_NOTE,
        "Artisan Emerald (AEM) is shown as a $50.00 ADG&A invoice-level fee even when it is absent from the source price sheet.",
      ],
    },
  };
}
