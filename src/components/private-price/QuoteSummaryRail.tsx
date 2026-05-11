"use client";

import { calculatedPrice, edgeAdjustment, materialName, money, type EdgeMode, type PriceItem, type PriceView } from "../../data/privatePriceList";
import { msrpForItem } from "../../data/msrpPriceList";
import PDFExportButton, { type ExportFilters } from "./PDFExportButton";
import PackageBadge from "./PackageBadge";

export default function QuoteSummaryRail({
  item,
  materialId,
  edgeMode,
  priceView,
  filters,
  selectedIds,
}: {
  item?: PriceItem;
  materialId: string;
  edgeMode: EdgeMode;
  priceView: PriceView;
  filters: ExportFilters;
  selectedIds?: string[];
}) {
  const wholesale = item ? calculatedPrice(item, materialId, edgeMode) : 0;
  const msrp = item ? msrpForItem(item, materialId) : undefined;

  return (
    <aside className="sticky top-5 max-h-[calc(100vh-2.5rem)] overflow-y-auto overflow-x-hidden rounded-3xl border border-[#dfd2bf] bg-white/86 p-4 shadow-[0_16px_42px_rgba(18,32,51,0.07)] backdrop-blur">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8a7654]">Quote Summary</p>
      {item ? (
        <>
          <h2 className="mt-2 text-lg font-semibold leading-tight text-[#122033]">{item.name}</h2>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#8a7654]">{item.brand}</p>
          <div className="mt-4 grid gap-2 rounded-2xl border border-[#eadfce] bg-[#fbf8f3] p-3 text-xs text-[#4d5664]">
            <Row label="Material" value={materialName(materialId)} />
            <Row label={edgeMode === "Edged" ? "Edged" : "Uncut Deduction"} value={edgeAdjustment(edgeMode) === 0 ? "Included" : "-$8"} />
            {priceView !== "MSRP" ? <Row label="Wholesale" value={money(wholesale)} strong /> : null}
            {priceView !== "Wholesale" ? <Row label="MSRP" value={msrp ? money(msrp) : "Unavailable"} strong /> : null}
          </div>
          <div className="mt-3"><PackageBadge item={item} /></div>
          <p className="mt-4 text-xs leading-5 text-[#625b53]">Selected AR coating and add-ons can be applied in Quote Builder. MSRP guidance should be reviewed by each practice.</p>
        </>
      ) : (
        <p className="mt-3 text-sm leading-6 text-[#625b53]">Choose a product or click Quick Quote to populate this rail.</p>
      )}
      <div className="mt-4 grid gap-2">
        <PDFExportButton filters={filters} mode="Wholesale" scope="full">Export Full Wholesale Price List</PDFExportButton>
        <PDFExportButton filters={filters} mode="MSRP" scope="full">Export Full MSRP Price List</PDFExportButton>
        <PDFExportButton filters={filters} mode="Combined" scope="full">Export Full Combined Price List</PDFExportButton>
        <PDFExportButton filters={filters} mode="Wholesale" scope="selected" selectedIds={selectedIds ?? []} disabled={!selectedIds?.length}>Export Selected Wholesale PDF</PDFExportButton>
        <PDFExportButton filters={filters} mode="MSRP" scope="selected" selectedIds={selectedIds ?? []} disabled={!selectedIds?.length}>Export Selected MSRP PDF</PDFExportButton>
        <PDFExportButton filters={filters} mode="Combined" scope="selected" selectedIds={selectedIds ?? []} disabled={!selectedIds?.length}>Export Selected Combined PDF</PDFExportButton>
      </div>
    </aside>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span>{label}</span>
      <strong className={strong ? "text-base text-[#122033]" : "text-[#122033]"}>{value}</strong>
    </div>
  );
}
