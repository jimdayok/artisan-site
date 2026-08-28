import { customerFacingPriceList } from "./customerPriceList.ts";
import type {
  GeneratedPriceListData,
  PriceListPricingRow,
} from "./types.ts";

export const ADGA_GUIDE_ORDER = ["J1", "J2", "A6"] as const;
export type AdgaGuideCode = (typeof ADGA_GUIDE_ORDER)[number];

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
    .map((row) => ({ ...row, priceGuideCode: guide }));
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
  const rows = [
    ...rowsForGuide(j1, "J1", selectedDesigns),
    ...rowsForGuide(j2, "J2", selectedDesigns),
    ...rowsForGuide(a6, "A6", selectedDesigns),
  ];

  return {
    ...j2CustomerList,
    code: "J2",
    canonicalCode: "J2",
    sourceCodesMerged: [...ADGA_GUIDE_ORDER],
    rows,
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
      ],
    },
  };
}
