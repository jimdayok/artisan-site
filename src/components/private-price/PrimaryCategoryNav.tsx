"use client";

import type { LensGroup } from "../../data/privatePriceList";

const options: Array<{ label: string; value: LensGroup | "All" }> = [
  { label: "All", value: "All" },
  { label: "Single Vision", value: "Single Vision" },
  { label: "Multifocal", value: "Multifocal Lenses" },
  { label: "Digital SV", value: "Digital SV & Anti-Fatigue Lenses" },
  { label: "Occupational", value: "Occupational Lenses" },
  { label: "Progressive", value: "Progressive Lenses" },
];

export default function PrimaryCategoryNav({ value, onChange }: { value: LensGroup | "All"; onChange: (value: LensGroup | "All") => void }) {
  return (
    <nav className="flex gap-2 overflow-x-auto rounded-full border border-[#dfd2bf] bg-white/72 p-1 shadow-[0_10px_30px_rgba(18,32,51,0.05)]">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition ${
            value === option.value ? "bg-[#122033] text-white shadow-sm" : "text-[#122033] hover:bg-[#f4ead9]"
          }`}
        >
          {option.label}
        </button>
      ))}
    </nav>
  );
}
