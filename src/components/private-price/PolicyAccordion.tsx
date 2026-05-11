"use client";

import { useState } from "react";
import { AlertTriangle, BadgeCheck, ClipboardList, Clock3, PackageCheck, Plane, RefreshCcw, RotateCcw, ShieldCheck, Truck, Wrench, type LucideIcon } from "lucide-react";

export type PolicySection = {
  title: string;
  body: string[];
};

export default function PolicyAccordion({ sections }: { sections: PolicySection[] }) {
  const [open, setOpen] = useState(sections[0]?.title ?? "");

  return (
    <div className="grid gap-3">
      {sections.map((section) => {
        const active = open === section.title;
        const Icon = iconForPolicy(section.title);
        const featured = section.title === "Remakes";
        return (
          <section key={section.title} className={`rounded-3xl border bg-white/92 shadow-[0_14px_38px_rgba(18,32,51,0.06)] ${featured ? "border-[#d6bd84] ring-1 ring-[#f2dfad]" : "border-[#dfd2bf]"}`}>
            <button type="button" onClick={() => setOpen(active ? "" : section.title)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
              <span className="flex items-center gap-3 text-lg font-semibold text-[#122033]">
                <span className={`grid h-10 w-10 place-items-center rounded-2xl ${featured ? "bg-[#122033] text-[#f6df9f]" : "bg-[#fbf8f3] text-[#8a7654]"}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                {section.title}
              </span>
              <span className="rounded-full border border-[#dfd2bf] px-3 py-1 text-xs font-bold text-[#8a7654]">{active ? "Close" : "Open"}</span>
            </button>
            {active ? (
              <div className="border-t border-[#eadfce] px-5 py-4">
                {featured ? (
                  <div className="mb-4 grid gap-3 md:grid-cols-3">
                    {["Confirm Rx and measurements", "Document remake reason", "Review timing expectations"].map((label) => (
                      <div key={label} className="rounded-2xl border border-[#eadfce] bg-[#fbf8f3] p-3 text-sm font-semibold text-[#122033]">
                        {label}
                      </div>
                    ))}
                  </div>
                ) : null}
                <ul className="grid gap-3 text-sm leading-7 text-[#4d5664] md:grid-cols-2">
                  {section.body.map((line) => <li key={line} className="rounded-2xl border border-[#eadfce] bg-[#fbf8f3] px-3 py-2">{line}</li>)}
                </ul>
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

function iconForPolicy(title: string): LucideIcon {
  const normalized = title.toLowerCase();
  if (normalized.includes("multiple pair")) return PackageCheck;
  if (normalized.includes("cancellation")) return AlertTriangle;
  if (normalized.includes("non-adapt")) return RefreshCcw;
  if (normalized.includes("premium ar")) return ShieldCheck;
  if (normalized.includes("remake")) return RefreshCcw;
  if (normalized.includes("redo")) return RotateCcw;
  if (normalized.includes("warrant")) return ShieldCheck;
  if (normalized.includes("shipping")) return Truck;
  if (normalized.includes("ar")) return BadgeCheck;
  if (normalized.includes("material")) return AlertTriangle;
  if (normalized.includes("outsourced")) return Plane;
  if (normalized.includes("drill") || normalized.includes("finishing")) return Wrench;
  if (normalized.includes("turnaround")) return Clock3;
  return ClipboardList;
}
