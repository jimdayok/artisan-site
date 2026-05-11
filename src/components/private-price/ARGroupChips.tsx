"use client";

import type { ARGroupFilter } from "../../data/arCompatibility";

const groups: ARGroupFilter[] = ["All", "Artisan", "TechShield", "Crizal", "Hoya AR", "Tokai AR", "Shamir AR"];

export default function ARGroupChips({ value, onChange }: { value: string; onChange: (value: ARGroupFilter) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {groups.map((group) => (
        <button
          key={group}
          type="button"
          onClick={() => onChange(group)}
          className={`rounded-full border px-2.5 py-1.5 text-[11px] font-bold transition ${
            value === group ? "border-[#122033] bg-[#122033] text-white" : "border-[#dfd2bf] bg-white text-[#122033] hover:bg-[#f4ead9]"
          }`}
        >
          {group === "All" ? "All AR" : group}
        </button>
      ))}
    </div>
  );
}
