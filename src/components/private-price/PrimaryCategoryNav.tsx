"use client";

import { useEffect, useRef } from "react";
import type { LensGroup } from "../../data/privatePriceList";
import { artisanSegmentClass, artisanSegmentGroupClass } from "../../../app/components/controlStyles";

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
    <nav ref={navRef} className={`mobile-scroll-row flex ${artisanSegmentGroupClass}`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-current={value === option.value ? "true" : undefined}
          onClick={() => onChange(option.value)}
          className={artisanSegmentClass(value === option.value)}
        >
          {option.label}
        </button>
      ))}
    </nav>
  );
}
