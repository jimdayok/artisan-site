import "server-only";

import {
  getDashboardV1AdminRows,
  type DashboardV1AdminRow,
} from "@/lib/portal/adminDashboardV1";
import {
  filterRowsForPortalRole,
  type PortalStaffRole,
} from "@/lib/portal/portalRoles";
import {
  PROGRAM_STUDIO_PRICE_LIST_CODES,
  PROGRAM_STUDIO_PACKAGE_PRICE_LIST_CODES,
  PROGRAM_STUDIO_PRICE_LIST_SOURCE_CODES,
  type ProgramStudioCustomer,
  type ProgramStudioPriceListOption,
} from "@/lib/portal/programProposal";
import { getPriceListByCode } from "@/lib/portal/priceLists";

function scopedRows(role: PortalStaffRole) {
  return filterRowsForPortalRole(role, getDashboardV1AdminRows());
}
export function getProgramStudioPriceLists(
  role: PortalStaffRole
): ProgramStudioPriceListOption[] {
  const assignedCodes = new Set(scopedRows(role).flatMap((row) => row.priceListCodes));
  return PROGRAM_STUDIO_PRICE_LIST_CODES.flatMap((code) => {
    const sourceCode = PROGRAM_STUDIO_PRICE_LIST_SOURCE_CODES[code] || code;
    const priceList = getPriceListByCode(sourceCode);
    if (!priceList?.generated) return [];
    if (
      role.kind === "sales-rep" &&
      !assignedCodes.has(code) &&
      !assignedCodes.has(sourceCode)
    ) return [];
    return [
      {
        code,
        label: code === "H5" ? "Artisan Hoya Lens System" : priceList.label,
        package:
          priceList.package || PROGRAM_STUDIO_PACKAGE_PRICE_LIST_CODES.has(code),
        sourceCode,
      },
    ];
  });
}

function primaryAccountNumber(row: DashboardV1AdminRow) {
  return (
    row.accountNumbers
      .split(",")
      .map((value) => value.trim())
      .find(Boolean) || row.acctId
  );
}

export function getProgramStudioCustomers(
  role: PortalStaffRole
): ProgramStudioCustomer[] {
  return scopedRows(role)
    .map((row) => ({
      id: row.acctId,
      name: row.businessName,
      accountNumber: primaryAccountNumber(row),
      location: row.state || row.territory || "",
      state: row.state,
      address: row.address,
      lab: row.lab,
      salesRep: row.salesRep,
      priceListCodes: row.priceListCodes
        .map((code) => code === "XH" ? "H5" : code)
        .filter((code) =>
          PROGRAM_STUDIO_PRICE_LIST_CODES.includes(
            code as (typeof PROGRAM_STUDIO_PRICE_LIST_CODES)[number]
          )
        ),
      isAcquiosMember: ["ACQU", "AQUI"].includes(
        row.customerType.trim().toUpperCase()
      ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
