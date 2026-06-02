import "server-only";

import { getPortalAuthenticatedEmailFromHeaders } from "@/lib/portal/auth";

export const PORTAL_ADMIN_EMAILS = new Set([
  "brandon.butler@artisanlabnetwork.com",
  "jim.day@artisanlabnetwork.com",
  "jimdayok@me.com",
  "rahlson@artisanlabnetwork.com",
  "rick@pacificartisanlabs.com",
  "rtinson@pacificartisanlabs.com",
]);

export function isPortalAdminEmail(email: string) {
  return PORTAL_ADMIN_EMAILS.has(email.trim().toLowerCase());
}

export function getPortalAdminEmailFromHeaders(headers: Headers) {
  const authenticatedEmail = getPortalAuthenticatedEmailFromHeaders(headers);

  if (!authenticatedEmail || !isPortalAdminEmail(authenticatedEmail)) return "";

  return authenticatedEmail;
}
