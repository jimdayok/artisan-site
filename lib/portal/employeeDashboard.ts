import "server-only";

import {
  getDashboardV1AdminRows,
  getDashboardV1Manifest,
  type DashboardV1AdminRow,
} from "@/lib/portal/adminDashboardV1";
import {
  loadNetSalesHistory,
  POWER_BI_PRODUCTION_SOURCE,
  scopeNetSalesHistory,
  type NetSalesHistoryState,
} from "@/lib/portal/netSalesHistory";
import {
  filterRowsForPortalRole,
  type PortalStaffRole,
} from "@/lib/portal/portalRoles";
import { normalizeSalesRepCode, salesRepLabel } from "@/lib/portal/salesReps";

export type DashboardMetricState =
  | "value"
  | "confirmed-zero"
  | "missing"
  | "not-refreshed"
  | "not-configured"
  | "error";

export type DashboardMetric = {
  value: number | null;
  state: DashboardMetricState;
  detail: string;
};

export type EmployeeMonthlySalesPoint = {
  month: string;
  label: string;
  netSales: number | null;
  previousPeriodNetSales: number | null;
  currentMonth: boolean;
  completedMonth: boolean;
};

export type EmployeeProductUsage = {
  key: string;
  label: string;
  category: "Brand" | "Material" | "Specialty";
  cm: number;
  pm: number;
  ppm: number;
  cmMixPercent: number | null;
  pmChange: number;
  sourceFields: string[];
};

export type EmployeeCustomerRow = {
  businessName: string;
  acctId: string;
  accountNumbers: string;
  lab: string;
  customerType: string;
  locationCount: number;
  cmJobs: number;
  pmJobs: number;
  ppmJobs: number;
  cmSales: number;
  pmSales: number;
  ppmSales: number;
  cmJpd: number | null;
  pmJpd: number | null;
  ppmJpd: number | null;
  latestShipDate: string;
  portalUserCount: number;
  portalUserEmail: string;
  priceListCodes: string[];
  recommendation: string;
  reasons: string[];
  risk: "critical" | "attention" | "opportunity" | "healthy";
  productUsage: Record<string, { cm: number; pm: number; ppm: number }>;
};

export type EmployeeOpportunity = {
  id: string;
  title: string;
  reason: string;
  sourceMetrics: string;
  accountId?: string;
  accountName?: string;
  tone: "critical" | "warning" | "opportunity" | "quality";
};

export type EmployeeDashboardModel = {
  viewer: {
    email: string;
    isAdmin: boolean;
    previewingRep: boolean;
  };
  profile: {
    name: string;
    email: string;
    repCode: string;
    labs: string[];
    territory: string;
  };
  currentDate: string;
  periodDefinitions: {
    cm: string;
    pm: string;
    ppm: string;
    tooltip: string;
    timezone: string;
  };
  freshness: {
    refreshDate: string;
    generatedAt: string;
    stale: boolean;
    warning: string;
  };
  metrics: {
    currentMonthNetSales: DashboardMetric;
    previousMonthNetSales: DashboardMetric;
    trailing13MonthNetSales: DashboardMetric;
    yearToDateNetSales: DashboardMetric;
    monthOverMonthChange: DashboardMetric;
    assignedCustomers: DashboardMetric;
    activeCustomers: DashboardMetric;
    decliningCustomers: DashboardMetric;
    attentionCustomers: DashboardMetric;
  };
  salesHistory: {
    status: NetSalesHistoryState["status"];
    message: string;
    points: EmployeeMonthlySalesPoint[];
    source: typeof POWER_BI_PRODUCTION_SOURCE & {
      dateField: string;
      refreshFrequency: string;
      currentRefreshStatus: string;
      behavior: string;
    };
  };
  products: EmployeeProductUsage[];
  customers: EmployeeCustomerRow[];
  opportunities: EmployeeOpportunity[];
  dataQuality: string[];
};

type ProductDefinition = {
  key: string;
  label: string;
  category: EmployeeProductUsage["category"];
  getValue: (row: DashboardV1AdminRow) =>
    | { cm: number; pm: number; ppm: number }
    | undefined;
  sourceFields: string[];
};

