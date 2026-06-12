import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFImage,
  type PDFPage,
} from "pdf-lib";
import { getAuthorizedPriceListFromHeaders } from "@/lib/portal/priceListAccess";
import { canonicalPriceListCode } from "@/lib/portal/priceLists";
import { checkRateLimit } from "@/lib/portal/rateLimit";
import { customerFacingPriceList } from "@/lib/pricing/customerPriceList";
import {
  comparePriceDisplayBrand,
  comparePriceDisplayCategory,
  compareProgressiveTier,
  priceDisplayCategory,
  progressiveTierFor,
  type PriceDisplayCategory,
  type ProgressiveTier,
} from "@/lib/pricing/displayTaxonomy";
import { loadGeneratedPriceListByCode } from "@/lib/pricing/loadGeneratedPriceList";
import type {
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

function rowPrice(row: PriceListPricingRow | undefined, mode: PriceMode) {
  if (!row) return Number.POSITIVE_INFINITY;
  return mode === "uncut" ? row.uncutPrice : row.edgedPrice;
}

function money(row: PriceListPricingRow | undefined, mode: PriceMode) {
  const value = rowPrice(row, mode);
  if (!Number.isFinite(value) || value <= 0) return "-";
  return `$${value.toFixed(2)}+`;
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
  customerName,
  mode,
}: {
  priceList: GeneratedPriceListData;
  customerName: string;
  mode: PriceMode;
}) {
  const document = await PDFDocument.create();
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const logoBytes = await readFile(
    path.join(process.cwd(), "public", "aln-white-logo.png")
  );
  const logo = await document.embedPng(logoBytes);
  const brandLogoPaths: Record<string, string> = {
    Artisan: "rings-transparent.png",
    IOT: "iot-logo.png",
    Unity: "unity-logo.png",
    "Sequel by Newton": "logos/Sequel_Brandmark_Horizontal_RGB_Charcoal.png",
    Tokai: "tokai-logo.png",
    Shamir: "shamir-logo.png",
    Hoya: "hoya-logo.png",
    Varilux: "varilux-logo.png",
  };
  const brandLogos = new Map<string, PDFImage>();
  for (const [brand, relativePath] of Object.entries(brandLogoPaths)) {
    try {
      const bytes = await readFile(path.join(process.cwd(), "public", relativePath));
      brandLogos.set(brand, await document.embedPng(bytes));
    } catch {
      // Text remains as the fallback when a logo asset cannot be embedded.
    }
  }
  const pages: PDFPage[] = [];
  let page!: PDFPage;
  let y = 0;

  const generatedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

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
      priceList.code === "NL" ? "NEUROLENS PRICE LIST" : `${cleanText(priceList.code)} PRICE LIST`,
      {
      x: 176,
      y: PAGE_HEIGHT - 44,
      size: 17,
      font: bold,
      color: rgb(1, 1, 1),
      }
    );
    page.drawText(
      continuation ? "Customer pricing guide - continued" : "Customer pricing guide",
      {
        x: 176,
        y: PAGE_HEIGHT - 63,
        size: 9,
        font: regular,
        color: rgb(0.86, 0.81, 0.71),
      }
    );
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
    y -= 34;
  };

  const drawTableHeader = () => {
    ensureSpace(24);
    page.drawRectangle({
      x: MARGIN,
      y: y - 17,
      width: CONTENT_WIDTH,
      height: 20,
      color: NAVY,
    });
    const headers = [
      ["Design", MARGIN + 6],
      ["Clear", MARGIN + 369],
      ["Photo", MARGIN + 425],
      ["Polar", MARGIN + 481],
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
    y -= 20;
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
    y -= 24;
  };

  const drawBrandHeader = (brand: string) => {
    ensureSpace(34);
    page.drawRectangle({
      x: MARGIN,
      y: y - 25,
      width: CONTENT_WIDTH,
      height: 28,
      color: rgb(0.985, 0.972, 0.95),
      borderColor: RULE,
      borderWidth: 0.6,
    });
    const brandLogo = brandLogos.get(brand);
    if (brandLogo) {
      const maxWidth = 105;
      const maxHeight = 20;
      const scale = Math.min(maxWidth / brandLogo.width, maxHeight / brandLogo.height);
      const width = brandLogo.width * scale;
      const height = brandLogo.height * scale;
      page.drawImage(brandLogo, {
        x: MARGIN + 9,
        y: y - 20 + (20 - height) / 2,
        width,
        height,
      });
      page.drawText(cleanText(brand), {
        x: MARGIN + 124,
        y: y - 14,
        size: 8,
        font: bold,
        color: NAVY,
      });
    } else {
      page.drawText(cleanText(brand).toUpperCase(), {
        x: MARGIN + 9,
        y: y - 14,
        size: 8,
        font: bold,
        color: NAVY,
      });
    }
    y -= 30;
  };

  addPage();
  page.drawText(cleanText(customerName), {
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
    sectionTitle(category, `${categoryRows.length} designs`);
    const tierGroups = new Map<ProgressiveTier | "All", typeof summaries>();
    for (const row of categoryRows) {
      const tier = row.progressiveTier ?? "All";
      tierGroups.set(tier, [...(tierGroups.get(tier) ?? []), row]);
    }
    const orderedTierGroups = [...tierGroups.entries()].sort(([a], [b]) => {
      if (a === "All" || b === "All") return 0;
      return compareProgressiveTier(a, b);
    });

    for (const [tier, tierRows] of orderedTierGroups) {
      if (tier !== "All") drawTierHeader(tier);
      const brandGroups = new Map<string, typeof summaries>();
      for (const row of tierRows) {
        brandGroups.set(row.brand, [...(brandGroups.get(row.brand) ?? []), row]);
      }

      for (const [brand, brandRows] of [...brandGroups.entries()].sort(
        ([a], [b]) => comparePriceDisplayBrand(a, b)
      )) {
        drawBrandHeader(brand);
        drawTableHeader();
        brandRows.forEach((row, index) => {
          if (y - 18 < 58) {
            addPage(true);
            sectionTitle(category, "continued");
            if (tier !== "All") drawTierHeader(tier);
            drawBrandHeader(brand);
            drawTableHeader();
          }
          if (index % 2 === 1) {
            page.drawRectangle({
              x: MARGIN,
              y: y - 15,
              width: CONTENT_WIDTH,
              height: 17,
              color: CREAM,
            });
          }
          const values: Array<[string, number, number]> = [
            [row.designStyle, MARGIN + 6, 350],
            [money(row.clear, mode), MARGIN + 369, 52],
            [money(row.photochromic, mode), MARGIN + 425, 52],
            [money(row.polarized, mode), MARGIN + 481, 50],
          ];
          values.forEach(([value, x, width], columnIndex) => {
            page.drawText(
              fitText(columnIndex === 0 ? regular : bold, value, width, 7.2),
              {
                x,
                y: y - 10,
                size: 7.2,
                font: columnIndex === 0 ? regular : bold,
                color: columnIndex === 0 ? TEXT : NAVY,
              }
            );
          });
          page.drawLine({
            start: { x: MARGIN, y: y - 15 },
            end: { x: PAGE_WIDTH - MARGIN, y: y - 15 },
            color: RULE,
            thickness: 0.45,
          });
          y -= 17;
        });
      }
    }
  }

  if (priceList.arCoatings.length) {
    sectionTitle(
      "Anti-Reflective Coatings",
      priceList.code === "NL"
        ? "Neurolens AR treatments"
        : "Artisan coatings first; additional options follow"
    );
    const coatings = [...priceList.arCoatings]
      .filter((coating) => !coating.unresolved)
      .sort((a, b) => {
        const aArtisan = /artisan/i.test(a.brandFamily) ? 0 : 1;
        const bArtisan = /artisan/i.test(b.brandFamily) ? 0 : 1;
        return (
          aArtisan - bArtisan ||
          compareText(a.brandFamily, b.brandFamily) ||
          compareText(a.name, b.name)
        );
      });
    for (const coating of coatings) {
      ensureSpace(18);
      page.drawText(fitText(bold, coating.name, 275, 8), {
        x: MARGIN + 6,
        y: y - 10,
        size: 8,
        font: bold,
        color: NAVY,
      });
      page.drawText(fitText(regular, coating.brandFamily, 170, 7.5), {
        x: MARGIN + 292,
        y: y - 10,
        size: 7.5,
        font: regular,
        color: MUTED,
      });
      page.drawText(`$${coating.price.toFixed(2)}`, {
        x: PAGE_WIDTH - MARGIN - 55,
        y: y - 10,
        size: 8,
        font: bold,
        color: NAVY,
      });
      y -= 17;
    }
  }

  for (const section of priceList.addOnSections) {
    if (!section.items.length) continue;
    sectionTitle(section.title);
    for (const item of section.items) {
      ensureSpace(18);
      page.drawText(fitText(regular, item.name, 390, 8), {
        x: MARGIN + 6,
        y: y - 10,
        size: 8,
        font: regular,
        color: TEXT,
      });
      page.drawText(cleanText(item.price), {
        x: PAGE_WIDTH - MARGIN - 110,
        y: y - 10,
        size: 8,
        font: bold,
        color: NAVY,
      });
      y -= 17;
    }
  }

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
        `CONFIDENTIAL - Prepared for ${customerName}`,
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
  });

  document.setTitle(`${priceList.code} Price List - ${customerName}`);
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
  const previewAccountNumber =
    request.nextUrl.searchParams.get("account")?.trim() || undefined;
  const priceMode: PriceMode =
    request.nextUrl.searchParams.get("priceMode") === "uncut"
      ? "uncut"
      : "edged";
  const access = await getAuthorizedPriceListFromHeaders(
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

  const generated = await loadGeneratedPriceListByCode(code);
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
    customerName,
    mode: priceMode,
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
