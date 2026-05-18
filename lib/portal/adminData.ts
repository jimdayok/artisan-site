import "server-only";

import {
  customerPortalAccess,
  type PortalCustomer,
  type PortalCustomerAccess,
  type PortalSection,
} from "@/lib/portal/customers";
import {
  getCustomerTypeInfoFromAccountData,
  hasModernPackageSavingsWarning,
} from "@/lib/portal/accountInsights";
import type { PriceListCode } from "@/lib/portal/priceLists";
import {
  accountHasSequelRebateInvitation,
  getPortalWorkbookAccounts,
  getPortalWorkbookAccountsForEmail,
  getPortalWorkbookPeople,
  getPortalWorkbookPeopleByAccountNumber,
  normalizePortalAccountNumber,
  personHasSequelRebateInvitation,
  type PortalWorkbookAccount,
  type PortalWorkbookPerson,
} from "@/lib/portal/workbookAccountData";

export type AdminUserRow = {
  displayName: string;
  email: string;
  people: PortalWorkbookPerson[];
  accounts: PortalWorkbookAccount[];
  isApproved: boolean;
  hasSequelRebateInvitation: boolean;
  hasModernPackageSavingsWarning: boolean;
  customerTypeCodes: string[];
  customerTypeLabels: string[];
  assignedPriceLists: PriceListCode[];
  assignedSections: PortalSection[];
};

export type AdminAccountRow = {
  account: PortalWorkbookAccount;
  users: PortalWorkbookPerson[];
  hasSequelRebateInvitation: boolean;
  hasModernPackageSavingsWarning: boolean;
  customerTypeCode: string;
  customerTypeLabel: string;
  detectedCustomerTypeCodes: string[];
  duplicateRowsMerged: boolean;
  sameNameDifferentAccountWarning: boolean;
  sameNameAccountNumbers: string[];
  assignedPriceLists: PriceListCode[];
  assignedSections: PortalSection[];
};

function uniqueList<T extends string>(values: T[]) {
  return [...new Set(values)];
}

function accessForEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  return customerPortalAccess.filter((entry) => entry.email === normalizedEmail);
}

function accessForAccount(accountNumber: string) {
  const normalizedAccountNumber = normalizePortalAccountNumber(accountNumber);

  return customerPortalAccess.filter(
    (entry) =>
      normalizePortalAccountNumber(entry.accountNumber) === normalizedAccountNumber
  );
}

function assignedPriceLists(records: PortalCustomerAccess[]) {
  return uniqueList(records.flatMap((record) => record.allowedPriceLists));
}

function assignedSections(records: PortalCustomerAccess[]) {
  return uniqueList(records.flatMap((record) => record.portalSections));
}

export function getAdminUserRows() {
  const peopleByEmail = new Map<string, PortalWorkbookPerson[]>();

  for (const person of getPortalWorkbookPeople()) {
    for (const email of person.emails) {
      peopleByEmail.set(email, [...(peopleByEmail.get(email) ?? []), person]);
    }
  }

  return [...peopleByEmail.entries()].map(([email, people]) => {
    const accounts = getPortalWorkbookAccountsForEmail(email);
    const records = accessForEmail(email);
    const customerTypes = accounts
      .map((account) => getCustomerTypeInfoFromAccountData({ account }))
      .filter((typeInfo): typeInfo is NonNullable<typeof typeInfo> =>
        Boolean(typeInfo)
      );

    return {
      displayName:
        people.find((person) => person.name)?.name ||
        email,
      email,
      people,
      accounts,
      isApproved: records.length > 0,
      hasSequelRebateInvitation: people.some(personHasSequelRebateInvitation),
      hasModernPackageSavingsWarning: accounts.some((account) =>
        hasModernPackageSavingsWarning(account)
      ),
      customerTypeCodes: uniqueList(customerTypes.map((typeInfo) => typeInfo.code)),
      customerTypeLabels: uniqueList(
        customerTypes.map((typeInfo) => typeInfo.label)
      ),
      assignedPriceLists: assignedPriceLists(records),
      assignedSections: assignedSections(records),
    } satisfies AdminUserRow;
  });
}

