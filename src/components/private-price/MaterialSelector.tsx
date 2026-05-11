"use client";

import { adjustmentLabel, materialAdders, materialAdjustmentForItem, type PriceItem } from "../../data/privatePriceList";

export default function MaterialSelector({
  selectedLens,
  value,
  onChange,
  compact = false,
}: {
  selectedLens?: PriceItem;
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7654]">Material</p>
        <span className="text-xs text-[#625b53]">Poly base</span>
      </div>
      <div className={`grid gap-2 ${compact ? "grid-cols-2" : "sm:grid-cols-2"}`}>
        {materialAdders.map((material) => {
          const adjustment = materialAdjustmentForItem(selectedLens, material.id);
          return (
            <button
              key={material.id}
              type="button"
              onClick={() => onChange(material.id)}
              className={`rounded-2xl border px-3 py-2 text-left transition ${
                value === material.id ? "border-[#122033] bg-[#122033] text-white" : "border-[#dfd2bf] bg-white text-[#122033] hover:bg-[#fbf2e3]"
              }`}
            >
              <span className="block text-xs font-bold">{material.name}</span>
              <span className={`block text-[11px] ${value === material.id ? "text-white/75" : "text-[#625b53]"}`}>{adjustmentLabel(adjustment)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
