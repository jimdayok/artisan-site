import type { PriceItem } from "../../data/privatePriceList";
import { adjustmentLabel, calculatedPrice, edgeAdjustment, materialAdjustmentForItem, money, professionalResourceHref, type EdgeMode } from "../../data/privatePriceList";
import PriceBadge from "./PriceBadge";

export default function PricingCard({
  item,
  compact = false,
  selectedMaterialId = "material-polycarb",
  edgeMode = "Edged",
}: {
  item: PriceItem;
  compact?: boolean;
  selectedMaterialId?: string;
  edgeMode?: EdgeMode;
}) {
  const materialAdjustment = materialAdjustmentForItem(item, selectedMaterialId);
  const cutAdjustment = edgeAdjustment(edgeMode);
  const finalPrice = calculatedPrice(item, selectedMaterialId, edgeMode);

  return (
    <article className="flex h-full flex-col rounded-[24px] border border-[#e1d4c2] bg-white/95 p-5 shadow-[0_16px_42px_rgba(18,32,51,0.07)] transition hover:-translate-y-1 hover:border-[#c7ad7b] hover:shadow-[0_24px_64px_rgba(18,32,51,0.11)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <PriceBadge type={item.type}>{item.type}</PriceBadge>
          {item.recommended ? <PriceBadge tone="recommended">★ Recommended</PriceBadge> : null}
          {item.outsourced ? <PriceBadge tone="outsourced">➜ Outsourced</PriceBadge> : null}
        </div>
        <div className="shrink-0 rounded-2xl bg-[#122033] px-3 py-2 text-sm font-bold text-white shadow-[0_10px_22px_rgba(18,32,51,0.15)]">
          {money(finalPrice)}
        </div>
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">
        {item.brand} / {item.category}
      </p>
      <h3 className={`${compact ? "text-lg" : "text-xl"} mt-2 font-semibold leading-tight text-[#122033]`}>
        {item.name}
      </h3>
      {item.code ? (
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#75664e]">
          Code {item.code}
        </p>
      ) : null}
      <div className="mt-5 grid gap-2 rounded-2xl border border-[#eadfce] bg-[#fbf8f3] p-3 text-xs text-[#4d5664]">
        <div className="flex justify-between gap-3"><span>Base poly price</span><strong className="text-[#122033]">{money(item.price)}</strong></div>
        <div className="flex justify-between gap-3"><span>Material adjustment</span><strong className="text-[#122033]">{adjustmentLabel(materialAdjustment)}</strong></div>
        <div className="flex justify-between gap-3"><span>{edgeMode}</span><strong className="text-[#122033]">{cutAdjustment === 0 ? "Included" : adjustmentLabel(cutAdjustment)}</strong></div>
      </div>
      <div className="mt-auto pt-4">
        {item.requires ? <p className="text-sm leading-6 text-[#4d5664]">Requires: {item.requires}</p> : null}
        {item.notes ? <p className="text-sm leading-6 text-[#625b53]">{item.notes}</p> : null}
        <a href={professionalResourceHref(item.brand)} className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full border border-[#d7c5a8] bg-white px-4 py-2 text-sm font-semibold text-[#122033] transition hover:bg-[#eadcc6]">
          Professional Resources
        </a>
      </div>
    </article>
  );
}
