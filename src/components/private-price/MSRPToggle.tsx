"use client";

import type { PriceView } from "../../data/privatePriceList";

export default function MSRPToggle({ value, onChange }: { value: PriceView; onChange: (value: PriceView) => void }) {
  return (
    <div className="grid gap-2">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7654]">Pricing View</p>
      <div className="grid grid-cols-3 rounded-2xl border border-[#dfd2bf] bg-white p-1">
        {(["Wholesale", "MSRP", "Both"] as PriceView[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={`min-h-10 rounded-xl text-xs font-bold transition ${value === mode ? "bg-[#122033] text-white" : "text-[#122033] hover:bg-[#fbf2e3]"}`}
          >
            {mode}
          </button>
        ))}
      </div>
      <p className="text-xs leading-5 text-[#625b53]">MSRP is guidance only and should be reviewed by each practice.</p>
    </div>
  );
}
