import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Building2,
  CircleDollarSign,
  ClipboardCopy,
  Package,
  Search,
  ShieldAlert,
  Target,
  UserRound,
  Users,
} from "lucide-react";
import { AdminCopyButton } from "@/app/portal/admin/AdminCopyButton";
import { AdminShell, adminButtonClass } from "@/app/portal/admin/AdminShell";
import {
  getDashboardV1AdminRows,
  getDashboardV1Manifest,
  type DashboardV1AdminRow,
} from "@/lib/portal/adminDashboardV1";
import {
  comparePortalAccount,
  comparisonConfidenceNote,
  sortJpdWatchlist,
  type ComparisonMode,
  type JpdSeverity,
  type PortalComparison,
} from "@/lib/portal/portalComparisons";
import {
  filterRowsForPortalRole,
  type PortalStaffRole,
} from "@/lib/portal/portalRoles";

type DashboardQuery = {
  q?: string;
  division?: string;
  lab?: string;
  rep?: string;
  priceList?: string;
  hasUser?: string;
  activity?: string;
  trend?: string;
  opportunity?: string;
  severity?: string;
  minimumBaselineJpd?: string;
  minimumJpdLost?: string;
  email?: string;
};

type ComparedRow = {
  row: DashboardV1AdminRow;
  comparison: PortalComparison;
};

const customerTypeLabels: Record<string, string> = {
  ACQU: "Acquios Alliance",
  PART: "Partner",
  GENL: "General Customer",
  PMP: "PMP Customer",
  NL: "Neurolens Customer",
  VSP: "VSP Customer",
  VSP1: "VSP Customer",
};

const severityStyles: Record<JpdSeverity, string> = {
  critical: "border-[#d47763] bg-[#fff1ed] text-[#8b3325]",
  high: "border-[#d8a15e] bg-[#fff7e8] text-[#865719]",
  watch: "border-[#c8b36d] bg-[#fffbed] text-[#76621e]",
  "low-volume": "border-[#b9b3a6] bg-[#f8f4eb] text-[#706759]",
  none: "border-[#d8c49b] bg-white text-[#706759]",
};

function number(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(value);
}

function money(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits,
  }).format(value);
}

function date(value?: string) {
  if (!value) return "Unavailable";
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? value
    : new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(parsed);
}

function customerTypeLabel(value: string) {
  const code = value.trim().toUpperCase();
  return customerTypeLabels[code] || code || "Unclassified";
}

function jpd(value: number | null) {
  return value === null ? "Unavailable" : value.toFixed(2);
}

