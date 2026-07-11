import "server-only";

import { canonicalPriceListCode } from "@/lib/portal/priceLists";
import { isVisiblePriceListCode } from "@/lib/pricing/priceListCodes";

export function normalizeAssignedPriceListCodes(codes: string[]) {
  return [...new Set(codes.map(canonicalPriceListCode).filter(Boolean).filter(isVisiblePriceListCode))].sort(
    (a, b) => a.localeCompare(b)
  );
}
