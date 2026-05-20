export type PriceListCode =
  | "P6"
  | "G6"
  | "A6"
  | "B5"
  | "S5"
  | "VD"
  | "M5"
  | "Y5"
  | "TK";

export type PortalPriceList = {
  code: PriceListCode;
  label: string;
  fileName: string;
  r2Key?: string | null;
  onlineUrl?: string | null;
};

export const priceLists: PortalPriceList[] = [
  {
    code: "P6",
    label: "P6 Price Sheet",
    fileName: "alnpricing_2026_P6.pdf",
    r2Key: "price-sheets/alnpricing_2026_P6.pdf",
    onlineUrl: "/portal/price-list/p6",
  },
  {
    code: "G6",
    label: "G6 Price Sheet",
    fileName: "alnpricing_2026_G6.pdf",
    r2Key: "price-sheets/alnpricing_2026_G6.pdf",
    onlineUrl: "/portal/price-list/g6",
  },
  {
    code: "A6",
    label: "A6 Price Sheet",
    fileName: "alnpricing_2026_A6.pdf",
    r2Key: "price-sheets/alnpricing_2026_A6.pdf",
    onlineUrl: "/portal/price-list/a6",
  },
  {
    code: "B5",
    label: "B5 Price Sheet",
    fileName: "alnpricing_2026_B5.pdf",
    r2Key: "price-sheets/alnpricing_2026_B5.pdf",
    onlineUrl: "/portal/price-list/b5",
  },
  {
    code: "S5",
    label: "S5 Price Sheet",
    fileName: "alnpricing_2026_S5.pdf",
    r2Key: "price-sheets/alnpricing_2026_S5.pdf",
    onlineUrl: "/portal/price-list/s5",
  },
  {
    code: "VD",
    label: "VD Price Sheet",
    fileName: "alnpricing_2026_VD.pdf",
    r2Key: "price-sheets/alnpricing_2026_VD.pdf",
    onlineUrl: "/portal/price-list/vd",
  },
  {
    code: "M5",
    label: "M5 Price Sheet",
    fileName: "2025 Price List - Modern Frame System M5.pdf",
    r2Key: null,
    onlineUrl: "/portal/price-list/m5",
  },
  {
    code: "Y5",
    label: "Y5 Price Sheet",
    fileName: "2025 Price List - Artisan Safety System Y5.pdf",
    r2Key: null,
    onlineUrl: "/portal/price-list/y5",
  },
  {
    code: "TK",
    label: "TK Price Sheet",
    fileName: "Tokai Pricing.pdf",
    r2Key: null,
    onlineUrl: "/portal/price-list/tk",
  },
];

export function getPriceListByCode(code: string) {
  const normalizedCode = code.trim().toUpperCase();

  return priceLists.find((priceList) => priceList.code === normalizedCode);
}
