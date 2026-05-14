import type { PriceListCode } from "@/lib/portal/priceLists";

export type PortalSection =
  | "pricing"
  | "packages"
  | "calculator"
  | "catalog"
  | "policies"
  | "exports";

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

// ALN staff update customer portal permissions here.
// Add one record per authorized user email, keep emails lowercase, and assign
// only the price list codes and sections that account should be able to see.
export const customerPortalAccess: PortalCustomerAccess[] = [
  {
    email: "jimdayok@me.com",
    accountNumber: "0001",
    practiceName: "Artisan Lab Network Test Account",
    allowedPriceLists: ["P6", "G6", "B5", "A6", "S5", "VD"],
    portalSections: [
      "pricing",
      "packages",
      "calculator",
      "catalog",
      "policies",
      "exports",
    ],
  },
  {
    email: "jim.day@artisanlabnetwork.com",
    accountNumber: "0001",
    practiceName: "Artisan Lab Network Test Account",
    allowedPriceLists: ["P6", "G6", "B5", "A6", "S5", "VD"],
    portalSections: [
      "pricing",
      "packages",
      "calculator",
      "catalog",
      "policies",
      "exports",
    ],
  },
  {
    email: "doctor@abcoptical.com",
    accountNumber: "1000",
    practiceName: "ABC Optical",
    allowedPriceLists: ["P6"],
    portalSections: ["pricing", "policies"],
  },
  {
    email: "optician@eyes.com",
    accountNumber: "1002",
    practiceName: "Eyes Optical",
    allowedPriceLists: ["G6", "B5"],
    portalSections: ["pricing", "packages", "calculator", "catalog"],
  },
];

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
