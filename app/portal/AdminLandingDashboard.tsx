import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  CircleDollarSign,
  ClipboardCopy,
  Filter,
  Package,
  Search,
  ShieldAlert,
  Target,
  Users,
} from "lucide-react";
import { AdminShell, adminButtonClass } from "@/app/portal/admin/AdminShell";
import { AdminCopyButton } from "@/app/portal/admin/AdminCopyButton";
import {
  getDashboardV1AdminRows,
  getDashboardV1Manifest,
  type DashboardV1AdminRow,
} from "@/lib/portal/adminDashboardV1";

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
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function moneyOrUnavailable(value: number | null) {
  return value === null ? "Unavailable" : `${money(value)}/day`;
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

function customerTypeLabel(code: string) {
  const normalized = code.trim().toUpperCase();
  return customerTypeLabels[normalized] || normalized || "Unclassified";
}

function firstEmail(row: DashboardV1AdminRow) {
  return row.authorizedUserEmails.find(Boolean) || "";
}

function mailto(row: DashboardV1AdminRow, subject = "Checking in from Artisan Lab Network") {
  const email = firstEmail(row);
  if (!email) return "";
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}

function outreachNote(row: DashboardV1AdminRow) {
  if (row.cmJobs < row.pmJobs) {
    return `Your order volume dipped this month, and I wanted to check in to see if anything has changed or if there is anything we can help with.`;
  }
  if (row.cmSales < row.pmSales) {
    return `Your monthly activity changed this month, and I wanted to review whether there is anything Artisan can help support on pricing, product mix, or workflow.`;
  }
  return `I wanted to check in and see whether there are any current needs Artisan can help with for your practice.`;
}

function accountHref(row: DashboardV1AdminRow) {
  return `/portal/admin/account-analysis/${encodeURIComponent(row.acctId)}`;
}

function previewHref(row: DashboardV1AdminRow) {
  return `/portal/admin/preview/${encodeURIComponent(row.acctId)}?returnTo=${encodeURIComponent("/portal/admin")}`;
}

function hasProgramOpportunity(row: DashboardV1AdminRow) {
  return !row.programs.tokai || !row.programs.modernFrame || !row.programs.chemclip;
}

function isHighValueDecliner(row: DashboardV1AdminRow) {
  return row.ppmSales >= 5000 && row.pmSales < row.ppmSales;
}

function isNoCurrentActivity(row: DashboardV1AdminRow) {
  return row.pmJobs > 0 && row.cmJobs === 0;
}

function daysSinceShip(row: DashboardV1AdminRow) {
  if (!row.latestShipDate) return null;
  const shipped = new Date(`${row.latestShipDate}T00:00:00`);
  if (Number.isNaN(shipped.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - shipped.getTime()) / 86_400_000));
}

function noOrdersForAtLeast(row: DashboardV1AdminRow, days: number) {
  const elapsed = daysSinceShip(row);
  return elapsed !== null && elapsed >= days;
}

function jpdDown(row: DashboardV1AdminRow) {
  return row.pmJpd !== null && row.ppmJpd !== null && row.pmJpd < row.ppmJpd;
}

function salesDown(row: DashboardV1AdminRow) {
  return row.pmSales < row.ppmSales;
}

function jobsDown(row: DashboardV1AdminRow) {
  return row.pmJobs < row.ppmJobs;
}

function qualityUp(row: DashboardV1AdminRow, key: keyof DashboardV1AdminRow["quality"]) {
  return row.quality[key].pm > row.quality[key].ppm;
}

function monthlyDecline(value?: { ppm?: number; pm?: number; cm?: number }) {
  return Number(value?.ppm ?? 0) > 0 && Number(value?.pm ?? 0) < Number(value?.ppm ?? 0);
}

function neurolensDown(row: DashboardV1AdminRow) {
  return monthlyDecline(row.brandUsage.neurolens_jobs);
}

function sequelDown(row: DashboardV1AdminRow) {
  return monthlyDecline(row.brandUsage.sequel_jobs);
}

function turnaroundDeteriorated(row: DashboardV1AdminRow) {
  const customerPm = row.turnaroundAverageDays.pm;
  const labPm = row.labTurnaroundAverageDays.pm;
  return customerPm > 0 && labPm > 0 && customerPm > labPm + 1;
}

function preferredDesignJobs(row: DashboardV1AdminRow) {
  return [
    row.brandUsage.hoya_jobs,
    row.brandUsage.shamir_jobs,
    row.brandUsage.tokai_jobs,
    row.brandUsage.varilux_jobs,
    row.brandUsage.neurolens_jobs,
    row.brandUsage.sequel_jobs,
    row.brandUsage.iot_artisan_jobs,
  ].reduce((total, value) => total + Number(value?.pm ?? 0), 0);
}

