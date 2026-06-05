import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { normalizeAssignedPriceListCodes } from "@/lib/portal/assignedPriceLists";
import type {
  PortalCustomer,
  PortalSection,
} from "@/lib/portal/customers";
import { getPortalCustomerTypeInfo } from "@/lib/portal/customerTypes";
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

let accountIndex: AccountIndexRow[] | undefined;

function getAccountIndex() {
  if (accountIndex) return accountIndex;
  const filePath = path.join(
    process.cwd(),
    "private-source",
    "portal",
    "dashboard-v1",
    "current",
    "accounts_index.json"
  );
  if (!existsSync(filePath)) return [];
  try {
    accountIndex = JSON.parse(readFileSync(filePath, "utf8")) as AccountIndexRow[];
  } catch {
    accountIndex = [];
  }
  return accountIndex;
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

export async function getAuthorizedPortalCustomers(email: string) {
  if (!email) return [];
  if (isPortalAdmin(email)) {
    const accounts = await getAllowedAccountsForEmail(email);
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
