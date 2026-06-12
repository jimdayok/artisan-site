import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isPortalAdminEmail } from "@/lib/portal/admin";
import {
  getCloudflareAccessEmailFromHeaders,
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
  const cloudflareEmail = getCloudflareAccessEmailFromHeaders(headerList);
  const mode = query.mode?.trim().toLowerCase();
  const showCustomerPortal = mode === "customer";

  console.log("[PORTAL AUTH]", {
    path: "/portal",
    authenticatedEmail,
    cloudflareEmail,
    authError: headerList.get("x-portal-auth-error") ?? "",
    authorizationDecision:
      authenticatedEmail && isPortalAdminEmail(authenticatedEmail)
        ? showCustomerPortal
          ? "render-customer-mode"
          : "render-admin-dashboard"
        : authenticatedEmail
          ? "evaluate-customer"
          : "render-login-error",
    redirectTarget: null,
  });

  if (
    authenticatedEmail &&
    isPortalAdminEmail(authenticatedEmail) &&
    !showCustomerPortal
  ) {
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
