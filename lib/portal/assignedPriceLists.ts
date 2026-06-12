import "server-only";

import { canonicalPriceListCode } from "@/lib/portal/priceLists";

export function normalizeAssignedPriceListCodes(codes: string[]) {
  return [...new Set(codes.map(canonicalPriceListCode).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b)
  );
}
