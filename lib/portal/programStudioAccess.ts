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
    const priceList = getPriceListByCode(code);
    if (!priceList?.generated) return [];
    if (role.kind === "sales-rep" && !assignedCodes.has(code)) return [];
    return [
      {
        code,
        label: priceList.label,
        package: priceList.package,
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
      address: row.address,
      lab: row.lab,
      salesRep: row.salesRep,
      priceListCodes: row.priceListCodes.filter((code) =>
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
