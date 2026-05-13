import { NextRequest } from "next/server";
import {
  CLOUDFLARE_ACCESS_EMAIL_HEADER,
  getAuthenticatedEmailFromHeaders,
  getCloudflareAccessEmailFromHeaders,
  isLocalhostDevelopmentRequest,
} from "@/lib/portal/auth";

export const dynamic = "force-dynamic";
export const runtime = "edge";

const DEBUG_ALLOWED_EMAILS = new Set([
  "jimdayok@me.com",
  "jim.day@artisanlabnetwork.com",
]);

const NON_SENSITIVE_HEADER_NAMES = new Set([
  CLOUDFLARE_ACCESS_EMAIL_HEADER,
  "accept",
  "accept-encoding",
  "accept-language",
  "cf-ray",
  "cf-visitor",
  "host",
  "referer",
  "user-agent",
  "x-forwarded-proto",
]);

function jsonResponse(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
    },
  });
}

export async function GET(request: NextRequest) {
  const isDevelopment = process.env.NODE_ENV === "development";
  const isLocalhostDevelopment = isLocalhostDevelopmentRequest(request.headers);
  const detectedEmail = getAuthenticatedEmailFromHeaders(request.headers);
  const cloudflareAccessEmail =
    getCloudflareAccessEmailFromHeaders(request.headers);
  const normalizedEmail = detectedEmail.toLowerCase();
  const isAllowedEmail = DEBUG_ALLOWED_EMAILS.has(normalizedEmail);

  if (!isLocalhostDevelopment && !isAllowedEmail) {
    return jsonResponse({ error: "Not found" }, 404);
  }

  const headerNames = Array.from(request.headers.keys())
    .map((headerName) => headerName.toLowerCase())
    .filter((headerName) => NON_SENSITIVE_HEADER_NAMES.has(headerName))
    .sort();

  return jsonResponse({
    detectedEmail,
    isDevelopment,
    isLocalhostDevelopment,
    hasCloudflareAccessEmailHeader: Boolean(cloudflareAccessEmail),
    nonSensitiveHeaderNames: [...new Set(headerNames)],
  });
}
