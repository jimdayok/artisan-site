import type { PriceListCode } from "@/lib/portal/priceLists";
import { getPriceListByCode } from "@/lib/portal/priceLists";
import { parseCsvList, readPrivatePortalCsv } from "@/lib/portal/privateCsv";

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
};

export type PortalCustomer = {
  accountNumber: string;
  practiceName: string;
  emails: string[];
  priceLists: PriceListCode[];
  allowedPriceLists: PriceListCode[];
  portalSections: PortalSection[];
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

// ALN staff update customer portal permissions in:
// private-source/portal/customers.csv
// Keep one row per authorized user email. Only the listed price_list codes and
// portal_sections are shown for that login.
export const customerPortalAccess: PortalCustomerAccess[] = readPrivatePortalCsv(
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

export const customers: PortalCustomer[] = customerPortalAccess.map((entry) => ({
  accountNumber: entry.accountNumber,
  practiceName: entry.practiceName,
  emails: [entry.email.toLowerCase()],
  priceLists: entry.allowedPriceLists,
  allowedPriceLists: entry.allowedPriceLists,
  portalSections: entry.portalSections,
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
    priceLists: entry.allowedPriceLists,
    allowedPriceLists: entry.allowedPriceLists,
    portalSections: entry.portalSections,
  } satisfies PortalCustomer;
}

export function customerHasPortalSection(
  customer: PortalCustomer,
  section: PortalSection
) {
  return customer.portalSections.includes(section);
}
