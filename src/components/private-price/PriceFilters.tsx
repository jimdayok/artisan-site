"use client";

import { coatingItems, type LensGroup, type PriceBrand, type PriceView } from "../../data/privatePriceList";
import BrandChips from "./BrandChips";
import CategoryChips from "./CategoryChips";
import EdgedUncutToggle from "./EdgedUncutToggle";
import MaterialSelector from "./MaterialSelector";
import MSRPToggle from "./MSRPToggle";
import type { EdgeMode, PriceItem } from "../../data/privatePriceList";

export type FilterState = {
  query: string;
  brand: PriceBrand | "All";
  lensGroup: LensGroup | "All";
  materialId: string;
  edgeMode: EdgeMode;
  priceView: PriceView;
  excludeOutsourced: boolean;
  packageOnly: boolean;
  coatingId: string;
};

export default function PriceFilters({
  filters,
  selectedLens,
  onChange,
}: {
  filters: FilterState;
  selectedLens?: PriceItem;
  onChange: (next: Partial<FilterState>) => void;
}) {
  return (
    <aside className="grid gap-4 lg:sticky lg:top-5">
      <div className="rounded-3xl border border-[#dfd2bf] bg-white/92 p-4 shadow-[0_14px_38px_rgba(18,32,51,0.07)]">
        <label className="grid gap-2 text-sm font-bold text-[#122033]">
          Search
          <input
            value={filters.query}
            onChange={(event) => onChange({ query: event.target.value })}
            placeholder="Product, brand, category, treatment..."
            className="min-h-11 rounded-2xl border border-[#dfd2bf] bg-[#fbf8f3] px-3 text-sm outline-none focus:border-[#c7ad7b]"
          />
        </label>
      </div>
      <div className="rounded-3xl border border-[#dfd2bf] bg-white/92 p-4 shadow-[0_14px_38px_rgba(18,32,51,0.07)]">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7654]">Lens category</p>
        <CategoryChips value={filters.lensGroup} onChange={(lensGroup) => onChange({ lensGroup })} />
        <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7654]">Brand</p>
        <BrandChips value={filters.brand} onChange={(brand) => onChange({ brand })} />
      </div>
      <div className="rounded-3xl border border-[#dfd2bf] bg-white/92 p-4 shadow-[0_14px_38px_rgba(18,32,51,0.07)]">
        <MaterialSelector selectedLens={selectedLens} value={filters.materialId} onChange={(materialId) => onChange({ materialId })} compact />
        <div className="mt-4">
          <EdgedUncutToggle value={filters.edgeMode} onChange={(edgeMode) => onChange({ edgeMode })} />
        </div>
      </div>
      <div className="rounded-3xl border border-[#dfd2bf] bg-white/92 p-4 shadow-[0_14px_38px_rgba(18,32,51,0.07)]">
        <MSRPToggle value={filters.priceView} onChange={(priceView) => onChange({ priceView })} />
        <label className="mt-4 grid gap-2 text-sm font-bold text-[#122033]">
          AR compatibility
          <select value={filters.coatingId} onChange={(event) => onChange({ coatingId: event.target.value })} className="min-h-11 rounded-2xl border border-[#dfd2bf] bg-[#fbf8f3] px-3 text-sm outline-none focus:border-[#c7ad7b]">
            <option value="All">All compatible AR</option>
            {coatingItems.map((coating) => (
              <option key={coating.id} value={coating.id}>{coating.name}</option>
            ))}
          </select>
        </label>
        <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#122033]">
          <input type="checkbox" checked={filters.excludeOutsourced} onChange={(event) => onChange({ excludeOutsourced: event.target.checked })} />
          Exclude Outsourced Products
        </label>
        <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#122033]">
          <input type="checkbox" checked={filters.packageOnly} onChange={(event) => onChange({ packageOnly: event.target.checked })} />
          Show Package Available
        </label>
      </div>
    </aside>
  );
}
