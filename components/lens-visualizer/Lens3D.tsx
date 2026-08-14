"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { MaterialComparisonResult } from "@/lib/optical/geometry";

const Lens3DScene = dynamic(() => import("./Lens3DScene"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-sm font-semibold text-white/70">Loading interactive 3D geometry…</div>,
});

const VIEWS: Record<string, [number, number, number]> = {
  Front: [0, 0, 0],
  "45°": [-0.22, 0.7, 0],
  Side: [0, Math.PI / 2, 0],
  Top: [Math.PI / 2, 0, 0],
};

const MATERIAL_COLORS: Record<string, string> = {
  Plastic: "#78958f",
  Poly: "#648ba1",
  "1.60": "#9a7e5b",
  "1.67": "#43d6a7",
  "1.74": "#f1ad55",
  "1.76": "#26bfff",
};

function materialLabel(name: string) {
  if (name === "1.76") return "Tokai 1.76";
  if (name === "Plastic") return "Standard plastic · 1.50";
  if (name === "Poly") return "Polycarbonate · 1.59";
  if (name.match(/^1\.(60|67|74)$/)) return `Hi-Index ${name}`;
  return name;
}

export default function Lens3D({ comparisons, enhancement = 1, onInteract }: { comparisons: MaterialComparisonResult[]; enhancement?: number; onInteract?: () => void }) {
  const [rotation, setRotation] = useState<[number, number, number]>(VIEWS["45°"]);
  const [zoom, setZoom] = useState(1);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [showFrame, setShowFrame] = useState(true);
  const [showProductColors, setShowProductColors] = useState(true);

  return (
    <div style={{ background: "radial-gradient(circle at 50% 38%, #17323b 0%, #0b1820 46%, #071017 100%)", color: "white" }} className="overflow-hidden rounded-2xl border border-white/10 text-white shadow-[0_24px_70px_rgba(0,0,0,0.25)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-3">
        <div className="flex flex-wrap gap-2">
          {Object.entries(VIEWS).map(([label, view]) => (
            <button key={label} type="button" onClick={() => setRotation(view)} className="min-h-10 rounded-lg border border-white/15 bg-white/[0.07] px-3 text-xs font-semibold hover:bg-white/[0.13] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4c09a]">
              {label}
            </button>
          ))}
          <button type="button" onClick={() => { setRotation(VIEWS["45°"]); setZoom(1); }} className="min-h-10 rounded-lg border border-[#d4c09a]/45 bg-[#d4c09a]/12 px-3 text-xs font-semibold text-[#e8d8b9]">
            Reset View
          </button>
          <button type="button" aria-pressed={showFrame} onClick={() => setShowFrame((value) => !value)} className={`min-h-10 rounded-lg border px-3 text-xs font-semibold ${showFrame ? "border-[#d4c09a] bg-[#d4c09a] text-[#172a28]" : "border-white/15 bg-white/[0.07] text-white"}`}>
            {showFrame ? "Hide metal frame" : "Show metal frame"}
          </button>
          <button type="button" aria-pressed={showProductColors} onClick={() => setShowProductColors((value) => !value)} className={`min-h-10 rounded-lg border px-3 text-xs font-semibold ${showProductColors ? "border-[#8ee9d4] bg-[#163e3b] text-[#bdf7e9]" : "border-white/15 bg-white/[0.07] text-white"}`}>
            {showProductColors ? "Hide lens colors" : "Show lens colors"}
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
          <button type="button" aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(0.6, value - 0.1))} className="h-10 w-10 rounded-lg border border-white/15">−</button>
          Shared zoom
          <button type="button" aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(1.5, value + 0.1))} className="h-10 w-10 rounded-lg border border-white/15">+</button>
        </div>
      </div>
      <div
        className="touch-none cursor-grab"
        style={{ height: "clamp(360px, 42vw, 480px)" }}
        aria-label="Interactive 3D eyeglass frame comparison. The left and right lenses show the selected materials. Drag to rotate the complete frame."
        onPointerDown={(event) => { setDrag({ x: event.clientX, y: event.clientY }); event.currentTarget.setPointerCapture(event.pointerId); onInteract?.(); }}
        onPointerMove={(event) => {
          if (!drag) return;
          const dx = event.clientX - drag.x;
          const dy = event.clientY - drag.y;
          setRotation(([x, y, z]) => [x + dy * 0.008, y + dx * 0.008, z]);
          setDrag({ x: event.clientX, y: event.clientY });
        }}
        onPointerUp={() => setDrag(null)}
        onPointerCancel={() => setDrag(null)}
      >
        <Lens3DScene comparisons={comparisons} rotation={rotation} zoom={zoom} enhancement={enhancement} showFrame={showFrame} showProductColors={showProductColors} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3 text-xs text-white/65">
        <div className="flex flex-wrap gap-3">
          {comparisons.map((comparison, index) => (
            <span key={comparison.material.name} className="inline-flex items-center gap-1.5 font-semibold text-white/80">
              <span className="h-2.5 w-2.5 rounded-full border border-white/35" style={{ backgroundColor: showProductColors ? MATERIAL_COLORS[comparison.material.name] ?? ["#43d6a7", "#f1ad55"][index % 2] : "#dceceb" }} />
              {comparisons.length === 1 ? "Both lenses" : index === 0 ? "Left lens" : "Right lens"}: {materialLabel(comparison.material.name)}
            </span>
          ))}
        </div>
        <span>Left / right material comparison · optical glass body · {enhancement === 1 ? "actual thickness" : `${enhancement}× enhanced thickness`}</span>
      </div>
    </div>
  );
}
