"use client";

import Link from "next/link";
import { lensGroupLabels, type LensGroup, type PriceBrand, type PriceItem } from "../../data/privatePriceList";
import BrandChips from "./BrandChips";

export default function CompactEmptyState({
  onCategory,
  onBrand,
  recentlyViewed,
  onRecent,
}: {
  onCategory: (value: LensGroup) => void;
  onBrand: (value: PriceBrand) => void;
  recentlyViewed: PriceItem[];
  onRecent: (item: PriceItem) => void;
}) {
  return (
    <section className="rounded-3xl border border-[#dfd2bf] bg-white/78 p-5 shadow-[0_14px_38px_rgba(18,32,51,0.06)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8a7654]">Confidential Pricing Guide</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#122033]">Start with a product, brand, or lens category.</h2>
      <p className="mt-2 text-sm leading-6 text-[#625b53]">Pricing appears after you search or choose a filter.</p>
      <div className="mt-4">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8a7654]">Categories</p>
        <div className="flex flex-wrap gap-1.5">
          {lensGroupLabels.map((category) => (
            <button key={category} type="button" onClick={() => onCategory(category)} className="rounded-full border border-[#dfd2bf] bg-[#fbf8f3] px-3 py-1.5 text-xs font-bold text-[#122033] hover:bg-[#f4ead9]">
              {category.replace(" Lenses", "").replace(" & Anti-Fatigue", "")}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8a7654]">Brands</p>
        <BrandChips value="All" onChange={(brand) => brand !== "All" && onBrand(brand)} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/private/price-list/packages" className="rounded-full bg-[#122033] px-3 py-1.5 text-xs font-bold text-white">Packages</Link>
        <Link href="/private/price-list/policies" className="rounded-full border border-[#d7c5a8] bg-white px-3 py-1.5 text-xs font-bold text-[#122033]">Policies</Link>
      </div>
      {recentlyViewed.length ? (
        <div className="mt-4 border-t border-[#eadfce] pt-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8a7654]">Recently viewed</p>
          <div className="flex flex-wrap gap-1.5">
            {recentlyViewed.map((item) => (
              <button key={item.id} type="button" onClick={() => onRecent(item)} className="rounded-full border border-[#dfd2bf] px-3 py-1.5 text-xs font-bold text-[#122033]">
                {item.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
