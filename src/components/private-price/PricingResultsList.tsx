"use client";

import type { EdgeMode, PriceItem, PriceView } from "../../data/privatePriceList";
import PricingResultRow from "./PricingResultRow";

export default function PricingResultsList({
  items,
  materialId,
  edgeMode,
  priceView,
  arSelected,
  selectedIds,
  onToggleSelected,
  onQuote,
  onRemember,
}: {
  items: PriceItem[];
  materialId: string;
  edgeMode: EdgeMode;
  priceView: PriceView;
  arSelected: boolean;
  selectedIds: Set<string>;
  onToggleSelected: (item: PriceItem, selected: boolean) => void;
  onQuote: (item: PriceItem) => void;
  onRemember: (item: PriceItem) => void;
}) {
  return (
    <div className="mt-3 grid gap-2.5">
      {items.map((item) => (
        <div key={item.id} onMouseEnter={() => onRemember(item)} onFocus={() => onRemember(item)}>
          <PricingResultRow
            item={item}
            materialId={materialId}
            edgeMode={edgeMode}
            priceView={priceView}
            arSelected={arSelected}
            selected={selectedIds.has(item.id)}
            onToggleSelected={(selected) => onToggleSelected(item, selected)}
            onQuote={onQuote}
          />
        </div>
      ))}
    </div>
  );
}
