"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, PackageCheck } from "lucide-react";
import {
  adjustmentLabel,
  packageBlueFilters,
  packageChemClip,
  packageCoatings,
  packageFinishing,
  packageLensItems,
  packageMaterials,
  packagePhotochromics,
  packageShipping,
  packageTotal,
  money,
  type PackageItem,
} from "../../data/packagePriceList";
import { priceTypeLabel, type EdgeMode } from "../../data/privatePriceList";
import PriceBadge from "./PriceBadge";

const none = "none";

function selectItem(items: PackageItem[], id: string) {
  return items.find((entry) => entry.id === id);
}

function SelectRow({ label, value, onChange, items, allowNone = true }: { label: string; value: string; onChange: (value: string) => void; items: PackageItem[]; allowNone?: boolean }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#122033]">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-12 rounded-2xl border border-[#dfd2bf] bg-white px-4 text-sm font-medium outline-none focus:border-[#c7ad7b]">
        {allowNone ? <option value={none}>None</option> : null}
        {items.map((entry) => (
          <option key={entry.id} value={entry.id}>
            {entry.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function isPackageMaterialAvailable(item: PackageItem) {
  return !item.notes?.toLowerCase().includes("n/a");
}

export default function PackageQuoteBuilder({ initialLensId }: { initialLensId?: string }) {
  const [lensId, setLensId] = useState(initialLensId && packageLensItems.some((item) => item.id === initialLensId) ? initialLensId : packageLensItems[0].id);
  const [materialId, setMaterialId] = useState(packageMaterials[1].id);
  const [coatingId, setCoatingId] = useState("pkg-coat-emerald");
  const [photoId, setPhotoId] = useState(none);
  const [blueId, setBlueId] = useState(none);
  const [finishingId, setFinishingId] = useState(none);
  const [chemClipId, setChemClipId] = useState(none);
  const [shippingId, setShippingId] = useState("pkg-ship-ground-box");
  const [edgeMode, setEdgeMode] = useState<EdgeMode>("Edged");
  const [showUnavailableMaterials, setShowUnavailableMaterials] = useState(false);
  const availableMaterials = useMemo(() => packageMaterials.filter(isPackageMaterialAvailable), []);

  const lens = selectItem(packageLensItems, lensId) ?? packageLensItems[0];
  const material = selectItem(packageMaterials, materialId);
  const effectiveMaterialId =
    material && isPackageMaterialAvailable(material) ? material.id : "pkg-material-polycarb";
  const effectiveMaterial =
    selectItem(packageMaterials, effectiveMaterialId) ?? packageMaterials[0];
  const safeMaterial = isPackageMaterialAvailable(effectiveMaterial)
    ? effectiveMaterial
    : undefined;
  const coating = selectItem(packageCoatings, coatingId);
  const photo = selectItem(packagePhotochromics, photoId);
  const blue = selectItem(packageBlueFilters, blueId);
  const finishing = selectItem(packageFinishing, finishingId);
  const chemClip = selectItem(packageChemClip, chemClipId);
  const shipping = selectItem(packageShipping, shippingId);
  const otherAddOns = [photo, blue, finishing, chemClip].filter(Boolean) as PackageItem[];
  const total = packageTotal(lens, safeMaterial, coating, undefined, undefined, shipping, edgeMode) + otherAddOns.reduce((sum, entry) => sum + entry.price, 0);
  const outsourced = [lens, coating, photo, blue, finishing, chemClip, shipping].filter(Boolean).some((entry) => entry?.outsourced);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <section className="rounded-[30px] border border-[#dfd2bf] bg-white/90 p-5 shadow-[0_22px_60px_rgba(18,32,51,0.08)] md:p-7">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">Package calculator</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#122033]">Build an IOT Lens System quote</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <SelectRow label="Package lens design" value={lensId} onChange={setLensId} items={packageLensItems} allowNone={false} />
          <div className="grid gap-2 text-sm font-semibold text-[#122033] md:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>Material upgrade</span>
              <label className="flex items-center gap-2 text-xs text-[#625b53]">
                <input type="checkbox" checked={showUnavailableMaterials} onChange={(event) => setShowUnavailableMaterials(event.target.checked)} />
                Show unavailable materials
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {(showUnavailableMaterials ? packageMaterials : availableMaterials).map((entry) => {
                const available = isPackageMaterialAvailable(entry);
                return (
                  <button
                    key={entry.id}
                    type="button"
                    disabled={!available}
                    onClick={() => available && setMaterialId(entry.id)}
                    className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition ${
                      effectiveMaterialId === entry.id
                        ? "border-[#c7ad7b] bg-[#122033] text-white"
                        : available
                          ? "border-[#dfd2bf] bg-white text-[#122033] hover:bg-[#f4ead9]"
                          : "cursor-not-allowed border-[#eadfce] bg-[#f8f1e7] text-[#9b8d7a] opacity-75"
                    }`}
                  >
                    {!available ? <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                    {entry.name.replace("Hi Index ", "")} {available ? adjustmentLabel(entry.price) : "N/A"}
                  </button>
                );
              })}
            </div>
            {!material || !isPackageMaterialAvailable(material) ? <p className="text-xs font-semibold text-[#8a4f28]">Not available for this package</p> : null}
          </div>
          <label className="grid gap-2 text-sm font-semibold text-[#122033]">
            Edged or uncut
            <select value={edgeMode} onChange={(event) => setEdgeMode(event.target.value as EdgeMode)} className="min-h-12 rounded-2xl border border-[#dfd2bf] bg-white px-4 text-sm font-medium outline-none focus:border-[#c7ad7b]">
              <option>Edged</option>
              <option>Uncut</option>
            </select>
          </label>
          <SelectRow label="Coating upgrade" value={coatingId} onChange={setCoatingId} items={packageCoatings} />
          <SelectRow label="Photochromic option" value={photoId} onChange={setPhotoId} items={packagePhotochromics} />
          <SelectRow label="Blue filter option" value={blueId} onChange={setBlueId} items={packageBlueFilters} />
          <SelectRow label="Finishing option" value={finishingId} onChange={setFinishingId} items={packageFinishing} />
          <SelectRow label="ChemClip option" value={chemClipId} onChange={setChemClipId} items={packageChemClip} />
          <SelectRow label="Shipping option" value={shippingId} onChange={setShippingId} items={packageShipping} />
        </div>
      </section>
      <aside className="rounded-[30px] border border-[#d4c09a] bg-[#122033] p-5 text-white shadow-[0_28px_82px_rgba(18,32,51,0.2)] lg:sticky lg:top-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d9c394]">Package Total</p>
        <div className="mt-4 text-5xl font-semibold">{money(total)}</div>
        <div className="mt-6 grid gap-3">
          {[
            ["Package lens", lens.price],
            ["Material upgrade", safeMaterial?.price ?? 0],
            [edgeMode, edgeMode === "Edged" ? 0 : -8],
            ["Coating upgrade", coating?.price ?? 0],
            ["Other add ons", otherAddOns.reduce((sum, entry) => sum + entry.price, 0)],
            ["Shipping", shipping?.price ?? 0],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm">
              <span className="text-white/74">{label}</span>
              <span className="font-semibold">{adjustmentLabel(value as number)}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {lens.recommended ? <PriceBadge tone="recommended">★ Recommended</PriceBadge> : null}
          {outsourced ? <PriceBadge tone="outsourced">➜ Outsourced</PriceBadge> : null}
          <PriceBadge tone="dark">{priceTypeLabel(lens.type)}</PriceBadge>
        </div>
        <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white/88">
          <PackageCheck className="h-4 w-4 text-[#d9c394]" aria-hidden="true" />
          Package Available
        </p>
        <p className="mt-3 text-sm leading-7 text-white/78">
          Artisan Lens Systems include Polycarbonate and Artisan Emerald AR Treatment. This Lens System is eligible for multiple pair 50% discount.
        </p>
      </aside>
    </div>
  );
}
