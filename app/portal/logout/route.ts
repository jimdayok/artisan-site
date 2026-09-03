import { NextRequest } from "next/server";
import {
  isLocalhostDevelopmentRequest,
  LOCAL_PORTAL_TEST_EMAIL_COOKIE,
} from "@/lib/portal/auth";
import { safePortalRedirect } from "@/lib/portal/safeRedirect";
import {
  TRUSTED_NETWORK_LOGIN_PATH,
  TRUSTED_NETWORK_SESSION_COOKIE,
} from "@/lib/portal/trustedNetworkAccess";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  if (request.cookies.has(TRUSTED_NETWORK_SESSION_COOKIE)) {
    const response = safePortalRedirect(request, TRUSTED_NETWORK_LOGIN_PATH);
    response.cookies.set(TRUSTED_NETWORK_SESSION_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  if (isLocalhostDevelopmentRequest(request.headers)) {
    const response = safePortalRedirect(request, "/portal");
    response.cookies.set(LOCAL_PORTAL_TEST_EMAIL_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  return safePortalRedirect(request, "/cdn-cgi/access/logout?returnTo=/");
}
