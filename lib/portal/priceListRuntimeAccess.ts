import { getPortalAuthenticatedEmailFromHeaders } from "@/lib/portal/auth";
import { isPortalAdminEmailAddress } from "@/lib/portal/adminAccess";
import { normalizeAssignedPriceListCodes } from "@/lib/portal/assignedPriceLists";
import { getPortalCustomerTypeInfo } from "@/lib/portal/customerTypes";
import { portalDashboardV1AccessIndex } from "@/lib/portal/dashboardV1AccessIndex";
import {
  canonicalPriceListCode,
  getPriceListByCode,
  visiblePriceListCodes,
  type PortalPriceList,
} from "@/lib/portal/priceLists";

type PortalSection =
  | "pricing"
  | "packages"
  | "calculator"
  | "catalog"
  | "policies"
  | "exports"
  | "performance"
  | "onboarding";

type RuntimePortalCustomer = {
  accountNumber: string;
  practiceName: string;
  emails: string[];
  priceLists: string[];
  allowedPriceLists: string[];
  portalSections: PortalSection[];
  customerTypeCode?: string;
  customerTypeLabel?: string;
};

type AuthorizedPriceListAccess = {
  status: "authorized";
  authenticatedEmail: string;
  customer: RuntimePortalCustomer;
  priceList: PortalPriceList;
};

type DeniedPriceListAccess = {
  status: "unauthenticated" | "forbidden" | "not-found";
  authenticatedEmail: string;
  customer?: RuntimePortalCustomer;
  priceList?: PortalPriceList;
};

export type RuntimePriceListAccessResult =
  | AuthorizedPriceListAccess
  | DeniedPriceListAccess;

type AccountIndexRow = {
  account_id?: string;
  all_account_numbers?: string;
  business_name?: string;
  customer_type?: string;
  price_lists?: string[];
};

type UserAccessRow = {
  email?: string;
  account_ids?: string[];
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

function normalizeEmail(email: unknown) {
  return String(email ?? "").trim().toLowerCase();
}

function normalizeAccountNumber(value: unknown) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\.0$/, "")
    .replace(/^0+(?=\d)/, "");
}

function accessAccounts() {
  return portalDashboardV1AccessIndex.accountsIndex as AccountIndexRow[];
}

function accessUsers() {
  return portalDashboardV1AccessIndex.usersToAccounts as UserAccessRow[];
}

function customerFromAccount(
  account: AccountIndexRow,
  email: string
): RuntimePortalCustomer | undefined {
  const accountId = String(account.account_id ?? "").trim().toUpperCase();
  if (!accountId) return undefined;

  const customerType = getPortalCustomerTypeInfo(account.customer_type ?? "");
  const priceLists = normalizeAssignedPriceListCodes(account.price_lists ?? []);

  return {
    accountNumber: accountId,
    practiceName: account.business_name?.trim() || accountId,
    emails: [email],
    priceLists,
    allowedPriceLists: priceLists,
    portalSections: ALL_PORTAL_SECTIONS,
    customerTypeCode: customerType?.code ?? "",
    customerTypeLabel: customerType?.label ?? "",
  };
}

function findAccountByIdentifier(accountNumber: string) {
  const normalized = normalizeAccountNumber(accountNumber);
  if (!normalized) return undefined;

  return accessAccounts().find((account) => {
    const accountId = normalizeAccountNumber(account.account_id ?? "");
    if (accountId === normalized) return true;

    return String(account.all_account_numbers ?? "")
      .split(",")
      .map((value) => normalizeAccountNumber(value))
      .some((value) => value === normalized);
  });
}

function customersForEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return [];

  const accountRows = accessUsers()
    .filter((row) => normalizeEmail(row.email) === normalizedEmail)
    .flatMap((row) => row.account_ids ?? [])
    .map((accountId) => findAccountByIdentifier(String(accountId ?? "")))
    .filter((account): account is AccountIndexRow => Boolean(account));

  const customers = new Map<string, RuntimePortalCustomer>();
  for (const account of accountRows) {
    const customer = customerFromAccount(account, normalizedEmail);
    if (customer) customers.set(customer.accountNumber, customer);
  }

  return [...customers.values()];
}

export async function getAuthorizedRuntimePriceListFromHeaders(
  headerList: Headers,
  code: string,
  options?: { previewAccountNumber?: string }
): Promise<RuntimePriceListAccessResult> {
  const authenticatedEmail = getPortalAuthenticatedEmailFromHeaders(headerList);
  const priceList = getPriceListByCode(code);

  if (!authenticatedEmail) {
    return { status: "unauthenticated", authenticatedEmail: "", priceList };
  }

  if (priceList && isPortalAdminEmailAddress(authenticatedEmail)) {
    const previewAccountNumber = options?.previewAccountNumber?.trim();
    const previewAccount = previewAccountNumber
      ? findAccountByIdentifier(previewAccountNumber)
      : undefined;

    if (previewAccount) {
      const previewCustomer = customerFromAccount(previewAccount, authenticatedEmail);
      if (!previewCustomer) {
        return { status: "forbidden", authenticatedEmail, priceList };
      }
      if (!previewCustomer.priceLists.includes(priceList.code)) {
        return {
          status: "forbidden",
          authenticatedEmail,
          customer: previewCustomer,
          priceList,
        };
      }
      return {
        status: "authorized",
        authenticatedEmail,
        customer: previewCustomer,
        priceList,
      };
    }

    const adminAccessiblePriceLists = [...visiblePriceListCodes];
    return {
      status: "authorized",
      authenticatedEmail,
      customer: {
        accountNumber: "ADMIN",
        practiceName: "Portal Administrator",
        emails: [authenticatedEmail],
        priceLists: adminAccessiblePriceLists,
        allowedPriceLists: adminAccessiblePriceLists,
        portalSections: ALL_PORTAL_SECTIONS,
      },
      priceList,
    };
  }

  const customers = customersForEmail(authenticatedEmail);
  const customer = customers.find((entry) =>
    priceList ? entry.priceLists.includes(canonicalPriceListCode(priceList.code)) : true
  );

  if (!customer) {
    return { status: "forbidden", authenticatedEmail, priceList };
  }

  if (!priceList) {
    return { status: "not-found", authenticatedEmail, customer };
  }

  if (!customer.priceLists.includes(priceList.code)) {
    return { status: "forbidden", authenticatedEmail, customer, priceList };
  }

  return { status: "authorized", authenticatedEmail, customer, priceList };
}
