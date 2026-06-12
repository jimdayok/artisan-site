import { existsSync } from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import {
  CLOUDFLARE_ACCESS_EMAIL_HEADER,
  getCloudflareAccessEmailFromHeaders,
  getLocalDevelopmentPortalEmailFromHeaders,
  getPortalAuthenticatedEmailFromHeaders,
  hasCloudflareAccessJwtCookie,
  getRequestHostnames,
  isPortalHostRequest,
  isLocalhostDevelopmentRequest,
} from "@/lib/portal/auth";
import { portalDashboardV1Bundle } from "@/lib/portal/dashboardV1Bundle";
import { getPortalExportDiagnostics } from "@/lib/portal/portalExportData";
import { getPortalWorkbookDiagnostics } from "@/lib/portal/userDataAccess";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PORTAL_EXPORT_PATH = "private-site/portal/portal_export.json";
const DASHBOARD_BUNDLE_PATH = "lib/portal/generated/dashboardV1Bundle.json";

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
  const detectedEmail = getPortalAuthenticatedEmailFromHeaders(request.headers);
  const cloudflareAccessEmail =
    getCloudflareAccessEmailFromHeaders(request.headers);
  const localDevelopmentEmail =
    getLocalDevelopmentPortalEmailFromHeaders(request.headers);
  const cloudflareAccessJwtCookie = hasCloudflareAccessJwtCookie(request.headers);
  if (!isLocalhostDevelopment) {
    return jsonResponse({ error: "Not found" }, 404);
  }

  const headerNames = Array.from(request.headers.keys())
    .map((headerName) => headerName.toLowerCase())
    .filter((headerName) => NON_SENSITIVE_HEADER_NAMES.has(headerName))
    .sort();
  const performanceExport = getPortalExportDiagnostics();
  const manifest = portalDashboardV1Bundle.manifest;
  const dashboardBundleExists = existsSync(
    path.join(
      /* turbopackIgnore: true */ process.cwd(),
      DASHBOARD_BUNDLE_PATH
    )
  );

  return jsonResponse({
    detectedEmail,
    isDevelopment,
    isLocalhostDevelopment,
    isPortalHost: isPortalHostRequest(request.headers),
    hasDetectedEmail: Boolean(detectedEmail),
    hasCloudflareAccessEmailHeader: Boolean(cloudflareAccessEmail),
    hasLocalDevelopmentEmailCookie: Boolean(localDevelopmentEmail),
    hasCloudflareAccessJwtCookie: cloudflareAccessJwtCookie,
    usedHeaderOrLocalDevelopmentCookie: Boolean(detectedEmail),
    detectedHostnames: getRequestHostnames(request.headers),
    nonSensitiveHeaderNames: [...new Set(headerNames)],
    portalData: {
      portal_export_exists: performanceExport.exists,
      dashboard_bundle_exists: dashboardBundleExists,
      source_account_file: manifest?.source_account_file ?? "",
      source_user_file: manifest?.source_user_file ?? "",
      data_refresh_date: manifest?.data_refresh_date ?? "",
      generated_at: manifest?.generated_at ?? "",
      row_count_input_accounts: manifest?.row_count_input_accounts ?? 0,
      row_count_output_accounts: manifest?.row_count_output_accounts ?? 0,
      row_count_input_users: manifest?.row_count_input_users ?? 0,
      users_mapped_to_accounts: manifest?.users_mapped_to_accounts ?? 0,
      accounts_without_users: manifest?.accounts_without_users ?? 0,
      users_with_invalid_account_ids:
        manifest?.users_with_invalid_account_ids ?? 0,
      expectedPaths: {
        portalExport: PORTAL_EXPORT_PATH,
        dashboardBundle: DASHBOARD_BUNDLE_PATH,
      },
      performanceExport,
      userAccessWorkbook: getPortalWorkbookDiagnostics(),
    },
  });
}
