import type { DashboardV1AdminRow } from "@/lib/portal/adminDashboardV1";

export type DataChatRow = Pick<
  DashboardV1AdminRow,
  | "businessName"
  | "acctId"
  | "accountNumbers"
  | "salesRep"
  | "territory"
  | "lab"
  | "state"
  | "latestShipDate"
  | "dataRefreshDate"
  | "ppmSales"
  | "pmSales"
  | "cmSales"
  | "ppmJobs"
  | "pmJobs"
  | "cmJobs"
  | "ppmJpd"
  | "pmJpd"
  | "cmJpd"
  | "locationCount"
  | "rawAccount"
>;

const MAX_RESULTS = 25;

function normalize(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function compact(value: unknown) {
  return normalize(value).replace(/\s+/g, "");
}

function accountNumbers(row: DataChatRow) {
  return row.accountNumbers
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function locationLabels(row: DataChatRow) {
  return (row.rawAccount?.locations ?? []).flatMap((location) => [
    location.account_name,
    location.account_number,
  ]);
}

function levenshtein(a: string, b: string) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let aIndex = 1; aIndex <= a.length; aIndex += 1) {
    const current = [aIndex];
    for (let bIndex = 1; bIndex <= b.length; bIndex += 1) {
      const substitution = previous[bIndex - 1] + (a[aIndex - 1] === b[bIndex - 1] ? 0 : 1);
      current[bIndex] = Math.min(
        previous[bIndex] + 1,
        current[bIndex - 1] + 1,
        substitution
      );
    }
    previous = current;
  }
  return previous[b.length];
}

function matchScore(row: DataChatRow, query: string) {
  const normalizedQuery = normalize(query);
  const compactQuery = compact(query);
  if (!normalizedQuery) return 0;

  const accountValues = [row.acctId, ...accountNumbers(row)].map(normalize);
  if (accountValues.includes(normalizedQuery)) return 1_000;

  const names = [row.businessName, ...locationLabels(row)].filter(Boolean);
  const normalizedNames = names.map(normalize);
  if (normalizedNames.includes(normalizedQuery)) return 950;
  if (normalizedNames.some((name) => name.includes(normalizedQuery))) return 850;
  if (accountValues.some((value) => value.includes(normalizedQuery))) return 800;

  const queryWords = normalizedQuery.split(" ").filter(Boolean);
  if (
    queryWords.length > 1 &&
    normalizedNames.some((name) => queryWords.every((word) => name.includes(word)))
  ) {
    return 700;
  }

  const closestDistance = Math.min(
    ...names.map((name) => levenshtein(compact(name), compactQuery))
  );
  const allowedDistance = compactQuery.length >= 12 ? 2 : 1;
  return closestDistance <= allowedDistance ? 600 - closestDistance : 0;
}

function clampInteger(value: unknown, fallback: number, minimum: number, maximum: number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(maximum, Math.max(minimum, Math.round(numeric)));
}

