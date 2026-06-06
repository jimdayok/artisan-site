import { NextRequest, NextResponse } from "next/server";

export function safePortalRedirect(
  request: NextRequest,
  destination: string
) {
  const target = new URL(destination, request.url);
  const currentPath = request.nextUrl.pathname;

  if (
    target.pathname === currentPath &&
    target.search === request.nextUrl.search
  ) {
    console.error("[PORTAL AUTH] Prevented redirect loop", {
      currentPath,
      currentSearch: request.nextUrl.search,
      destination: `${target.pathname}${target.search}`,
    });
    return NextResponse.next();
  }

  console.log("[PORTAL AUTH]", {
    currentPath,
    redirectTarget: `${target.pathname}${target.search}`,
    authorizationDecision: "redirect",
  });
  return NextResponse.redirect(target);
}
