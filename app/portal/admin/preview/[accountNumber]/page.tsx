import { headers } from "next/headers";
import { getPortalAuthenticatedEmailFromHeaders } from "@/lib/portal/auth";
import { getPreviewCustomerByAccountNumber } from "@/lib/portal/adminData";
import { getPortalWorkbookProfileByAccountNumber } from "@/lib/portal/workbookAccountData";
import { getPortalDashboardV1ByAccount } from "@/lib/portal/dashboardV1";
import { resolveDashboardV1AcctId } from "@/lib/portal/adminDashboardV1";
import { getDashboardV1AdminRows } from "@/lib/portal/adminDashboardV1";
import {
  canAccessAdminAccount,
  canAccessPortalAdmin,
  getPortalStaffRole,
} from "@/lib/portal/portalRoles";
import { PortalDashboardContent } from "../../../PortalDashboard";
import { AdminAccessRequired } from "../../AdminShell";

export const dynamic = "force-dynamic";

function PreviewNotFound() {
  return (
    <main className="min-h-screen bg-[#f4efe6] px-5 py-12 text-[#172a28] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-3xl border border-[#d8c49b] bg-[#fffaf1]/88 p-8 shadow-[0_24px_80px_rgba(23,42,40,0.12)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b7650]">
          Admin Preview
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">
          Account not found
        </h1>
        <p className="mt-4 text-base leading-7 text-[#706759]">
          No dashboard account was found for this Acct ID or legacy account number.
        </p>
      </div>
    </main>
  );
}

function PreviewNotAuthorized() {
  return (
    <main className="min-h-screen bg-[#f4efe6] px-5 py-12 text-[#172a28] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-3xl border border-[#d8a15e] bg-[#fff7e8] p-8">
        <h1 className="text-4xl font-semibold tracking-[-0.04em]">
          Not authorized for this account
        </h1>
        <p className="mt-4 text-base leading-7 text-[#706759]">
          This customer portal preview is outside your assigned sales scope.
        </p>
      </div>
    </main>
  );
}

export default async function PortalAdminPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ accountNumber: string }>;
  searchParams?: Promise<{ returnTo?: string }>;
}) {
  const authenticatedEmail = getPortalAuthenticatedEmailFromHeaders(
    await headers()
  );
  const role = getPortalStaffRole(authenticatedEmail);

  if (!authenticatedEmail || !canAccessPortalAdmin(role)) {
    return <AdminAccessRequired />;
  }

  const { accountNumber } = await params;
  const resolved = resolveDashboardV1AcctId(accountNumber);
  const effectiveAccountId = resolved.acctId || accountNumber;
  const legacyAccountNumber = resolved.legacyAccountNumber || accountNumber;
  const query = (await searchParams) ?? {};
  const returnTo =
    query.returnTo && query.returnTo.startsWith("/portal/admin")
      ? query.returnTo
      : "/portal/admin";
  const adminRow = getDashboardV1AdminRows().find(
    (row) => row.acctId.toUpperCase() === effectiveAccountId.toUpperCase()
  );
  if (adminRow && !canAccessAdminAccount(role, adminRow)) {
    return <PreviewNotAuthorized />;
  }

  const workbookProfile = getPortalWorkbookProfileByAccountNumber(legacyAccountNumber);
  const customer = getPreviewCustomerByAccountNumber(legacyAccountNumber);
  const dashboardState = getPortalDashboardV1ByAccount(effectiveAccountId);
  const accountName =
    dashboardState.account?.business_name ||
    workbookProfile?.account?.accountName ||
    workbookProfile?.person.organization ||
    customer?.practiceName ||
    effectiveAccountId;
  if (dashboardState.status !== "ok" && !workbookProfile && !customer) {
    return <PreviewNotFound />;
  }

  return (
    <PortalDashboardContent
      authenticatedEmail={authenticatedEmail}
      customer={customer}
      workbookProfile={workbookProfile}
      dashboardState={dashboardState}
      adminPreviewAccountName={accountName}
      adminPreviewAccountNumber={effectiveAccountId}
      adminPreviewEmail={authenticatedEmail}
      adminReturnTo={returnTo}
    />
  );
}
