import { headers } from "next/headers";
import { getPortalAuthenticatedEmailFromHeaders } from "@/lib/portal/auth";
import {
  customerHasPortalSection,
  getCustomerByEmail,
  getCustomersByEmail,
  type PortalCustomer,
  type PortalSection,
} from "@/lib/portal/customers";
import {
  getPriceListByCode,
  type PortalPriceList,
  type PriceListCode,
} from "@/lib/portal/priceLists";

type AuthorizedPriceListAccess = {
  status: "authorized";
  authenticatedEmail: string;
  customer: PortalCustomer;
  priceList: PortalPriceList;
};

type DeniedPriceListAccess = {
  status: "unauthenticated" | "forbidden" | "not-found";
  authenticatedEmail: string;
  customer?: PortalCustomer;
  priceList?: PortalPriceList;
};

export type PriceListAccessResult =
  | AuthorizedPriceListAccess
  | DeniedPriceListAccess;

export function getAuthorizedPriceListFromHeaders(
  headerList: Headers,
  code: string
): PriceListAccessResult {
  const authenticatedEmail = getPortalAuthenticatedEmailFromHeaders(headerList);
  const priceList = getPriceListByCode(code);

  if (!authenticatedEmail) {
    return { status: "unauthenticated", authenticatedEmail: "", priceList };
  }

  const customers = getCustomersByEmail(authenticatedEmail);
  const customer = customers.find((entry) =>
    priceList
      ? entry.priceLists
          .map((priceListCode) => priceListCode.trim().toUpperCase())
          .includes(priceList.code)
      : true
  );

  if (!customer) {
    return { status: "forbidden", authenticatedEmail, priceList };
  }

  if (!priceList) {
    return { status: "not-found", authenticatedEmail, customer };
  }

  const assignedPriceListCodes = customer.priceLists.map((priceListCode) =>
    priceListCode.trim().toUpperCase()
  );

  if (!assignedPriceListCodes.includes(priceList.code)) {
    return { status: "forbidden", authenticatedEmail, customer, priceList };
  }

  return { status: "authorized", authenticatedEmail, customer, priceList };
}

export async function getAuthorizedPriceListForPage(code: PriceListCode) {
  return getAuthorizedPriceListFromHeaders(await headers(), code);
}

export async function getAuthorizedPortalSectionForPage(section: PortalSection) {
  const headerList = await headers();
  const authenticatedEmail = getPortalAuthenticatedEmailFromHeaders(headerList);

  if (!authenticatedEmail) {
    return { status: "unauthenticated" as const, authenticatedEmail: "" };
  }

  const customer = getCustomerByEmail(authenticatedEmail);

  if (!customer || !customerHasPortalSection(customer, section)) {
    return { status: "forbidden" as const, authenticatedEmail, customer };
  }

  return { status: "authorized" as const, authenticatedEmail, customer };
}
