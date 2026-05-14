import { NextRequest } from "next/server";
import { getAuthenticatedEmailFromHeadersWithAccessJwt } from "@/lib/portal/auth";
import { getCustomerByEmail } from "@/lib/portal/customers";
import { getPriceListByCode } from "@/lib/portal/priceLists";

export const dynamic = "force-dynamic";
export const runtime = "edge";

type CloudflarePortalEnv = {
  PRACTICE_FILES?: unknown;
};

function isR2Bucket(bucket: unknown): bucket is R2Bucket {
  return Boolean(bucket && typeof (bucket as R2Bucket).get === "function");
}

function getPracticeFilesBucket() {
  const globalBucket = (globalThis as unknown as CloudflarePortalEnv).PRACTICE_FILES;

  if (isR2Bucket(globalBucket)) return globalBucket;

  if (typeof process !== "undefined") {
    const processBucket = (process.env as unknown as CloudflarePortalEnv)
      .PRACTICE_FILES;

    if (isR2Bucket(processBucket)) return processBucket;
  }

  return undefined;
}

function textResponse(message: string, status: number) {
  return new Response(message, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}

export async function GET(request: NextRequest) {
  const authenticatedEmail =
    await getAuthenticatedEmailFromHeadersWithAccessJwt(request.headers);
  const requestedCode =
    request.nextUrl.searchParams.get("code")?.trim().toUpperCase() ?? "";

  if (!authenticatedEmail) {
    return textResponse("Unable to verify your login.", 401);
  }

  const customer = getCustomerByEmail(authenticatedEmail);

  if (!customer) {
    return textResponse("You are not allowed to access this portal.", 403);
  }

  if (!requestedCode) {
    return textResponse("Missing price list code.", 400);
  }

  const priceList = getPriceListByCode(requestedCode);

  if (!priceList) {
    return textResponse("Price sheet not found.", 404);
  }

  if (!priceList.r2Key) {
    return textResponse("PDF download is not available for this price sheet.", 404);
  }

  const assignedPriceListCodes = customer.priceLists.map((code) =>
    code.trim().toUpperCase()
  );

  if (!assignedPriceListCodes.includes(priceList.code)) {
    return textResponse("You are not allowed to access this file.", 403);
  }

  const bucket = getPracticeFilesBucket();

  if (!bucket) {
    return textResponse("File storage is not configured.", 500);
  }

  const file = await bucket.get(priceList.r2Key);

  if (!file) {
    return textResponse("File not found.", 404);
  }

  const responseHeaders = new Headers();
  file.writeHttpMetadata(responseHeaders);
  responseHeaders.set("Content-Type", responseHeaders.get("Content-Type") ?? "application/pdf");
  responseHeaders.set(
    "Content-Disposition",
    `attachment; filename="${priceList.fileName}"`
  );
  responseHeaders.set("Cache-Control", "private, no-store");

  return new Response(file.body, {
    status: 200,
    headers: responseHeaders,
  });
}
