import { NextRequest, NextResponse } from "next/server";
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import { getAuthorizedRuntimePriceListFromHeaders } from "@/lib/portal/priceListRuntimeAccess";
import { canonicalPriceListCode } from "@/lib/portal/priceLists";
import { checkRateLimit } from "@/lib/portal/rateLimit";
import { customerFacingPriceList } from "@/lib/pricing/customerPriceList";
import { isVisiblePriceListCode } from "@/lib/pricing/priceListCodes";
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
  "Design prices are shown in polycarbonate. Materials, blue filters, photochromics, polarized options, AR, finishing, and shipping are add-ons or deductions unless noted.";
const ADMIN_CUSTOMER_NAME = "Artisan Customer Pricing";
const BRAND_COLUMN_WIDTH = 120;
const DESIGN_COLUMN_X = MARGIN + BRAND_COLUMN_WIDTH;
const DESIGN_TEXT_X = DESIGN_COLUMN_X + 8;
const CLEAR_COLUMN_X = MARGIN + 364;
const PHOTO_COLUMN_X = MARGIN + 424;
const POLAR_COLUMN_X = MARGIN + 484;
const TABLE_ROW_HEIGHT = 19;
const TABLE_HEADER_HEIGHT = 20;

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

function titleCasePriceListName(value: string) {
  const acronyms = new Set(["AR", "CD", "IOT", "PMP", "SV", "VSP"]);
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
  if (!row) return Number.POSITIVE_INFINITY;
  return mode === "uncut" ? row.uncutPrice : row.edgedPrice;
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
  return cleanText(value);
}

function lowestRow(
  rows: PriceListPricingRow[],
  materialColor: string,
  mode: PriceMode
) {
  return rows
    .filter((row) => row.materialColor === materialColor && rowPrice(row, mode) > 0)
    .sort((a, b) => rowPrice(a, mode) - rowPrice(b, mode))[0];
}

