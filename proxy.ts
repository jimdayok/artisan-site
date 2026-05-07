import { NextResponse, type NextRequest } from "next/server";
import { privatePriceListCookieName, privatePriceListPassword, privatePriceListToken } from "./src/lib/privatePriceAuth";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");

  const configuredPassword = privatePriceListPassword();
  const token = request.cookies.get(privatePriceListCookieName)?.value;

  if (token === privatePriceListToken(configuredPassword) || pathname === "/private/price-list/access") {
    return response;
  }

  // This page is hidden and discouraged from indexing, but real privacy requires authentication. This route should be moved behind the future customer portal login.
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
  matcher: "/private/:path*",
};
