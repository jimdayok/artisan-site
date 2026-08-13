import { loadPackagedPriceListByCode } from "@/lib/pricing/loadPackagedPriceList";
import type { GeneratedPriceListData } from "@/lib/pricing/types";

export async function loadRuntimePackagedPriceListByCode(
  code: string,
  _requestOrigin: string
): Promise<GeneratedPriceListData | null> {
  return loadPackagedPriceListByCode(code);
}
