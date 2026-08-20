import Link from "next/link";
import { headers } from "next/headers";
import { FileDown, FileText, ShieldCheck } from "lucide-react";
import { getPortalAuthenticatedEmailFromHeaders } from "@/lib/portal/auth";
import { getDashboardV1AdminRows } from "@/lib/portal/adminDashboardV1";
import {
  canAccessPortalAdmin,
  filterRowsForPortalRole,
  getPortalStaffRole,
} from "@/lib/portal/portalRoles";
import { visiblePriceLists } from "@/lib/portal/priceLists";
import { AdminAccessRequired } from "@/app/portal/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function EmployeePriceListsPage() {
  const authenticatedEmail = getPortalAuthenticatedEmailFromHeaders(await headers());
  const role = getPortalStaffRole(authenticatedEmail);
  if (!authenticatedEmail || !canAccessPortalAdmin(role)) return <AdminAccessRequired />;

  const scopedRows = filterRowsForPortalRole(role, getDashboardV1AdminRows());
  const allowedCodes = new Set(scopedRows.flatMap((row) => row.priceListCodes));
  const priceLists = visiblePriceLists
    .filter((priceList) => role.kind === "admin" || allowedCodes.has(priceList.code))
    .sort((a, b) => a.code.localeCompare(b.code));

  return (
    <main className="min-h-screen bg-[#f4efe6] px-5 py-10 text-[#172a28] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 border-b border-[#d8c49b] pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b7650]">
              Employee resources
            </p>
            <h1 className="mt-3 text-5xl font-semibold tracking-[-0.05em]">Price Lists</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#706759]">
              {role.kind === "sales-rep"
                ? "Only lists assigned to customers in your sales scope are shown."
                : "Administrator view of the active price-list catalog."}
            </p>
          </div>
          <Link href="/portal/admin" className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#172a28] px-5 text-sm font-semibold text-white">
            Return to Dashboard
          </Link>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {priceLists.map((priceList) => {
            const onlineHref = priceList.onlineUrl ?? `/portal/price-list/${priceList.code.toLowerCase()}`;
            const downloadHref = priceList.generated
              ? `/portal/price-list/export?code=${encodeURIComponent(priceList.code)}&priceMode=edged`
              : priceList.r2Key
                ? `/api/portal/download?code=${encodeURIComponent(priceList.code)}`
                : "";
            return (
              <article key={priceList.code} className="rounded-lg border border-[#d8c49b] bg-[#fffaf1] p-5 shadow-[0_16px_44px_rgba(23,42,40,0.08)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#172a28] text-sm font-bold text-white">{priceList.code}</div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f4ee] px-2.5 py-1 text-[11px] font-semibold text-[#24543a]"><ShieldCheck className="h-3.5 w-3.5" /> Authorized</span>
                </div>
                <h2 className="mt-4 text-xl font-semibold text-[#172a28]">{priceList.label}</h2>
                <p className="mt-2 text-sm text-[#706759]">{priceList.package ? "Package price list" : "Standard price list"}</p>
                {!priceList.generated && !priceList.r2Key ? <p className="mt-3 rounded-md border border-[#d8a15e] bg-[#fff7e8] p-3 text-xs leading-5 text-[#805519]">This assigned list does not have a generated or stored document yet.</p> : null}
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href={onlineHref} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#172a28] px-4 text-xs font-semibold text-white"><FileText className="h-4 w-4" /> Open online</Link>
                  {downloadHref ? <Link href={downloadHref} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#c9af79] bg-white px-4 text-xs font-semibold text-[#172a28]"><FileDown className="h-4 w-4" /> Download PDF</Link> : null}
                </div>
              </article>
            );
          })}
        </div>
        {!priceLists.length ? <p className="mt-7 rounded-md border border-dashed border-[#d8c49b] bg-[#fffaf1] p-6 text-sm text-[#706759]">No price lists are assigned to accounts in this role&apos;s permitted scope.</p> : null}
      </div>
    </main>
  );
}
