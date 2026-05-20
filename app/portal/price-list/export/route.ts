import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedPriceListFromHeaders } from "@/lib/portal/priceListAccess";
import { customerHasPortalSection } from "@/lib/portal/customers";
import { itemMatchesARGroup } from "../../../../src/data/arCompatibility";
import {
  calculatedPrice,
  priceTypeLabel,
  isPackageEligible,
  lensGroupForItem,
  money,
  priceItems,
  searchableText,
  type EdgeMode,
  type LensGroup,
  type PriceBrand,
} from "../../../../src/data/privatePriceList";
import { msrpForItem } from "../../../../src/data/msrpPriceList";
import { checkRateLimit } from "@/lib/portal/rateLimit";

type ExportMode = "Wholesale" | "MSRP" | "Combined";
type ExportScope = "full" | "filtered" | "selected";

function esc(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function line(text: string, x: number, y: number, size = 8, bold = false) {
  return `BT /${bold ? "F2" : "F1"} ${size} Tf ${x} ${y} Td (${esc(text)}) Tj ET\n`;
}

function rect(x: number, y: number, width: number, height: number, color: string) {
  return `${color} ${x} ${y} ${width} ${height} re f\n`;
}

function pageHeader(title: string, mode: ExportMode, generated: string, filters: string) {
  return [
    "0.94 0.91 0.85 rg 0 0 792 612 re f\n",
    rect(0, 548, 792, 64, "0.07 0.13 0.2 rg"),
    rect(34, 566, 42, 30, "0.78 0.66 0.42 rg"),
    line("ALN", 42, 577, 11, true),
    line("Artisan Lab Network 2026 Price List", 90, 586, 15, true),
    line("Confidential Pricing Guide. Do Not Distribute.", 90, 568, 9),
    line(`Generated: ${generated}  |  Pricing mode: ${mode}`, 610, 588, 7),
    line(filters, 34, 534, 6.5),
  ].join("");
}

function makePdf(pageLines: string[], title: string, mode: ExportMode, generated: string, filters: string) {
  const width = 792;
  const height = 612;
  const pageContents = pageLines.map((page, index) => [
    pageHeader(title, mode, generated, filters),
    page,
    line(`CONFIDENTIAL  |  Page ${index + 1} of ${pageLines.length}`, 620, 28, 7, true),
  ].join(""));
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids ${pageContents.map((_, index) => `${3 + index} 0 R`).join(" ")} /Count ${pageContents.length} >>`,
    ...pageContents.map((_, index) => `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 ${3 + pageContents.length} 0 R /F2 ${4 + pageContents.length} 0 R >> >> /Contents ${5 + pageContents.length + index} 0 R >>`),
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    ...pageContents.map((content) => `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}endstream`),
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf);
}

export function GET(request: NextRequest) {
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown";
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

  const access = getAuthorizedPriceListFromHeaders(request.headers, "G6");

  if (access.status === "unauthenticated") {
    return new NextResponse("Unable to verify your secure login.", {
      status: 401,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  if (
    access.status !== "authorized" ||
    !customerHasPortalSection(access.customer, "exports")
  ) {
    return new NextResponse("You do not have access to this price list.", {
      status: 403,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  const params = request.nextUrl.searchParams;
  const mode = (params.get("mode") || "Combined") as ExportMode;
  const scope = (params.get("scope") || "filtered") as ExportScope;
  const query = (params.get("query") || "").trim().toLowerCase();
  const brand = (params.get("brand") || "All") as PriceBrand | "All";
  const lensGroup = (params.get("lensGroup") || "All") as LensGroup | "All";
  const materialId = params.get("materialId") || "material-polycarb";
  const edgeMode = (params.get("edgeMode") || "Edged") as EdgeMode;
  const excludeOutsourced = params.get("excludeOutsourced") === "true";
  const packageOnly = params.get("packageOnly") === "true";
  const coatingId = params.get("coatingId") || "All";
  const selectedIds = new Set((params.get("selected") || "").split(",").filter(Boolean));
  const generated = new Date().toLocaleDateString("en-US");

  const exportableItems = priceItems.filter((item) => item.category !== "Reference Key");
  const filtered =
    scope === "full"
      ? exportableItems
      : scope === "selected"
        ? exportableItems.filter((item) => selectedIds.has(item.id))
        : exportableItems.filter((item) => {
      if (brand !== "All" && item.brand !== brand) return false;
      if (lensGroup !== "All" && lensGroupForItem(item) !== lensGroup) return false;
      if (excludeOutsourced && item.outsourced) return false;
      if (packageOnly && !isPackageEligible(item)) return false;
      if (!itemMatchesARGroup(item, coatingId)) return false;
      if (query && !searchableText(item).includes(query)) return false;
      return true;
    });

  const title = scope === "full" ? `Full ${mode} Price List` : scope === "selected" ? `Selected ${mode} Price List` : `${mode} Filtered Price List`;
  const activeFilters = scope === "full"
    ? "Selected filters: none - full price list"
    : [`Selected filters: Brand ${brand}`, `Category ${lensGroup}`, `Material ${materialId.replace("material-", "")}`, `Edge ${edgeMode}`, query ? `Search "${query}"` : "", excludeOutsourced ? "Exclude outsourced" : "", packageOnly ? "Package available" : "", coatingId !== "All" ? `AR ${coatingId}` : ""].filter(Boolean).join("  |  ");

  const columns = [
    { x: 34, productX: 34, metaX: 152, priceX: 228 },
    { x: 286, productX: 286, metaX: 404, priceX: 480 },
    { x: 538, productX: 538, metaX: 656, priceX: 732 },
  ];
  const rowsPerColumn = 39;
  const rowsPerPage = rowsPerColumn * columns.length;
  const pages: string[] = [];
  const pageCount = Math.max(1, Math.ceil(filtered.length / rowsPerPage));

  for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
    const body: string[] = [];
    columns.forEach((column) => {
      body.push(line("Product", column.productX, 512, 7, true));
      body.push(line("Brand / Type", column.metaX, 512, 7, true));
      body.push(line(mode === "MSRP" ? "MSRP" : mode === "Wholesale" ? "Wholesale" : "W / MSRP", column.priceX, 512, 7, true));
    });
    const pageItems = filtered.slice(pageIndex * rowsPerPage, (pageIndex + 1) * rowsPerPage);
    if (!pageItems.length) {
      body.push(line("No products selected for this export.", 34, 486, 9, true));
    }
    pageItems.forEach((item, index) => {
    const column = columns[Math.floor(index / rowsPerColumn)];
    const row = index % rowsPerColumn;
    const y = 498 - row * 11.5;
    const wholesale = calculatedPrice(item, materialId, edgeMode);
    const msrp = msrpForItem(item, materialId);
    const price = mode === "Wholesale" ? money(wholesale) : mode === "MSRP" ? (msrp ? money(msrp) : "Unavailable") : `${money(wholesale)} / ${msrp ? money(msrp) : "Unavailable"}`;
    const fill = index % 2 === 0 ? "1 1 1 rg" : "0.98 0.96 0.92 rg";
    body.push(`${fill} ${column.x - 4} ${y - 4} 226 10 re f\n`);
    body.push(line(item.name.slice(0, 24), column.productX, y, 5.8));
    body.push(line(`${item.brand.slice(0, 11)} / ${priceTypeLabel(item.type)}`.slice(0, 18), column.metaX, y, 5.8));
    body.push(line(price.slice(0, 18), column.priceX, y, 5.8, true));
    });
    body.push(line(`Showing rows ${pageIndex * rowsPerPage + 1}-${Math.min(filtered.length, (pageIndex + 1) * rowsPerPage)} of ${filtered.length}. ${scope === "full" ? "Full price list export." : scope === "selected" ? "Selected products export." : "Current filtered results export."}`, 34, 28, 7));
    pages.push(body.join(""));
  }

  const pdf = makePdf(pages, title, mode, generated, activeFilters);
  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="artisan-${mode.toLowerCase()}-pricing.pdf"`,
      "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
    },
  });
}