function signed(value: number | null, suffix = "") {
  if (value === null) return "Unavailable";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}${suffix}`;
}

function percent(value: number | null) {
  if (value === null) return "Unavailable";
  return `${value > 0 ? "+" : ""}${(value * 100).toFixed(1)}%`;
}

function daysSinceShip(row: DashboardV1AdminRow) {
  if (!row.latestShipDate) return null;
  const shipped = new Date(`${row.latestShipDate}T00:00:00`);
  if (Number.isNaN(shipped.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - shipped.getTime()) / 86_400_000));
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
  return Number(row.materialUsage.trivex_jobs?.pm ?? 0);
}

function hasProgramProducts(row: DashboardV1AdminRow) {
  return Object.values(row.programs).some(Boolean);
}

function flagsFor(item: ComparedRow) {
  const { row, comparison } = item;
  const days = daysSinceShip(row);
  return [
    row.authorizedUsers === 0 ? "No portal user" : "",
    comparison.comparisonJobs === 0 ? "No current activity" : "",
    days !== null && days >= 90
      ? "No orders 90+"
      : days !== null && days >= 60
        ? "No orders 60+"
        : days !== null && days >= 30
          ? "No orders 30+"
          : "",
    preferredDesignJobs(row) === 0 ? "No preferred designs" : "",
    preferredMaterialJobs(row) === 0 ? "No preferred materials" : "",
    !hasProgramProducts(row) ? "No program products" : "",
    row.priceListCodes.length === 0 ? "Missing price lists" : "",
    comparison.projectedJobsAtRisk >= 20 ||
    comparison.projectedSalesAtRisk >= 5000
      ? "High-value decliner"
      : "",
  ].filter(Boolean);
}

function repDisplay(row: DashboardV1AdminRow) {
  return row.salesRep || "Unassigned";
}

function firstEmail(row: DashboardV1AdminRow) {
  return row.authorizedUserEmails.find(Boolean) || "";
}

function accountHref(row: DashboardV1AdminRow, mode: ComparisonMode) {
  return `/portal/admin/account-analysis/${encodeURIComponent(row.acctId)}?view=${mode}`;
}

function previewHref(row: DashboardV1AdminRow, mode: ComparisonMode) {
  const returnTo = `/portal/admin?view=${mode}`;
  return `/portal/admin/preview/${encodeURIComponent(row.acctId)}?returnTo=${encodeURIComponent(returnTo)}`;
}

function outreachNote(item: ComparedRow) {
  const { row, comparison } = item;
  const reasonFlags = flagsFor(item).slice(0, 3).join(", ");

  if (comparison.mode === "pm-vs-ppm") {
    return `${row.businessName} was down from ${jpd(comparison.baselineJpd)} PPM JPD to ${jpd(comparison.comparisonJpd)} PM JPD, a decline of ${comparison.jobsPerDayLost.toFixed(2)} jobs/day. Last ship was ${date(row.latestShipDate)}.${reasonFlags ? ` Signals: ${reasonFlags}.` : ""} Recommended action: review ordering pattern, confirm pricing/program setup, and schedule a quick check-in.`;
  }

  return `${row.businessName} is pacing below last month, currently at ${jpd(comparison.comparisonJpd)} CM JPD vs ${jpd(comparison.baselineJpd)} PM JPD. That is ${comparison.jobsPerDayLost.toFixed(2)} jobs/day below pace, with approximately ${number(comparison.projectedJobsAtRisk)} jobs at risk this month. Last ship was ${date(row.latestShipDate)}.${reasonFlags ? ` Signals: ${reasonFlags}.` : ""} Recommended action: contact today and confirm whether cases are being sent elsewhere or if there is an ordering issue.`;
}

function urlFor(mode: ComparisonMode, query: DashboardQuery, overrides: DashboardQuery = {}) {
  const params = new URLSearchParams({ view: mode });
  for (const [key, value] of Object.entries({ ...query, ...overrides })) {
    if (value) params.set(key, value);
  }
  return `/portal/admin?${params.toString()}`;
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  urgent = false,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Activity;
  urgent?: boolean;
}) {
  return (
    <article
      className={`rounded-md border p-5 shadow-[0_16px_44px_rgba(23,42,40,0.08)] ${
        urgent
          ? "border-[#d47763] bg-[#fff4ef]"
          : "border-[#d8c49b] bg-[#fffaf1]/88"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b7650]">
          {label}
        </p>
        <Icon className="h-5 w-5 text-[#b89a61]" />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#172a28]">
        {value}
      </p>
      <p className="mt-2 text-xs leading-5 text-[#706759]">{detail}</p>
    </article>
  );
}

function ModeToggle({
  mode,
  query,
}: {
  mode: ComparisonMode;
  query: DashboardQuery;
}) {
  return (
    <div className="rounded-md border border-[#d8c49b] bg-[#fffaf1] p-2">
      <div className="grid gap-2 sm:grid-cols-2">
        {[
          ["pm-vs-ppm", "PM vs PPM", "Completed month comparison"],
          ["cm-vs-pm", "CM vs PM", "Current pace comparison"],
        ].map(([value, label, helper]) => {
          const selected = value === mode;
          return (
            <Link
              key={value}
              href={urlFor(value as ComparisonMode, query)}
              aria-current={selected ? "page" : undefined}
              className={`rounded-md px-4 py-3 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#172a28] ${
                selected
                  ? "bg-[#172a28] text-white shadow-sm"
                  : "bg-white text-[#172a28] hover:bg-[#f4ebe0]"
              }`}
            >
              <span className="block text-sm font-semibold">{label}</span>
              <span
                className={`mt-1 block text-xs ${
                  selected ? "text-white/68" : "text-[#706759]"
                }`}
              >
                {helper}
              </span>
            </Link>
          );
        })}
      </div>
      <p className="px-2 pt-2 text-xs text-[#706759]">
        {comparisonConfidenceNote(mode)}
      </p>
    </div>
  );
}

