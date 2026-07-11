"use client";

import type { EdgeMode } from "../../data/privatePriceList";
import { artisanSegmentClass, artisanSegmentGroupClass } from "../../../app/components/controlStyles";

export default function EdgedUncutSegment({ value, onChange }: { value: EdgeMode; onChange: (value: EdgeMode) => void }) {
  return (
    <div className={`${artisanSegmentGroupClass} grid grid-cols-2`}>
      {(["Edged", "Uncut"] as EdgeMode[]).map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          className={artisanSegmentClass(value === mode, "text-xs")}
        >
          {mode}{mode === "Uncut" ? " -$8" : ""}
        </button>
      ))}
    </div>
  );
}
