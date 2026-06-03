import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import ExcelJS from "exceljs";
import { parsePriceList } from "../lib/pricing/parsePriceList.mjs";

const root = process.cwd();
const priceListSourceDir = path.join(root, "private-source", "price-lists");
const portalLookupDir = path.join(root, "private-source", "portal", "lookup_docs");
const outputDir = path.join(root, "private-source", "pricing", "generated");

function resolveSourceFile(candidates) {
  for (const candidate of candidates) {
    const fullPath = path.join(priceListSourceDir, candidate);
    if (existsSync(fullPath)) return fullPath;
  }
  throw new Error(`Missing source file. Tried: ${candidates.join(", ")}`);
}

function resolveLookupFile(candidates) {
  const roots = [portalLookupDir, priceListSourceDir];
  for (const base of roots) {
    for (const candidate of candidates) {
      const fullPath = path.join(base, candidate);
      if (existsSync(fullPath)) return fullPath;
    }
  }
  throw new Error(`Missing lookup file. Tried: ${candidates.join(", ")} in ${roots.map((p) => path.relative(root, p)).join(", ")}`);
}

async function readLookupArMap(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) return new Map();

  const headerRow = worksheet.getRow(1).values.slice(1).map((value) => String(value ?? "").trim().toLowerCase());
  const dviIndex = headerRow.findIndex((h) => h.includes("dvi") || h.includes("column a"));
  const nameIndex = headerRow.findIndex((h) => h === "name" || h.includes("column b"));
  const brandIndex = headerRow.findIndex((h) => h === "brand" || h.includes("column c"));

  const map = new Map();
  const byCode = new Map();
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = row.values.slice(1);
    const dvi = String(values[dviIndex >= 0 ? dviIndex : 0] ?? "").trim();
    const name = String(values[nameIndex >= 0 ? nameIndex : 1] ?? "").trim();
    const brand = String(values[brandIndex >= 0 ? brandIndex : 2] ?? "").trim();
    if (!dvi) return;
    const normalizedCode = dvi.toUpperCase();
    const entry = {
      name: name || dvi,
      brand,
      brandFamily: brand ? `${brand} AR Coatings` : "Other AR Coatings",
    };
    map.set(normalizedCode, entry);
    if (entry.name) map.set(normalizeKey(entry.name), entry);
    byCode.set(normalizedCode, entry);
  });
  return { byName: map, byCode };
}

function normalizeKey(value) {
  return String(value ?? "").trim().toUpperCase().replace(/[™®]/g, "").replace(/\s+/g, " ");
}

