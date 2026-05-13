import { NextResponse, type NextRequest } from "next/server";
import { privatePriceListCookieName, privatePriceListPassword, privatePriceListToken } from "./src/lib/privatePriceAuth";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");

  const isAssetRequest =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/cdn-cgi") ||
    pathname.includes(".");
  const isPortalRoute =
    pathname === "/" ||
    pathname === "/portal" ||
    pathname.startsWith("/api/portal");

  if (!isAssetRequest && !isPortalRoute) {
    const portalUrl = request.nextUrl.clone();
    portalUrl.pathname = "/";
    portalUrl.search = "";

    const redirect = NextResponse.redirect(portalUrl);
    redirect.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
    return redirect;
  }

  const configuredPassword = privatePriceListPassword();
  const token = request.cookies.get(privatePriceListCookieName)?.value;

  if (
    token === privatePriceListToken(configuredPassword) ||
    pathname === "/private/price-list/access" ||
    pathname === "/private/price-list/policies"
  ) {
    return response;
  }

  // This page is hidden from indexing and protected by password, but true long term privacy should be handled through the future customer portal authentication system.
  if (pathname.startsWith("/private/price-list")) {
    const accessUrl = request.nextUrl.clone();
    accessUrl.pathname = "/private/price-list/access";
    accessUrl.search = "";
    accessUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);

    const redirect = NextResponse.redirect(accessUrl);
    redirect.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
    return redirect;
  }

  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image).*)",
};
