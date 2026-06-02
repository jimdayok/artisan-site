import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { normalizeAccountNumber } from "@/lib/portal/normalizeAccounts";

const DASHBOARD_V1_DIR = path.join(
  process.cwd(),
  "private-source",
  "portal",
  "dashboard-v1",
  "current"
);

export type PortalDashboardV1Manifest = {
  snapshot_id: string;
  source_account_file: string;
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
  used_price_lists?: string[];
  data_refresh_date: string;
  tier_status: {
    previous_month_tier_rank_by_acct_id: string;
  };
  purchase_summary: {
    jobs: { ppm: number; pm: number; cm: number };
    sales: { ppm: number; pm: number; cm: number };
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
  }>;
};

export type PortalDashboardV1State = {
  status: "ok" | "missing-account" | "missing-snapshot";
  account?: PortalDashboardV1Account;
  manifest?: PortalDashboardV1Manifest;
  stale: boolean;
  staleReason?: string;
};

function readJson<T>(filePath: string): T | undefined {
  if (!existsSync(filePath)) return undefined;
  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as T;
  } catch {
    return undefined;
  }
}

function accountFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}

type DashboardV1IndexRow = {
  account_id?: string;
  all_account_numbers?: string;
};

function getAccountsIndex() {
  return (
    readJson<DashboardV1IndexRow[]>(
      path.join(DASHBOARD_V1_DIR, "accounts_index.json")
    ) ?? []
  );
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
  return readJson<PortalDashboardV1Manifest>(
    path.join(DASHBOARD_V1_DIR, "latest_snapshot_manifest.json")
  );
}

function isStale(manifest?: PortalDashboardV1Manifest) {
  if (!manifest) return { stale: true, staleReason: "Snapshot manifest missing." };

  const refreshDate = manifest.data_refresh_date;
  if (!refreshDate) return { stale: true, staleReason: "Data refresh date missing." };

  const parsed = new Date(`${refreshDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return { stale: true, staleReason: "Data refresh date invalid." };
  }

  const ageMs = Date.now() - parsed.getTime();
  const staleMs = 1000 * 60 * 60 * 24 * 2;
  if (ageMs > staleMs) {
    return { stale: true, staleReason: `Snapshot is older than 2 days (${refreshDate}).` };
  }

  return { stale: false as const, staleReason: "" };
}

export function getPortalDashboardV1ByAccount(accountNumber?: string): PortalDashboardV1State {
  const manifest = getManifest();
  const staleState = isStale(manifest);

  if (!existsSync(DASHBOARD_V1_DIR)) {
    return {
      status: "missing-snapshot",
      manifest,
      stale: true,
      staleReason: "Dashboard v1 snapshot directory is missing.",
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

  const account = readJson<PortalDashboardV1Account>(
    path.join(DASHBOARD_V1_DIR, "accounts", `${accountFileName(normalized)}.json`)
  );

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
