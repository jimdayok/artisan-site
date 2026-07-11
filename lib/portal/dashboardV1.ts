import "server-only";

import { portalDashboardV1Bundle } from "@/lib/portal/dashboardV1Bundle";
import { normalizeAccountNumber } from "@/lib/portal/normalizeAccounts";

export type PortalDashboardV1Manifest = {
  snapshot_id: string;
  source_account_file: string;
  source_account_files?: string[];
  source_user_file: string;
  generated_at: string;
  row_count_input_accounts: number;
  row_count_effective_accounts: number;
  row_count_output_accounts: number;
  row_count_input_users: number;
  row_count_users_with_account_id: number;
  unique_user_emails: number;
  users_mapped_to_accounts: number;
  accounts_without_users: number;
  users_with_invalid_account_ids: number;
  data_refresh_date: string;
  allow_duplicate_acct_id: boolean;
  ignore_empty_summary_rows: boolean;
  allow_invalid_user_account_links: boolean;
  duplicate_acct_id_count: number;
  skipped_summary_rows: number;
  refresh_dates_detected: string[];
  data_dictionary?: Array<{
    source_file: string;
    row_count: number;
    fields: string[];
  }>;
  field_precedence_documentation?: string[];
  reused_existing_user_access?: boolean;
};

export type PortalDashboardV1MonthlyNumber = {
  ppm: number;
  pm: number;
  cm: number;
};

export type PortalDashboardV1SupplementalIntelligence = {
  brand_usage?: {
    hoya_jobs?: PortalDashboardV1MonthlyNumber;
    shamir_jobs?: PortalDashboardV1MonthlyNumber;
    tokai_jobs?: PortalDashboardV1MonthlyNumber;
    varilux_jobs?: PortalDashboardV1MonthlyNumber;
    neurolens_jobs?: PortalDashboardV1MonthlyNumber;
    sequel_jobs?: PortalDashboardV1MonthlyNumber;
    iot_artisan_jobs?: PortalDashboardV1MonthlyNumber;
  };
  material_usage?: {
    plastic_jobs?: PortalDashboardV1MonthlyNumber;
    trivex_jobs?: PortalDashboardV1MonthlyNumber;
    hi_index_160_jobs?: PortalDashboardV1MonthlyNumber;
    hi_index_167_jobs?: PortalDashboardV1MonthlyNumber;
    hi_index_174_jobs?: PortalDashboardV1MonthlyNumber;
  };
  specialty_usage?: {
    photochromic_jobs?: PortalDashboardV1MonthlyNumber;
    polarized_jobs?: PortalDashboardV1MonthlyNumber;
    multiple_pair_jobs?: PortalDashboardV1MonthlyNumber;
  };
  turnaround?: {
    average_days?: PortalDashboardV1MonthlyNumber;
    lab_average_days?: PortalDashboardV1MonthlyNumber;
  };
  rewards?: {
    arpmp26?: {
      enrolled: boolean;
      qualified_pmp_jobs: PortalDashboardV1MonthlyNumber;
      rebate_total: PortalDashboardV1MonthlyNumber;
    };
    aruty26?: {
      enrolled: boolean;
      qualified_jobs: PortalDashboardV1MonthlyNumber;
      rewards_earned: PortalDashboardV1MonthlyNumber;
    };
    arsql26?: {
      enrolled: boolean;
      qualified_sequel_pal_jobs: PortalDashboardV1MonthlyNumber;
      rebate_total: PortalDashboardV1MonthlyNumber;
    };
  };
};