export function getAdminAccountRows() {
  return getPortalWorkbookAccounts().map((account) => {
    const records = accessForAccount(account.accountNumber);
    const customerType = getCustomerTypeInfoFromAccountData({ account });

    return {
      account,
      users: getPortalWorkbookPeopleByAccountNumber(account.accountNumber),
      hasSequelRebateInvitation: accountHasSequelRebateInvitation(
        account.accountNumber
      ),
      hasModernPackageSavingsWarning: hasModernPackageSavingsWarning(account),
      customerTypeCode: customerType?.code ?? "",
      customerTypeLabel: customerType?.label ?? "",
      detectedCustomerTypeCodes: account.detectedCustomerTypeCodes ?? [],
      duplicateRowsMerged: Boolean(account.duplicateRowsMerged),
      sameNameDifferentAccountWarning: Boolean(
        account.sameNameDifferentAccountWarning
      ),
      sameNameAccountNumbers: account.sameNameAccountNumbers ?? [],
      assignedPriceLists: assignedPriceLists(records),
      assignedSections: assignedSections(records),
    } satisfies AdminAccountRow;
  });
}

export function getPortalAdminStats() {
  const userRows = getAdminUserRows();
  const accountRows = getAdminAccountRows();

  return {
    totalUsers: getPortalWorkbookPeople().length,
    totalAccounts: accountRows.length,
    totalActivePortalUsers: customerPortalAccess.length,
    totalAssignedPriceLists: customerPortalAccess.reduce(
      (total, record) => total + record.allowedPriceLists.length,
      0
    ),
    userRows,
    accountRows,
  };
}

export function getPreviewCustomerByAccountNumber(accountNumber: string) {
  const records = accessForAccount(accountNumber);

  if (records.length === 0) return undefined;

  const primaryRecord = records[0];
  const customerType = getCustomerTypeInfoFromAccountData({
    account: getPortalWorkbookAccounts().find(
      (account) =>
        normalizePortalAccountNumber(account.accountNumber) ===
        normalizePortalAccountNumber(accountNumber)
    ),
  });

  return {
    accountNumber: primaryRecord.accountNumber,
    practiceName: primaryRecord.practiceName,
    emails: records.map((record) => record.email),
    priceLists: assignedPriceLists(records),
    allowedPriceLists: assignedPriceLists(records),
    portalSections: assignedSections(records),
    customerTypeCode: customerType?.code ?? primaryRecord.customerTypeCode,
    customerTypeLabel: customerType?.label ?? primaryRecord.customerTypeLabel,
  } satisfies PortalCustomer;
}

export function filterAdminUserRows(rows: AdminUserRow[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) return rows;

  return rows.filter((row) =>
    [
      row.displayName,
      row.email,
      row.people.map((person) => person.organization).join(", "),
      row.accounts.map((account) => account.accountName).join(", "),
      row.accounts.map((account) => account.accountNumber).join(", "),
      row.customerTypeCodes.join(", "),
      row.customerTypeLabels.join(", "),
      row.assignedPriceLists.join(", "),
      row.assignedSections.join(", "),
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery)
  );
}

export function filterAdminAccountRows(rows: AdminAccountRow[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) return rows;

  return rows.filter((row) =>
    [
      row.account.accountName,
      row.account.accountNumber,
      row.account.division,
      row.account.salesRep,
      row.customerTypeCode,
      row.customerTypeLabel,
      row.detectedCustomerTypeCodes.join(", "),
      row.sameNameAccountNumbers.join(", "),
      row.users.flatMap((user) => user.emails).join(", "),
      row.assignedPriceLists.join(", "),
      row.assignedSections.join(", "),
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery)
  );
}
