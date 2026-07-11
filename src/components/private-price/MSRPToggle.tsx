"use client";

import type { PriceView } from "../../data/privatePriceList";
import { artisanSegmentClass, artisanSegmentGroupClass } from "../../../app/components/controlStyles";

export default function MSRPToggle({ value, onChange }: { value: PriceView; onChange: (value: PriceView) => void }) {
  return (
    <div className="grid gap-2">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7654]">Pricing View</p>
      <div className={`${artisanSegmentGroupClass} grid grid-cols-3`}>
        {(["Wholesale", "MSRP", "Both"] as PriceView[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={artisanSegmentClass(value === mode, "text-xs")}
          >
            {mode}
          </button>
        ))}
      </div>
      <p className="text-xs leading-5 text-[#625b53]">MSRP is guidance only and should be reviewed by each practice.</p>
    </div>
  );
}
