import { headers } from "next/headers";
import { forbidden } from "next/navigation";
import { getPortalAuthenticatedEmailFromHeaders } from "@/lib/portal/auth";
import { isPortalAdminEmail } from "@/lib/portal/admin";
import {
  customerHasPortalSection,
  getCustomerByAccountNumber,
  type PortalCustomer,
  type PortalSection,
} from "@/lib/portal/customers";
import {
  getAuthorizedPortalCustomer,
  getAuthorizedPortalCustomers,
} from "@/lib/portal/portalAuthorization";
import { normalizeAssignedPriceListCodes } from "@/lib/portal/assignedPriceLists";
import {
  canonicalPriceListCode,
  getPriceListByCode,
  priceLists,
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

export async function getAuthorizedPriceListFromHeaders(
  headerList: Headers,
  code: string,
  options?: { previewAccountNumber?: string }
): Promise<PriceListAccessResult> {
  const authenticatedEmail = getPortalAuthenticatedEmailFromHeaders(headerList);
  const priceList = getPriceListByCode(code);

  if (!authenticatedEmail) {
    return { status: "unauthenticated", authenticatedEmail: "", priceList };
  }

  if (priceList && isPortalAdminEmail(authenticatedEmail)) {
    const previewAccountNumber = options?.previewAccountNumber?.trim();
    const previewCustomer = previewAccountNumber
      ? getCustomerByAccountNumber(previewAccountNumber)
      : undefined;
    if (previewCustomer) {
      const previewPriceLists = normalizeAssignedPriceListCodes(
        previewCustomer.priceLists
      );
      if (!previewPriceLists.includes(priceList.code)) {
        return {
          status: "forbidden",
          authenticatedEmail,
          customer: {
            ...previewCustomer,
            priceLists: previewPriceLists,
            allowedPriceLists: previewPriceLists,
          },
          priceList,
        };
      }
      return {
        status: "authorized",
        authenticatedEmail,
        customer: {
          ...previewCustomer,
          priceLists: previewPriceLists,
          allowedPriceLists: previewPriceLists,
        },
        priceList,
      };
    }

    const adminAccessiblePriceLists = [...new Set(priceLists.map((entry) => canonicalPriceListCode(entry.code)))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    return {
      status: "authorized",
      authenticatedEmail,
      customer: {
        accountNumber: "ADMIN",
        practiceName: "Portal Administrator",
        emails: [authenticatedEmail],
        priceLists: adminAccessiblePriceLists,
        allowedPriceLists: adminAccessiblePriceLists,
        portalSections: [
          "pricing",
          "packages",
          "calculator",
          "catalog",
          "policies",
          "exports",
          "performance",
          "onboarding",
        ],
      },
      priceList,
    };
  }

  const customers = await getAuthorizedPortalCustomers(authenticatedEmail);
  const customer = customers.find((entry) =>
      priceList
        ? entry.priceLists
          .map((priceListCode) => canonicalPriceListCode(priceListCode))
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
    canonicalPriceListCode(priceListCode)
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

  if (isPortalAdminEmail(authenticatedEmail)) {
    return {
      status: "authorized" as const,
      authenticatedEmail,
      customer: {
        accountNumber: "ADMIN",
        practiceName: "Portal Administrator",
        emails: [authenticatedEmail],
        priceLists: ["P6", "G6", "A6", "B5", "S5", "VD", "M5", "Y5", "TK"],
        allowedPriceLists: ["P6", "G6", "A6", "B5", "S5", "VD", "M5", "Y5", "TK"],
        portalSections: [
          "pricing",
          "packages",
          "calculator",
          "catalog",
          "policies",
          "exports",
          "performance",
          "onboarding",
        ],
      },
    };
  }

  const customer = await getAuthorizedPortalCustomer(authenticatedEmail);

  if (!customer || !customerHasPortalSection(customer, section)) {
    forbidden();
  }

  return { status: "authorized" as const, authenticatedEmail, customer };
}
