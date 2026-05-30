import Link from "next/link";
import { AdminShell, SearchBox, adminButtonClass } from "@/app/portal/admin/AdminShell";
import {
  getDashboardV1AdminRows,
  getDashboardV1Manifest,
} from "@/lib/portal/adminDashboardV1";

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDateTime(value?: string) {
  if (!value) return "Unavailable";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function formatDate(value?: string) {
  if (!value) return "Unavailable";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(parsed);
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="border border-[#d8c49b] bg-[#fffaf1]/88 p-5 shadow-[0_16px_44px_rgba(23,42,40,0.08)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b7650]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#172a28]">
        {value}
      </p>
    </article>
  );
}

export default function AdminLandingDashboard({
  adminEmail,
  query,
}: {
  adminEmail: string;
  query: string;
}) {
  const rows = getDashboardV1AdminRows();
  const manifest = getDashboardV1Manifest();
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = rows
    .filter((row) => {
      if (!normalizedQuery) return true;
      return [
        row.businessName,
        row.acctId,
        row.accountNumbers,
        row.customerType,
        row.salesRep,
        row.lab,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    })
    .slice(0, 250);

  const totalCmSales = rows.reduce((total, row) => total + row.cmSales, 0);
  const totalCmJobs = rows.reduce((total, row) => total + row.cmJobs, 0);
  const defaultPreviewAcctId = rows[0]?.acctId;

  return (
    <AdminShell title="Admin Customer Intelligence Dashboard" adminEmail={adminEmail}>
      <section className="mt-8 border border-[#d8c49b] bg-[#fffaf1]/88 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)] sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#8b7650]">
              Dashboard v1 Snapshot
            </p>
            <p className="mt-2 text-sm text-[#706759]">Logged in as {adminEmail}</p>
            <p className="mt-1 text-sm text-[#706759]">
              Last updated: {formatDateTime(manifest?.generated_at)}
            </p>
            <p className="mt-1 text-sm text-[#706759]">
              Last data refresh: {formatDate(manifest?.data_refresh_date)}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {defaultPreviewAcctId ? (
              <Link
                href={`/portal/admin/preview/${encodeURIComponent(defaultPreviewAcctId)}?returnTo=${encodeURIComponent("/portal/admin")}`}
                className={adminButtonClass}
              >
                View Customer Portal Preview
              </Link>
            ) : null}
            <Link href="/portal/admin/accounts" className={adminButtonClass}>
              Admin Accounts
            </Link>
            <Link href="/portal/admin/users" className={adminButtonClass}>
              Admin Users
            </Link>
            <Link href="/portal?mode=customer" className={adminButtonClass}>
              View My Customer Portal
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Accounts in Snapshot" value={formatCount(rows.length)} />
        <StatCard label="Current Month Sales" value={money(totalCmSales)} />
        <StatCard label="Current Month Jobs" value={formatCount(totalCmJobs)} />
        <StatCard label="Snapshot ID" value={manifest?.snapshot_id || "Unavailable"} />
      </section>

      <section className="mt-8 border border-[#d8c49b] bg-[#fffaf1]/88 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#172a28]">
          Customer Search
        </h2>
        <p className="mt-2 text-sm text-[#706759]">
          Search by business name, Acct ID, account numbers, customer type, or lab.
        </p>
        <SearchBox query={query} placeholder="Search business, Acct ID, account numbers, type, or lab" />

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[1220px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#d8c49b] bg-[#f8f1e6] text-[#172a28]">
                <th className="px-3 py-2">Business Name</th>
                <th className="px-3 py-2">Acct ID</th>
                <th className="px-3 py-2">Account Numbers</th>
                <th className="px-3 py-2">Customer Type</th>
                <th className="px-3 py-2">Sales Rep</th>
                <th className="px-3 py-2">Lab</th>
                <th className="px-3 py-2">CM Sales</th>
                <th className="px-3 py-2">CM JPD</th>
                <th className="px-3 py-2">CM Jobs</th>
                <th className="px-3 py-2 text-center">Preview</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.acctId} className="border-b border-[#eadfce]">
                  <td className="px-3 py-2">{row.businessName}</td>
                  <td className="px-3 py-2">{row.acctId}</td>
                  <td className="px-3 py-2">{row.accountNumbers || "—"}</td>
                  <td className="px-3 py-2">{row.customerType || "—"}</td>
                  <td className="px-3 py-2">{row.salesRep || "—"}</td>
                  <td className="px-3 py-2">{row.lab || "—"}</td>
                  <td className="px-3 py-2">{money(row.cmSales)}</td>
                  <td className="px-3 py-2">{row.cmJpd === null ? "—" : row.cmJpd.toFixed(2)}</td>
                  <td className="px-3 py-2">{formatCount(row.cmJobs)}</td>
                  <td className="px-3 py-2 text-center">
                    <Link
                      href={`/portal/admin/preview/${encodeURIComponent(row.acctId)}?returnTo=${encodeURIComponent("/portal/admin")}`}
                      className="inline-flex min-h-9 items-center justify-center rounded-full border border-[#d8c49b] bg-white px-3 text-xs font-semibold text-[#172a28] transition hover:bg-[#f4ebe0]"
                    >
                      Preview Customer Portal
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-[#8b7650]">
          Note: `Sales Rep` and `CM JPD` are not currently included in Dashboard v1 export and are shown as `—`.
        </p>
      </section>
    </AdminShell>
  );
}
