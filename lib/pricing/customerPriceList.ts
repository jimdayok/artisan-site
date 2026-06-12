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

export function customerFacingPriceList(
  priceList: GeneratedPriceListData
): GeneratedPriceListData {
  const code = String(priceList.code ?? "").trim().toUpperCase();
  if (code !== "NL") return priceList;

  return {
    ...priceList,
    rows: priceList.rows
      .filter(isNeurolensDesign)
      .map((row) => ({ ...row, brand: "Neurolens" })),
    arCoatings: priceList.arCoatings.filter(isNeurolensAr),
  };
}
