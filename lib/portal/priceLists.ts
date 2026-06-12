import registryJson from "@/lib/portal/generated/priceListRegistry.json";
import { normalizePriceListCode } from "@/lib/pricing/priceListCodes";

export type PriceListCode = string;

export type PortalPriceList = {
  code: PriceListCode;
  label: string;
  fileName: string;
  r2Key?: string | null;
  onlineUrl?: string | null;
  configured?: boolean;
  generated: boolean;
  package: boolean;
  detected: boolean;
  invalidOrUnknown: boolean;
  generationStatus: "generated" | "missing";
  assignmentStatus: "assigned" | "unassigned";
  assignedAccountCount: number;
  visibleCustomerCount: number;
  rowCount: number;
  generatedAt?: string | null;
};

type RegistryEntry = Omit<
  PortalPriceList,
  "fileName" | "r2Key" | "onlineUrl" | "configured"
> & {
  source: string;
};

const pdfByCode: Record<
  string,
  { fileName: string; r2Key: string | null }
> = {
  P6: {
    fileName: "alnpricing_2026_P6.pdf",
    r2Key: "price-sheets/alnpricing_2026_P6.pdf",
  },
  G6: {
    fileName: "alnpricing_2026_G6.pdf",
    r2Key: "price-sheets/alnpricing_2026_G6.pdf",
  },
  A6: {
    fileName: "alnpricing_2026_A6.pdf",
    r2Key: "price-sheets/alnpricing_2026_A6.pdf",
  },
  B5: {
    fileName: "alnpricing_2026_B5.pdf",
    r2Key: "price-sheets/alnpricing_2026_B5.pdf",
  },
  S5: {
    fileName: "alnpricing_2026_S5.pdf",
    r2Key: "price-sheets/alnpricing_2026_S5.pdf",
  },
  VD: {
    fileName: "alnpricing_2026_VD.pdf",
    r2Key: "price-sheets/alnpricing_2026_VD.pdf",
  },
};

export function canonicalPriceListCode(code: string) {
  return normalizePriceListCode(code);
}

export const priceLists: PortalPriceList[] = (
  registryJson.entries as RegistryEntry[]
).map((entry) => {
  const pdf = pdfByCode[entry.code];
  return {
    ...entry,
    label: entry.label || `${entry.code} Price List`,
    fileName: pdf?.fileName ?? `Interactive ${entry.code} pricing`,
    r2Key: pdf?.r2Key ?? null,
    onlineUrl: `/portal/price-list/${entry.code.toLowerCase()}`,
    configured: entry.generated,
  };
});

const priceListByCode = new Map(
  priceLists.map((priceList) => [priceList.code, priceList])
);

export function getPriceListByCode(code: string) {
  return priceListByCode.get(canonicalPriceListCode(code));
}
