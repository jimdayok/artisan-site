import "server-only";

import { isPortalAdminEmailAddress } from "@/lib/portal/adminAccess";
import { getPortalAuthenticatedEmailFromHeaders } from "@/lib/portal/auth";

export function isPortalAdminEmail(email: string) {
  return isPortalAdminEmailAddress(email);
}

export function getPortalAdminEmailFromHeaders(headers: Headers) {
  const authenticatedEmail = getPortalAuthenticatedEmailFromHeaders(headers);

  if (!authenticatedEmail || !isPortalAdminEmail(authenticatedEmail)) return "";

  return authenticatedEmail;
}
