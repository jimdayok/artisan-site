"use client";

import type { MaterialAdder as MaterialAdderType, PriceItem } from "../../data/privatePriceList";
import { adjustmentLabel, edgeAdjustment, materialAdders, materialAdjustmentForItem, money, type EdgeMode } from "../../data/privatePriceList";

export default function MaterialAdder({
  selectedLens,
  selectedMaterialId,
  edgeMode,
  onMaterial,
  onEdgeMode,
}: {
  selectedLens?: PriceItem;
  selectedMaterialId: string;
  edgeMode: EdgeMode;
  onMaterial: (materialId: string) => void;
  onEdgeMode: (edgeMode: EdgeMode) => void;
}) {
  const selectedMaterial = materialAdders.find((material) => material.id === selectedMaterialId) ?? materialAdders[1];
  const materialAdjustment = materialAdjustmentForItem(selectedLens, selectedMaterial.id);
  const uncutAdjustment = edgeAdjustment(edgeMode);
  const total = (selectedLens?.price ?? 0) + materialAdjustment + uncutAdjustment;

  return (
    <section className="rounded-[28px] border border-[#dfd2bf] bg-[#122033] p-5 text-white shadow-[0_24px_70px_rgba(18,32,51,0.18)]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d9c394]">Material Calculator</p>
      <h2 className="mt-3 text-2xl font-semibold">Polycarbonate base pricing</h2>
      <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-white/15 bg-white/8 p-1">
        {(["Edged", "Uncut"] as EdgeMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onEdgeMode(mode)}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${edgeMode === mode ? "bg-white text-[#122033]" : "text-white/78 hover:bg-white/10"}`}
          >
            {mode}
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-3">
        {materialAdders.map((material: MaterialAdderType) => (
          <button
            key={material.id}
            type="button"
            onClick={() => onMaterial(material.id)}
            className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
              selectedMaterialId === material.id ? "border-[#d9c394] bg-white text-[#122033]" : "border-white/15 bg-white/8 text-white hover:bg-white/12"
            }`}
          >
            <span>
              <span className="block font-semibold">{material.name}</span>
              {material.notes ? <span className="text-xs opacity-75">{material.notes}</span> : null}
            </span>
            <span className="font-bold">{adjustmentLabel(materialAdjustmentForItem(selectedLens, material.id))}</span>
          </button>
        ))}
      </div>
      <div className="mt-5 rounded-2xl border border-white/15 bg-white/10 p-4">
        <div className="flex justify-between text-sm text-white/75"><span>Selected lens</span><span>{selectedLens ? money(selectedLens.price) : "$0"}</span></div>
        <div className="mt-2 flex justify-between text-sm text-white/75"><span>{selectedMaterial.name}</span><span>{adjustmentLabel(materialAdjustment)}</span></div>
        <div className="mt-2 flex justify-between text-sm text-white/75"><span>{edgeMode}</span><span>{uncutAdjustment === 0 ? "Included" : adjustmentLabel(uncutAdjustment)}</span></div>
        <div className="mt-4 flex justify-between border-t border-white/15 pt-4 text-xl font-semibold"><span>Final price</span><span>{money(total)}</span></div>
      </div>
    </section>
  );
}
