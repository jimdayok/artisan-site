"use client";

import type { PriceBrand, PriceCategory } from "../../data/privatePriceList";

export default function BrandFilter({
  brands,
  categories,
  activeBrand,
  activeCategory,
  recommendedOnly,
  outsourcedOnly,
  onBrand,
  onCategory,
  onRecommended,
  onOutsourced,
}: {
  brands: PriceBrand[];
  categories: PriceCategory[];
  activeBrand: string;
  activeCategory: string;
  recommendedOnly: boolean;
  outsourcedOnly: boolean;
  onBrand: (brand: string) => void;
  onCategory: (category: string) => void;
  onRecommended: (value: boolean) => void;
  onOutsourced: (value: boolean) => void;
}) {
  return (
    <div className="rounded-[26px] border border-[#dfd2bf] bg-white/86 p-4 shadow-[0_18px_48px_rgba(18,32,51,0.08)] lg:sticky lg:top-5">
      <div className="grid gap-4">
        <label className="grid gap-2 text-sm font-semibold text-[#122033]">
          Brand
          <select value={activeBrand} onChange={(event) => onBrand(event.target.value)} className="min-h-11 rounded-2xl border border-[#dfd2bf] bg-[#fbf8f3] px-4 text-sm font-medium outline-none focus:border-[#c7ad7b]">
            <option value="All">All brands</option>
            {brands.map((brand) => <option key={brand}>{brand}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-[#122033]">
          Category
          <select value={activeCategory} onChange={(event) => onCategory(event.target.value)} className="min-h-11 rounded-2xl border border-[#dfd2bf] bg-[#fbf8f3] px-4 text-sm font-medium outline-none focus:border-[#c7ad7b]">
            <option value="All">All categories</option>
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select>
        </label>
        <label className="flex items-center justify-between gap-3 rounded-2xl border border-[#dfd2bf] bg-[#fbf8f3] px-4 py-3 text-sm font-semibold text-[#122033]">
          Recommended
          <input type="checkbox" checked={recommendedOnly} onChange={(event) => onRecommended(event.target.checked)} />
        </label>
        <label className="flex items-center justify-between gap-3 rounded-2xl border border-[#dfd2bf] bg-[#fbf8f3] px-4 py-3 text-sm font-semibold text-[#122033]">
          Outsourced
          <input type="checkbox" checked={outsourcedOnly} onChange={(event) => onOutsourced(event.target.checked)} />
        </label>
      </div>
    </div>
  );
}
