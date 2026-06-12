import "server-only";

import { portalDashboardV1Bundle } from "@/lib/portal/dashboardV1Bundle";
import type { PriceListCode } from "@/lib/portal/priceLists";
import { canonicalPriceListCode, getPriceListByCode } from "@/lib/portal/priceLists";
import type { PortalCustomerTypeCode } from "@/lib/portal/customerTypes";
import { getPortalCustomerTypeInfo } from "@/lib/portal/customerTypes";
import { normalizeAccountNumber, normalizeEmail } from "@/lib/portal/normalizeAccounts";

export type PortalSection =
  | "pricing"
  | "packages"
  | "calculator"
  | "catalog"
  | "policies"
  | "exports"
  | "performance"
  | "onboarding";

export type PortalCustomerAccess = {
  email: string;
  accountNumber: string;
  practiceName: string;
  allowedPriceLists: PriceListCode[];
  portalSections: PortalSection[];
  customerTypeCode?: PortalCustomerTypeCode | "";
  customerTypeLabel?: string;
  detectedCustomerTypeCodes?: string[];
};

export type PortalCustomer = {
  accountNumber: string;
  practiceName: string;
  emails: string[];
  priceLists: PriceListCode[];
  allowedPriceLists: PriceListCode[];
  portalSections: PortalSection[];
  customerTypeCode?: PortalCustomerTypeCode | "";
  customerTypeLabel?: string;
  detectedCustomerTypeCodes?: string[];
};

type DashboardV1AccountIndexRecord = {
  account_id?: string;
  business_name?: string;
  all_account_numbers?: string;
  customer_type?: string;
  price_lists?: string[];
};

type DashboardV1UserAccessRecord = {
  email?: string;
  account_ids?: string[];
};

const allPortalSections: PortalSection[] = [
  "pricing",
  "packages",
  "calculator",
  "catalog",
  "policies",
  "exports",
  "performance",
  "onboarding",
];

function toPriceListCodesFromList(values: string[] = []) {
  return values
    .map((code) => canonicalPriceListCode(code))
    .filter((code): code is PriceListCode => Boolean(getPriceListByCode(code)));
}

function uniqueList<T extends string>(values: T[]) {
  return [...new Set(values)];
}

function uniqueAssignedPriceLists(values: PriceListCode[]) {
  return uniqueList(values);
}

function getDashboardV1AccessRecords() {
  const accountsIndex =
    portalDashboardV1Bundle.accountsIndex as DashboardV1AccountIndexRecord[];
  const usersToAccounts =
    portalDashboardV1Bundle.usersToAccounts as DashboardV1UserAccessRecord[];

  if (!accountsIndex.length || !usersToAccounts.length) return [];

  const accountById = new Map(
    accountsIndex
      .filter((row) => row.account_id)
      .map((row) => [String(row.account_id).trim().toUpperCase(), row])
  );

  const records: PortalCustomerAccess[] = [];
  for (const entry of usersToAccounts) {
    const email = normalizeEmail(entry.email ?? "");
    if (!email) continue;

    for (const accountIdRaw of entry.account_ids ?? []) {
      const accountId = String(accountIdRaw || "").trim().toUpperCase();
      if (!accountId) continue;

      const account = accountById.get(accountId);
      if (!account) continue;
      const accountTypeRaw = account.customer_type?.trim() || "";
      const accountTypeInfo = getPortalCustomerTypeInfo(accountTypeRaw);
      const accountTypeCode = accountTypeInfo?.code ?? "";

      records.push({
        email,
        accountNumber: accountId,
        practiceName: account.business_name?.trim() || accountId,
        allowedPriceLists: uniqueAssignedPriceLists(
          toPriceListCodesFromList(account.price_lists ?? [])
        ),
        portalSections: allPortalSections,
        customerTypeCode: accountTypeCode,
        customerTypeLabel: accountTypeInfo?.label || accountTypeRaw || "",
      });
    }
  }

  return records.filter(
    (entry) =>
      entry.email &&
      entry.accountNumber &&
      entry.practiceName &&
      entry.portalSections.length > 0
  );
}

