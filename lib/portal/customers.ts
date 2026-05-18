import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { PriceListCode } from "@/lib/portal/priceLists";
import { getPriceListByCode } from "@/lib/portal/priceLists";
import { parseCsvList, readPrivatePortalCsv } from "@/lib/portal/privateCsv";
import type { PortalCustomerTypeCode } from "@/lib/portal/customerTypes";
import { getPortalCustomerTypeInfo } from "@/lib/portal/customerTypes";

export type PortalSection =
  | "pricing"
  | "packages"
  | "calculator"
  | "catalog"
  | "policies"
  | "exports"
  | "performance";

export type PortalCustomerAccess = {
  email: string;
  accountNumber: string;
  practiceName: string;
  allowedPriceLists: PriceListCode[];
  portalSections: PortalSection[];
  customerTypeCode?: PortalCustomerTypeCode | "";
  customerTypeLabel?: string;
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
};

type WorkbookAccessRecord = {
  email: string;
  accountNumber: string;
  practiceName: string;
  customerTypeCode?: string;
  customerTypeLabel?: string;
  allowedPriceLists?: string[];
  portalSections?: string[];
};

const portalSections = new Set<PortalSection>([
  "pricing",
  "packages",
  "calculator",
  "catalog",
  "policies",
  "exports",
  "performance",
]);

function isPortalSection(section: string): section is PortalSection {
  return portalSections.has(section as PortalSection);
}

function toPriceListCodes(value: string) {
  return parseCsvList(value)
    .map((code) => code.toUpperCase())
    .filter((code): code is PriceListCode => Boolean(getPriceListByCode(code)));
}

function toPortalSections(value: string) {
  return parseCsvList(value)
    .map((section) => section.toLowerCase())
    .filter(isPortalSection);
}

function toPortalSectionsFromList(values: string[] = []) {
  return values
    .map((section) => section.trim().toLowerCase())
    .filter(isPortalSection);
}

function toPriceListCodesFromList(values: string[] = []) {
  return values
    .map((code) => code.trim().toUpperCase())
    .filter((code): code is PriceListCode => Boolean(getPriceListByCode(code)));
}

function uniqueList<T extends string>(values: T[]) {
  return [...new Set(values)];
}

function getWorkbookAccessRecords() {
  const filePath = path.join(
    process.cwd(),
    "private-source",
    "portal",
    "workbook-access.json"
  );

  if (!existsSync(filePath)) return [];

  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as WorkbookAccessRecord[];
  } catch {
    return [];
  }
}

// ALN staff update customer portal permissions in:
// private-source/portal/customers.csv
// Keep one row per authorized user email. Only the listed price_list codes and
// portal_sections are shown for that login.
const manualCustomerPortalAccess: PortalCustomerAccess[] = readPrivatePortalCsv(
  "customers.csv"
)
  .map((row) => ({
    email: row.email?.trim().toLowerCase() ?? "",
    accountNumber: row.account_number?.trim() ?? "",
    practiceName: row.practice_name?.trim() ?? "",
    allowedPriceLists: toPriceListCodes(row.price_lists ?? ""),
    portalSections: toPortalSections(row.portal_sections ?? ""),
  }))
  .filter(
    (entry) =>
      entry.email &&
      entry.accountNumber &&
      entry.practiceName &&
      entry.portalSections.length > 0
  );

const workbookCustomerPortalAccess: PortalCustomerAccess[] =
  getWorkbookAccessRecords()
    .map((entry) => {
      const customerType = getPortalCustomerTypeInfo(
        entry.customerTypeCode ?? ""
      );
      const mappedPriceList = customerType?.priceList;
      const allowedPriceLists = mappedPriceList
        ? [mappedPriceList]
        : toPriceListCodesFromList(entry.allowedPriceLists);

      return {
        email: entry.email?.trim().toLowerCase() ?? "",
        accountNumber: entry.accountNumber?.trim() ?? "",
        practiceName: entry.practiceName?.trim() ?? "",
        allowedPriceLists,
        portalSections: toPortalSectionsFromList(entry.portalSections),
        customerTypeCode: customerType?.code ?? "",
        customerTypeLabel: customerType?.label ?? "",
      } satisfies PortalCustomerAccess;
    })
    .filter(
      (entry) =>
        entry.email &&
        entry.accountNumber &&
        entry.practiceName &&
        entry.portalSections.length > 0
    );

export const customerPortalAccess: PortalCustomerAccess[] = [
  ...workbookCustomerPortalAccess,
  ...manualCustomerPortalAccess.filter(
    (manualEntry) =>
      !workbookCustomerPortalAccess.some(
        (workbookEntry) => workbookEntry.email === manualEntry.email
      )
  ),
];

export const customers: PortalCustomer[] = customerPortalAccess.map((entry) => ({
  accountNumber: entry.accountNumber,
  practiceName: entry.practiceName,
  emails: [entry.email.toLowerCase()],
  priceLists: entry.allowedPriceLists,
  allowedPriceLists: entry.allowedPriceLists,
  portalSections: entry.portalSections,
  customerTypeCode: entry.customerTypeCode,
  customerTypeLabel: entry.customerTypeLabel,
}));

export function getCustomerByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) return undefined;

  const entry = customerPortalAccess.find(
    (customerAccess) => customerAccess.email.toLowerCase() === normalizedEmail
  );

  if (!entry) return undefined;

  return {
    accountNumber: entry.accountNumber,
    practiceName: entry.practiceName,
    emails: [entry.email.toLowerCase()],
    priceLists: uniqueList(entry.allowedPriceLists),
    allowedPriceLists: uniqueList(entry.allowedPriceLists),
    portalSections: uniqueList(entry.portalSections),
    customerTypeCode: entry.customerTypeCode,
    customerTypeLabel: entry.customerTypeLabel,
  } satisfies PortalCustomer;
}

export function customerHasPortalSection(
  customer: PortalCustomer,
  section: PortalSection
) {
  return customer.portalSections.includes(section);
}