function AccountCommandStrip({
  mode,
  query,
  options,
  visibleCount,
  totalCount,
}: {
  mode: ComparisonMode;
  query: DashboardQuery;
  options: {
    divisions: string[];
    labs: string[];
    reps: string[];
    priceLists: string[];
  };
  visibleCount: number;
  totalCount: number;
}) {
  return (
    <section className="mt-6 rounded-md border border-[#d8c49b] bg-[#fffaf1]/92 p-4 shadow-[0_16px_44px_rgba(23,42,40,0.08)] sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">
            Account Jump
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#172a28]">
            Search or filter an account first.
          </h2>
          <p className="mt-1 text-sm text-[#706759]">
            Showing {number(visibleCount)} of {number(totalCount)} visible accounts.
          </p>
        </div>
        <form className="grid flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1.4fr)_repeat(4,minmax(130px,1fr))_auto]">
          <input type="hidden" name="view" value={mode} />
          <input
            name="q"
            defaultValue={query.q}
            placeholder="Account, practice, email, lab, rep"
            className="min-h-11 rounded-full border border-[#d8c49b] bg-white px-4 text-sm text-[#172a28] outline-none focus:border-[#172a28]"
          />
          <Select name="division" value={query.division} label="All Types" options={options.divisions} />
          <Select name="lab" value={query.lab} label="All Labs" options={options.labs} />
          <Select name="rep" value={query.rep} label="All Reps" options={options.reps} />
          <Select name="priceList" value={query.priceList} label="All Lists" options={options.priceLists} />
          <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#172a28] px-5 text-sm font-semibold text-white transition hover:bg-[#27433f]">
            <Search className="h-4 w-4" /> Find
          </button>
        </form>
      </div>
    </section>
  );
}

function hasActiveAccountJumpFilter(query: DashboardQuery) {
  return Boolean(
    query.q ||
      query.division ||
      query.lab ||
      query.rep ||
      query.priceList
  );
}

function ActionButtons({ item, mode }: { item: ComparedRow; mode: ComparisonMode }) {
  const email = firstEmail(item.row);
  const buttonClass =
    "inline-flex min-h-9 items-center justify-center rounded-full border border-[#d8c49b] bg-white px-3 text-xs font-semibold text-[#172a28] transition hover:bg-[#f4ebe0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#172a28]";

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Link href={accountHref(item.row, mode)} className={buttonClass}>
        Open Account Analysis
      </Link>
      <Link href={previewHref(item.row, mode)} className={buttonClass}>
        Preview Customer Portal
      </Link>
      {email ? (
        <a
          href={`mailto:${email}?subject=${encodeURIComponent("Checking in from Artisan Lab Network")}`}
          className={buttonClass}
        >
          Email Customer
        </a>
      ) : (
        <span className="inline-flex min-h-9 items-center px-2 text-xs font-semibold text-[#8b7650]">
          No customer email available
        </span>
      )}
      <AdminCopyButton
        text={outreachNote(item)}
        label="Copy Outreach Note"
        className={buttonClass}
      />
    </div>
  );
}

