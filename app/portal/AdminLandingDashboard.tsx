import Link from "next/link";
import { AdminShell, adminButtonClass } from "@/app/portal/admin/AdminShell";
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
  divisionFilter,
  labFilter,
}: {
  adminEmail: string;
  query: string;
  divisionFilter: string;
  labFilter: string;
}) {
  const rows = getDashboardV1AdminRows();
  const manifest = getDashboardV1Manifest();
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedDivisionFilter = divisionFilter.trim().toUpperCase();
  const normalizedLabFilter = labFilter.trim().toUpperCase();
  const divisionOptions = [...new Set(rows.map((row) => row.division).filter(Boolean))].sort();
  const labOptions = [...new Set(rows.map((row) => row.lab).filter((value) => value && value !== "—"))].sort();

  const filtered = rows
    .filter((row) => {
      if (normalizedDivisionFilter && row.division.toUpperCase() !== normalizedDivisionFilter) return false;
      if (normalizedLabFilter && row.lab.toUpperCase() !== normalizedLabFilter) return false;
      if (!normalizedQuery) return true;
      return [
        row.businessName,
        row.acctId,
        row.accountNumbers,
        row.division,
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
              Last data refresh: {formatDate(manifest?.data_refresh_date)}
            </p>
            <p className="mt-1 text-xs text-[#8b7650]">
              Snapshot generated: {formatDateTime(manifest?.generated_at)} · ID: {manifest?.snapshot_id || "Unavailable"}
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
          <Link href="/portal?mode=customer" className={adminButtonClass}>
            View My Customer Portal
          </Link>
          <Link href="/portal/admin/price-lists" className={adminButtonClass}>
            View All Price Lists
          </Link>
        </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Last Data Refresh" value={formatDate(manifest?.data_refresh_date)} />
        <StatCard label="Accounts in Snapshot" value={formatCount(rows.length)} />
        <StatCard label="Current Month Sales" value={money(totalCmSales)} />
        <StatCard label="Current Month Jobs" value={formatCount(totalCmJobs)} />
      </section>

      <section className="mt-8 border border-[#d8c49b] bg-[#fffaf1]/88 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#172a28]">
          Customer Search
        </h2>
        <p className="mt-2 text-sm text-[#706759]">
          Search by business name, Acct ID, account numbers, customer type, or lab.
        </p>
        <form className="mt-8 grid gap-3 lg:grid-cols-[1fr_220px_220px_auto]">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search business, Acct ID, account numbers, type, or lab"
            className="min-h-12 border border-[#d8c49b] bg-[#fffaf1] px-4 text-sm text-[#172a28] outline-none transition focus:border-[#172a28]"
          />
          <select
            name="division"
            defaultValue={divisionFilter}
            className="min-h-12 border border-[#d8c49b] bg-[#fffaf1] px-3 text-sm text-[#172a28] outline-none transition focus:border-[#172a28]"
          >
            <option value="">All Divisions</option>
            {divisionOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            name="lab"
            defaultValue={labFilter}
            className="min-h-12 border border-[#d8c49b] bg-[#fffaf1] px-3 text-sm text-[#172a28] outline-none transition focus:border-[#172a28]"
          >
            <option value="">All Labs</option>
            {labOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button className="min-h-12 rounded-full bg-[#172a28] px-6 text-sm font-semibold text-white transition hover:bg-[#27433f]">
            Apply Filters
          </button>
        </form>

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
                <th className="px-3 py-2">Authorized Users</th>
                <th className="px-3 py-2">Price Lists</th>
                <th className="px-3 py-2 text-center">Preview</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.acctId} className="border-b border-[#eadfce]">
                  <td className="px-3 py-2">
                    <Link
                      href={`/portal/admin/preview/${encodeURIComponent(row.acctId)}?returnTo=${encodeURIComponent("/portal/admin")}`}
                      className="font-semibold text-[#172a28] underline-offset-2 hover:underline"
                    >
                      {row.businessName}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{row.acctId}</td>
                  <td className="px-3 py-2">{row.accountNumbers || "—"}</td>
                  <td className="px-3 py-2">{row.customerType || "—"}</td>
                  <td className="px-3 py-2">{row.salesRep || "—"}</td>
                  <td className="px-3 py-2">{row.lab || "—"}</td>
                  <td className="px-3 py-2">{money(row.cmSales)}</td>
                  <td className="px-3 py-2">{row.cmJpd === null ? "—" : row.cmJpd.toFixed(2)}</td>
                  <td className="px-3 py-2">{formatCount(row.cmJobs)}</td>
                  <td className="px-3 py-2">{formatCount(row.authorizedUsers)}</td>
                  <td className="px-3 py-2">{row.priceLists || "—"}</td>
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
      </section>
    </AdminShell>
  );
}
