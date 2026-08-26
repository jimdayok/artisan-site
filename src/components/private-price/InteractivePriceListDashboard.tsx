"use client";

import Image from "next/image";
import { isPackagePriceListCode } from "@/lib/pricing/priceListCodes";
import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import type {
  GeneratedPriceListData,
  PriceListAddOnSection,
  PriceListArCoating,
  PriceListPricingRow,
} from "@/lib/pricing/types";
import {
  comparePriceDisplayBrand,
  comparePriceDisplayCategory,
  compareProgressiveTier,
  priceDisplayCategory,
  progressiveTierFor,
  type PriceDisplayCategory,
  type ProgressiveTier,
} from "@/lib/pricing/displayTaxonomy";
import GeneratedPriceListExportButton from "./GeneratedPriceListExportButton";
import {
  lowestPolycarbonateRow,
  priceForMode,
  usesPolycarbonatePriceBasis,
} from "@/lib/pricing/polycarbonatePriceBasis";

type PriceMode = "edged" | "uncut";
type ViewBy = "designType" | "brand";
type MaterialGroup = "Clear" | "Photochromic" | "Polarized";
type SortKey =
  | "brand"
  | "designType"
  | "designStyle"
  | "clear"
  | "photochromic"
  | "polarized";
type SortDirection = "asc" | "desc";
type AvailabilityFilter = "all" | "yes" | "no";

type DesignRow = {
  id: string;
  designType: string;
  displayCategory: PriceDisplayCategory;
  progressiveTier?: ProgressiveTier;
  brand: string;
  designStyle: string;
  rows: PriceListPricingRow[];
  clearFrom?: PriceListPricingRow;
  photoFrom?: PriceListPricingRow;
  polarizedFrom?: PriceListPricingRow;
  recommended: boolean;
  outsourced: boolean;
};

type MaterialOption = {
  material: string;
  rows: PriceListPricingRow[];
  clear?: PriceListPricingRow;
  photochromic?: PriceListPricingRow;
  polarized?: PriceListPricingRow;
  addOn?: number;
};