function AccountResultList({
  items,
  mode,
  title = "Matched Accounts",
}: {
  items: ComparedRow[];
  mode: ComparisonMode;
  title?: string;
}) {
  return (
    <section className="mt-5 rounded-md border border-[#d8c49b] bg-[#fffaf1]/88 p-5 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">
            Account Results
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[#172a28]">
            {title}
          </h2>
        </div>
        <span className="rounded-full border border-[#d8c49b] bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#706759]">
          {items.length} match{items.length === 1 ? "" : "es"}
        </span>
      </div>
      <div className="mt-4 grid gap-3">
        {items.length ? (
          items.slice(0, 12).map((item) => {
            const { row, comparison } = item;

            return (
              <article
                key={row.acctId}
                className="rounded-md border border-[#eadfce] bg-white/82 p-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <Link
                      href={accountHref(row, mode)}
                      className="text-lg font-semibold text-[#172a28] underline-offset-4 hover:underline"
                    >
                      {row.businessName}
                    </Link>
                    <p className="mt-1 text-sm text-[#706759]">
                      {row.acctId} · {row.accountNumbers} · {row.lab || "Lab unavailable"} · Rep {repDisplay(row)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4 lg:min-w-[520px]">
                    <Metric label="CM Jobs" value={number(row.cmJobs)} />
                    <Metric label="PM Jobs" value={number(row.pmJobs)} />
                    <Metric label="JPD Change" value={signed(comparison.jpdDelta)} />
                    <Metric label="Sales at Risk" value={money(comparison.projectedSalesAtRisk)} />
                  </div>
                </div>
                <ActionButtons item={item} mode={mode} />
              </article>
            );
          })
        ) : (
          <p className="rounded-md border border-[#eadfce] bg-white/72 p-4 text-sm text-[#706759]">
            No accounts match the current filters.
          </p>
        )}
      </div>
    </section>
  );
}

function WatchlistCard({ item, mode }: { item: ComparedRow; mode: ComparisonMode }) {
  const { row, comparison } = item;
  const flags = flagsFor(item);
  return (
    <article className="rounded-md border border-[#d8c49b] bg-[#fffaf1]/88 p-5 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.13em] ${severityStyles[comparison.severity]}`}
            >
              {comparison.severity}
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8b7650]">
              Rep {repDisplay(row)}
            </span>
          </div>
          <Link
            href={accountHref(row, mode)}
            className="mt-3 block text-xl font-semibold tracking-[-0.03em] text-[#172a28] underline-offset-4 hover:underline"
          >
            {row.businessName}
          </Link>
          <p className="mt-1 text-sm text-[#706759]">
            {row.acctId} · {row.lab || "Lab unavailable"} ·{" "}
            {customerTypeLabel(row.customerType)}
          </p>
        </div>
        <div className="rounded-md border border-[#d47763]/55 bg-[#fff1ed] px-5 py-3 lg:text-right">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#8b3b2d]">
            Jobs/day lost
          </p>
          <p className="mt-1 text-4xl font-semibold tracking-[-0.05em] text-[#8b3325]">
            {comparison.jobsPerDayLost.toFixed(2)}
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Metric label={`${comparison.comparisonPeriod} JPD${mode === "cm-vs-pm" ? " Pace" : ""}`} value={jpd(comparison.comparisonJpd)} />
        <Metric label={`${comparison.baselinePeriod} JPD`} value={jpd(comparison.baselineJpd)} />
        <Metric label="JPD Change" value={signed(comparison.jpdDelta)} />
        <Metric label="JPD % Change" value={percent(comparison.jpdDeltaPct)} />
        <Metric label="Projected Jobs at Risk" value={number(comparison.projectedJobsAtRisk, 1)} />
        <Metric label="Projected Sales at Risk" value={money(comparison.projectedSalesAtRisk)} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {flags.map((flag) => (
          <span
            key={flag}
            className="rounded-full border border-[#d8c49b] bg-white px-2.5 py-1 text-xs font-semibold text-[#706759]"
          >
            {flag}
          </span>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-[#706759]">
        Sales/day change {signed(comparison.salesPerDayDelta, "/day")} · Last ship{" "}
        {date(row.latestShipDate)} · {row.authorizedUsers} portal user
        {row.authorizedUsers === 1 ? "" : "s"} · Price lists{" "}
        {row.priceLists || "none"}
      </p>
      <ActionButtons item={item} mode={mode} />
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#eadfce] bg-white/72 p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#8b7650]">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-[#172a28]">{value}</p>
    </div>
  );
}

type GroupSummary = {
  key: string;
  accountCount: number;
  activeCount: number;
  criticalCount: number;
  highCount: number;
  noActivityCount: number;
  noUserCount: number;
  missingPriceLists: number;
  baselineJpd: number;
  comparisonJpd: number;
  jobsPerDayLost: number;
  projectedJobsAtRisk: number;
  baselineSalesPerDay: number;
  comparisonSalesPerDay: number;
  salesPerDayLost: number;
  projectedSalesAtRisk: number;
  turnaroundBaseline: number;
  turnaroundComparison: number;
};

function groupSummary(items: ComparedRow[], getKey: (row: DashboardV1AdminRow) => string) {
  const groups = new Map<string, ComparedRow[]>();
  for (const item of items) {
    const key = getKey(item.row) || "Unassigned";
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  return [...groups.entries()].map(([key, group]): GroupSummary => {
    const baselineTurnaround = group
      .map(({ row, comparison }) =>
        comparison.mode === "pm-vs-ppm"
          ? row.turnaroundAverageDays.ppm
          : row.turnaroundAverageDays.pm
      )
      .filter((value) => value > 0);
    const comparisonTurnaround = group
      .map(({ row, comparison }) =>
        comparison.mode === "pm-vs-ppm"
          ? row.turnaroundAverageDays.pm
          : row.turnaroundAverageDays.cm
      )
      .filter((value) => value > 0);
    const sum = (getValue: (item: ComparedRow) => number) =>
      group.reduce((total, item) => total + getValue(item), 0);

    return {
      key,
      accountCount: group.length,
      activeCount: group.filter(({ row }) => row.cmJobs > 0).length,
      criticalCount: group.filter(
        ({ comparison }) => comparison.severity === "critical"
      ).length,
      highCount: group.filter(
        ({ comparison }) => comparison.severity === "high"
      ).length,
      noActivityCount: group.filter(
        ({ comparison }) => comparison.comparisonJobs === 0
      ).length,
      noUserCount: group.filter(({ row }) => row.authorizedUsers === 0).length,
      missingPriceLists: group.filter(({ row }) => row.priceListCodes.length === 0)
        .length,
      baselineJpd: sum(({ comparison }) => comparison.baselineJpd ?? 0),
      comparisonJpd: sum(({ comparison }) => comparison.comparisonJpd ?? 0),
      jobsPerDayLost: sum(({ comparison }) => comparison.jobsPerDayLost),
      projectedJobsAtRisk: sum(
        ({ comparison }) => comparison.projectedJobsAtRisk
      ),
      baselineSalesPerDay: sum(
        ({ comparison }) => comparison.baselineSalesPerDay ?? 0
      ),
      comparisonSalesPerDay: sum(
        ({ comparison }) => comparison.comparisonSalesPerDay ?? 0
      ),
      salesPerDayLost: sum(({ comparison }) => comparison.salesPerDayLost),
      projectedSalesAtRisk: sum(
        ({ comparison }) => comparison.projectedSalesAtRisk
      ),
      turnaroundBaseline:
        baselineTurnaround.reduce((total, value) => total + value, 0) /
          baselineTurnaround.length || 0,
      turnaroundComparison:
        comparisonTurnaround.reduce((total, value) => total + value, 0) /
          comparisonTurnaround.length || 0,
    };
  });
}

function SummaryTable({
  title,
  eyebrow,
  rows,
  filterName,
  mode,
  query,
  includeTurnaround = false,
}: {
  title: string;
  eyebrow: string;
  rows: GroupSummary[];
  filterName: "rep" | "lab";
  mode: ComparisonMode;
  query: DashboardQuery;
  includeTurnaround?: boolean;
}) {
  return (
    <section className="rounded-md border border-[#d8c49b] bg-[#fffaf1]/88 p-5 shadow-[0_18px_55px_rgba(23,42,40,0.08)] sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-[#172a28]">
        {title}
      </h2>
      <div className="mobile-scroll-row mt-5 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#d8c49b] text-[10px] uppercase tracking-[0.13em] text-[#8b7650]">
              <th className="px-3 py-3">Group</th>
              <th className="px-3 py-3">Accounts</th>
              <th className="px-3 py-3">Critical</th>
              <th className="px-3 py-3">Baseline JPD</th>
              <th className="px-3 py-3">Comparison JPD</th>
              <th className="px-3 py-3">Jobs/Day Lost</th>
              <th className="px-3 py-3">Jobs at Risk</th>
              <th className="px-3 py-3">Sales at Risk</th>
              {includeTurnaround ? <th className="px-3 py-3">Turnaround</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows
              .sort(
                (a, b) =>
                  b.projectedJobsAtRisk - a.projectedJobsAtRisk ||
                  b.criticalCount - a.criticalCount ||
                  b.salesPerDayLost - a.salesPerDayLost
              )
              .map((row) => (
                <tr key={row.key} className="border-b border-[#eadfce]">
                  <td className="px-3 py-4">
                    <Link
                      href={urlFor(mode, query, { [filterName]: row.key })}
                      className="font-semibold text-[#172a28] underline-offset-4 hover:underline"
                    >
                      {row.key}
                    </Link>
                  </td>
                  <td className="px-3 py-4">{row.accountCount}</td>
                  <td className="px-3 py-4">{row.criticalCount}</td>
                  <td className="px-3 py-4">{row.baselineJpd.toFixed(2)}</td>
                  <td className="px-3 py-4">{row.comparisonJpd.toFixed(2)}</td>
                  <td className="px-3 py-4 font-semibold text-[#8b3325]">
                    {row.jobsPerDayLost.toFixed(2)}
                  </td>
                  <td className="px-3 py-4">{number(row.projectedJobsAtRisk)}</td>
                  <td className="px-3 py-4">{money(row.projectedSalesAtRisk)}</td>
                  {includeTurnaround ? (
                    <td className="px-3 py-4">
                      {row.turnaroundBaseline.toFixed(1)} →{" "}
                      {row.turnaroundComparison.toFixed(1)} days
                    </td>
                  ) : null}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function AdminLandingDashboard({
  authenticatedEmail,
  role,
  mode,
  query,
}: {
  authenticatedEmail: string;
  role: PortalStaffRole;
  mode: ComparisonMode;
  query: DashboardQuery;
}) {
  const allRows = getDashboardV1AdminRows();
  const roleRows = filterRowsForPortalRole(role, allRows);
  const manifest = getDashboardV1Manifest();
  const compared = roleRows.map((row) => ({
    row,
    comparison: comparePortalAccount(row, mode),
  }));
  const normalizedQuery = query.q?.trim().toLowerCase() ?? "";
  const minimumBaselineJpd = Number(query.minimumBaselineJpd || 0) || 0;
  const minimumJpdLost = Number(query.minimumJpdLost || 0) || 0;

  const filtered = compared.filter(({ row, comparison }) => {
    if (query.division && row.customerType !== query.division) return false;
    if (query.lab && row.lab !== query.lab) return false;
    if (
      role.kind === "admin" &&
      query.rep &&
      repDisplay(row) !== query.rep &&
      row.salesRepCode !== query.rep.trim().toUpperCase()
    ) return false;
    if (query.priceList && !row.priceListCodes.includes(query.priceList)) return false;
    if (query.hasUser === "yes" && row.authorizedUsers === 0) return false;
    if (query.hasUser === "no" && row.authorizedUsers > 0) return false;
    if (query.email === "yes" && !firstEmail(row)) return false;
    if (query.email === "no" && firstEmail(row)) return false;
    if (query.activity === "active" && comparison.comparisonJobs <= 0) return false;
    if (query.activity === "none" && comparison.comparisonJobs > 0) return false;
    if (query.trend === "jpd-down" && comparison.jobsPerDayLost <= 0) return false;
    if (
      query.trend === "jobs-down" &&
      comparison.comparisonJobs >= comparison.baselineJobs
    ) return false;
    if (
      query.trend === "sales-down" &&
      comparison.salesPerDayLost <= 0
    ) return false;
    if (query.severity && comparison.severity !== query.severity) return false;
    if ((comparison.baselineJpd ?? 0) < minimumBaselineJpd) return false;
    if (comparison.jobsPerDayLost < minimumJpdLost) return false;
    if (query.opportunity === "no-user" && row.authorizedUsers > 0) return false;
    if (query.opportunity === "missing-price-lists" && row.priceListCodes.length > 0)
      return false;
    if (
      query.opportunity === "preferred-designs" &&
      preferredDesignJobs(row) > 0
    ) return false;
    if (
      query.opportunity === "preferred-materials" &&
      preferredMaterialJobs(row) > 0
    ) return false;
    if (
      query.opportunity === "program-products" &&
      hasProgramProducts(row)
    ) return false;
    if (
      normalizedQuery &&
      ![
        row.businessName,
        row.acctId,
        row.accountNumbers,
        row.lab,
        row.salesRep,
        row.salesRepCode,
        row.customerType,
        row.priceLists,
        row.authorizedUserEmails.join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    ) return false;
    return true;
  });

  const watchlist = filtered
    .filter(
      ({ comparison }) =>
        comparison.hasBaseline &&
        comparison.hasComparison &&
        comparison.jobsPerDayLost > 0
    )
    .sort(sortJpdWatchlist);
  const critical = compared.filter(
    ({ comparison }) => comparison.severity === "critical"
  );
  const projectedJobsAtRisk = compared.reduce(
    (total, { comparison }) => total + comparison.projectedJobsAtRisk,
    0
  );
  const projectedSalesAtRisk = compared.reduce(
    (total, { comparison }) => total + comparison.projectedSalesAtRisk,
    0
  );
  const noBaseline = compared.filter(
    ({ comparison }) => !comparison.hasBaseline
  ).length;
  const noActivity = compared.filter(
    ({ comparison }) => comparison.comparisonJobs === 0
  ).length;
  const noUsers = compared.filter(({ row }) => row.authorizedUsers === 0).length;
  const missingPriceLists = compared.filter(
    ({ row }) => row.priceListCodes.length === 0
  ).length;
  const missingRep = allRows.filter((row) => !row.salesRep).length;
  const missingLab = allRows.filter((row) => !row.lab || row.lab === "—").length;
  const missingEmail = allRows.filter((row) => !firstEmail(row)).length;
  const repSummaries = groupSummary(compared, repDisplay);
  const labSummaries = groupSummary(compared, (row) => row.lab || "Unassigned");
  const repOptions = [
    ...new Set(roleRows.map((row) => repDisplay(row)).filter(Boolean)),
  ].sort((a, b) => {
    if (a === "Unassigned") return 1;
    if (b === "Unassigned") return -1;
    return a.localeCompare(b);
  });
  const options = {
    divisions: [...new Set(roleRows.map((row) => row.customerType).filter(Boolean))].sort(),
    labs: [...new Set(roleRows.map((row) => row.lab).filter((value) => value && value !== "—"))].sort(),
    reps: repOptions,
    priceLists: [...new Set(roleRows.flatMap((row) => row.priceListCodes))].sort(),
  };

  return (
    <AdminShell
      title="Customer Intelligence Command Center"
      adminEmail={authenticatedEmail}
      eyebrow="ALN Sales Intervention"
    >
      <AccountCommandStrip
        mode={mode}
        query={query}
        options={options}
        visibleCount={filtered.length}
        totalCount={roleRows.length}
      />

      {hasActiveAccountJumpFilter(query) ? (
        <AccountResultList
          items={filtered}
          mode={mode}
          title="Jump directly to these accounts"
        />
      ) : null}

      <section className="mt-8 rounded-md border border-[#d8c49b] bg-[#172a28] p-6 text-white shadow-[0_28px_90px_rgba(23,42,40,0.22)] sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d8c49b]">
              Which customers are down most in jobs per day?
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              See the loss, find the owner, act today.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/72">
              Data refreshed {date(manifest?.data_refresh_date)} ·{" "}
              {role.kind === "admin"
                ? "Viewing all accounts"
                : role.kind === "sales-rep"
                  ? `Viewing assigned accounts: ${role.repCode}`
                  : "No account scope assigned"}
            </p>
          </div>
          <ModeToggle mode={mode} query={query} />
        </div>
      </section>

      {role.kind === "sales-rep" && roleRows.length === 0 ? (
        <section className="mt-6 rounded-md border border-[#d8a15e] bg-[#fff7e8] p-6 text-[#172a28]">
          <h2 className="text-xl font-semibold">No accounts are assigned to this login.</h2>
          <p className="mt-2 text-sm leading-6 text-[#706759]">
            Account-level sales rep codes are not present in the current data load.
            Contact an administrator if this looks wrong. No customer data has been
            sent to this view.
          </p>
        </section>
      ) : null}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Visible Accounts" value={number(roleRows.length)} detail={role.kind === "admin" ? "all accounts" : "assigned accounts only"} />
        <StatCard icon={ShieldAlert} label="Critical JPD Accounts" value={number(critical.length)} detail={`${mode === "pm-vs-ppm" ? "PM vs PPM" : "CM pace vs PM"} severity`} urgent={critical.length > 0} />
        <StatCard icon={Package} label="Projected Jobs at Risk" value={number(projectedJobsAtRisk)} detail="weighted from absolute jobs/day loss" urgent={projectedJobsAtRisk > 0} />
        <StatCard icon={CircleDollarSign} label="Projected Sales at Risk" value={money(projectedSalesAtRisk)} detail="sales/day loss across visible accounts" />
        <StatCard icon={Activity} label={mode === "pm-vs-ppm" ? "JPD Down vs PPM" : "JPD Pace Down vs PM"} value={number(watchlist.length)} detail="accounts with a valid baseline" />
        <StatCard icon={AlertTriangle} label="No Current Activity" value={number(noActivity)} detail="zero jobs in comparison period" />
        <StatCard icon={UserRound} label="No Portal Users" value={number(noUsers)} detail="setup and adoption gap" />
        <StatCard icon={ClipboardCopy} label="Missing Price Lists" value={number(missingPriceLists)} detail={`${noBaseline} accounts also have no JPD baseline`} />
      </section>

      <section id="jpd-watchlist" className="mt-8 scroll-mt-24">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">
              Primary Operating Queue
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#172a28]">
              JPD Watchlist
            </h2>
            <p className="mt-2 text-sm text-[#706759]">
              Ranked by absolute jobs/day lost, then projected jobs and sales at risk.
            </p>
          </div>
          <span className="rounded-full border border-[#d8c49b] bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#706759]">
            {watchlist.length} requiring attention
          </span>
        </div>
        <div className="mt-5 grid gap-4">
          {watchlist.length ? (
            watchlist.slice(0, 40).map((item) => (
              <WatchlistCard key={item.row.acctId} item={item} mode={mode} />
            ))
          ) : (
            <p className="rounded-md border border-[#d8c49b] bg-[#fffaf1] p-5 text-sm text-[#706759]">
              No accounts in the current scope match the JPD watchlist filters.
            </p>
          )}
        </div>
      </section>

      {role.kind === "admin" ? (
        <div className="mt-8 grid gap-6">
          <SummaryTable title="Sales Rep Performance" eyebrow="Admin Operating Report" rows={repSummaries} filterName="rep" mode={mode} query={query} />
          <SummaryTable title="Lab Comparison" eyebrow="Admin Operating Report" rows={labSummaries} filterName="lab" mode={mode} query={query} includeTurnaround />
        </div>
      ) : null}

      <section id="account-search" className="mt-8 rounded-md border border-[#d8c49b] bg-[#fffaf1]/88 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">
              Filtered Account View
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#172a28]">
              Showing {filtered.length} of {roleRows.length}{" "}
              {role.kind === "sales-rep" ? "assigned " : ""}accounts
            </h2>
          </div>
          <Link href={`/portal/admin?view=${mode}`} className={adminButtonClass}>
            Reset filters
          </Link>
        </div>
        <form className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <input type="hidden" name="view" value={mode} />
          <input name="q" defaultValue={query.q} placeholder="Search account, email, lab, rep" className="min-h-12 rounded-md border border-[#d8c49b] bg-white px-3 text-sm outline-none focus:border-[#172a28]" />
          <Select name="division" value={query.division} label="All Types" options={options.divisions} />
          <Select name="lab" value={query.lab} label="All Labs" options={options.labs} />
          {role.kind === "admin" ? <Select name="rep" value={query.rep} label="All Sales Reps" options={options.reps} /> : null}
          <Select name="priceList" value={query.priceList} label="All Price Lists" options={options.priceLists} />
          <Select name="severity" value={query.severity} label="All JPD Severity" options={["critical", "high", "watch", "low-volume"]} />
          <Select name="trend" value={query.trend} label="All Trends" options={["jpd-down", "jobs-down", "sales-down"]} />
          <Select name="activity" value={query.activity} label="All Activity" options={["active", "none"]} />
          <Select name="hasUser" value={query.hasUser} label="Portal User Status" options={["yes", "no"]} />
          <Select name="email" value={query.email} label="Customer Email Status" options={["yes", "no"]} />
          <Select name="opportunity" value={query.opportunity} label="All Opportunities" options={["no-user", "missing-price-lists", "preferred-designs", "preferred-materials", "program-products"]} />
          <input name="minimumBaselineJpd" type="number" min="0" step="0.1" defaultValue={query.minimumBaselineJpd} placeholder="Minimum baseline JPD" className="min-h-12 rounded-md border border-[#d8c49b] bg-white px-3 text-sm outline-none focus:border-[#172a28]" />
          <input name="minimumJpdLost" type="number" min="0" step="0.1" defaultValue={query.minimumJpdLost} placeholder="Minimum jobs/day lost" className="min-h-12 rounded-md border border-[#d8c49b] bg-white px-3 text-sm outline-none focus:border-[#172a28]" />
          <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#172a28] px-6 text-sm font-semibold text-white transition hover:bg-[#27433f]">
            <Search className="h-4 w-4" /> Apply filters
          </button>
        </form>
        <AccountResultList items={filtered} mode={mode} title="Filtered accounts" />
      </section>

      {role.kind === "admin" ? (
        <section className="mt-8 rounded-md border border-[#d8c49b] bg-[#fffaf1]/88 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">
            Data Quality
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[#172a28]">
            Fields that need attention
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard icon={UserRound} label="Missing Sales Rep" value={number(missingRep)} detail="rep access remains fail-closed" urgent={missingRep > 0} />
            <StatCard icon={Building2} label="Missing Lab" value={number(missingLab)} detail="accounts without a lab value" />
            <StatCard icon={Users} label="Missing Customer Email" value={number(missingEmail)} detail="no authorized user email" />
            <StatCard icon={ClipboardCopy} label="Missing Price List" value={number(missingPriceLists)} detail="visible accounts without lists" />
            <StatCard icon={Target} label="Invalid User Links" value={number(manifest?.users_with_invalid_account_ids ?? 0)} detail="from CRM user workbook generation" />
          </div>
        </section>
      ) : null}
    </AdminShell>
  );
}

function Select({
  name,
  value,
  label,
  options,
}: {
  name: string;
  value?: string;
  label: string;
  options: string[];
}) {
  return (
    <select
      name={name}
      defaultValue={value}
      className="min-h-12 rounded-md border border-[#d8c49b] bg-white px-3 text-sm text-[#172a28] outline-none focus:border-[#172a28]"
    >
      <option value="">{label}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option.replaceAll("-", " ")}
        </option>
      ))}
    </select>
  );
}
