import "server-only";

import { getPortalAuthenticatedEmailFromHeaders } from "@/lib/portal/auth";
import { isPortalAdmin } from "@/lib/portal/userDataAccess";

export function isPortalAdminEmail(email: string) {
  return isPortalAdmin(email);
}

export function getPortalAdminEmailFromHeaders(headers: Headers) {
  const authenticatedEmail = getPortalAuthenticatedEmailFromHeaders(headers);

  if (!authenticatedEmail || !isPortalAdminEmail(authenticatedEmail)) return "";

  return authenticatedEmail;
}
