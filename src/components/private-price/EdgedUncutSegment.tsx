"use client";

import type { EdgeMode } from "../../data/privatePriceList";

export default function EdgedUncutSegment({ value, onChange }: { value: EdgeMode; onChange: (value: EdgeMode) => void }) {
  return (
    <div className="grid grid-cols-2 rounded-full border border-[#dfd2bf] bg-[#fbf8f3] p-1">
      {(["Edged", "Uncut"] as EdgeMode[]).map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          className={`min-h-9 rounded-full text-xs font-bold transition ${value === mode ? "bg-[#122033] text-white" : "text-[#122033] hover:bg-white"}`}
        >
          {mode}{mode === "Uncut" ? " -$8" : ""}
        </button>
      ))}
    </div>
  );
}
