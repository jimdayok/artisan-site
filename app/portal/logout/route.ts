import { NextRequest } from "next/server";
import {
  isLocalhostDevelopmentRequest,
  LOCAL_PORTAL_TEST_EMAIL_COOKIE,
} from "@/lib/portal/auth";
import { safePortalRedirect } from "@/lib/portal/safeRedirect";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
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
