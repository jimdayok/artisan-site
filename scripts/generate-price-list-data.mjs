import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parsePriceList } from "../lib/pricing/parsePriceList.mjs";

const root = process.cwd();
const priceListSourceDir = path.join(root, "private-source", "price-lists");
const outputDir = path.join(root, "private-source", "pricing", "generated");

const p6 = await parsePriceList({
  code: "P6",
  rawPath: path.join(priceListSourceDir, "rawp6.xlsx"),
  productLookupPath: path.join(priceListSourceDir, "Lookup.xlsx"),
  materialLookupPath: path.join(priceListSourceDir, "Lookup_Mat.xlsx"),
  colorLookupPath: path.join(priceListSourceDir, "colors.txt"),
});

await mkdir(outputDir, { recursive: true });
await writeFile(
  path.join(outputDir, "p6-pricing.json"),
  `${JSON.stringify(p6, null, 2)}\n`
);

console.log(`Wrote ${p6.rows.length} P6 pricing rows to private-source/pricing/generated/p6-pricing.json`);
console.log(`Unmapped products: ${p6.report.unmappedProducts.length}`);
console.log(`Unmapped materials: ${p6.report.unmappedMaterials.length}`);
console.log(`Unmapped colors: ${p6.report.unmappedColors.length}`);
