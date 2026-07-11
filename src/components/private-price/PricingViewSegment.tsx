"use client";

import type { PriceView } from "../../data/privatePriceList";
import { artisanSegmentClass, artisanSegmentGroupClass } from "../../../app/components/controlStyles";

export default function PricingViewSegment({ value, onChange }: { value: PriceView; onChange: (value: PriceView) => void }) {
  return (
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
  );
}
