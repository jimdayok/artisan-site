import { headers } from "next/headers";
import { forbidden } from "next/navigation";
import { getPortalAuthenticatedEmailFromHeaders } from "@/lib/portal/auth";
import {
  customerHasPortalSection,
  type PortalCustomer,
  type PortalSection,
} from "@/lib/portal/customers";
import {
  getAuthorizedPortalCustomer,
  getAuthorizedPortalCustomers,
} from "@/lib/portal/portalAuthorization";
import {
  getEffectivePortalAccessAccount,
  portalCustomerFromEffectiveAccount,
} from "@/lib/portal/portalAccessOverrides";
import {
  canAccessPortalAdmin,
  getPortalStaffRole,
} from "@/lib/portal/portalRoles";
import { normalizeAssignedPriceListCodes } from "@/lib/portal/assignedPriceLists";
import {
  canonicalPriceListCode,
  getPriceListByCode,
  visiblePriceListCodes,
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

  const portalRole = getPortalStaffRole(authenticatedEmail);
  const hasStaffPortalAccess = canAccessPortalAdmin(portalRole);

  if (priceList && hasStaffPortalAccess) {
    const previewAccountNumber = options?.previewAccountNumber?.trim();
    const previewAccount = previewAccountNumber
      ? await getEffectivePortalAccessAccount(previewAccountNumber)
      : undefined;
    const previewCustomer = previewAccount
      ? (portalCustomerFromEffectiveAccount(
          previewAccount
        ) as PortalCustomer)
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
        programs: [],
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

  const portalRole = getPortalStaffRole(authenticatedEmail);
  const hasStaffPortalAccess = canAccessPortalAdmin(portalRole);

  if (hasStaffPortalAccess) {
    const adminAccessiblePriceLists = [...visiblePriceListCodes];
    return {
      status: "authorized" as const,
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
        programs: [],
      },
    };
  }

  const customer = await getAuthorizedPortalCustomer(authenticatedEmail);

  if (!customer || !customerHasPortalSection(customer, section)) {
    forbidden();
  }

  return { status: "authorized" as const, authenticatedEmail, customer };
}
