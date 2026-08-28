import type { EdgeMode, LensGroup, PriceBrand, PriceView } from "../../data/privatePriceList";
import PdfDownloadButton from "./PdfDownloadButton";

export type ExportFilters = {
  query: string;
  brand: PriceBrand | "All";
  lensGroup: LensGroup | "All";
  materialId: string;
  edgeMode: EdgeMode;
  priceView: PriceView;
  excludeOutsourced: boolean;
  packageOnly: boolean;
  coatingId: string;
};

export type ExportScope = "full" | "filtered" | "selected";

export default function PDFExportButton({
  filters,
  mode,
  scope = "filtered",
  selectedIds = [],
  children,
  disabled = false,
}: {
  filters: ExportFilters;
  mode: "Wholesale" | "MSRP" | "Combined";
  scope?: ExportScope;
  selectedIds?: string[];
  children?: React.ReactNode;
  disabled?: boolean;
}) {
  const params = new URLSearchParams({
    mode,
    scope,
    query: filters.query,
    brand: filters.brand,
    lensGroup: filters.lensGroup,
    materialId: filters.materialId,
    edgeMode: filters.edgeMode,
    priceView: filters.priceView,
    excludeOutsourced: String(filters.excludeOutsourced),
    packageOnly: String(filters.packageOnly),
    coatingId: filters.coatingId,
  });
  if (selectedIds.length) params.set("selected", selectedIds.join(","));

  return (
    <PdfDownloadButton
      href={`/portal/price-list/export?${params.toString()}`}
      disabled={disabled}
      className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-[#d7c5a8] bg-white px-3 text-xs font-bold text-[#122033] transition hover:bg-[#eadcc6] disabled:cursor-not-allowed disabled:opacity-45"
    >
      {children ?? `Export ${mode} PDF`}
    </PdfDownloadButton>
  );
}
