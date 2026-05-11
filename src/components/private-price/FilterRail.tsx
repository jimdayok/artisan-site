"use client";

import type { FilterState } from "./PriceFilters";
import type { PriceItem } from "../../data/privatePriceList";
import type { ARGroupFilter } from "../../data/arCompatibility";
import BrandChips from "./BrandChips";
import MaterialChips from "./MaterialChips";
import EdgedUncutSegment from "./EdgedUncutSegment";
import PricingViewSegment from "./PricingViewSegment";
import ARGroupChips from "./ARGroupChips";

export default function FilterRail({
  filters,
  selectedLens,
  onChange,
}: {
  filters: FilterState;
  selectedLens?: PriceItem;
  onChange: (next: Partial<FilterState>) => void;
}) {
  return (
    <aside className="sticky top-5 max-h-[calc(100vh-2.5rem)] overflow-y-auto overflow-x-hidden rounded-3xl border border-[#dfd2bf] bg-white/84 shadow-[0_16px_42px_rgba(18,32,51,0.07)] backdrop-blur">
      <div className="border-b border-[#eadfce] p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8a7654]">Filters</p>
        <label className="mt-3 block">
          <span className="sr-only">Search</span>
          <input
            value={filters.query}
            onChange={(event) => onChange({ query: event.target.value })}
            placeholder="Search product, brand, category, or treatment..."
            className="min-h-10 w-full rounded-full border border-[#dfd2bf] bg-[#fbf8f3] px-3 text-sm outline-none focus:border-[#c7ad7b]"
          />
        </label>
      </div>
      <div className="grid gap-4 p-4">
        <Section title="Brand">
          <BrandChips value={filters.brand} onChange={(brand) => onChange({ brand })} />
        </Section>
        <Section title="Material">
          <MaterialChips selectedLens={selectedLens} value={filters.materialId} onChange={(materialId) => onChange({ materialId })} />
        </Section>
        <Section title="Edged / Uncut">
          <EdgedUncutSegment value={filters.edgeMode} onChange={(edgeMode) => onChange({ edgeMode })} />
        </Section>
        <Section title="Pricing View">
          <PricingViewSegment value={filters.priceView} onChange={(priceView) => onChange({ priceView })} />
        </Section>
        <Section title="Compatible AR">
          <ARGroupChips value={filters.coatingId} onChange={(coatingId: ARGroupFilter) => onChange({ coatingId })} />
        </Section>
        <Section title="Advanced Options">
          <label className="flex items-center gap-2 text-xs font-semibold text-[#122033]">
            <input type="checkbox" checked={filters.excludeOutsourced} onChange={(event) => onChange({ excludeOutsourced: event.target.checked })} />
            Exclude Outsourced Products
          </label>
          <label className="mt-2 flex items-center gap-2 text-xs font-semibold text-[#122033]">
            <input type="checkbox" checked={filters.packageOnly} onChange={(event) => onChange({ packageOnly: event.target.checked })} />
            Show Package Available
          </label>
        </Section>
      </div>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-[#eadfce] pb-4 last:border-b-0 last:pb-0">
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8a7654]">{title}</h3>
      {children}
    </section>
  );
}
