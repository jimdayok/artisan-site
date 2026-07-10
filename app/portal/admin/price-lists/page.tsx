import Link from "next/link";
import { headers } from "next/headers";
import { AdminAccessRequired, AdminShell, adminButtonClass } from "../AdminShell";
import { getPortalAdminEmailFromHeaders } from "@/lib/portal/admin";
import { visiblePriceLists } from "@/lib/portal/priceLists";
import styleMappingGaps from "@/lib/portal/generated/priceListStyleMappingGaps.json";

export const dynamic = "force-dynamic";

type UnmappedProduct = {
  rawStyleName: string;
  normalizedStyleKey: string;
  priceListCodes: string[];
  rowCount: number;
};

function statusClass(tone: "ok" | "warning" | "neutral") {
  if (tone === "ok") return "border-[#9dc4ad] bg-[#eef8f1] text-[#24543a]";
  if (tone === "warning") return "border-[#d9aa83] bg-[#fff4e8] text-[#8a421d]";
  return "border-[#d7c5a8] bg-[#fbf8f3] text-[#6a6257]";
}

function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "ok" | "warning" | "neutral";
}) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(tone)}`}>
      {children}
    </span>
  );
}

export default async function AdminPriceListsPage() {
  const adminEmail = getPortalAdminEmailFromHeaders(await headers());
  if (!adminEmail) return <AdminAccessRequired />;

  const rows = [...visiblePriceLists].sort((a, b) => a.code.localeCompare(b.code));
  const missingAssigned = rows.filter(
    (row) => row.assignmentStatus === "assigned" && !row.generated
  );
  const unmappedProducts = (styleMappingGaps.unmappedProducts ??
    []) as UnmappedProduct[];

  return (
    <AdminShell title="Admin Price Lists" adminEmail={adminEmail}>
      <section className="mt-8 border border-[#d8c49b] bg-[#fffaf1]/88 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)] sm:p-7">
        <div className="flex flex-wrap gap-3">
          <Link href="/portal/admin" className={adminButtonClass}>
            Back to Admin Dashboard
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Summary label="Detected" value={rows.filter((row) => row.detected).length} />
          <Summary label="Generated" value={rows.filter((row) => row.generated).length} />
          <Summary label="Package lists" value={rows.filter((row) => row.package).length} />
          <Summary label="Assigned missing" value={missingAssigned.length} warning={missingAssigned.length > 0} />
        </div>

        {missingAssigned.length > 0 ? (
          <div className="mt-5 border border-[#d9aa83] bg-[#fff4e8] p-4 text-sm text-[#6f3519]">
            <strong>Generation warning:</strong>{" "}
            {missingAssigned.map((row) => row.code).join(", ")} are assigned to customers but have no generated pricing rows.
          </div>
        ) : null}

        {unmappedProducts.length > 0 ? (
          <section className="mt-5 border border-[#d9aa83] bg-[#fff4e8] p-4 text-sm text-[#172a28]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a421d]">
                  Lens style naming gaps
                </p>
                <h2 className="mt-1 text-xl font-semibold">
                  {unmappedProducts.length} styles.xml products are missing from Lookup.xlsx
                </h2>
                <p className="mt-1 text-[#6f3519]">
                  Add these raw style names to the lens style naming normalization workbook so portal labels stay controlled.
                </p>
              </div>
              <span className="rounded-full border border-[#d9aa83] bg-white px-3 py-1 text-xs font-semibold text-[#6f3519]">
                Scanned {styleMappingGaps.priceListCountScanned} price lists
              </span>
            </div>
            <div className="mobile-scroll-row mt-4 max-h-[28rem] overflow-auto border border-[#ead4bc] bg-white">
              <table className="w-full min-w-[860px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[#ead4bc] bg-[#fff8ee] text-[#172a28]">
                    <th className="px-3 py-2">Raw styles.xml product</th>
                    <th className="px-3 py-2">Lookup key needed</th>
                    <th className="px-3 py-2">Price lists</th>
                    <th className="px-3 py-2 text-right">Rows</th>
                  </tr>
                </thead>
                <tbody>
                  {unmappedProducts.map((product) => (
                    <tr key={product.normalizedStyleKey} className="border-b border-[#f1e4d1]">
                      <td className="px-3 py-2 font-semibold text-[#172a28]">
                        {product.rawStyleName}
                      </td>
                      <td className="px-3 py-2 font-mono text-[11px] text-[#706759]">
                        {product.normalizedStyleKey}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {product.priceListCodes.map((code) => (
                            <span
                              key={`${product.normalizedStyleKey}-${code}`}
                              className="rounded-full border border-[#d8c49b] bg-[#fffaf1] px-2 py-0.5 font-semibold text-[#172a28]"
                            >
                              {code}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right font-semibold">
                        {product.rowCount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <div className="mt-5 border border-[#9dc4ad] bg-[#eef8f1] p-4 text-sm text-[#24543a]">
            <strong>Lens style naming:</strong> All scanned styles.xml products are represented in Lookup.xlsx.
          </div>
        )}

        <div className="mobile-scroll-row mt-5 overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#d8c49b] bg-[#f8f1e6] text-[#172a28]">
                <th className="px-3 py-2">Code</th>
                <th className="px-3 py-2">Display Name</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Generation</th>
                <th className="px-3 py-2">Assignment</th>
                <th className="px-3 py-2">Accounts</th>
                <th className="px-3 py-2">Customers</th>
                <th className="px-3 py-2">Rows</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.code} className="border-b border-[#eadfce] align-top">
                  <td className="px-3 py-3 font-semibold">{row.code}</td>
                  <td className="max-w-[280px] px-3 py-3">{row.label}</td>
                  <td className="px-3 py-3">
                    <Badge>{row.package ? "Package price list" : "Standard price list"}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge tone={row.generated ? "ok" : "warning"}>
                        {row.generated ? "Generated" : "Missing / failed"}
                      </Badge>
                      {row.invalidOrUnknown ? <Badge tone="warning">Invalid / unknown</Badge> : null}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone={row.assignedAccountCount > 0 ? "ok" : "neutral"}>
                      {row.assignedAccountCount > 0
                        ? "Assigned to customers"
                        : "Not assigned"}
                    </Badge>
                  </td>
                  <td className="px-3 py-3">{row.assignedAccountCount}</td>
                  <td className="px-3 py-3">{row.visibleCustomerCount}</td>
                  <td className="px-3 py-3">{row.rowCount.toLocaleString()}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={row.onlineUrl ?? `/portal/price-list/${row.code.toLowerCase()}`}
                        className="inline-flex min-h-8 items-center rounded-full border border-[#d7c5a8] px-3 text-xs font-semibold text-[#122033] hover:bg-[#f8f1e6]"
                      >
                        Open Online
                      </Link>
                      {row.generated || row.r2Key ? (
                        <Link
                          href={
                            row.generated
                              ? `/portal/price-list/export?code=${encodeURIComponent(row.code)}&priceMode=edged`
                              : `/api/portal/download?code=${encodeURIComponent(row.code)}`
                          }
                          className="inline-flex min-h-8 items-center rounded-full border border-[#d7c5a8] px-3 text-xs font-semibold text-[#122033] hover:bg-[#f8f1e6]"
                        >
                          Download PDF
                        </Link>
                      ) : null}
                    </div>
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

function Summary({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: number;
  warning?: boolean;
}) {
  return (
    <div className={`border p-4 ${warning ? "border-[#d9aa83] bg-[#fff4e8]" : "border-[#dfd2bf] bg-white"}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7654]">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-[#172a28]">{value}</p>
    </div>
  );
}
