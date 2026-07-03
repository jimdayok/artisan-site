import { NextRequest, NextResponse } from "next/server";

const DEBUG_PORTAL_AUTH = ["1", "true", "yes", "on"].includes(
  String(process.env.DEBUG_PORTAL_AUTH ?? "").toLowerCase()
);

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
    if (DEBUG_PORTAL_AUTH) {
      console.error("[PORTAL AUTH] Prevented redirect loop", {
        currentPath,
        currentSearch: request.nextUrl.search,
        destination: `${target.pathname}${target.search}`,
      });
    }
    return NextResponse.next();
  }

  if (DEBUG_PORTAL_AUTH) {
    console.log("[PORTAL AUTH]", {
      currentPath,
      redirectTarget: `${target.pathname}${target.search}`,
      authorizationDecision: "redirect",
    });
  }
  return NextResponse.redirect(target);
}
