"use client";

import { useEffect, useRef } from "react";
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
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    navRef.current?.querySelector<HTMLElement>("[aria-current='true']")?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [value]);

  return (
    <nav ref={navRef} className="mobile-scroll-row flex gap-2 overflow-x-auto rounded-full border border-[#dfd2bf] bg-white/72 p-1 shadow-[0_10px_30px_rgba(18,32,51,0.05)]">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-current={value === option.value ? "true" : undefined}
          onClick={() => onChange(option.value)}
          className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold transition ${
            value === option.value ? "bg-[#122033] text-white shadow-sm" : "text-[#122033] hover:bg-[#f4ead9]"
          }`}
        >
          {option.label}
        </button>
      ))}
    </nav>
  );
}
