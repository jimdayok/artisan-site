import { NextResponse, type NextRequest } from "next/server";
import { verifyCloudflareAccessJwt } from "@/lib/portal/accessJwt";
import { isPortalAdminEmailAddress } from "@/lib/portal/adminAccess";

const LOCALHOST_NAMES = new Set(["localhost", "127.0.0.1", "::1"]);
const LOCAL_PORTAL_TEST_EMAIL_COOKIE = "portal_dev_email";
const ACCESS_EMAIL_HEADER = "cf-access-authenticated-user-email";
const ACCESS_JWT_HEADER = "cf-access-jwt-assertion";
const ACCESS_JWT_COOKIE = "CF_Authorization";

const securityHeaders: Array<[string, string]> = [
  ["X-Frame-Options", "DENY"],
  ["X-Content-Type-Options", "nosniff"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  ["Permissions-Policy", "camera=(), microphone=(), geolocation=()"],
  [
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; font-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  ],
];

function normalizeHostname(host: string) {
  const firstHost = host.trim().split(",")[0]?.toLowerCase() ?? "";
  if (firstHost.startsWith("[::1]")) return "::1";
  if (firstHost === "::1") return "::1";
  return firstHost.split(":")[0] ?? "";
}

function isLocalhostRequest(request: NextRequest) {
  const hostnames = [
    request.headers.get("host") ?? "",
    request.headers.get("x-forwarded-host") ?? "",
  ]
    .map(normalizeHostname)
    .filter(Boolean);
  return hostnames.some((hostname) => LOCALHOST_NAMES.has(hostname));
}

function isLocalhostDevelopmentRequest(request: NextRequest) {
  return process.env.NODE_ENV === "development" && isLocalhostRequest(request);
}

function deny(request: NextRequest, status: number, message: string) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return new NextResponse(message, { status });
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete("x-portal-auth-email");
  requestHeaders.set("x-portal-auth-error", message);
  requestHeaders.set("x-portal-auth-status", String(status));

  console.error("[PORTAL AUTH]", {
    path: request.nextUrl.pathname,
    authenticatedEmail: "",
    cloudflareEmail:
      request.headers.get(ACCESS_EMAIL_HEADER)?.trim().toLowerCase() ?? "",
    authorized: false,
    authorizationDecision: "render-auth-error",
    redirectTarget: null,
    status,
    message,
  });

  return NextResponse.next({ request: { headers: requestHeaders } });
}

async function verifiedPortalEmail(request: NextRequest) {
  const jwtHeader = request.headers.get(ACCESS_JWT_HEADER)?.trim() ?? "";
  const jwtCookie = request.cookies.get(ACCESS_JWT_COOKIE)?.value?.trim() ?? "";
  const token = jwtHeader || jwtCookie;
  if (!token) return "";

  const verified = await verifyCloudflareAccessJwt(token);
  if (!verified) return "";
  return verified.email;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const localhostDev = isLocalhostDevelopmentRequest(request);
  const isPortalProtected =
    pathname.startsWith("/portal") || pathname.startsWith("/api/portal");

  const response = NextResponse.next();
  for (const [key, value] of securityHeaders) response.headers.set(key, value);

  if (!isPortalProtected) return response;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete("x-portal-auth-email");

  if (localhostDev) {
    const localEmail = request.cookies.get(LOCAL_PORTAL_TEST_EMAIL_COOKIE)?.value?.trim().toLowerCase() ?? "";
    if (localEmail) requestHeaders.set("x-portal-auth-email", localEmail);

    if (
      pathname.startsWith("/portal/admin") &&
      localEmail &&
      !isPortalAdminEmailAddress(localEmail)
    ) {
      return deny(request, 403, "Admin access required.");
    }

    return NextResponse.next({ request: { headers: requestHeaders }, headers: response.headers });
  }

  const emailHeader = request.headers.get(ACCESS_EMAIL_HEADER)?.trim().toLowerCase() ?? "";
  const verifiedEmail = await verifiedPortalEmail(request);

  if (!verifiedEmail || !emailHeader || verifiedEmail !== emailHeader) {
    return deny(request, 401, "Unable to verify secure login.");
  }

  requestHeaders.set("x-portal-auth-email", verifiedEmail);

  if (
    pathname.startsWith("/portal/admin") &&
    !isPortalAdminEmailAddress(verifiedEmail)
  ) {
    return deny(request, 403, "Admin access required.");
  }

  console.log("[PORTAL AUTH]", {
    path: pathname,
    authenticatedEmail: verifiedEmail,
    cloudflareEmail: emailHeader,
    authorized: true,
    authorizationDecision: "allow",
    redirectTarget: null,
  });

  return NextResponse.next({
    request: { headers: requestHeaders },
    headers: response.headers,
  });
}

export const config = {
  matcher: ["/portal/:path*", "/api/portal/:path*", "/private/price-list/:path*"],
};