const PRODUCT_DEFINITIONS: ProductDefinition[] = [
  { key: "hoya", label: "Hoya", category: "Brand", getValue: (row) => row.brandUsage.hoya_jobs, sourceFields: ["CM Hoya Orders", "PM Hoya Orders", "PPM Hoya Orders"] },
  { key: "shamir", label: "Shamir", category: "Brand", getValue: (row) => row.brandUsage.shamir_jobs, sourceFields: ["CM Shamir Orders", "PM Shamir Orders", "PPM Shamir Orders"] },
  { key: "tokai", label: "Tokai", category: "Brand", getValue: (row) => row.brandUsage.tokai_jobs, sourceFields: ["CM Tokai Orders", "PM Tokai Orders", "PPM Tokai Orders"] },
  { key: "varilux", label: "Varilux", category: "Brand", getValue: (row) => row.brandUsage.varilux_jobs, sourceFields: ["CM Varilux Orders", "PM Varilux Orders", "PPM Varilux Orders"] },
  { key: "neurolens", label: "Neurolens", category: "Brand", getValue: (row) => row.brandUsage.neurolens_jobs, sourceFields: ["CM Neurolens Orders", "PM Neurolens Orders", "PPM Neurolens Orders"] },
  { key: "sequel", label: "Sequel", category: "Brand", getValue: (row) => row.brandUsage.sequel_jobs, sourceFields: ["CM Sequel Orders", "PM Sequel Orders", "PPM Sequel Orders"] },
  { key: "iot-artisan", label: "IOT Artisan", category: "Brand", getValue: (row) => row.brandUsage.iot_artisan_jobs, sourceFields: ["CM IOT Artisan Orders", "PM IOT Artisan Orders", "PPM IOT Artisan Orders"] },
  { key: "plastic", label: "Plastic", category: "Material", getValue: (row) => row.materialUsage.plastic_jobs, sourceFields: ["CM Plastic Orders", "PM Plastic Orders", "PPM Plastic Orders"] },
  { key: "trivex", label: "Trivex", category: "Material", getValue: (row) => row.materialUsage.trivex_jobs, sourceFields: ["CM Trivex Orders", "PM Trivex Orders", "PPM Trivex Orders"] },
  { key: "hi-index-160", label: "High Index 1.60", category: "Material", getValue: (row) => row.materialUsage.hi_index_160_jobs, sourceFields: ["CM Hi Index 1.60 Orders", "PM Hi Index 1.60 Orders", "PPM Hi Index 1.60 Orders"] },
  { key: "hi-index-167", label: "High Index 1.67", category: "Material", getValue: (row) => row.materialUsage.hi_index_167_jobs, sourceFields: ["CM Hi Index 1.67 Orders", "PM Hi Index 1.67 Orders", "PPM Hi Index 1.67 Orders"] },
  { key: "hi-index-174", label: "High Index 1.74", category: "Material", getValue: (row) => row.materialUsage.hi_index_174_jobs, sourceFields: ["CM Hi Index 1.74 Orders", "PM Hi Index 1.74 Orders", "PPM Hi Index 1.74 Orders"] },
  { key: "photochromic", label: "Photochromic", category: "Specialty", getValue: (row) => row.specialtyUsage.photochromic_jobs, sourceFields: ["CM Photochromic", "PM Photochromic", "PPM Photochromic"] },
  { key: "polarized", label: "Polarized", category: "Specialty", getValue: (row) => row.specialtyUsage.polarized_jobs, sourceFields: ["CM Polarized", "PM Polarized", "PPM Polarized"] },
  { key: "multiple-pair", label: "Multiple Pair", category: "Specialty", getValue: (row) => row.specialtyUsage.multiple_pair_jobs, sourceFields: ["CM Multiple Pairs", "PM Multiple Pairs", "PPM Multiple Pairs"] },
];

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function number(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function sum(rows: DashboardV1AdminRow[], getValue: (row: DashboardV1AdminRow) => number) {
  return rows.reduce((total, row) => total + number(getValue(row)), 0);
}

function metric(value: number | null, detail: string, state?: DashboardMetricState): DashboardMetric {
  if (state) return { value, detail, state };
  if (value === null) return { value: null, detail, state: "missing" };
  return { value, detail, state: value === 0 ? "confirmed-zero" : "value" };
}

function parseDate(value: string) {
  const parts = value.split("-").map(Number);
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) return undefined;
  return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
}

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function shiftMonth(anchor: Date, offset: number) {
  return new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + offset, 1));
}

