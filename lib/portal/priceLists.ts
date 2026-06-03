export type PriceListCode = string;

export type PortalPriceList = {
  code: PriceListCode;
  label: string;
  fileName: string;
  r2Key?: string | null;
  onlineUrl?: string | null;
  configured?: boolean;
};

export function canonicalPriceListCode(code: string) {
  const normalized = code.trim().toUpperCase();
  if (normalized === "G5") return "G6";
  if (normalized === "P5") return "P6";
  if (normalized === "A5") return "A6";
  if (normalized === "VX") return "VD";
  return normalized;
}

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
  {
    code: "E4",
    label: "E4 Price Sheet",
    fileName: "Assigned E4 pricing",
    r2Key: null,
    onlineUrl: "/portal/price-list/e4",
  },
  {
    code: "E5",
    label: "E5 Price Sheet",
    fileName: "Assigned E5 pricing",
    r2Key: null,
    onlineUrl: "/portal/price-list/e5",
  },
  {
    code: "E7",
    label: "E7 Price Sheet",
    fileName: "Assigned E7 pricing",
    r2Key: null,
    onlineUrl: "/portal/price-list/e7",
  },
  {
    code: "E8",
    label: "E8 Price Sheet",
    fileName: "Assigned E8 pricing",
    r2Key: null,
    onlineUrl: "/portal/price-list/e8",
  },
  {
    code: "NL",
    label: "NL Price Sheet",
    fileName: "Assigned Neurolens pricing",
    r2Key: null,
    onlineUrl: "/portal/price-list/nl",
  },
  {
    code: "CD",
    label: "CD Price Sheet",
    fileName: "Assigned Cadre pricing",
    r2Key: null,
    onlineUrl: "/portal/price-list/cd",
  },
  {
    code: "J1",
    label: "J1 Price Sheet",
    fileName: "Assigned J1 pricing",
    r2Key: null,
    onlineUrl: "/portal/price-list/j1",
  },
  {
    code: "J2",
    label: "J2 Price Sheet",
    fileName: "Assigned J2 pricing",
    r2Key: null,
    onlineUrl: "/portal/price-list/j2",
  },
  {
    code: "C3",
    label: "C3 Price Sheet",
    fileName: "Assigned C3 pricing",
    r2Key: null,
    onlineUrl: "/portal/price-list/c3",
  },
];

export function getPriceListByCode(code: string) {
  const normalizedCode = canonicalPriceListCode(code);
  if (!normalizedCode) return undefined;
  const configured = priceLists.find((priceList) => priceList.code === normalizedCode);
  if (configured) return { ...configured, configured: true };
  return {
    code: normalizedCode,
    label: `${normalizedCode} Price Sheet`,
    fileName: `Assigned ${normalizedCode} pricing`,
    r2Key: null,
    onlineUrl: `/portal/price-list/${normalizedCode.toLowerCase()}`,
    configured: false,
  } satisfies PortalPriceList;
}
