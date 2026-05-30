import Link from "next/link";
import { headers } from "next/headers";
import { getPortalAdminEmailFromHeaders } from "@/lib/portal/admin";
import { getPortalAdminStats } from "@/lib/portal/adminData";
import { getDashboardV1AdminRows, getDashboardV1Manifest } from "@/lib/portal/adminDashboardV1";
import { getPortalDashboardV1ByAccount } from "@/lib/portal/dashboardV1";
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
  const dashboardRows = getDashboardV1AdminRows();
  const manifest = getDashboardV1Manifest();
  const firstPreviewAccount = dashboardRows[0]?.acctId;

  return (
    <AdminShell title="Portal Admin" adminEmail={adminEmail}>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={stats.totalUsers} />
        <StatCard label="Total Accounts" value={dashboardRows.length || stats.totalAccounts} />
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
        <p className="mt-2 text-xs text-[#8b7650]">
          Dashboard v1 snapshot: {manifest?.snapshot_id || "Unavailable"} · Data refresh:{" "}
          {manifest?.data_refresh_date || "Unknown"}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {firstPreviewAccount ? (
            <Link
              href={`/portal/admin/preview/${encodeURIComponent(firstPreviewAccount)}?returnTo=${encodeURIComponent("/portal/admin")}`}
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

      <section className="mt-6 overflow-x-auto border border-[#d8c49b] bg-[#fffaf1]/88 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
        <table className="min-w-[1200px] w-full border-collapse text-left text-sm">
          <thead className="bg-[#172a28] text-white">
            <tr>
              {[
                "Business Name",
                "Acct ID",
                "Account Numbers",
                "Customer Type",
                "Sales Rep",
                "Lab",
                "CM Sales",
                "CM JPD",
                "CM Jobs",
                "Authorized Users",
                "Price Lists",
              ].map((heading) => (
                <th key={heading} className="px-4 py-3 font-semibold">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dashboardRows.map((row) => {
              const state = getPortalDashboardV1ByAccount(row.acctId);
              const authCount = state.account?.authorized_users_summary?.authorized_user_count ?? "—";

              return (
                <tr key={row.acctId} className="border-t border-[#d8c49b] align-top">
                  <td className="px-4 py-4 font-semibold text-[#172a28]">
                    <Link
                      href={`/portal/admin/preview/${encodeURIComponent(row.acctId)}?returnTo=${encodeURIComponent("/portal/admin")}`}
                      className="text-[#172a28] font-semibold"
                    >
                      {row.businessName}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-[#706759]">{row.acctId}</td>
                  <td className="px-4 py-4 text-[#706759]">{row.accountNumbers}</td>
                  <td className="px-4 py-4 text-[#706759]">{row.customerType}</td>
                  <td className="px-4 py-4 text-[#706759]">{row.salesRep || "—"}</td>
                  <td className="px-4 py-4 text-[#706759]">{row.lab}</td>
                  <td className="px-4 py-4 text-[#706759]">{row.cmSales ?? 0}</td>
                  <td className="px-4 py-4 text-[#706759]">{row.cmJpd ?? "—"}</td>
                  <td className="px-4 py-4 text-[#706759]">{row.cmJobs ?? 0}</td>
                  <td className="px-4 py-4 text-[#706759]">{authCount}</td>
                  <td className="px-4 py-4 text-[#706759]">—</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </AdminShell>
  );
}
