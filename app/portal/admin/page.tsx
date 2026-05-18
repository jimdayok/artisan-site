import Link from "next/link";
import { headers } from "next/headers";
import { getPortalAdminEmailFromHeaders } from "@/lib/portal/admin";
import { getPortalAdminStats } from "@/lib/portal/adminData";
import { AdminAccessRequired, AdminShell, adminButtonClass } from "./AdminShell";

export const dynamic = "force-dynamic";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-[#d8c49b] bg-[#fffaf1]/88 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">
        {label}
      </p>
      <p className="mt-4 text-5xl font-semibold tracking-[-0.05em] text-[#172a28]">
        {value}
      </p>
    </div>
  );
}

export default async function PortalAdminPage() {
  const adminEmail = getPortalAdminEmailFromHeaders(await headers());

  if (!adminEmail) return <AdminAccessRequired />;

  const stats = getPortalAdminStats();
  const firstPreviewAccount = stats.accountRows[0]?.account.accountNumber;

  return (
    <AdminShell title="Portal Admin" adminEmail={adminEmail}>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={stats.totalUsers} />
        <StatCard label="Total Accounts" value={stats.totalAccounts} />
        <StatCard label="Active Portal Users" value={stats.totalActivePortalUsers} />
        <StatCard label="Assigned Price Lists" value={stats.totalAssignedPriceLists} />
      </section>

      <section className="mt-8 border border-[#d8c49b] bg-[#fffaf1]/84 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)] sm:p-8">
        <h2 className="text-3xl font-semibold tracking-[-0.035em]">
          Admin tools
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#706759]">
          Review workbook users, workbook accounts, current portal permissions,
          and preview customer views without creating a customer session.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/portal/admin/users" className={adminButtonClass}>
            View Users
          </Link>
          <Link href="/portal/admin/accounts" className={adminButtonClass}>
            View Accounts
          </Link>
          {firstPreviewAccount ? (
            <Link
              href={`/portal/admin/preview/${encodeURIComponent(firstPreviewAccount)}`}
              className={adminButtonClass}
            >
              Preview First Account
            </Link>
          ) : null}
        </div>
        <p className="mt-5 text-xs leading-5 text-[#8b7650]">
          TODO: Add audited edit/save workflows after the read-only preview model
          is approved.
        </p>
      </section>
    </AdminShell>
  );
}
