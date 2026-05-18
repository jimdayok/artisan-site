import "server-only";

import {
  customerPortalAccess,
  type PortalCustomer,
  type PortalCustomerAccess,
  type PortalSection,
} from "@/lib/portal/customers";
import type { PriceListCode } from "@/lib/portal/priceLists";
import {
  accountHasSequelRebateInvitation,
  getPortalWorkbookAccounts,
  getPortalWorkbookPeople,
  getPortalWorkbookPeopleByAccountNumber,
  normalizePortalAccountNumber,
  personHasSequelRebateInvitation,
  type PortalWorkbookAccount,
  type PortalWorkbookPerson,
} from "@/lib/portal/workbookAccountData";

export type AdminUserRow = {
  person: PortalWorkbookPerson;
  email: string;
  isApproved: boolean;
  hasSequelRebateInvitation: boolean;
  assignedPriceLists: PriceListCode[];
  assignedSections: PortalSection[];
};

export type AdminAccountRow = {
  account: PortalWorkbookAccount;
  users: PortalWorkbookPerson[];
  hasSequelRebateInvitation: boolean;
  assignedPriceLists: PriceListCode[];
  assignedSections: PortalSection[];
};

function uniqueList<T extends string>(values: T[]) {
  return [...new Set(values)];
}

function accessForEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  return customerPortalAccess.find((entry) => entry.email === normalizedEmail);
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
  return getPortalWorkbookPeople().flatMap((person) => {
    const emails = person.emails.length > 0 ? person.emails : [""];

    return emails.map((email) => {
      const directAccess = accessForEmail(email);
      const accountAccess = accessForAccount(person.accountNumber);
      const records = directAccess ? [directAccess] : accountAccess;

      return {
        person,
        email,
        isApproved: Boolean(directAccess),
        hasSequelRebateInvitation: personHasSequelRebateInvitation(person),
        assignedPriceLists: assignedPriceLists(records),
        assignedSections: assignedSections(records),
      } satisfies AdminUserRow;
    });
  });
}

export function getAdminAccountRows() {
  return getPortalWorkbookAccounts().map((account) => {
    const records = accessForAccount(account.accountNumber);

    return {
      account,
      users: getPortalWorkbookPeopleByAccountNumber(account.accountNumber),
      hasSequelRebateInvitation: accountHasSequelRebateInvitation(
        account.accountNumber
      ),
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

  return {
    accountNumber: primaryRecord.accountNumber,
    practiceName: primaryRecord.practiceName,
    emails: records.map((record) => record.email),
    priceLists: assignedPriceLists(records),
    allowedPriceLists: assignedPriceLists(records),
    portalSections: assignedSections(records),
  } satisfies PortalCustomer;
}

export function filterAdminUserRows(rows: AdminUserRow[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) return rows;

  return rows.filter((row) =>
    [
      row.person.name,
      row.email,
      row.person.organization,
      row.person.accountNumber,
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
      row.users.flatMap((user) => user.emails).join(", "),
      row.assignedPriceLists.join(", "),
      row.assignedSections.join(", "),
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery)
  );
}