function round(value: number | null, digits = 2) {
  if (value === null || !Number.isFinite(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function percentChange(current: number | null, baseline: number | null) {
  if (current === null || baseline === null || baseline <= 0) return null;
  return ((current - baseline) / baseline) * 100;
}

function safeCurrentJpd(row: DataChatRow) {
  if (row.cmJpd !== null) return row.cmJpd;
  return row.cmJobs === 0 ? 0 : null;
}

function isoDay(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function calendarDaysBetween(later: string, earlier: string) {
  const laterDate = isoDay(later);
  const earlierDate = isoDay(earlier);
  if (!laterDate || !earlierDate) return null;
  return Math.max(0, Math.floor((laterDate.getTime() - earlierDate.getTime()) / 86_400_000));
}

function periodMetrics(row: DataChatRow) {
  const currentJpd = safeCurrentJpd(row);
  return {
    prior_month: {
      jobs: row.ppmJobs,
      jobs_per_day: round(row.ppmJpd),
      sales: round(row.ppmSales),
    },
    previous_month: {
      jobs: row.pmJobs,
      jobs_per_day: round(row.pmJpd),
      sales: round(row.pmSales),
    },
    current_month_to_date: {
      jobs: row.cmJobs,
      jobs_per_day: round(currentJpd),
      sales: round(row.cmSales),
    },
    current_vs_previous_jpd_change_percent: round(percentChange(currentJpd, row.pmJpd), 1),
  };
}

function publicCustomer(row: DataChatRow) {
  return {
    account_id: row.acctId,
    business_name: row.businessName,
    account_numbers: accountNumbers(row),
    lab: row.lab || null,
    state: row.state || null,
    sales_rep: row.salesRep || null,
    territory: row.territory || null,
    location_count: row.locationCount,
    latest_ship_date: row.latestShipDate || null,
    data_through: row.dataRefreshDate || null,
  };
}

export function findCustomers(rows: DataChatRow[], query: unknown, limit: unknown = 8) {
  const cleanQuery = String(query ?? "").trim();
  const resultLimit = clampInteger(limit, 8, 1, 12);
  if (!cleanQuery) return { query: cleanQuery, matches: [] };

  const matches = rows
    .map((row) => ({ row, score: matchScore(row, cleanQuery) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.row.businessName.localeCompare(b.row.businessName))
    .slice(0, resultLimit)
    .map(({ row }) => publicCustomer(row));

  return { query: cleanQuery, matches };
}

export function getCustomerActivity(rows: DataChatRow[], accountId: unknown) {
  const normalizedId = normalize(accountId);
  const row = rows.find(
    (candidate) =>
      normalize(candidate.acctId) === normalizedId ||
      accountNumbers(candidate).some((value) => normalize(value) === normalizedId)
  );

  if (!row) {
    return {
      found: false as const,
      account_id: String(accountId ?? ""),
      message: "Customer not found.",
    };
  }

  const daysSinceLatestShipment = calendarDaysBetween(row.dataRefreshDate, row.latestShipDate);
  const currentJpd = safeCurrentJpd(row);
  const isSending =
    row.cmJobs > 0 &&
    daysSinceLatestShipment !== null &&
    daysSinceLatestShipment <= 7;

  return {
    found: true as const,
    customer: publicCustomer(row),
    activity: periodMetrics(row),
    sending_assessment: {
      is_sending_recently: isSending,
      definition: "At least one current-month job and a shipment within 7 calendar days of the data-through date.",
      calendar_days_since_latest_shipment: daysSinceLatestShipment,
      current_jobs_per_day: round(currentJpd),
    },
  };
}

export function listDecliningCustomers(
  rows: DataChatRow[],
  options: {
    declinePercent?: unknown;
    minimumBaselineJobs?: unknown;
    limit?: unknown;
  } = {}
) {
  const declinePercent = clampInteger(options.declinePercent, 20, 5, 80);
  const minimumBaselineJobs = clampInteger(options.minimumBaselineJobs, 10, 1, 10_000);
  const limit = clampInteger(options.limit, 15, 1, MAX_RESULTS);

  const customers = rows
    .map((row) => {
      const currentJpd = safeCurrentJpd(row);
      const changePercent = percentChange(currentJpd, row.pmJpd);
      return { row, currentJpd, changePercent };
    })
    .filter(
      ({ row, changePercent }) =>
        row.pmJobs >= minimumBaselineJobs &&
        changePercent !== null &&
        changePercent <= -declinePercent
    )
    .sort((a, b) => (a.changePercent ?? 0) - (b.changePercent ?? 0))
    .slice(0, limit)
    .map(({ row, currentJpd, changePercent }) => ({
      ...publicCustomer(row),
      previous_month_jobs: row.pmJobs,
      previous_month_jobs_per_day: round(row.pmJpd),
      current_month_jobs: row.cmJobs,
      current_month_jobs_per_day: round(currentJpd),
      jobs_per_day_change_percent: round(changePercent, 1),
    }));

  return {
    definition: `Current-month jobs per day is at least ${declinePercent}% below previous month, with at least ${minimumBaselineJobs} previous-month jobs.`,
    data_through: rows.find((row) => row.dataRefreshDate)?.dataRefreshDate || null,
    result_count: customers.length,
    customers,
  };
}

export function listInactiveCustomers(
  rows: DataChatRow[],
  options: {
    daysWithoutShipment?: unknown;
    minimumBaselineJobs?: unknown;
    limit?: unknown;
  } = {}
) {
  const daysWithoutShipment = clampInteger(options.daysWithoutShipment, 7, 1, 90);
  const minimumBaselineJobs = clampInteger(options.minimumBaselineJobs, 10, 1, 10_000);
  const limit = clampInteger(options.limit, 15, 1, MAX_RESULTS);

  const customers = rows
    .map((row) => ({
      row,
      daysSinceLatestShipment: calendarDaysBetween(row.dataRefreshDate, row.latestShipDate),
    }))
    .filter(
      ({ row, daysSinceLatestShipment }) =>
        row.pmJobs >= minimumBaselineJobs &&
        daysSinceLatestShipment !== null &&
        daysSinceLatestShipment >= daysWithoutShipment
    )
    .sort((a, b) => (b.daysSinceLatestShipment ?? 0) - (a.daysSinceLatestShipment ?? 0))
    .slice(0, limit)
    .map(({ row, daysSinceLatestShipment }) => ({
      ...publicCustomer(row),
      calendar_days_since_latest_shipment: daysSinceLatestShipment,
      previous_month_jobs: row.pmJobs,
      current_month_jobs: row.cmJobs,
    }));

  return {
    definition: `No shipment for at least ${daysWithoutShipment} calendar days as of the data-through date, with at least ${minimumBaselineJobs} previous-month jobs.`,
    data_through: rows.find((row) => row.dataRefreshDate)?.dataRefreshDate || null,
    result_count: customers.length,
    customers,
  };
}