function preferredMaterialJobs(row: DashboardV1AdminRow) {
  return [
    row.materialUsage.hi_index_160_jobs,
    row.materialUsage.hi_index_167_jobs,
    row.materialUsage.hi_index_174_jobs,
    row.materialUsage.trivex_jobs,
  ].reduce((total, value) => total + Number(value?.pm ?? 0), 0);
}

function programProductCount(row: DashboardV1AdminRow) {
  return Object.values(row.programs).filter(Boolean).length;
}

function customerOpportunityReason(row: DashboardV1AdminRow) {
  const type = row.customerType.toUpperCase();
  if (type === "NL") return "Neurolens customer: look for non-Neurolens expansion and patient education opportunities.";
  if (type === "ACQU") return "Acquios customer: onboarding and alliance-program reinforcement opportunity.";
  if (type === "PART") return "Equity Partner: prioritize partner-focused growth and program adoption recommendations.";
  if (type === "PMP") return "PMP customer: review program utilization and premium-package momentum.";
  if (type === "VSP" || type === "VSP1") return "VSP customer: support VSP education while protecting private-pay opportunity.";
  return "General customer: review adoption gaps for Tokai, Modern Frame, ChemClip, and price-list fit.";
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail?: string;
  icon: typeof CircleDollarSign;
}) {
  return (
    <article className="relative overflow-hidden rounded-md border border-[#d8c49b] bg-[#fffaf1]/88 p-5 shadow-[0_16px_44px_rgba(23,42,40,0.08)]">
      <div className="absolute right-3 top-3 text-[#d8c49b]/70">
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b7650]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#172a28]">
        {value}
      </p>
      {detail ? <p className="mt-2 text-xs leading-5 text-[#706759]">{detail}</p> : null}
    </article>
  );
}

