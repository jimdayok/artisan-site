import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parsePriceList } from "../lib/pricing/parsePriceList.mjs";

const root = process.cwd();
const priceListSourceDir = path.join(root, "private-source", "price-lists");
const outputDir = path.join(root, "private-source", "pricing", "generated");

const p6ArCoatings = [
  { name: "Nytopia", brandFamily: "Artisan AR", price: 62, recommended: true, outsourced: false },
  { name: "Armour", brandFamily: "Artisan AR", price: 62, recommended: true, outsourced: false },
  { name: "Azure (Blue Light)", brandFamily: "Artisan AR", price: 70, recommended: true, outsourced: false },
  { name: "Artisan Emerald", brandFamily: "Artisan AR", price: 55, recommended: true, outsourced: false },
  { name: "Diamond Sun", brandFamily: "Artisan AR", price: 37, recommended: false, outsourced: false },
  { name: "Backside AR", brandFamily: "Artisan AR", price: 20, recommended: false, outsourced: false },
  { name: "Diamond Shield", brandFamily: "Artisan AR", price: 18, recommended: false, outsourced: false },
  { name: "TechShield Elite UVR", brandFamily: "TechShield", price: 70, recommended: true, outsourced: false },
  { name: "TechShield Blue", brandFamily: "TechShield", price: 75, recommended: true, outsourced: false },
  { name: "TechShield Plus UVR", brandFamily: "TechShield", price: 62, recommended: true, outsourced: false },
  { name: "TechShield SUN", brandFamily: "TechShield", price: 70, recommended: true, outsourced: false },
  { name: "No Reflection Coating", brandFamily: "Other", price: 89, recommended: false, outsourced: true },
  { name: "Ultimate Shield Coating", brandFamily: "Other", price: 89, recommended: false, outsourced: true },
  { name: "Super Power Shield", brandFamily: "Other", price: 85, recommended: false, outsourced: true },
  { name: "Technical Blue Cut", brandFamily: "Other", price: 85, recommended: false, outsourced: true },
  { name: "Meiryo EX4", brandFamily: "Hoya", price: 85, recommended: false, outsourced: true },
  { name: "EX3+", brandFamily: "Hoya", price: 81, recommended: false, outsourced: true },
  { name: "Recharge", brandFamily: "Hoya", price: 79, recommended: false, outsourced: true },
  { name: "Natural", brandFamily: "Crizal", price: 104, recommended: false, outsourced: true },
  { name: "Sapphire HR", brandFamily: "Crizal", price: 104, recommended: false, outsourced: true },
  { name: "Prevencia", brandFamily: "Crizal", price: 104, recommended: false, outsourced: true },
  { name: "Rock", brandFamily: "Crizal", price: 97, recommended: false, outsourced: true },
  { name: "EasyPro", brandFamily: "Crizal", price: 79, recommended: false, outsourced: true },
  { name: "Sharpview", brandFamily: "Crizal", price: 89, recommended: false, outsourced: true },
  { name: "OptiFog", brandFamily: "Crizal", price: 96, recommended: false, outsourced: true },
  { name: "Glacier Expressions", brandFamily: "Shamir", price: 96, recommended: false, outsourced: true },
  { name: "Glacier Plus", brandFamily: "Shamir", price: 89, recommended: false, outsourced: true },
].map((coating) => ({
  notes: coating.outsourced
    ? "Marked as outsourced in the P6 PDF-derived source."
    : coating.recommended
      ? "Marked as recommended in the P6 PDF-derived source."
      : "P6 PDF-derived AR coating price.",
  ...coating,
}));

const p6 = await parsePriceList({
  code: "P6",
  rawPath: path.join(priceListSourceDir, "rawp6.xlsx"),
  productLookupPath: path.join(priceListSourceDir, "Lookup.xlsx"),
  materialLookupPath: path.join(priceListSourceDir, "Lookup_Mat.xlsx"),
  colorLookupPath: path.join(priceListSourceDir, "colors.txt"),
  arCoatings: p6ArCoatings,
});

await mkdir(outputDir, { recursive: true });
await writeFile(
  path.join(outputDir, "p6-pricing.json"),
  `${JSON.stringify(p6, null, 2)}\n`
);

console.log(`Wrote ${p6.rows.length} P6 pricing rows to private-source/pricing/generated/p6-pricing.json`);
console.log(`Processed ${p6.report.rawSourceRowsProcessed} raw P6 source rows`);
console.log(`Unmapped products: ${p6.report.unmappedProducts.length}`);
console.log(`Unmapped materials: ${p6.report.unmappedMaterials.length}`);
console.log(`Unmapped colors: ${p6.report.unmappedColors.length}`);
console.log(`Duplicate price conflicts: ${p6.report.duplicatePriceConflictCount}`);
console.log(`Color variants collapsed: ${p6.report.colorVariantsCollapsedCount}`);
