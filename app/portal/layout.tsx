import { headers } from "next/headers";
import AdminUtilityNav from "@/app/portal/AdminUtilityNav";
import { getPortalAuthenticatedEmailFromHeaders } from "@/lib/portal/auth";
import { recordPortalAccess } from "@/lib/portal/accessLog";
import {
  canAccessPortalAdmin,
  getPortalStaffRole,
} from "@/lib/portal/portalRoles";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestHeaders = await headers();
  const authenticatedEmail = getPortalAuthenticatedEmailFromHeaders(requestHeaders);
  const staffRole = getPortalStaffRole(authenticatedEmail);
  const hasStaffAccess =
    Boolean(authenticatedEmail) && canAccessPortalAdmin(staffRole);
  if (authenticatedEmail && process.env.NODE_ENV !== "development") {
    await recordPortalAccess({
      timestamp: new Date().toISOString(),
      email: authenticatedEmail,
      ipAddress:
        requestHeaders.get("cf-connecting-ip") ||
        requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        "unknown",
      path: requestHeaders.get("x-portal-request-path") || "/portal",
      method: requestHeaders.get("x-portal-request-method") || "GET",
      userAgent: (requestHeaders.get("user-agent") || "unknown").slice(0, 500),
    });
  }

  return (
    <>
      {hasStaffAccess ? (
        <AdminUtilityNav roleKind={staffRole.kind} />
      ) : null}
      {children}
    </>
  );
}
