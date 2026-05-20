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
  { name: "Standard Mirror", brandFamily: "Mirror Coatings", price: 52, recommended: false, outsourced: true },
  { name: "Mirror Match", brandFamily: "Mirror Coatings", price: 79, recommended: false, outsourced: true },
].map((coating) => ({
  notes: coating.outsourced
    ? "This product is outsourced and will take additional processing time."
    : coating.recommended
      ? "Marked as recommended in the P6 PDF-derived source."
      : "P6 PDF-derived AR coating price.",
  ...coating,
}));

const p6AddOnSections = [
  {
    title: "Add for Material",
    items: [
      { name: "Plastic P", price: "-$8" },
      { name: "Polycarb PL", price: "$0" },
      { name: "Trivex H53", price: "$7" },
      { name: "Hi Index 1.60 H60", price: "$24" },
      { name: "Hi Index 1.67 H67", price: "$43" },
      { name: "Hi Index 1.74 H74", price: "$65" },
      { name: "Hi Index 1.76 H76", price: "$65", recommended: true },
    ],
  },
  {
    title: "Blue Light Filter Options",
    items: [
      { name: "General Blue Filter", price: "$8", recommended: true },
      { name: "BluTech Clear 430", price: "$15" },
      { name: "BluTech Ultra", price: "$51" },
      { name: "BluTech Classic", price: "$32" },
      { name: "BluTech Outdoor", price: "$120" },
      { name: "Tokai Lutina Blue Filter", price: "$15", outsourced: true },
    ],
  },
  {
    title: "Photochromic Options",
    items: [
      { name: "Neochromes", price: "$46", recommended: true },
      { name: "Neochromes Dark", price: "$46", recommended: true },
      { name: "Sensity / SunSync families", price: "See lens option" },
      { name: "Transitions families", price: "See lens option" },
    ],
  },
  {
    title: "Polarized Options",
    items: [
      { name: "Polarized Mirrors", price: "$52", recommended: true },
      { name: "Polar Matt Mirrors", price: "$52", recommended: true },
      { name: "Nupolar Polarized Mirrors", price: "$52", recommended: true },
      { name: "Polarized Solid", price: "$61" },
      { name: "Polarized Gradient", price: "$71" },
    ],
  },
  {
    title: "Finishing Services",
    items: [
      { name: "Edge & Mount", price: "Included" },
      { name: "Add for Groove Rimless", price: "$9" },
      { name: "Add for Full Metal Groove", price: "$15" },
      { name: "Add for Drill up to four holes", price: "$24" },
      { name: "Tint with AR", price: "$5", notes: "Additional fee." },
    ],
  },
  {
    title: "Shipping",
    items: [
      { name: "Next Day Air", price: "$4 per job" },
      { name: "2-Day Shipping", price: "$16 per box" },
      { name: "Ground Delivery", price: "$8 per box" },
      { name: "Mail to Patient", price: "$8" },
    ],
  },
];

const p6 = await parsePriceList({
  code: "P6",
  rawPath: path.join(priceListSourceDir, "rawp6.xlsx"),
  productLookupPath: path.join(priceListSourceDir, "Lookup.xlsx"),
  materialLookupPath: path.join(priceListSourceDir, "Lookup_Mat.xlsx"),
  colorLookupPath: path.join(priceListSourceDir, "colors.txt"),
  arCoatings: p6ArCoatings,
  addOnSections: p6AddOnSections,
});

await mkdir(outputDir, { recursive: true });
await writeFile(
  path.join(outputDir, "p6-pricing.json"),
  `${JSON.stringify(p6, null, 2)}\n`
);

console.log(`Wrote ${p6.rows.length} P6 pricing rows to private-source/pricing/generated/p6-pricing.json`);
console.log(`Processed ${p6.report.rawSourceRowsProcessed} raw P6 source rows`);
console.log(`Rows excluded missing lookup: ${p6.report.rowsExcludedMissingLookup}`);
console.log(`Display rows after collapse: ${p6.report.displayRowCount}`);
console.log(`Unmapped products: ${p6.report.unmappedProducts.length}`);
console.log(`Unmapped materials: ${p6.report.unmappedMaterials.length}`);
console.log(`Unmapped colors: ${p6.report.unmappedColors.length}`);
console.log(`Duplicate price conflicts: ${p6.report.duplicatePriceConflictCount}`);
console.log(`Color variants collapsed: ${p6.report.colorVariantsCollapsedCount}`);
