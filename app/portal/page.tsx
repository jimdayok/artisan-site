import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isPortalAdminEmail } from "@/lib/portal/admin";
import {
  getPortalAuthenticatedEmailFromHeaders,
} from "@/lib/portal/auth";
import PortalDashboard from "./PortalDashboard";

export const dynamic = "force-dynamic";

export default async function PortalPage({
  searchParams,
}: {
  searchParams: Promise<{
    account?: string;
    q?: string;
    mode?: string;
    division?: string;
    lab?: string;
    priceList?: string;
    hasUser?: string;
    activity?: string;
    trend?: string;
    opportunity?: string;
  }>;
}) {
  const headerList = await headers();
  const query = await searchParams;
  const authenticatedEmail = getPortalAuthenticatedEmailFromHeaders(headerList);
  const isAdminEmail = Boolean(
    authenticatedEmail && isPortalAdminEmail(authenticatedEmail)
  );

  if (isAdminEmail) {
    const params = new URLSearchParams();
    if (query.q) params.set("q", query.q);
    if (query.division) params.set("division", query.division);
    if (query.lab) params.set("lab", query.lab);
    if (query.priceList) params.set("priceList", query.priceList);
    if (query.hasUser) params.set("hasUser", query.hasUser);
    if (query.activity) params.set("activity", query.activity);
    if (query.trend) params.set("trend", query.trend);
    if (query.opportunity) params.set("opportunity", query.opportunity);
    redirect(`/portal/admin${params.size ? `?${params.toString()}` : ""}`);
  }

  return (
    <PortalDashboard
      headerList={headerList}
      selectedAccountNumber={query.account}
    />
  );
}
