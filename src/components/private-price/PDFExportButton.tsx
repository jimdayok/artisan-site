"use client";

import { FileDown } from "lucide-react";
import type { EdgeMode, LensGroup, PriceBrand, PriceView } from "../../data/privatePriceList";

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
  const exportPdf = () => {
    if (disabled) return;
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
    window.open(`/private/price-list/export?${params.toString()}`, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={exportPdf}
      disabled={disabled}
      className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-[#d7c5a8] bg-white px-3 text-xs font-bold text-[#122033] transition hover:bg-[#eadcc6] disabled:cursor-not-allowed disabled:opacity-45"
    >
      <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
      {children ?? `Export ${mode} PDF`}
    </button>
  );
}
