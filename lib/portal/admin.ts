import "server-only";

import { getPortalAuthenticatedEmailFromHeaders } from "@/lib/portal/auth";

export const PORTAL_ADMIN_EMAILS = new Set([
  "jimdayok@.com",
  "jimdayok@me.com",
  "jim.day@artisanlabnetwork.com",
  "rick@pacificartisanlabs.com",
  "brandon.butler@artisanlabnetwork.com",
  "rahlson@artisanlabnetwork.com",
  "switmer@artisanlabnetwork.com",
]);

export function isPortalAdminEmail(email: string) {
  return PORTAL_ADMIN_EMAILS.has(email.trim().toLowerCase());
}

export function getPortalAdminEmailFromHeaders(headers: Headers) {
  const authenticatedEmail = getPortalAuthenticatedEmailFromHeaders(headers);

  if (!authenticatedEmail || !isPortalAdminEmail(authenticatedEmail)) return "";

  return authenticatedEmail;
}