function applyArLookup(arCoatings, lookupMap) {
  if (!lookupMap.size) return arCoatings;
  return arCoatings.map((coating) => {
    const key = normalizeKey(coating.name);
    const entry = lookupMap.get(key);
    if (!entry) return coating;
    return {
      ...coating,
      name: entry.name || coating.name,
      brandFamily: entry.brand ? `${entry.brand} AR Coatings` : coating.brandFamily,
    };
  });
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

const b5PackageAddOns = [
  {
    title: "Package Notes",
    items: [
      {
        name: "ARTISAN LENS SYSTEMS",
        price:
          "Lens and coating package pricing. Orders include the listed lens design and an included coating; additional coating upgrade options are available below.",
      },
      { name: "Included AR", price: "Artisan Emerald, Artisan Standard, Diamond Sun, Backside AR (included)" },
      { name: "Products not listed", price: "Not available" },
    ],
  },
  {
    title: "AR Upgrade Pricing",
    items: [
      { name: "Nytopia", price: "$21" },
      { name: "Armour", price: "$11" },
      { name: "Azure", price: "$21" },
      { name: "Artisan Emerald", price: "Included", recommended: true },
      { name: "Artisan Standard", price: "Included" },
      { name: "Diamond Sun", price: "Included" },
      { name: "Backside AR", price: "Included" },
    ],
  },
  ...fullServiceAddOns,
];

const s5PackageAddOns = [
  {
    title: "Package Notes",
    items: [
      {
        name: "ARTISAN LENS SYSTEMS",
        price:
          "Lens and coating package pricing. Orders include the listed lens design and an included coating; additional coating upgrade options are available below.",
      },
      { name: "Included AR", price: "Artisan Emerald, Artisan Standard, Diamond Sun, Backside AR (included)" },
      { name: "Products not listed", price: "Not available" },
    ],
  },
  {
    title: "AR Upgrade Pricing",
    items: [
      { name: "Nytopia", price: "$21" },
      { name: "Armour", price: "$11" },
      { name: "Azure", price: "$21" },
      { name: "Artisan Emerald", price: "Included", recommended: true },
      { name: "Artisan Standard", price: "Included" },
      { name: "Diamond Sun", price: "Included" },
      { name: "Backside AR", price: "Included" },
      { name: "Glacier Expressions", price: "$53" },
      { name: "Glacier Plus", price: "$44" },
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
          "Artisan Frame Systems include the frame and polycarbonate lenses bundled at a reduced package price. Additional lens, coating, and frame-tier upgrade options are available below.",
      },
      { name: "Frame shipping", price: "Frames are drop-shipped to the lab with no additional frame shipping fees." },
    ],
  },
  {
    title: "Frame Tier Guide",
    items: [
      { name: "Green Group", price: "Included" },
      { name: "Lime Group", price: "Included" },
      { name: "Blue Group", price: "$8" },
      { name: "Red Group", price: "$24" },
      { name: "Yellow Group", price: "$29" },
      { name: "Black Diamond", price: "$33" },
      {
        name: "Modern Package Details",
        price: "View frame details",
        href: "/provider-resources#modern-frame-system",
      },
      {
        name: "Frame Systems Resource Center",
        price: "Provider Resources",
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
          "Artisan Safety Systems include the safety frame and lenses bundled at reduced package pricing. Additional lens, coating, and frame-tier upgrade options are available below.",
      },
      { name: "Side shields", price: "Included at no additional fee", recommended: true },
      { name: "Warranty policy", price: "See safety vendor tier and warranty section" },
    ],
  },
  {
    title: "Safety Vendor Tier Guide",
    items: [
      { name: "Frame Tier 1", price: "Included" },
      { name: "Frame Tier 2", price: "$15" },
      { name: "Frame Tier 3", price: "$30" },
      { name: "Frame Tier 4", price: "$45" },
      { name: "Frame Tier 5", price: "$55" },
      { name: "Frame Tier 6", price: "$70" },
      { name: "Side shields", price: "Included at no additional fee", recommended: true },
      {
        name: "Safety Package Details",
        price: "More details and sample kits",
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

const productLookupPath = resolveLookupFile(["Lookup.xlsx", "lookup.xlsx"]);
const materialLookupPath = resolveLookupFile(["Lookup_Mat.xlsx", "lookup_mat.xlsx"]);
const arLookupPath = resolveLookupFile(["Lookup_AR.xlsx", "lookup_ar.xlsx"]);
const colorLookupPath = resolveSourceFile(["colors.txt"]);
const arLookupMaps = await readLookupArMap(arLookupPath);

function loadDviRowsByCode(code) {
  const filePath = path.join(outputDir, `dvi-${code.toLowerCase()}-pricing.json`);
  if (!existsSync(filePath)) return [];
  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf8"));
    return Array.isArray(parsed.rows) ? parsed.rows : [];
  } catch {
    return [];
  }
}

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
    addOnSections: b5PackageAddOns,
    assumptions: ["B5 treated as package pricing; Included AR is Artisan Emerald unless overridden by source row notes."],
  },
  {
    code: "S5",
    rawPath: resolveSourceFile(["m5-tk-b5-s5-y5raw.xlsx"]),
    arCoatings: sharedArCoatings,
    addOnSections: s5PackageAddOns,
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
    addOnSections: [
      {
        title: "Package Notes",
        items: [
          {
            name: "ARTISAN LENS SYSTEMS",
            price:
              "Tokai lens and coating package pricing. Orders include the eligible Tokai lens design and Tokai AR coating; additional upgrade options are available below when supported.",
          },
          { name: "Included AR", price: "Eligible Tokai AR coatings" },
          { name: "Products not listed", price: "Not available" },
        ],
      },
      ...fullServiceAddOns,
    ],
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
        title: "Package Notes",
        items: [
          {
            name: "ARTISAN LENS SYSTEMS",
            price:
              "Value lens and coating package pricing. Orders include the listed lens package rules; additional coating upgrade options are available below when supported.",
          },
          { name: "Included AR", price: "None included unless shown on the selected lens package" },
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
  const mappedArCoatings = applyArLookup(config.arCoatings, arLookupMaps.byName);
  const dviRows = loadDviRowsByCode(config.code);
  const parsed = await parsePriceList({
    code: config.code,
    rawPath: config.rawPath,
    productLookupPath,
    materialLookupPath,
    colorLookupPath,
    arCoatings: mappedArCoatings,
    arLookupByCode: arLookupMaps.byCode,
    dviRows,
    addOnSections: config.addOnSections,
  });

  const dviDerivedAr = new Map();
  let unresolvedArCount = 0;
  for (const row of parsed.rows) {
    for (const coating of row.coatingOptions ?? []) {
      if (coating.unresolved) {
        unresolvedArCount += 1;
        continue;
      }
      const key = `${coating.code}|${coating.name}|${coating.sourceSchedule}`;
      const current = dviDerivedAr.get(key);
      if (!current || coating.price < current.price) {
        dviDerivedAr.set(key, {
          code: coating.code,
          name: coating.name,
          brandFamily: coating.brandFamily,
          price: coating.price,
          sourceSchedule: coating.sourceSchedule,
          unresolved: false,
          notes: `Price sourced from COT schedule ${coating.sourceSchedule}.`,
          recommended: false,
          outsourced: false,
        });
      }
    }
  }
  if (dviDerivedAr.size > 0) {
    parsed.arCoatings = [...dviDerivedAr.values()].sort((a, b) =>
      a.brandFamily.localeCompare(b.brandFamily) || a.name.localeCompare(b.name)
    );
  } else if ((parsed.arCoatings?.length ?? 0) === 0) {
    parsed.report.assumptions.push(
      "No AR coatings were resolved from DVI-linked COT schedules for this list."
    );
  }
  if (unresolvedArCount > 0) {
    parsed.report.assumptions.push(
      `${unresolvedArCount} unresolved AR rows were ignored for customer display.`
    );
  }

  parsed.report.assumptions = [...parsed.report.assumptions, ...config.assumptions];
  parsed.report.sourceFiles = [...parsed.report.sourceFiles, arLookupPath];
  if (dviRows.length > 0) {
    parsed.report.sourceFiles.push(path.join(outputDir, `dvi-${config.code.toLowerCase()}-pricing.json`));
    parsed.report.assumptions.push("AR coating prices are sourced from DVI COT schedules matched by Style + Material + Price List.");
  }

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
