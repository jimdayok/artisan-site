import { NextResponse, type NextRequest } from "next/server";

export function proxy(_request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");

  return response;
}

export const config = {
  matcher: "/private/:path*",
};
