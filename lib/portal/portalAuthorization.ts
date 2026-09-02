import "server-only";

import type { PortalCustomer } from "@/lib/portal/customers";
import { getDashboardV1AdminRows } from "@/lib/portal/adminDashboardV1";
import {
  getEffectivePortalAccessAccount,
  getEffectivePortalAccessAccounts,
  getEffectivePortalAccessAccountsForEmail,
  portalCustomerFromEffectiveAccount,
} from "@/lib/portal/portalAccessOverrides";
import {
  canAccessPortalAdmin,
  filterRowsForPortalRole,
  getPortalStaffRole,
} from "@/lib/portal/portalRoles";
import {
  getPortalUserByEmail,
  type PortalUserAccount,
} from "@/lib/portal/userDataAccess";

const DEBUG_PORTAL_AUTH = ["1", "true", "yes", "on"].includes(
  String(process.env.DEBUG_PORTAL_AUTH ?? "").toLowerCase()
);

function logPortalAuth(details: Record<string, unknown>) {
  if (DEBUG_PORTAL_AUTH) console.log("[PORTAL AUTH]", details);
}

async function adminAccountsFromEffectiveAccess() {
  return (await getEffectivePortalAccessAccounts()).map(
    (account): PortalUserAccount => ({
      acctId: account.accountNumber,
      accountNumbers: account.aliases.filter(
        (alias) => alias !== account.accountNumber
      ),
      organizationAccountNumber:
        account.aliases.find((alias) => alias !== account.accountNumber) ?? "",
      organizationName: account.practiceName,
    })
  );
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
    const effectiveAccounts = await getEffectivePortalAccessAccounts();
    const accounts =
      portalRole.kind === "admin"
        ? effectiveAccounts
        : filterRowsForPortalRole(portalRole, getDashboardV1AdminRows())
            .map((row) =>
              effectiveAccounts.find(
                (account) => account.accountNumber === row.acctId.trim().toUpperCase()
              )
            )
            .filter((account): account is (typeof effectiveAccounts)[number] =>
              Boolean(account)
            );
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
    }
    logPortalAuth({
      email,
      userFound: true,
      role: portalRole.kind,
      accountCount: accounts.length,
      authorizationDecision: "staff-dashboard-access",
    });
    return accounts.map((account) =>
      portalCustomerFromEffectiveAccount(account) as PortalCustomer
    );
  }
  const accounts = await getEffectivePortalAccessAccountsForEmail(email);
  if (accounts.length === 0) {
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
    accountCount: accounts.length,
    authorizationDecision: "customer-authorized",
  });
  return accounts.map((account) =>
    portalCustomerFromEffectiveAccount(account) as PortalCustomer
  );
}

export async function getAuthorizedPortalCustomer(
  email: string,
  accountId?: string
) {
  const customers = await getAuthorizedPortalCustomers(email);
  if (!accountId) return customers[0];

  const portalRole = getPortalStaffRole(email);
  const requestedAccount = await getEffectivePortalAccessAccount(accountId);
  if (!requestedAccount) return undefined;
  if (
    portalRole.kind !== "admin" &&
    !customers.some(
      (customer) => customer.accountNumber === requestedAccount.accountNumber
    )
  ) {
    return undefined;
  }
  return customers.find(
    (customer) => customer.accountNumber === requestedAccount.accountNumber
  );
}

export async function getPortalAuthorization(email: string) {
  const portalRole = getPortalStaffRole(email);
  if (portalRole.kind === "admin") {
    return {
      role: "admin" as const,
      email,
      accounts: await adminAccountsFromEffectiveAccess(),
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

  const customers = await getAuthorizedPortalCustomers(email);
  if (customers.length === 0) {
    return { role: "unauthorized" as const, email, accounts: [] };
  }
  const user = await getPortalUserByEmail(email).catch(() => undefined);
  const accounts = customers.map(
    (customer): PortalUserAccount => ({
      acctId: customer.accountNumber,
      accountNumbers: [],
      organizationAccountNumber: "",
      organizationName: customer.practiceName,
    })
  );
  return { role: "customer" as const, email, user, accounts };
}
