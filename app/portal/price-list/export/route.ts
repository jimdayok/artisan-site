import { NextRequest, NextResponse } from "next/server";
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import QRCode from "qrcode";
import { getAuthorizedRuntimePriceListFromHeaders } from "@/lib/portal/priceListRuntimeAccess";
import { canonicalPriceListCode } from "@/lib/portal/priceLists";
import { checkRateLimit } from "@/lib/portal/rateLimit";
import { customerFacingPriceList } from "@/lib/pricing/customerPriceList";
import {
  ADGA_PHOTO_PRICING_NOTE,
  buildOfficialAdgaPriceList,
} from "@/lib/pricing/adgaPriceList";
import {
  ADGA_SOURCE_PRICE_LIST_CODES,
  isAdgaPriceListCode,
  isVisiblePriceListCode,
} from "@/lib/pricing/priceListCodes";
import {
  comparePriceDisplayBrand,
  comparePriceDisplayCategory,
  compareProgressiveTier,
  priceDisplayCategory,
  progressiveTierFor,
  type PriceDisplayCategory,
  type ProgressiveTier,
} from "@/lib/pricing/displayTaxonomy";
import { loadRuntimePackagedPriceListByCode } from "@/lib/pricing/loadRuntimePackagedPriceList";
import {
  CHEMISTRIE_CLIPS_SECTION_NOTE,
  CHEMISTRIE_CLIPS_SECTION_TITLE,
  chemistrieClipItems,
} from "@/lib/pricing/chemistrieClips";
import {
  priceForMode,
  rowMatchesMaterialGroup,
  selectSummaryPrice,
  usesPolycarbonatePriceBasis,
} from "@/lib/pricing/polycarbonatePriceBasis";
import type { PortalPriceList } from "@/lib/portal/priceLists";
import type {
  PriceListAddOnSection,
  PriceListArCoating,
  GeneratedPriceListData,
  PriceListPricingRow,
} from "@/lib/pricing/types";

export const dynamic = "force-dynamic";

type PriceMode = "edged" | "uncut";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 38;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const NAVY = rgb(18 / 255, 32 / 255, 51 / 255);
const GOLD = rgb(197 / 255, 169 / 255, 116 / 255);
const CREAM = rgb(248 / 255, 243 / 255, 235 / 255);
const RULE = rgb(226 / 255, 213 / 255, 191 / 255);
const TEXT = rgb(47 / 255, 55 / 255, 68 / 255);
const MUTED = rgb(102 / 255, 92 / 255, 78 / 255);
const SOFT_FILL = rgb(252 / 255, 250 / 255, 246 / 255);
const PRICE_BASIS_NOTE =
  "Price basis appears below each + price: Polycarbonate, Hi Index 1.60, Plastic only, or another available material.";
const STANDARD_PRICE_NOTE =
  "Design prices are starting prices. Materials, colors, AR, finishing, and shipping may add to or deduct from the displayed price unless noted.";
const ADMIN_CUSTOMER_NAME = "Artisan Customer Pricing";
const PORTAL_URL = "https://www.artisanslabs.com/portal";
const PROVIDER_RESOURCES_URL =
  "https://www.artisanslabs.com/provider-resources";
const BRAND_COLUMN_WIDTH_WITH_TRANSITIONS = 106;
const CLEAR_COLUMN_X = MARGIN + 312;
const PHOTO_COLUMN_X = MARGIN + 368;
const TRANSITIONS_COLUMN_X = MARGIN + 424;
const POLAR_COLUMN_X = MARGIN + 486;
const TABLE_ROW_HEIGHT = 27;
const TABLE_HEADER_HEIGHT = 20;
const BRAND_ONLY_PROGRESSIVE_PDF_CODES = new Set(["A6", "G6", "P6"]);

function adgaGuideRank(code?: string) {
  const index = ADGA_SOURCE_PRICE_LIST_CODES.findIndex((guide) => guide === code);
  return index === -1 ? 99 : index;
}

type LabShowcase = {
  name: string;
  phone: string;
  email: string;
  imagePath: string;
  accent: ReturnType<typeof rgb>;
  panel: ReturnType<typeof rgb>;
};

const LAB_SHOWCASES: LabShowcase[] = [
  {
    name: "Pacific Artisan Labs",
    phone: "877.390.6900",
    email: "customerservice@pacificartisanlabs.com",
    imagePath: "logos/PAL_2CTan.png",
    accent: rgb(133 / 255, 111 / 255, 78 / 255),
    panel: rgb(245 / 255, 239 / 255, 231 / 255),
  },
  {
    name: "Peak Artisan Labs",
    phone: "833.690.4321",
    email: "customerservice@peakartisanlabs.com",
    imagePath: "logos/Peak_Artisan_Logo 9-1-23_FINAL.png",
    accent: rgb(83 / 255, 127 / 255, 158 / 255),
    panel: rgb(235 / 255, 243 / 255, 248 / 255),
  },
  {
    name: "Pike Artisan Labs",
    phone: "888.239.0303",
    email: "customerservice@pikeartisanlabs.com",
    imagePath: "logos/Pike_Labs_Logo-4C.png",
    accent: rgb(150 / 255, 56 / 255, 51 / 255),
    panel: rgb(249 / 255, 238 / 255, 235 / 255),
  },
];

