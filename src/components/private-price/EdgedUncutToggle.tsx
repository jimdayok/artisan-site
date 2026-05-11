"use client";

import type { EdgeMode } from "../../data/privatePriceList";

export default function EdgedUncutToggle({ value, onChange }: { value: EdgeMode; onChange: (value: EdgeMode) => void }) {
  return (
    <div className="grid gap-2">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7654]">Edged / Uncut</p>
      <div className="grid grid-cols-2 rounded-2xl border border-[#dfd2bf] bg-white p-1">
        {(["Edged", "Uncut"] as EdgeMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={`min-h-10 rounded-xl text-sm font-semibold transition ${value === mode ? "bg-[#122033] text-white" : "text-[#122033] hover:bg-[#fbf2e3]"}`}
          >
            {mode}
            <span className="ml-1 text-xs opacity-70">{mode === "Edged" ? "Included" : "-$8"}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
