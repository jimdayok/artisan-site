"use client";

import { calculatedPrice, materialAdders, materialAdjustmentForItem, adjustmentLabel, edgeAdjustment, professionalResourceHref, isPackageEligible, logoByBrand, money, priceTypeLabel, type EdgeMode, type PriceItem } from "../../data/privatePriceList";
import ARCompatibilityPanel from "./ARCompatibilityPanel";
import PackageBadge from "./PackageBadge";
import PriceBadge from "./PriceBadge";

export default function ProductDetailPanel({
  item,
  materialId,
  edgeMode,
  onQuote,
}: {
  item: PriceItem;
  materialId: string;
  edgeMode: EdgeMode;
  onQuote: (item: PriceItem) => void;
}) {
  const logo = logoByBrand[item.brand];
  const selectedTotal = calculatedPrice(item, materialId, edgeMode);
  const selectedUncutTotal = calculatedPrice(item, materialId, "Uncut");

  return (
    <div className="mt-3 rounded-2xl border border-[#eadfce] bg-[#fbf8f3] p-3">
      <div className="grid gap-3 lg:grid-cols-[190px_minmax(0,1fr)_240px]">
        <div className="rounded-2xl border border-[#eadfce] bg-white p-3">
          <div className="flex h-20 items-center justify-center rounded-xl bg-[#f8f1e7]">
            {logo ? <img src={logo} alt={`${item.brand} logo`} className="max-h-12 max-w-[150px] object-contain" /> : <span className="text-2xl font-semibold text-[#122033]">{item.brand.slice(0, 2).toUpperCase()}</span>}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <PriceBadge type={item.type}>{priceTypeLabel(item.type)}</PriceBadge>
            {item.outsourced ? <PriceBadge tone="outsourced">Outsourced</PriceBadge> : null}
          </div>
          <p className="mt-3 text-xs leading-5 text-[#625b53]">{item.notes ?? "Base pricing shown in polycarbonate. Select a material to adjust pricing."}</p>
        </div>
        <div className="rounded-2xl border border-[#eadfce] bg-white p-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8a7654]">Calculated material prices</p>
          <p className="mt-1 text-[11px] font-semibold text-[#625b53]">{edgeMode === "Uncut" ? "Uncut totals include the -$8 Uncut Deduction." : "Edged totals shown. Edged is included."}</p>
          <div className="mt-2 grid gap-1 text-xs text-[#4d5664] sm:grid-cols-2">
            {materialAdders.map((material) => (
              <div key={material.id} className={`flex justify-between gap-2 rounded-xl border px-2 py-1.5 ${material.id === materialId ? "border-[#c7ad7b] bg-[#fff7df]" : "border-[#eadfce] bg-[#fbf8f3]"}`}>
                <span>{material.name}</span>
                <strong className="text-[#122033]">{money(calculatedPrice(item, material.id, edgeMode))}</strong>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl border border-[#eadfce] bg-[#fbf8f3] px-3 py-2 text-xs text-[#4d5664]">
            <div className="flex justify-between gap-2"><span>Selected total</span><strong className="text-[#122033]">{money(selectedTotal)}</strong></div>
            <div className="mt-1 flex justify-between gap-2"><span>Uncut Deduction total</span><strong className="text-[#122033]">{money(selectedUncutTotal)} ({edgeAdjustment("Uncut") === -8 ? "-$8" : "included"})</strong></div>
          </div>
        </div>
        <div className="rounded-2xl border border-[#eadfce] bg-white p-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8a7654]">Quote effects</p>
          <div className="mt-2 grid gap-1 text-xs text-[#4d5664]">
            <div className="flex justify-between gap-2"><span>Selected material</span><strong className="text-[#122033]">{adjustmentLabel(materialAdjustmentForItem(item, materialId))}</strong></div>
            <div className="flex justify-between gap-2"><span>{edgeMode === "Edged" ? "Edged" : "Uncut Deduction"}</span><strong className="text-[#122033]">{edgeAdjustment(edgeMode) === 0 ? "Included" : "-$8"}</strong></div>
            <div className="flex justify-between gap-2"><span>Package</span><strong className="text-[#122033]">{isPackageEligible(item) ? "Available" : "Standard"}</strong></div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <PackageBadge item={item} />
            <a href={professionalResourceHref(item.brand)} className="rounded-full border border-[#d7c5a8] bg-white px-3 py-1.5 text-xs font-bold text-[#122033]">Professional Resources</a>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8a7654]">Notes</p>
          <p className="mt-2 text-xs leading-5 text-[#4d5664]">{item.requires ? `Requires: ${item.requires}` : item.notes ?? "No additional restrictions listed."}</p>
          <button type="button" onClick={() => onQuote(item)} className="mt-3 rounded-full bg-[#122033] px-3 py-1.5 text-xs font-bold text-white">Add to Quote</button>
        </div>
      </div>
      <ARCompatibilityPanel item={item} />
    </div>
  );
}
