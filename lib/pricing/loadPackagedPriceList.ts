import { readFile } from "node:fs/promises";
import path from "node:path";
import { gunzip } from "node:zlib";
import { promisify } from "node:util";
import type { GeneratedPriceListData } from "@/lib/pricing/types";

const gunzipAsync = promisify(gunzip);
const PRICE_LIST_CODE_PATTERN = /^[A-Z0-9]+$/;

export async function loadPackagedPriceListByCode(
  code: string
): Promise<GeneratedPriceListData | null> {
  const normalizedCode = code.trim().toUpperCase();
  if (!PRICE_LIST_CODE_PATTERN.test(normalizedCode)) return null;

  const filePath = path.join(
    process.cwd(),
    "lib",
    "pricing",
    "generated",
    "normalized",
    `${normalizedCode}.json.gz`
  );

  try {
    const compressed = await readFile(filePath);
    const json = await gunzipAsync(compressed);
    const payload = JSON.parse(json.toString("utf8")) as GeneratedPriceListData;

    if (!Array.isArray(payload.rows) || payload.rows.length === 0) return null;
    return payload;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return null;
    throw error;
  }
}