const dashboardV1CustomerPortalAccess: PortalCustomerAccess[] =
  getDashboardV1AccessRecords();

export const customerPortalAccess: PortalCustomerAccess[] =
  dashboardV1CustomerPortalAccess;

export const customers: PortalCustomer[] = customerPortalAccess.map((entry) => ({
  accountNumber: entry.accountNumber,
  practiceName: entry.practiceName,
  emails: [entry.email.toLowerCase()],
  priceLists: uniqueAssignedPriceLists(entry.allowedPriceLists),
  allowedPriceLists: uniqueAssignedPriceLists(entry.allowedPriceLists),
  portalSections: entry.portalSections,
  customerTypeCode: entry.customerTypeCode,
  customerTypeLabel: entry.customerTypeLabel,
  detectedCustomerTypeCodes: entry.detectedCustomerTypeCodes,
}));

function toPortalCustomer(entries: PortalCustomerAccess[]): PortalCustomer | undefined {
  const primaryEntry = entries[0];

  if (!primaryEntry) return undefined;

  return {
    accountNumber: primaryEntry.accountNumber,
    practiceName: primaryEntry.practiceName,
    emails: uniqueList(entries.map((entry) => entry.email.toLowerCase())),
    priceLists: uniqueAssignedPriceLists(
      uniqueList(entries.flatMap((entry) => entry.allowedPriceLists))
    ),
    allowedPriceLists: uniqueAssignedPriceLists(
      uniqueList(entries.flatMap((entry) => entry.allowedPriceLists))
    ),
    portalSections: uniqueList(entries.flatMap((entry) => entry.portalSections)),
    customerTypeCode: primaryEntry.customerTypeCode,
    customerTypeLabel: primaryEntry.customerTypeLabel,
    detectedCustomerTypeCodes: uniqueList(
      entries.flatMap((entry) => entry.detectedCustomerTypeCodes ?? [])
    ),
  } satisfies PortalCustomer;
}

export function getCustomersByEmail(email: string): PortalCustomer[] {
  const normalizedUserEmail = normalizeEmail(email);

  if (!normalizedUserEmail) return [];

  const entriesByAccount = new Map<string, PortalCustomerAccess[]>();

  for (const entry of customerPortalAccess) {
    if (entry.email.toLowerCase() !== normalizedUserEmail) continue;

    const accountKey = normalizeAccountNumber(entry.accountNumber);

    entriesByAccount.set(accountKey, [
      ...(entriesByAccount.get(accountKey) ?? []),
      entry,
    ]);
  }

  return [...entriesByAccount.values()]
    .map(toPortalCustomer)
    .filter((customer): customer is PortalCustomer => Boolean(customer));
}

export function getCustomerByEmailAndAccount(
  email: string,
  accountNumber: string
) {
  const normalizedAccountNumber = normalizeAccountNumber(accountNumber);

  return getCustomersByEmail(email).find(
    (customer) =>
      normalizeAccountNumber(customer.accountNumber) === normalizedAccountNumber
  );
}

export function getCustomerByEmail(email: string) {
  return getCustomersByEmail(email)[0];
}

export function getCustomerByAccountNumber(accountNumber: string) {
  const normalizedAccountNumber = normalizeAccountNumber(accountNumber);
  if (!normalizedAccountNumber) return undefined;

  const entriesByEmail = new Map<string, PortalCustomerAccess[]>();
  for (const entry of customerPortalAccess) {
    if (normalizeAccountNumber(entry.accountNumber) !== normalizedAccountNumber) continue;
    const emailKey = entry.email.toLowerCase();
    entriesByEmail.set(emailKey, [...(entriesByEmail.get(emailKey) ?? []), entry]);
  }

  const first = [...entriesByEmail.values()][0];
  return first ? toPortalCustomer(first) : undefined;
}

export function customerHasPortalSection(
  customer: PortalCustomer,
  section: PortalSection
) {
  return customer.portalSections.includes(section);
}