function monthLabel(date: Date, format: "short" | "long" = "short") {
  return new Intl.DateTimeFormat("en-US", {
    month: format,
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function daysOld(value: string) {
  const parsed = parseDate(value);
  if (!parsed) return Number.POSITIVE_INFINITY;
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.floor((todayUtc - parsed.getTime()) / 86_400_000);
}

function configuredTerritory(repCode: string) {
  const entries = clean(process.env.PORTAL_REP_TERRITORIES)
    .split("|")
    .map((entry) => entry.split(":"))
    .map(([code, value]) => [clean(code).toUpperCase(), clean(value)] as const);
  return entries.find(([code]) => code === repCode)?.[1] || "Not configured";
}

function repTerritory(rows: DashboardV1AdminRow[], repCode: string) {
  const configured = configuredTerritory(repCode);
  if (configured !== "Not configured") return configured;
  const territories = [...new Set(rows.map((row) => clean(row.territory)).filter(Boolean))].sort();
  if (!territories.length) return "Not configured";
  if (territories.length <= 3) return territories.join(" · ");
  return `${territories.length} assigned territories`;
}

function aggregateProducts(rows: DashboardV1AdminRow[]) {
  const raw = PRODUCT_DEFINITIONS.map((definition) => {
    const totals = rows.reduce(
      (result, row) => {
        const values = definition.getValue(row);
        result.cm += number(values?.cm);
        result.pm += number(values?.pm);
        result.ppm += number(values?.ppm);
        return result;
      },
      { cm: 0, pm: 0, ppm: 0 }
    );
    return { definition, totals };
  });

  const categoryTotals = new Map<string, number>();
  for (const item of raw) {
    categoryTotals.set(
      item.definition.category,
      (categoryTotals.get(item.definition.category) ?? 0) + item.totals.cm
    );
  }

  return raw.map(({ definition, totals }): EmployeeProductUsage => ({
    key: definition.key,
    label: definition.label,
    category: definition.category,
    ...totals,
    cmMixPercent:
      (categoryTotals.get(definition.category) ?? 0) > 0
        ? (totals.cm / (categoryTotals.get(definition.category) ?? 1)) * 100
        : null,
    pmChange: totals.pm - totals.ppm,
    sourceFields: definition.sourceFields,
  }));
}

function customerProductUsage(row: DashboardV1AdminRow) {
  return Object.fromEntries(
    PRODUCT_DEFINITIONS.map((definition) => [
      definition.key,
      definition.getValue(row) ?? { cm: 0, pm: 0, ppm: 0 },
    ])
  );
}

function customerReasons(row: DashboardV1AdminRow) {
  const reasons: string[] = [];
  if (row.pmSales < row.ppmSales) reasons.push(`Sales declined from $${Math.round(row.ppmSales).toLocaleString()} PPM to $${Math.round(row.pmSales).toLocaleString()} PM.`);
  if (row.pmJobs < row.ppmJobs) reasons.push(`Jobs declined from ${row.ppmJobs.toLocaleString()} PPM to ${row.pmJobs.toLocaleString()} PM.`);
  if (row.cmJobs === 0 && row.pmJobs > 0) reasons.push("No current-month jobs are recorded after prior-month activity.");
  if (row.authorizedUsers === 0) reasons.push("No authorized customer portal user is assigned.");
  if (row.priceListCodes.length === 0) reasons.push("No price list is assigned.");
  if (!row.salesRepCode) reasons.push("Sales-rep mapping is missing; this account is excluded from rep dashboards.");
  return reasons;
}

function customerRisk(row: DashboardV1AdminRow, reasons: string[]): EmployeeCustomerRow["risk"] {
  if (row.cmJobs === 0 && row.pmJobs > 0) return "critical";
  if (row.pmSales < row.ppmSales || row.pmJobs < row.ppmJobs) return "attention";
  if (row.authorizedUsers === 0 || row.priceListCodes.length === 0) return "opportunity";
  return reasons.length ? "attention" : "healthy";
}

function recommendation(row: DashboardV1AdminRow, reasons: string[]) {
  if (row.cmJobs === 0 && row.pmJobs > 0) return "Contact today to confirm ordering status.";
  if (row.pmSales < row.ppmSales) return "Review the sales decline and customer product mix.";
  if (row.pmJobs < row.ppmJobs) return "Review the job decline and ordering cadence.";
  if (row.authorizedUsers === 0) return "Identify and invite an authorized portal user.";
  if (row.priceListCodes.length === 0) return "Confirm and assign the correct price list.";
  if (reasons.length) return "Review the account data-quality warning.";
  return "Maintain the relationship and monitor current-month activity.";
}

function buildCustomers(rows: DashboardV1AdminRow[]) {
  return rows.map((row): EmployeeCustomerRow => {
    const reasons = customerReasons(row);
    return {
      businessName: row.businessName,
      acctId: row.acctId,
      accountNumbers: row.accountNumbers,
      lab: row.lab,
      customerType: row.customerType,
      locationCount: row.locationCount,
      cmJobs: row.cmJobs,
      pmJobs: row.pmJobs,
      ppmJobs: row.ppmJobs,
      cmSales: row.cmSales,
      pmSales: row.pmSales,
      ppmSales: row.ppmSales,
      cmJpd: row.cmJpd,
      pmJpd: row.pmJpd,
      ppmJpd: row.ppmJpd,
      latestShipDate: row.latestShipDate,
      portalUserCount: row.authorizedUsers,
      portalUserEmail: row.authorizedUserEmails.find(Boolean) || "",
      priceListCodes: row.priceListCodes,
      recommendation: recommendation(row, reasons),
      reasons,
      risk: customerRisk(row, reasons),
      productUsage: customerProductUsage(row),
    };
  });
}

function buildOpportunities(customers: EmployeeCustomerRow[]) {
  const opportunities: EmployeeOpportunity[] = [];
  for (const customer of customers) {
    for (const [index, reason] of customer.reasons.entries()) {
      const lower = reason.toLowerCase();
      const tone = lower.includes("no current-month")
        ? "critical"
        : lower.includes("declined")
          ? "warning"
          : lower.includes("missing")
            ? "quality"
            : "opportunity";
      opportunities.push({
        id: `${customer.acctId}-${index}`,
        title: customer.recommendation,
        reason,
        sourceMetrics: `${customer.cmJobs} CM jobs · ${customer.pmJobs} PM jobs · $${Math.round(customer.cmSales).toLocaleString()} CM sales · $${Math.round(customer.pmSales).toLocaleString()} PM sales`,
        accountId: customer.acctId,
        accountName: customer.businessName,
        tone,
      });
    }
  }
  const rank = { critical: 0, warning: 1, opportunity: 2, quality: 3 };
  return opportunities.sort((a, b) => rank[a.tone] - rank[b.tone]).slice(0, 24);
}

function aggregateHistory(
  history: ReturnType<typeof scopeNetSalesHistory>,
  anchor: Date
) {
  if (history.status !== "ready") return [];
  const totals = new Map<string, { total: number; hasMissing: boolean }>();
  for (const row of history.rows) {
    const current = totals.get(row.month) ?? { total: 0, hasMissing: false };
    if (row.net_sales === null) current.hasMissing = true;
    else current.total += row.net_sales;
    totals.set(row.month, current);
  }

  return Array.from({ length: 14 }, (_, index): EmployeeMonthlySalesPoint => {
    const offset = index - 13;
    const date = shiftMonth(anchor, offset);
    const key = monthKey(date);
    const previousKey = monthKey(shiftMonth(date, -13));
    const current = totals.get(key);
    const previous = totals.get(previousKey);
    return {
      month: key,
      label: monthLabel(date),
      netSales: current && !current.hasMissing ? current.total : null,
      previousPeriodNetSales: previous && !previous.hasMissing ? previous.total : null,
      currentMonth: offset === 0,
      completedMonth: offset < 0,
    };
  });
}

function historyMetric(
  points: EmployeeMonthlySalesPoint[],
  filter: (point: EmployeeMonthlySalesPoint) => boolean,
  detail: string,
  fallbackState: DashboardMetricState
) {
  const selected = points.filter(filter);
  if (!selected.length || selected.some((point) => point.netSales === null)) {
    return metric(null, detail, fallbackState);
  }
  return metric(selected.reduce((total, point) => total + number(point.netSales), 0), detail);
}

export function employeeRepOptions() {
  const rows = getDashboardV1AdminRows();
  const options = new Map<string, string>();
  for (const row of rows) {
    const code = normalizeSalesRepCode(row.salesRepCode);
    if (!code) continue;
    options.set(code, row.salesRep || salesRepLabel(code) || code);
  }
  return [...options.entries()]
    .map(([code, label]) => ({ code, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function createPreviewRepRole(repCode: string): PortalStaffRole | undefined {
  const code = normalizeSalesRepCode(repCode);
  const option = employeeRepOptions().find((entry) => entry.code === code);
  if (!option) return undefined;
  return { kind: "sales-rep", email: "", repCode: code, label: option.label };
}

export function buildEmployeeDashboard(
  viewerRole: PortalStaffRole,
  previewRepCode?: string
): EmployeeDashboardModel | undefined {
  const previewRole =
    viewerRole.kind === "admin" && previewRepCode
      ? createPreviewRepRole(previewRepCode)
      : undefined;
  const scopedRole = viewerRole.kind === "sales-rep" ? viewerRole : previewRole;
  if (!scopedRole || scopedRole.kind !== "sales-rep") return undefined;

  const allRows = getDashboardV1AdminRows();
  const rows = filterRowsForPortalRole(scopedRole, allRows);
  const manifest = getDashboardV1Manifest();
  const refreshDate = clean(manifest?.data_refresh_date);
  const anchor = parseDate(refreshDate) ?? new Date();
  const cmDate = shiftMonth(anchor, 0);
  const pmDate = shiftMonth(anchor, -1);
  const ppmDate = shiftMonth(anchor, -2);
  const staleAge = daysOld(refreshDate);
  const stale = staleAge > 2;
  const products = aggregateProducts(rows);
  const customers = buildCustomers(rows);
  const scopedHistory = scopeNetSalesHistory(
    loadNetSalesHistory(),
    scopedRole.repCode,
    rows.map((row) => row.acctId)
  );
  const salesPoints = aggregateHistory(scopedHistory, anchor);
  const historyFallback: DashboardMetricState =
    scopedHistory.status === "error" ? "error" : "not-configured";
  const completedPoints = salesPoints.filter((point) => point.completedMonth);
  const currentPoint = salesPoints.find((point) => point.currentMonth);
  const previousPoint = completedPoints.at(-1);
  const currentMonthSales =
    currentPoint?.netSales ?? sum(rows, (row) => row.cmSales);
  const previousMonthSales =
    previousPoint?.netSales ?? sum(rows, (row) => row.pmSales);
  const momChange =
    previousMonthSales === 0
      ? currentMonthSales === 0
        ? 0
        : null
      : (currentMonthSales - previousMonthSales) / Math.abs(previousMonthSales);
  const activeCustomers = customers.filter((customer) => customer.cmJobs > 0).length;
  const decliningCustomers = customers.filter(
    (customer) => customer.pmSales < customer.ppmSales || customer.pmJobs < customer.ppmJobs
  ).length;
  const attentionCustomers = customers.filter((customer) => customer.risk !== "healthy").length;
  const sourceFields = new Set(
    manifest?.data_dictionary?.flatMap((entry) => entry.fields) ?? []
  );
  const dataQuality: string[] = [];
  if (!rows.length) dataQuality.push("No assigned accounts were found for this rep mapping. Access remains fail-closed.");
  if (repTerritory(rows, scopedRole.repCode) === "Not configured") dataQuality.push("Territory is missing from the synchronized Power BI account export.");
  const missingProductFields = PRODUCT_DEFINITIONS.flatMap((definition) => definition.sourceFields).filter((field) => !sourceFields.has(field));
  if (missingProductFields.length) dataQuality.push(`${missingProductFields.length} product source fields are absent from the current export contract; affected products remain labeled, not silently regrouped.`);
  if (scopedHistory.status !== "ready") dataQuality.push(scopedHistory.message);
  const ytdPoints = salesPoints.filter((point) => point.month.startsWith(`${anchor.getUTCFullYear()}-`));

  return {
    viewer: {
      email: viewerRole.email,
      isAdmin: viewerRole.kind === "admin",
      previewingRep: viewerRole.kind === "admin",
    },
    profile: {
      name: scopedRole.label,
      email: scopedRole.email,
      repCode: scopedRole.repCode,
      labs: [...new Set(rows.map((row) => row.lab).filter((lab) => lab && lab !== "—"))].sort(),
      territory: repTerritory(rows, scopedRole.repCode),
    },
    currentDate: new Intl.DateTimeFormat("en-US", {
      dateStyle: "full",
      timeZone: POWER_BI_PRODUCTION_SOURCE.timezone,
    }).format(new Date()),
    periodDefinitions: {
      cm: monthLabel(cmDate, "long"),
      pm: monthLabel(pmDate, "long"),
      ppm: monthLabel(ppmDate, "long"),
      tooltip: "CM is the calendar month containing the source refresh date. PM is the immediately completed prior month. PPM is the month before PM.",
      timezone: POWER_BI_PRODUCTION_SOURCE.timezone,
    },
    freshness: {
      refreshDate,
      generatedAt: clean(manifest?.generated_at),
      stale,
      warning: !refreshDate
        ? "The source refresh date is missing."
        : stale
          ? `The loaded performance snapshot is ${staleAge} days old.`
          : "The loaded performance snapshot is current.",
    },
    metrics: {
      currentMonthNetSales: metric(currentMonthSales, currentPoint?.netSales !== null && currentPoint ? `${POWER_BI_PRODUCTION_SOURCE.measure}, current partial month.` : "Current synchronized Power BI sales alias; Net Sales history is not connected."),
      previousMonthNetSales: metric(previousMonthSales, previousPoint?.netSales !== null && previousPoint ? `${POWER_BI_PRODUCTION_SOURCE.measure}, most recent completed month.` : "Previous-month synchronized Power BI sales alias; Net Sales history is not connected."),
      trailing13MonthNetSales: historyMetric(completedPoints, () => true, "Requires 13 completed account-grain months from the verified Net Sales measure.", historyFallback),
      yearToDateNetSales: historyMetric(ytdPoints, () => true, "Requires account-grain monthly Net Sales history for the current year.", historyFallback),
      monthOverMonthChange: metric(momChange, "Current partial month compared with the immediately completed month."),
      assignedCustomers: metric(rows.length, "Accounts whose synchronized rep code matches this profile."),
      activeCustomers: metric(activeCustomers, "Assigned customers with at least one current-month job."),
      decliningCustomers: metric(decliningCustomers, "Completed-month sales or jobs declined from PPM to PM."),
      attentionCustomers: metric(attentionCustomers, "Assigned customers with an explainable risk, setup, or data-quality reason."),
    },
    salesHistory: {
      status: scopedHistory.status,
      message:
        scopedHistory.status === "ready"
          ? `Loaded ${scopedHistory.rows.length.toLocaleString()} authorized account-month rows.`
          : scopedHistory.message,
      points: salesPoints,
      source: {
        ...POWER_BI_PRODUCTION_SOURCE,
        dateField:
          scopedHistory.status === "ready"
            ? scopedHistory.manifest.date_field
            : "Must be confirmed in the account-grain export contract",
        refreshFrequency: "Production semantic model is scheduled daily; the portal bundle currently synchronizes six times daily after upstream refreshes.",
        currentRefreshStatus: "Verified August 19, 2026 at 6:13 PM CT; next scheduled refresh shown as August 20, 2026 at 6:00 AM CT.",
        behavior: "History is filtered server-side by rep code and authorized account IDs. Missing, stale, or invalid files render a configuration/error state; values are never fabricated.",
      },
    },
    products,
    customers,
    opportunities: buildOpportunities(customers),
    dataQuality,
  };
}
