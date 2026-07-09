import hiddenPriceListCodeList from "@/config/hidden-price-list-codes.json";

export const PACKAGE_PRICE_LIST_CODES = ["B5", "C3", "S5", "TK", "VX", "M5", "Y5", "VD"] as const;

const packagePriceListCodes = new Set<string>(PACKAGE_PRICE_LIST_CODES);
const hiddenPriceListCodes = new Set<string>(
  (hiddenPriceListCodeList as string[]).map(normalizePriceListCode)
);

export function normalizePriceListCode(code: string) {
  return String(code ?? "").trim().toUpperCase();
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
