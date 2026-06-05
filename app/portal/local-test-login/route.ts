import { NextRequest, NextResponse } from "next/server";
import {
  isLocalhostDevelopmentRequest,
  LOCAL_PORTAL_TEST_EMAIL_COOKIE,
} from "@/lib/portal/auth";
import {
  loadPortalUserAccess,
  normalizeEmail,
} from "@/lib/portal/userDataAccess";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function portalRedirect(request: NextRequest) {
  return NextResponse.redirect(new URL("/portal", request.url));
}

async function allowedLocalTestEmails() {
  const access = await loadPortalUserAccess();
  return new Set([
    ...(process.env.PORTAL_ADMIN_EMAILS ?? "")
      .split(",")
      .map(normalizeEmail)
      .filter(Boolean),
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
