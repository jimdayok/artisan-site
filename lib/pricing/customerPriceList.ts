import type {
  GeneratedPriceListData,
  PriceListArCoating,
  PriceListPricingRow,
} from "@/lib/pricing/types";

function isNeurolensDesign(row: PriceListPricingRow) {
  return /^neurolens\b/i.test(row.designStyle.trim());
}

function isNeurolensAr(coating: PriceListArCoating) {
  return /neurolens/i.test(`${coating.brandFamily} ${coating.name}`);
}

function isRetiredCustomerFacingDesign(row: PriceListPricingRow) {
  const brand = row.brand.trim();
  const design = row.designStyle.trim();

  if (/^Hoya$/i.test(brand) && /^iD LifeStyle 3$/i.test(design)) return true;
  if (/^Unity$/i.test(brand) && !/^V3(?:\s|$)/i.test(design)) return true;

  return false;
}

const OUTSOURCED_TURNAROUND_NOTE =
  "Outsourced product; additional turnaround time applies.";

function requiresAdditionalTurnaround(row: PriceListPricingRow) {
  const product = `${row.brand} ${row.designStyle}`
    .replace(/[™®]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return [
    /\bXR (?:DESIGN|TRACK)\b/i,
    /\b(?:ID )?MYSTYLE 3\b/i,
    /\bVARILUX (?:SHIFT|IMMERSA)\b/i,
    /\bID (?:SCREEN|SPACE|ZOOM)(?:\s*\/\s*(?:SCREEN|SPACE|ZOOM))*\b/i,
  ].some((pattern) => pattern.test(product));
}

function normalizeCustomerFacingRow(row: PriceListPricingRow) {
  const isSvIq = /^SV IQ$/i.test(row.designStyle.trim());
  const isBiAsS = /^Bi-AS S$/i.test(row.designStyle.trim());
  const outsourced = row.outsourced || requiresAdditionalTurnaround(row);

  return {
    ...row,
    brand: isSvIq ? "Hoya" : row.brand,
    designStyle: isBiAsS ? "Bi-AS" : row.designStyle,
    outsourced,
    serviceNotes:
      outsourced && !row.serviceNotes.includes(OUTSOURCED_TURNAROUND_NOTE)
        ? [...row.serviceNotes, OUTSOURCED_TURNAROUND_NOTE]
        : row.serviceNotes,
  };
}

export function customerFacingPriceList(
  priceList: GeneratedPriceListData
): GeneratedPriceListData {
  const code = String(priceList.code ?? "").trim().toUpperCase();
  const rows = priceList.rows
    .map(normalizeCustomerFacingRow)
    .filter((row) => !isRetiredCustomerFacingDesign(row));

  if (code !== "NL") {
    return { ...priceList, rows };
  }

  return {
    ...priceList,
    rows: rows
      .filter(isNeurolensDesign)
      .map((row) => ({ ...row, brand: "Neurolens" })),
    arCoatings: priceList.arCoatings.filter(isNeurolensAr),
  };
}
