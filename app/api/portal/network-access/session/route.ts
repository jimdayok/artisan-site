import { NextRequest, NextResponse } from "next/server";
import {
  createTrustedNetworkSession,
  getTrustedNetworkClientIp,
  isTrustedNetworkRequest,
  sanitizeTrustedNetworkReturnTo,
  TRUSTED_NETWORK_LOGIN_PATH,
  TRUSTED_NETWORK_SESSION_COOKIE,
  TRUSTED_NETWORK_SESSION_TTL_SECONDS,
  trustedNetworkConfigurationIssues,
  verifyTrustedNetworkPassword,
} from "@/lib/portal/trustedNetworkAccess";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function noStoreRedirect(request: NextRequest, destination: string) {
  const response = NextResponse.redirect(new URL(destination, request.url), 303);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

function sameOriginFormPost(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    return new URL(origin).origin === request.nextUrl.origin;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!isTrustedNetworkRequest(request.headers)) {
    return new NextResponse("Not found", { status: 404 });
  }
  if (!sameOriginFormPost(request)) {
    return new NextResponse("Invalid request origin", { status: 403 });
  }
  if (trustedNetworkConfigurationIssues().length) {
    return new NextResponse("Trusted-network access is not configured", {
      status: 503,
    });
  }

  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");
  const returnTo = sanitizeTrustedNetworkReturnTo(formData.get("returnTo"));
  if (!verifyTrustedNetworkPassword(password)) {
    const failedUrl = new URL(TRUSTED_NETWORK_LOGIN_PATH, request.url);
    failedUrl.searchParams.set("error", "incorrect-password");
    failedUrl.searchParams.set("returnTo", returnTo);
    console.warn("[PORTAL AUTH] Trusted-network master password rejected", {
      clientIp: getTrustedNetworkClientIp(request.headers),
      timestamp: new Date().toISOString(),
    });
    return noStoreRedirect(request, `${failedUrl.pathname}${failedUrl.search}`);
  }

  const clientIp = getTrustedNetworkClientIp(request.headers);
  const session = createTrustedNetworkSession(clientIp);
  if (!session) {
    return new NextResponse("Unable to create trusted-network session", {
      status: 503,
    });
  }

  const response = noStoreRedirect(request, returnTo);
  response.cookies.set(TRUSTED_NETWORK_SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: TRUSTED_NETWORK_SESSION_TTL_SECONDS,
    priority: "high",
  });
  return response;
}
