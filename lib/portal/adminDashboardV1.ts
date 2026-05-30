import "server-only";

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

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
  division: string;
  lab_name: string;
  purchase_summary?: {
    sales?: { cm?: number };
    jobs?: { cm?: number };
  };
};

export type DashboardV1AdminRow = {
  businessName: string;
  acctId: string;
  accountNumbers: string;
  customerType: string;
  salesRep: string;
  lab: string;
  cmSales: number;
  cmJobs: number;
  cmJpd: number | null;
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

function parseCustomerType(division: string) {
  const code = (division || "").trim().toUpperCase();
  if (!code) return "—";
  return code;
}

export function getDashboardV1Manifest() {
  return readJson<DashboardV1AdminManifest>(
    path.join(DASHBOARD_V1_DIR, "latest_snapshot_manifest.json")
  );
}

export function getDashboardV1AdminRows() {
  const accountsDir = path.join(DASHBOARD_V1_DIR, "accounts");
  if (!existsSync(accountsDir)) return [];

  const rows: DashboardV1AdminRow[] = [];
  const files = readdirSync(accountsDir).filter((file) => file.endsWith(".json"));
  for (const file of files) {
    const account = readJson<DashboardV1AdminAccount>(path.join(accountsDir, file));
    if (!account) continue;

    rows.push({
      businessName: account.business_name || "Unknown",
      acctId: account.account_id,
      accountNumbers: account.all_account_numbers || "—",
      customerType: parseCustomerType(account.division),
      salesRep: "—", // Not in dashboard v1 export yet.
      lab: account.lab_name || "—",
      cmSales: Number(account.purchase_summary?.sales?.cm ?? 0),
      cmJobs: Number(account.purchase_summary?.jobs?.cm ?? 0),
      cmJpd: null, // Not in dashboard v1 export yet.
    });
  }

  return rows.sort((a, b) => a.businessName.localeCompare(b.businessName));
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
