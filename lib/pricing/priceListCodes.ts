import hiddenPriceListCodeList from "@/config/hidden-price-list-codes.json";

export const PACKAGE_PRICE_LIST_CODES = ["B5", "M5", "Y5", "S5", "C3", "TK", "VD", "VX"] as const;

export const PRICE_LIST_DISPLAY_NAMES: Record<string, string> = {
  E5: "Special Partner Pricing",
  P6: "Artisan Partner Pricing",
  Y5: "Artisan Safety Systems",
  NL: "Neurolens Pricing",
  G6: "Artisan General Pricing",
  A6: "Artisan Preferred Pricing",
  B5: "Artisan Lens Systems",
  S5: "Shamir Lens System",
  E7: "Special Partner Pricing",
  E8: "Special Partner Pricing",
  E4: "Special Partner Pricing",
  C3: "Add-on Lens System Pricing",
  J2: "ADG&A Preferred Pricing",
  J1: "ADG&A Preferred Pricing",
  M5: "Modern Frame Systems",
  NK: "Nike Lens Systems",
  TK: "Tokai Lens Systems",
  VX: "Varilux Lens Systems",
  VD: "2025 Artisan Value System Pricing",
};

const packagePriceListCodes = new Set<string>(PACKAGE_PRICE_LIST_CODES);
const hiddenPriceListCodes = new Set<string>(
  (hiddenPriceListCodeList as string[]).map(normalizePriceListCode)
);

export function normalizePriceListCode(code: string) {
  return String(code ?? "").trim().toUpperCase();
}

export function priceListDisplayName(code: string, fallback?: string) {
  const normalized = normalizePriceListCode(code);
  return PRICE_LIST_DISPLAY_NAMES[normalized] || fallback || `${normalized} Pricing`;
}

export function isPackagePriceListCode(code: string) {
  return packagePriceListCodes.has(normalizePriceListCode(code));
}

export function isHiddenPriceListCode(code: string) {
  return hiddenPriceListCodes.has(normalizePriceListCode(code));
}

export function isVisiblePriceListCode(code: string) {
  return !isHiddenPriceListCode(code);
}

export function filterVisiblePriceListCodes(codes: string[]) {
  return [...new Set(codes.map(normalizePriceListCode).filter((code) => code && isVisiblePriceListCode(code)))].sort(
    (a, b) => a.localeCompare(b)
  );
}
