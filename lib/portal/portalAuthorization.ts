import "server-only";

import { normalizeAssignedPriceListCodes } from "@/lib/portal/assignedPriceLists";
import type {
  PortalCustomer,
  PortalSection,
} from "@/lib/portal/customers";
import { getPortalCustomerTypeInfo } from "@/lib/portal/customerTypes";
import { portalDashboardV1AccessIndex } from "@/lib/portal/dashboardV1AccessIndex";
import { getDashboardV1AdminRows } from "@/lib/portal/adminDashboardV1";
import {
  canAccessPortalAdmin,
  filterRowsForPortalRole,
  getPortalStaffRole,
} from "@/lib/portal/portalRoles";
import {
  assertAccountAccess,
  getAllowedAccountsForEmail,
  getPortalUserByEmail,
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
  "onboarding",
];

const DEBUG_PORTAL_AUTH = ["1", "true", "yes", "on"].includes(
  String(process.env.DEBUG_PORTAL_AUTH ?? "").toLowerCase()
);

function logPortalAuth(details: Record<string, unknown>) {
  if (DEBUG_PORTAL_AUTH) console.log("[PORTAL AUTH]", details);
}

function getAccountIndex() {
  return portalDashboardV1AccessIndex.accountsIndex as AccountIndexRow[];
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
  if (!email) {
    logPortalAuth({
      email,
      userFound: false,
      accountCount: 0,
      authorizationDecision: "missing-email",
    });
    return [];
  }
  const portalRole = getPortalStaffRole(email);
  const hasStaffPortalAccess = canAccessPortalAdmin(portalRole);

  if (hasStaffPortalAccess) {
    const accounts =
      portalRole.kind === "admin"
        ? adminAccountsFromIndex()
        : filterRowsForPortalRole(portalRole, getDashboardV1AdminRows())
            .map((row) =>
              adminAccountsFromIndex().find(
                (account) => account.acctId === row.acctId.trim().toUpperCase()
              )
            )
            .filter((account): account is PortalUserAccount => Boolean(account));
    if (accounts.length === 0) {
      if (portalRole.kind === "sales-rep") {
        logPortalAuth({
          email,
          userFound: true,
          role: portalRole.kind,
          accountCount: 0,
          authorizationDecision: "sales-rep-fail-closed-no-assignment",
        });
        return [];
      }
      const workbookAccounts = await getAllowedAccountsForEmail(email);
      logPortalAuth({
        email,
        userFound: true,
        role: portalRole.kind,
        accountCount: workbookAccounts.length,
        authorizationDecision: "staff-workbook-fallback",
      });
      return workbookAccounts.map((account) => customerFromAccount(account, email));
    }
    logPortalAuth({
      email,
      userFound: true,
      role: portalRole.kind,
      accountCount: accounts.length,
      authorizationDecision: "staff-dashboard-access",
    });
    return accounts.map((account) => customerFromAccount(account, email));
  }
  const user = await getPortalUserByEmail(email);
  if (!user) {
    logPortalAuth({
      email,
      userFound: false,
      role: "unauthorized",
      accountCount: 0,
      authorizationDecision: "email-not-in-workbook",
    });
    return [];
  }
  logPortalAuth({
    email,
    userFound: true,
    role: "customer",
    accountCount: user.accounts.length,
    authorizationDecision: "customer-authorized",
  });
  return user.accounts.map((account) => customerFromAccount(account, user.email));
}

export async function getAuthorizedPortalCustomer(
  email: string,
  accountId?: string
) {
  const customers = await getAuthorizedPortalCustomers(email);
  if (!accountId) return customers[0];

  const portalRole = getPortalStaffRole(email);
  if (canAccessPortalAdmin(portalRole)) {
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
  const portalRole = getPortalStaffRole(email);
  if (portalRole.kind === "admin") {
    return {
      role: "admin" as const,
      email,
      accounts: await getAllowedAccountsForEmail(email),
    };
  }
  if (portalRole.kind === "sales-rep") {
    const customers = await getAuthorizedPortalCustomers(email);
    return {
      role: "sales-rep" as const,
      email,
      accounts: customers.map((customer) => ({
        acctId: customer.accountNumber,
        accountNumbers: [],
        organizationAccountNumber: "",
        organizationName: customer.practiceName,
      })),
    };
  }

  const user = await getPortalUserByEmail(email);
  if (!user) return { role: "unauthorized" as const, email, accounts: [] };
  return { role: "customer" as const, email, user, accounts: user.accounts };
}