function summarizeDesigns(priceList: GeneratedPriceListData, mode: PriceMode) {
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
    const key = `${row.designType}|${row.brand}|${row.designStyle}`;
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }

  return [...groups.values()]
    .map((rows) => ({
      designType: rows[0].designType,
      displayCategory: priceDisplayCategory(rows[0]),
      progressiveTier:
        priceDisplayCategory(rows[0]) === "Progressive Designs"
          ? progressiveTierFor(rows[0])
          : undefined,
      brand: rows[0].brand,
      designStyle: rows[0].designStyle,
      clear: lowestRow(rows, "Clear", mode),
      photochromic: lowestRow(rows, "Photochromic", mode),
      polarized: lowestRow(rows, "Polarized", mode),
    }))
    .sort(
      (a, b) =>
        comparePriceDisplayCategory(a.displayCategory, b.displayCategory) ||
        (a.progressiveTier && b.progressiveTier
          ? compareProgressiveTier(a.progressiveTier, b.progressiveTier)
          : 0) ||
        comparePriceDisplayBrand(a.brand, b.brand) ||
        compareText(a.designStyle, b.designStyle)
    );
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

  const addPage = (continuation = false) => {
    page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pages.push(page);
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
    page.drawText(cleanText(title).toUpperCase(), {
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
      ["Design", showBrand ? DESIGN_TEXT_X : MARGIN + 6],
      ["Clear", CLEAR_COLUMN_X],
      ["Photo", PHOTO_COLUMN_X],
      ["Polar", POLAR_COLUMN_X],
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
      width: BRAND_COLUMN_WIDTH,
      height,
      color: SOFT_FILL,
      borderColor: RULE,
      borderWidth: 0.6,
    });
    const textX = MARGIN + 8;
    const textWidth = BRAND_COLUMN_WIDTH - 16;
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
    ensureSpace(82);
    const badgeWidth = 124;
    const badgeHeight = 36;
    const badgeX = PAGE_WIDTH - MARGIN - badgeWidth - 18;
    const badgeY = y - 50;
    const introTextWidth = badgeX - (MARGIN + 18) - 24;
    page.drawRectangle({
      x: MARGIN,
      y: y - 67,
      width: CONTENT_WIDTH,
      height: 70,
      color: SOFT_FILL,
      borderColor: RULE,
      borderWidth: 0.8,
    });
    page.drawRectangle({
      x: MARGIN,
      y: y - 67,
      width: 7,
      height: 70,
      color: GOLD,
    });
    page.drawText("Confidential pricing guide", {
      x: MARGIN + 10,
      y: y - 18,
      size: 10,
      font: bold,
      color: NAVY,
    });
    page.drawText(
      fitText(
        regular,
        "Clean customer-ready pricing, organized by design family with coatings, add-ons, and policy notes in one place.",
        introTextWidth,
        8
      ),
      {
        x: MARGIN + 18,
        y: y - 33,
        size: 8,
        font: regular,
        color: TEXT,
      }
    );
    page.drawText(
      fitText(
        regular,
        "Lab contact details are grouped on the final page for a cleaner opening presentation.",
        introTextWidth,
        7.4
      ),
      {
        x: MARGIN + 18,
        y: y - 48,
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
    y -= 78;
  };

  const drawLabShowcasePage = () => {
    addPage(true);
    const statementTop = PAGE_HEIGHT - 170;
    const panelBottom = 88;
    const panelHeight = 458;
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
    page.drawText(
      "Each lab logo is paired with direct support details here so the pricing pages stay clean and easy to scan.",
      {
        x: MARGIN,
        y: statementTop - 35,
        size: 8.5,
        font: regular,
        color: MUTED,
      }
    );

    page.drawRectangle({
      x: MARGIN,
      y: panelBottom,
      width: CONTENT_WIDTH,
      height: panelHeight,
      color: SOFT_FILL,
      borderColor: RULE,
      borderWidth: 0.9,
    });
    const cardTop = panelTop - 24;
    const cardHeight = 392;
    const logoPanelHeight = 118;
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
      page.drawText(fitText(bold, lab.name, columnWidth - 20, 10.4), {
        x: x + 10,
        y: cardTop - 154,
        size: 10.4,
        font: bold,
        color: NAVY,
      });
      page.drawText("Customer Support", {
        x: x + 10,
        y: cardTop - 171,
        size: 6.9,
        font: bold,
        color: lab.accent,
      });
      page.drawRectangle({
        x: x + 10,
        y: cardTop - 306,
        width: columnWidth - 20,
        height: 112,
        color: SOFT_FILL,
        borderColor: RULE,
        borderWidth: 0.7,
      });
      page.drawText("Phone", {
        x: x + 18,
        y: cardTop - 215,
        size: 6.8,
        font: bold,
        color: MUTED,
      });
      page.drawText(lab.phone, {
        x: x + 18,
        y: cardTop - 234,
        size: 10.2,
        font: bold,
        color: NAVY,
      });
      page.drawLine({
        start: { x: x + 18, y: cardTop - 247 },
        end: { x: x + columnWidth - 18, y: cardTop - 247 },
        color: RULE,
        thickness: 0.8,
      });
      page.drawText("Email", {
        x: x + 18,
        y: cardTop - 267,
        size: 6.8,
        font: bold,
        color: MUTED,
      });
      page.drawText(fitText(regular, lab.email, columnWidth - 36, 7.2), {
        x: x + 18,
        y: cardTop - 286,
        size: 7.2,
        font: regular,
        color: TEXT,
      });
    });
  };

  const drawBrandRows = ({
    category,
    tier,
    brand,
    rows,
  }: {
    category: PriceDisplayCategory;
    tier: ProgressiveTier | "All";
    brand: string;
    rows: ReturnType<typeof summarizeDesigns>;
  }) => {
    let rowIndex = 0;
    while (rowIndex < rows.length) {
      if (y - 25 < 58) {
        addPage(true);
        sectionTitle(category, "continued");
        if (tier !== "All") drawTierHeader(tier);
        drawTableHeader(true);
      }
      const availableRows = Math.max(1, Math.floor((y - 58) / TABLE_ROW_HEIGHT));
      const chunk = rows.slice(rowIndex, rowIndex + availableRows);
      const groupTop = y + 2;
      const groupHeight = chunk.length * TABLE_ROW_HEIGHT;
      drawBrandCell(brand, groupTop, groupHeight);
      chunk.forEach((row, chunkIndex) => {
        const absoluteIndex = rowIndex + chunkIndex;
        const rowTop = y + 2;
        const zebraFill = absoluteIndex % 2 === 1 ? CREAM : rgb(1, 1, 1);
        page.drawRectangle({
          x: DESIGN_COLUMN_X,
          y: rowTop - TABLE_ROW_HEIGHT,
          width: CONTENT_WIDTH - BRAND_COLUMN_WIDTH,
          height: TABLE_ROW_HEIGHT,
          color: zebraFill,
        });
        page.drawLine({
          start: { x: DESIGN_COLUMN_X, y: rowTop - TABLE_ROW_HEIGHT },
          end: { x: DESIGN_COLUMN_X, y: rowTop },
          color: RULE,
          thickness: 0.6,
        });
        const values: Array<[string, number, number, PDFFont, typeof TEXT]> = [
          [row.designStyle, DESIGN_TEXT_X, 248, regular, TEXT],
          [money(row.clear, mode), CLEAR_COLUMN_X, 52, bold, NAVY],
          [money(row.photochromic, mode), PHOTO_COLUMN_X, 52, bold, NAVY],
          [money(row.polarized, mode), POLAR_COLUMN_X, 50, bold, NAVY],
        ];
        values.forEach(([value, x, width, font, color]) => {
          page.drawText(fitText(font, value, width, 7.2), {
            x,
            y: y - 10,
            size: 7.2,
            font,
            color,
          });
        });
        page.drawLine({
          start: { x: DESIGN_COLUMN_X, y: rowTop - TABLE_ROW_HEIGHT },
          end: { x: PAGE_WIDTH - MARGIN, y: rowTop - TABLE_ROW_HEIGHT },
          color: RULE,
          thickness: 0.45,
        });
        y -= TABLE_ROW_HEIGHT;
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

  const drawBoxedItemGroups = (
    groups: Array<{ title: string; logoBrand?: string; items: Array<{ name: string; price: string }> }>
  ) => {
    for (const group of groups) {
      const rowHeight = 17;
      const boxHeight = 30 + group.items.length * rowHeight;
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
      y -= 28;
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
      .replace(/^Techshield$/i, "TechShield")
      .replace(/^Shamir$/i, "Shamir");

  const cleanCoatingName = (coating: PriceListArCoating) => {
    const brand = cleanCoatingBrand(coating.brandFamily);
    let name = cleanText(coating.name)
      .replace(/^Tecshield\b/i, "TechShield")
      .replace(/^Techshield\b/i, "TechShield")
      .replace(/^Nytopia$/i, "Nyoptia");
    if (/^Artisan$/i.test(brand) && !/^Artisan\b/i.test(name)) {
      if (/^Standard$/i.test(name)) name = "Artisan Standard";
      else name = `Artisan ${name}`;
    }
    return name;
  };

  const coatingGroupLogo = (brand: string) => {
    if (/^Artisan$/i.test(brand)) return "Artisan";
    return undefined;
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
    const policies = [
      {
        title: "AR and scratch warranties",
        bullets: [
          "Artisan Standard: 1 year, 1 time.",
          "Artisan premium AR treatments including Artisan Armour, Artisan Emerald, Artisan Azure, Artisan Nyoptia, and Diamond Sun: 2 years, 2 times.",
          "TechShield, Tokai, Crizal, Shamir, and Hoya AR technologies: 2 years, 2 times.",
          "Factory scratch coat: 1 year, 1 time. Diamond Defence: 2 years, 2 times.",
          "Covered AR and scratch claims do not require lenses to be returned before the warranty is used.",
        ],
      },
      {
        title: "Doctor redos and non-adapts",
        bullets: [
          "Changes to design, power, PD, prism, frame, segment height, or other patient non-adaptable elements may be accommodated 1 time at no charge within the first year.",
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
          "Neurolens, Chemiclips, and some specialty work may be excluded or follow separate rules.",
        ],
      },
      {
        title: "Shipping, cancellations, and specialty work",
        bullets: [
          "Next Day Air: $4 per job. 2-Day Shipping: $16 per box. Ground Delivery: $8 per box. Mail to Patient: $8.",
          "Inbound shipping is complimentary.",
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

  for (const [category, categoryRows] of [...categoryGroups.entries()].sort(
    ([a], [b]) => comparePriceDisplayCategory(a, b)
  )) {
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
    sectionTitle(category, `${categoryRows.length} designs`);

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
        drawBrandRows({ category, tier, brand, rows: brandRows });
      }
    }
    y -= 8;
  }

  if (priceList.arCoatings.length) {
    ensureSpace(100);
    sectionTitle(
      "Anti-Reflective Coatings",
      priceList.code === "NL"
        ? "Neurolens AR treatments"
        : "Artisan coatings first; additional options follow"
    );
    const coatings = [...priceList.arCoatings]
      .filter((coating) => !coating.unresolved && !/^UV Coating$/i.test(coating.name))
      .sort((a, b) => {
        const aBrand = cleanCoatingBrand(a.brandFamily);
        const bBrand = cleanCoatingBrand(b.brandFamily);
        const aArtisan = /^Artisan$/i.test(aBrand) ? 0 : 1;
        const bArtisan = /^Artisan$/i.test(bBrand) ? 0 : 1;
        return (
          aArtisan - bArtisan ||
          compareText(aBrand, bBrand) ||
          compareText(cleanCoatingName(a), cleanCoatingName(b))
        );
      });
    const coatingGroups = new Map<string, PriceListArCoating[]>();
    for (const coating of coatings) {
      const brand = cleanCoatingBrand(coating.brandFamily);
      coatingGroups.set(brand, [...(coatingGroups.get(brand) ?? []), coating]);
    }
    drawBoxedItemGroups(
      [...coatingGroups.entries()].map(([brand, entries]) => ({
        title: brand,
        logoBrand: coatingGroupLogo(brand),
        items: entries.map((coating) => ({
          name: cleanCoatingName(coating),
          price: `$${coating.price.toFixed(2)}`,
        })),
      }))
    );
  }

  const normalizedAddOnSections = normalizeAddOnSections(priceList.addOnSections);
  for (const [sectionIndex, section] of normalizedAddOnSections.entries()) {
    if (!section.items.length) continue;
    if (sectionIndex > 0) y -= 8;
    ensureSpace(62);
    sectionTitle(section.title);
    drawCompactItemGrid(
      section.items.map((item) => ({
        name: item.name,
        price: priceText(item.price),
      })),
      0
    );
  }

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
          ? `CONFIDENTIAL - ${ADMIN_CUSTOMER_NAME}`
          : `CONFIDENTIAL - Prepared for ${customerDisplayName}`,
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
    currentPage.drawText(fitText(regular, PRICE_BASIS_NOTE, CONTENT_WIDTH, 6.6), {
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

  const generated = await loadRuntimePackagedPriceListByCode(
    code,
    request.nextUrl.origin
  );
  if (!generated) {
    return new NextResponse("Pricing data is not available for this list.", {
      status: 404,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  const priceList = customerFacingPriceList(generated);
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
