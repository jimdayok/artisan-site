import type { PriceListCode } from "@/lib/portal/priceLists";

export type PortalCustomerTypeCode = "PART" | "GENL" | "PMP" | "ACQU" | "NL";

export type PortalCustomerTypeInfo = {
  code: PortalCustomerTypeCode;
  label: string;
  priceList: PriceListCode;
};

export const portalCustomerTypes: Record<
  PortalCustomerTypeCode,
  PortalCustomerTypeInfo
> = {
  PART: {
    code: "PART",
    label: "Artisan Equity Partner",
    priceList: "P6",
  },
  GENL: {
    code: "GENL",
    label: "Artisan General Customer",
    priceList: "G6",
  },
  PMP: {
    code: "PMP",
    label: "Artisan PMP Partner",
    priceList: "A6",
  },
  ACQU: {
    code: "ACQU",
    label: "Artisan Acquios Partner",
    priceList: "A6",
  },
  NL: {
    code: "NL",
    label: "Artisan Neurolens Partner",
    priceList: "G6",
  },
};

export function getPortalCustomerTypeInfo(code: string) {
  const normalizedCode = code.trim().toUpperCase() as PortalCustomerTypeCode;

  return portalCustomerTypes[normalizedCode];
}

export function getPriceListForCustomerType(code: string) {
  return getPortalCustomerTypeInfo(code)?.priceList;
}
