import { headers } from "next/headers";
import { isPortalAdminEmail } from "@/lib/portal/admin";
import { getPortalAuthenticatedEmailFromHeaders } from "@/lib/portal/auth";
import AdminLandingDashboard from "./AdminLandingDashboard";
import PortalDashboard from "./PortalDashboard";

export const dynamic = "force-dynamic";

export default async function PortalPage({
  searchParams,
}: {
  searchParams: Promise<{ account?: string; q?: string; mode?: string }>;
}) {
  const headerList = await headers();
  const query = await searchParams;
  const authenticatedEmail = getPortalAuthenticatedEmailFromHeaders(headerList);
  const mode = query.mode?.trim().toLowerCase();
  const showCustomerPortal = mode === "customer";

  if (
    authenticatedEmail &&
    isPortalAdminEmail(authenticatedEmail) &&
    !showCustomerPortal
  ) {
    return <AdminLandingDashboard adminEmail={authenticatedEmail} query={query.q ?? ""} />;
  }

  return (
    <PortalDashboard
      headerList={headerList}
      selectedAccountNumber={query.account}
    />
  );
}
