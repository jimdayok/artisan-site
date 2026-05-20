import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parsePriceList } from "../lib/pricing/parsePriceList.mjs";

const root = process.cwd();
const priceListSourceDir = path.join(root, "private-source", "price-lists");
const outputDir = path.join(root, "private-source", "pricing", "generated");

function resolveSourceFile(candidates) {
  for (const candidate of candidates) {
    const fullPath = path.join(priceListSourceDir, candidate);
    if (existsSync(fullPath)) return fullPath;
  }
  throw new Error(`Missing source file. Tried: ${candidates.join(", ")}`);
}

const sharedArCoatings = [
  { name: "Nytopia", brandFamily: "Artisan Coatings", price: 62, recommended: true, outsourced: false },
  { name: "Armour", brandFamily: "Artisan Coatings", price: 62, recommended: true, outsourced: false },
  { name: "Azure (Blue Light)", brandFamily: "Artisan Coatings", price: 70, recommended: true, outsourced: false },
  { name: "Artisan Emerald", brandFamily: "Artisan Coatings", price: 55, recommended: true, outsourced: false },
  { name: "Diamond Sun", brandFamily: "Artisan Coatings", price: 37, recommended: false, outsourced: false },
  { name: "Backside AR", brandFamily: "Artisan Coatings", price: 20, recommended: false, outsourced: false },
  { name: "TechShield Elite UVR", brandFamily: "TechShield Coatings", price: 70, recommended: true, outsourced: false },
  { name: "TechShield Blue", brandFamily: "TechShield Coatings", price: 75, recommended: true, outsourced: false },
  { name: "No Reflection Coating", brandFamily: "Tokai AR Coatings", price: 89, recommended: false, outsourced: true },
  { name: "Meiryo EX4", brandFamily: "Hoya AR Coatings", price: 85, recommended: false, outsourced: true },
  { name: "Natural", brandFamily: "Crizal AR Coatings", price: 104, recommended: false, outsourced: true },
  { name: "Glacier Expressions", brandFamily: "Shamir AR Coatings", price: 96, recommended: false, outsourced: true },
  { name: "Standard Mirror", brandFamily: "Mirror Coatings", price: 52, recommended: false, outsourced: true },
].map((coating) => ({
  notes: coating.outsourced
    ? "This product is outsourced and will take additional processing time."
    : coating.recommended
      ? "Recommended for best service."
      : "PDF-derived AR coating price.",
  ...coating,
}));

const tokaiOnlyArCoatings = sharedArCoatings.filter((item) =>
  item.brandFamily === "Tokai AR Coatings"
);

const noArtisanArCoatings = sharedArCoatings.filter(
  (item) => item.brandFamily !== "Artisan Coatings"
);

