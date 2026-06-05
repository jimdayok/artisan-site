import "server-only";

import { normalizeAssignedPriceListCodes } from "@/lib/portal/assignedPriceLists";
import type {
  PortalCustomer,
  PortalSection,
} from "@/lib/portal/customers";
import { getPortalCustomerTypeInfo } from "@/lib/portal/customerTypes";
import { portalDashboardV1Bundle } from "@/lib/portal/dashboardV1Bundle";
import {
  assertAccountAccess,
  getAllowedAccountsForEmail,
  getPortalUserByEmail,
  isPortalAdmin,
  PortalAccountAccessError,
  type PortalUserAccount,
} from "@/lib/portal/userDataAccess";

type AccountIndexRow = {
  account_id?: string;
  all_account_numbers?: string;
  business_name?: string;
  customer_type?: string;
  price_lists?: string[];
};

const ALL_PORTAL_SECTIONS: PortalSection[] = [
  "pricing",
  "packages",
  "calculator",
  "catalog",
  "policies",
  "exports",
  "performance",
];

function getAccountIndex() {
  return portalDashboardV1Bundle.accountsIndex as AccountIndexRow[];
}

function customerFromAccount(
  account: PortalUserAccount,
  email: string
): PortalCustomer {
  const metadata = getAccountIndex().find(
    (entry) =>
      String(entry.account_id ?? "").trim().toUpperCase() === account.acctId
  );
  const customerType = getPortalCustomerTypeInfo(metadata?.customer_type ?? "");
  const priceLists = normalizeAssignedPriceListCodes(metadata?.price_lists ?? []);

  return {
    accountNumber: account.acctId,
    practiceName:
      metadata?.business_name?.trim() ||
      account.organizationName ||
      account.acctId,
    emails: [email],
    priceLists,
    allowedPriceLists: priceLists,
    portalSections: ALL_PORTAL_SECTIONS,
    customerTypeCode: customerType?.code ?? "",
    customerTypeLabel: customerType?.label ?? "",
  };
}

function adminAccountsFromIndex() {
  return getAccountIndex()
    .map((entry): PortalUserAccount | undefined => {
      const acctId = String(entry.account_id ?? "").trim().toUpperCase();
      if (!acctId) return undefined;

      const accountNumbers = [
        ...new Set(
          String(entry.all_account_numbers ?? "")
            .split(",")
            .map((value) => value.trim().replace(/\.0$/, ""))
            .filter(Boolean)
        ),
      ];

      return {
        acctId,
        accountNumbers,
        organizationAccountNumber: accountNumbers[0] ?? "",
        organizationName: String(entry.business_name ?? "").trim(),
      };
    })
    .filter((account): account is PortalUserAccount => Boolean(account));
}

export async function getAuthorizedPortalCustomers(email: string) {
  if (!email) return [];
  if (isPortalAdmin(email)) {
    const accounts = adminAccountsFromIndex();
    if (accounts.length === 0) {
      const workbookAccounts = await getAllowedAccountsForEmail(email);
      return workbookAccounts.map((account) => customerFromAccount(account, email));
    }
    return accounts.map((account) => customerFromAccount(account, email));
  }
  const user = await getPortalUserByEmail(email);
  if (!user) return [];
  return user.accounts.map((account) => customerFromAccount(account, user.email));
}

export async function getAuthorizedPortalCustomer(
  email: string,
  accountId?: string
) {
  const customers = await getAuthorizedPortalCustomers(email);
  if (!accountId) return customers[0];

  if (isPortalAdmin(email)) {
    const normalizedAccount = accountId.trim().toUpperCase().replace(/\.0$/, "");
    return customers.find(
      (customer) =>
        customer.accountNumber === normalizedAccount ||
        adminAccountsFromIndex().some(
          (account) =>
            account.acctId === customer.accountNumber &&
            account.accountNumbers.includes(normalizedAccount)
        )
    );
  }

  let account: PortalUserAccount;
  try {
    account = await assertAccountAccess(email, accountId);
  } catch (error) {
    if (error instanceof PortalAccountAccessError) return undefined;
    throw error;
  }
  return customers.find((customer) => customer.accountNumber === account.acctId);
}

export async function getPortalAuthorization(email: string) {
  if (isPortalAdmin(email)) {
    return {
      role: "admin" as const,
      email,
      accounts: await getAllowedAccountsForEmail(email),
    };
  }

  const user = await getPortalUserByEmail(email);
  if (!user) return { role: "unauthorized" as const, email, accounts: [] };
  return { role: "customer" as const, email, user, accounts: user.accounts };
}
