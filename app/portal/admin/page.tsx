import { headers } from "next/headers";
import { getPortalAuthenticatedEmailFromHeaders } from "@/lib/portal/auth";
import AdminLandingDashboard from "@/app/portal/AdminLandingDashboard";
import {
  getDefaultComparisonMode,
  parseComparisonMode,
} from "@/lib/portal/portalComparisons";
import {
  canAccessPortalAdmin,
  getPortalStaffRole,
} from "@/lib/portal/portalRoles";
import { AdminAccessRequired } from "./AdminShell";

export const dynamic = "force-dynamic";

export default async function PortalAdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
    q?: string;
    division?: string;
    lab?: string;
    rep?: string;
    priceList?: string;
    hasUser?: string;
    activity?: string;
    trend?: string;
    opportunity?: string;
    severity?: string;
    minimumBaselineJpd?: string;
    minimumJpdLost?: string;
    email?: string;
  }>;
}) {
  const authenticatedEmail = getPortalAuthenticatedEmailFromHeaders(
    await headers()
  );
  const role = getPortalStaffRole(authenticatedEmail);

  if (!authenticatedEmail || !canAccessPortalAdmin(role)) {
    return <AdminAccessRequired />;
  }

  const query = await searchParams;
  const mode =
    parseComparisonMode(query.view) ?? getDefaultComparisonMode();

  return (
    <AdminLandingDashboard
      authenticatedEmail={authenticatedEmail}
      role={role}
      mode={mode}
      query={query}
    />
  );
}
