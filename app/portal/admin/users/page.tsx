import Link from "next/link";
import { headers } from "next/headers";
import { getPortalAdminEmailFromHeaders } from "@/lib/portal/admin";
import { filterAdminUserRows, getAdminUserRows } from "@/lib/portal/adminData";
import {
  AdminAccessRequired,
  AdminShell,
  PillList,
  SearchBox,
  adminButtonClass,
} from "../AdminShell";

export const dynamic = "force-dynamic";

export default async function PortalAdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const adminEmail = getPortalAdminEmailFromHeaders(await headers());

  if (!adminEmail) return <AdminAccessRequired />;

  const query = (await searchParams).q ?? "";
  const rows = filterAdminUserRows(getAdminUserRows(), query);

  return (
    <AdminShell title="Portal Users" adminEmail={adminEmail}>
      <SearchBox query={query} placeholder="Search users, emails, accounts, permissions..." />

      <section className="mt-8 overflow-x-auto border border-[#d8c49b] bg-[#fffaf1]/88 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
        <table className="min-w-[1100px] w-full border-collapse text-left text-sm">
          <thead className="bg-[#172a28] text-white">
            <tr>
              {[
                "Person",
                "Email",
                "Organization",
                "Account",
                "Customer Type",
                "Status",
                "Invitations",
                "Package Warning",
                "Price Lists",
                "Sections",
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
              <tr key={`${row.person.accountNumber}-${row.email}`} className="border-t border-[#d8c49b] align-top">
                <td className="px-4 py-4 font-semibold text-[#172a28]">
                  {row.person.name || "Unnamed"}
                </td>
                <td className="px-4 py-4 text-[#706759]">{row.email}</td>
                <td className="px-4 py-4 text-[#706759]">
                  {row.person.organization}
                </td>
                <td className="px-4 py-4 text-[#706759]">
                  {row.person.accountNumber}
                </td>
                <td className="px-4 py-4 text-[#706759]">
                  {row.customerTypeLabel
                    ? `${row.customerTypeLabel} (${row.customerTypeCode})`
                    : "Not mapped"}
                </td>
                <td className="px-4 py-4">
                  <span className={row.isApproved ? "font-semibold text-[#1d5a45]" : "font-semibold text-[#8b7650]"}>
                    {row.isApproved ? "Approved" : "Workbook only"}
                  </span>
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
                  <PillList values={row.assignedSections} />
                </td>
                <td className="px-4 py-4">
                  <Link
                    href={`/portal/admin/preview/${encodeURIComponent(row.person.accountNumber)}`}
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
