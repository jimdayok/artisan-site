export type PriceListCode = "P6" | "G6" | "A6" | "B5" | "S5" | "VD";

export type PortalPriceList = {
  code: PriceListCode;
  label: string;
  fileName: string;
  r2Key: string;
};

export const priceLists: PortalPriceList[] = [
  {
    code: "P6",
    label: "P6 Price Sheet",
    fileName: "alnpricing_2026_P6.pdf",
    r2Key: "price-sheets/alnpricing_2026_P6.pdf",
  },
  {
    code: "G6",
    label: "G6 Price Sheet",
    fileName: "alnpricing_2026_G6.pdf",
    r2Key: "price-sheets/alnpricing_2026_G6.pdf",
  },
  {
    code: "A6",
    label: "A6 Price Sheet",
    fileName: "aln_pricing_2026_A6.pdf",
    r2Key: "price-sheets/aln_pricing_2026_A6.pdf",
  },
  {
    code: "B5",
    label: "B5 Price Sheet",
    fileName: "aln_pricing_2026_B5.pdf",
    r2Key: "price-sheets/aln_pricing_2026_B5.pdf",
  },
  {
    code: "S5",
    label: "S5 Price Sheet",
    fileName: "aln_pricing_2026_S5.pdf",
    r2Key: "price-sheets/aln_pricing_2026_S5.pdf",
  },
  {
    code: "VD",
    label: "VD Price Sheet",
    fileName: "aln_pricing_2026_VD.pdf",
    r2Key: "price-sheets/aln_pricing_2026_VD.pdf",
  },
];

export function getPriceListByCode(code: string) {
  const normalizedCode = code.trim().toUpperCase();

  return priceLists.find((priceList) => priceList.code === normalizedCode);
}
