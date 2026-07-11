"use client";

import type { EdgeMode } from "../../data/privatePriceList";
import { artisanSegmentClass, artisanSegmentGroupClass } from "../../../app/components/controlStyles";

export default function EdgedUncutToggle({ value, onChange }: { value: EdgeMode; onChange: (value: EdgeMode) => void }) {
  return (
    <div className="grid gap-2">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7654]">Edged / Uncut</p>
      <div className={`${artisanSegmentGroupClass} grid grid-cols-2`}>
        {(["Edged", "Uncut"] as EdgeMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={artisanSegmentClass(value === mode)}
          >
            {mode}
            <span className="ml-1 text-xs opacity-70">{mode === "Edged" ? "Included" : "-$8"}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
