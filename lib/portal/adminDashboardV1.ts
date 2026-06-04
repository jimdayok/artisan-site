import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { canonicalPriceListCode } from "@/lib/portal/priceLists";
import type {
  PortalDashboardV1Account,
  PortalDashboardV1MonthlyNumber,
  PortalDashboardV1SupplementalIntelligence,
} from "@/lib/portal/dashboardV1";

const DASHBOARD_V1_DIR = path.join(
  process.cwd(),
  "private-source",
  "portal",
  "dashboard-v1",
  "current"
);

export type DashboardV1AdminManifest = {
  snapshot_id: string;
  generated_at: string;
  data_refresh_date: string;
  row_count_output_accounts: number;
};

export type DashboardV1AdminAccount = {
  account_id: string;
  business_name: string;
  all_account_numbers: string;
  customer_type?: string;
  sales_rep?: string;
  lab?: string;
  state?: string;
  latest_date_shipped?: string;
  data_refresh_date?: string;
  cm_sales?: number;
  cm_jobs?: number;
  cm_jpd?: number | null;
  authorized_user_count?: number;
  price_lists?: string[];
};

export type DashboardV1QualityTrend = {
  ppm: number;
  pm: number;
  cm: number;
};

export type DashboardV1ProgramFlags = {
  modernPackage: boolean;
  modernFrame: boolean;
  chemclip: boolean;
  speccheck: boolean;
  tokai: boolean;
};

export type DashboardV1AuthorizedUser = {
  name: string;
  email: string;
  roleType: string;
  marketingStatus: string;
};

export type DashboardV1AdminRow = {
  businessName: string;
  acctId: string;
  accountNumbers: string;
  division: string;
  customerType: string;
  salesRep: string;
  lab: string;
  state: string;
  address: string;
  phone: string;
  latestShipDate: string;
  dataRefreshDate: string;
  tier: string;
  ppmSales: number;
  pmSales: number;
  cmSales: number;
  ppmJobs: number;
  pmJobs: number;
  cmJobs: number;
  ppmJpd: number | null;
  pmJpd: number | null;
  cmJpd: number | null;
  ppmSalesPerDay: number | null;
  pmSalesPerDay: number | null;
  cmSalesPerDay: number | null;
  vspShare: number | null;
  privatePayMix: number | null;
  vspJobs: number;
  sqlJobs: number;
  netLensJobs: number;
  brandUsage: NonNullable<PortalDashboardV1SupplementalIntelligence["brand_usage"]>;
  materialUsage: NonNullable<PortalDashboardV1SupplementalIntelligence["material_usage"]>;
  specialtyUsage: NonNullable<PortalDashboardV1SupplementalIntelligence["specialty_usage"]>;
  turnaroundAverageDays: PortalDashboardV1MonthlyNumber;
  labTurnaroundAverageDays: PortalDashboardV1MonthlyNumber;
  rewards: NonNullable<PortalDashboardV1SupplementalIntelligence["rewards"]>;
  quality: {
    labRedoPct: DashboardV1QualityTrend;
    officeRedoPct: DashboardV1QualityTrend;
    warrantyPct: DashboardV1QualityTrend;
    nonAdaptPct: DashboardV1QualityTrend;
  };
  programs: DashboardV1ProgramFlags;
  authorizedUsers: number;
  authorizedUserEmails: string[];
  authorizedUserDetails: DashboardV1AuthorizedUser[];
  priceListCodes: string[];
  priceLists: string;
  rawAccount?: PortalDashboardV1Account;
};

function readJson<T>(filePath: string): T | undefined {
  if (!existsSync(filePath)) return undefined;
  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as T;
  } catch {
    return undefined;
  }
}

function accountNumbersList(raw: string) {
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function accountFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function trendValue(value: unknown): DashboardV1QualityTrend {
  const record = value as { ppm?: unknown; pm?: unknown; cm?: unknown } | undefined;
  return {
    ppm: Number(record?.ppm ?? 0) || 0,
    pm: Number(record?.pm ?? 0) || 0,
    cm: Number(record?.cm ?? 0) || 0,
  };
}

function readAccountDetail(accountId: string) {
  return readJson<PortalDashboardV1Account>(
    path.join(DASHBOARD_V1_DIR, "accounts", `${accountFileName(accountId)}.json`)
  );
}

function normalizePct(value: unknown) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return numeric <= 1 ? numeric * 100 : numeric;
}

