import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { canonicalPriceListCode } from "@/lib/portal/priceLists";

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
  cm_sales?: number;
  cm_jobs?: number;
  cm_jpd?: number | null;
  authorized_user_count?: number;
  price_lists?: string[];
};

export type DashboardV1AdminRow = {
  businessName: string;
  acctId: string;
  accountNumbers: string;
  division: string;
  customerType: string;
  salesRep: string;
  lab: string;
  cmSales: number;
  cmJobs: number;
  cmJpd: number | null;
  authorizedUsers: number;
  priceLists: string;
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
  const accountsIndexPath = path.join(DASHBOARD_V1_DIR, "accounts_index.json");
  const accountsIndex = readJson<DashboardV1AdminAccount[]>(accountsIndexPath) ?? [];
  if (!accountsIndex.length) return [];

  const rows: DashboardV1AdminRow[] = [];
  for (const account of accountsIndex) {
    rows.push({
      businessName: account.business_name || "Unknown",
      acctId: account.account_id,
      accountNumbers: account.all_account_numbers || "—",
      division: parseCustomerType(account.customer_type || ""),
      customerType: parseCustomerType(account.customer_type || ""),
      salesRep: account.sales_rep || "—",
      lab: account.lab || "—",
      cmSales: Number(account.cm_sales ?? 0),
      cmJobs: Number(account.cm_jobs ?? 0),
      cmJpd:
        typeof account.cm_jpd === "number" && Number.isFinite(account.cm_jpd)
          ? account.cm_jpd
          : null,
      authorizedUsers: Number(account.authorized_user_count ?? 0),
      priceLists: [
        ...new Set([
          ...(account.price_lists ?? []).map((entry) => canonicalPriceListCode(String(entry || ""))),
          "M5",
          "Y5",
        ]),
      ]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))
        .join(", "),
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
