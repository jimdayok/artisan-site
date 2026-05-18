import "server-only";

import { getVerifiedCloudflareAccessEmailFromHeaders } from "@/lib/portal/auth";

export const PORTAL_ADMIN_EMAILS = new Set([
  "jimdayok@me.com",
  "jim.day@artisanlabnetwork.com",
]);

export function isPortalAdminEmail(email: string) {
  return PORTAL_ADMIN_EMAILS.has(email.trim().toLowerCase());
}

export function getPortalAdminEmailFromHeaders(headers: Headers) {
  const authenticatedEmail = getVerifiedCloudflareAccessEmailFromHeaders(headers);

  if (!authenticatedEmail || !isPortalAdminEmail(authenticatedEmail)) return "";

  return authenticatedEmail;
}