type OptionFamily = {
  family: string;
  rows: PriceListPricingRow[];
  from?: PriceListPricingRow;
  colors: string[];
  materials: string[];
};

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function compareText(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function normalizeKey(value: string) {
  return String(value ?? "")
    .toUpperCase()
    .replace(/[™®]/g, "")
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeArFamily(value: string) {
  const key = String(value || "").trim().toLowerCase();
  if (key.includes("artisan")) return "Artisan";
  if (key.includes("tech")) return "TechShield";
  if (key.includes("tokai")) return "Tokai";
  if (key.includes("crizal")) return "Crizal";
  if (key.includes("hoya")) return "Hoya";
  if (key.includes("shamir")) return "Shamir";
  if (key.includes("neurolens")) return "Neurolens";
  return "";
}

function coatingDisplayFamily(coating: PriceListArCoating) {
  const identity = `${coating.brandFamily} ${coating.name}`;
  return /\bunity\b|tech\s*shield/i.test(identity)
    ? "TechShield / Unity"
    : normalizeArFamily(coating.brandFamily);
}

function arTurnaroundNote(family: string) {
  return family === "Artisan" || family === "TechShield / Unity"
    ? "Produced on-site for the fastest turnaround time."
    : "Produced off-site; additional turnaround time applies.";
}

function isCoppertoneRow(row: PriceListPricingRow) {
  const source = [
    row.colorBrand,
    row.materialColor,
    row.colorRaw.join(" "),
    row.availableColors.join(" "),
    row.rawProductNames.join(" "),
  ]
    .join(" ")
    .toUpperCase();

  return source.includes("COPPERTONE");
}

function priceFor(row: PriceListPricingRow | undefined, mode: PriceMode) {
  return priceForMode(row, mode);
}

function startingPriceLabel(row: PriceListPricingRow | undefined, mode: PriceMode) {
  if (!row) return "—";
  if (priceFor(row, mode) <= 0) return "Not Available";
  return `${currency(priceFor(row, mode))}+`;
}

function exactPriceLabel(row: PriceListPricingRow | undefined, mode: PriceMode) {
  if (!row) return "—";
  if (priceFor(row, mode) <= 0) return "Not Available";
  return currency(priceFor(row, mode));
}

function addOnPriceToNumber(value: number | string) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized || normalized.includes("included")) return 0;
  const parsed = Number(normalized.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

const titleByCode: Record<string, string> = {
  P6: "Artisan Equity Partner Pricing",
  G6: "Artisan General Pricing",
  A6: "Artisan PMP Partner Pricing",
  B5: "Artisan Lens System Pricing",
  S5: "Shamir Lens System Pricing",
  M5: "Artisan Frame System Pricing",
  Y5: "Artisan Safety System Pricing",
  TK: "Tokai Pricing",
  VX: "Artisan VX Lens System Pricing",
  NL: "Neurolens Pricing",
  VD: "VD Pricing",
};

type ProgramMeta = {
  multiplePairEligible: boolean;
  packageNotes: string[];
  ruleNotes: string[];
  titleLogoSrc?: string;
  packageMark?: "lens" | "frame" | "safety";
};

const defaultProgramMeta: ProgramMeta = {
  multiplePairEligible: false,
  packageNotes: [],
  ruleNotes: ["Products not listed are not available."],
};

const metaByCode: Record<string, ProgramMeta> = {
  P6: {
    multiplePairEligible: true,
    packageNotes: [],
    ruleNotes: ["Products not listed are not available."],
  },
  G6: {
    multiplePairEligible: true,
    packageNotes: [],
    ruleNotes: ["Products not listed are not available."],
  },
  A6: {
    multiplePairEligible: true,
    packageNotes: [],
    ruleNotes: ["Products not listed are not available."],
  },
  B5: {
    multiplePairEligible: true,
    packageNotes: [
      "ARTISAN LENS SYSTEMS: lens and coating package pricing.",
      "Orders include the selected lens design and included coating shown in the package notes.",
      "Additional coating upgrade options are available at source-listed pricing.",
      "Products not listed are not available.",
    ],
    ruleNotes: [],
    titleLogoSrc: "/iot-logo.png",
    packageMark: "lens",
  },
  S5: {
    multiplePairEligible: true,
    packageNotes: [
      "ARTISAN LENS SYSTEMS: lens and coating package pricing.",
      "Orders include the selected lens design and included coating shown in the package notes.",
      "Additional coating upgrade options are available at source-listed pricing.",
      "Products not listed are not available.",
    ],
    ruleNotes: [],
    titleLogoSrc: "/shamir-logo.png",
    packageMark: "lens",
  },
  TK: {
    multiplePairEligible: false,
    packageNotes: [
      "ARTISAN LENS SYSTEMS: Tokai lens and coating package pricing.",
      "Orders include eligible Tokai AR coating support; additional upgrade options are available when supported.",
    ],
    ruleNotes: [
      "Tokai Lens System pricing includes eligible Tokai AR coatings.",
      "Artisan coatings are not available with this program.",
      "TK is not eligible for the Artisan Multiple Pair Program.",
    ],
    titleLogoSrc: "/tokai-logo.png",
    packageMark: "lens",
  },
  VX: {
    multiplePairEligible: false,
    packageNotes: [
      "ARTISAN LENS SYSTEMS: VX lens and coating package pricing.",
      "Package prices and supported upgrades are shown from the assigned VX source list.",
      "Products not listed are not available.",
    ],
    ruleNotes: [],
    packageMark: "lens",
  },
  VD: {
    multiplePairEligible: false,
    packageNotes: [
      "ARTISAN LENS SYSTEMS: value lens package pricing.",
      "Orders follow the package coating rules shown for this list; additional coating upgrade options are available when supported.",
    ],
    ruleNotes: [
      "This program does not permit usage of Artisan coatings.",
      "Artisan Standard is available for $21.",
      "No included AR on Value Systems.",
      "Products not listed are not available.",
    ],
    packageMark: "lens",
  },
  M5: {
    multiplePairEligible: false,
    packageNotes: [
      "Artisan Frame Systems packages include frames and lenses.",
      "Tier 1 frame options are included; additional frame upgrade tiers are listed below.",
      "Additional lens and coating options are available below.",
    ],
    ruleNotes: ["Products not listed are not available."],
    packageMark: "frame",
  },
  Y5: {
    multiplePairEligible: false,
    packageNotes: [
      "Artisan Safety Systems packages include safety frames and lenses.",
      "Tier 1 safety frame options are included; additional frame upgrade tiers are listed below.",
      "Additional lens and coating options are available below.",
      "Side shields are included at no additional fee.",
    ],
    ruleNotes: ["Products not listed are not available."],
    packageMark: "safety",
  },
};

function defaultTitleFromCode(code: string) {
  const normalized = code.trim().toUpperCase();
  return `${normalized} Pricing`;
}

function resolveProgramTitle(code: string) {
  return titleByCode[code] ?? defaultTitleFromCode(code);
}

function resolveProgramMeta(code: string): ProgramMeta {
  return metaByCode[code] ?? defaultProgramMeta;
}

function PackageSystemMark({ variant }: { variant: NonNullable<ProgramMeta["packageMark"]> }) {
  const label =
    variant === "lens"
      ? "Lens Systems"
      : variant === "frame"
        ? "Frame Systems"
        : "Safety Systems";

  return (
    <div className="relative flex min-h-[104px] w-full max-w-[360px] items-center justify-center overflow-hidden rounded-[2px] border border-[#d8c49b] bg-[#122033] px-6 py-5 text-center text-white shadow-[0_18px_48px_rgba(18,32,51,0.14)]">
      <Image
        src="/rings-transparent.png"
        alt=""
        width={500}
        height={500}
        className="absolute -right-16 -top-24 h-64 w-64 object-contain opacity-[0.18]"
        aria-hidden="true"
      />
      <Image
        src="/rings-transparent.png"
        alt=""
        width={500}
        height={500}
        className="absolute -bottom-20 -left-14 h-44 w-44 rotate-180 object-contain opacity-[0.14]"
        aria-hidden="true"
      />
      <div className="relative">
        <p className="font-alfons-brush text-[2.15rem] leading-none text-[#d8c49b]">
          Artisan
        </p>
        <p className="mt-1 text-[1.35rem] font-semibold uppercase leading-none tracking-[0.12em] md:text-[1.55rem]">
          {label}
        </p>
      </div>
    </div>
  );
}

const materialDisplayMap: Record<string, string> = {
  plastic: "Plastic",
  polycarb: "Polycarbonate",
  polycarbonate: "Polycarbonate",
  trivex: "Trivex",
  "mid index 1.56": "Mid Index 1.56",
  "hi-index 1.60": "Hi-Index 1.60",
  "hi-index 1.67": "Hi-Index 1.67",
  "hi-index 1.70": "Hi-Index 1.70",
  "hi-index 1.74": "Hi-Index 1.74",
  "hi-index 1.76": "Hi-Index 1.76",
  "high index 1.60": "Hi-Index 1.60",
  "high index 1.67": "Hi-Index 1.67",
  "high index 1.70": "Hi-Index 1.70",
  "high index 1.74": "Hi-Index 1.74",
  "high index 1.76": "Hi-Index 1.76",
  "hi index 1.60": "Hi-Index 1.60",
  "hi index 1.67": "Hi-Index 1.67",
  "hi index 1.70": "Hi-Index 1.70",
  "hi index 1.74": "Hi-Index 1.74",
  "hi index 1.76": "Hi-Index 1.76",
};

const materialOrder = [
  "Plastic",
  "Polycarbonate",
  "Trivex",
  "Hi-Index 1.60",
  "Hi-Index 1.67",
  "Hi-Index 1.70",
  "Hi-Index 1.74",
  "Hi-Index 1.76",
];

const materialRank = new Map(materialOrder.map((value, index) => [value, index]));

function materialDisplay(value: string) {
  return materialDisplayMap[value.trim().toLowerCase()] ?? value;
}

function compareMaterial(a: string, b: string) {
  const aDisplay = materialDisplay(a);
  const bDisplay = materialDisplay(b);
  const aRank = materialRank.get(aDisplay);
  const bRank = materialRank.get(bDisplay);

  if (aRank !== undefined && bRank !== undefined) return aRank - bRank;
  if (aRank !== undefined) return -1;
  if (bRank !== undefined) return 1;
  return compareText(aDisplay, bDisplay);
}

const artisanDesignOrder = new Map(
  ["Diamond Series", "Platinum Series", "Gold Series", "CFB", "SD Concept", "SD Reach"].map((value, index) => [
    value.toUpperCase(),
    index,
  ])
);
const iotDesignOrder = new Map(
  ["Camber Pure", "Camber Plus", "Endless Plus", "Essential Plus", "Everyday B"].map(
    (value, index) => [value.toUpperCase(), index]
  )
);

function compareBrandDisplayOrder(a: string, b: string) {
  return comparePriceDisplayBrand(a, b);
}

function compareDesignStyleByBusinessOrder(a: DesignRow, b: DesignRow) {
  const aBrand = a.brand.trim().toUpperCase();
  const bBrand = b.brand.trim().toUpperCase();
  if (aBrand === "ARTISAN" && bBrand === "ARTISAN") {
    const aRank = artisanDesignOrder.get(a.designStyle.toUpperCase());
    const bRank = artisanDesignOrder.get(b.designStyle.toUpperCase());
    if (aRank !== undefined && bRank !== undefined && aRank !== bRank) return aRank - bRank;
    if (aRank !== undefined && bRank === undefined) return -1;
    if (aRank === undefined && bRank !== undefined) return 1;
  }
  if (aBrand === "IOT" && bBrand === "IOT") {
    const aRank = iotDesignOrder.get(a.designStyle.toUpperCase());
    const bRank = iotDesignOrder.get(b.designStyle.toUpperCase());
    if (aRank !== undefined && bRank !== undefined && aRank !== bRank) return aRank - bRank;
    if (aRank !== undefined && bRank === undefined) return -1;
    if (aRank === undefined && bRank !== undefined) return 1;
  }
  return compareText(a.designStyle, b.designStyle);
}

const brandLogoMap: Record<string, string> = {
  artisan: "/rings-transparent.png",
  hoya: "/hoya-logo.png",
  iot: "/iot-logo.png",
  shamir: "/shamir-logo.png",
  tokai: "/tokai-logo.png",
  unity: "/unity-logo.png",
  varilux: "/varilux-logo.png",
  eyezen: "/varilux-logo.png",
  younger: "/younger-optics-logo.png",
  sequel: "/logos/newton.svg",
  newton: "/logos/newton.svg",
  "sequel by newton": "/logos/newton.svg",
  neurolens: "/logos/Neurolens_RGB_Primary-Brandmark_Black.png",
};

function brandLogoSrc(brand: string) {
  return brandLogoMap[brand.trim().toLowerCase()] ?? "";
}

function normalizePhotoFamily(value: string) {
  const raw = value.trim();
  const upper = raw.toUpperCase();
  if (upper.includes("XTRAACTIVE 2") || upper.includes("XTRACTIVE") || upper.includes("XTRA ACTIVE")) return "Transitions Xtra Active";
  if (upper.includes("TRANSITIONS POLAR")) return "Transitions Xtra Active Polarized";
  if (upper.includes("TRANSITIONS(S)") || upper.includes("GEN S")) return "Transitions Gen S";
  if (upper.includes("SUNSYNC ELITE XT")) return "SunSync Elite XT";
  if (upper.includes("NEOCHROMES DARK")) return "Neochromes Dark";
  if (upper.includes("SENSITY 2")) return "Sensity 2";
  if (upper.includes("SENSITY FAST")) return "Sensity Fast";
  if (upper.includes("TOKAI LUTINA PHOTO V2")) return "Tokai Lutina Photo V2";
  if (upper.includes("DRIVEWEAR")) return "Transitions Drivewear";
  if (upper.includes("TRANSITIONS COLORS")) return "Transitions Colors";
  if (upper.includes("TRANSITIONS")) return "Transitions";
  if (upper.includes("SUNSYNC")) return "SunSync";
  if (upper.includes("SENSITY")) return "Sensity";
  if (upper.includes("NEOCHROMES")) return "Neochromes";
  return raw;
}

function optionGroupForRow(row: PriceListPricingRow): MaterialGroup {
  if (row.materialColor !== "Photochromic") return row.materialColor as MaterialGroup;

  const normalizedFamily = normalizePhotoFamily(row.colorBrand || "Other Photo");
  if (/POLARIZED|DRIVEWEAR/i.test(normalizedFamily)) return "Polarized";

  const source = [
    row.colorBrand,
    row.availableColors.join(" "),
    row.rawProductNames.join(" "),
  ]
    .join(" ")
    .toUpperCase();

  if (source.includes("POLAR")) return "Polarized";
  if (source.includes("DRIVEWEAR")) return "Polarized";

  return "Photochromic";
}

function extractDesignVersions(rows: PriceListPricingRow[]) {
  return [...new Set(rows.flatMap((row) => row.rawProductNames.map((value) => value.trim())).filter(Boolean))]
    .map((value) =>
      normalizeDisplayName(value.replace(/\s+/g, " ").replace(/\*/g, "").trim()).toUpperCase()
    )
    .sort(compareText)
    .slice(0, 8);
}

function inferCorridors(rows: PriceListPricingRow[]) {
  const source = rows.flatMap((row) => [...row.rawProductNames, ...row.sourceCodes]).join(" ");
  return [...new Set((source.match(/\b1[1-9]\b/g) ?? []))].sort(compareText);
}

function productCodeSummary(row: PriceListPricingRow | undefined) {
  if (!row) return { design: "Code unavailable", color: "Code unavailable", material: "Code unavailable" };
  const design = row.designStyle?.trim() || "Code unavailable";

  const color = row.colorRaw.join(" ").match(/\b([A-Z]{2,6})\b/i)?.[1]?.toUpperCase() ?? "Code unavailable";
  const material = row.materialRaw?.trim().toUpperCase() || row.material || "Code unavailable";
  return { design, color, material };
}

function minRow(rows: PriceListPricingRow[], group: MaterialGroup, mode: PriceMode) {
  return rows
    .filter((row) => row.materialColor === group)
    .sort((a, b) => priceFor(a, mode) - priceFor(b, mode))[0];
}

function findComparableRow(
  selectedRow: PriceListPricingRow,
  comparisonRows: PriceListPricingRow[]
) {
  const design = normalizeKey(selectedRow.designStyle);
  const material = normalizeKey(selectedRow.material);
  const materialColor = normalizeKey(selectedRow.materialColor);
  const colorBrand = normalizeKey(selectedRow.colorBrand);
  const candidates = comparisonRows.filter(
    (row) =>
      normalizeKey(row.designStyle) === design &&
      normalizeKey(row.material) === material
  );

  return (
    candidates.find(
      (row) =>
        normalizeKey(row.materialColor) === materialColor &&
        normalizeKey(row.colorBrand) === colorBrand
    ) ??
    candidates.find((row) => normalizeKey(row.materialColor) === materialColor) ??
    candidates[0]
  );
}

function rowMatchesSearch(row: PriceListPricingRow, query: string) {
  if (!query) return true;
  return [
    row.designType,
    row.brand,
    row.designStyle,
    row.material,
    row.materialColor,
    row.colorBrand,
    row.availableColors.join(" "),
    row.rawProductNames.join(" "),
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function uniqueValues<T>(rows: T[], getter: (row: T) => string) {
  return [...new Set(rows.map(getter).filter(Boolean))].sort(compareText);
}

function groupDesignRows(rows: PriceListPricingRow[], mode: PriceMode) {
  const polycarbonateBasis = usesPolycarbonatePriceBasis(rows[0]?.code ?? "");
  const groups = new Map<string, DesignRow>();

  for (const row of rows) {
    const key = `${row.designType}|${row.brand}|${row.designStyle}`;
    const current =
      groups.get(key) ||
      ({
        id: key.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        designType: row.designType,
        displayCategory: priceDisplayCategory(row),
        progressiveTier:
          priceDisplayCategory(row) === "Progressive Designs"
            ? progressiveTierFor(row)
            : undefined,
        brand: row.brand,
        designStyle: row.designStyle,
        rows: [],
        recommended: false,
        outsourced: false,
      } satisfies DesignRow);
    current.rows.push(row);
    current.recommended = current.recommended || row.recommended;
    current.outsourced = current.outsourced || row.outsourced;
    groups.set(key, current);
  }

  return [...groups.values()].map((group) => ({
    ...group,
    clearFrom: polycarbonateBasis
      ? lowestPolycarbonateRow(group.rows, "Clear", mode)
      : minRow(group.rows, "Clear", mode),
    photoFrom: polycarbonateBasis
      ? lowestPolycarbonateRow(group.rows, "Photochromic", mode)
      : minRow(group.rows, "Photochromic", mode),
    polarizedFrom: polycarbonateBasis
      ? lowestPolycarbonateRow(group.rows, "Polarized", mode)
      : minRow(group.rows, "Polarized", mode),
  }));
}

function sortDesignRows(
  rows: DesignRow[],
  sort: { key: SortKey; direction: SortDirection } | null,
  mode: PriceMode
) {
  return [...rows].sort((a, b) => {
    if (!sort) {
      return (
        comparePriceDisplayCategory(a.displayCategory, b.displayCategory) ||
        (a.progressiveTier && b.progressiveTier
          ? compareProgressiveTier(a.progressiveTier, b.progressiveTier)
          : 0) ||
        compareBrandDisplayOrder(a.brand, b.brand) ||
        compareDesignStyleByBusinessOrder(a, b)
      );
    }

    const direction = sort.direction === "asc" ? 1 : -1;
    const value =
      sort.key === "clear"
        ? priceFor(a.clearFrom, mode) - priceFor(b.clearFrom, mode)
        : sort.key === "photochromic"
          ? priceFor(a.photoFrom, mode) - priceFor(b.photoFrom, mode)
          : sort.key === "polarized"
            ? priceFor(a.polarizedFrom, mode) - priceFor(b.polarizedFrom, mode)
            : compareText(String(a[sort.key]), String(b[sort.key]));

    return direction * value || compareDesignStyleByBusinessOrder(a, b);
  });
}

function inlineMarker(label: string, recommended: boolean, outsourced: boolean) {
  return (
    <span className="inline-flex items-center gap-1">
      <span>{label}</span>
      {recommended ? <span className="text-[#7a5a18]">★</span> : null}
      {outsourced ? <span className="text-[#8a4f28]">➜</span> : null}
    </span>
  );
}

function SelectFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 rounded-[2px] border border-[#eadfce] bg-white/80 p-3">
      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8a7654]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-full border border-[#d7c5a8] bg-white px-3 text-sm font-semibold text-[#122033] outline-none transition focus:border-[#8a7654] focus:ring-2 focus:ring-[#d4c09a]/45"
      >
        <option value="All">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {label.toLowerCase().includes("material")
              ? materialDisplay(option)
              : normalizeDisplayName(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function AvailabilitySelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: AvailabilityFilter;
  onChange: (value: AvailabilityFilter) => void;
}) {
  return (
    <label className="grid gap-1.5 rounded-[2px] border border-[#eadfce] bg-white/80 p-3">
      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8a7654]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as AvailabilityFilter)}
        className="h-10 rounded-full border border-[#d7c5a8] bg-white px-3 text-sm font-semibold text-[#122033] outline-none transition focus:border-[#8a7654] focus:ring-2 focus:ring-[#d4c09a]/45"
      >
        <option value="all">All</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
    </label>
  );
}

function normalizeDisplayName(value: string) {
  const raw = String(value ?? "").trim();
  if (!raw) return raw;
  if (/^everday b$/i.test(raw)) return "Everyday B";
  if (/workspace\/comptuer/i.test(raw)) return "Workspace/Computer";
  if (/^tecshield/i.test(raw)) return raw.replace(/^tecshield/i, "TechShield");
  if (/^techshield/i.test(raw)) return raw.replace(/^techshield/i, "TechShield");
  return raw;
}

function isInternalMaterialCode(value: string) {
  const normalized = String(value ?? "").trim().toUpperCase();
  if (!normalized) return false;
  if (["PPC", "S76"].includes(normalized)) return true;
  return /^[A-Z]{1,4}\d{1,3}$/.test(normalized);
}

function BrandGroupHeader({ label }: { label: string }) {
  const src = brandLogoSrc(label);
  const normalizedLabel = label.trim().toUpperCase();
  const isSquareCanvasLogo = ["HOYA", "IOT"].includes(normalizedLabel);
  const showTextLabel = ![
    "ARTISAN",
    "HOYA",
    "SHAMIR",
    "TOKAI",
    "CRIZAL",
    "NEWTON",
    "SEQUEL BY NEWTON",
    "VARILUX",
    "NEUROLENS",
    "IOT",
  ].includes(normalizedLabel);

  return (
    <div className="flex min-h-10 items-center gap-3">
      {src ? (
        isSquareCanvasLogo ? (
          <span className="relative flex h-16 w-48 items-center justify-center overflow-hidden rounded-[2px] border border-[#eadfce] bg-white px-3">
            <Image
              src={src}
              alt={`${label} logo`}
              width={160}
              height={160}
              className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 object-contain"
            />
          </span>
        ) : (
          <span className="flex h-16 w-48 items-center justify-center rounded-[2px] border border-[#eadfce] bg-white px-4">
            <Image
              src={src}
              alt={`${label} logo`}
              width={180}
              height={44}
              className="max-h-9 w-auto max-w-40 object-contain"
            />
          </span>
        )
      ) : null}
      {showTextLabel ? (
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#8a7654]">
          {label}
        </span>
      ) : null}
    </div>
  );
}

export default function InteractivePriceListDashboard({
  priceList,
  comparisonPriceList,
  previewAccountNumber,
  showAccountDrillDownNotice = false,
}: {
  priceList: GeneratedPriceListData;
  comparisonPriceList?: GeneratedPriceListData | null;
  previewAccountNumber?: string;
  showAccountDrillDownNotice?: boolean;
}) {
  const listCode = String(priceList.code ?? "").trim().toUpperCase();
  const polycarbonateBasis = usesPolycarbonatePriceBasis(listCode);
  const isPackageList = isPackagePriceListCode(listCode);
  const programTitle = resolveProgramTitle(listCode || "PRICING");
  const programMeta = resolveProgramMeta(listCode || "PRICING");
  const [viewBy, setViewBy] = useState<ViewBy>("designType");
  const [designType, setDesignType] = useState("All");
  const [brand, setBrand] = useState("All");
  const [designStyle, setDesignStyle] = useState("All");
  const [query, setQuery] = useState("");
  const [materialAvailable, setMaterialAvailable] = useState("All");
  const [hasPhotochromic, setHasPhotochromic] = useState<AvailabilityFilter>("all");
  const [hasPolarized, setHasPolarized] = useState<AvailabilityFilter>("all");
  const [colorBrand, setColorBrand] = useState("All");
  const [priceMode, setPriceMode] = useState<PriceMode>("edged");
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const queryText = query.trim().toLowerCase();
  const customerRows = useMemo(
    () => priceList.rows.filter((row) => !isCoppertoneRow(row)),
    [priceList.rows]
  );
  const comparisonRows = useMemo(
    () => (comparisonPriceList?.rows ?? []).filter((row) => !isCoppertoneRow(row)),
    [comparisonPriceList?.rows]
  );

  const baseFilteredRows = useMemo(
    () =>
      customerRows.filter((row) => {
        if (materialDisplay(row.material) === "PFT") return false;
        if (designType !== "All" && row.designType !== designType) return false;
        if (brand !== "All" && row.brand !== brand) return false;
        if (designStyle !== "All" && row.designStyle !== designStyle) return false;
        if (queryText && !rowMatchesSearch(row, queryText)) return false;
        return true;
      }),
    [customerRows, designType, brand, designStyle, queryText]
  );

  const designRows = useMemo(() => {
    const grouped = sortDesignRows(
      groupDesignRows(baseFilteredRows, priceMode),
      sort,
      priceMode
    );
    return grouped.filter((row) => {
      if (materialAvailable !== "All" && !row.rows.some((entry) => materialDisplay(entry.material) === materialAvailable)) return false;
      if (colorBrand !== "All" && !row.rows.some((entry) => entry.colorBrand === colorBrand)) return false;

      const hasPhoto = row.rows.some((entry) => entry.materialColor === "Photochromic");
      const hasPolar = row.rows.some((entry) => entry.materialColor === "Polarized");
      if (hasPhotochromic === "yes" && !hasPhoto) return false;
      if (hasPhotochromic === "no" && hasPhoto) return false;
      if (hasPolarized === "yes" && !hasPolar) return false;
      if (hasPolarized === "no" && hasPolar) return false;
      return true;
    });
  }, [
    baseFilteredRows,
    priceMode,
    sort,
    materialAvailable,
    colorBrand,
    hasPhotochromic,
    hasPolarized,
  ]);

  const options = useMemo(() => {
    const rows = customerRows;
    const dependentBrands = uniqueValues(
      rows.filter(
        (row) =>
          (designType === "All" || row.designType === designType) &&
          (designStyle === "All" || row.designStyle === designStyle) &&
          (!queryText || rowMatchesSearch(row, queryText))
      ),
      (row) => row.brand
    );
    const dependentTypes = uniqueValues(
      rows.filter(
        (row) =>
          (brand === "All" || row.brand === brand) &&
          (designStyle === "All" || row.designStyle === designStyle) &&
          (!queryText || rowMatchesSearch(row, queryText))
      ),
      (row) => row.designType
    );
    const dependentStyles = uniqueValues(
      rows.filter(
        (row) =>
          (brand === "All" || row.brand === brand) &&
          (designType === "All" || row.designType === designType) &&
          (!queryText || rowMatchesSearch(row, queryText))
      ),
      (row) => row.designStyle
    );
    const materialOptions = uniqueValues(
      baseFilteredRows.filter((row) => !isInternalMaterialCode(row.material)),
      (row) => materialDisplay(row.material)
    ).sort(compareMaterial);
    const colorBrandOptions = uniqueValues(baseFilteredRows, (row) => row.colorBrand);
    return {
      brands: dependentBrands,
      designTypes: dependentTypes,
      designStyles: dependentStyles,
      materials: materialOptions,
      colorBrands: colorBrandOptions,
    };
  }, [customerRows, baseFilteredRows, brand, designType, designStyle, queryText]);

  const groupedSections = useMemo(() => {
    const map = new Map<string, Map<string, DesignRow[]>>();
    for (const row of designRows) {
      const top = viewBy === "designType" ? row.displayCategory : row.brand;
      const nested =
        viewBy === "designType"
          ? `${row.progressiveTier ?? ""}|${row.brand}`
          : `${row.displayCategory}|${row.progressiveTier ?? ""}`;
      if (!map.has(top)) map.set(top, new Map());
      const nestedMap = map.get(top)!;
      nestedMap.set(nested, [...(nestedMap.get(nested) ?? []), row]);
    }

    return [...map.entries()]
      .sort(([a], [b]) =>
        viewBy === "brand"
          ? compareBrandDisplayOrder(a, b)
          : comparePriceDisplayCategory(
              a as PriceDisplayCategory,
              b as PriceDisplayCategory
            )
      )
      .map(([section, nested]) => ({
        section,
        nestedGroups: [...nested.entries()]
          .map(([key, rows]) => {
            const [first, second] = key.split("|");
            return viewBy === "designType"
              ? {
                  label: second,
                  tier: (first || undefined) as ProgressiveTier | undefined,
                  category: section as PriceDisplayCategory,
                  rows,
                }
              : {
                  label: first,
                  tier: (second || undefined) as ProgressiveTier | undefined,
                  category: first as PriceDisplayCategory,
                  rows,
                };
          })
          .sort((a, b) => {
            if (a.tier && b.tier) {
              const tierComparison = compareProgressiveTier(a.tier, b.tier);
              if (tierComparison) return tierComparison;
            } else if (a.tier) {
              return -1;
            } else if (b.tier) {
              return 1;
            }
            return viewBy === "designType"
              ? compareBrandDisplayOrder(a.label, b.label)
              : comparePriceDisplayCategory(a.category, b.category);
          }),
      }));
  }, [designRows, viewBy]);

  const toggleExpanded = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  const toggleSort = (key: SortKey) => {
    setSort((current) =>
      current?.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const sortableHeaders: Array<{ key?: SortKey; label: string }> = [
    { key: "designType", label: "Design Type" },
    { key: "brand", label: "Brand" },
    { key: "designStyle", label: "Design Style" },
    {
      key: "clear",
      label: polycarbonateBasis
        ? isPackageList
          ? "Poly Package"
          : "Poly Clear"
        : isPackageList
          ? "Package Price"
          : "Clear",
    },
    {
      key: "photochromic",
      label: polycarbonateBasis
        ? "Poly Photo"
        : isPackageList
          ? "Photo Upgrade"
          : "Photochromic",
    },
    {
      key: "polarized",
      label: polycarbonateBasis
        ? "Poly Polarized"
        : isPackageList
          ? "Polar Upgrade"
          : "Polarized",
    },
    { label: "Actions" },
  ];

  return (
    <div className="grid gap-8">
      <section className="rounded-[2px] border border-[#dfd2bf] bg-[#fff8ef] p-4 shadow-[0_10px_26px_rgba(18,32,51,0.06)]">
        <div className="flex flex-wrap gap-2">
          {[
            ["ar-coatings", "View Anti-Reflective Coatings"],
            ["edging-services", "View Edging Services"],
          ].map(([target, label]) => (
            <button
              key={target}
              type="button"
              onClick={() =>
                document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="inline-flex min-h-9 items-center rounded-full border border-[#cfb88d] bg-[#122033] px-4 text-xs font-bold text-white transition hover:shadow-[0_0_18px_rgba(18,32,51,0.28)]"
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs leading-5 text-[#625b53]">
          This online price guide is provided for convenience and may contain errors or omissions. Artisan Lab Network reserves the right to correct pricing errors, update product availability, and change pricing at any time without notice. Final pricing is determined by the active lab billing system and confirmed order details.
        </p>
      </section>

      <section className="rounded-[2px] border border-[#dfd2bf] bg-[#fbf8f3]/94 shadow-[0_22px_60px_rgba(18,32,51,0.08)]">
        <div className="grid gap-5 border-b border-[#dfd2bf] p-4 md:p-6 xl:grid-cols-[0.9fr_1.1fr] xl:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">
              {programTitle}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#122033] md:text-3xl">
              Price Quote Builder
            </h2>
            {showAccountDrillDownNotice ? (
              <p className="mt-3 rounded-[2px] border border-[#cfb88d] bg-[#fff8e8] px-4 py-3 text-sm font-semibold text-[#6f5422]">
                Coming Soon: Drill Down by Account
              </p>
            ) : null}
            {programMeta.packageMark || programMeta.titleLogoSrc ? (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                {programMeta.packageMark ? (
                  <PackageSystemMark variant={programMeta.packageMark} />
                ) : null}
                {programMeta.titleLogoSrc ? (
                  <div className="flex min-h-[72px] w-fit min-w-[180px] items-center justify-center rounded-[2px] border border-[#dfd2bf] bg-white px-5 py-3 shadow-[0_12px_30px_rgba(18,32,51,0.06)]">
                    <Image
                      src={programMeta.titleLogoSrc}
                      alt={`${programTitle} logo`}
                      width={190}
                      height={72}
                      className="max-h-12 w-auto max-w-[180px] object-contain"
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#4d5664]">
              {polycarbonateBasis
                ? `Every price marked + is the lowest available polycarbonate${isPackageList ? " package" : ""} price. Open a row to compare Plastic, Trivex, high-index, photochromic, and polarized choices that may cost more or less.`
                : "Start with design, then open each row to build price by material and clear/photochromic/polarized options."}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                  programMeta.multiplePairEligible
                    ? "border-[#3f6a5a] bg-[#e9f6ef] text-[#1f4f3f]"
                    : "border-[#8f6f50] bg-[#f8eee2] text-[#6f4f34]"
                }`}
              >
                {programMeta.multiplePairEligible
                  ? "Eligible for Artisan Multiple Pair Program"
                  : "Not eligible for Artisan Multiple Pair Program"}
              </span>
              <Link
                href="/policies"
                className="inline-flex items-center rounded-full border border-[#d7c5a8] bg-white px-3 py-1 text-xs font-semibold text-[#122033] hover:bg-[#f7f0e6]"
              >
                View Lab Policies Guide
              </Link>
            </div>
            {programMeta.packageNotes.length ? (
              <div className="mt-3 rounded-[2px] border border-[#e2d3bf] bg-[#fff9ef] p-3 text-xs leading-5 text-[#5f5547]">
                {programMeta.packageNotes.map((note) => (
                  <p key={`${priceList.code}-pkg-note-${note}`}>{note}</p>
                ))}
              </div>
            ) : null}
            {programMeta.ruleNotes.length ? (
              <div className="mt-2 rounded-[2px] border border-[#eadfce] bg-white/80 p-3 text-xs leading-5 text-[#5f5547]">
                {programMeta.ruleNotes.map((note) => (
                  <p key={`${priceList.code}-rule-note-${note}`}>{note}</p>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="grid gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a7654]">
                Search
              </span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search design, brand, material, or color options..."
                className="h-11 rounded-full border border-[#d7c5a8] bg-white px-4 text-sm font-semibold text-[#122033] outline-none transition placeholder:text-[#8b8171] focus:border-[#8a7654] focus:ring-2 focus:ring-[#d4c09a]/45"
              />
            </label>

            <div className="inline-grid grid-cols-2 rounded-full border border-[#d7c5a8] bg-white p-1">
              {[
                ["edged", "Edged and Assembled"],
                ["uncut", "Uncut"],
              ].map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPriceMode(mode as PriceMode)}
                  className={`min-h-9 rounded-full px-3 text-xs font-bold transition ${
                    priceMode === mode
                      ? "bg-[#122033] text-white"
                      : "text-[#4d5664] hover:bg-[#f4eee4]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="sm:col-span-2 sm:justify-self-end">
              <GeneratedPriceListExportButton
                code={listCode}
                priceMode={priceMode}
                previewAccountNumber={previewAccountNumber}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-b border-[#eadfce] p-4 md:grid-cols-2 md:p-6 xl:grid-cols-4">
          <SelectFilter
            label="Step 1: Design Type"
            value={designType}
            options={options.designTypes}
            onChange={setDesignType}
          />
          <SelectFilter
            label="Step 2: Brand"
            value={brand}
            options={options.brands}
            onChange={setBrand}
          />
          <SelectFilter
            label="Step 3: Design Style"
            value={designStyle}
            options={options.designStyles}
            onChange={setDesignStyle}
          />
          <label className="grid gap-1.5 rounded-[2px] border border-[#eadfce] bg-white/80 p-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8a7654]">
              View By
            </span>
            <select
              value={viewBy}
              onChange={(event) => setViewBy(event.target.value as ViewBy)}
              className="h-10 rounded-full border border-[#d7c5a8] bg-white px-3 text-sm font-semibold text-[#122033] outline-none transition focus:border-[#8a7654] focus:ring-2 focus:ring-[#d4c09a]/45"
            >
              <option value="designType">Design Type</option>
              <option value="brand">Brand</option>
            </select>
          </label>
        </div>

        <details className="border-b border-[#eadfce] px-4 py-3 md:px-6">
          <summary className="cursor-pointer text-xs font-bold uppercase tracking-[0.16em] text-[#8a7654]">
            Advanced Filters
          </summary>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <SelectFilter
              label="Material Available"
              value={materialAvailable}
              options={options.materials}
              onChange={setMaterialAvailable}
            />
            <AvailabilitySelect
              label="Photochromic Available"
              value={hasPhotochromic}
              onChange={setHasPhotochromic}
            />
            <AvailabilitySelect
              label="Polarized Available"
              value={hasPolarized}
              onChange={setHasPolarized}
            />
            <SelectFilter
              label="Color Brand Available"
              value={colorBrand}
              options={options.colorBrands}
              onChange={setColorBrand}
            />
          </div>
        </details>

        <div className="flex flex-col gap-2 border-b border-[#eadfce] px-4 py-3 text-xs font-semibold text-[#625b53] md:flex-row md:items-center md:justify-between md:px-6">
          <span>
            Showing {designRows.length.toLocaleString()} top-level design rows
          </span>
          {isPackageList ? (
            <span>Package pricing shown below includes program package rules.</span>
          ) : null}
          {priceMode === "uncut" ? <span>Uncut mode active.</span> : null}
        </div>

        <div className="grid gap-3 p-4 md:p-5">
          <div className="max-h-[66vh] overflow-y-auto pr-1">
            {groupedSections.map((section) => (
            <section key={section.section} className="rounded-[2px] border border-[#e7dccb] bg-white/70">
              <header className="border-b border-[#eadfce] bg-[#f8f1e6] px-4 py-3">
                {viewBy === "brand" ? (
                  <BrandGroupHeader label={section.section} />
                ) : (
                  <h3 className="text-base font-semibold text-[#122033]">{section.section}</h3>
                )}
              </header>
              <div className="grid gap-2 p-3 md:p-3">
                {section.nestedGroups.map((nested, nestedIndex) => (
                  <Fragment key={`${section.section}-${nested.tier ?? "none"}-${nested.label}`}>
                    {nested.tier &&
                    nested.tier !== section.nestedGroups[nestedIndex - 1]?.tier ? (
                      <div className="rounded-[2px] border border-[#cbb58d] bg-[#122033] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white">
                        {nested.tier}
                      </div>
                    ) : null}
                  <div className="rounded-[2px] border border-[#eadfce] bg-white/82">
                    <div className="border-b border-[#f0e6d8] px-3 py-2">
                      {viewBy === "designType" ? (
                        <BrandGroupHeader label={nested.label} />
                      ) : (
                        <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-[#8a7654]">
                          {nested.label}
                        </h4>
                      )}
                    </div>
                    <div className="mobile-scroll-row overflow-x-auto md:overflow-visible">
                      <table className="w-full min-w-[760px] table-fixed border-separate border-spacing-0 text-left text-sm md:min-w-0">
                        <colgroup>
                          <col className="w-[14%]" />
                          <col className="w-[13%]" />
                          <col className="w-[28%]" />
                          <col className="w-[11%]" />
                          <col className="w-[11%]" />
                          <col className="w-[11%]" />
                          <col className="w-[12%]" />
                        </colgroup>
                        <thead>
                          <tr className="bg-[#122033] text-white">
                            {sortableHeaders.map((heading) => (
                              <th
                                key={heading.label}
                                className={`border-r border-[#34455a] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                                  heading.label === "Actions" ? "text-center" : ""
                                }`}
                              >
                                {heading.key ? (
                                  <button
                                    type="button"
                                    onClick={() => toggleSort(heading.key as SortKey)}
                                    className="flex w-full items-center justify-between gap-2 text-left"
                                  >
                                    <span>{heading.label}</span>
                                    <span className="text-[10px] text-[#d9c8aa]">
                                      {sort?.key === heading.key ? (sort.direction === "asc" ? "▲" : "▼") : "↕"}
                                    </span>
                                  </button>
                                ) : (
                                  heading.label
                                )}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {nested.rows.map((row, index) => {
                            const expanded = expandedId === row.id;
                            return (
                              <Fragment key={row.id}>
                                <tr className={index % 2 === 0 ? "bg-white/82" : "bg-[#fffaf2]/82"}>
                                  <td className="border-b border-r border-[#eadfce] px-3 py-2 text-[#2f3744]">
                                    {row.displayCategory}
                                  </td>
                                  <td className="border-b border-r border-[#eadfce] px-3 py-2 text-[#2f3744]">
                                    {row.brand}
                                  </td>
                                  <td className="border-b border-r border-[#eadfce] px-3 py-2 font-semibold text-[#122033]">
                                    {inlineMarker(normalizeDisplayName(row.designStyle), row.recommended, row.outsourced)}
                                    {row.outsourced ? (
                                      <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.08em] text-[#8a4f28]">
                                        Outsourced - additional turnaround time
                                      </span>
                                    ) : null}
                                  </td>
                                  <td className="border-b border-r border-[#eadfce] px-3 py-2 font-bold text-[#122033]">
                                    {startingPriceLabel(row.clearFrom, priceMode)}
                                  </td>
                                  <td className="border-b border-r border-[#eadfce] px-3 py-2 font-bold text-[#122033]">
                                    {startingPriceLabel(row.photoFrom, priceMode)}
                                  </td>
                                  <td className="border-b border-r border-[#eadfce] px-3 py-2 font-bold text-[#122033]">
                                    {startingPriceLabel(row.polarizedFrom, priceMode)}
                                  </td>
                                  <td className="border-b border-[#eadfce] px-2 py-2">
                                    <button
                                      type="button"
                                      onClick={() => toggleExpanded(row.id)}
                                      className="mx-auto inline-flex h-9 w-[110px] items-center justify-center rounded-full border border-[#c9b186] bg-[#122033] px-0 py-0 text-xs font-bold text-white transition hover:bg-[#22364f]"
                                    >
                                      {expanded ? "Hide Builder" : "Build Price"}
                                    </button>
                                  </td>
                                </tr>
                                {expanded ? (
                                  <tr className="bg-[#f9f2e8]">
                                    <td colSpan={7} className="border-b border-[#eadfce] px-3 py-3">
                                      <ExpandedDesignBuilder
                                        designRow={row}
                                        priceMode={priceMode}
                                        listCode={priceList.code}
                                        materialAddOns={priceList.materialAddOns ?? []}
                                        comparisonRows={comparisonRows}
                                      />
                                    </td>
                                  </tr>
                                ) : null}
                              </Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  </Fragment>
                ))}
              </div>
            </section>
            ))}
          </div>
        </div>
      </section>

      <ArCoatingsSection coatings={priceList.arCoatings} listCode={priceList.code} />
      {priceList.code === "M5" || priceList.code === "Y5" ? (
        <ModernFramePricingCalculator priceList={priceList} priceMode={priceMode} />
      ) : null}
      <AddOnSections sections={priceList.addOnSections} />
      {priceList.code === "M5" ? <ModernFramePackageSection /> : null}
      {priceList.code === "Y5" ? <SafetyPackageTierSection /> : null}
      <ChemClipSection />
      <section className="rounded-[2px] border border-[#dfd2bf] bg-white/80 p-4 text-xs leading-5 text-[#625b53]">
        This online price guide is provided for convenience and may contain errors or omissions. Artisan Lab Network reserves the right to correct pricing errors, update product availability, and change pricing at any time without notice. Final pricing is determined by the active lab billing system and confirmed order details.
      </section>
      <ReferenceKey rows={customerRows} />
    </div>
  );
}

function ExpandedDesignBuilder({
  designRow,
  priceMode,
  listCode,
  materialAddOns,
  comparisonRows,
}: {
  designRow: DesignRow;
  priceMode: PriceMode;
  listCode: GeneratedPriceListData["code"];
  materialAddOns: NonNullable<GeneratedPriceListData["materialAddOns"]>;
  comparisonRows: PriceListPricingRow[];
}) {
  const isBlueLightRow = (row: PriceListPricingRow) => {
    const materialToken = String(row.materialRaw || row.material || "").trim().toUpperCase();
    if (/^B[A-Z0-9]{1,4}$/.test(materialToken)) return true;

    const source = [...row.sourceCodes, ...row.rawProductNames, row.materialRaw, row.material]
      .join(" ")
      .toUpperCase();

    return /\bB(?:50|53|60|67|74|PY)\b/.test(source) || /\bB[A-Z]{2,4}\b/.test(source);
  };

  const isPackageList = isPackagePriceListCode(String(listCode ?? ""));
  const includesFrame = ["M5", "Y5"].includes(listCode);
  const [blueLightEnabled, setBlueLightEnabled] = useState(false);
  const materialOptions = useMemo(() => {
    const normalizedMaterialAddOns = materialAddOns
      .map((entry) => ({
        material: entry.material,
        addOn: Number(entry.addOn),
      }))
      .filter((entry) => entry.material && Number.isFinite(entry.addOn));
    const addOnByMaterial = new Map(
      normalizedMaterialAddOns.map((entry) => [normalizeKey(entry.material), entry.addOn])
    );

    const map = new Map<string, MaterialOption>();
    const filteredRows = blueLightEnabled
      ? designRow.rows.filter((row) => isBlueLightRow(row))
      : designRow.rows;

    for (const row of filteredRows) {
      const current = map.get(row.material) ?? {
        material: row.material,
        rows: [],
      };
      current.rows.push(row);
      map.set(row.material, current);
    }

    return [...map.values()]
      .map((entry) => ({
        ...entry,
        clear: minRow(entry.rows, "Clear", priceMode),
        photochromic: minRow(entry.rows, "Photochromic", priceMode),
        polarized: minRow(entry.rows, "Polarized", priceMode),
        addOn: addOnByMaterial.get(normalizeKey(entry.material)),
      }))
      .filter((entry) => {
        const display = materialDisplay(entry.material);
        const rawUpper = String(entry.material ?? "").trim().toUpperCase();
        if (display === "PFT") return false;
        if (["PPC", "S76"].includes(rawUpper)) return false;
        if (/^[A-Z]{1,4}\d{1,3}$/.test(rawUpper)) return false;
        return true;
      })
      .sort((a, b) => compareMaterial(a.material, b.material));
  }, [designRow.rows, priceMode, blueLightEnabled, materialAddOns]);

  const photoFamilies = useMemo(
    () => buildOptionFamilies(designRow.rows, "Photochromic", priceMode),
    [designRow.rows, priceMode]
  );
  const polarizedFamilies = useMemo(
    () => buildOptionFamilies(designRow.rows, "Polarized", priceMode),
    [designRow.rows, priceMode]
  );

  const [selectedMaterial, setSelectedMaterial] = useState(materialOptions[0]?.material ?? "");
  const [selectedCategory, setSelectedCategory] = useState<MaterialGroup>("Clear");
  const [selectedColorFamily, setSelectedColorFamily] = useState("All");
  const [builderMode, setBuilderMode] = useState<PriceMode>(priceMode);

  const selectedRows = useMemo(() => {
    return designRow.rows.filter((row) => {
      if (selectedMaterial && row.material !== selectedMaterial) return false;
      if (row.materialColor !== selectedCategory) return false;
      if (selectedColorFamily !== "All" && row.colorBrand !== selectedColorFamily) return false;
      return true;
    });
  }, [designRow.rows, selectedMaterial, selectedCategory, selectedColorFamily]);

  const selectedPriceRow = useMemo(
    () =>
      [...selectedRows].sort((a, b) => priceFor(a, builderMode) - priceFor(b, builderMode))[0],
    [selectedRows, builderMode]
  );

  const selectedColorFamilies = useMemo(
    () => uniqueValues(selectedRows, (row) => row.colorBrand),
    [selectedRows]
  );

  const versions = useMemo(() => extractDesignVersions(designRow.rows), [designRow.rows]);
  const corridors = useMemo(() => inferCorridors(designRow.rows), [designRow.rows]);
  const codeRow = selectedPriceRow ?? designRow.rows[0];
  const code = productCodeSummary(codeRow);
  const g6ComparisonRow = useMemo(
    () =>
      listCode === "B5" && selectedPriceRow
        ? findComparableRow(selectedPriceRow, comparisonRows)
        : undefined,
    [listCode, selectedPriceRow, comparisonRows]
  );
  const packagePrice = priceFor(selectedPriceRow, builderMode);
  const g6ComparisonPrice = priceFor(g6ComparisonRow, builderMode);
  const g6Savings =
    Number.isFinite(packagePrice) && Number.isFinite(g6ComparisonPrice)
      ? Math.max(0, g6ComparisonPrice - packagePrice)
      : null;
  const lowestPhoto = photoFamilies[0]?.family ?? "";
  const lowestPhotoNote =
    lowestPhoto.includes("Transitions")
      ? "For this design, Transitions is the lowest available photochromic option."
      : "Photochromic pricing shown in this table reflects the lowest available photochromic option, typically Neochromes unless another product is the only available or lowest available option.";

  return (
    <div className="grid gap-6">
      {isPackageList ? (
        <section className="rounded-[2px] border border-[#e4d5c0] bg-[#fff8ef] p-4">
          <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-[#8a7654]">Package Summary</h4>
          <div className="mt-2 grid gap-1 text-sm text-[#4d5664]">
            <p>
              <span className="font-semibold text-[#122033]">Base package price:</span>{" "}
              {selectedPriceRow ? exactPriceLabel(selectedPriceRow, builderMode) : "—"}
            </p>
            <p>
              <span className="font-semibold text-[#122033]">Included AR:</span>{" "}
              {listCode === "M5" ? "Not included" : "Artisan Emerald"}
            </p>
            {includesFrame ? (
              <p>
                <span className="font-semibold text-[#122033]">Frame package:</span>{" "}
                {listCode === "M5"
                  ? "Includes frame and polycarbonate lenses bundled at reduced package pricing."
                  : "Includes safety frame package and side shields at no additional fee."}
              </p>
            ) : null}
            {listCode === "B5" ? (
              <div className="mt-3 rounded-[2px] border border-[#d9c8a6] bg-white/82 p-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a7654]">
                  G6 Savings Proof
                </p>
                {g6ComparisonRow && g6Savings !== null ? (
                  <p className="mt-2 text-sm leading-6 text-[#4d5664]">
                    G6 equivalent {currency(g6ComparisonPrice)} − B5 package {currency(packagePrice)} ={" "}
                    <span className="font-bold text-[#122033]">{currency(g6Savings)} package savings</span>.
                  </p>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-[#4d5664]">
                    G6 equivalent is not available for this exact build in the current pricing data.
                  </p>
                )}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="rounded-[2px] border border-[#e4d5c0] bg-[#fff8ef] p-4">
        <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-[#8a7654]">Product Code Summary</h4>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
          <p><span className="font-semibold text-[#122033]">Design:</span> {code.design}</p>
          <p><span className="font-semibold text-[#122033]">Color:</span> {code.color}</p>
          <p><span className="font-semibold text-[#122033]">Material:</span> {code.material}</p>
        </div>
        {versions.length > 1 ? (
          <div className="mt-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8a7654]">Available Designs</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {versions.map((version) => (
                <span key={version} className="rounded-full border border-[#decdb0] bg-white px-3 py-1 text-xs font-semibold text-[#122033]">
                  {version}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        {corridors.length ? (
          <div className="mt-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8a7654]">Available Corridors</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {corridors.map((corridor) => (
                <span key={corridor} className="rounded-full border border-[#decdb0] bg-white px-3 py-1 text-xs font-semibold text-[#625b53]">
                  {corridor}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <div className="grid gap-4 rounded-[2px] border border-[#e4d5c0] bg-white/85 p-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="grid gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a7654]">Material</span>
          <select
            value={selectedMaterial}
            onChange={(event) => setSelectedMaterial(event.target.value)}
            className="h-10 rounded-full border border-[#d7c5a8] bg-white px-3 text-sm font-semibold text-[#122033] outline-none focus:border-[#8a7654] focus:ring-2 focus:ring-[#d4c09a]/45"
          >
            {materialOptions.map((option) => (
              <option key={option.material} value={option.material}>
                {materialDisplay(option.material)}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a7654]">
            Material Color
          </span>
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value as MaterialGroup)}
            className="h-10 rounded-full border border-[#d7c5a8] bg-white px-3 text-sm font-semibold text-[#122033] outline-none focus:border-[#8a7654] focus:ring-2 focus:ring-[#d4c09a]/45"
          >
            <option value="Clear">Clear</option>
            <option value="Photochromic">Photochromic</option>
            <option value="Polarized">Polarized</option>
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a7654]">Color Brand</span>
          <select
            value={selectedColorFamily}
            onChange={(event) => setSelectedColorFamily(event.target.value)}
            className="h-10 rounded-full border border-[#d7c5a8] bg-white px-3 text-sm font-semibold text-[#122033] outline-none focus:border-[#8a7654] focus:ring-2 focus:ring-[#d4c09a]/45"
          >
            <option value="All">All</option>
            {selectedColorFamilies.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-[2px] border border-[#eadfce] bg-[#fff8ee] p-3 text-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a7654]">
            Current Price
          </p>
          <p className="mt-1 text-lg font-bold text-[#122033]">
            {selectedPriceRow ? exactPriceLabel(selectedPriceRow, builderMode) : "—"}
          </p>
          <p className="mt-1 text-xs text-[#6d6252]">
            {builderMode === "edged" ? "Edged and Assembled" : "Uncut"}
          </p>
        </div>
      </div>

      <div className="inline-grid max-w-[280px] grid-cols-2 rounded-full border border-[#d7c5a8] bg-white p-1">
        {[
          ["edged", "Edged and Assembled"],
          ["uncut", "Uncut"],
        ].map(([mode, label]) => (
          <button
            key={`${designRow.id}-${mode}`}
            type="button"
            onClick={() => setBuilderMode(mode as PriceMode)}
            className={`min-h-9 rounded-full px-3 text-xs font-bold transition ${
              builderMode === mode ? "bg-[#122033] text-white" : "text-[#4d5664] hover:bg-[#f4eee4]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setBlueLightEnabled((value) => !value)}
          className={`inline-flex min-h-9 items-center rounded-full border px-4 text-xs font-bold transition ${
            blueLightEnabled
              ? "border-[#4f6ea0] bg-[#1a345a] text-white shadow-[0_0_16px_rgba(74,132,215,0.35)]"
              : "border-[#d7c5a8] bg-white text-[#122033] hover:bg-[#f4eee4]"
          }`}
        >
          {blueLightEnabled ? "Blue Light Substrate Enabled" : "Enable Blue Light Material"}
        </button>
      </div>

      <section id="materials" className="rounded-[2px] border border-[#eadfce] bg-white/85 p-4">
        <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-[#8a7654]">Materials</h4>
        <p className="mt-2 text-xs leading-5 text-[#625b53]">{lowestPhotoNote}</p>
        <div className="mt-3 grid gap-2">
          {materialOptions.map((materialOption) => (
            <div
              key={materialOption.material}
              className={`grid gap-2 rounded-[2px] border p-3 md:grid-cols-5 md:items-start ${
                selectedMaterial === materialOption.material
                  ? "border-[#c9b186] bg-[#fff8ee]"
                  : "border-[#eadfce] bg-white"
              }`}
            >
              <div className="font-semibold text-[#122033]">{materialDisplay(materialOption.material)}</div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8a7654]">Clear</p>
                <p className="font-bold text-[#122033]">
                  {startingPriceLabel(materialOption.clear, builderMode)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8a7654]">Photochromic</p>
                <p className="font-bold text-[#122033]">
                  {startingPriceLabel(materialOption.photochromic, builderMode)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8a7654]">Polarized</p>
                <p className="font-bold text-[#122033]">
                  {startingPriceLabel(materialOption.polarized, builderMode)}
                </p>
              </div>
              <div />
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <OptionFamilyPanel id="photo-options" title="Photochromic Options" families={photoFamilies} priceMode={builderMode} />
        <OptionFamilyPanel id="polar-options" title="Polarized Options" families={polarizedFamilies} priceMode={builderMode} />
      </section>

      <section className="rounded-[2px] border border-[#eadfce] bg-white/85 p-4">
        <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-[#8a7654]">Reference Links</h4>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              document.getElementById("ar-coatings")?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
            className="inline-flex min-h-9 items-center rounded-full border border-[#d7c5a8] bg-white px-4 text-xs font-bold text-[#122033] transition hover:bg-[#f4eee4]"
          >
            View AR Coating Price Guide
          </button>
          <button
            type="button"
            onClick={() =>
              document.getElementById("mirror-treatments")?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
            className="inline-flex min-h-9 items-center rounded-full border border-[#d7c5a8] bg-white px-4 text-xs font-bold text-[#122033] transition hover:bg-[#f4eee4]"
          >
            View Mirror Treatments
          </button>
          <button
            type="button"
            onClick={() =>
              document.getElementById("available-add-ons")?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
            className="inline-flex min-h-9 items-center rounded-full border border-[#d7c5a8] bg-white px-4 text-xs font-bold text-[#122033] transition hover:bg-[#f4eee4]"
          >
            View Available Add-Ons
          </button>
        </div>
      </section>
    </div>
  );
}

function buildOptionFamilies(
  rows: PriceListPricingRow[],
  group: MaterialGroup,
  mode: PriceMode
): OptionFamily[] {
  const map = new Map<string, OptionFamily>();
  for (const row of rows) {
    if (optionGroupForRow(row) !== group) continue;
    const key = group === "Photochromic" ? normalizePhotoFamily(row.colorBrand || "Other Photo") : row.colorBrand || "Other";
    const current =
      map.get(key) ||
      ({
        family: key,
        rows: [],
        colors: [],
        materials: [],
      } satisfies OptionFamily);
    current.rows.push(row);
    current.colors = [...new Set([...current.colors, ...row.availableColors])].sort(compareText);
    current.materials = [...new Set([...current.materials, row.material])].sort(compareMaterial);
    map.set(key, current);
  }

  return [...map.values()]
    .map((item) => ({
      ...item,
      from: [...item.rows].sort((a, b) => priceFor(a, mode) - priceFor(b, mode))[0],
    }))
    .sort((a, b) => compareText(a.family, b.family));
}

function OptionFamilyPanel({
  id,
  title,
  families,
  priceMode,
}: {
  id?: string;
  title: string;
  families: OptionFamily[];
  priceMode: PriceMode;
}) {
  const hasPolarizedMirrorOptions =
    title === "Polarized Options" &&
    families.some((family) => /MIRROR/i.test(family.family));

  return (
    <section id={id} className="rounded-[2px] border border-[#eadfce] bg-white/85 p-4">
      <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-[#8a7654]">{title}</h4>
      {hasPolarizedMirrorOptions ? (
        <p className="mt-2 text-xs leading-5 text-[#625b53]">
          Polarized mirror options include the polarized lens plus a mirror coating.
        </p>
      ) : null}
      <div className="mt-3 grid gap-2">
        {families.length === 0 ? (
          <p className="text-sm text-[#6d6252]">No options listed.</p>
        ) : (
          families.map((family) => (
            <div key={`${title}-${family.family}`} className="rounded-[2px] border border-[#eadfce] bg-[#fffaf4] p-3">
              <div className="flex items-start justify-between gap-2">
                <h5 className="font-semibold text-[#122033]">{family.family}</h5>
                <p className="font-bold text-[#122033]">{startingPriceLabel(family.from, priceMode)}</p>
              </div>
              <p className="mt-1 text-xs text-[#6d6252]">
                Materials: {family.materials.map((material) => materialDisplay(material)).join(", ") || "—"}
              </p>
              <p className="mt-1 text-xs text-[#6d6252]">
                Available colors: {family.colors.join(", ") || "—"}
              </p>
              {title === "Polarized Options" && /MIRROR/i.test(family.family) ? (
                <p className="mt-1 text-xs text-[#6d6252]">
                  Includes Polarized Lens + Mirror Coating.
                </p>
              ) : null}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function ModernFramePricingCalculator({
  priceList,
  priceMode,
}: {
  priceList: GeneratedPriceListData;
  priceMode: PriceMode;
}) {
  const tierSection = priceList.addOnSections.find((section) =>
    /frame tier|safety vendor tier/i.test(section.title)
  );
  const tierOptions = (tierSection?.items ?? []).filter((item) =>
    !item.href && !/side shields/i.test(item.name)
  );
  const packageOptions = useMemo(
    () =>
      [...priceList.rows]
        .filter((row) => priceFor(row, priceMode) > 0)
        .sort((a, b) => priceFor(a, priceMode) - priceFor(b, priceMode))
        .slice(0, 60),
    [priceList.rows, priceMode]
  );
  const [selectedPackageId, setSelectedPackageId] = useState(packageOptions[0]?.id ?? "");
  const [selectedTierName, setSelectedTierName] = useState(tierOptions[0]?.name ?? "");
  const selectedPackage = packageOptions.find((row) => row.id === selectedPackageId) ?? packageOptions[0];
  const selectedTier = tierOptions.find((item) => item.name === selectedTierName) ?? tierOptions[0];
  const packagePrice = selectedPackage ? priceFor(selectedPackage, priceMode) : 0;
  const tierPrice = selectedTier ? addOnPriceToNumber(selectedTier.price) : 0;
  const total = packagePrice + tierPrice;

  if (!packageOptions.length || !tierOptions.length) return null;

  return (
    <section className="rounded-[2px] border border-[#dfd2bf] bg-white/88 p-5 shadow-[0_16px_45px_rgba(18,32,51,0.08)]">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8a7654]">
        Frame Price Quote Builder
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#122033]">
        {priceList.code === "Y5" ? "Safety frame package estimate" : "Modern frame system estimate"}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5f6875]">
        Select a frame/package price and frame tier. The quote builder uses generated {priceList.code} pricing and the current tier guide.
      </p>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.72fr_0.72fr]">
        <label className="grid gap-2 text-sm font-semibold text-[#122033]">
          Select Frame / Package
          <select
            value={selectedPackage?.id ?? ""}
            onChange={(event) => setSelectedPackageId(event.target.value)}
            className="min-h-11 rounded-[2px] border border-[#dfd2bf] bg-[#fff8ef] px-3 text-sm font-medium text-[#122033]"
          >
            {packageOptions.map((row) => (
              <option key={row.id} value={row.id}>
                {row.designStyle} · {row.material} · {row.materialColor} · {exactPriceLabel(row, priceMode)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-[#122033]">
          Select Tier
          <select
            value={selectedTier?.name ?? ""}
            onChange={(event) => setSelectedTierName(event.target.value)}
            className="min-h-11 rounded-[2px] border border-[#dfd2bf] bg-[#fff8ef] px-3 text-sm font-medium text-[#122033]"
          >
            {tierOptions.map((tier) => (
              <option key={tier.name} value={tier.name}>
                {tier.name} · {typeof tier.price === "number" ? currency(tier.price) : tier.price}
              </option>
            ))}
          </select>
        </label>
        <div className="rounded-[2px] border border-[#d8c49b] bg-[#fff8ef] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8a7654]">Estimated Selling Price</p>
          <p className="mt-2 text-sm text-[#5f6875]">
            {currency(packagePrice)} + {currency(tierPrice)}
          </p>
          <p className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-[#122033]">{currency(total)}</p>
        </div>
      </div>
    </section>
  );
}

function ArCoatingsSection({
  coatings,
  listCode,
}: {
  coatings: PriceListArCoating[];
  listCode: GeneratedPriceListData["code"];
}) {
  const [showOtherCoatings, setShowOtherCoatings] = useState(false);
  const mirrorCodes = useMemo(
    () =>
      new Set(
        [
          "RSM",
          "RDM",
          "PKM",
          "ORM",
          "BKM",
          "BLM",
          "CHM",
          "FSM",
          "FGM",
          "CHR",
          "CAM",
          "FRM",
          "GDM",
          "GRM",
          "MIR",
          "RGM",
          "SEM",
          "SLM",
          "MMI",
          "GMR",
        ].map((value) => value.toUpperCase())
      ),
    []
  );
  const protectionCodes = useMemo(() => new Set(["DDE"]), []);
  const isAllowedArFamily = (family: string) =>
    ["Artisan", "TechShield / Unity", "Tokai", "Crizal", "Hoya", "Shamir", "Neurolens"].includes(family);
  const groupedCoatings = useMemo(() => {
    const grouped = new Map<string, PriceListArCoating[]>();
    for (const coating of coatings) {
      if (coating.unresolved) continue;
      const code = String(coating.code || "").trim().toUpperCase();
      if (mirrorCodes.has(code)) continue;
      if (protectionCodes.has(code)) continue;
      const family = coatingDisplayFamily(coating);
      if (!isAllowedArFamily(family)) continue;
      const current = grouped.get(family) ?? [];
      current.push({
        ...coating,
        name: normalizeDisplayName(coating.name),
      });
      grouped.set(family, current);
    }

    const orderedFamilies =
      String(listCode).toUpperCase() === "NL"
        ? ["Neurolens"]
        : ["Artisan", "TechShield / Unity", "Tokai", "Crizal", "Hoya", "Shamir"];
    return orderedFamilies
      .map((family) => {
        const items = grouped.get(family) ?? [];
        return {
          family,
          items: items
            .sort((a, b) => compareText(a.name, b.name))
            .filter((item, index, all) => index === all.findIndex((other) => other.name === item.name)),
        };
      })
      .filter((group) => group.items.length > 0);
  }, [coatings, listCode, mirrorCodes, protectionCodes]);

  const protectionItems = useMemo(() => {
    const map = new Map<string, PriceListArCoating>();
    for (const coating of coatings) {
      if (coating.unresolved) continue;
      const code = String(coating.code || "").trim().toUpperCase();
      if (!protectionCodes.has(code)) continue;
      const key = normalizeKey(coating.name);
      const current = map.get(key);
      if (!current || coating.price > current.price) {
        map.set(key, { ...coating, name: normalizeDisplayName(coating.name) });
      }
    }
    return [...map.values()].sort((a, b) => compareText(a.name, b.name));
  }, [coatings, protectionCodes]);

  const mirrorItems = useMemo(() => {
    const coloredMirrorCodes = new Set(
      [
        "RSM",
        "RDM",
        "PKM",
        "ORM",
        "BKM",
        "BLM",
        "CHM",
        "CHR",
        "CAM",
        "FSM",
        "FGM",
        "FMR",
        "GDM",
        "GRM",
        "MIR",
        "RGM",
        "SEM",
        "SLM",
      ].map((value) => value.toUpperCase())
    );
    const map = new Map<string, PriceListArCoating>();
    for (const coating of coatings) {
      if (coating.unresolved) continue;
      const code = String(coating.code || "").trim().toUpperCase();
      if (!mirrorCodes.has(code)) continue;
      const mappedName = code === "MMI"
        ? "Mirror Matched"
        : code === "GMR"
          ? "Gradient Mirror"
          : coloredMirrorCodes.has(code)
            ? "Colored Mirrors"
            : normalizeDisplayName(coating.name);
      const key = normalizeKey(mappedName);
      const current = map.get(key);
      if (!current || coating.price > current.price) {
        map.set(key, { ...coating, name: mappedName });
      }
    }
    return [...map.values()].sort((a, b) => compareText(a.name, b.name));
  }, [coatings, mirrorCodes]);
  const preferredFamilies = new Set(
    String(listCode).toUpperCase() === "NL" ? ["Neurolens"] : ["Artisan", "TechShield / Unity"]
  );
  const primaryGroups = groupedCoatings.filter((group) => preferredFamilies.has(group.family));
  const otherGroups = groupedCoatings.filter((group) => !preferredFamilies.has(group.family));
  const hasPrimaryGroups = primaryGroups.length > 0;
  const visibleOtherGroups = hasPrimaryGroups
    ? (showOtherCoatings ? otherGroups : [])
    : otherGroups;
  const totalDisplayedItems = groupedCoatings.reduce((sum, group) => sum + group.items.length, 0);
  const addOnsEyebrow = `${listCode} Add-Ons`;

  return (
    <section id="ar-coatings" className="rounded-[2px] border border-[#dfd2bf] bg-[#fbf8f3]/94 p-4 shadow-[0_22px_60px_rgba(18,32,51,0.08)] md:p-6">
      <SectionHeading title="AR Coatings" eyebrow={addOnsEyebrow} />
      {totalDisplayedItems === 0 ? (
        <div className="mt-4 rounded-[2px] border border-[#e3c9ac] bg-[#fff4e9] p-3 text-sm text-[#6f4f34]">
          No AR coating schedule was found for this price list.
        </div>
      ) : null}
      <div className="mt-4 grid gap-5">
        {primaryGroups.map((group) => (
          <div key={group.family}>
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[#8a7654]">
              {group.family}
            </h3>
            <p className="mt-1 text-xs font-semibold leading-5 text-[#625b53]">
              {arTurnaroundNote(group.family)}
            </p>
            <div className="mt-2 grid gap-3 rounded-[2px] border border-[#eadfce] bg-white/72 p-3 md:grid-cols-2 xl:grid-cols-3">
              {group.items.map((coating) => (
                <article
                  key={`${coating.brandFamily}-${coating.name}`}
                  className="rounded-[2px] border border-[#eadfce] bg-white/82 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-base font-bold text-[#122033]">
                      {inlineMarker(normalizeDisplayName(coating.name), coating.recommended, coating.outsourced)}
                    </h4>
                    <p className="text-lg font-bold text-[#122033]">{currency(coating.price)}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
        {otherGroups.length ? (
          <div className="rounded-[2px] border border-[#eadfce] bg-white/72 p-3">
            {hasPrimaryGroups ? (
              <button
                type="button"
                onClick={() => setShowOtherCoatings((value) => !value)}
                className="inline-flex min-h-9 items-center rounded-full border border-[#d7c5a8] bg-white px-4 text-xs font-bold text-[#122033] transition hover:bg-[#f4eee4]"
              >
                {showOtherCoatings ? "Hide Other AR Options" : "See More AR Options"}
              </button>
            ) : (
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a7654]">
                Available Coatings
              </p>
            )}
            {visibleOtherGroups.length ? (
              <div className="mt-4 grid gap-4">
                {visibleOtherGroups.map((group) => (
                  <div key={`other-${group.family}`}>
                    <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[#8a7654]">
                      {group.family}
                    </h3>
                    <p className="mt-1 text-xs font-semibold leading-5 text-[#625b53]">
                      {arTurnaroundNote(group.family)}
                    </p>
                    <div className="mt-2 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {group.items.map((coating) => (
                        <article
                          key={`${coating.brandFamily}-${coating.name}`}
                          className="rounded-[2px] border border-[#eadfce] bg-white/82 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="text-base font-bold text-[#122033]">
                              {inlineMarker(normalizeDisplayName(coating.name), coating.recommended, coating.outsourced)}
                            </h4>
                            <p className="text-lg font-bold text-[#122033]">{currency(coating.price)}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {protectionItems.length ? (
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[#8a7654]">
              Protection Options
            </h3>
            <div className="mt-2 grid gap-3 rounded-[2px] border border-[#eadfce] bg-white/72 p-3 md:grid-cols-2 xl:grid-cols-3">
              {protectionItems.map((item) => (
                <article
                  key={`protection-${item.name}`}
                  className="rounded-[2px] border border-[#eadfce] bg-white/82 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-base font-bold text-[#122033]">
                      {normalizeDisplayName(item.name)}
                    </h4>
                    <p className="text-lg font-bold text-[#122033]">{currency(item.price)}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {mirrorItems.length ? (
          <div id="mirror-treatments">
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[#8a7654]">
              Mirror Coatings
            </h3>
            <div className="mt-2 grid gap-3 rounded-[2px] border border-[#eadfce] bg-white/72 p-3 md:grid-cols-2 xl:grid-cols-3">
              {mirrorItems.map((item) => (
                <article
                  key={`mirror-${item.name}`}
                  className="rounded-[2px] border border-[#eadfce] bg-white/82 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-base font-bold text-[#122033]">
                      {normalizeDisplayName(item.name)}
                    </h4>
                    <p className="text-lg font-bold text-[#122033]">{currency(item.price)}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function AddOnSections({ sections }: { sections: PriceListAddOnSection[] }) {
  const visibleSections = sections.flatMap((section) => {
    const title = section.title.toLowerCase();
    if (title.includes("program notes")) return [];
    if (title.includes("ar upgrade pricing")) return [];
    const hasDviOnlyItem = section.items.some(
      (item) =>
        String(item.name || "")
          .toLowerCase()
          .includes("dvi-driven pricing")
    );
    if (hasDviOnlyItem) return [];

    const items = section.items.filter((item) => {
      const source = `${item.name ?? ""} ${item.price ?? ""} ${item.notes ?? ""}`.toUpperCase();
      return !source.includes("COPPERTONE");
    });

    if (!items.length) return [];
    return [{ ...section, items }];
  });
  const sectionId = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes("finishing")) return "edging-services";
    return undefined;
  };
  return (
    <section id="available-add-ons" className="rounded-[2px] border border-[#dfd2bf] bg-[#fbf8f3]/94 p-4 shadow-[0_22px_60px_rgba(18,32,51,0.08)] md:p-6">
      <SectionHeading title="Materials, Options, Finishing, and Shipping" eyebrow="Price Builder Add-Ons" />
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleSections.map((section) => {
          const isPackageNotes = section.title.toLowerCase().includes("package notes");

          return (
            <article
              id={sectionId(section.title)}
              key={section.title}
              className={`rounded-[2px] border border-[#eadfce] bg-white/82 p-4 ${isPackageNotes ? "md:col-span-2 xl:col-span-3" : ""}`}
            >
              <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[#8a7654]">
                {section.title}
              </h3>
              <div className={isPackageNotes ? "mt-4 grid gap-3 md:grid-cols-2" : "mt-3 grid gap-2"}>
                {section.items.map((item) => {
                  const priceText = typeof item.price === "number" ? currency(item.price) : item.price;

                  if (isPackageNotes) {
                    return (
                      <div
                        key={`${section.title}-${item.name}`}
                        className="rounded-[2px] border border-[#f1e6d8] bg-[#fbf8f3]/78 p-3"
                      >
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a7654]">
                          {item.name}
                        </p>
                        <p className="mt-2 break-words text-base font-semibold leading-7 text-[#122033]">
                          {priceText}
                        </p>
                        {item.notes ? <p className="mt-2 text-xs leading-5 text-[#625b53]">{item.notes}</p> : null}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={`${section.title}-${item.name}`}
                      className="grid gap-2 border-b border-[#f1e6d8] pb-2 last:border-b-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_minmax(9rem,auto)] sm:items-start"
                    >
                      <div className="min-w-0">
                        <p className="break-words font-semibold text-[#122033]">
                          {item.href ? (
                            <a
                              href={item.href}
                              target={item.href.startsWith("http") ? "_blank" : undefined}
                              rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                              className="underline decoration-[#c9b186] underline-offset-4 hover:decoration-[#122033]"
                            >
                              {inlineMarker(item.name, Boolean(item.recommended), Boolean(item.outsourced))}
                            </a>
                          ) : (
                            inlineMarker(item.name, Boolean(item.recommended), Boolean(item.outsourced))
                          )}
                        </p>
                        {item.notes ? <p className="text-xs text-[#625b53]">{item.notes}</p> : null}
                      </div>
                      <p className="min-w-0 break-words font-bold leading-6 text-[#122033] sm:text-right">
                        {priceText}
                      </p>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ModernFramePackageSection() {
  const rows = [
    ["Green Group", "Included", "Core package frame tier"],
    ["Lime Group", "Included", "Core package frame tier"],
    ["Blue Group", "$8", "Add-on tier pricing"],
    ["Red Group", "$24", "Add-on tier pricing"],
    ["Yellow Group", "$29", "Add-on tier pricing"],
    ["Black Diamond", "$33", "Add-on tier pricing"],
  ] as const;

  return (
    <section className="rounded-[2px] border border-[#dfd2bf] bg-[#fbf8f3]/94 p-4 shadow-[0_22px_60px_rgba(18,32,51,0.08)] md:p-6">
      <SectionHeading title="Modern Frame System Package Tiers" eyebrow="M5 Program" />
      <div className="mobile-scroll-row mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#d8c49b] bg-[#f8f1e6] text-[#172a28]">
              <th className="px-3 py-2">Frame Tier / Group</th>
              <th className="px-3 py-2">Included or Add-On Price</th>
              <th className="px-3 py-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([tier, price, note]) => (
              <tr key={tier} className="border-b border-[#eadfce]">
                <td className="px-3 py-2 font-semibold text-[#122033]">{tier}</td>
                <td className="px-3 py-2 font-bold text-[#122033]">{price}</td>
                <td className="px-3 py-2 text-[#4d5664]">{note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href="https://artisanlabnetwork.com/provider-resources#modern-frame-system"
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-9 items-center rounded-full border border-[#d7c5a8] bg-white px-4 text-xs font-bold text-[#122033] transition hover:bg-[#f4eee4]"
        >
          Modern Package Details
        </a>
        <a
          href="https://artisanlabnetwork.com/provider-resources#frame-systems"
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-9 items-center rounded-full border border-[#d7c5a8] bg-white px-4 text-xs font-bold text-[#122033] transition hover:bg-[#f4eee4]"
        >
          Frame Systems Resource Center
        </a>
      </div>
      <p className="mt-3 text-xs text-[#625b53]">
        M5 does not include AR by default. AR upgrades are priced separately.
      </p>
    </section>
  );
}

function SafetyPackageTierSection() {
  const rows = [
    ["Frame Tier 1", "Included", "SafeVision, ArmouRx, OnGuard"],
    ["Frame Tier 2", "$15", "ArmouRx, SafeVision"],
    ["Frame Tier 3", "$30", "ArtCraft, ArmouRx"],
    ["Frame Tier 4", "$45", "DVX / Wiley X"],
    ["Frame Tier 5", "$55", "Wiley X"],
    ["Frame Tier 6", "$70", "Specialty safety selections"],
  ] as const;

  const catalogLinks = [
    { label: "ArmouRx Catalog", href: "/files/armou-rx-frame-book.pdf" },
    { label: "DVX / Wiley X Catalog", href: "/files/dvx-wileyx-frame-book.pdf" },
    { label: "Wiley X Catalog", href: "/files/wileyx-frame-book.pdf" },
    { label: "ArtCraft Catalog", href: "/files/artcraft-frame-book.pdf" },
    { label: "SafeVision Catalog", href: "/files/safevision-frame-book.pdf" },
  ];

  return (
    <section className="rounded-[2px] border border-[#dfd2bf] bg-[#fbf8f3]/94 p-4 shadow-[0_22px_60px_rgba(18,32,51,0.08)] md:p-6">
      <SectionHeading title="Artisan Safety Package Frame Tiers" eyebrow="Y5 Program" />
      <div className="mobile-scroll-row mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#d8c49b] bg-[#f8f1e6] text-[#172a28]">
              <th className="px-3 py-2">Frame Tier / Group</th>
              <th className="px-3 py-2">Included or Add-On Price</th>
              <th className="px-3 py-2">Associated Brands</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([tier, price, brands]) => (
              <tr key={tier} className="border-b border-[#eadfce]">
                <td className="px-3 py-2 font-semibold text-[#122033]">{tier}</td>
                <td className="px-3 py-2 font-bold text-[#122033]">{price}</td>
                <td className="px-3 py-2 text-[#4d5664]">{brands}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {catalogLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-9 items-center rounded-full border border-[#d7c5a8] bg-white px-4 text-xs font-bold text-[#122033] transition hover:bg-[#f4eee4]"
          >
            {link.label}
          </a>
        ))}
        <a
          href="/provider-resources#safety-systems"
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-9 items-center rounded-full border border-[#d7c5a8] bg-white px-4 text-xs font-bold text-[#122033] transition hover:bg-[#f4eee4]"
        >
          Safety Systems Resource Center
        </a>
      </div>

      <p className="mt-3 text-xs text-[#625b53]">
        Side shields are included at no additional fee. Brand availability can vary by vendor and frame inventory.
      </p>
    </section>
  );
}

function ChemClipSection() {
  const items = [
    ["ChemClip Solid Sunlens", 85.5],
    ["ChemClip Drive", 117],
    ["ChemClip Solid Sunlens with Backside AR", 88.5],
    ["ChemClip Gradient Sunlens with Backside AR", 90.5],
    ["ChemClip Mirror Sunlens", 92.5],
    ["ChemClip Color", 119],
    ["ChemClip Readers Blue", 97],
    ["ChemClip Therapeutic", 132],
    ["ChemClip Avulux", 335],
    ["Swarovski Crystal add on", 20.5],
  ] as const;

  return (
    <section className="rounded-[2px] border border-[#dfd2bf] bg-[#fbf8f3]/94 p-4 shadow-[0_22px_60px_rgba(18,32,51,0.08)] md:p-6">
      <SectionHeading title="ChemClip by Chemistrie" eyebrow="PDF Source Pricing" />
      <div className="mt-4 flex items-center gap-3">
        <Image src="/chemistrie-logo.png" alt="Chemistrie logo" width={160} height={40} className="h-8 w-auto object-contain" />
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {items.map(([name, value]) => (
          <div key={name} className="flex items-center justify-between rounded-[2px] border border-[#eadfce] bg-white/82 px-3 py-2">
            <span className="font-semibold text-[#122033]">{name}</span>
            <span className="font-bold text-[#122033]">{currency(value)}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-[#625b53]">ChemClip demonstration kits are available for purchase.</p>
    </section>
  );
}

function ReferenceKey({ rows }: { rows: PriceListPricingRow[] }) {
  const entries: Array<[string, string]> = [];
  if (rows.some((row) => row.recommended)) entries.push(["★", "Preferred Product"]);
  if (rows.some((row) => row.outsourced)) {
    entries.push(["➜", "Outsourced product - additional turnaround time applies"]);
  }
  if (!entries.length) return null;

  return (
    <section className="rounded-[2px] border border-[#dfd2bf] bg-white/75 p-4 text-sm shadow-[0_12px_34px_rgba(18,32,51,0.05)] md:p-5">
      <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[#8a7654]">Reference Key</h2>
      <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {entries.map(([label, description]) => (
          <div key={label} className="flex gap-2">
            <span className="font-bold text-[#122033]">{label}</span>
            <span className="text-[#4d5664]">{description}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="border-b border-[#dfd2bf] pb-4">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#122033]">{title}</h2>
    </div>
  );
}
