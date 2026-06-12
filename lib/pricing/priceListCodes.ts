export const PACKAGE_PRICE_LIST_CODES = [
  "B5",
  "S5",
  "TK",
  "VX",
  "M5",
  "Y5",
] as const;

const packagePriceListCodes = new Set<string>(PACKAGE_PRICE_LIST_CODES);

export function normalizePriceListCode(code: string) {
  return code.trim().toUpperCase();
}

export function isPackagePriceListCode(code: string) {
  return packagePriceListCodes.has(normalizePriceListCode(code));
}
