import { readFile } from "node:fs/promises";
import path from "node:path";
import { gunzip } from "node:zlib";
import { promisify } from "node:util";
import type { GeneratedPriceListData } from "@/lib/pricing/types";

const gunzipAsync = promisify(gunzip);
const PRICE_LIST_CODE_PATTERN = /^[A-Z0-9]+$/;
const STATIC_PACKAGED_PRICING_PATH = "/pricing/generated/normalized";

type PackagedPriceListLoadOptions = {
  requestOrigin?: string;
};

function packagedPriceListPath(code: string) {
  return path.join(
    process.cwd(),
    "lib",
    "pricing",
    "generated",
    "normalized",
    `${code}.json.gz`
  );
}

async function parseCompressedPriceList(
  compressed: Uint8Array
): Promise<GeneratedPriceListData | null> {
  const json = await gunzipAsync(compressed);
  const payload = JSON.parse(json.toString("utf8")) as GeneratedPriceListData;

  if (!Array.isArray(payload.rows) || payload.rows.length === 0) return null;
  return payload;
}

async function loadLocalPackagedPriceList(filePath: string) {
  const compressed = await readFile(filePath);
  return parseCompressedPriceList(compressed);
}

async function loadStaticPackagedPriceList(code: string, requestOrigin?: string) {
  if (!requestOrigin) return null;

  const response = await fetch(
    new URL(`${STATIC_PACKAGED_PRICING_PATH}/${code}.json.gz`, requestOrigin),
    { cache: "no-store" }
  );

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(
      `Unable to load packaged pricing asset ${code}.json.gz (${response.status} ${response.statusText}).`
    );
  }

  return parseCompressedPriceList(new Uint8Array(await response.arrayBuffer()));
}

export async function loadPackagedPriceListByCode(
  code: string,
  options?: PackagedPriceListLoadOptions
): Promise<GeneratedPriceListData | null> {
  const normalizedCode = code.trim().toUpperCase();
  if (!PRICE_LIST_CODE_PATTERN.test(normalizedCode)) return null;

  const filePath = packagedPriceListPath(normalizedCode);

  try {
    return await loadLocalPackagedPriceList(filePath);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return loadStaticPackagedPriceList(normalizedCode, options?.requestOrigin);
    }
    throw error;
  }
}
