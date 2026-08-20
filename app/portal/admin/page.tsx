import { headers } from "next/headers";
import { getPortalAuthenticatedEmailFromHeaders } from "@/lib/portal/auth";
import AdminLandingDashboard from "@/app/portal/AdminLandingDashboard";
import EmployeeDashboard from "@/app/portal/EmployeeDashboard";
import {
  buildEmployeeDashboard,
  employeeRepOptions,
} from "@/lib/portal/employeeDashboard";
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
    repView?: string;
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
  const employeeDashboard =
    role.kind === "sales-rep" || (role.kind === "admin" && query.repView)
      ? buildEmployeeDashboard(role, query.repView)
      : undefined;

  if (employeeDashboard) {
    return (
      <EmployeeDashboard
        model={employeeDashboard}
        repOptions={employeeRepOptions()}
      />
    );
  }

  return (
    <AdminLandingDashboard
      authenticatedEmail={authenticatedEmail}
      role={role}
      mode={mode}
      query={query}
    />
  );
}
