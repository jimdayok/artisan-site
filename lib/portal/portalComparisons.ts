import "server-only";

import type { DashboardV1AdminRow } from "@/lib/portal/adminDashboardV1";

export type ComparisonMode = "pm-vs-ppm" | "cm-vs-pm";
export type JpdSeverity = "critical" | "high" | "watch" | "low-volume" | "none";

export const JPD_SEVERITY_THRESHOLDS = {
  critical: { minimumBaseline: 1, declinePct: 0.25, jobsPerDayLost: 1 },
  high: { minimumBaseline: 0.5, declinePct: 0.2, jobsPerDayLost: 0.5 },
  watch: { minimumBaseline: 0.2, declinePct: 0.15 },
  lowVolumeBaseline: 0.2,
} as const;

export type PortalComparison = {
  mode: ComparisonMode;
  baselinePeriod: "PPM" | "PM";
  comparisonPeriod: "PM" | "CM";
  baselineJpd: number | null;
  comparisonJpd: number | null;
  jpdDelta: number | null;
  jpdDeltaPct: number | null;
  jobsPerDayLost: number;
  projectedJobsAtRisk: number;
  jobsGapToDate: number;
  baselineSalesPerDay: number | null;
  comparisonSalesPerDay: number | null;
  salesPerDayDelta: number | null;
  salesPerDayDeltaPct: number | null;
  salesPerDayLost: number;
  projectedSalesAtRisk: number;
  baselineJobs: number;
  comparisonJobs: number;
  severity: JpdSeverity;
  hasBaseline: boolean;
  hasComparison: boolean;
  comparisonIsZeroActivity: boolean;
  previousMonthBusinessDays: number;
  elapsedCurrentMonthBusinessDays: number;
  totalCurrentMonthBusinessDays: number;
};

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function nthWeekday(year: number, month: number, weekday: number, ordinal: number) {
  const first = new Date(year, month, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  return new Date(year, month, 1 + offset + (ordinal - 1) * 7);
}

function lastWeekday(year: number, month: number, weekday: number) {
  const last = new Date(year, month + 1, 0);
  return new Date(
    year,
    month,
    last.getDate() - ((last.getDay() - weekday + 7) % 7)
  );
}

function observed(date: Date) {
  const result = new Date(date);
  if (date.getDay() === 0) result.setDate(date.getDate() + 1);
  if (date.getDay() === 6) result.setDate(date.getDate() - 1);
  return result;
}

function holidays(year: number) {
  return new Set(
    [
      observed(new Date(year, 0, 1)),
      nthWeekday(year, 0, 1, 3),
      nthWeekday(year, 1, 1, 3),
      lastWeekday(year, 4, 1),
      observed(new Date(year, 5, 19)),
      observed(new Date(year, 6, 4)),
      nthWeekday(year, 8, 1, 1),
      nthWeekday(year, 9, 1, 2),
      observed(new Date(year, 10, 11)),
      nthWeekday(year, 10, 4, 4),
      observed(new Date(year, 11, 25)),
    ].map(dateKey)
  );
}

function businessDaysInMonth(date: Date, throughDay?: number) {
  const holidayKeys = holidays(date.getFullYear());
  const lastDay = throughDay ?? new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  let count = 0;

  for (let day = 1; day <= lastDay; day += 1) {
    const candidate = new Date(date.getFullYear(), date.getMonth(), day);
    if (candidate.getDay() === 0 || candidate.getDay() === 6) continue;
    if (holidayKeys.has(dateKey(candidate))) continue;
    count += 1;
  }

  return count;
}

function refreshDate(row: DashboardV1AdminRow) {
  const parsed = row.dataRefreshDate
    ? new Date(`${row.dataRefreshDate}T12:00:00`)
    : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function getDefaultComparisonMode(date = new Date()): ComparisonMode {
  return businessDaysInMonth(date, date.getDate()) <= 3
    ? "pm-vs-ppm"
    : "cm-vs-pm";
}

export function parseComparisonMode(value?: string): ComparisonMode | undefined {
  return value === "pm-vs-ppm" || value === "cm-vs-pm" ? value : undefined;
}

export function comparisonConfidenceNote(mode: ComparisonMode, date = new Date()) {
  if (mode !== "cm-vs-pm") return "Completed month comparison";
  return businessDaysInMonth(date, date.getDate()) < 4
    ? "Early month: CM pace is directional."
    : "CM pace based on current-month activity.";
}

function percentDelta(comparison: number | null, baseline: number | null) {
  if (comparison === null || baseline === null || baseline <= 0) return null;
  return (comparison - baseline) / baseline;
}

function severityFor(baselineJpd: number | null, jpdDeltaPct: number | null, jobsPerDayLost: number): JpdSeverity {
  if (baselineJpd === null || baselineJpd <= 0 || jobsPerDayLost <= 0) return "none";
  const declinePct = Math.abs(Math.min(0, jpdDeltaPct ?? 0));

  if (
    (baselineJpd >= JPD_SEVERITY_THRESHOLDS.critical.minimumBaseline &&
      declinePct >= JPD_SEVERITY_THRESHOLDS.critical.declinePct) ||
    jobsPerDayLost >= JPD_SEVERITY_THRESHOLDS.critical.jobsPerDayLost
  ) return "critical";

  if (
    (baselineJpd >= JPD_SEVERITY_THRESHOLDS.high.minimumBaseline &&
      declinePct >= JPD_SEVERITY_THRESHOLDS.high.declinePct) ||
    jobsPerDayLost >= JPD_SEVERITY_THRESHOLDS.high.jobsPerDayLost
  ) return "high";

  if (
    baselineJpd >= JPD_SEVERITY_THRESHOLDS.watch.minimumBaseline &&
    declinePct >= JPD_SEVERITY_THRESHOLDS.watch.declinePct
  ) return "watch";

  return baselineJpd < JPD_SEVERITY_THRESHOLDS.lowVolumeBaseline
    ? "low-volume"
    : "none";
}

export function comparePortalAccount(
  row: DashboardV1AdminRow,
  mode: ComparisonMode
): PortalComparison {
  const anchor = refreshDate(row);
  const previousMonth = new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1);
  const previousMonthBusinessDays = businessDaysInMonth(previousMonth);
  const elapsedCurrentMonthBusinessDays = Math.max(
    1,
    businessDaysInMonth(anchor, anchor.getDate())
  );
  const totalCurrentMonthBusinessDays = businessDaysInMonth(anchor);

  const baselineJpd = mode === "pm-vs-ppm" ? row.ppmJpd : row.pmJpd;
  const comparisonJpd = mode === "pm-vs-ppm" ? row.pmJpd : row.cmJpd;
  const baselineSalesPerDay =
    mode === "pm-vs-ppm" ? row.ppmSalesPerDay : row.pmSalesPerDay;
  const comparisonSalesPerDay =
    mode === "pm-vs-ppm" ? row.pmSalesPerDay : row.cmSalesPerDay;
  const baselineJobs = mode === "pm-vs-ppm" ? row.ppmJobs : row.pmJobs;
  const comparisonJobs = mode === "pm-vs-ppm" ? row.pmJobs : row.cmJobs;
  const jpdDelta =
    baselineJpd === null || comparisonJpd === null
      ? null
      : comparisonJpd - baselineJpd;
  const jpdDeltaPct = percentDelta(comparisonJpd, baselineJpd);
  const jobsPerDayLost = Math.max(0, -(jpdDelta ?? 0));
  const riskDays =
    mode === "pm-vs-ppm"
      ? previousMonthBusinessDays
      : totalCurrentMonthBusinessDays;
  const salesPerDayDelta =
    baselineSalesPerDay === null || comparisonSalesPerDay === null
      ? null
      : comparisonSalesPerDay - baselineSalesPerDay;
  const salesPerDayLost = Math.max(0, -(salesPerDayDelta ?? 0));

  return {
    mode,
    baselinePeriod: mode === "pm-vs-ppm" ? "PPM" : "PM",
    comparisonPeriod: mode === "pm-vs-ppm" ? "PM" : "CM",
    baselineJpd,
    comparisonJpd,
    jpdDelta,
    jpdDeltaPct,
    jobsPerDayLost,
    projectedJobsAtRisk: jobsPerDayLost * riskDays,
    jobsGapToDate:
      mode === "cm-vs-pm" && baselineJpd !== null
        ? Math.max(
            0,
            baselineJpd * elapsedCurrentMonthBusinessDays - row.cmJobs
          )
        : 0,
    baselineSalesPerDay,
    comparisonSalesPerDay,
    salesPerDayDelta,
    salesPerDayDeltaPct: percentDelta(
      comparisonSalesPerDay,
      baselineSalesPerDay
    ),
    salesPerDayLost,
    projectedSalesAtRisk: salesPerDayLost * riskDays,
    baselineJobs,
    comparisonJobs,
    severity: severityFor(baselineJpd, jpdDeltaPct, jobsPerDayLost),
    hasBaseline: baselineJpd !== null && baselineJpd > 0,
    hasComparison: comparisonJpd !== null,
    comparisonIsZeroActivity: comparisonJobs === 0 && comparisonJpd === 0,
    previousMonthBusinessDays,
    elapsedCurrentMonthBusinessDays,
    totalCurrentMonthBusinessDays,
  };
}

export function sortJpdWatchlist(
  left: { row: DashboardV1AdminRow; comparison: PortalComparison },
  right: { row: DashboardV1AdminRow; comparison: PortalComparison }
) {
  return (
    right.comparison.jobsPerDayLost - left.comparison.jobsPerDayLost ||
    right.comparison.projectedJobsAtRisk -
      left.comparison.projectedJobsAtRisk ||
    right.comparison.salesPerDayLost - left.comparison.salesPerDayLost ||
    right.row.latestShipDate.localeCompare(left.row.latestShipDate) ||
    left.row.businessName.localeCompare(right.row.businessName)
  );
}
