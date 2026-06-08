import "server-only";

import { headers } from "next/headers";
import { getPortalAuthenticatedEmailFromHeaders } from "@/lib/portal/auth";
import { isPortalAdminEmail } from "@/lib/portal/admin";
import { getAuthorizedPortalCustomers } from "@/lib/portal/portalAuthorization";
import { getPortalUserByEmail } from "@/lib/portal/userDataAccess";
import { getPortalDashboardV1ByAccount, type PortalDashboardV1Account } from "@/lib/portal/dashboardV1";
import { portalDashboardV1Bundle } from "@/lib/portal/dashboardV1Bundle";
import { labs, type LabKey } from "./onboardingData";

export type OnboardingAccount = {
  accountNumber: string;
  aliases: string[];
  practiceName: string;
  labKey: LabKey;
  labName: string;
  rawLabName: string;
  priceLists: string[];
  hasReports: boolean;
};

export type OnboardingAccess =
  | { status: "unauthenticated"; email: "" }
  | {
      status: "gated";
      email: string;
      userName: string;
      isAdmin: boolean;
      accounts: OnboardingAccount[];
    }
  | {
      status: "authorized";
      email: string;
      userName: string;
      isAdmin: boolean;
      accounts: OnboardingAccount[];
      adminAccounts: OnboardingAccount[];
    };

const eligibilityThresholds: Record<string, number> = {
  PDX: 3950,
  IND: 20050,
  DEN: 10050,
};

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeAccount(value: unknown) {
  return clean(value).toUpperCase().replace(/\.0$/, "");
}

export function isEligibleOnboardingAccountNumber(value: unknown) {
  const normalized = normalizeAccount(value);
  const match = normalized.match(/\b(PDX|IND|DEN)[-\s]?(\d+)\b/);
  if (!match) return false;

  const prefix = match[1] as keyof typeof eligibilityThresholds;
  const numeric = Number(match[2]);
  return Number.isFinite(numeric) && numeric >= eligibilityThresholds[prefix];
}

function isEligibleAccount(account: { accountNumber: string; aliases?: string[] }) {
  const values = [account.accountNumber, ...(account.aliases ?? [])].map(normalizeAccount);
  if (values.some(isEligibleOnboardingAccountNumber)) return true;

  const labPrefix = values
    .map((value) => value.match(/\b(PDX|IND|DEN)\b/)?.[1] as keyof typeof eligibilityThresholds | undefined)
    .find(Boolean);
  if (!labPrefix) return false;

  return values.some((value) => {
    const numeric = Number(value.match(/^\d+$/)?.[0] ?? "");
    return Number.isFinite(numeric) && numeric >= eligibilityThresholds[labPrefix];
  });
}

function labKeyFromName(value: unknown): LabKey {
  const normalized = clean(value).toLowerCase();
  if (normalized.includes("pacific")) return "pacific";
  if (normalized.includes("peak")) return "peak";
  if (normalized.includes("pike")) return "pike";
  return "unknown";
}

function aliasesFromAccount(account: PortalDashboardV1Account | undefined, fallback: string) {
  return [
    fallback,
    account?.account_id,
    ...(account?.all_account_numbers ?? "").split(","),
  ]
    .map(normalizeAccount)
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index);
}

function accountFromDashboard(accountNumber: string, fallbackName = ""): OnboardingAccount {
  const dashboard = getPortalDashboardV1ByAccount(accountNumber);
  const account = dashboard.status === "ok" ? dashboard.account : undefined;
  const aliases = aliasesFromAccount(account, accountNumber);
  const rawLabName = account?.lab_name ?? "";
  const labKey = labKeyFromName(rawLabName);

  return {
    accountNumber: normalizeAccount(account?.account_id || accountNumber),
    aliases,
    practiceName: account?.business_name || fallbackName || accountNumber,
    labKey,
    labName: labKey === "unknown" ? "" : labs[labKey].name,
    rawLabName,
    priceLists: account?.used_price_lists ?? [],
    hasReports: Boolean(account),
  };
}

function adminAccounts() {
  return portalDashboardV1Bundle.accountsIndex
    .map((row) => accountFromDashboard(clean(row.account_id), clean(row.business_name)))
    .filter(isEligibleAccount)
    .sort((a, b) => a.practiceName.localeCompare(b.practiceName) || a.accountNumber.localeCompare(b.accountNumber));
}

function nameFromDashboardAuthorizedUsers(email: string, accountNumber: string) {
  const dashboard = getPortalDashboardV1ByAccount(accountNumber);
  if (dashboard.status !== "ok") return "";

  return (
    dashboard.account.authorized_users?.find(
      (user) => user.email.trim().toLowerCase() === email.trim().toLowerCase()
    )?.name ?? ""
  );
}

export async function getOnboardingAccess(): Promise<OnboardingAccess> {
  const headerList = await headers();
  const email = getPortalAuthenticatedEmailFromHeaders(headerList);
  if (!email) return { status: "unauthenticated", email: "" };

  const isAdmin = isPortalAdminEmail(email);
  const user = isAdmin ? undefined : await getPortalUserByEmail(email);
  const portalCustomers = await getAuthorizedPortalCustomers(email);
  const accounts = portalCustomers.map((customer) =>
    accountFromDashboard(customer.accountNumber, customer.practiceName)
  );
  const eligibleAccounts = accounts.filter(isEligibleAccount);
  const allAdminAccounts = isAdmin ? adminAccounts() : [];
  const userName =
    user?.personName ||
    eligibleAccounts.map((account) => nameFromDashboardAuthorizedUsers(email, account.accountNumber)).find(Boolean) ||
    (isAdmin ? "Portal Administrator" : "");

  if (isAdmin) {
    return {
      status: "authorized",
      email,
      userName,
      isAdmin,
      accounts: allAdminAccounts,
      adminAccounts: allAdminAccounts,
    };
  }

  if (eligibleAccounts.length === 0) {
    return { status: "gated", email, userName, isAdmin, accounts };
  }

  return {
    status: "authorized",
    email,
    userName,
    isAdmin,
    accounts: eligibleAccounts,
    adminAccounts: [],
  };
}