function TrendBadge({ change }: { change: ReturnType<typeof percentChange> }) {
  const tone =
    change.direction === "up"
      ? "border-[#93c9a8] bg-[#f1fbf4] text-[#1f6b45]"
      : change.direction === "down"
        ? "border-[#dfa091] bg-[#fff3ef] text-[#8b3b2d]"
        : "border-[#d8c49b] bg-[#fffaf1] text-[#706759]";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${tone}`}>
      {change.direction === "up" ? <ArrowUpRight className="h-3.5 w-3.5" /> : null}
      {change.direction === "down" ? <ArrowDownRight className="h-3.5 w-3.5" /> : null}
      {change.label}
    </span>
  );
}

function ActionButtons({ row }: { row: DashboardV1AdminRow }) {
  const emailHref = mailto(row);
  const buttonClass = "inline-flex min-h-9 items-center justify-center rounded-full border border-[#d8c49b] bg-white px-3 text-xs font-semibold text-[#172a28] transition hover:bg-[#f4ebe0]";

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Link href={accountHref(row)} className={buttonClass}>
        Open Account Analysis
      </Link>
      <Link href={previewHref(row)} className={buttonClass}>
        Preview Customer Portal
      </Link>
      {emailHref ? (
        <a href={emailHref} className={buttonClass}>
          Email Customer
        </a>
      ) : (
        <span className="inline-flex min-h-9 items-center justify-center rounded-full border border-[#eadfce] bg-[#f8f1e6] px-3 text-xs font-semibold text-[#8b7650]">
          No customer email available
        </span>
      )}
      <AdminCopyButton text={outreachNote(row)} className={buttonClass} />
    </div>
  );
}

function AccountCard({ row }: { row: DashboardV1AdminRow }) {
  const salesChange = percentChange(row.pmSalesPerDay ?? 0, row.ppmSalesPerDay ?? 0);
  const jobsChange = percentChange(row.pmJpd ?? 0, row.ppmJpd ?? 0);

  return (
    <article className="rounded-md border border-[#d8c49b] bg-[#fffaf1]/88 p-5 shadow-[0_16px_44px_rgba(23,42,40,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(23,42,40,0.12)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href={accountHref(row)} className="text-xl font-semibold tracking-[-0.03em] text-[#172a28] underline-offset-4 hover:underline">
            {row.businessName}
          </Link>
          <p className="mt-1 text-sm text-[#706759]">
            {row.acctId} · {customerTypeLabel(row.customerType)} · {row.lab || "Lab unavailable"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <TrendBadge change={salesChange} />
          <TrendBadge change={jobsChange} />
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8b7650]">PM Sales / Day</p>
          <p className="mt-1 text-lg font-semibold text-[#172a28]">{moneyOrUnavailable(row.pmSalesPerDay)}</p>
          <p className="text-xs text-[#706759]">PPM {moneyOrUnavailable(row.ppmSalesPerDay)} · CM pace {moneyOrUnavailable(row.cmSalesPerDay)}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8b7650]">PM Jobs / Day</p>
          <p className="mt-1 text-lg font-semibold text-[#172a28]">{row.pmJpd === null ? "Unavailable" : `${row.pmJpd.toFixed(1)}/day`}</p>
          <p className="text-xs text-[#706759]">PPM {row.ppmJpd === null ? "Unavailable" : `${row.ppmJpd.toFixed(1)}/day`} · CM pace {row.cmJpd === null ? "Unavailable" : `${row.cmJpd.toFixed(1)}/day`}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8b7650]">Last Ship</p>
          <p className="mt-1 text-lg font-semibold text-[#172a28]">{formatDate(row.latestShipDate)}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8b7650]">Portal Users</p>
          <p className="mt-1 text-lg font-semibold text-[#172a28]">{formatCount(row.authorizedUsers)}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-[#706759]">
        Price lists: <span className="font-semibold text-[#172a28]">{row.priceLists || "None assigned"}</span>
      </p>
      <ActionButtons row={row} />
    </article>
  );
}

type QueueItem = {
  title: string;
  rows: DashboardV1AdminRow[];
  currentLabel: (row: DashboardV1AdminRow) => string;
  priorLabel: (row: DashboardV1AdminRow) => string;
  reason: (row: DashboardV1AdminRow) => string;
  action: (row: DashboardV1AdminRow) => string;
};

function QueueSection({ item }: { item: QueueItem }) {
  return (
    <section className="scroll-mt-24 rounded-md border border-[#d8c49b] bg-[#fffaf1]/88 p-5 shadow-[0_18px_55px_rgba(23,42,40,0.08)] sm:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">Deep-Dive Queue</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-[#172a28]">{item.title}</h2>
        </div>
        <span className="inline-flex w-fit rounded-full border border-[#d8c49b] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#706759]">
          {formatCount(item.rows.length)} flagged
        </span>
      </div>
      {item.rows.length === 0 ? (
        <p className="mt-5 rounded-md border border-[#eadfce] bg-white/72 p-4 text-sm text-[#706759]">No accounts currently match this queue.</p>
      ) : (
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {item.rows.slice(0, 12).map((row) => {
            const salesChange = percentChange(row.cmSales, row.pmSales);
            return (
              <article key={`${item.title}-${row.acctId}`} className="rounded-md border border-[#eadfce] bg-white/78 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <Link href={accountHref(row)} className="font-semibold text-[#172a28] underline-offset-4 hover:underline">
                      {row.businessName}
                    </Link>
                    <p className="mt-1 text-xs text-[#706759]">
                      {customerTypeLabel(row.customerType)} · {row.lab || "Lab unavailable"}
                    </p>
                  </div>
                  <TrendBadge change={salesChange} />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <p className="text-sm text-[#706759]">
                    Current: <span className="font-semibold text-[#172a28]">{item.currentLabel(row)}</span>
                  </p>
                  <p className="text-sm text-[#706759]">
                    Prior: <span className="font-semibold text-[#172a28]">{item.priorLabel(row)}</span>
                  </p>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#706759]">
                  <span className="font-semibold text-[#172a28]">Why flagged:</span> {item.reason(row)}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#706759]">
                  <span className="font-semibold text-[#172a28]">Recommended action:</span> {item.action(row)}
                </p>
                <ActionButtons row={row} />
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function SectionJumpNav() {
  const links = [
    ["Overview", "#overview"],
    ["Down Accounts", "#down-accounts"],
    ["Opportunities", "#opportunities"],
    ["No Activity", "#no-activity"],
    ["Account Search", "#account-search"],
  ] as const;

  return (
    <nav className="sticky top-3 z-20 mt-6 rounded-md border border-[#d8c49b] bg-[#fffaf1]/92 p-2 shadow-[0_18px_50px_rgba(23,42,40,0.1)] backdrop-blur">
      <div className="flex items-center gap-2 overflow-x-auto">
        <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#172a28] px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white">
          <Filter className="h-3.5 w-3.5" /> Filters
        </span>
        {links.map(([label, href]) => (
          <a key={href} href={href} className="whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#59635f] transition hover:bg-[#172a28] hover:text-white">
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}

export default function AdminLandingDashboard({
  adminEmail,
  query,
  divisionFilter,
  labFilter,
  priceListFilter = "",
  userFilter = "",
  activityFilter = "",
  trendFilter = "",
  opportunityFilter = "",
}: {
  adminEmail: string;
  query: string;
  divisionFilter: string;
  labFilter: string;
  priceListFilter?: string;
  userFilter?: string;
  activityFilter?: string;
  trendFilter?: string;
  opportunityFilter?: string;
}) {
  const rows = getDashboardV1AdminRows();
  const manifest = getDashboardV1Manifest();
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedDivisionFilter = divisionFilter.trim().toUpperCase();
  const normalizedLabFilter = labFilter.trim().toUpperCase();
  const normalizedPriceListFilter = priceListFilter.trim().toUpperCase();
  const typeOptions = [...new Set(rows.map((row) => row.customerType).filter(Boolean))].sort();
  const labOptions = [...new Set(rows.map((row) => row.lab).filter((value) => value && value !== "—"))].sort();
  const priceListOptions = [...new Set(rows.flatMap((row) => row.priceListCodes))].sort();

  const filtered = rows.filter((row) => {
    if (normalizedDivisionFilter && row.customerType.toUpperCase() !== normalizedDivisionFilter) return false;
    if (normalizedLabFilter && row.lab.toUpperCase() !== normalizedLabFilter) return false;
    if (normalizedPriceListFilter && !row.priceListCodes.includes(normalizedPriceListFilter)) return false;
    if (userFilter === "has-user" && row.authorizedUsers === 0) return false;
    if (userFilter === "no-user" && row.authorizedUsers > 0) return false;
    if (activityFilter === "active" && row.cmJobs <= 0) return false;
    if (activityFilter === "no-current" && row.cmJobs > 0) return false;
    if (trendFilter === "sales-down" && !salesDown(row)) return false;
    if (trendFilter === "jobs-down" && !jobsDown(row)) return false;
    if (trendFilter === "jpd-down" && !jpdDown(row)) return false;
    if (trendFilter === "neurolens-down" && !neurolensDown(row)) return false;
    if (trendFilter === "sequel-down" && !sequelDown(row)) return false;
    if (trendFilter === "turnaround-up" && !turnaroundDeteriorated(row)) return false;
    if (trendFilter === "no-activity" && !isNoCurrentActivity(row)) return false;
    if (trendFilter === "no-orders-60" && !noOrdersForAtLeast(row, 60)) return false;
    if (trendFilter === "no-orders-90" && !noOrdersForAtLeast(row, 90)) return false;
    if (opportunityFilter === "program" && !hasProgramOpportunity(row)) return false;
    if (opportunityFilter === "preferred-designs" && preferredDesignJobs(row) > 0) return false;
    if (opportunityFilter === "preferred-materials" && preferredMaterialJobs(row) > 0) return false;
    if (opportunityFilter === "program-products" && programProductCount(row) > 0) return false;
    if (opportunityFilter === "high-value-decliner" && !isHighValueDecliner(row)) return false;
    if (opportunityFilter === "missing-price-lists" && row.priceListCodes.length > 0) return false;
    if (!normalizedQuery) return true;
    return [
      row.businessName,
      row.acctId,
      row.accountNumbers,
      row.division,
      row.customerType,
      row.salesRep,
      row.lab,
      row.priceLists,
      row.authorizedUserEmails.join(" "),
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });

  const totalCmSales = rows.reduce((total, row) => total + row.cmSales, 0);
  const totalCmJobs = rows.reduce((total, row) => total + row.cmJobs, 0);
  const activeAccounts = rows.filter((row) => row.cmJobs > 0);
  const salesDownRows = rows.filter(salesDown);
  const jobsDownRows = rows.filter(jobsDown);
  const jpdDownRows = rows.filter(jpdDown);
  const neurolensDownRows = rows.filter(neurolensDown);
  const sequelDownRows = rows.filter(sequelDown);
  const turnaroundDeterioratedRows = rows.filter(turnaroundDeteriorated);
  const noActivityRows = rows.filter(isNoCurrentActivity);
  const noOrders30Rows = rows.filter((row) => noOrdersForAtLeast(row, 30));
  const noOrders60Rows = rows.filter((row) => noOrdersForAtLeast(row, 60));
  const noOrders90Rows = rows.filter((row) => noOrdersForAtLeast(row, 90));
  const notUsingPreferredDesignRows = rows.filter((row) => row.pmJobs > 0 && preferredDesignJobs(row) === 0);
  const notUsingPreferredMaterialRows = rows.filter((row) => row.pmJobs > 0 && preferredMaterialJobs(row) === 0);
  const notUsingProgramProductRows = rows.filter((row) => row.pmJobs > 0 && programProductCount(row) === 0);
  const noUserRows = rows.filter((row) => row.authorizedUsers === 0);
  const missingPriceListRows = rows.filter((row) => row.priceListCodes.length === 0);
  const highValueDecliners = rows.filter(isHighValueDecliner).sort((a, b) => (b.ppmSales - b.pmSales) - (a.ppmSales - a.pmSales));
  const topGrowthAccounts = [...rows].sort((a, b) => percentChange(b.pmSales, b.ppmSales).value - percentChange(a.pmSales, a.ppmSales).value).slice(0, 5);
  const topDecliningAccounts = [...salesDownRows].sort((a, b) => percentChange(a.pmSales, a.ppmSales).value - percentChange(b.pmSales, b.ppmSales).value).slice(0, 5);

  const queues: Array<QueueItem & { id: string }> = [
    {
      id: "down-accounts",
      title: "Customers with PM sales down vs PPM",
      rows: salesDownRows.sort((a, b) => (b.ppmSales - b.pmSales) - (a.ppmSales - a.pmSales)),
      currentLabel: (row) => money(row.pmSales),
      priorLabel: (row) => money(row.ppmSales),
      reason: (row) => `Previous-month sales are ${percentChange(row.pmSales, row.ppmSales).label} versus prior previous month. CM pace is ${money(row.cmSales)}.`,
      action: () => "Open account analysis, review order mix, and contact the customer if the PM decline is meaningful.",
    },
    {
      id: "jobs-down",
      title: "Customers with PM jobs down vs PPM",
      rows: jobsDownRows.sort((a, b) => (b.ppmJobs - b.pmJobs) - (a.ppmJobs - a.pmJobs)),
      currentLabel: (row) => formatCount(row.pmJobs),
      priorLabel: (row) => formatCount(row.ppmJobs),
      reason: (row) => `Previous-month jobs are ${percentChange(row.pmJobs, row.ppmJobs).label} versus prior previous month.`,
      action: () => "Use JPD queue first, then check ordering behavior, staffing, or competing lab usage.",
    },
    {
      id: "jpd-down",
      title: "Largest PM JPD declines vs PPM",
      rows: jpdDownRows.sort((a, b) => percentChange(a.pmJpd ?? 0, a.ppmJpd ?? 0).value - percentChange(b.pmJpd ?? 0, b.ppmJpd ?? 0).value),
      currentLabel: (row) => row.pmJpd?.toFixed(1) ?? "Unavailable",
      priorLabel: (row) => row.ppmJpd?.toFixed(1) ?? "Unavailable",
      reason: (row) => `PM JPD is ${percentChange(row.pmJpd ?? 0, row.ppmJpd ?? 0).label} versus PPM JPD.`,
      action: () => "Prioritize these accounts for staff retraining, marketing support, or multiple-pair promotion support.",
    },
    {
      id: "neurolens-down",
      title: "Customers with Neurolens decline",
      rows: neurolensDownRows,
      currentLabel: (row) => formatCount(row.brandUsage.neurolens_jobs?.pm ?? 0),
      priorLabel: (row) => formatCount(row.brandUsage.neurolens_jobs?.ppm ?? 0),
      reason: () => "Previous-month Neurolens jobs are lower than prior previous month.",
      action: () => "Review whether Neurolens activity needs staff education, ordering support, or patient conversation tools.",
    },
    {
      id: "sequel-down",
      title: "Customers with Sequel decline",
      rows: sequelDownRows,
      currentLabel: (row) => formatCount(row.brandUsage.sequel_jobs?.pm ?? 0),
      priorLabel: (row) => formatCount(row.brandUsage.sequel_jobs?.ppm ?? 0),
      reason: () => "Previous-month Sequel jobs are lower than prior previous month.",
      action: () => "Check Sequel PAL ordering patterns and rewards-qualified activity before outreach.",
    },
    {
      id: "turnaround-up",
      title: "Customers worse than lab average turnaround",
      rows: turnaroundDeterioratedRows,
      currentLabel: (row) => `${row.turnaroundAverageDays.pm.toFixed(1)} days`,
      priorLabel: (row) => `${row.labTurnaroundAverageDays.pm.toFixed(1)} days`,
      reason: () => "Previous-month customer turnaround is more than 1 business day worse than the entire lab average.",
      action: () => "Review service timing and proactively communicate with accounts where delays may affect experience.",
    },
    {
      id: "no-activity",
      title: "No orders 30+ days",
      rows: noOrders30Rows.sort((a, b) => (daysSinceShip(b) ?? 0) - (daysSinceShip(a) ?? 0)),
      currentLabel: (row) => `${daysSinceShip(row) ?? "—"} days`,
      priorLabel: (row) => formatDate(row.latestShipDate),
      reason: () => "No shipped orders have been recorded for at least 30 days.",
      action: () => "Contact the account quickly to confirm whether ordering has paused or moved elsewhere.",
    },
    {
      id: "no-orders-60",
      title: "No orders 60+ days",
      rows: noOrders60Rows.sort((a, b) => (daysSinceShip(b) ?? 0) - (daysSinceShip(a) ?? 0)),
      currentLabel: (row) => `${daysSinceShip(row) ?? "—"} days`,
      priorLabel: (row) => formatDate(row.latestShipDate),
      reason: () => "No shipped orders have been recorded for at least 60 days.",
      action: () => "Prioritize outreach and verify whether the account is inactive, paused, or ordering elsewhere.",
    },
    {
      id: "no-orders-90",
      title: "No orders 90+ days",
      rows: noOrders90Rows.sort((a, b) => (daysSinceShip(b) ?? 0) - (daysSinceShip(a) ?? 0)),
      currentLabel: (row) => `${daysSinceShip(row) ?? "—"} days`,
      priorLabel: (row) => formatDate(row.latestShipDate),
      reason: () => "No shipped orders have been recorded for at least 90 days.",
      action: () => "Treat as a reactivation account and confirm status before routine growth outreach.",
    },
    {
      id: "quality",
      title: "Customers with remake, redo, or warranty increases",
      rows: rows.filter((row) => qualityUp(row, "labRedoPct") || qualityUp(row, "officeRedoPct") || qualityUp(row, "warrantyPct") || qualityUp(row, "nonAdaptPct")),
      currentLabel: (row) => `PM Warranty ${row.quality.warrantyPct.pm.toFixed(1)}% · Office ${row.quality.officeRedoPct.pm.toFixed(1)}%`,
      priorLabel: (row) => `PPM Warranty ${row.quality.warrantyPct.ppm.toFixed(1)}% · Office ${row.quality.officeRedoPct.ppm.toFixed(1)}%`,
      reason: () => "One or more remake/service rates increased in PM versus PPM.",
      action: () => "Review remake patterns and schedule proactive lab support where needed.",
    },
    {
      id: "preferred-designs",
      title: "Not using preferred designs",
      rows: notUsingPreferredDesignRows.sort((a, b) => b.pmJobs - a.pmJobs),
      currentLabel: (row) => `${formatCount(preferredDesignJobs(row))} PM preferred design jobs`,
      priorLabel: (row) => `${formatCount(row.pmJobs)} PM total jobs`,
      reason: () => "No PM usage was found for preferred design families in the current account intelligence fields.",
      action: () => "Review design recommendations and identify one preferred-design adoption path.",
    },
    {
      id: "preferred-materials",
      title: "Not using preferred materials",
      rows: notUsingPreferredMaterialRows.sort((a, b) => b.pmJobs - a.pmJobs),
      currentLabel: (row) => `${formatCount(preferredMaterialJobs(row))} PM preferred material jobs`,
      priorLabel: (row) => `${formatCount(row.pmJobs)} PM total jobs`,
      reason: () => "No PM usage was found for Trivex or high-index material fields.",
      action: () => "Review material recommendation opportunities based on patient Rx and lifestyle needs.",
    },
    {
      id: "program-products",
      title: "Not using program products",
      rows: notUsingProgramProductRows.sort((a, b) => b.pmJobs - a.pmJobs),
      currentLabel: (row) => `${formatCount(programProductCount(row))} active programs`,
      priorLabel: (row) => `${formatCount(row.pmJobs)} PM jobs`,
      reason: () => "No Modern Package, Modern Frame, ChemClip, SpecCheck, or Tokai usage flags are active.",
      action: () => "Pick one program with a clear use case; do not send generic program advertising.",
    },
    {
      id: "opportunities",
      title: "Program opportunities by customer type",
      rows: rows.filter(hasProgramOpportunity).slice(0, 60),
      currentLabel: (row) => customerTypeLabel(row.customerType),
      priorLabel: (row) => row.priceLists || "No assigned price lists",
      reason: customerOpportunityReason,
      action: () => "Use account analysis to choose one program-specific outreach angle instead of a generic check-in.",
    },
  ];

  return (
    <AdminShell title="Customer Intelligence Command Center" adminEmail={adminEmail}>
      <SectionJumpNav />

      <section id="overview" className="mt-8 overflow-hidden rounded-md border border-[#d8c49b] bg-[#172a28] p-6 text-white shadow-[0_28px_90px_rgba(23,42,40,0.22)] sm:p-8">
        <div className="absolute" />
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d8c49b]">
              Internal Account Management · Customer Success · Sales Intervention
            </p>
            <h2 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              Find the customers in a bad way, understand why, and act fast.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/72">
              Snapshot generated {formatDateTime(manifest?.generated_at)} · Data refresh {formatDate(manifest?.data_refresh_date)} · Logged in as {adminEmail}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/portal?mode=customer" className={adminButtonClass}>View My Customer Portal</Link>
            <Link href="/portal/admin/price-lists" className={adminButtonClass}>All Price Lists</Link>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={Users} label="Total Accounts" value={formatCount(rows.length)} />
        <StatCard icon={BadgeCheck} label="Active This Month" value={formatCount(activeAccounts.length)} />
        <StatCard icon={CircleDollarSign} label="CM Sales Pace" value={money(totalCmSales)} />
        <StatCard icon={Package} label="CM Jobs Pace" value={formatCount(totalCmJobs)} />
        <StatCard icon={ShieldAlert} label="No Portal Users" value={formatCount(noUserRows.length)} />
        <StatCard icon={ArrowDownRight} label="PM Sales Down" value={formatCount(salesDownRows.length)} />
        <StatCard icon={ArrowDownRight} label="PM Jobs Down" value={formatCount(jobsDownRows.length)} />
        <StatCard icon={Activity} label="PM JPD Down" value={formatCount(jpdDownRows.length)} detail="PM JPD vs PPM JPD." />
        <StatCard icon={ArrowDownRight} label="Neurolens Down" value={formatCount(neurolensDownRows.length)} />
        <StatCard icon={ArrowDownRight} label="Sequel Down" value={formatCount(sequelDownRows.length)} />
        <StatCard icon={Activity} label="Turnaround Up" value={formatCount(turnaroundDeterioratedRows.length)} />
        <StatCard icon={AlertTriangle} label="No Current Activity" value={formatCount(noActivityRows.length)} />
        <StatCard icon={AlertTriangle} label="No Orders 30+ Days" value={formatCount(noOrders30Rows.length)} />
        <StatCard icon={AlertTriangle} label="No Orders 60+ Days" value={formatCount(noOrders60Rows.length)} />
        <StatCard icon={AlertTriangle} label="No Orders 90+ Days" value={formatCount(noOrders90Rows.length)} />
        <StatCard icon={Target} label="No Preferred Designs" value={formatCount(notUsingPreferredDesignRows.length)} />
        <StatCard icon={Target} label="No Preferred Materials" value={formatCount(notUsingPreferredMaterialRows.length)} />
        <StatCard icon={Target} label="No Program Products" value={formatCount(notUsingProgramProductRows.length)} />
        <StatCard icon={ClipboardCopy} label="Missing Price Lists" value={formatCount(missingPriceListRows.length)} />
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-2">
        <div className="rounded-md border border-[#d8c49b] bg-[#fffaf1]/88 p-5 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">Top PM Growth Accounts</p>
          <div className="mt-4 grid gap-3">
            {topGrowthAccounts.map((row) => (
              <Link key={`growth-${row.acctId}`} href={accountHref(row)} className="flex items-center justify-between gap-3 rounded-md border border-[#eadfce] bg-white/75 p-3 transition hover:bg-white">
                <span className="font-semibold text-[#172a28]">{row.businessName}</span>
                <TrendBadge change={percentChange(row.pmSales, row.ppmSales)} />
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-[#d8c49b] bg-[#fffaf1]/88 p-5 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">Top PM Declining Accounts</p>
          <div className="mt-4 grid gap-3">
            {topDecliningAccounts.map((row) => (
              <Link key={`decline-${row.acctId}`} href={accountHref(row)} className="flex items-center justify-between gap-3 rounded-md border border-[#eadfce] bg-white/75 p-3 transition hover:bg-white">
                <span className="font-semibold text-[#172a28]">{row.businessName}</span>
                <TrendBadge change={percentChange(row.pmSales, row.ppmSales)} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="account-search" className="mt-8 scroll-mt-24 rounded-md border border-[#d8c49b] bg-[#fffaf1]/88 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">Customer-by-Customer Analysis</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-[#172a28]">Master account intelligence view</h2>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d8c49b] bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#706759]">
            <Search className="h-3.5 w-3.5" /> {formatCount(filtered.length)} accounts
          </span>
        </div>
        <form className="mt-7 flex flex-wrap items-end gap-3">
          <input name="q" defaultValue={query} placeholder="Search account, email, lab, price list" className="min-h-12 min-w-64 flex-1 rounded-md border border-[#d8c49b] bg-[#fffaf1] px-4 text-sm text-[#172a28] outline-none transition focus:border-[#172a28]" />
          <select name="division" defaultValue={divisionFilter} className="min-h-12 w-full rounded-md border border-[#d8c49b] bg-[#fffaf1] px-3 text-sm text-[#172a28] outline-none transition focus:border-[#172a28] sm:w-44">
            <option value="">All Types</option>
            {typeOptions.map((option) => <option key={option} value={option}>{customerTypeLabel(option)}</option>)}
          </select>
          <select name="lab" defaultValue={labFilter} className="min-h-12 w-full rounded-md border border-[#d8c49b] bg-[#fffaf1] px-3 text-sm text-[#172a28] outline-none transition focus:border-[#172a28] sm:w-44">
            <option value="">All Labs</option>
            {labOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <select name="priceList" defaultValue={priceListFilter} className="min-h-12 w-full rounded-md border border-[#d8c49b] bg-[#fffaf1] px-3 text-sm text-[#172a28] outline-none transition focus:border-[#172a28] sm:w-44">
            <option value="">All Lists</option>
            {priceListOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <select name="hasUser" defaultValue={userFilter} className="min-h-12 w-full rounded-md border border-[#d8c49b] bg-[#fffaf1] px-3 text-sm text-[#172a28] outline-none transition focus:border-[#172a28] sm:w-44">
            <option value="">All Users</option>
            <option value="has-user">Has User</option>
            <option value="no-user">No User</option>
          </select>
          <select name="activity" defaultValue={activityFilter} className="min-h-12 w-full rounded-md border border-[#d8c49b] bg-[#fffaf1] px-3 text-sm text-[#172a28] outline-none transition focus:border-[#172a28] sm:w-44">
            <option value="">All Activity</option>
            <option value="active">Current Activity</option>
            <option value="no-current">No Current Activity</option>
          </select>
          <select name="trend" defaultValue={trendFilter} className="min-h-12 w-full rounded-md border border-[#d8c49b] bg-[#fffaf1] px-3 text-sm text-[#172a28] outline-none transition focus:border-[#172a28] sm:w-44">
            <option value="">All Trends</option>
            <option value="sales-down">Sales Down</option>
            <option value="jobs-down">Jobs Down</option>
            <option value="jpd-down">JPD Down</option>
            <option value="neurolens-down">Neurolens Down</option>
            <option value="sequel-down">Sequel Down</option>
            <option value="turnaround-up">Turnaround Up</option>
            <option value="no-activity">No Activity</option>
            <option value="no-orders-60">No Orders 60+</option>
            <option value="no-orders-90">No Orders 90+</option>
          </select>
          <select name="opportunity" defaultValue={opportunityFilter} className="min-h-12 w-full rounded-md border border-[#d8c49b] bg-[#fffaf1] px-3 text-sm text-[#172a28] outline-none transition focus:border-[#172a28] sm:w-48">
            <option value="">All Opportunities</option>
            <option value="program">Program Gaps</option>
            <option value="preferred-designs">Preferred Design Gaps</option>
            <option value="preferred-materials">Preferred Material Gaps</option>
            <option value="program-products">Program Product Gaps</option>
            <option value="high-value-decliner">High-Value Decliner</option>
            <option value="missing-price-lists">Missing Price Lists</option>
          </select>
          <button className="min-h-12 rounded-full bg-[#172a28] px-6 text-sm font-semibold text-white transition hover:bg-[#27433f]">
            Apply
          </button>
        </form>
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {filtered.slice(0, 80).map((row) => <AccountCard key={row.acctId} row={row} />)}
        </div>
      </section>

      <section className="mt-8 grid gap-5" id="down-accounts">
        {queues.map((item) => (
          <div id={item.id} key={item.id} className="scroll-mt-24">
            <QueueSection item={item} />
          </div>
        ))}
      </section>

      <section className="mt-8 rounded-md border border-[#d8c49b] bg-[#fffaf1]/88 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">Portal Adoption Issues</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <StatCard icon={ShieldAlert} label="Accounts with no authorized users" value={formatCount(noUserRows.length)} />
          <StatCard icon={ClipboardCopy} label="Assigned sheets but no users" value={formatCount(rows.filter((row) => row.priceListCodes.length > 0 && row.authorizedUsers === 0).length)} />
          <StatCard icon={ArrowDownRight} label="High-value decliners" value={formatCount(highValueDecliners.length)} detail="PPM sales at or above $5,000 with previous-month sales decline." />
        </div>
      </section>
    </AdminShell>
  );
}
