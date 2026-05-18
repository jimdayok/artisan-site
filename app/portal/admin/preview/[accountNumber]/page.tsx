import { headers } from "next/headers";
import { getPortalAdminEmailFromHeaders } from "@/lib/portal/admin";
import { getPreviewCustomerByAccountNumber } from "@/lib/portal/adminData";
import { getPortalWorkbookProfileByAccountNumber } from "@/lib/portal/workbookAccountData";
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
          No workbook account or portal assignment was found for this account
          number.
        </p>
      </div>
    </main>
  );
}

export default async function PortalAdminPreviewPage({
  params,
}: {
  params: Promise<{ accountNumber: string }>;
}) {
  const adminEmail = getPortalAdminEmailFromHeaders(await headers());

  if (!adminEmail) return <AdminAccessRequired />;

  const { accountNumber } = await params;
  const workbookProfile = getPortalWorkbookProfileByAccountNumber(accountNumber);
  const customer = getPreviewCustomerByAccountNumber(accountNumber);
  const accountName =
    workbookProfile?.account?.accountName ||
    workbookProfile?.person.organization ||
    customer?.practiceName ||
    accountNumber;

  if (!workbookProfile && !customer) return <PreviewNotFound />;

  return (
    <PortalDashboardContent
      authenticatedEmail={adminEmail}
      customer={customer}
      workbookProfile={workbookProfile}
      adminPreviewAccountName={accountName}
    />
  );
}
