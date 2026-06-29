import type { PriceListPricingRow } from "./types";

export const priceDisplayCategories = [
  "SV",
  "Digital SV",
  "Enhanced SV",
  "Multifocals",
  "Occupational Designs",
  "Progressive Designs",
] as const;

export type PriceDisplayCategory = (typeof priceDisplayCategories)[number];
export type ProgressiveTier = "Best" | "Better" | "Good";

const categoryRank = new Map(
  priceDisplayCategories.map((category, index) => [category, index])
);

const brandOrder = [
  "Artisan",
  "IOT",
  "Unity",
  "Sequel by Newton",
  "Tokai",
  "Shamir",
  "Hoya",
  "Varilux",
];

const brandRank = new Map(
  brandOrder.map((brand, index) => [brand.toUpperCase(), index])
);

const tierRank = new Map<ProgressiveTier, number>([
  ["Best", 0],
  ["Better", 1],
  ["Good", 2],
]);

function normalized(value: string) {
  return String(value ?? "")
    .toUpperCase()
    .replace(/[™®*]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function priceDisplayCategory(
  row: Pick<PriceListPricingRow, "brand" | "designType" | "designStyle">
): PriceDisplayCategory {
  const type = normalized(row.designType);
  const style = normalized(row.designStyle);
  const brand = normalized(row.brand);

  if (type.includes("PROGRESSIVE")) return "Progressive Designs";
  if (type.includes("OCCUPATIONAL")) return "Occupational Designs";
  if (type.includes("MULTIFOCAL")) return "Multifocals";
  if (
    type.includes("ANTI-FATIGUE") ||
    type.includes("ENHANCED") ||
    /ANTI[- ]?FATIGUE|ENDLESS PLUS|SD (CONCEPT|RADIUS|REACH)|RELAX|REST|SYNC|RELIEVE|EYEZEN/.test(
      style
    )
  ) {
    return "Enhanced SV";
  }

  if (
    type === "SV" ||
    type.includes("SINGLE VISION") ||
    style.includes(" SV")
  ) {
    return brand === "STANDARD DESIGNS" ? "SV" : "Digital SV";
  }

  return "SV";
}

export function comparePriceDisplayCategory(
  a: PriceDisplayCategory,
  b: PriceDisplayCategory
) {
  return (categoryRank.get(a) ?? 99) - (categoryRank.get(b) ?? 99);
}

export function comparePriceDisplayBrand(a: string, b: string) {
  const aRank = brandRank.get(normalized(a));
  const bRank = brandRank.get(normalized(b));
  if (aRank !== undefined && bRank !== undefined) return aRank - bRank;
  if (aRank !== undefined) return -1;
  if (bRank !== undefined) return 1;
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

export function progressiveTierFor(
  row: Pick<PriceListPricingRow, "brand" | "designStyle" | "recommended">
): ProgressiveTier {
  const brand = normalized(row.brand);
  const style = normalized(row.designStyle);

  if (brand === "ARTISAN") {
    if (style.includes("DIAMOND")) return "Best";
    if (style.includes("PLATINUM")) return "Better";
    return "Good";
  }
  if (brand === "IOT") {
    if (/CAMBER|INMOTION/.test(style)) return "Best";
    if (/ENDLESS/.test(style)) return "Better";
    return "Good";
  }
  if (brand === "UNITY") {
    if (/V3/.test(style)) return "Best";
    if (/VIA/.test(style)) return "Better";
    return "Good";
  }
  if (brand === "TOKAI") {
    if (/9X/.test(style)) return "Best";
    if (/7X/.test(style)) return "Better";
    return "Good";
  }
  if (brand === "SHAMIR") {
    if (/INTELLIGENCE|AUTOGRAPH 3|DRIVER INTELLIGENCE/.test(style)) return "Best";
    if (/AUTOGRAPH 2|SPECTRUM PLUS|INTOUCH|ATTITUDE|GOLF/.test(style)) return "Better";
    return "Good";
  }
  if (brand === "HOYA") {
    if (/MYSTYLE|LIFESTYLE 4/.test(style)) return "Best";
    if (/LIFESTYLE 3|ARRAY 2/.test(style)) return "Better";
    return "Good";
  }
  if (brand === "VARILUX") {
    if (/\bXR\b|\bX (DESIGN|FIT)\b/.test(style)) return "Best";
    if (/PHYSIO/.test(style)) return "Better";
    return "Good";
  }

  return row.recommended ? "Best" : "Good";
}

export function compareProgressiveTier(a: ProgressiveTier, b: ProgressiveTier) {
  return (tierRank.get(a) ?? 99) - (tierRank.get(b) ?? 99);
}
