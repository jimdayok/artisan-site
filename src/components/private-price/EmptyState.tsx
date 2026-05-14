"use client";

import Link from "next/link";
import { brands, lensGroupLabels, type LensGroup, type PriceBrand, type PriceItem } from "../../data/privatePriceList";

export default function EmptyState({
  onCategory,
  onBrand,
  onMSRP,
  recentlyViewed,
  onRecent,
}: {
  onCategory: (value: LensGroup) => void;
  onBrand: (value: PriceBrand) => void;
  onMSRP: () => void;
  recentlyViewed: PriceItem[];
  onRecent: (item: PriceItem) => void;
}) {
  const brandTiles = brands.filter((brand) => ["Artisan", "IOT", "Tokai", "Unity", "Varilux", "Hoya", "Shamir"].includes(brand));

  return (
    <section className="rounded-3xl border border-[#dfd2bf] bg-[#fbf8f3]/95 p-5 shadow-[0_18px_48px_rgba(18,32,51,0.08)] md:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">Confidential Pricing Guide</p>
      <h2 className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight text-[#122033] md:text-4xl">Search by product, brand, category, or treatment to begin.</h2>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-[#eadfce] bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a7654]">Category tiles</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {lensGroupLabels.map((category) => (
              <button key={category} type="button" onClick={() => onCategory(category)} className="rounded-2xl border border-[#dfd2bf] bg-[#fbf8f3] px-3 py-3 text-left text-sm font-bold text-[#122033] transition hover:bg-[#eadcc6]">
                {category}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-[#eadfce] bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a7654]">Brand logo tiles</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {brandTiles.map((brand) => (
              <button key={brand} type="button" onClick={() => onBrand(brand)} className="rounded-2xl border border-[#dfd2bf] bg-[#fbf8f3] px-3 py-3 text-sm font-bold text-[#122033] transition hover:bg-[#eadcc6]">
                {brand}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/portal/price-list/packages" className="rounded-full bg-[#122033] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#c7ad7b] hover:text-[#122033]">Package pricing</Link>
        <Link href="/portal/price-list/policies" className="rounded-full border border-[#d7c5a8] bg-white px-4 py-2 text-sm font-bold text-[#122033] transition hover:bg-[#eadcc6]">Policies</Link>
        <button type="button" onClick={onMSRP} className="rounded-full border border-[#d7c5a8] bg-white px-4 py-2 text-sm font-bold text-[#122033] transition hover:bg-[#eadcc6]">MSRP toggle</button>
      </div>
      <div className="mt-5 rounded-2xl border border-[#eadfce] bg-white p-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a7654]">Recently viewed</p>
        {recentlyViewed.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {recentlyViewed.map((item) => (
              <button key={item.id} type="button" onClick={() => onRecent(item)} className="rounded-full border border-[#dfd2bf] bg-[#fbf8f3] px-3 py-2 text-xs font-bold text-[#122033]">
                {item.name}
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm leading-6 text-[#625b53]">Products viewed during this session will appear here.</p>
        )}
      </div>
    </section>
  );
}