export type PortalDashboardV1Account = {
  account_id: string;
  pipedrive_id: string;
  business_name: string;
  all_account_numbers: string;
  address: string;
  division: string;
  latest_ship_date: string;
  primary_pal_brand_private_pay: string;
  primary_pal_brand_vsp: string;
  lab_name: string;
  phone: string;
  state: string;
  sales_rep?: string;
  used_price_lists?: string[];
  data_refresh_date: string;
  tier_status: {
    previous_month_tier_rank_by_acct_id: string;
  };
  purchase_summary: {
    jobs: { ppm: number; pm: number; cm: number };
    sales: { ppm: number; pm: number; cm: number };
  };
  performance_rates?: {
    jobs_per_day?: PortalDashboardV1MonthlyNumber;
  };
  product_mix: {
    net_lens_jobs: { ppm: number; pm: number; cm: number };
    sql_jobs: { ppm: number; pm: number; cm: number };
  };
  vsp_private_pay_mix: {
    vsp_jobs: { ppm: number; pm: number; cm: number };
    net_lens_share: number;
    sql_share: number;
    vsp_share: number;
    private_pay_mix: number;
    primary_pal_brand_private_pay: string;
    primary_pal_brand_vsp: string;
  };
  program_usage: {
    modern_package_usage: string;
    modern_frame_usage: string;
    chemclip_usage: string;
    speccheck_usage: string;
    tokai_usage: string;
    flags: {
      modern_package: boolean;
      modern_frame: boolean;
      chemclip: boolean;
      speccheck: boolean;
      tokai: boolean;
    };
  };
  quality_metrics?: {
    lab_redo_pct: { ppm: number; pm: number; cm: number };
    office_redo_pct: { ppm: number; pm: number; cm: number };
    warranty_pct: { ppm: number; pm: number; cm: number };
    non_adapt_pct: { ppm: number; pm: number; cm: number };
  };
  program_enrollment?: {
    arsql26: boolean;
    arpmp26: boolean;
    aruty26: boolean;
  };
  supplemental_intelligence?: PortalDashboardV1SupplementalIntelligence;
  data_lineage?: {
    source_files: string[];
    field_precedence: Record<string, string>;
  };
  customer_insights: {
    suggestions?: string[];
    metrics?: Record<string, number | string>;
  };
  authorized_users_summary: {
    authorized_user_count: number;
    primary_emails: string[];
    marketing_status_summary: Record<string, number>;
  };
  authorized_users?: Array<{
    name: string;
    email: string;
    role_type: string;
    marketing_status: string;
    organization: string;
    targeted_programs?: string;
  }>;
};

export type PortalDashboardV1State = {
  status: "ok" | "missing-account" | "missing-snapshot";
  account?: PortalDashboardV1Account;
  manifest?: PortalDashboardV1Manifest;
  stale: boolean;
  staleReason?: string;
};

export type PortalPeerBenchmarks = {
  cohortSize: number;
  medianWarrantyPct: number | null;
  medianOfficeRedoPct: number | null;
  medianNonAdaptPct: number | null;
  medianTurnaroundDays: number | null;
  growthPercentile: number | null;
};

type DashboardV1IndexRow = {
  account_id?: string;
  all_account_numbers?: string;
};

function getAccountsIndex() {
  return portalDashboardV1Bundle.accountsIndex as DashboardV1IndexRow[];
}

function normalizeAcctId(value: string) {
  return String(value || "").trim().toUpperCase();
}

function resolveAccountId(input: string) {
  const normalizedInput = normalizeAcctId(input);
  if (!normalizedInput) return "";

  const index = getAccountsIndex();
  const direct = index.find(
    (row) => normalizeAcctId(row.account_id || "") === normalizedInput
  );
  if (direct?.account_id) return direct.account_id;

  const byLegacy = index.find((row) =>
    String(row.all_account_numbers || "")
      .split(",")
      .map((entry) => normalizeAccountNumber(entry))
      .some((entry) => entry && entry === normalizeAccountNumber(normalizedInput))
  );
  if (byLegacy?.account_id) return byLegacy.account_id;

  return normalizedInput;
}

function getManifest() {
  return portalDashboardV1Bundle.manifest ?? undefined;
}

function calendarDayDiffFromToday(refreshDate: string) {
  const parts = refreshDate.split("-").map((value) => Number(value));
  if (parts.length !== 3 || parts.some((value) => !Number.isFinite(value))) return Number.NaN;

  const [year, month, day] = parts;
  const refreshUtc = Date.UTC(year, month - 1, day);
  const now = new Date();
  const todayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );

  return Math.floor((todayUtc - refreshUtc) / (1000 * 60 * 60 * 24));
}

