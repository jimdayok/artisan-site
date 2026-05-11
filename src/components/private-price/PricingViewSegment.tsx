"use client";

import type { PriceView } from "../../data/privatePriceList";

export default function PricingViewSegment({ value, onChange }: { value: PriceView; onChange: (value: PriceView) => void }) {
  return (
    <div className="grid grid-cols-3 rounded-full border border-[#dfd2bf] bg-[#fbf8f3] p-1">
      {(["Wholesale", "MSRP", "Both"] as PriceView[]).map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          className={`min-h-9 rounded-full text-xs font-bold transition ${value === mode ? "bg-[#122033] text-white" : "text-[#122033] hover:bg-white"}`}
        >
          {mode}
        </button>
      ))}
    </div>
  );
}
