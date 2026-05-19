import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parsePriceList } from "../lib/pricing/parsePriceList.mjs";

const root = process.cwd();
const priceListSourceDir = path.join(root, "private-source", "price-lists");
const outputDir = path.join(root, "private-source", "pricing", "generated");

const p6ArCoatings = [
  { name: "Nytopia", brandFamily: "Artisan Coatings", price: 62, recommended: true, outsourced: false },
  { name: "Armour", brandFamily: "Artisan Coatings", price: 62, recommended: true, outsourced: false },
  { name: "Azure (Blue Light)", brandFamily: "Artisan Coatings", price: 70, recommended: true, outsourced: false },
  { name: "Artisan Emerald", brandFamily: "Artisan Coatings", price: 55, recommended: true, outsourced: false },
  { name: "Diamond Sun", brandFamily: "Artisan Coatings", price: 37, recommended: false, outsourced: false },
  { name: "Backside AR", brandFamily: "Artisan Coatings", price: 20, recommended: false, outsourced: false },
  { name: "Diamond Shield", brandFamily: "Artisan Coatings", price: 18, recommended: false, outsourced: false },
  { name: "TechShield Elite UVR", brandFamily: "TechShield Coatings", price: 70, recommended: true, outsourced: false },
  { name: "TechShield Blue", brandFamily: "TechShield Coatings", price: 75, recommended: true, outsourced: false },
  { name: "TechShield Plus UVR", brandFamily: "TechShield Coatings", price: 62, recommended: true, outsourced: false },
  { name: "TechShield SUN", brandFamily: "TechShield Coatings", price: 70, recommended: true, outsourced: false },
  { name: "No Reflection Coating", brandFamily: "Tokai AR Coatings", price: 89, recommended: false, outsourced: true },
  { name: "Ultimate Shield Coating", brandFamily: "Tokai AR Coatings", price: 89, recommended: false, outsourced: true },
  { name: "Super Power Shield", brandFamily: "Tokai AR Coatings", price: 85, recommended: false, outsourced: true },
  { name: "Technical Blue Cut", brandFamily: "Tokai AR Coatings", price: 85, recommended: false, outsourced: true },
  { name: "Meiryo EX4", brandFamily: "Hoya AR Coatings", price: 85, recommended: false, outsourced: true },
  { name: "EX3+", brandFamily: "Hoya AR Coatings", price: 81, recommended: false, outsourced: true },
  { name: "Recharge", brandFamily: "Hoya AR Coatings", price: 79, recommended: false, outsourced: true },
  { name: "Natural", brandFamily: "Crizal AR Coatings", price: 104, recommended: false, outsourced: true },
  { name: "Sapphire HR", brandFamily: "Crizal AR Coatings", price: 104, recommended: false, outsourced: true },
  { name: "Prevencia", brandFamily: "Crizal AR Coatings", price: 104, recommended: false, outsourced: true },
  { name: "Rock", brandFamily: "Crizal AR Coatings", price: 97, recommended: false, outsourced: true },
  { name: "EasyPro", brandFamily: "Crizal AR Coatings", price: 79, recommended: false, outsourced: true },
  { name: "Sharpview", brandFamily: "Crizal AR Coatings", price: 89, recommended: false, outsourced: true },
  { name: "OptiFog", brandFamily: "Crizal AR Coatings", price: 96, recommended: false, outsourced: true },
  { name: "Glacier Expressions", brandFamily: "Shamir AR Coatings", price: 96, recommended: false, outsourced: true },
  { name: "Glacier Plus", brandFamily: "Shamir AR Coatings", price: 89, recommended: false, outsourced: true },
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
