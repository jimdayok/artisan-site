import type { PriceItem, PriceView } from "../../data/privatePriceList";
import { adjustmentLabel, calculatedPrice, edgeAdjustment, isPackageEligible, lensGroupForItem, materialAdjustmentForItem, money, priceTypeLabel, professionalResourceHref, type EdgeMode } from "../../data/privatePriceList";
import { msrpForItem } from "../../data/msrpPriceList";
import ARCompatibilityPanel from "./ARCompatibilityPanel";
import PackageBadge from "./PackageBadge";
import PriceBadge from "./PriceBadge";

export default function PricingCard({
  item,
  compact = false,
  selectedMaterialId = "material-polycarb",
  edgeMode = "Edged",
  priceView = "Wholesale",
  selectedAddOns = [],
}: {
  item: PriceItem;
  compact?: boolean;
  selectedMaterialId?: string;
  edgeMode?: EdgeMode;
  priceView?: PriceView;
  selectedAddOns?: PriceItem[];
}) {
  const materialAdjustment = materialAdjustmentForItem(item, selectedMaterialId);
  const cutAdjustment = edgeAdjustment(edgeMode);
  const finalPrice = calculatedPrice(item, selectedMaterialId, edgeMode, selectedAddOns);
  const msrp = msrpForItem(item, selectedMaterialId);
  const lensGroup = lensGroupForItem(item);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-[#e1d4c2] bg-white/95 p-4 shadow-[0_12px_30px_rgba(18,32,51,0.06)] transition hover:-translate-y-0.5 hover:border-[#c7ad7b] hover:shadow-[0_18px_44px_rgba(18,32,51,0.1)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <PriceBadge type={item.type}>{priceTypeLabel(item.type)}</PriceBadge>
          {item.recommended ? <PriceBadge tone="recommended">★ Recommended</PriceBadge> : null}
          {item.outsourced ? <PriceBadge tone="outsourced">Outsourced</PriceBadge> : null}
        </div>
        {priceView !== "MSRP" ? <div className="shrink-0 rounded-xl bg-[#122033] px-3 py-2 text-sm font-bold text-white">{money(finalPrice)}</div> : null}
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a7654]">
        {item.brand} / {lensGroup ?? item.category}
      </p>
      <h3 className={`${compact ? "text-base" : "text-lg"} mt-1.5 font-semibold leading-tight text-[#122033]`}>
        {item.name}
      </h3>
      {item.code ? (
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#75664e]">
          Code {item.code}
        </p>
      ) : null}
      <div className="mt-4 grid gap-1.5 rounded-2xl border border-[#eadfce] bg-[#fbf8f3] p-3 text-xs text-[#4d5664]">
        {priceView !== "MSRP" ? (
          <>
            <div className="flex justify-between gap-3"><span>Base poly wholesale</span><strong className="text-[#122033]">{money(item.price)}</strong></div>
            <div className="flex justify-between gap-3"><span>Material adjustment</span><strong className="text-[#122033]">{adjustmentLabel(materialAdjustment)}</strong></div>
            <div className="flex justify-between gap-3"><span>{edgeMode}</span><strong className="text-[#122033]">{cutAdjustment === 0 ? "Included" : adjustmentLabel(cutAdjustment)}</strong></div>
            <div className="flex justify-between gap-3 border-t border-[#e4d8c8] pt-1.5"><span>Final wholesale</span><strong className="text-[#122033]">{money(finalPrice)}</strong></div>
          </>
        ) : null}
        {priceView !== "Wholesale" ? (
          <div className="flex justify-between gap-3"><span>MSRP guidance</span><strong className="text-[#122033]">{msrp ? money(msrp) : "Unavailable"}</strong></div>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <PackageBadge item={item} />
        {isPackageEligible(item) ? null : item.type !== "Add-On" && item.type !== "Service" ? <span className="rounded-full border border-[#eadfce] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#75664e]">Standard</span> : null}
      </div>
      <ARCompatibilityPanel item={item} />
      <div className="mt-auto pt-3">
        {item.requires ? <p className="text-sm leading-6 text-[#4d5664]">Requires: {item.requires}</p> : null}
        {item.notes ? <p className="text-sm leading-6 text-[#625b53]">{item.notes}</p> : null}
        <a href={professionalResourceHref(item.brand)} className="mt-3 inline-flex min-h-9 items-center justify-center rounded-full border border-[#d7c5a8] bg-white px-3 py-1.5 text-xs font-bold text-[#122033] transition hover:bg-[#eadcc6]">
          Professional Resources
        </a>
      </div>
    </article>
  );
}
