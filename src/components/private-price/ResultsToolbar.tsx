"use client";

import { HelpCircle } from "lucide-react";
import PDFExportButton, { type ExportFilters } from "./PDFExportButton";

export type PricingSort = "Recommended" | "Price low to high" | "Price high to low" | "Brand A to Z" | "Brand Z to A" | "Time to Make";

export default function ResultsToolbar({
  count,
  filters,
  sort,
  onSort,
  selectedIds,
  onClearSelected,
  onClear,
}: {
  count: number;
  filters: ExportFilters;
  sort: PricingSort;
  onSort: (sort: PricingSort) => void;
  selectedIds: string[];
  onClearSelected: () => void;
  onClear: () => void;
}) {
  const selectedCount = selectedIds.length;

  return (
    <div className="rounded-3xl border border-[#dfd2bf] bg-[#f8f1e7]/94 p-3 shadow-[0_12px_34px_rgba(18,32,51,0.07)] backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8a7654]">Results</p>
          <p className="text-sm font-semibold text-[#122033]">{count} products matching current filters</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 rounded-full border border-[#dfd2bf] bg-white px-3 py-1.5 text-xs font-bold text-[#122033]">
            Sort by
            <select value={sort} onChange={(event) => onSort(event.target.value as PricingSort)} className="bg-transparent text-xs outline-none">
              {["Recommended", "Price low to high", "Price high to low", "Brand A to Z", "Brand Z to A", "Time to Make"].map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <PDFExportButton filters={filters} mode="Wholesale" scope="full">Export Full Wholesale Price List</PDFExportButton>
          <PDFExportButton filters={filters} mode="MSRP" scope="full">Export Full MSRP Price List</PDFExportButton>
          <PDFExportButton filters={filters} mode="Combined" scope="full">Export Full Combined Price List</PDFExportButton>
          <a
            href="mailto:customerservice@artisanlabnetwork.com?subject=Price%20List%20Question&body=Hello%2C%0A%0AI%20have%20a%20question%20about%20the%20Artisan%20Lab%20Network%20price%20list.%0A%0AProduct%20or%20category%3A%0AQuestion%3A%0A%0AThank%20you."
            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-[#d7c5a8] bg-white px-3 text-xs font-bold text-[#122033] transition hover:bg-[#eadcc6]"
          >
            <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
            Report Missing Product or Ask a Question
          </a>
          <button type="button" onClick={onClear} className="rounded-full border border-[#dfd2bf] bg-white px-3 text-xs font-bold text-[#122033] hover:bg-[#f4ead9]">
            Clear
          </button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#eadfce] pt-3">
        <span className="text-xs font-bold text-[#122033]">Selected for PDF: {selectedCount} products</span>
        <PDFExportButton filters={filters} mode="Wholesale" scope="selected" selectedIds={selectedIds} disabled={!selectedCount}>Export Selected Wholesale PDF</PDFExportButton>
        <PDFExportButton filters={filters} mode="MSRP" scope="selected" selectedIds={selectedIds} disabled={!selectedCount}>Export Selected MSRP PDF</PDFExportButton>
        <PDFExportButton filters={filters} mode="Combined" scope="selected" selectedIds={selectedIds} disabled={!selectedCount}>Export Selected Combined PDF</PDFExportButton>
        <button type="button" onClick={onClearSelected} disabled={!selectedCount} className="rounded-full border border-[#dfd2bf] bg-white px-3 py-2 text-xs font-bold text-[#122033] hover:bg-[#f4ead9] disabled:cursor-not-allowed disabled:opacity-45">
          Clear selected
        </button>
      </div>
    </div>
  );
}
