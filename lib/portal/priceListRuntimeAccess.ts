import { getPortalAuthenticatedEmailFromHeaders } from "@/lib/portal/auth";
import { getDashboardV1AdminRows } from "@/lib/portal/adminDashboardV1";
import { normalizeAssignedPriceListCodes } from "@/lib/portal/assignedPriceLists";
import {
  getEffectivePortalAccessAccount,
  getEffectivePortalAccessAccountsForEmail,
  portalCustomerFromEffectiveAccount,
} from "@/lib/portal/portalAccessOverrides";
import {
  canAccessAdminAccount,
  filterRowsForPortalRole,
  getPortalStaffRole,
} from "@/lib/portal/portalRoles";
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
  programs: string[];
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

async function customersForEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return [];
  return (await getEffectivePortalAccessAccountsForEmail(normalizedEmail)).map(
    (account) =>
      portalCustomerFromEffectiveAccount(
        account
      ) as RuntimePortalCustomer
  );
}

function staffAccessiblePriceListCodes(
  staffRole: ReturnType<typeof getPortalStaffRole>
) {
  if (staffRole.kind === "admin") return [...visiblePriceListCodes];
  if (staffRole.kind !== "sales-rep") return [];

  return normalizeAssignedPriceListCodes(
    filterRowsForPortalRole(staffRole, getDashboardV1AdminRows()).flatMap(
      (row) => row.priceListCodes
    )
  ).filter((code) => visiblePriceListCodes.includes(code));
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

  const staffRole = getPortalStaffRole(authenticatedEmail);
  const staffPriceListCodes = staffAccessiblePriceListCodes(staffRole);

  if (priceList && staffPriceListCodes.includes(priceList.code)) {
    const previewAccountNumber = options?.previewAccountNumber?.trim();
    const previewAccount = previewAccountNumber
      ? await getEffectivePortalAccessAccount(previewAccountNumber)
      : undefined;

    if (previewAccount) {
      const previewRoleRow = getDashboardV1AdminRows().find(
        (row) =>
          normalizeAccountNumber(row.acctId) ===
            normalizeAccountNumber(previewAccountNumber) ||
          row.accountNumbers
            .split(",")
            .map(normalizeAccountNumber)
            .includes(normalizeAccountNumber(previewAccountNumber))
      );
      if (
        staffRole.kind === "sales-rep" &&
        (!previewRoleRow || !canAccessAdminAccount(staffRole, previewRoleRow))
      ) {
        return { status: "forbidden", authenticatedEmail, priceList };
      }

      const previewCustomer = portalCustomerFromEffectiveAccount(
        previewAccount
      ) as RuntimePortalCustomer;
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

    return {
      status: "authorized",
      authenticatedEmail,
      customer: {
        accountNumber: staffRole.kind === "admin" ? "ADMIN" : "SALES",
        practiceName:
          staffRole.kind === "admin" ? "Portal Administrator" : staffRole.label,
        emails: [authenticatedEmail],
        priceLists: staffPriceListCodes,
        allowedPriceLists: staffPriceListCodes,
        portalSections: ALL_PORTAL_SECTIONS,
        programs: [],
      },
      priceList,
    };
  }

  const customers = await customersForEmail(authenticatedEmail);
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
