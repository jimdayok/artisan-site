import Link from "next/link";
import { headers } from "next/headers";
import { Activity, ArrowDownRight, ArrowUpRight, CircleDollarSign, Mail, Package, ShieldAlert, Users } from "lucide-react";
import { getPortalAdminEmailFromHeaders } from "@/lib/portal/admin";
import { getDashboardV1AdminRows, resolveDashboardV1AcctId, type DashboardV1AdminRow } from "@/lib/portal/adminDashboardV1";
import { AdminAccessRequired, AdminShell, adminButtonClass } from "../../AdminShell";
import { AdminCopyButton } from "../../AdminCopyButton";

export const dynamic = "force-dynamic";

const customerTypeLabels: Record<string, string> = {
  ACQU: "Acquios Alliance",
  PART: "Equity Partner",
  GENL: "General Customer",
  PMP: "PMP Customer",
  NL: "Neurolens Customer",
  VSP: "VSP Customer",
  VSP1: "VSP Customer",
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function moneyOrUnavailable(value: number | null) {
  return value === null ? "Unavailable" : `${money(value)}/day`;
}

function count(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function date(value?: string) {
  if (!value) return "Unavailable";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(parsed);
}

function percentChange(current: number, prior: number) {
  if (prior === 0 && current === 0) return { value: 0, label: "Flat", direction: "flat" as const };
  if (prior === 0) return { value: 100, label: "+100%", direction: "up" as const };
  const value = ((current - prior) / Math.abs(prior)) * 100;
  return {
    value,
    label: `${value > 0 ? "+" : ""}${value.toFixed(1)}%`,
    direction: value > 0 ? ("up" as const) : value < 0 ? ("down" as const) : ("flat" as const),
  };
}

function typeLabel(code: string) {
  const normalized = code.trim().toUpperCase();
  return customerTypeLabels[normalized] || normalized || "Unclassified";
}

function previewHref(row: DashboardV1AdminRow) {
  return `/portal/admin/preview/${encodeURIComponent(row.acctId)}?returnTo=${encodeURIComponent(`/portal/admin/account-analysis/${row.acctId}`)}`;
}

function firstEmail(row: DashboardV1AdminRow) {
  return row.authorizedUserEmails.find(Boolean) || "";
}

function outreachNote(row: DashboardV1AdminRow) {
  if (row.cmJobs < row.pmJobs) return "Your order volume dipped this month, and I wanted to check in to see if anything has changed or if there is anything we can help with.";
  if (row.cmSales < row.pmSales) return "Your monthly activity changed this month, and I wanted to review whether there is anything Artisan can help support on pricing, product mix, or workflow.";
  return "I wanted to check in and see whether there are any current needs Artisan can help with for your practice.";
}

function MetricCard({ label, value, detail, icon: Icon }: { label: string; value: string; detail?: string; icon: typeof CircleDollarSign }) {
  return (
    <article className="rounded-md border border-[#d8c49b] bg-[#fffaf1]/88 p-5 shadow-[0_16px_44px_rgba(23,42,40,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b7650]">{label}</p>
        <Icon className="h-5 w-5 text-[#b89a61]" />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#172a28]">{value}</p>
      {detail ? <p className="mt-2 text-xs leading-5 text-[#706759]">{detail}</p> : null}
    </article>
  );
}

function TrendBadge({ change }: { change: ReturnType<typeof percentChange> }) {
  const tone = change.direction === "up" ? "text-[#1f6b45]" : change.direction === "down" ? "text-[#8b3b2d]" : "text-[#706759]";
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-bold ${tone}`}>
      {change.direction === "up" ? <ArrowUpRight className="h-4 w-4" /> : null}
      {change.direction === "down" ? <ArrowDownRight className="h-4 w-4" /> : null}
      {change.label}
    </span>
  );
}

function programStatus(value: boolean) {
  return value ? "Active" : "Not Recorded";
}

function flagsFor(row: DashboardV1AdminRow) {
  const flags: Array<{ title: string; why: string; action: string }> = [];
  if (row.cmSales < row.pmSales) flags.push({ title: "Sales down month over month", why: `${money(row.cmSales)} current vs ${money(row.pmSales)} previous.`, action: "Review order mix and contact the customer with a specific support angle." });
  if (row.cmJobs < row.pmJobs) flags.push({ title: "Jobs down month over month", why: `${count(row.cmJobs)} current jobs vs ${count(row.pmJobs)} previous.`, action: "Ask whether patient flow, staffing, or competing lab usage changed." });
  if ((row.brandUsage.neurolens_jobs?.cm ?? 0) < (row.brandUsage.neurolens_jobs?.pm ?? 0)) flags.push({ title: "Neurolens decline", why: `${count(row.brandUsage.neurolens_jobs?.cm ?? 0)} current Neurolens jobs vs ${count(row.brandUsage.neurolens_jobs?.pm ?? 0)} previous.`, action: "Review Neurolens ordering behavior and identify whether education or workflow support is needed." });
  if ((row.brandUsage.sequel_jobs?.cm ?? 0) < (row.brandUsage.sequel_jobs?.pm ?? 0)) flags.push({ title: "Sequel decline", why: `${count(row.brandUsage.sequel_jobs?.cm ?? 0)} current Sequel jobs vs ${count(row.brandUsage.sequel_jobs?.pm ?? 0)} previous.`, action: "Review Sequel PAL adoption and whether rewards-qualified activity is slipping." });
  if (row.cmJpd !== null && row.pmJpd !== null && row.cmJpd < row.pmJpd) flags.push({ title: "JPD down", why: `${row.cmJpd.toFixed(1)} current JPD vs ${row.pmJpd.toFixed(1)} previous.`, action: "Use JPD to distinguish velocity from calendar timing." });
  if (row.turnaroundAverageDays.cm > row.turnaroundAverageDays.pm && row.turnaroundAverageDays.pm > 0) flags.push({ title: "Turnaround deterioration", why: `${row.turnaroundAverageDays.cm.toFixed(1)} current average days vs ${row.turnaroundAverageDays.pm.toFixed(1)} previous.`, action: "Review lab service timing and proactively communicate expectations if needed." });
  if (row.pmJobs > 0 && row.cmJobs === 0) flags.push({ title: "No current activity", why: "Prior-month jobs exist, but current-month jobs are zero.", action: "Prioritize immediate outreach to confirm ordering status." });
  if (!row.programs.tokai) flags.push({ title: "Tokai opportunity", why: "Tokai usage is not recorded.", action: "Introduce Tokai only where specialty or high-index demand makes sense." });
  if (!row.programs.modernFrame) flags.push({ title: "Modern Frame opportunity", why: "Modern Frame usage is not recorded.", action: "Review whether Modern Frame can simplify package adoption." });
  if (row.authorizedUsers === 0) flags.push({ title: "Portal adoption issue", why: "No authorized portal users are assigned.", action: "Add or confirm customer portal contacts before launch follow-up." });
  return flags;
}

function NotFound({ adminEmail }: { adminEmail: string }) {
  return (
    <AdminShell title="Account Analysis Not Found" adminEmail={adminEmail}>
      <section className="mt-8 rounded-md border border-[#d8c49b] bg-[#fffaf1]/88 p-8 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
        <p className="text-sm text-[#706759]">No account analysis was found for that Acct ID or legacy account number.</p>
        <Link href="/portal/admin" className={`${adminButtonClass} mt-6`}>Back to Admin Dashboard</Link>
      </section>
    </AdminShell>
  );
}

export default async function AdminAccountAnalysisPage({ params }: { params: Promise<{ accountNumber: string }> }) {
  const adminEmail = getPortalAdminEmailFromHeaders(await headers());
  if (!adminEmail) return <AdminAccessRequired />;

  const { accountNumber } = await params;
  const resolved = resolveDashboardV1AcctId(accountNumber);
  const rows = getDashboardV1AdminRows();
  const row = rows.find((entry) => entry.acctId.toUpperCase() === resolved.acctId.toUpperCase());
  if (!row) return <NotFound adminEmail={adminEmail} />;

  const salesChange = percentChange(row.cmSalesPerDay ?? 0, row.pmSalesPerDay ?? 0);
  const jobsChange = percentChange(row.cmJpd ?? 0, row.pmJpd ?? 0);
  const email = firstEmail(row);
  const emailHref = email ? `mailto:${email}?subject=${encodeURIComponent("Checking in from Artisan Lab Network")}` : "";
  const flags = flagsFor(row);

  return (
    <AdminShell title="Internal Account Analysis" adminEmail={adminEmail} eyebrow="ALN Customer Intelligence">
      <section className="mt-8 overflow-hidden rounded-md border border-[#d8c49b] bg-[#172a28] p-6 text-white shadow-[0_28px_90px_rgba(23,42,40,0.22)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d8c49b]">Internal ALN View · Not Customer-Facing</p>
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.05em]">{row.businessName}</h1>
            <p className="mt-3 text-sm leading-6 text-white/72">
              {row.acctId} · {row.accountNumbers || "No account numbers"} · {typeLabel(row.customerType)} · {row.lab || "Lab unavailable"}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={previewHref(row)} className={adminButtonClass}>Preview Customer Portal</Link>
            <Link href="/portal/admin" className={adminButtonClass}>Back to Admin Dashboard</Link>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={CircleDollarSign} label="Current Sales / Day" value={moneyOrUnavailable(row.cmSalesPerDay)} detail={`PM ${moneyOrUnavailable(row.pmSalesPerDay)} · Monthly ${money(row.cmSales)}`} />
        <MetricCard icon={Package} label="Current Jobs / Day" value={row.cmJpd === null ? "Unavailable" : `${row.cmJpd.toFixed(1)}/day`} detail={`PM ${row.pmJpd === null ? "Unavailable" : `${row.pmJpd.toFixed(1)}/day`} · Monthly ${count(row.cmJobs)}`} />
        <MetricCard icon={Activity} label="JPD" value={row.cmJpd === null ? "Unavailable" : row.cmJpd.toFixed(1)} detail={row.pmJpd === null ? "JPD data unavailable" : `PM ${row.pmJpd.toFixed(1)}`} />
        <MetricCard icon={Users} label="Authorized Users" value={count(row.authorizedUsers)} detail={row.authorizedUserEmails.join(", ") || "No customer email available"} />
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
        <article className="rounded-md border border-[#d8c49b] bg-[#fffaf1]/88 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">Account Facts</p>
          <div className="mt-5 grid gap-3 text-sm text-[#706759]">
            <p><span className="font-semibold text-[#172a28]">Acct ID:</span> {row.acctId}</p>
            <p><span className="font-semibold text-[#172a28]">Account Numbers:</span> {row.accountNumbers || "Unavailable"}</p>
            <p><span className="font-semibold text-[#172a28]">Customer Type:</span> {typeLabel(row.customerType)}</p>
            <p><span className="font-semibold text-[#172a28]">Sales Rep:</span> {row.salesRep || "Unavailable"}</p>
            <p><span className="font-semibold text-[#172a28]">Primary Lab:</span> {row.lab || "Unavailable"}</p>
            <p><span className="font-semibold text-[#172a28]">Tier:</span> {row.tier || "Unavailable"}</p>
            <p><span className="font-semibold text-[#172a28]">Last Ship Date:</span> {date(row.latestShipDate)}</p>
            <p><span className="font-semibold text-[#172a28]">Address:</span> {row.address || "Unavailable"}</p>
            <p><span className="font-semibold text-[#172a28]">Phone:</span> {row.phone || "Unavailable"}</p>
            <p><span className="font-semibold text-[#172a28]">Assigned Price Lists:</span> {row.priceLists || "None assigned"}</p>
          </div>
        </article>

        <article className="rounded-md border border-[#d8c49b] bg-[#fffaf1]/88 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">Performance and Mix</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-[#eadfce] bg-white/72 p-4">
              <p className="text-sm font-semibold text-[#172a28]">Sales / Day Trend</p>
              <p className="mt-2 text-2xl font-semibold text-[#172a28]">{moneyOrUnavailable(row.cmSalesPerDay)}</p>
              <TrendBadge change={salesChange} />
            </div>
            <div className="rounded-md border border-[#eadfce] bg-white/72 p-4">
              <p className="text-sm font-semibold text-[#172a28]">Jobs / Day Trend</p>
              <p className="mt-2 text-2xl font-semibold text-[#172a28]">{row.cmJpd === null ? "Unavailable" : `${row.cmJpd.toFixed(1)}/day`}</p>
              <TrendBadge change={jobsChange} />
            </div>
            <div className="rounded-md border border-[#eadfce] bg-white/72 p-4">
              <p className="text-sm font-semibold text-[#172a28]">VSP / Private Pay</p>
              <p className="mt-2 text-sm text-[#706759]">VSP {row.vspShare === null ? "Unavailable" : `${Math.round(row.vspShare)}%`} · Private Pay {row.privatePayMix === null ? "Unavailable" : `${Math.round(row.privatePayMix)}%`}</p>
            </div>
            <div className="rounded-md border border-[#eadfce] bg-white/72 p-4">
              <p className="text-sm font-semibold text-[#172a28]">Program Status</p>
              <p className="mt-2 text-sm text-[#706759]">Tokai {programStatus(row.programs.tokai)} · Modern Frame {programStatus(row.programs.modernFrame)} · ChemClip {programStatus(row.programs.chemclip)}</p>
            </div>
          </div>
        </article>
      </section>

      <section className="mt-8 rounded-md border border-[#d8c49b] bg-[#fffaf1]/88 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">Quality and Service Metrics</p>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <MetricCard icon={ShieldAlert} label="Warranty %" value={`${row.quality.warrantyPct.cm.toFixed(1)}%`} detail={`PM ${row.quality.warrantyPct.pm.toFixed(1)}%`} />
          <MetricCard icon={ShieldAlert} label="Office Redo %" value={`${row.quality.officeRedoPct.cm.toFixed(1)}%`} detail={`PM ${row.quality.officeRedoPct.pm.toFixed(1)}%`} />
          <MetricCard icon={ShieldAlert} label="Lab Redo %" value={`${row.quality.labRedoPct.cm.toFixed(1)}%`} detail={`PM ${row.quality.labRedoPct.pm.toFixed(1)}%`} />
          <MetricCard icon={ShieldAlert} label="Non-Adapt %" value={`${row.quality.nonAdaptPct.cm.toFixed(1)}%`} detail={`PM ${row.quality.nonAdaptPct.pm.toFixed(1)}%`} />
        </div>
      </section>

      <section className="mt-8 rounded-md border border-[#d8c49b] bg-[#fffaf1]/88 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">Opportunity Analysis</p>
        {flags.length === 0 ? (
          <p className="mt-5 rounded-md border border-[#eadfce] bg-white/72 p-4 text-sm text-[#706759]">No urgent account flags are currently detected from available data.</p>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {flags.map((flag) => (
              <article key={flag.title} className="rounded-md border border-[#eadfce] bg-white/72 p-4">
                <h2 className="text-lg font-semibold text-[#172a28]">{flag.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#706759]"><span className="font-semibold text-[#172a28]">Why:</span> {flag.why}</p>
                <p className="mt-2 text-sm leading-6 text-[#706759]"><span className="font-semibold text-[#172a28]">Next:</span> {flag.action}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8 rounded-md border border-[#d8c49b] bg-[#fffaf1]/88 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">Contact and Actions</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {emailHref ? <a href={emailHref} className={adminButtonClass}><Mail className="mr-2 h-4 w-4" /> Email Customer</a> : <span className={`${adminButtonClass} opacity-70`}>No customer email available</span>}
          <AdminCopyButton text={outreachNote(row)} label="Copy Email Draft" className={adminButtonClass} />
          <AdminCopyButton text={`Call ${row.businessName}: ${outreachNote(row)}`} label="Copy Call Notes" className={adminButtonClass} />
          <Link href="/provider-resources" className={adminButtonClass}>Open Provider Resources</Link>
          <Link href="/portal/admin/price-lists" className={adminButtonClass}>Open Price List Assignment</Link>
          <Link href={previewHref(row)} className={adminButtonClass}>Preview Customer Portal</Link>
        </div>
      </section>
    </AdminShell>
  );
}
