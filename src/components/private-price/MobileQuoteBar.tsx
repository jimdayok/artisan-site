"use client";

import { calculatedPrice, money, type EdgeMode, type PriceItem } from "../../data/privatePriceList";

export default function MobileQuoteBar({ item, materialId, edgeMode }: { item?: PriceItem; materialId: string; edgeMode: EdgeMode }) {
  if (!item) return null;

  return (
    <div className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 rounded-2xl border border-[#d7c5a8] bg-[#122033] px-4 py-3 text-white shadow-[0_18px_50px_rgba(18,32,51,0.28)]">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{item.name}</p>
          <p className="text-xs text-white/65">{item.brand}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">{money(calculatedPrice(item, materialId, edgeMode))}</p>
          <button type="button" className="text-xs font-semibold text-[#d9c394]">View Quote</button>
        </div>
      </div>
    </div>
  );
}
