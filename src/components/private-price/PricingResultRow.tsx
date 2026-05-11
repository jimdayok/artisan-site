"use client";

import { useState } from "react";
import { Clock3 } from "lucide-react";
import { calculatedPrice, lensGroupForItem, materialAdjustmentForItem, money, timeToMake, type EdgeMode, type PriceItem, type PriceView } from "../../data/privatePriceList";
import { msrpForItem } from "../../data/msrpPriceList";
import PackageBadge from "./PackageBadge";
import PriceBadge from "./PriceBadge";
import ProductDetailPanel from "./ProductDetailPanel";

export default function PricingResultRow({
  item,
  materialId,
  edgeMode,
  priceView,
  arSelected,
  selected,
  onToggleSelected,
  onQuote,
}: {
  item: PriceItem;
  materialId: string;
  edgeMode: EdgeMode;
  priceView: PriceView;
  arSelected: boolean;
  selected: boolean;
  onToggleSelected: (selected: boolean) => void;
  onQuote: (item: PriceItem) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const wholesale = calculatedPrice(item, materialId, edgeMode);
  const msrp = msrpForItem(item, materialId);
  const lensGroup = lensGroupForItem(item) ?? item.category;
  const timing = timeToMake(item, arSelected);

  return (
    <article className="rounded-2xl border border-[#dfd2bf] bg-white/88 px-3 py-3 shadow-[0_8px_24px_rgba(18,32,51,0.045)]">
      <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_130px_145px_150px_185px] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <PriceBadge type={item.type}>{item.type}</PriceBadge>
            {item.recommended ? <PriceBadge tone="recommended">Recommended</PriceBadge> : null}
            {item.outsourced ? <PriceBadge tone="outsourced">Outsourced</PriceBadge> : null}
            <PackageBadge item={item} />
          </div>
          <h3 className="mt-1.5 truncate text-base font-semibold text-[#122033]">{item.name}</h3>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a7654]">{item.brand} / {lensGroup}</p>
          <label className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-[#122033]">
            <input type="checkbox" checked={selected} onChange={(event) => onToggleSelected(event.target.checked)} className="h-4 w-4 rounded border-[#d7c5a8]" />
            Include in printable list
          </label>
        </div>
        <div className="text-xs text-[#4d5664]">
          <span className="block">Material</span>
          <strong className="text-[#122033]">{money(materialAdjustmentForItem(item, materialId))}</strong>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs lg:block">
          {priceView !== "MSRP" ? <div><span className="block text-[#625b53]">Wholesale</span><strong className="text-base text-[#122033]">{money(wholesale)}</strong></div> : null}
          {priceView !== "Wholesale" ? <div><span className="block text-[#625b53]">MSRP</span><strong className="text-base text-[#122033]">{msrp ? money(msrp) : "Unavailable"}</strong></div> : null}
        </div>
        <div className="inline-flex items-center gap-2 rounded-2xl border border-[#eadfce] bg-[#fbf8f3] px-3 py-2 text-xs font-semibold text-[#4d5664]">
          <Clock3 className="h-4 w-4 text-[#8a7654]" aria-hidden="true" />
          <span>{timing}</span>
        </div>
        <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
          <button type="button" onClick={() => onQuote(item)} className="rounded-full bg-[#122033] px-3 py-1.5 text-xs font-bold text-white">Quick Quote</button>
          <button type="button" onClick={() => setExpanded((current) => !current)} className="rounded-full border border-[#d7c5a8] bg-white px-3 py-1.5 text-xs font-bold text-[#122033]">
            {expanded ? "Hide" : "Expand"}
          </button>
        </div>
      </div>
      {expanded ? <ProductDetailPanel item={item} materialId={materialId} edgeMode={edgeMode} onQuote={onQuote} /> : null}
    </article>
  );
}
