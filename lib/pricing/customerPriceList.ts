import type {
  GeneratedPriceListData,
  PriceListArCoating,
  PriceListPricingRow,
} from "@/lib/pricing/types";

function isNeurolensDesign(row: PriceListPricingRow) {
  return /^neurolens\b/i.test(row.designStyle.trim());
}

function isNeurolensAr(coating: PriceListArCoating) {
  return /neurolens/i.test(`${coating.brandFamily} ${coating.name}`);
}

function isRetiredCustomerFacingDesign(row: PriceListPricingRow) {
  const brand = row.brand.trim();
  const design = row.designStyle.trim();

  if (/^Hoya$/i.test(brand) && /^iD LifeStyle 3$/i.test(design)) return true;
  if (/^Unity$/i.test(brand) && !/^V3(?:\s|$)/i.test(design)) return true;
  if (/^Eyezen Kids$/i.test(design)) return true;
  if (/^SD\*?$/i.test(design)) return true;
  if (/^SUN\s+INT(?:L)?\b/i.test(design)) return true;
  if (/\bVX\s+XR\s+TRACK\s+TE\b/i.test(`${design} ${row.rawProductNames.join(" ")} ${row.sourceCodes.join(" ")}`)) return true;

  return false;
}

const OUTSOURCED_TURNAROUND_NOTE =
  "Outsourced product; additional turnaround time applies.";

