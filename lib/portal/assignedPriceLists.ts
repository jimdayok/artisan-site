import "server-only";

import { canonicalPriceListCode } from "@/lib/portal/priceLists";

const GENERIC_PRICE_LIST_CODES = new Set(["A6", "G6", "P6"]);

export function normalizeAssignedPriceListCodes(codes: string[]) {
  const normalized = [...new Set(
    codes.map(canonicalPriceListCode).filter(Boolean)
  )];
  const hasSpecializedAssignment = normalized.some(
    (code) => !GENERIC_PRICE_LIST_CODES.has(code)
  );

  return normalized
    .filter((code) => !hasSpecializedAssignment || !GENERIC_PRICE_LIST_CODES.has(code))
    .sort((a, b) => a.localeCompare(b));
}