function calculateJpd(jobs: number) {
  return jobs > 0 ? jobs / 22 : null;
}

function calculateSalesPerDay(sales: number, jobs: number, jobsPerDay: number | null) {
  if (sales <= 0 || jobs <= 0 || !jobsPerDay || jobsPerDay <= 0) return null;
  return sales / (jobs / jobsPerDay);
}

function parseCustomerType(division: string) {
  const code = (division || "").trim().toUpperCase();
  if (!code) return "—";
  return code;
}

function monthlyNumber(value: unknown): PortalDashboardV1MonthlyNumber {
  const record = value as { ppm?: unknown; pm?: unknown; cm?: unknown } | undefined;
  return {
    ppm: Number(record?.ppm ?? 0) || 0,
    pm: Number(record?.pm ?? 0) || 0,
    cm: Number(record?.cm ?? 0) || 0,
  };
}

export function getDashboardV1Manifest() {
  return readJson<DashboardV1AdminManifest>(
    path.join(DASHBOARD_V1_DIR, "latest_snapshot_manifest.json")
  );
}

export function getDashboardV1AdminRows() {
  const accountsIndexPath = path.join(DASHBOARD_V1_DIR, "accounts_index.json");
  const accountsIndex = readJson<DashboardV1AdminAccount[]>(accountsIndexPath) ?? [];
  if (!accountsIndex.length) return [];

  const rows: DashboardV1AdminRow[] = [];
  for (const account of accountsIndex) {
    const detail = readAccountDetail(account.account_id);
    const jobs = detail?.purchase_summary?.jobs;
    const sales = detail?.purchase_summary?.sales;
    const quality = detail?.quality_metrics;
    const supplemental = detail?.supplemental_intelligence;
    const programFlags = detail?.program_usage?.flags;
    const priceListCodes = [
      ...new Set(
        (detail?.used_price_lists ?? account.price_lists ?? [])
          .map((entry) => canonicalPriceListCode(String(entry || "")))
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b));
    const ppmJobs = Number(jobs?.ppm ?? 0);
    const pmJobs = Number(jobs?.pm ?? 0);
    const cmJobs = Number(jobs?.cm ?? account.cm_jobs ?? 0);
    const ppmSales = Number(sales?.ppm ?? 0);
    const pmSales = Number(sales?.pm ?? 0);
    const cmSales = Number(sales?.cm ?? account.cm_sales ?? 0);
    const ppmJpd = calculateJpd(ppmJobs);
    const pmJpd = calculateJpd(pmJobs);
    const explicitCmJpd =
      typeof account.cm_jpd === "number" && Number.isFinite(account.cm_jpd)
        ? account.cm_jpd
        : null;
    const cmJpd = explicitCmJpd ?? calculateJpd(cmJobs);

    rows.push({
      businessName: account.business_name || "Unknown",
      acctId: account.account_id,
      accountNumbers: account.all_account_numbers || "—",
      division: parseCustomerType(account.customer_type || ""),
      customerType: parseCustomerType(account.customer_type || ""),
      salesRep: account.sales_rep || "—",
      lab: detail?.lab_name || account.lab || "—",
      state: detail?.state || account.state || "",
      address: detail?.address || "",
      phone: detail?.phone || "",
      latestShipDate: detail?.latest_ship_date || account.latest_date_shipped || "",
      dataRefreshDate: detail?.data_refresh_date || account.data_refresh_date || "",
      tier: detail?.tier_status?.previous_month_tier_rank_by_acct_id || "Unranked",
      ppmSales,
      pmSales,
      cmSales,
      ppmJobs,
      pmJobs,
      cmJobs,
      ppmJpd,
      pmJpd,
      cmJpd,
      ppmSalesPerDay: calculateSalesPerDay(ppmSales, ppmJobs, ppmJpd),
      pmSalesPerDay: calculateSalesPerDay(pmSales, pmJobs, pmJpd),
      cmSalesPerDay: calculateSalesPerDay(cmSales, cmJobs, cmJpd),
      vspShare: normalizePct(detail?.vsp_private_pay_mix?.vsp_share),
      privatePayMix: normalizePct(detail?.vsp_private_pay_mix?.private_pay_mix),
      vspJobs: Number(detail?.vsp_private_pay_mix?.vsp_jobs?.cm ?? 0),
      sqlJobs: Number(detail?.product_mix?.sql_jobs?.cm ?? 0),
      netLensJobs: Number(detail?.product_mix?.net_lens_jobs?.cm ?? 0),
      brandUsage: {
        hoya_jobs: monthlyNumber(supplemental?.brand_usage?.hoya_jobs),
        shamir_jobs: monthlyNumber(supplemental?.brand_usage?.shamir_jobs),
        tokai_jobs: monthlyNumber(supplemental?.brand_usage?.tokai_jobs),
        varilux_jobs: monthlyNumber(supplemental?.brand_usage?.varilux_jobs),
        neurolens_jobs: monthlyNumber(supplemental?.brand_usage?.neurolens_jobs),
        sequel_jobs: monthlyNumber(supplemental?.brand_usage?.sequel_jobs),
        iot_artisan_jobs: monthlyNumber(supplemental?.brand_usage?.iot_artisan_jobs),
      },
      materialUsage: {
        plastic_jobs: monthlyNumber(supplemental?.material_usage?.plastic_jobs),
        trivex_jobs: monthlyNumber(supplemental?.material_usage?.trivex_jobs),
        hi_index_160_jobs: monthlyNumber(supplemental?.material_usage?.hi_index_160_jobs),
        hi_index_167_jobs: monthlyNumber(supplemental?.material_usage?.hi_index_167_jobs),
        hi_index_174_jobs: monthlyNumber(supplemental?.material_usage?.hi_index_174_jobs),
      },
      specialtyUsage: {
        photochromic_jobs: monthlyNumber(supplemental?.specialty_usage?.photochromic_jobs),
        polarized_jobs: monthlyNumber(supplemental?.specialty_usage?.polarized_jobs),
        multiple_pair_jobs: monthlyNumber(supplemental?.specialty_usage?.multiple_pair_jobs),
      },
      turnaroundAverageDays: monthlyNumber(supplemental?.turnaround?.average_days),
      labTurnaroundAverageDays: monthlyNumber(supplemental?.turnaround?.lab_average_days),
      rewards: supplemental?.rewards ?? {},
      quality: {
        labRedoPct: trendValue(quality?.lab_redo_pct),
        officeRedoPct: trendValue(quality?.office_redo_pct),
        warrantyPct: trendValue(quality?.warranty_pct),
        nonAdaptPct: trendValue(quality?.non_adapt_pct),
      },
      programs: {
        modernPackage: Boolean(programFlags?.modern_package),
        modernFrame: Boolean(programFlags?.modern_frame),
        chemclip: Boolean(programFlags?.chemclip),
        speccheck: Boolean(programFlags?.speccheck),
        tokai: Boolean(programFlags?.tokai),
      },
      authorizedUsers: Number(
        detail?.authorized_users_summary?.authorized_user_count ??
          account.authorized_user_count ??
          0
      ),
      authorizedUserEmails:
        detail?.authorized_users_summary?.primary_emails?.filter(Boolean) ?? [],
      authorizedUserDetails:
        detail?.authorized_users?.map((user) => ({
          name: user.name || "",
          email: user.email || "",
          roleType: user.role_type || "",
          marketingStatus: user.marketing_status || "",
        })) ?? [],
      priceListCodes,
      priceLists: priceListCodes.join(", "),
      rawAccount: detail,
    });
  }

  return rows.sort((a, b) => a.businessName.localeCompare(b.businessName));
}

export function getDashboardV1Accounts() {
  return (
    readJson<DashboardV1AdminAccount[]>(
      path.join(DASHBOARD_V1_DIR, "accounts_index.json")
    ) ?? []
  );
}

export function resolveDashboardV1AcctId(input: string) {
  const normalizedInput = (input || "").trim().toUpperCase();
  if (!normalizedInput) return { acctId: "", legacyAccountNumber: "" };

  const rows = getDashboardV1AdminRows();
  const byAcctId = rows.find((row) => row.acctId.toUpperCase() === normalizedInput);
  if (byAcctId) {
    const firstLegacy = accountNumbersList(byAcctId.accountNumbers)[0] || "";
    return { acctId: byAcctId.acctId, legacyAccountNumber: firstLegacy };
  }

  const byLegacy = rows.find((row) =>
    accountNumbersList(row.accountNumbers).some(
      (entry) => entry.toUpperCase() === normalizedInput
    )
  );
  if (byLegacy) {
    const firstLegacy = accountNumbersList(byLegacy.accountNumbers)[0] || normalizedInput;
    return { acctId: byLegacy.acctId, legacyAccountNumber: firstLegacy };
  }

  return { acctId: normalizedInput, legacyAccountNumber: normalizedInput };
}