function requiresAdditionalTurnaround(row: PriceListPricingRow) {
  const product = `${row.brand} ${row.designStyle}`
    .replace(/[™®]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return [
    /\bXR (?:DESIGN|TRACK)\b/i,
    /\b(?:ID )?MYSTYLE [23]\b/i,
    /\bVARILUX (?:SHIFT|IMMERSA)\b/i,
    /\bID (?:SCREEN|SPACE|ZOOM)(?:\s*\/\s*(?:SCREEN|SPACE|ZOOM))*\b/i,
    /\bX DESIGN 4D\b/i,
    /\bX FIT\b/i,
  ].some((pattern) => pattern.test(product));
}

const PHASING_OUT_NOTE = "Phasing out; contact your lab for current availability.";
const TOKAI_AVAILABILITY_NOTE =
  "Pricing shown uses Hi Index 1.60; Hi Index 1.70 and 1.76 are also available.";
const EYEZEN_AVAILABILITY_NOTE =
  "Clear pricing uses a blue-filtering substrate; Transitions and polarized options are also available.";

function addUniqueNote(notes: string[], note: string) {
  return notes.includes(note) ? notes : [...notes, note];
}

function isPhasingOutDesign(design: string) {
  return /^(?:Physio W3\+(?: Fit)?|W3\+(?: Fit)?|Physio DRx|Comfort DRx|(?:iD )?MyStyle 2)$/i.test(
    design.trim()
  );
}

function normalizeBrandAndDesign(row: PriceListPricingRow) {
  let brand = row.brand.trim();
  let designStyle = row.designStyle.trim();
  let designType = row.designType.trim();
  const identity = `${brand} ${designStyle}`;

  if (/^SD\*?$/i.test(brand) || /^(?:SD )?(?:Digital(?: SV)?|Concept)$/i.test(designStyle)) {
    brand = "Artisan";
    designType = "Enhanced SV";
    designStyle = /^Concept$/i.test(designStyle)
      ? "SD Concept"
      : /^Digital(?: SV)?$/i.test(designStyle)
        ? "SD Digital"
        : designStyle.replace(/^SD Digital SV$/i, "SD Digital");
  }
  if (/^Gold Series$/i.test(designStyle)) {
    brand = "Artisan";
    designType = "Progressive";
  }
  if (/^TACT$/i.test(designStyle) || /^TACT$/i.test(brand)) {
    brand = "Hoya";
    designStyle = "Tact";
    designType = "Occupational";
  }
  if (/^VX$/i.test(brand) || /^VX\b/i.test(identity)) brand = "Varilux";
  if (/^SYNC 6$/i.test(designStyle)) designStyle = "Sync 3";
  if (/^Eyezen(?: Start|\+)$/i.test(designStyle)) {
    brand = "Essilor";
    designType = "Enhanced SV";
  }

  return { brand, designStyle, designType };
}

function normalizeCustomerFacingRow(row: PriceListPricingRow) {
  const normalized = normalizeBrandAndDesign(row);
  const isSvIq = /^SV IQ$/i.test(row.designStyle.trim());
  const isBiAsS = /^Bi-AS S$/i.test(row.designStyle.trim());
  const isTokai = /^Tokai$/i.test(normalized.brand);
  const normalizedRow = {
    ...row,
    ...normalized,
    brand: isSvIq ? "Hoya" : normalized.brand,
    designStyle: isBiAsS ? "Bi-AS" : normalized.designStyle,
  };
  const outsourced =
    isTokai || normalizedRow.outsourced || requiresAdditionalTurnaround(normalizedRow);
  let serviceNotes = normalizedRow.serviceNotes;
  if (outsourced) serviceNotes = addUniqueNote(serviceNotes, OUTSOURCED_TURNAROUND_NOTE);
  if (isTokai) serviceNotes = addUniqueNote(serviceNotes, TOKAI_AVAILABILITY_NOTE);
  if (/^Eyezen(?: Start|\+)$/i.test(normalizedRow.designStyle)) {
    serviceNotes = addUniqueNote(serviceNotes, EYEZEN_AVAILABILITY_NOTE);
  }
  if (isPhasingOutDesign(normalizedRow.designStyle)) {
    serviceNotes = addUniqueNote(serviceNotes, PHASING_OUT_NOTE);
  }

  return {
    ...normalizedRow,
    outsourced,
    serviceNotes,
  };
}

function isAvailableEyezenMaterial(row: PriceListPricingRow) {
  const materialCode = row.materialRaw.trim().toUpperCase();
  return (
    materialCode.startsWith("B") ||
    materialCode.startsWith("T") ||
    row.materialColor === "Polarized"
  );
}

function isUnavailablePhotoDesignRow(row: PriceListPricingRow) {
  return (
    /^(?:Camber Pure|Camber Steady Plus|Diamond Series)$/i.test(
      row.designStyle.trim()
    ) && /^S/i.test(row.materialRaw.trim())
  );
}

function normalizeCustomerFacingAr(coating: PriceListArCoating) {
  const family = /tech\s*shield|unity/i.test(`${coating.brandFamily} ${coating.name}`)
    ? "TechShield by VSP AR Coatings"
    : coating.brandFamily;
  const name = coating.name
    .replace(/^Tecshield\b/i, "TechShield")
    .replace(/^Techshield\b/i, "TechShield");
  return { ...coating, brandFamily: family, name };
}

function isRemovedCustomerFacingAr(coating: PriceListArCoating) {
  const code = String(coating.code ?? "").trim().toUpperCase();
  const identity = `${coating.brandFamily} ${coating.name}`;
  return (
    ["ARC", "QRB", "SPU", "UEU"].includes(code) ||
    /Artisan ARC|Retinal Bliss|Sentinel Plus UV|Unity Elite UV/i.test(identity)
  );
}

function compareArPrice(a: PriceListArCoating, b: PriceListArCoating) {
  return (
    a.brandFamily.localeCompare(b.brandFamily, undefined, { sensitivity: "base" }) ||
    a.price - b.price ||
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
}

function withPhotoProductUpcharges(
  sections: GeneratedPriceListData["addOnSections"],
  rows: PriceListPricingRow[]
) {
  const baseline = rows
    .filter(
      (row) =>
        /^SV$/i.test(row.designStyle) &&
        /^PLY$/i.test(row.materialRaw) &&
        row.materialColor === "Clear" &&
        row.colorRaw.some((code) => /^CLR$/i.test(code))
    )
    .sort((a, b) => a.edgedPrice - b.edgedPrice)[0];
  if (!baseline) return sections;

  const products = [
    { name: "Transitions", material: "TPY", color: "TGY" },
    { name: "Neochromes", material: "SPY", color: "NCG" },
    { name: "Sensity 2", material: "SPY", color: "2GY" },
    { name: "SunSync", material: "SPY", color: "SYG" },
    { name: "Neochromes Agile Dark", material: "SPY", color: "NAG" },
    { name: "Transitions Xtra Active", material: "TPY", color: "X2G" },
  ];
  const items = products.flatMap((product) => {
    const row = rows
      .filter(
        (candidate) =>
          /^SV$/i.test(candidate.designStyle) &&
          candidate.materialRaw.toUpperCase() === product.material &&
          candidate.colorRaw.some((code) => code.toUpperCase() === product.color)
      )
      .sort((a, b) => a.edgedPrice - b.edgedPrice)[0];
    if (!row) return [];
    const upcharge = Number((row.edgedPrice - baseline.edgedPrice).toFixed(2));
    if (!Number.isFinite(upcharge) || upcharge < 0) return [];
    return [{
      name: product.name,
      price: `$${upcharge.toFixed(2)}`,
      notes: `Compared with SV PLY CLR at $${baseline.edgedPrice.toFixed(2)}.`,
    }];
  });
  if (!items.length) return sections;

  return [
    ...sections.filter((section) => !/^Photochromic and Transitions Upcharges$/i.test(section.title)),
    { title: "Photochromic and Transitions Upcharges", items },
  ];
}

export function customerFacingPriceList(
  priceList: GeneratedPriceListData
): GeneratedPriceListData {
  const code = String(priceList.code ?? "").trim().toUpperCase();
  const rows = priceList.rows
    .map(normalizeCustomerFacingRow)
    .filter((row) => !isRetiredCustomerFacingDesign(row))
    .filter(
      (row) =>
        !/^Eyezen(?: Start|\+)$/i.test(row.designStyle) ||
        isAvailableEyezenMaterial(row)
    )
    .filter((row) => !isUnavailablePhotoDesignRow(row));
  const arCoatings = priceList.arCoatings
    .filter((coating) => !isRemovedCustomerFacingAr(coating))
    .map(normalizeCustomerFacingAr)
    .sort(compareArPrice);
  const addOnSections = withPhotoProductUpcharges(priceList.addOnSections, rows);

  if (code !== "NL") {
    return { ...priceList, rows, arCoatings, addOnSections };
  }

  return {
    ...priceList,
    rows: rows
      .filter(isNeurolensDesign)
      .map((row) => ({ ...row, brand: "Neurolens" })),
    arCoatings: arCoatings.filter(isNeurolensAr),
    addOnSections,
  };
}
