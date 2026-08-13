import { readFile } from "node:fs/promises";
import path from "node:path";
import { gunzip } from "node:zlib";
import { promisify } from "node:util";
import type { GeneratedPriceListData } from "@/lib/pricing/types";

const gunzipAsync = promisify(gunzip);
const PRICE_LIST_CODE_PATTERN = /^[A-Z0-9]+$/;
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

export async function loadPackagedPriceListByCode(
  code: string
): Promise<GeneratedPriceListData | null> {
  const normalizedCode = code.trim().toUpperCase();
  if (!PRICE_LIST_CODE_PATTERN.test(normalizedCode)) return null;

  const filePath = packagedPriceListPath(normalizedCode);

  try {
    return await loadLocalPackagedPriceList(filePath);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return null;
    throw error;
  }
}
