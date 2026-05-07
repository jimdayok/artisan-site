"use client";

import { useMemo, useState } from "react";
import {
  coatingItems,
  edgeAdjustment,
  lensCategories,
  lensItems,
  materialAdders,
  materialAdjustmentForItem,
  money,
  photochromicItems,
  finishingItems,
  shippingItems,
  type PriceCategory,
  type EdgeMode,
  type PriceItem,
} from "../../data/privatePriceList";
import PriceBadge from "./PriceBadge";

const none = "none";

function SelectRow({
  label,
  value,
  onChange,
  items,
  allowNone = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  items: PriceItem[];
  allowNone?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#122033]">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-12 rounded-2xl border border-[#dfd2bf] bg-white px-4 text-sm font-medium outline-none focus:border-[#c7ad7b]">
        {allowNone ? <option value={none}>None</option> : null}
        {items.map((entry) => (
          <option key={entry.id} value={entry.id}>
            {entry.name} - {money(entry.price)}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function QuoteBuilder() {
  const [lensCategory, setLensCategory] = useState<PriceCategory>("Artisan Design Portfolio");
  const availableLensItems = useMemo(() => lensItems.filter((entry) => entry.category === lensCategory), [lensCategory]);
  const [lensId, setLensId] = useState("artisan-diamond-series");
  const [materialId, setMaterialId] = useState("material-polycarb");
  const [edgeMode, setEdgeMode] = useState<EdgeMode>("Edged");
  const [coatingId, setCoatingId] = useState("coat-emerald");
  const [photochromicId, setPhotochromicId] = useState(none);
  const [finishingId, setFinishingId] = useState(none);
  const [shippingId, setShippingId] = useState("ship-ground");

  const lens = availableLensItems.find((entry) => entry.id === lensId) ?? availableLensItems[0] ?? lensItems[0];
  const material = materialAdders.find((entry) => entry.id === materialId) ?? materialAdders[0];
  const coating = coatingItems.find((entry) => entry.id === coatingId);
  const photochromic = photochromicItems.find((entry) => entry.id === photochromicId);
  const finishing = finishingItems.find((entry) => entry.id === finishingId);
  const shipping = shippingItems.find((entry) => entry.id === shippingId);
  const materialAdjustment = materialAdjustmentForItem(lens, material.id);
  const uncutAdjustment = edgeAdjustment(edgeMode);
  const selected = [lens, coating, photochromic, finishing, shipping].filter(Boolean) as PriceItem[];
  const total = selected.reduce((sum, entry) => sum + entry.price, 0) + materialAdjustment + uncutAdjustment;
  const outsourced = selected.some((entry) => entry.outsourced);
  const recommended = selected.some((entry) => entry.recommended);

  const updateCategory = (category: string) => {
    const next = category as PriceCategory;
    setLensCategory(next);
    setLensId(lensItems.find((entry) => entry.category === next)?.id ?? lensItems[0].id);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <section className="rounded-[30px] border border-[#dfd2bf] bg-white/88 p-5 shadow-[0_22px_60px_rgba(18,32,51,0.08)] md:p-7">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-[#122033] md:col-span-2">
            Lens category
            <select value={lensCategory} onChange={(event) => updateCategory(event.target.value)} className="min-h-12 rounded-2xl border border-[#dfd2bf] bg-white px-4 text-sm font-medium outline-none focus:border-[#c7ad7b]">
              {lensCategories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <SelectRow label="Lens design" value={lens.id} onChange={setLensId} items={availableLensItems} />
          <SelectRow label="Material" value={materialId} onChange={setMaterialId} items={materialAdders} />
          <label className="grid gap-2 text-sm font-semibold text-[#122033]">
            Edged or uncut
            <select value={edgeMode} onChange={(event) => setEdgeMode(event.target.value as EdgeMode)} className="min-h-12 rounded-2xl border border-[#dfd2bf] bg-white px-4 text-sm font-medium outline-none focus:border-[#c7ad7b]">
              <option>Edged</option>
              <option>Uncut</option>
            </select>
          </label>
          <SelectRow label="AR coating" value={coatingId} onChange={setCoatingId} items={coatingItems} allowNone />
          <SelectRow label="Photochromic option" value={photochromicId} onChange={setPhotochromicId} items={photochromicItems} allowNone />
          <SelectRow label="Finishing option" value={finishingId} onChange={setFinishingId} items={finishingItems} allowNone />
          <SelectRow label="Shipping option" value={shippingId} onChange={setShippingId} items={shippingItems} allowNone />
        </div>
      </section>

      <aside className="rounded-[30px] border border-[#d4c09a] bg-[#122033] p-5 text-white shadow-[0_28px_82px_rgba(18,32,51,0.2)] lg:sticky lg:top-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d9c394]">Estimated Lab Price</p>
        <div className="mt-4 text-5xl font-semibold">{money(total)}</div>
        <div className="mt-6 grid gap-3">
          {[
            ["Base lens price", lens.price],
            ["Material adjustment", materialAdjustment],
            [edgeMode, uncutAdjustment],
            ["Coating add on", coating?.price ?? 0],
            ["Other add ons", (photochromic?.price ?? 0) + (finishing?.price ?? 0)],
            ["Shipping", shipping?.price ?? 0],
          ].map(([label, price]) => (
            <div key={label} className="flex justify-between rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm">
              <span className="text-white/74">{label}</span>
              <span className="font-semibold">{money(price as number)}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {recommended ? <PriceBadge tone="recommended">★ Recommended</PriceBadge> : null}
          {outsourced ? <PriceBadge tone="outsourced">➜ Outsourced</PriceBadge> : null}
          <PriceBadge tone="dark">{lens.type}</PriceBadge>
        </div>
        <div className="mt-5 space-y-3 text-sm leading-6 text-white/78">
          {recommended ? <p>Recommended for best service through Artisan Lab Network.</p> : null}
          {outsourced ? <p>This product is outsourced. Availability and turnaround may vary.</p> : null}
          {lens.requires ? <p>Lens requirement: {lens.requires}</p> : null}
          {material.requires ? <p>Material requirement: {material.requires}</p> : null}
          <p>Pricing is an estimate from the 2026 XG price list and may need account-specific confirmation.</p>
        </div>
      </aside>
    </div>
  );
}
