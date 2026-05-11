"use client";

import { lensGroupLabels, type LensGroup } from "../../data/privatePriceList";

export default function CategoryChips({ value, onChange }: { value: LensGroup | "All"; onChange: (value: LensGroup | "All") => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {(["All", ...lensGroupLabels] as const).map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(category)}
          className={`min-h-9 shrink-0 rounded-full border px-3 text-xs font-semibold transition ${
            value === category ? "border-[#122033] bg-[#122033] text-white" : "border-[#dfd2bf] bg-white text-[#122033] hover:bg-[#eadcc6]"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
