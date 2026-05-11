"use client";

import { useMemo, useState } from "react";
import { itemMatchesARGroup } from "../../data/arCompatibility";
import {
  calculatedPrice,
  isLensItem,
  isPackageEligible,
  lensGroupForItem,
  lensItems,
  priceItems,
  searchableText,
  timeToMake,
  type LensGroup,
  type PriceBrand,
  type PriceItem,
} from "../../data/privatePriceList";
import type { FilterState } from "./PriceFilters";
import CompactEmptyState from "./CompactEmptyState";
import FilterRail from "./FilterRail";
import MobileQuoteBar from "./MobileQuoteBar";
import PrimaryCategoryNav from "./PrimaryCategoryNav";
import PricingPortalLayout from "./PricingPortalLayout";
import PricingResultsList from "./PricingResultsList";
import QuoteSummaryRail from "./QuoteSummaryRail";
import ResultsToolbar, { type PricingSort } from "./ResultsToolbar";

const initialFilters: FilterState = {
  query: "",
  brand: "All",
  lensGroup: "All",
  materialId: "material-polycarb",
  edgeMode: "Edged",
  priceView: "Wholesale",
  excludeOutsourced: false,
  packageOnly: false,
  coatingId: "All",
};

export default function PrivatePriceDashboard({ initialCoatingId }: { initialCoatingId?: string }) {
  const [filters, setFilters] = useState<FilterState>({ ...initialFilters, coatingId: initialCoatingId ?? initialFilters.coatingId });
  const [quoteItemId, setQuoteItemId] = useState("artisan-diamond-series");
  const [recentlyViewed, setRecentlyViewed] = useState<PriceItem[]>([]);
  const [sort, setSort] = useState<PricingSort>("Recommended");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const quoteItem = lensItems.find((entry) => entry.id === quoteItemId) ?? lensItems[0];
  const hasActiveFilters = Boolean(filters.query.trim()) || filters.brand !== "All" || filters.lensGroup !== "All" || filters.excludeOutsourced || filters.packageOnly || filters.coatingId !== "All";

  const updateFilters = (next: Partial<FilterState>) => setFilters((current) => ({ ...current, ...next }));
  const resetFilters = () => setFilters(initialFilters);
  const remember = (item: PriceItem) => setRecentlyViewed((current) => [item, ...current.filter((entry) => entry.id !== item.id)].slice(0, 5));
  const quote = (item: PriceItem) => {
    setQuoteItemId(item.id);
    remember(item);
  };

  const visibleItems = useMemo(() => {
    if (!hasActiveFilters) return [];
    const query = filters.query.trim().toLowerCase();
    const arSelected = filters.coatingId !== "All";
    const rows = priceItems.filter((item) => {
      if (!isLensItem(item) && filters.lensGroup !== "All") return false;
      if (filters.brand !== "All" && item.brand !== filters.brand) return false;
      if (filters.lensGroup !== "All" && lensGroupForItem(item) !== filters.lensGroup) return false;
      if (filters.excludeOutsourced && item.outsourced) return false;
      if (filters.packageOnly && !isPackageEligible(item)) return false;
      if (!itemMatchesARGroup(item, filters.coatingId)) return false;
      if (query && !searchableText(item).includes(query)) return false;
      return true;
    });
    return rows.sort((a, b) => {
      if (sort === "Recommended") return Number(b.recommended) - Number(a.recommended) || Number(isPackageEligible(b)) - Number(isPackageEligible(a)) || a.name.localeCompare(b.name);
      if (sort === "Price low to high") return calculatedPrice(a, filters.materialId, filters.edgeMode) - calculatedPrice(b, filters.materialId, filters.edgeMode);
      if (sort === "Price high to low") return calculatedPrice(b, filters.materialId, filters.edgeMode) - calculatedPrice(a, filters.materialId, filters.edgeMode);
      if (sort === "Brand A to Z") return a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name);
      if (sort === "Brand Z to A") return b.brand.localeCompare(a.brand) || a.name.localeCompare(b.name);
      return timeToMake(a, arSelected).localeCompare(timeToMake(b, arSelected)) || a.name.localeCompare(b.name);
    });
  }, [filters, hasActiveFilters, sort]);

  const exportFilters = { ...filters };
  const selectedIdList = Array.from(selectedIds);
  const toggleSelected = (item: PriceItem, selected: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (selected) next.add(item.id);
      else next.delete(item.id);
      return next;
    });
  };

  return (
    <PricingPortalLayout
      categoryNav={<PrimaryCategoryNav value={filters.lensGroup} onChange={(lensGroup) => updateFilters({ lensGroup })} />}
      filterRail={<FilterRail filters={filters} selectedLens={quoteItem} onChange={updateFilters} />}
      quoteRail={<QuoteSummaryRail item={quoteItem} materialId={filters.materialId} edgeMode={filters.edgeMode} priceView={filters.priceView} filters={exportFilters} selectedIds={selectedIdList} />}
      mobileQuoteBar={<MobileQuoteBar item={quoteItem} materialId={filters.materialId} edgeMode={filters.edgeMode} />}
    >
      <div className="sticky top-0 z-20 mb-3 rounded-3xl border border-[#dfd2bf] bg-[#f8f1e7]/95 p-3 shadow-[0_12px_34px_rgba(18,32,51,0.06)] backdrop-blur">
        <input
          value={filters.query}
          onChange={(event) => updateFilters({ query: event.target.value })}
          placeholder="Search product, brand, category, or treatment..."
          className="min-h-10 w-full rounded-full border border-[#dfd2bf] bg-white px-3 text-sm outline-none focus:border-[#c7ad7b]"
        />
        <details className="mt-2 min-[1700px]:hidden">
          <summary className="cursor-pointer rounded-full border border-[#d7c5a8] bg-white px-3 py-2 text-center text-xs font-bold text-[#122033]">Filters</summary>
          <div className="mt-2">
            <FilterRail filters={filters} selectedLens={quoteItem} onChange={updateFilters} />
          </div>
        </details>
      </div>

      {hasActiveFilters ? (
        <>
          <ResultsToolbar count={visibleItems.length} filters={exportFilters} sort={sort} onSort={setSort} selectedIds={selectedIdList} onClearSelected={() => setSelectedIds(new Set())} onClear={resetFilters} />
          <PricingResultsList
            items={visibleItems}
            materialId={filters.materialId}
            edgeMode={filters.edgeMode}
            priceView={filters.priceView}
            arSelected={filters.coatingId !== "All"}
            selectedIds={selectedIds}
            onToggleSelected={toggleSelected}
            onQuote={quote}
            onRemember={remember}
          />
        </>
      ) : (
        <CompactEmptyState
          recentlyViewed={recentlyViewed}
          onCategory={(lensGroup: LensGroup) => updateFilters({ lensGroup })}
          onBrand={(brand: PriceBrand) => updateFilters({ brand })}
          onRecent={(item) => updateFilters({ query: item.name })}
        />
      )}
    </PricingPortalLayout>
  );
}
