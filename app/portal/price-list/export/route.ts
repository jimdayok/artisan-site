import { NextRequest, NextResponse } from "next/server";
import { buildPriceListPdf } from "@/lib/portal/priceListPdf";
import { getAuthorizedRuntimePriceListFromHeaders } from "@/lib/portal/priceListRuntimeAccess";
import { canonicalPriceListCode } from "@/lib/portal/priceLists";
import { checkRateLimit } from "@/lib/portal/rateLimit";
import { customerFacingPriceList } from "@/lib/pricing/customerPriceList";
import { isVisiblePriceListCode } from "@/lib/pricing/priceListCodes";
import { loadRuntimePackagedPriceListByCode } from "@/lib/pricing/loadRuntimePackagedPriceList";

export const dynamic = "force-dynamic";

type PriceMode = "edged" | "uncut";

function cleanText(value: unknown) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
