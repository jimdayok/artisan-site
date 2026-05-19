import Link from "next/link";
import { headers } from "next/headers";
import { getPortalAdminEmailFromHeaders } from "@/lib/portal/admin";
import {
  filterAdminAccountRows,
  getAdminAccountRows,
} from "@/lib/portal/adminData";
import {
  AdminAccessRequired,
  AdminShell,
  PillList,
  SearchBox,
  adminButtonClass,
} from "../AdminShell";

export const dynamic = "force-dynamic";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-US");

function formatDate(value: string) {
  if (!value) return "Not available";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function PortalAdminAccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const adminEmail = getPortalAdminEmailFromHeaders(await headers());

  if (!adminEmail) return <AdminAccessRequired />;

  const query = (await searchParams).q ?? "";
  const rows = filterAdminAccountRows(getAdminAccountRows(), query);

  return (
    <AdminShell title="Portal Accounts" adminEmail={adminEmail}>
      <SearchBox query={query} placeholder="Search accounts, reps, users, permissions..." />

      <section className="mt-8 overflow-x-auto border border-[#d8c49b] bg-[#fffaf1]/88 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
        <table className="min-w-[1400px] w-full border-collapse text-left text-sm">
          <thead className="bg-[#172a28] text-white">
            <tr>
              {[
                "Account",
                "Number",
                "Review",
                "Customer Type",
                "Detected Types",
                "Division",
                "Sales Rep",
                "Last Shipped",
                "CM Purchases",
                "PM Purchases",
                "CM Rx Orders",
                "PM Rx Orders",
                "Users",
                "Invitations",
                "Package Warning",
                "Price Lists",
                "Preview",
              ].map((heading) => (
                <th key={heading} className="px-4 py-3 font-semibold">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.account.accountNumber} className="border-t border-[#d8c49b] align-top">
                <td className="px-4 py-4 font-semibold text-[#172a28]">
                  {row.account.accountName}
                </td>
                <td className="px-4 py-4 text-[#706759]">
                  {row.account.accountNumber}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-2">
                    {row.duplicateRowsMerged ? (
                      <span className="w-fit rounded-full bg-[#efe2c8] px-3 py-1 text-xs font-semibold text-[#6f5f3f]">
                        {row.account.mergedRowCount} rows merged
                      </span>
                    ) : null}
                    {row.sameNameDifferentAccountWarning ? (
                      <span className="w-fit rounded-full bg-[#f2d8c8] px-3 py-1 text-xs font-semibold text-[#7b3f2a]">
                        Same practice name appears across multiple account
                        numbers: {row.sameNameAccountNumbers.join(", ")}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-4 text-[#706759]">
                  {row.customerTypeLabel
                    ? `${row.customerTypeLabel} (${row.customerTypeCode})`
                    : "Not mapped"}
                </td>
                <td className="px-4 py-4">
                  <PillList values={row.detectedCustomerTypeCodes} />
                </td>
                <td className="px-4 py-4 text-[#706759]">
                  {row.account.division || "Not available"}
                </td>
                <td className="px-4 py-4 text-[#706759]">
                  {row.account.salesRep || "Not available"}
                </td>
                <td className="px-4 py-4 text-[#706759]">
                  {formatDate(row.account.lastShippedDate)}
                </td>
                <td className="px-4 py-4 text-[#706759]">
                  {currencyFormatter.format(row.account.cmSales)}
                </td>
                <td className="px-4 py-4 text-[#706759]">
                  {currencyFormatter.format(row.account.pmSales)}
                </td>
                <td className="px-4 py-4 text-[#706759]">
                  {numberFormatter.format(row.account.cmJobs)}
                </td>
                <td className="px-4 py-4 text-[#706759]">
                  {numberFormatter.format(row.account.pmJobs)}
                </td>
                <td className="px-4 py-4 text-[#706759]">
                  {row.users.length > 0 ? (
                    <div className="space-y-2">
                      {row.users.map((user) => (
                        <div key={`${user.accountNumber}-${user.emails.join("-")}`}>
                          <p className="font-semibold text-[#172a28]">
                            {user.name || user.emails[0]}
                          </p>
                          <p className="text-xs text-[#706759]">
                            {user.emails.join(", ")}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    "None"
                  )}
                </td>
                <td className="px-4 py-4">
                  <PillList
                    values={
                      row.hasSequelRebateInvitation
                        ? ["Sequel Artisan Rewards"]
                        : []
                    }
                  />
                </td>
                <td className="px-4 py-4">
                  <PillList
                    values={
                      row.hasModernPackageSavingsWarning
                        ? ["Missing Package Savings"]
                        : []
                    }
                  />
                </td>
                <td className="px-4 py-4">
                  <PillList values={row.assignedPriceLists} />
                </td>
                <td className="px-4 py-4">
                  <Link
                    href={`/portal/admin/preview/${encodeURIComponent(row.account.accountNumber)}`}
                    className={adminButtonClass}
                  >
                    Preview
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AdminShell>
  );
}
