import { gunzip } from "node:zlib";
import { promisify } from "node:util";
import type { GeneratedPriceListData } from "@/lib/pricing/types";

const gunzipAsync = promisify(gunzip);
const PRICE_LIST_CODE_PATTERN = /^[A-Z0-9]+$/;
const STATIC_PACKAGED_PRICING_PATH = "/pricing/generated/normalized";

async function parseCompressedPriceList(
  compressed: Uint8Array
): Promise<GeneratedPriceListData | null> {
  const json = await gunzipAsync(compressed);
  const payload = JSON.parse(json.toString("utf8")) as GeneratedPriceListData;

  if (!Array.isArray(payload.rows) || payload.rows.length === 0) return null;
  return payload;
}

export async function loadRuntimePackagedPriceListByCode(
  code: string,
  requestOrigin: string
): Promise<GeneratedPriceListData | null> {
  const normalizedCode = code.trim().toUpperCase();
  if (!PRICE_LIST_CODE_PATTERN.test(normalizedCode)) return null;

  const response = await fetch(
    new URL(`${STATIC_PACKAGED_PRICING_PATH}/${normalizedCode}.json.gz`, requestOrigin),
    { cache: "no-store" }
  );

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(
      `Unable to load packaged pricing asset ${normalizedCode}.json.gz (${response.status} ${response.statusText}).`
    );
  }

  return parseCompressedPriceList(new Uint8Array(await response.arrayBuffer()));
}
