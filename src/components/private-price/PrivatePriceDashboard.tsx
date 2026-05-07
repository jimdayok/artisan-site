"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { brands, categories, lensItems, priceItems, type EdgeMode, type PriceItem } from "../../data/privatePriceList";
import BrandFilter from "./BrandFilter";
import MaterialAdder from "./MaterialAdder";
import PricingCard from "./PricingCard";

export default function PrivatePriceDashboard() {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("All");
  const [category, setCategory] = useState("All");
  const [recommendedOnly, setRecommendedOnly] = useState(false);
  const [outsourcedOnly, setOutsourcedOnly] = useState(false);
  const [materialId, setMaterialId] = useState("material-polycarb");
  const [edgeMode, setEdgeMode] = useState<EdgeMode>("Edged");
  const [selectedLensId, setSelectedLensId] = useState("artisan-diamond-series");
  const [recentlyViewed, setRecentlyViewed] = useState<PriceItem[]>([]);

  const selectedLens = lensItems.find((entry) => entry.id === selectedLensId);
  const hasActiveSearch = Boolean(query.trim()) || brand !== "All" || category !== "All" || recommendedOnly || outsourcedOnly;
  const visibleItems = useMemo(() => {
    if (!hasActiveSearch) return [];
    const normalized = query.trim().toLowerCase();
    return priceItems.filter((entry) => {
      if (brand !== "All" && entry.brand !== brand) return false;
      if (category !== "All" && entry.category !== category) return false;
      if (recommendedOnly && !entry.recommended) return false;
      if (outsourcedOnly && !entry.outsourced) return false;
      if (!normalized) return true;
      return [entry.name, entry.brand, entry.category, entry.type, entry.code, entry.notes].filter(Boolean).join(" ").toLowerCase().includes(normalized);
    });
  }, [brand, category, hasActiveSearch, outsourcedOnly, query, recommendedOnly]);

  const quickCategories = ["Standard Designs", "IOT Designs", "Artisan Coatings", "Photochromic Options", "Edging", "Shipping"];

  const remember = (entry: PriceItem) => {
    setRecentlyViewed((current) => [entry, ...current.filter((item) => item.id !== entry.id)].slice(0, 4));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
      <aside className="grid gap-5">
        <BrandFilter
          brands={brands}
          categories={categories}
          activeBrand={brand}
          activeCategory={category}
          recommendedOnly={recommendedOnly}
          outsourcedOnly={outsourcedOnly}
          onBrand={setBrand}
          onCategory={setCategory}
          onRecommended={setRecommendedOnly}
          onOutsourced={setOutsourcedOnly}
        />
        <MaterialAdder selectedLens={selectedLens} selectedMaterialId={materialId} edgeMode={edgeMode} onMaterial={setMaterialId} onEdgeMode={setEdgeMode} />
      </aside>
      <section>
        <div className="rounded-[26px] border border-[#dfd2bf] bg-white/86 p-4 shadow-[0_18px_48px_rgba(18,32,51,0.08)]">
          <label className="grid gap-2 text-sm font-semibold text-[#122033]">
            Search the price list
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search lens designs, coatings, materials, shipping..." className="min-h-12 rounded-2xl border border-[#dfd2bf] bg-[#fbf8f3] px-4 text-base outline-none focus:border-[#c7ad7b]" />
          </label>
          <label className="mt-4 grid gap-2 text-sm font-semibold text-[#122033]">
            Calculator lens design
            <select value={selectedLensId} onChange={(event) => setSelectedLensId(event.target.value)} className="min-h-12 rounded-2xl border border-[#dfd2bf] bg-[#fbf8f3] px-4 text-sm outline-none focus:border-[#c7ad7b]">
              {lensItems.map((entry) => <option key={entry.id} value={entry.id}>{entry.name} - ${entry.price}</option>)}
            </select>
          </label>
        </div>
        {hasActiveSearch ? (
          <>
            <div className="mt-5 flex items-center justify-between gap-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a7654]">{visibleItems.length} matching items</p>
              <button type="button" onClick={() => { setQuery(""); setBrand("All"); setCategory("All"); setRecommendedOnly(false); setOutsourcedOnly(false); }} className="rounded-full border border-[#dfd2bf] bg-white px-4 py-2 text-sm font-semibold text-[#122033]">Clear</button>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleItems.map((entry: PriceItem) => (
                <div key={entry.id} onMouseEnter={() => remember(entry)} onFocus={() => remember(entry)} className="h-full">
                  <PricingCard item={entry} selectedMaterialId={materialId} edgeMode={edgeMode} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-[30px] border border-[#dfd2bf] bg-[#fbf8f3]/90 p-6 shadow-[0_20px_58px_rgba(18,32,51,0.08)] md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">Private price guide</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#122033]">Search by product, brand, category, or treatment to begin.</h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[#4d5664]">
              Choose a quick category, jump to packages, or search directly. Results appear only after you ask for them, keeping the workspace calm.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {quickCategories.map((quick) => (
                <button key={quick} type="button" onClick={() => setCategory(quick)} className="rounded-full border border-[#d7c5a8] bg-white px-4 py-2 text-sm font-semibold text-[#122033] transition hover:bg-[#eadcc6]">
                  {quick}
                </button>
              ))}
              <Link href="/private/price-list/packages" className="rounded-full bg-[#122033] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c7ad7b] hover:text-[#122033]">
                Packages
              </Link>
            </div>
            <div className="mt-8 rounded-2xl border border-[#dfd2bf] bg-white p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a7654]">Recently viewed</p>
              {recentlyViewed.length ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {recentlyViewed.map((entry) => (
                    <button key={entry.id} type="button" onClick={() => setQuery(entry.name)} className="rounded-2xl border border-[#eadfce] bg-[#fbf8f3] px-4 py-3 text-left text-sm font-semibold text-[#122033]">
                      {entry.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm leading-7 text-[#625b53]">Products you open during this session will appear here.</p>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
