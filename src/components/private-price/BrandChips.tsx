"use client";

import { brands, type PriceBrand } from "../../data/privatePriceList";

const visibleBrands = brands.filter((brand) => !["Lab Services", "Artisan Coatings", "Tokai AR", "Hoya AR", "Shamir AR", "TechShield", "Crizal", "ChemClip"].includes(brand));

export default function BrandChips({ value, onChange }: { value: PriceBrand | "All"; onChange: (value: PriceBrand | "All") => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {(["All", ...visibleBrands] as const).map((brand) => (
        <button
          key={brand}
          type="button"
          onClick={() => onChange(brand)}
          className={`min-h-8 shrink-0 rounded-full border px-2.5 text-[11px] font-bold transition ${
            value === brand ? "border-[#122033] bg-[#122033] text-white" : "border-[#dfd2bf] bg-white text-[#122033] hover:bg-[#eadcc6]"
          }`}
        >
          {brand === "Sequel by Newton" ? "Sequel" : brand}
        </button>
      ))}
    </div>
  );
}