function cleanText(value: unknown) {
  return String(value ?? "")
    .replace(/[™®©]/g, "")
    .replace(/[★➜↕▲▼]/g, "")
    .replace(/[^\x20-\x7E]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function compareText(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function compareDesignStyle(a: string, b: string) {
  const rank = (value: string) => {
    const normalized = cleanText(value).toUpperCase();
    if (normalized === "SV") return 0;
    if (normalized === "ASPHERIC SV") return 1;
    return 2;
  };
  return rank(a) - rank(b) || compareText(a, b);
}

function titleCasePriceListName(value: string) {
  const acronyms = new Set(["ADG&A", "AR", "CD", "IOT", "PMP", "SV", "VSP"]);
  return cleanText(value)
    .toLowerCase()
    .split(" ")
    .map((word) => {
      const upper = word.toUpperCase();
      if (acronyms.has(upper)) return upper;
      if (/^\d+$/.test(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function parseRevisionDate(label: string) {
  const match = cleanText(label).match(
    /(?:\bREV(?:ISION)?\.?\s*)?(\d{2})(\d{2})(\d{2}|\d{4})\s*$/i
  );
  if (!match) return undefined;
  const [, month, day, year] = match;
  const fullYear = year.length === 2 ? `20${year}` : year;
  return `${month}/${day}/${fullYear}`;
}

function displayPriceListName(label: string, code: string) {
  const withoutRevision = cleanText(label)
    .replace(/\s+(?:REV(?:ISION)?\.?\s*)?\d{6,8}\s*$/i, "")
    .replace(/\s+\bREV(?:ISION)?\.?\s*$/i, "")
    .trim();
  return titleCasePriceListName(withoutRevision || `${code} Price List`);
}

function isAdminCustomer(customerName: string) {
  return cleanText(customerName).toLowerCase() === "portal administrator";
}

function rowPrice(row: PriceListPricingRow | undefined, mode: PriceMode) {
  return priceForMode(row, mode);
}

function money(row: PriceListPricingRow | undefined, mode: PriceMode) {
  const value = rowPrice(row, mode);
  if (!Number.isFinite(value) || value <= 0) return "-";
  return `$${value.toFixed(2)}+`;
}

async function embedImageFromPublic(
  document: PDFDocument,
  requestOrigin: string,
  relativePath: string
) {
  const response = await fetch(new URL(`/${relativePath}`, requestOrigin), {
    cache: "force-cache",
  });
  if (!response.ok) {
    throw new Error(
      `Unable to load public image ${relativePath} (${response.status} ${response.statusText}).`
    );
  }
  const imageBytes = new Uint8Array(await response.arrayBuffer());
  if (/\.png$/i.test(relativePath)) return document.embedPng(imageBytes);
  return document.embedJpg(imageBytes);
}

function priceText(value: number | string) {
  if (typeof value === "number") return `$${value.toFixed(2)}`;

  const text = cleanText(value).replace(/\${2,}/g, "$");
  if (/^[+-]?\d+(?:\.\d+)?$/.test(text)) {
    const numericValue = Number(text);
    if (Number.isFinite(numericValue)) {
      const sign = numericValue < 0 ? "-" : numericValue > 0 && text.startsWith("+") ? "+" : "";
      return `${sign}$${Math.abs(numericValue).toFixed(2)}`;
    }
  }

  return text.replace(
    /([+-]?)\$\s*([+-]?)(\d+(?:\.\d+)?)/g,
    (_match, leadingSign: string, innerSign: string, amount: string) => {
      const numericValue = Number(amount);
      if (!Number.isFinite(numericValue)) return _match;
      const sign = leadingSign || innerSign;
      return `${sign}$${numericValue.toFixed(2)}`;
    }
  );
}

function summarizeDesigns(priceList: GeneratedPriceListData, mode: PriceMode) {
  const polycarbonateBasis = usesPolycarbonatePriceBasis(priceList.code);
  const isAdgaList = isAdgaPriceListCode(priceList.code);
  const groups = new Map<string, PriceListPricingRow[]>();
  for (const row of priceList.rows) {
    if (row.material.trim().toUpperCase() === "PFT") continue;
    const source = [
      row.colorBrand,
      row.materialColor,
      ...row.availableColors,
      ...row.rawProductNames,
    ]
      .join(" ")
      .toUpperCase();
    if (source.includes("COPPERTONE")) continue;
    const key = `${row.priceGuideCode ?? ""}|${row.designType}|${row.brand}|${row.designStyle}`;
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }

  return [...groups.values()]
    .map((rows) => {
      const unavailable = rows.find((row) =>
        row.serviceNotes.some((note) => /unavailable/i.test(note))
      );
      const clear = polycarbonateBasis
        ? selectSummaryPrice(rows, "Clear", mode)
        : { row: lowestRow(rows, "Clear", mode) };
      const photochromic = isAdgaList
        ? { row: lowestAdgaTransitionsRow(rows, mode) }
        : polycarbonateBasis
          ? selectSummaryPrice(rows, "Photochromic", mode)
          : { row: lowestRow(rows, "Photochromic", mode) };
      const transitions = isAdgaList
        ? { row: undefined }
        : polycarbonateBasis
          ? selectSummaryPrice(rows, "Transitions", mode)
          : { row: lowestRow(rows, "Transitions", mode) };
      const polarized = polycarbonateBasis
        ? selectSummaryPrice(rows, "Polarized", mode)
        : { row: lowestRow(rows, "Polarized", mode) };

      return {
        designType: rows[0].designType,
        displayCategory: priceDisplayCategory(rows[0]),
        progressiveTier:
          priceDisplayCategory(rows[0]) === "Progressive Designs"
            ? progressiveTierFor(rows[0])
            : undefined,
        brand: rows[0].brand,
        designStyle: rows[0].designStyle,
        priceGuideCode: rows[0].priceGuideCode,
        outsourced: rows.some((row) => row.outsourced),
        phasingOut: rows.some((row) =>
          row.serviceNotes.some((note) => /phasing out/i.test(note))
        ),
        clear: clear.row ?? unavailable,
        clearBasis: clear.basisShortLabel ?? (unavailable ? "Unavailable" : undefined),
        photochromic: photochromic.row,
        photochromicBasis: photochromic.basisShortLabel,
        transitions: transitions.row,
        transitionsBasis: transitions.basisShortLabel,
        polarized: polarized.row,
        polarizedBasis: polarized.basisShortLabel,
      };
    })
    .sort(
      (a, b) =>
        adgaGuideRank(a.priceGuideCode) - adgaGuideRank(b.priceGuideCode) ||
        comparePriceDisplayCategory(a.displayCategory, b.displayCategory) ||
        (a.progressiveTier && b.progressiveTier
          ? compareProgressiveTier(a.progressiveTier, b.progressiveTier)
          : 0) ||
        comparePriceDisplayBrand(a.brand, b.brand) ||
        compareDesignStyle(a.designStyle, b.designStyle)
    );
}

function lowestRow(
  rows: PriceListPricingRow[],
  materialColor: string,
  mode: PriceMode
) {
  return rows
    .filter(
      (row) =>
        rowMatchesMaterialGroup(
          row,
          materialColor as "Clear" | "Photochromic" | "Transitions" | "Polarized"
        ) && rowPrice(row, mode) > 0
    )
    .sort((a, b) => rowPrice(a, mode) - rowPrice(b, mode))[0];
}

function lowestAdgaTransitionsRow(rows: PriceListPricingRow[], mode: PriceMode) {
  return rows
    .filter(
      (row) =>
        /^Transitions$/i.test(row.colorBrand) &&
        row.colorRaw.some((code) => /^(?:TGY|TBN)$/i.test(code)) &&
        rowPrice(row, mode) > 0
    )
    .sort((a, b) => rowPrice(a, mode) - rowPrice(b, mode))[0];
}

type DesignSummary = ReturnType<typeof summarizeDesigns>[number];

function summaryPriceForSort(summary: DesignSummary, mode: PriceMode) {
  const clearPrice = summary.clear ? rowPrice(summary.clear, mode) : undefined;
  if (clearPrice !== undefined && Number.isFinite(clearPrice) && clearPrice > 0) {
    return clearPrice;
  }
  const alternatives = [
    summary.photochromic,
    summary.transitions,
    summary.polarized,
  ]
    .filter((row): row is PriceListPricingRow => Boolean(row))
    .map((row) => rowPrice(row, mode))
    .filter((price) => Number.isFinite(price) && price > 0);
  return alternatives.length ? Math.min(...alternatives) : Number.POSITIVE_INFINITY;
}

function compareSummaryPriceForCategory(
  a: DesignSummary,
  b: DesignSummary,
  category: PriceDisplayCategory,
  mode: PriceMode
) {
  if (category === "Standard SV") {
    const rank = (style: string) => {
      const normalized = style.trim().toUpperCase();
      if (normalized === "SV") return 0;
      if (/^(?:ASPHERIC SV|SV ASPHERIC)$/.test(normalized)) return 1;
      return 2;
    };
    const rankDifference = rank(a.designStyle) - rank(b.designStyle);
    if (rankDifference) return rankDifference;
  }
  const aPrice = summaryPriceForSort(a, mode);
  const bPrice = summaryPriceForSort(b, mode);
  if (!Number.isFinite(aPrice) && !Number.isFinite(bPrice)) return 0;
  if (!Number.isFinite(aPrice)) return 1;
  if (!Number.isFinite(bPrice)) return -1;
  const ascending = ["Standard SV", "Multifocals"].includes(category);
  return ascending ? aPrice - bPrice : bPrice - aPrice;
}

function fitText(font: PDFFont, value: string, maxWidth: number, size: number) {
  const text = cleanText(value);
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  let output = text;
  while (
    output.length > 1 &&
    font.widthOfTextAtSize(`${output}...`, size) > maxWidth
  ) {
    output = output.slice(0, -1);
  }
  return `${output.trim()}...`;
}

function wrapText(font: PDFFont, value: string, maxWidth: number, size: number) {
  const words = cleanText(value).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    current = word;
  }
  if (current) lines.push(current);
  return lines;
}

async function buildPriceListPdf({
  priceList,
  portalPriceList,
  customerName,
  mode,
  requestOrigin,
}: {
  priceList: GeneratedPriceListData;
  portalPriceList: PortalPriceList;
  customerName: string;
  mode: PriceMode;
  requestOrigin: string;
}) {
  const document = await PDFDocument.create();
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const isAdgaList = isAdgaPriceListCode(priceList.code);
  const brandColumnWidth = BRAND_COLUMN_WIDTH_WITH_TRANSITIONS;
  const designColumnX = MARGIN + brandColumnWidth;
  const designTextX = designColumnX + 8;
  const clearColumnX = isAdgaList ? MARGIN + 340 : CLEAR_COLUMN_X;
  const photoColumnX = isAdgaList ? MARGIN + 410 : PHOTO_COLUMN_X;
  const transitionsColumnX = TRANSITIONS_COLUMN_X;
  const polarColumnX = isAdgaList ? MARGIN + 486 : POLAR_COLUMN_X;
  const logoResponse = await fetch(new URL("/aln-white-logo.png", requestOrigin), {
    cache: "force-cache",
  });
  if (!logoResponse.ok) {
    throw new Error(
      `Unable to load public image aln-white-logo.png (${logoResponse.status} ${logoResponse.statusText}).`
    );
  }
  const logoBytes = new Uint8Array(await logoResponse.arrayBuffer());
  const logo = await document.embedPng(logoBytes);
  const labShowcases = await Promise.all(
    LAB_SHOWCASES.map(async (lab) => ({
      ...lab,
      image: await embedImageFromPublic(document, requestOrigin, lab.imagePath),
    }))
  );
  const preferredArtisanAr = await Promise.all(
    [
      {
        code: "AEM",
        name: "Artisan Emerald",
        imagePath: "ar/emerald.png",
        description: "Premium everyday clarity and cosmetics.",
      },
      {
        code: "AAR",
        name: "Artisan Armour",
        imagePath: "ar/armour.png",
        description: "Ultra-premium durability for demanding wear.",
      },
      {
        code: "NYT",
        name: "Artisan Nytopia",
        imagePath: "ar/nytopia.png",
        description: "Refined optics for nighttime performance.",
      },
      {
        code: "AAZ",
        name: "Artisan Azure",
        imagePath: "ar/azure.png",
        description: "Blue-light focused optics with a refined hue.",
      },
    ].map(async (item) => ({
      ...item,
      image: await embedImageFromPublic(document, requestOrigin, item.imagePath),
    }))
  );
  const chemistrieLogo = await embedImageFromPublic(
    document,
    requestOrigin,
    "chemistrie-logo.png"
  );
  const artisanRings = await embedImageFromPublic(
    document,
    requestOrigin,
    "rings-transparent.png"
  );
  const qrImages = await Promise.all(
    [PORTAL_URL, PROVIDER_RESOURCES_URL].map(async (url) => {
      const dataUrl = await QRCode.toDataURL(url, {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 240,
        color: { dark: "#122033", light: "#FFFFFF" },
      });
      return document.embedPng(Buffer.from(dataUrl.split(",")[1], "base64"));
    })
  );
  const pages: PDFPage[] = [];
  let page!: PDFPage;
  let y = 0;

  const generatedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
  const listDisplayName = displayPriceListName(portalPriceList.label, priceList.code);
  const revisionDate = parseRevisionDate(portalPriceList.label);
  const customerDisplayName = isAdminCustomer(customerName)
    ? ADMIN_CUSTOMER_NAME
    : customerName;
  const usesBrandOnlyProgressiveLayout =
    BRAND_ONLY_PROGRESSIVE_PDF_CODES.has(priceList.code);
  const polycarbonateBasis = usesPolycarbonatePriceBasis(priceList.code);
  const packagePricing = portalPriceList.package;

  const addPage = (continuation = false) => {
    page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pages.push(page);
    page.drawRectangle({
      x: 0,
      y: 0,
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
      color: rgb(1, 1, 1),
    });
    page.drawRectangle({
      x: 0,
      y: PAGE_HEIGHT - 92,
      width: PAGE_WIDTH,
      height: 92,
      color: NAVY,
    });
    page.drawImage(logo, {
      x: MARGIN,
      y: PAGE_HEIGHT - 76,
      width: 112,
      height: 53,
    });
    page.drawText(
      fitText(
        bold,
        priceList.code === "NL" ? "Neurolens Price List" : listDisplayName,
        340,
        16
      ),
      {
      x: 176,
      y: PAGE_HEIGHT - 44,
      size: 16,
      font: bold,
      color: rgb(1, 1, 1),
      }
    );
    page.drawText(
      continuation ? "Customer pricing guide - continued" : `Price List Code: ${cleanText(priceList.code)}`,
      {
        x: 176,
        y: PAGE_HEIGHT - 63,
        size: 9,
        font: regular,
        color: rgb(0.86, 0.81, 0.71),
      }
    );
    if (!continuation && revisionDate) {
      page.drawText(`Revised: ${revisionDate}`, {
        x: 176,
        y: PAGE_HEIGHT - 76,
        size: 8,
        font: regular,
        color: rgb(0.86, 0.81, 0.71),
      });
    }
    y = PAGE_HEIGHT - 116;
  };

  const ensureSpace = (height: number) => {
    if (y - height < 58) addPage(true);
  };

  const sectionTitle = (title: string, detail?: string) => {
    ensureSpace(36);
    page.drawRectangle({
      x: MARGIN,
      y: y - 23,
      width: CONTENT_WIDTH,
      height: 28,
      color: CREAM,
      borderColor: RULE,
      borderWidth: 0.8,
    });
    page.drawText(cleanText(title), {
      x: MARGIN + 10,
      y: y - 13,
      size: 10,
      font: bold,
      color: NAVY,
    });
    if (detail) {
      page.drawText(fitText(regular, detail, 245, 7), {
        x: PAGE_WIDTH - MARGIN - 255,
        y: y - 12,
        size: 7,
        font: regular,
        color: MUTED,
      });
    }
    y -= 26;
  };

  const drawTableHeader = (showBrand = false) => {
    ensureSpace(24);
    page.drawRectangle({
      x: MARGIN,
      y: y - 17,
      width: CONTENT_WIDTH,
      height: TABLE_HEADER_HEIGHT,
      color: NAVY,
    });
    const headers = [
      ...(showBrand ? ([["Brand", MARGIN + 6]] as const) : []),
      ["Design", showBrand ? designTextX : MARGIN + 6],
      [packagePricing ? "Package" : "Clear", clearColumnX],
      [isAdgaList ? "Transitions" : "Photo", photoColumnX],
      ...(!isAdgaList ? ([["Trans/Xtra", transitionsColumnX]] as const) : []),
      ["Polar", polarColumnX],
    ] as const;
    for (const [label, x] of headers) {
      page.drawText(label, {
        x,
        y: y - 10,
        size: 7,
        font: bold,
        color: rgb(1, 1, 1),
      });
    }
    y -= TABLE_HEADER_HEIGHT;
  };

  const drawTierHeader = (tier: ProgressiveTier) => {
    ensureSpace(26);
    page.drawRectangle({
      x: MARGIN,
      y: y - 17,
      width: CONTENT_WIDTH,
      height: 20,
      color: NAVY,
    });
    page.drawText(tier.toUpperCase(), {
      x: MARGIN + 9,
      y: y - 10,
      size: 8,
      font: bold,
      color: rgb(1, 1, 1),
    });
    y -= 20;
  };

  const drawBrandCell = (brand: string, topY: number, height: number) => {
    page.drawRectangle({
      x: MARGIN,
      y: topY - height,
      width: brandColumnWidth,
      height,
      color: SOFT_FILL,
      borderColor: RULE,
      borderWidth: 0.6,
    });
    if (/^Artisan$/i.test(brand)) {
      const ringsBounds = artisanRings.scaleToFit(
        brandColumnWidth - 14,
        Math.max(12, height - 6)
      );
      page.drawImage(artisanRings, {
        x: MARGIN + (brandColumnWidth - ringsBounds.width) / 2,
        y: topY - height + (height - ringsBounds.height) / 2,
        width: ringsBounds.width,
        height: ringsBounds.height,
        opacity: 0.13,
      });
    }
    const textX = MARGIN + 8;
    const textWidth = brandColumnWidth - 16;
    const textY = topY - height / 2 - 3;
    page.drawText(fitText(bold, brand, textWidth, 7.2), {
      x: textX,
      y: textY,
      size: 7.2,
      font: bold,
      color: NAVY,
    });
  };

  const drawIntroPanel = () => {
    const includedTreatments = portalPriceList.package
      ? priceList.arCoatings
          .filter((coating) => !coating.unresolved && coating.price === 0)
          .map((coating) => cleanCoatingName(coating))
          .filter((name, index, values) => values.indexOf(name) === index)
      : [];
    const badgeWidth = 124;
    const badgeHeight = 36;
    const badgeX = PAGE_WIDTH - MARGIN - badgeWidth - 18;
    const badgeY = y - 50;
    const introTextWidth = badgeX - (MARGIN + 18) - 24;
    const summaryLines = wrapText(
      regular,
      isAdgaList
        ? ADGA_PHOTO_PRICING_NOTE
        : polycarbonateBasis
        ? "This price list uses polycarbonate as the base material unless otherwise noted. Only Tokai products are available in 1.70 and 1.76 index. Photo shows S-material products; Trans/Xtra shows Transitions and Xtra Active products."
        : "Customer-ready pricing organized by design family, coatings, add-ons, and policy notes.",
      introTextWidth,
      8
    );
    const includedLines = includedTreatments.length
      ? wrapText(
          bold,
          `Included AR treatment${includedTreatments.length === 1 ? "" : "s"}: ${includedTreatments.join(", ")}.`,
          introTextWidth,
          7.4
        )
      : [];
    const panelHeight = Math.max(76, 50 + summaryLines.length * 10 + includedLines.length * 9);
    ensureSpace(panelHeight + 12);
    page.drawRectangle({
      x: MARGIN,
      y: y - panelHeight + 3,
      width: CONTENT_WIDTH,
      height: panelHeight,
      color: SOFT_FILL,
      borderColor: RULE,
      borderWidth: 0.8,
    });
    page.drawRectangle({
      x: MARGIN,
      y: y - panelHeight + 3,
      width: 7,
      height: panelHeight,
      color: GOLD,
    });
    page.drawText("Confidential pricing guide", {
      x: MARGIN + 10,
      y: y - 18,
      size: 10,
      font: bold,
      color: NAVY,
    });
    summaryLines.forEach((line, index) => {
      page.drawText(line, {
        x: MARGIN + 18,
        y: y - 33 - index * 10,
        size: 8,
        font: regular,
        color: TEXT,
      });
    });
    const includedStartY = y - 33 - summaryLines.length * 10 - 2;
    includedLines.forEach((line, index) => {
      page.drawText(line, {
        x: MARGIN + 18,
        y: includedStartY - index * 9,
        size: 7.4,
        font: bold,
        color: NAVY,
      });
    });
    page.drawText(
      fitText(
        regular,
        "Lab contact details are grouped on the final page for a cleaner opening presentation.",
        introTextWidth,
        7.4
      ),
      {
        x: MARGIN + 18,
        y: y - panelHeight + 14,
        size: 7.4,
        font: regular,
        color: MUTED,
      }
    );
    page.drawRectangle({
      x: badgeX,
      y: badgeY,
      width: badgeWidth,
      height: badgeHeight,
      color: rgb(1, 1, 1),
      borderColor: RULE,
      borderWidth: 0.8,
    });
    page.drawText(mode === "uncut" ? "UNCUT" : "EDGED", {
      x: badgeX + 12,
      y: badgeY + 21,
      size: 8.8,
      font: bold,
      color: NAVY,
    });
    page.drawText("CUSTOMER PRICING", {
      x: badgeX + 12,
      y: badgeY + 9,
      size: 5.9,
      font: regular,
      color: MUTED,
    });
    y -= panelHeight + 8;
  };

  const drawLabShowcasePage = () => {
    addPage(true);
    const statementTop = PAGE_HEIGHT - 170;
    const panelBottom = 226;
    const panelHeight = 320;
    const panelTop = panelBottom + panelHeight;
    const gap = 16;
    const columnWidth = (CONTENT_WIDTH - gap * 2) / 3;

    page.drawText("Questions or order support?", {
      x: MARGIN,
      y: statementTop,
      size: 8.5,
      font: bold,
      color: GOLD,
    });
    page.drawText("Connect directly with your regional Artisan lab.", {
      x: MARGIN,
      y: statementTop - 18,
      size: 20,
      font: bold,
      color: NAVY,
    });
    page.drawRectangle({
      x: MARGIN,
      y: panelBottom,
      width: CONTENT_WIDTH,
      height: panelHeight,
      color: SOFT_FILL,
      borderColor: RULE,
      borderWidth: 0.9,
    });
    const cardTop = panelTop - 16;
    const cardHeight = 280;
    const logoPanelHeight = 82;
    labShowcases.forEach((lab, index) => {
      const x = MARGIN + index * (columnWidth + gap);
      page.drawRectangle({
        x,
        y: cardTop - cardHeight,
        width: columnWidth,
        height: cardHeight,
        color: rgb(1, 1, 1),
        borderColor: RULE,
        borderWidth: 0.9,
      });
      page.drawRectangle({
        x,
        y: cardTop - 5,
        width: columnWidth,
        height: 5,
        color: lab.accent,
      });
      page.drawRectangle({
        x: x + 10,
        y: cardTop - logoPanelHeight - 14,
        width: columnWidth - 20,
        height: logoPanelHeight,
        color: lab.panel,
      });

      const imageBounds = lab.image.scaleToFit(columnWidth - 28, logoPanelHeight - 28);
      page.drawImage(lab.image, {
        x: x + (columnWidth - imageBounds.width) / 2,
        y:
          cardTop -
          logoPanelHeight -
          14 +
          (logoPanelHeight - imageBounds.height) / 2,
        width: imageBounds.width,
        height: imageBounds.height,
      });
      page.drawText(fitText(bold, lab.name, columnWidth - 20, 9.4), {
        x: x + 10,
        y: cardTop - 116,
        size: 9.4,
        font: bold,
        color: NAVY,
      });
      page.drawText("Customer Support", {
        x: x + 10,
        y: cardTop - 132,
        size: 6.9,
        font: bold,
        color: lab.accent,
      });
      page.drawRectangle({
        x: x + 10,
        y: cardTop - 257,
        width: columnWidth - 20,
        height: 108,
        color: SOFT_FILL,
        borderColor: RULE,
        borderWidth: 0.7,
      });
      page.drawText("Phone", {
        x: x + 18,
        y: cardTop - 167,
        size: 6.8,
        font: bold,
        color: MUTED,
      });
      page.drawText(lab.phone, {
        x: x + 18,
        y: cardTop - 185,
        size: 10.2,
        font: bold,
        color: NAVY,
      });
      page.drawLine({
        start: { x: x + 18, y: cardTop - 197 },
        end: { x: x + columnWidth - 18, y: cardTop - 197 },
        color: RULE,
        thickness: 0.8,
      });
      page.drawText("Email", {
        x: x + 18,
        y: cardTop - 216,
        size: 6.8,
        font: bold,
        color: MUTED,
      });
      page.drawText(fitText(regular, lab.email, columnWidth - 36, 7.2), {
        x: x + 18,
        y: cardTop - 236,
        size: 7.2,
        font: regular,
        color: TEXT,
      });
    });

    page.drawText("Quick access", {
      x: MARGIN,
      y: 196,
      size: 9,
      font: bold,
      color: NAVY,
    });
    [
      { image: qrImages[0], label: "Customer Portal", x: MARGIN },
      { image: qrImages[1], label: "Provider Resources", x: MARGIN + 84 },
    ].forEach((item) => {
      page.drawImage(item.image, {
        x: item.x,
        y: 112,
        width: 68,
        height: 68,
      });
      page.drawText(fitText(bold, item.label, 74, 6.6), {
        x: item.x,
        y: 102,
        size: 6.6,
        font: bold,
        color: NAVY,
      });
    });

    const legalLines = wrapText(
      regular,
      "Prices and product availability are subject to change without notice. Errors and omissions may be corrected. Final charges are determined by the active lab billing system and confirmed order details. Product and brand names are trademarks or registered trademarks of their respective owners. This confidential guide is for authorized provider use only and may not be redistributed.",
      336,
      6.8
    );
    page.drawText("Pricing and trademark notice", {
      x: MARGIN + 180,
      y: 196,
      size: 9,
      font: bold,
      color: NAVY,
    });
    legalLines.forEach((line, index) => {
      page.drawText(line, {
        x: MARGIN + 180,
        y: 180 - index * 9,
        size: 6.8,
        font: regular,
        color: MUTED,
      });
    });
  };

  let designStripeIndex = 0;
  const drawBrandRows = ({
    sectionLabel,
    tier,
    brand,
    rows,
  }: {
    sectionLabel: string;
    tier: ProgressiveTier | "All";
    brand: string;
    rows: ReturnType<typeof summarizeDesigns>;
  }) => {
    let rowIndex = 0;
    while (rowIndex < rows.length) {
      if (y - 25 < 58) {
        addPage(true);
        sectionTitle(sectionLabel, "continued");
        if (tier !== "All") drawTierHeader(tier);
        drawTableHeader(true);
      }
      const availableRows = Math.max(1, Math.floor((y - 58) / TABLE_ROW_HEIGHT));
      const chunk = rows.slice(rowIndex, rowIndex + availableRows);
      const groupTop = y + 2;
      const groupHeight = chunk.length * TABLE_ROW_HEIGHT;
      drawBrandCell(brand, groupTop, groupHeight);
      chunk.forEach((row) => {
        const rowTop = y + 2;
        const zebraFill = designStripeIndex % 2 === 1 ? CREAM : rgb(1, 1, 1);
        page.drawRectangle({
          x: designColumnX,
          y: rowTop - TABLE_ROW_HEIGHT,
          width: CONTENT_WIDTH - brandColumnWidth,
          height: TABLE_ROW_HEIGHT,
          color: zebraFill,
        });
        page.drawLine({
          start: { x: designColumnX, y: rowTop - TABLE_ROW_HEIGHT },
          end: { x: designColumnX, y: rowTop },
          color: RULE,
          thickness: 0.6,
        });
        const designLabel = row.designStyle;
        const statusLabels = [
          ...(row.outsourced ? ([{ label: "Outsourced", color: MUTED, icon: "stopwatch" as const }] as const) : []),
          ...(row.phasingOut ? ([{ label: "Phasing out", color: GOLD, icon: "hand" as const }] as const) : []),
        ];
        const statusWidths = statusLabels.map(({ label }) => regular.widthOfTextAtSize(label, 4.8) + 12);
        const statusReserve = statusWidths.reduce((sum, width) => sum + width + 4, 0);
        const designWidth = Math.max(44, (isAdgaList ? 226 : 194) - statusReserve);
        const fittedDesignLabel = fitText(regular, designLabel, designWidth, 7.2);
        const values: Array<[string, number, number, PDFFont, typeof TEXT, number?]> = [
          [fittedDesignLabel, designTextX, designWidth, regular, TEXT, 7.2],
        ];
        values.forEach(([value, x, width, font, color, requestedSize]) => {
          const size = requestedSize ?? 7.2;
          page.drawText(fitText(font, value, width, size), {
            x,
            y: y - 13,
            size,
            font,
            color,
          });
        });
        let statusX = designTextX + regular.widthOfTextAtSize(fittedDesignLabel, 7.2) + 5;
        const drawStatusMarker = (label: string, width: number, color: typeof GOLD, icon: "stopwatch" | "hand") => {
          const iconX = statusX + 7;
          const iconY = y - 10.2;
          if (icon === "stopwatch") {
            page.drawEllipse({
              x: iconX,
              y: iconY,
              xScale: 2.55,
              yScale: 2.55,
              borderColor: color,
              borderWidth: 0.65,
            });
            page.drawLine({
              start: { x: iconX - 1.15, y: iconY + 3.5 },
              end: { x: iconX + 1.15, y: iconY + 3.5 },
              color,
              thickness: 0.65,
            });
            page.drawLine({
              start: { x: iconX, y: iconY + 2.55 },
              end: { x: iconX, y: iconY + 3.5 },
              color,
              thickness: 0.65,
            });
            page.drawLine({
              start: { x: iconX, y: iconY },
              end: { x: iconX + 1.35, y: iconY + 1.35 },
              color,
              thickness: 0.65,
            });
          } else {
            const fingerX = [iconX - 1.7, iconX - 0.55, iconX + 0.6, iconX + 1.75];
            const fingerTop = [iconY + 2.35, iconY + 3.05, iconY + 2.75, iconY + 1.9];
            fingerX.forEach((finger, index) => {
              page.drawLine({
                start: { x: finger, y: iconY - 0.2 },
                end: { x: finger, y: fingerTop[index] },
                color,
                thickness: 0.65,
              });
            });
            page.drawLine({
              start: { x: iconX - 1.7, y: iconY - 0.2 },
              end: { x: iconX - 2.9, y: iconY + 0.95 },
              color,
              thickness: 0.65,
            });
            page.drawLine({
              start: { x: iconX - 2.9, y: iconY + 0.95 },
              end: { x: iconX - 3.45, y: iconY + 0.35 },
              color,
              thickness: 0.65,
            });
            page.drawLine({
              start: { x: iconX - 1.7, y: iconY - 0.2 },
              end: { x: iconX - 0.75, y: iconY - 2.25 },
              color,
              thickness: 0.65,
            });
            page.drawLine({
              start: { x: iconX - 0.75, y: iconY - 2.25 },
              end: { x: iconX + 1.65, y: iconY - 1.8 },
              color,
              thickness: 0.65,
            });
          }
          page.drawText(label, {
            x: statusX + 14,
            y: y - 12.2,
            size: 4.8,
            font: regular,
            color,
          });
          statusX += width + 4;
        };
        statusLabels.forEach(({ label, color, icon }, index) =>
          drawStatusMarker(label, statusWidths[index], color, icon)
        );
        const priceValues = [
          [money(row.clear, mode), row.clearBasis, clearColumnX, 52],
          [money(row.photochromic, mode), row.photochromicBasis, photoColumnX, 52],
          ...(!isAdgaList
            ? ([[money(row.transitions, mode), row.transitionsBasis, transitionsColumnX, 58]] as const)
            : []),
          [money(row.polarized, mode), row.polarizedBasis, polarColumnX, 50],
        ] as const;
        priceValues.forEach(([value, basis, x, width]) => {
          page.drawText(fitText(bold, value, width, 7.2), {
            x,
            y: y - 9,
            size: 7.2,
            font: bold,
            color: NAVY,
          });
          if (basis) {
            const basisSize = basis === "Blue Filter Polycarbonate" ? 4.2 : 4.8;
            page.drawText(fitText(bold, basis, width, basisSize), {
              x,
              y: y - 19,
              size: basisSize,
              font: bold,
              color: MUTED,
            });
          }
        });
        page.drawLine({
          start: { x: designColumnX, y: rowTop - TABLE_ROW_HEIGHT },
          end: { x: PAGE_WIDTH - MARGIN, y: rowTop - TABLE_ROW_HEIGHT },
          color: RULE,
          thickness: 0.45,
        });
        y -= TABLE_ROW_HEIGHT;
        designStripeIndex += 1;
      });
      rowIndex += chunk.length;
    }
  };

  const drawCompactItemGrid = (
    items: Array<{ name: string; detail?: string; price: string }>,
    detailWidth = 104
  ) => {
    const columns = items.length > 8 ? 2 : 1;
    const gap = 0;
    const columnWidth = (CONTENT_WIDTH - gap * (columns - 1)) / columns;
    const rowHeight = 19;

    for (let index = 0; index < items.length; index += columns) {
      ensureSpace(rowHeight);
      const rowItems = items.slice(index, index + columns);
      const rowTop = y + 2;
      const zebraFill = Math.floor(index / columns) % 2 === 1 ? CREAM : rgb(1, 1, 1);
      page.drawRectangle({
        x: MARGIN,
        y: rowTop - rowHeight,
        width: CONTENT_WIDTH,
        height: rowHeight,
        color: zebraFill,
      });
      rowItems.forEach((item, columnIndex) => {
        const x = MARGIN + columnIndex * (columnWidth + gap);
        if (columnIndex > 0) {
          page.drawLine({
            start: { x, y: rowTop - rowHeight },
            end: { x, y: rowTop },
            color: RULE,
            thickness: 0.45,
          });
        }
        const priceWidth = Math.min(86, Math.max(48, columnWidth * 0.22));
        page.drawText(fitText(regular, item.name, columnWidth - detailWidth - priceWidth - 12, 7.4), {
          x: x + 5,
          y: y - 10,
          size: 7.4,
          font: regular,
          color: TEXT,
        });
        if (item.detail) {
          page.drawText(fitText(regular, item.detail, detailWidth, 7), {
            x: x + columnWidth - detailWidth - 48,
            y: y - 10,
            size: 7,
            font: regular,
            color: MUTED,
          });
        }
        page.drawText(fitText(bold, item.price, priceWidth - 5, 7.4), {
          x: x + columnWidth - priceWidth,
          y: y - 10,
          size: 7.4,
          font: bold,
          color: NAVY,
        });
      });
      page.drawLine({
        start: { x: MARGIN, y: rowTop - rowHeight },
        end: { x: PAGE_WIDTH - MARGIN, y: rowTop - rowHeight },
        color: RULE,
        thickness: 0.45,
      });
      y -= rowHeight;
    }
  };

  const compactItemGridHeight = (itemCount: number) => {
    const columns = itemCount > 8 ? 2 : 1;
    return Math.ceil(itemCount / columns) * 19;
  };

  const boxedItemGroupHeight = (itemCount: number, hasNote: boolean) =>
    (hasNote ? 42 : 30) + itemCount * 17 + 8;

  const drawBoxedItemGroups = (
    groups: Array<{
      title: string;
      note?: string;
      logoBrand?: string;
      items: Array<{ name: string; price: string }>;
    }>
  ) => {
    for (const group of groups) {
      const rowHeight = 17;
      const headerHeight = group.note ? 42 : 30;
      const boxHeight = headerHeight + group.items.length * rowHeight;
      ensureSpace(boxHeight + 8);
      page.drawRectangle({
        x: MARGIN,
        y: y - boxHeight + 3,
        width: CONTENT_WIDTH,
        height: boxHeight,
        color: rgb(1, 1, 1),
        borderColor: RULE,
        borderWidth: 0.8,
      });
      page.drawText(group.title, {
        x: MARGIN + 10,
        y: y - 13,
        size: 9,
        font: bold,
        color: NAVY,
      });
      if (group.note) {
        page.drawText(fitText(regular, group.note, CONTENT_WIDTH - 20, 7.2), {
          x: MARGIN + 10,
          y: y - 25,
          size: 7.2,
          font: regular,
          color: MUTED,
        });
      }
      y -= group.note ? 40 : 28;
      group.items.forEach((item, index) => {
        if (index % 2 === 0) {
          page.drawRectangle({
            x: MARGIN + 8,
            y: y - 13,
            width: CONTENT_WIDTH - 16,
            height: 15,
            color: CREAM,
          });
        }
        page.drawText(fitText(regular, item.name, CONTENT_WIDTH - 120, 7.4), {
          x: MARGIN + 14,
          y: y - 9,
          size: 7.4,
          font: regular,
          color: TEXT,
        });
        page.drawText(fitText(bold, item.price, 80, 7.4), {
          x: PAGE_WIDTH - MARGIN - 86,
          y: y - 9,
          size: 7.4,
          font: bold,
          color: NAVY,
        });
        y -= rowHeight;
      });
      y -= 8;
    }
  };

  const deriveSvOptionAddOn = (brand: string) => {
    const baseline = priceList.rows.find(
      (row) =>
        row.designStyle === "SV" &&
        row.materialRaw === "PLY" &&
        row.materialColor === "Clear" &&
        row.colorRaw.includes("CLR")
    );
    if (!baseline) return undefined;
    const grayPreference = ["TGY", "SEG", "2GY", "DGY", "NAG", "NCG"];
    const optionRows = priceList.rows
      .filter(
        (row) =>
          row.designStyle === "SV" &&
          row.materialColor === "Photochromic" &&
          row.colorBrand.toLowerCase() === brand.toLowerCase()
      )
      .sort((a, b) => {
        const aGray = a.colorRaw.some((color) => grayPreference.includes(color)) ? 0 : 1;
        const bGray = b.colorRaw.some((color) => grayPreference.includes(color)) ? 0 : 1;
        return aGray - bGray || rowPrice(a, mode) - rowPrice(b, mode);
      });
    const option = optionRows[0];
    if (!option) return undefined;
    const addOn = rowPrice(option, mode) - rowPrice(baseline, mode);
    if (!Number.isFinite(addOn) || addOn <= 0) return undefined;
    return `$${addOn.toFixed(2)}`;
  };

  const normalizeAddOnSections = (sections: PriceListAddOnSection[]) =>
    sections.map((section) => {
      if (!/photochromic/i.test(section.title)) return section;
      return {
        ...section,
        items: section.items.map((item) => {
          const currentPrice = priceText(item.price);
          if (!/see lens option/i.test(currentPrice)) return item;
          const derived = deriveSvOptionAddOn(item.name);
          return derived ? { ...item, price: derived } : item;
        }),
      };
    });

  const cleanCoatingBrand = (brandFamily: string) =>
    cleanText(brandFamily)
      .replace(/\s+AR\s+Coatings?$/i, "")
      .replace(/\s+Coatings?$/i, "")
      .replace(/^Techshield(?: by VSP)?$/i, "TechShield by VSP")
      .replace(/^Shamir$/i, "Shamir");

  const cleanCoatingName = (coating: PriceListArCoating) => {
    const brand = cleanCoatingBrand(coating.brandFamily);
    let name = cleanText(coating.name)
      .replace(/^Tecshield\b/i, "TechShield")
      .replace(/^Techshield\b/i, "TechShield");
    if (/^Artisan$/i.test(brand) && !/^Artisan\b/i.test(name)) {
      if (/^Standard$/i.test(name)) name = "Artisan Standard";
      else name = `Artisan ${name}`;
    }
    const code = cleanText(coating.code ?? "").toUpperCase();
    return code ? `${name} (${code})` : name;
  };

  const coatingGroupLogo = (brand: string) => {
    if (/^Artisan$/i.test(brand)) return "Artisan";
    return undefined;
  };

  const drawPreferredArtisanArCards = (coatings: PriceListArCoating[]) => {
    const byCode = new Map(
      coatings.map((coating) => [String(coating.code ?? "").toUpperCase(), coating])
    );
    const cards = preferredArtisanAr
      .filter((item) => byCode.has(item.code))
      .map((item) => ({ ...item, coating: byCode.get(item.code)! }))
      .sort((a, b) => a.coating.price - b.coating.price);
    if (!cards.length) return;

    const gap = 8;
    const width = (CONTENT_WIDTH - gap) / 2;
    const height = 82;
    const rowsNeeded = Math.ceil(cards.length / 2);
    ensureSpace(rowsNeeded * (height + gap) + 28);
    page.drawText("Artisan favorites - produced on-site", {
      x: MARGIN,
      y: y - 9,
      size: 8.4,
      font: bold,
      color: NAVY,
    });
    page.drawText("Faster turnaround and consistent Artisan quality.", {
      x: MARGIN + 200,
      y: y - 9,
      size: 7.2,
      font: regular,
      color: MUTED,
    });
    y -= 20;
    cards.forEach((card, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const x = MARGIN + column * (width + gap);
      const top = y - row * (height + gap);
      page.drawRectangle({
        x,
        y: top - height,
        width,
        height,
        color: rgb(1, 1, 1),
        borderColor: RULE,
        borderWidth: 0.8,
      });
      const imageBounds = card.image.scaleToFit(180, 50);
      page.drawImage(card.image, {
        x: x + 5,
        y: top - 51,
        width: imageBounds.width,
        height: imageBounds.height,
      });
      page.drawText(`${card.name} (${card.code})`, {
        x: x + 10,
        y: top - 52,
        size: 7.8,
        font: bold,
        color: NAVY,
      });
      page.drawText(`$${card.coating.price.toFixed(2)}`, {
        x: x + width - 52,
        y: top - 18,
        size: 8.2,
        font: bold,
        color: NAVY,
      });
      page.drawText(fitText(regular, card.description, width - 20, 6.5), {
        x: x + 10,
        y: top - 68,
        size: 6.5,
        font: regular,
        color: MUTED,
      });
    });
    y -= rowsNeeded * (height + gap) + 2;
  };

  const drawWrappedParagraph = (
    text: string,
    {
      x,
      maxWidth,
      size = 8,
      font = regular,
      color = TEXT,
      lineHeight = 11,
      prefix = "",
      hangingIndent = 0,
    }: {
      x: number;
      maxWidth: number;
      size?: number;
      font?: PDFFont;
      color?: ReturnType<typeof rgb>;
      lineHeight?: number;
      prefix?: string;
      hangingIndent?: number;
    }
  ) => {
    const words = cleanText(text).split(" ").filter(Boolean);
    let line = prefix;
    let lineX = x;
    for (const word of words) {
      const next = line.trim() ? `${line} ${word}` : `${prefix}${word}`;
      if (font.widthOfTextAtSize(next, size) > maxWidth && line.trim()) {
        page.drawText(line.trimEnd(), { x: lineX, y, size, font, color });
        y -= lineHeight;
        line = `${" ".repeat(hangingIndent)}${word}`;
        lineX = x;
      } else {
        line = next;
      }
    }
    if (line.trim()) {
      page.drawText(line.trimEnd(), { x: lineX, y, size, font, color });
      y -= lineHeight;
    }
  };

  const drawPolicyPage = () => {
    addPage(true);
    sectionTitle("Artisan Policies");
    y -= 10;
    const policies = [
      {
        title: "AR and scratch warranties",
        bullets: [
          ...(priceList.code === "J2" ? [] : ["Artisan Standard: 1 year, 1 time."]),
          "Artisan premium AR treatments including Artisan Armour, Artisan Emerald, Artisan Azure, Artisan Nytopia, and Diamond Sun: 2 years, 2 times.",
          ...(isAdgaList
            ? ["TechShield and Tokai AR technologies: 2 years, 2 times."]
            : ["TechShield, Tokai, Crizal, Shamir, and Hoya AR technologies: 2 years, 2 times."]),
          "Factory scratch coat: 1 year, 1 time. Diamond Defence: 2 years, 2 times.",
          "Covered AR and scratch claims do not require lenses to be returned before the warranty is used.",
        ],
      },
      {
        title: "Doctor redos and non-adapts",
        bullets: [
          "Changes to design, power, PD, prism, frame, segment height, or other patient non-adaptable elements may be accommodated 1 time at no charge within the first year.",
          ...(isAdgaList
            ? ["Additional doctor redos are provided at 50% of the standard price."]
            : []),
          "If a remake upgrades to a higher-priced product, the original invoice is credited and the remake is invoiced at the new product price when shipped.",
          "Submit remake details with the original order, patient initials, remake reason, and updated measurements or frame details when requested.",
        ],
      },
      {
        title: "Lab error remakes",
        bullets: [
          "Valid lab error remakes received within 30 days from ship date are processed at no charge.",
          "Returned lenses may be required for inspection and quality control.",
          "If the request does not qualify as lab error, the available doctor redo may be used instead.",
        ],
      },
      {
        title: "Frames and patient-owned frames",
        bullets: [
          "Frames will only be replaced when accompanied by a frame manifest.",
          "The lab may reject frames that are fragile or unsuitable for the Rx and lens order.",
          "Patient-owned frames are processed at the practice's risk and are not guaranteed against breakage during handling or processing.",
          "If an order is more than 30 days old, patient-owned frame policies apply and the practice is responsible for replacement if the frame breaks during processing.",
        ],
      },
      {
        title: "Second pair and multiple-pair discounts",
        bullets: [
          "Additional pairs ordered within 30 days of the original invoice date are eligible for a 50% discount on the lesser-priced pair.",
          "Each qualifying pair must include premium AR or polarization.",
          "Neurolens, Chem Clips, and some specialty work may be excluded or follow separate rules.",
        ],
      },
      {
        title: "Shipping, cancellations, and specialty work",
        bullets: [
          ...(isAdgaList
            ? ["There are no shipping charges."]
            : [
                "Next Day Air: $4.00 per job. 2-Day Shipping: $16.00 per box. Ground Delivery: $8.00 per box. Mail to Patient: $8.00.",
                "Inbound shipping is complimentary.",
              ]),
          "Orders cancelled after production begins are billed as an uncut. Orders cancelled before production begins are not billed.",
          "Specialty, outsourced, manufacturer, VSP, Unity, and vendor-directed jobs may follow separate pricing, lead times, return rules, or warranty requirements.",
        ],
      },
    ];
    for (const policy of policies) {
      ensureSpace(36 + policy.bullets.length * 28);
      page.drawText(policy.title, {
        x: MARGIN,
        y,
        size: 9.6,
        font: bold,
        color: NAVY,
      });
      y -= 14;
      for (const bullet of policy.bullets) {
        drawWrappedParagraph(bullet, {
          x: MARGIN + 10,
          maxWidth: CONTENT_WIDTH - 10,
          size: 7.9,
          lineHeight: 10,
          prefix: "- ",
        });
        y -= 2;
      }
      y -= 7;
    }
  };

  addPage();
  page.drawText(cleanText(customerDisplayName), {
    x: MARGIN,
    y,
    size: 21,
    font: bold,
    color: NAVY,
  });
  y -= 22;
  page.drawText(
    `${mode === "uncut" ? "Uncut" : "Edged and assembled"} pricing | Generated ${generatedDate}`,
    { x: MARGIN, y, size: 9, font: regular, color: MUTED }
  );
  y -= 25;
  drawIntroPanel();

  const summaries = summarizeDesigns(priceList, mode);
  const categoryGroups = new Map<PriceDisplayCategory, typeof summaries>();
  for (const summary of summaries) {
    categoryGroups.set(summary.displayCategory, [
      ...(categoryGroups.get(summary.displayCategory) ?? []),
      summary,
    ]);
  }

  const orderedSections = isAdgaList
    ? ([priceList.code] as const).flatMap((guide) => {
        const guideCategories = new Map<PriceDisplayCategory, typeof summaries>();
        for (const summary of summaries.filter((row) => row.priceGuideCode === guide)) {
          guideCategories.set(summary.displayCategory, [
            ...(guideCategories.get(summary.displayCategory) ?? []),
            summary,
          ]);
        }
        return [...guideCategories.entries()]
          .sort(([a], [b]) => comparePriceDisplayCategory(a, b))
          .map(([category, rows]) => ({
            category,
            categoryRows: rows,
            sectionLabel: category,
          }));
      })
    : [...categoryGroups.entries()]
        .sort(([a], [b]) => comparePriceDisplayCategory(a, b))
        .map(([category, rows]) => ({
          category,
          categoryRows: rows,
          sectionLabel: category,
        }));

  for (const { category, categoryRows, sectionLabel } of orderedSections) {
    if (
      category === "Progressive Designs" &&
      usesBrandOnlyProgressiveLayout
    ) {
      ensureSpace(34 + TABLE_HEADER_HEIGHT + TABLE_ROW_HEIGHT + 12);
      sectionTitle(
        sectionLabel,
        polycarbonateBasis
          ? "Material basis shown per price"
          : undefined
      );

      const brandGroups = new Map<string, typeof summaries>();
      for (const row of categoryRows) {
        brandGroups.set(row.brand, [...(brandGroups.get(row.brand) ?? []), row]);
      }

      drawTableHeader(true);
      for (const [brand, brandRows] of [...brandGroups.entries()].sort(
        ([a], [b]) => comparePriceDisplayBrand(a, b)
      )) {
        const orderedBrandRows = [...brandRows].sort(
          (a, b) =>
            compareSummaryPriceForCategory(a, b, category, mode) ||
            compareDesignStyle(a.designStyle, b.designStyle)
        );
        drawBrandRows({
          sectionLabel,
          tier: "All",
          brand,
          rows: orderedBrandRows,
        });
      }
      y -= 8;
      continue;
    }

    const tierGroups = new Map<ProgressiveTier | "All", typeof summaries>();
    for (const row of categoryRows) {
      const tier = row.progressiveTier ?? "All";
      tierGroups.set(tier, [...(tierGroups.get(tier) ?? []), row]);
    }
    const orderedTierGroups = [...tierGroups.entries()].sort(([a], [b]) => {
      if (a === "All" || b === "All") return 0;
      return compareProgressiveTier(a, b);
    });
    const firstTier = orderedTierGroups[0]?.[0];
    const openingHeight =
      34 +
      (firstTier && firstTier !== "All" ? 24 : 0) +
      TABLE_HEADER_HEIGHT +
      TABLE_ROW_HEIGHT +
      12;
    ensureSpace(openingHeight);
    sectionTitle(
      sectionLabel,
      polycarbonateBasis
        ? "Material basis shown per price"
        : undefined
    );

    for (const [tier, tierRows] of orderedTierGroups) {
      if (tier !== "All") drawTierHeader(tier);
      const brandGroups = new Map<string, typeof summaries>();
      for (const row of tierRows) {
        brandGroups.set(row.brand, [...(brandGroups.get(row.brand) ?? []), row]);
      }

      drawTableHeader(true);
      for (const [brand, brandRows] of [...brandGroups.entries()].sort(
        ([a], [b]) => comparePriceDisplayBrand(a, b)
      )) {
        const orderedBrandRows = [...brandRows].sort(
          (a, b) =>
            compareSummaryPriceForCategory(a, b, category, mode) ||
            compareDesignStyle(a.designStyle, b.designStyle)
        );
        drawBrandRows({ sectionLabel, tier, brand, rows: orderedBrandRows });
      }
    }
    y -= 8;
  }

  if (priceList.arCoatings.length) {
    ensureSpace(100);
    sectionTitle("Anti-Reflective Coatings");
    const coatingBrand = (coating: PriceListArCoating) => {
      const identity = `${coating.brandFamily} ${coating.name}`;
      return /\bunity\b|tech\s*shield/i.test(identity)
        ? "TechShield by VSP"
        : cleanCoatingBrand(coating.brandFamily);
    };
    const coatingRank = (brand: string) => {
      const order = ["Artisan", "TechShield by VSP", "Neurolens", "Tokai", "Crizal", "Hoya", "Shamir"];
      const index = order.findIndex((value) => value.toLowerCase() === brand.toLowerCase());
      return index === -1 ? 99 : index;
    };
    const coatingTurnaroundNote = (brand: string) =>
      /^(Artisan|TechShield by VSP)$/i.test(brand)
        ? "Produced on-site for faster turnaround and consistent Artisan quality."
        : "Produced off-site; additional turnaround time applies.";
    const coatings = [...priceList.arCoatings]
      .filter((coating) => !coating.unresolved && !/^UV Coating$/i.test(coating.name))
      .sort((a, b) => {
        const aBrand = coatingBrand(a);
        const bBrand = coatingBrand(b);
        return (
          coatingRank(aBrand) - coatingRank(bBrand) ||
          compareText(aBrand, bBrand) ||
          a.price - b.price ||
          compareText(cleanCoatingName(a), cleanCoatingName(b))
        );
      });
    const coatingGroups = new Map<string, PriceListArCoating[]>();
    for (const coating of coatings) {
      const brand = coatingBrand(coating);
      coatingGroups.set(brand, [...(coatingGroups.get(brand) ?? []), coating]);
    }
    drawPreferredArtisanArCards(coatings);
    drawBoxedItemGroups(
      [...coatingGroups.entries()].map(([brand, entries]) => ({
        title: brand === "Artisan" ? "Artisan, cont." : brand,
        note: coatingTurnaroundNote(brand),
        logoBrand: coatingGroupLogo(brand),
        items: entries
          .filter(
            (coating) =>
              brand !== "Artisan" ||
              !["AEM", "AAR", "NYT", "AAZ"].includes(
                String(coating.code ?? "").toUpperCase()
              )
          )
          .map((coating) => ({
          name: cleanCoatingName(coating),
          price: portalPriceList.package && coating.price === 0
            ? "Included"
            : `$${coating.price.toFixed(2)}`,
          })),
      })).filter((group) => group.items.length)
    );
  }

  const normalizedAddOnSections = normalizeAddOnSections(priceList.addOnSections);
  for (const [sectionIndex, section] of normalizedAddOnSections.entries()) {
    if (!section.items.length) continue;
    if (sectionIndex > 0) y -= 8;
    ensureSpace(36 + compactItemGridHeight(section.items.length) + 8);
    sectionTitle(section.title);
    drawCompactItemGrid(
      section.items.map((item) => ({
        name: item.name,
        price: priceText(item.price),
      })),
      0
    );
  }

  const chemistrieGroupHeight = boxedItemGroupHeight(
    chemistrieClipItems.length,
    true
  );
  ensureSpace(36 + 30 + chemistrieGroupHeight);
  y -= 8;
  sectionTitle(CHEMISTRIE_CLIPS_SECTION_TITLE);
  const chemistrieBounds = chemistrieLogo.scaleToFit(120, 26);
  page.drawImage(chemistrieLogo, {
    x: MARGIN + 10,
    y: y - 25,
    width: chemistrieBounds.width,
    height: chemistrieBounds.height,
  });
  y -= 30;
  drawBoxedItemGroups([
    {
      title: "ChemClip by Chemistrie",
      note: CHEMISTRIE_CLIPS_SECTION_NOTE,
      items: chemistrieClipItems.map((item) => ({
        name: item.name,
        price: `$${item.price.toFixed(2)}`,
      })),
    },
  ]);

  drawPolicyPage();
  drawLabShowcasePage();

  pages.forEach((currentPage, index) => {
    currentPage.drawLine({
      start: { x: MARGIN, y: 43 },
      end: { x: PAGE_WIDTH - MARGIN, y: 43 },
      color: GOLD,
      thickness: 0.8,
    });
    currentPage.drawText(
      fitText(
        bold,
        isAdminCustomer(customerName)
          ? `Confidential - ${ADMIN_CUSTOMER_NAME}`
          : `Confidential - Prepared for ${customerDisplayName}`,
        CONTENT_WIDTH - 95,
        7.5
      ),
      {
        x: MARGIN,
        y: 28,
        size: 7.5,
        font: bold,
        color: NAVY,
      }
    );
    currentPage.drawText(`Page ${index + 1} of ${pages.length}`, {
      x: PAGE_WIDTH - MARGIN - 66,
      y: 28,
      size: 7.5,
      font: regular,
      color: MUTED,
    });
    const footerNote = isAdgaList
      ? `Transitions is a $50.00 upcharge.${priceList.code === "J2" ? " Artisan Emerald (AEM) is $50.00." : ""}`
      : polycarbonateBasis
        ? PRICE_BASIS_NOTE
        : STANDARD_PRICE_NOTE;
    currentPage.drawText(fitText(regular, footerNote, CONTENT_WIDTH, 6.6), {
      x: MARGIN,
      y: 16,
      size: 6.6,
      font: regular,
      color: MUTED,
    });
  });

  document.setTitle(`${listDisplayName} - ${customerDisplayName}`);
  document.setAuthor("Artisan Lab Network");
  document.setSubject("Confidential customer pricing");
  return document.save();
}

export async function GET(request: NextRequest) {
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for") ||
    "unknown";
  const ipRate = checkRateLimit({
    key: `portal-export-ip:${ip}`,
    limit: 20,
    windowMs: 60_000,
  });
  if (!ipRate.allowed) {
    return new NextResponse("Too many requests.", {
      status: 429,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  const code = canonicalPriceListCode(
    request.nextUrl.searchParams.get("code") || "G6"
  );
  if (!isVisiblePriceListCode(code)) {
    return new NextResponse("Pricing data is not available for this list.", {
      status: 404,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
  const previewAccountNumber =
    request.nextUrl.searchParams.get("account")?.trim() || undefined;
  const priceMode: PriceMode =
    request.nextUrl.searchParams.get("priceMode") === "uncut"
      ? "uncut"
      : "edged";
  const access = await getAuthorizedRuntimePriceListFromHeaders(
    request.headers,
    code,
    previewAccountNumber ? { previewAccountNumber } : undefined
  );

  if (access.status === "unauthenticated") {
    return new NextResponse("Unable to verify your secure login.", {
      status: 401,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
  if (access.status !== "authorized") {
    return new NextResponse("You do not have access to this price list.", {
      status: 403,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  const generatedPriceLists = [
    await loadRuntimePackagedPriceListByCode(code, request.nextUrl.origin),
  ];
  if (generatedPriceLists.some((priceList) => !priceList)) {
    return new NextResponse("Pricing data is not available for this list.", {
      status: 404,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  const priceList = isAdgaPriceListCode(code)
    ? buildOfficialAdgaPriceList({
        source: generatedPriceLists[0]!,
        guide: code as "J1" | "J2",
      })
    : customerFacingPriceList(generatedPriceLists[0]!);
  const customerName =
    access.customer.practiceName?.trim() ||
    `Account ${access.customer.accountNumber}`;
  const pdf = await buildPriceListPdf({
    priceList,
    portalPriceList: access.priceList,
    customerName,
    mode: priceMode,
    requestOrigin: request.nextUrl.origin,
  });
  const safeCode = cleanText(code).toLowerCase();

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="artisan-${safeCode}-price-list.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
    },
  });
}
