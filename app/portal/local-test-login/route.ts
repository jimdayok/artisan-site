import { NextRequest, NextResponse } from "next/server";
import {
  isLocalhostDevelopmentRequest,
  LOCAL_PORTAL_TEST_EMAIL_COOKIE,
} from "@/lib/portal/auth";
import { getPortalWorkbookEmails } from "@/lib/portal/workbookAccountData";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const LOCAL_TEST_ADMIN_EMAILS = [
  "jimdayok@me.com",
  "jim.day@artisanlabnetwork.com",
];

function portalRedirect(request: NextRequest) {
  return NextResponse.redirect(new URL("/portal", request.url));
}

function allowedLocalTestEmails() {
  return new Set([
    ...LOCAL_TEST_ADMIN_EMAILS,
    ...getPortalWorkbookEmails(),
  ]);
}

export async function POST(request: NextRequest) {
  const response = portalRedirect(request);

  if (!isLocalhostDevelopmentRequest(request.headers)) return response;

  const formData = await request.formData();
  const selectedEmail = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!allowedLocalTestEmails().has(selectedEmail)) return response;

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
