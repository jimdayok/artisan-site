"use client";

import { materialAdders, materialAdjustmentForItem, type PriceItem } from "../../data/privatePriceList";

const labels: Record<string, string> = {
  "material-plastic": "Plastic",
  "material-polycarb": "Poly",
  "material-trivex": "Trivex",
  "material-hi-160": "1.60",
  "material-hi-167": "1.67",
  "material-hi-170": "1.70",
  "material-hi-174": "1.74",
  "material-hi-176": "1.76",
};

function shortAdjustment(value: number) {
  if (value === 0) return "Included";
  return value < 0 ? `-$${Math.abs(value)}` : `+$${value}`;
}

export default function MaterialChips({ selectedLens, value, onChange }: { selectedLens?: PriceItem; value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {materialAdders.map((material) => {
        const adjustment = materialAdjustmentForItem(selectedLens, material.id);
        return (
          <button
            key={material.id}
            type="button"
            onClick={() => onChange(material.id)}
            className={`rounded-full border px-2.5 py-1.5 text-[11px] font-bold transition ${
              value === material.id ? "border-[#122033] bg-[#122033] text-white" : "border-[#dfd2bf] bg-white text-[#122033] hover:bg-[#f4ead9]"
            }`}
          >
            {labels[material.id] ?? material.name} <span className="opacity-70">{shortAdjustment(adjustment)}</span>
          </button>
        );
      })}
    </div>
  );
}