const fullServiceAddOns = [
  {
    title: "Add for Material",
    items: [
      { name: "Plastic", price: "-$8" },
      { name: "Polycarbonate", price: "$0" },
      { name: "Trivex", price: "$7" },
      { name: "High Index 1.60", price: "$24" },
      { name: "High Index 1.67", price: "$43" },
      { name: "High Index 1.70", price: "$60" },
      { name: "High Index 1.74", price: "$56" },
      { name: "High Index 1.76", price: "$65", recommended: true },
    ],
  },
  {
    title: "Blue Light Filter Options",
    items: [
      { name: "General Blue Filter", price: "$8", recommended: true },
      { name: "BluTech Clear 430", price: "$15" },
      { name: "BluTech Ultra", price: "$51" },
      { name: "BluTech Classic", price: "$32" },
      { name: "Tokai Lutina Blue Filter", price: "$15", outsourced: true },
    ],
  },
  {
    title: "Photochromic Options",
    items: [
      { name: "Neochromes", price: "$46", recommended: true },
      { name: "Neochromes Dark", price: "$46", recommended: true },
      { name: "SunSync", price: "See lens option" },
      { name: "Sensity", price: "See lens option" },
      { name: "Transitions", price: "See lens option" },
    ],
  },
  {
    title: "Polarized Options",
    items: [
      { name: "Polarized Mirrors", price: "$52", recommended: true },
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

const packageAddOns = [
  {
    title: "Package Notes",
    items: [
      { name: "Included AR", price: "Artisan Emerald", recommended: true },
      { name: "Package pricing", price: "Edged and assembled package price" },
    ],
  },
  ...fullServiceAddOns,
];

const m5AddOns = [
  {
    title: "Package Notes",
    items: [
      {
        name: "Artisan Frame System",
        price:
          "Artisan Frame Systems include the frame and polycarbonate lenses bundled at a reduced package price.",
      },
      { name: "Frame shipping", price: "Frames are drop-shipped to the lab with no additional frame shipping fees." },
    ],
  },
  {
    title: "Frame Tier Guide",
    items: [
      {
        name: "Modern Optical Frame Tier Guide",
        price: "Reference",
        href: "/provider-resources#modern-frame-system",
      },
      {
        name: "Frame Systems Resource Center",
        price: "Reference",
        href: "/provider-resources#frame-systems",
      },
    ],
  },
  ...fullServiceAddOns,
];

const y5AddOns = [
  {
    title: "Package Notes",
    items: [
      {
        name: "Artisan Safety System",
        price:
          "Artisan Safety Frame Systems include the frame and lenses bundled at reduced package pricing.",
      },
      { name: "Side shields", price: "Included at no additional fee", recommended: true },
      { name: "Warranty policy", price: "See safety vendor tier and warranty section" },
    ],
  },
  {
    title: "Safety Vendor Tier Guide",
    items: [
      {
        name: "Safety Systems Resource Center",
        price: "Reference",
        href: "/provider-resources#safety-systems",
      },
      {
        name: "OnGuard Safety Frame Catalog",
        price: "External",
        href: "https://www.hilcovision.com/cp/eyewear-accessories/prescription-safety-glasses",
      },
    ],
  },
  ...fullServiceAddOns,
];

const productLookupPath = resolveSourceFile(["Lookup.xlsx", "lookup.xlsx"]);
const materialLookupPath = resolveSourceFile(["Lookup_Mat.xlsx", "lookup_mat.xlsx"]);
const colorLookupPath = resolveSourceFile(["colors.txt"]);

const configs = [
  {
    code: "P6",
    rawPath: resolveSourceFile(["rawp6.xlsx", "p6raw.xlsx"]),
    arCoatings: sharedArCoatings,
    addOnSections: fullServiceAddOns,
    assumptions: ["P6 AR/add-on content sourced from P6 PDF-derived baseline."],
  },
  {
    code: "G6",
    rawPath: resolveSourceFile(["rawg6.xlsx", "g6raw.xlsx"]),
    arCoatings: sharedArCoatings,
    addOnSections: fullServiceAddOns,
    assumptions: ["G6 AR/add-on sections aligned to alnpricing_2026_G6.pdf structure."],
  },
  {
    code: "A6",
    rawPath: resolveSourceFile(["rawa6.xlsx", "a6raw.xlsx"]),
    arCoatings: sharedArCoatings,
    addOnSections: fullServiceAddOns,
    assumptions: ["A6 AR/add-on sections aligned to alnpricing_2026_A6.pdf structure."],
  },
  {
    code: "B5",
    rawPath: resolveSourceFile(["m5-tk-b5-s5-y5raw.xlsx"]),
    arCoatings: sharedArCoatings,
    addOnSections: packageAddOns,
    assumptions: ["B5 treated as package pricing; Included AR is Artisan Emerald unless overridden by source row notes."],
  },
  {
    code: "S5",
    rawPath: resolveSourceFile(["m5-tk-b5-s5-y5raw.xlsx"]),
    arCoatings: sharedArCoatings,
    addOnSections: packageAddOns,
    assumptions: ["S5 treated as Shamir package pricing with included Artisan Emerald package behavior."],
  },
  {
    code: "M5",
    rawPath: resolveSourceFile(["m5-tk-b5-s5-y5raw.xlsx"]),
    arCoatings: sharedArCoatings,
    addOnSections: m5AddOns,
    assumptions: ["M5 modeled as frame package builder with bundled frame and polycarbonate lens note."],
  },
  {
    code: "Y5",
    rawPath: resolveSourceFile(["m5-tk-b5-s5-y5raw.xlsx"]),
    arCoatings: sharedArCoatings,
    addOnSections: y5AddOns,
    assumptions: ["Y5 modeled as safety package builder with side shields included."],
  },
  {
    code: "TK",
    rawPath: resolveSourceFile(["m5-tk-b5-s5-y5raw.xlsx"]),
    arCoatings: tokaiOnlyArCoatings,
    addOnSections: fullServiceAddOns,
    assumptions: [
      "TK pulled from mixed workbook rows where PL code is TK.",
      "TK interactive AR list is restricted to Tokai AR coatings.",
    ],
  },
  {
    code: "VD",
    rawPath: resolveSourceFile(["rawp6.xlsx", "p6raw.xlsx"]),
    arCoatings: noArtisanArCoatings,
    addOnSections: [
      {
        title: "Program Notes",
        items: [
          { name: "Included AR", price: "None" },
          { name: "Artisan Standard", price: "$21" },
          { name: "Products not listed", price: "Not available" },
        ],
      },
      ...fullServiceAddOns,
    ],
    assumptions: [
      "VD rows are sourced from the same raw workbook family as standard designs.",
      "VD excludes Artisan coatings; only non-Artisan options are surfaced.",
    ],
  },
];

await mkdir(outputDir, { recursive: true });

for (const config of configs) {
  const parsed = await parsePriceList({
    code: config.code,
    rawPath: config.rawPath,
    productLookupPath,
    materialLookupPath,
    colorLookupPath,
    arCoatings: config.arCoatings,
    addOnSections: config.addOnSections,
  });

  parsed.report.assumptions = [...parsed.report.assumptions, ...config.assumptions];

  const outputName = `${config.code.toLowerCase()}-pricing.json`;
  await writeFile(
    path.join(outputDir, outputName),
    `${JSON.stringify(parsed, null, 2)}\n`
  );

  console.log(`Wrote ${parsed.rows.length} ${config.code} pricing rows to private-source/pricing/generated/${outputName}`);
  console.log(`Processed ${parsed.report.rawSourceRowsProcessed} raw ${config.code} source rows`);
  console.log(`Rows excluded missing lookup: ${parsed.report.rowsExcludedMissingLookup}`);
  console.log(`Display rows after collapse: ${parsed.report.displayRowCount}`);
  console.log(`Unmapped products: ${parsed.report.unmappedProducts.length}`);
  console.log(`Unmapped materials: ${parsed.report.unmappedMaterials.length}`);
  console.log(`Unmapped colors: ${parsed.report.unmappedColors.length}`);
  console.log(`Duplicate price conflicts: ${parsed.report.duplicatePriceConflictCount}`);
  console.log(`Color variants collapsed: ${parsed.report.colorVariantsCollapsedCount}`);
}
