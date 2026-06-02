import { existsSync, statSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { headers } from "next/headers";
import { AdminAccessRequired, AdminShell, adminButtonClass } from "../AdminShell";
import { getPortalAdminEmailFromHeaders } from "@/lib/portal/admin";
import { canonicalPriceListCode, priceLists } from "@/lib/portal/priceLists";
import { getDashboardV1Accounts } from "@/lib/portal/adminDashboardV1";

export const dynamic = "force-dynamic";

function formatDateTime(value?: Date) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function AdminPriceListsPage() {
  const adminEmail = getPortalAdminEmailFromHeaders(await headers());
  if (!adminEmail) return <AdminAccessRequired />;

  const accounts = getDashboardV1Accounts();
  const normalizedDir = path.join(
    process.cwd(),
    "private-source",
    "pricing",
    "generated",
    "normalized"
  );

  const rows = priceLists
    .map((list) => {
      const effectiveCode = canonicalPriceListCode(list.code);
      const normalizedPath = path.join(normalizedDir, `${effectiveCode}.json`);
      const hasNormalized = existsSync(normalizedPath);
      const timestamp = hasNormalized ? statSync(normalizedPath).mtime : undefined;

      const assignedAccountCount = accounts.filter((account) =>
        (account.price_lists ?? [])
          .map((entry) => canonicalPriceListCode(String(entry || "")))
          .includes(effectiveCode)
      ).length;
      const visibleCustomerCount = accounts.filter((account) =>
        Number(account.authorized_user_count ?? 0) > 0 &&
        (account.price_lists ?? [])
          .map((entry) => canonicalPriceListCode(String(entry || "")))
          .includes(effectiveCode)
      ).length;

      return {
        code: list.code,
        effectiveCode,
        displayName: list.label,
        onlineUrl: list.onlineUrl,
        hasPdf: Boolean(list.r2Key),
        type: list.code.startsWith("E") ? "Special Partner" : "Program",
        hasNormalized,
        visibleCustomerCount,
        assignedAccountCount,
        timestamp,
      };
    })
    .sort((a, b) => a.effectiveCode.localeCompare(b.effectiveCode));

  return (
    <AdminShell title="Admin Price Lists" adminEmail={adminEmail}>
      <section className="mt-8 border border-[#d8c49b] bg-[#fffaf1]/88 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)] sm:p-7">
        <div className="flex flex-wrap gap-3">
          <Link href="/portal/admin" className={adminButtonClass}>
            Back to Admin Dashboard
          </Link>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[1020px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#d8c49b] bg-[#f8f1e6] text-[#172a28]">
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Effective Code</th>
                <th className="px-3 py-2">Display Name</th>
                <th className="px-3 py-2">Price Sheet</th>
                <th className="px-3 py-2">Type / Program</th>
                <th className="px-3 py-2">Normalized File</th>
                <th className="px-3 py-2">Visible Customer Count</th>
                <th className="px-3 py-2">Assigned Account Count</th>
                <th className="px-3 py-2">Last Generated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.code}-${row.effectiveCode}`} className="border-b border-[#eadfce]">
                  <td className="px-3 py-2 font-semibold">{row.code}</td>
                  <td className="px-3 py-2">{row.effectiveCode}</td>
                  <td className="px-3 py-2">{row.displayName}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/portal/price-list/${row.effectiveCode.toLowerCase()}`}
                        className="inline-flex min-h-8 items-center rounded-full border border-[#d7c5a8] px-3 text-xs font-semibold text-[#122033] hover:bg-[#f8f1e6]"
                      >
                        Open Online
                      </Link>
                      {row.hasPdf ? (
                        <Link
                          href={`/api/portal/download?code=${encodeURIComponent(row.effectiveCode)}`}
                          className="inline-flex min-h-8 items-center rounded-full border border-[#d7c5a8] px-3 text-xs font-semibold text-[#122033] hover:bg-[#f8f1e6]"
                        >
                          Download PDF
                        </Link>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3 py-2">{row.type}</td>
                  <td className="px-3 py-2">{row.hasNormalized ? "Yes" : "No"}</td>
                  <td className="px-3 py-2">{row.visibleCustomerCount}</td>
                  <td className="px-3 py-2">{row.assignedAccountCount}</td>
                  <td className="px-3 py-2">{formatDateTime(row.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
