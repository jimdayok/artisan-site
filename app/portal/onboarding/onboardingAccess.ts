import "server-only";

import { headers } from "next/headers";
import { getPortalAuthenticatedEmailFromHeaders } from "@/lib/portal/auth";
import { isPortalAdminEmail } from "@/lib/portal/admin";
import { getAuthorizedPortalCustomers } from "@/lib/portal/portalAuthorization";
import { getPortalUserByEmail } from "@/lib/portal/userDataAccess";
import { getPortalDashboardV1ByAccount, type PortalDashboardV1Account } from "@/lib/portal/dashboardV1";
import {
  normalizeOnboardingAccount,
} from "@/lib/portal/onboardingEligibility";
import type { PortalCustomer } from "@/lib/portal/customers";
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

function clean(value: unknown) {
  return String(value ?? "").trim();
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
    .map(normalizeOnboardingAccount)
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
    accountNumber: normalizeOnboardingAccount(account?.account_id || accountNumber),
    aliases,
    practiceName: account?.business_name || fallbackName || accountNumber,
    labKey,
    labName: labKey === "unknown" ? "" : labs[labKey].name,
    rawLabName,
    priceLists: account?.used_price_lists ?? [],
    hasReports: Boolean(account),
  };
}

function accountFromCustomer(customer: PortalCustomer): OnboardingAccount {
  const account = accountFromDashboard(
    customer.accountNumber,
    customer.practiceName
  );
  return {
    ...account,
    practiceName: customer.practiceName || account.practiceName,
    priceLists: customer.priceLists,
  };
}

function nameFromDashboardAuthorizedUsers(email: string, accountNumber: string) {
  const dashboard = getPortalDashboardV1ByAccount(accountNumber);
  if (dashboard.status !== "ok") return "";

  const normalizedEmail = email.trim().toLowerCase();
  const authorizedUser = dashboard.account?.authorized_users?.find(
    (user) => user.email.trim().toLowerCase() === normalizedEmail
  );

  return authorizedUser?.name ?? "";
}

function prioritizeRequestedAccount(
  accounts: OnboardingAccount[],
  requestedAccountNumber?: string
) {
  const requested = normalizeOnboardingAccount(requestedAccountNumber);
  if (!requested) return accounts;

  const index = accounts.findIndex(
    (account) =>
      account.accountNumber === requested ||
      account.aliases.includes(requested)
  );
  if (index <= 0) return accounts;

  return [accounts[index], ...accounts.slice(0, index), ...accounts.slice(index + 1)];
}

export async function getOnboardingAccess(
  requestedAccountNumber?: string
): Promise<OnboardingAccess> {
  const headerList = await headers();
  const email = getPortalAuthenticatedEmailFromHeaders(headerList);
  if (!email) return { status: "unauthenticated", email: "" };

  const isAdmin = isPortalAdminEmail(email);
  const user = isAdmin ? undefined : await getPortalUserByEmail(email);
  const portalCustomers = await getAuthorizedPortalCustomers(email);
  const accounts = portalCustomers.map(accountFromCustomer);
  const eligibleAccounts = prioritizeRequestedAccount(
    accounts.filter((account) =>
      portalCustomers.some(
        (customer) =>
          customer.accountNumber === account.accountNumber &&
          customer.portalSections.includes("onboarding")
      )
    ),
    requestedAccountNumber
  );
  const allAdminAccounts = isAdmin
    ? accounts.filter((account) =>
        portalCustomers.some(
          (customer) =>
            customer.accountNumber === account.accountNumber &&
            customer.portalSections.includes("onboarding")
        )
      )
    : [];
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
      accounts: prioritizeRequestedAccount(allAdminAccounts, requestedAccountNumber),
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
