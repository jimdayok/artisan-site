import { NextResponse } from "next/server";

export function proxy() {
  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");

  return response;
}

export const config = {
  matcher: "/private/:path*",
};