function isStale(manifest?: PortalDashboardV1Manifest) {
  if (!manifest) return { stale: true, staleReason: "Snapshot manifest missing." };

  const refreshDate = manifest.data_refresh_date;
  if (!refreshDate) return { stale: true, staleReason: "Data refresh date missing." };

  const ageDays = calendarDayDiffFromToday(refreshDate);
  if (!Number.isFinite(ageDays)) {
    return { stale: true, staleReason: "Data refresh date invalid." };
  }

  if (ageDays > 2) {
    return {
      stale: true,
      staleReason: `Snapshot data is ${ageDays} days old (data refresh date ${refreshDate}).`,
    };
  }

  return { stale: false as const, staleReason: "" };
}

export function getPortalDashboardV1ByAccount(accountNumber?: string): PortalDashboardV1State {
  const manifest = getManifest();
  const staleState = isStale(manifest);

  if (!manifest || portalDashboardV1Bundle.accountsIndex.length === 0) {
    return {
      status: "missing-snapshot",
      manifest,
      stale: true,
      staleReason: "Dashboard data bundle is missing.",
    };
  }

  const normalized = resolveAccountId(accountNumber ?? "");
  if (!normalized) {
    return {
      status: "missing-account",
      manifest,
      stale: staleState.stale,
      staleReason: staleState.staleReason,
    };
  }

  const account = portalDashboardV1Bundle.accountsById[normalized];

  if (!account) {
    return {
      status: "missing-account",
      manifest,
      stale: staleState.stale,
      staleReason: staleState.staleReason,
    };
  }

  return {
    status: "ok",
    account,
    manifest,
    stale: staleState.stale,
    staleReason: staleState.staleReason,
  };
}

function median(values: number[]) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function getPortalPeerBenchmarks(accountNumber?: string): PortalPeerBenchmarks {
  const resolvedAccountId = resolveAccountId(accountNumber ?? "");
  const accounts = Object.values(portalDashboardV1Bundle.accountsById as Record<string, PortalDashboardV1Account>)
    .filter((account) => account.account_id !== resolvedAccountId)
    .filter((account) => account.purchase_summary.jobs.pm > 0);
  const currentAccount = resolvedAccountId
    ? (portalDashboardV1Bundle.accountsById as Record<string, PortalDashboardV1Account>)[resolvedAccountId]
    : undefined;
  const peerGrowth = accounts
    .filter((account) => account.purchase_summary.jobs.ppm > 0)
    .map((account) =>
      ((account.purchase_summary.jobs.pm - account.purchase_summary.jobs.ppm) /
        account.purchase_summary.jobs.ppm) *
      100
    );
  const currentGrowth =
    currentAccount && currentAccount.purchase_summary.jobs.ppm > 0
      ? ((currentAccount.purchase_summary.jobs.pm - currentAccount.purchase_summary.jobs.ppm) /
          currentAccount.purchase_summary.jobs.ppm) *
        100
      : null;
  const growthPercentile =
    currentGrowth === null || !peerGrowth.length
      ? null
      : Math.round(
          (peerGrowth.filter((value) => value <= currentGrowth).length / peerGrowth.length) * 100
        );

  return {
    cohortSize: accounts.length,
    medianWarrantyPct: median(
      accounts.map((account) => (account.quality_metrics?.warranty_pct.pm ?? Number.NaN) * 100)
    ),
    medianOfficeRedoPct: median(
      accounts.map((account) => (account.quality_metrics?.office_redo_pct.pm ?? Number.NaN) * 100)
    ),
    medianNonAdaptPct: median(
      accounts.map((account) => (account.quality_metrics?.non_adapt_pct.pm ?? Number.NaN) * 100)
    ),
    medianTurnaroundDays: median(
      accounts.map(
        (account) =>
          account.supplemental_intelligence?.turnaround?.average_days?.pm ?? Number.NaN
      )
    ),
    growthPercentile,
  };
}
