import { existsSync, statSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { AdminShell, SearchBox, adminButtonClass } from "@/app/portal/admin/AdminShell";
import { getAdminAccountRows } from "@/lib/portal/adminData";
import { customerPortalAccess } from "@/lib/portal/customers";
import { normalizePortalAccountNumber } from "@/lib/portal/workbookAccountData";
import { priceLists } from "@/lib/portal/priceLists";

type PriceListCode = (typeof priceLists)[number]["code"];

const customerFacingPriceListLabels: Record<PriceListCode, string> = {
  P6: "Artisan Equity Partner Pricing",
  G6: "Artisan General Customer Pricing",
  A6: "Artisan PMP/Acquios Partner Pricing",
  B5: "B5 Price Sheet",
  S5: "S5 Price Sheet",
  VD: "VD Price Sheet",
};

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

function parseDate(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp) : null;
}

function formatDate(value?: Date | null) {
  if (!value) return "Unavailable";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function workbookUpdatedAt() {
  const workbookPath = path.join(
    process.cwd(),
    "private-source",
    "portal",
    "workbook-data.json"
  );

  if (!existsSync(workbookPath)) return null;
  return statSync(workbookPath).mtime;
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

function BarRow({
  label,
  value,
  max,
  detail,
}: {
  label: string;
  value: number;
  max: number;
  detail: string;
}) {
  const width = max > 0 ? Math.max(6, Math.round((value / max) * 100)) : 6;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4 text-sm text-[#172a28]">
        <span className="font-semibold">{label}</span>
        <span className="text-xs text-[#706759]">{detail}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#efe4d2]">
        <div className="h-full rounded-full bg-[#172a28]" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export default function AdminLandingDashboard({
  adminEmail,
  query,
}: {
  adminEmail: string;
  query: string;
}) {
  const accountRows = getAdminAccountRows();
  const normalizedQuery = query.trim().toLowerCase();
  const refreshedAt = workbookUpdatedAt();
  const defaultPreviewAccount = accountRows[0]?.account.accountNumber ?? "";

  const filteredAccounts = accountRows
    .filter((row) => {
      if (!normalizedQuery) return true;
      return [
        row.account.accountNumber,
        row.account.accountName,
        row.account.salesRep,
        row.account.lastLabName,
        row.account.division,
        row.users.map((user) => user.name).join(" "),
        row.users.flatMap((user) => user.emails).join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    })
    .slice(0, 120);

  const totalCustomers = accountRows.length;
  const activePortalUsers = new Set(customerPortalAccess.map((entry) => entry.email)).size;
  const cmPurchases = accountRows.reduce((total, row) => total + row.account.cmSales, 0);
  const cmOrders = accountRows.reduce((total, row) => total + row.account.cmJobs, 0);
  const pmPurchases = accountRows.reduce((total, row) => total + row.account.pmSales, 0);
  const pmOrders = accountRows.reduce((total, row) => total + row.account.pmJobs, 0);
  const accountsWithOrders = accountRows.filter((row) => row.account.cmJobs > 0).length;
  const latestShippedDate = accountRows
    .map((row) => parseDate(row.account.lastShippedDateGlobal || row.account.lastShippedDate))
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const labRows = [...new Map(accountRows.map((row) => [row.account.lastLabName || "Unknown", row.account.lastLabName || "Unknown"])).values()]
    .map((labName) => {
      const rows = accountRows.filter(
        (row) => (row.account.lastLabName || "Unknown") === labName
      );
      const lastShipped = rows
        .map((row) => parseDate(row.account.lastShippedDateGlobal || row.account.lastShippedDate))
        .filter((date): date is Date => Boolean(date))
        .sort((a, b) => b.getTime() - a.getTime())[0];
      return {
        labName,
        accounts: rows.length,
        cmPurchases: rows.reduce((total, row) => total + row.account.cmSales, 0),
        cmOrders: rows.reduce((total, row) => total + row.account.cmJobs, 0),
        pmPurchases: rows.reduce((total, row) => total + row.account.pmSales, 0),
        pmOrders: rows.reduce((total, row) => total + row.account.pmJobs, 0),
        lastShipped,
      };
    })
    .sort((a, b) => b.cmPurchases - a.cmPurchases);

  const customerTypeRows = [
    { code: "PART", label: "Artisan Equity Partner" },
    { code: "GENL", label: "Artisan General Customer" },
    { code: "PMP", label: "Artisan PMP Partner" },
    { code: "ACQU", label: "Artisan Acquios Partner" },
    { code: "NL", label: "Artisan Neurolens Partner" },
    { code: "OTHER", label: "Unknown / Other" },
  ].map((type) => {
    const rows = accountRows.filter((row) => {
      const code = row.customerTypeCode?.trim().toUpperCase() ?? "";
      if (type.code === "OTHER") {
        return !["PART", "GENL", "PMP", "ACQU", "NL"].includes(code);
      }
      return code === type.code;
    });
    return {
      ...type,
      accounts: rows.length,
      cmPurchases: rows.reduce((total, row) => total + row.account.cmSales, 0),
      cmOrders: rows.reduce((total, row) => total + row.account.cmJobs, 0),
    };
  });

  const maxCustomerTypePurchases = Math.max(
    ...customerTypeRows.map((row) => row.cmPurchases),
    1
  );

  const priceListBreakdown = priceLists.map((priceList) => {
    const entries = customerPortalAccess.filter((entry) =>
      entry.allowedPriceLists.includes(priceList.code)
    );
    const accountCount = new Set(
      entries.map((entry) => normalizePortalAccountNumber(entry.accountNumber))
    ).size;
    const userCount = new Set(entries.map((entry) => entry.email)).size;
    return {
      ...priceList,
      accountCount,
      userCount,
    };
  });

  const recentShippedAccounts = accountRows
    .filter((row) => parseDate(row.account.lastShippedDateGlobal || row.account.lastShippedDate))
    .sort((a, b) => {
      const aDate = parseDate(a.account.lastShippedDateGlobal || a.account.lastShippedDate);
      const bDate = parseDate(b.account.lastShippedDateGlobal || b.account.lastShippedDate);
      return (bDate?.getTime() ?? 0) - (aDate?.getTime() ?? 0);
    })
    .slice(0, 10);

  const missingUserMapping = accountRows.filter((row) => row.users.length === 0);
  const duplicateWarnings = accountRows.filter(
    (row) => row.sameNameDifferentAccountWarning
  );
  const mergedRows = accountRows.filter((row) => row.duplicateRowsMerged);
  const noPriceListAssignments = accountRows.filter(
    (row) => row.assignedPriceLists.length === 0
  );

  return (
    <AdminShell title="Admin Customer Intelligence Dashboard" adminEmail={adminEmail}>
      <section className="mt-8 border border-[#d8c49b] bg-[#fffaf1]/88 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)] sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#8b7650]">
              Artisan Lab Network Admin Portal
            </p>
            <p className="mt-2 text-sm text-[#706759]">
              Logged in as {adminEmail}
            </p>
            <p className="mt-1 text-sm text-[#706759]">
              Last updated: {formatDate(refreshedAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {defaultPreviewAccount ? (
              <Link
                href={`/portal/admin/preview/${encodeURIComponent(defaultPreviewAccount)}`}
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
        <StatCard label="Total Customers / Accounts" value={formatCount(totalCustomers)} />
        <StatCard label="Active Portal Users" value={formatCount(activePortalUsers)} />
        <StatCard label="Current Month Purchases" value={money(cmPurchases)} />
        <StatCard label="Current Month Rx Orders" value={formatCount(cmOrders)} />
        <StatCard label="Previous Month Purchases" value={money(pmPurchases)} />
        <StatCard label="Previous Month Rx Orders" value={formatCount(pmOrders)} />
        <StatCard label="Accounts With Orders This Month" value={formatCount(accountsWithOrders)} />
        <StatCard label="Last Data Refresh" value={formatDate(refreshedAt)} />
      </section>

      <section className="mt-8 border border-[#d8c49b] bg-[#fffaf1]/88 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#172a28]">
          Customer Search
        </h2>
        <p className="mt-2 text-sm text-[#706759]">
          Search by account number, practice name, email/contact name, sales rep, or lab.
        </p>
        <SearchBox query={query} placeholder="Search accounts, users, reps, or labs" />
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#d8c49b] bg-[#f8f1e6] text-[#172a28]">
                <th className="px-3 py-2">Practice</th>
                <th className="px-3 py-2">Account #</th>
                <th className="px-3 py-2">Customer Type</th>
                <th className="px-3 py-2">Division</th>
                <th className="px-3 py-2">Sales Rep</th>
                <th className="px-3 py-2">Lab</th>
                <th className="px-3 py-2">Current Month Purchases</th>
                <th className="px-3 py-2">Current Month Rx Orders</th>
                <th className="px-3 py-2">Last Shipped</th>
                <th className="px-3 py-2 text-center">Preview</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((row) => (
                <tr key={row.account.accountNumber} className="border-b border-[#eadfce]">
                  <td className="px-3 py-2">{row.account.accountName || "Unknown"}</td>
                  <td className="px-3 py-2">{row.account.accountNumber}</td>
                  <td className="px-3 py-2">
                    {row.customerTypeCode
                      ? `${row.customerTypeCode} ${row.customerTypeLabel || ""}`.trim()
                      : "Unknown"}
                  </td>
                  <td className="px-3 py-2">{row.account.division || "—"}</td>
                  <td className="px-3 py-2">{row.account.salesRep || "—"}</td>
                  <td className="px-3 py-2">{row.account.lastLabName || "—"}</td>
                  <td className="px-3 py-2">{money(row.account.cmSales)}</td>
                  <td className="px-3 py-2">{formatCount(row.account.cmJobs)}</td>
                  <td className="px-3 py-2">
                    {row.account.lastShippedDateGlobal || row.account.lastShippedDate || "—"}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Link
                      href={`/portal/admin/preview/${encodeURIComponent(row.account.accountNumber)}`}
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

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <article className="border border-[#d8c49b] bg-[#fffaf1]/88 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#172a28]">
            Price List Overview
          </h2>
          <div className="mt-4 space-y-3">
            {priceListBreakdown.map((row) => (
              <div key={row.code} className="rounded-[2px] border border-[#e7dccb] bg-white/72 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-[#172a28]">
                    {row.code} - {customerFacingPriceListLabels[row.code]}
                  </p>
                  {row.onlineUrl ? (
                    <Link href={row.onlineUrl} className="text-xs font-semibold text-[#172a28] underline underline-offset-4">
                      View Online Pricing
                    </Link>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-[#706759]">
                  Accounts assigned: {formatCount(row.accountCount)} | Users assigned: {formatCount(row.userCount)}
                </p>
                <p className="mt-1 text-xs text-[#8b7650]">Last updated: {formatDate(refreshedAt)}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="border border-[#d8c49b] bg-[#fffaf1]/88 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#172a28]">
            Price List Assignment Breakdown
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {priceListBreakdown.map((row) => (
              <div key={`assignment-${row.code}`} className="rounded-[2px] border border-[#e7dccb] bg-white/72 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8b7650]">
                  {row.code}
                </p>
                <p className="mt-2 text-lg font-semibold text-[#172a28]">
                  {formatCount(row.accountCount)} accounts
                </p>
                <p className="text-sm text-[#706759]">{formatCount(row.userCount)} users</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <article className="border border-[#d8c49b] bg-[#fffaf1]/88 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#172a28]">
            Lab Breakdown
          </h2>
          <div className="mt-4 space-y-4">
            {labRows.map((row) => (
              <div key={row.labName} className="rounded-[2px] border border-[#e7dccb] bg-white/72 p-3">
                <p className="font-semibold text-[#172a28]">{row.labName}</p>
                <p className="mt-1 text-xs text-[#706759]">
                  {formatCount(row.accounts)} accounts | CM Purchases {money(row.cmPurchases)} | CM Rx Orders {formatCount(row.cmOrders)}
                </p>
                <p className="text-xs text-[#706759]">
                  PM Purchases {money(row.pmPurchases)} | PM Rx Orders {formatCount(row.pmOrders)} | Last shipped {formatDate(row.lastShipped)}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="border border-[#d8c49b] bg-[#fffaf1]/88 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#172a28]">
            Customer Type Breakdown
          </h2>
          <div className="mt-4 space-y-4">
            {customerTypeRows.map((row) => (
              <BarRow
                key={row.code}
                label={`${row.code} ${row.label}`}
                value={row.cmPurchases}
                max={maxCustomerTypePurchases}
                detail={`${formatCount(row.accounts)} accounts • ${formatCount(row.cmOrders)} Rx Orders`}
              />
            ))}
          </div>
        </article>
      </section>

      <section className="mt-8 border border-[#d8c49b] bg-[#fffaf1]/88 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#172a28]">
          Recent Activity and Data Quality
        </h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[2px] border border-[#e7dccb] bg-white/72 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8b7650]">
              Recently Shipped Accounts
            </p>
            <ul className="mt-3 space-y-2 text-sm text-[#172a28]">
              {recentShippedAccounts.map((row) => (
                <li key={`ship-${row.account.accountNumber}`}>
                  {row.account.accountName} ({row.account.accountNumber}) -{" "}
                  {row.account.lastShippedDateGlobal || row.account.lastShippedDate || "Unknown"}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[2px] border border-[#e7dccb] bg-white/72 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8b7650]">
              Data Quality Checks
            </p>
            <ul className="mt-3 space-y-2 text-sm text-[#172a28]">
              <li>Accounts missing email/user mapping: {formatCount(missingUserMapping.length)}</li>
              <li>Accounts with duplicate-name warnings: {formatCount(duplicateWarnings.length)}</li>
              <li>Accounts with merged duplicate rows: {formatCount(mergedRows.length)}</li>
              <li>Accounts with no price list assignment: {formatCount(noPriceListAssignments.length)}</li>
              <li>Latest shipped activity: {formatDate(latestShippedDate)}</li>
            </ul>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
