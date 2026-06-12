import { NextRequest } from "next/server";
import {
  getConfiguredDevelopmentAdminEmails,
  isLocalhostDevelopmentRequest,
  LOCAL_PORTAL_TEST_EMAIL_COOKIE,
} from "@/lib/portal/auth";
import {
  loadPortalUserAccess,
  normalizeEmail,
} from "@/lib/portal/userDataAccess";
import { safePortalRedirect } from "@/lib/portal/safeRedirect";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function portalRedirect(request: NextRequest) {
  return safePortalRedirect(request, "/portal");
}

async function allowedLocalTestEmails() {
  const access = await loadPortalUserAccess();
  return new Set([
    ...getConfiguredDevelopmentAdminEmails().map(normalizeEmail),
    ...access.usersByEmail.keys(),
  ]);
}

export async function POST(request: NextRequest) {
  const response = portalRedirect(request);

  if (!isLocalhostDevelopmentRequest(request.headers)) return response;

  const formData = await request.formData();
  const selectedEmail = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!(await allowedLocalTestEmails()).has(selectedEmail)) return response;

  response.cookies.set(LOCAL_PORTAL_TEST_EMAIL_COOKIE, selectedEmail, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}

export async function GET(request: NextRequest) {
  const response = portalRedirect(request);

  if (!isLocalhostDevelopmentRequest(request.headers)) return response;

  response.cookies.set(LOCAL_PORTAL_TEST_EMAIL_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
