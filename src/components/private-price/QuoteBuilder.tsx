"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { compatibleCoatingIdsForItem } from "../../data/arCompatibility";
import {
  adjustmentLabel,
  calculatedPrice,
  coatingItems,
  edgeAdjustment,
  lensGroupForItem,
  lensGroupLabels,
  lensItems,
  logoForPriceItem,
  materialAdders,
  materialAdjustmentForItem,
  mirrorItems,
  money,
  photochromicItems,
  polarizedItems,
  priceTypeLabel,
  blueLightItems,
  finishingItems,
  shippingItems,
  type EdgeMode,
  type LensGroup,
  type PriceItem,
} from "../../data/privatePriceList";
import { msrpForItem } from "../../data/msrpPriceList";
import EdgedUncutToggle from "./EdgedUncutToggle";
import MaterialSelector from "./MaterialSelector";
import PriceBadge from "./PriceBadge";

const none = "none";

function SelectRow({ label, value, onChange, items, allowNone = true }: { label: string; value: string; onChange: (value: string) => void; items: PriceItem[]; allowNone?: boolean }) {
  const selected = items.find((entry) => entry.id === value);
  return (
    <label className="grid gap-2 text-sm font-bold text-[#122033]">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-11 rounded-2xl border border-[#dfd2bf] bg-white px-3 text-sm outline-none focus:border-[#c7ad7b]">
        {allowNone ? <option value={none}>None</option> : null}
        {items.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
      </select>
      {selected ? <LogoBadge item={selected} /> : null}
    </label>
  );
}

function LogoBadge({ item }: { item: PriceItem }) {
  const logo = logoForPriceItem(item);
  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#eadfce] bg-[#fbf8f3] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#75664e]">
      {logo ? <Image src={logo} alt="" width={64} height={16} className="h-4 max-w-16 object-contain" /> : <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#122033] px-1 text-[10px] text-white">{item.name.slice(0, 2).toUpperCase()}</span>}
      {item.brand === "Lab Services" ? item.name : item.brand}
    </span>
  );
}

export default function QuoteBuilder() {
  const [lensGroup, setLensGroup] = useState<LensGroup>("Progressive Lenses");
  const availableLensItems = useMemo(() => lensItems.filter((entry) => lensGroupForItem(entry) === lensGroup), [lensGroup]);
  const [lensId, setLensId] = useState("artisan-diamond-series");
  const [materialId, setMaterialId] = useState("material-polycarb");
  const [edgeMode, setEdgeMode] = useState<EdgeMode>("Edged");
  const [coatingId, setCoatingId] = useState("coat-emerald");
  const [photochromicId, setPhotochromicId] = useState(none);
  const [polarizedId, setPolarizedId] = useState(none);
  const [mirrorId, setMirrorId] = useState(none);
  const [blueLightId, setBlueLightId] = useState(none);
  const [finishingId, setFinishingId] = useState(none);
  const [shippingId, setShippingId] = useState("ship-ground");

  const lens = availableLensItems.find((entry) => entry.id === lensId) ?? availableLensItems[0] ?? lensItems[0];
  const compatibleCoatings = coatingItems.filter((coating) => compatibleCoatingIdsForItem(lens).has(coating.id));
  const material = materialAdders.find((entry) => entry.id === materialId) ?? materialAdders[1];
  const coating = compatibleCoatings.find((entry) => entry.id === coatingId);
  const photochromic = photochromicItems.find((entry) => entry.id === photochromicId);
  const polarized = polarizedItems.find((entry) => entry.id === polarizedId);
  const mirror = mirrorItems.find((entry) => entry.id === mirrorId);
  const blueLight = blueLightItems.find((entry) => entry.id === blueLightId);
  const finishing = finishingItems.find((entry) => entry.id === finishingId);
  const shipping = shippingItems.find((entry) => entry.id === shippingId);
  const addOns = [coating, photochromic, polarized, mirror, blueLight, finishing, shipping].filter(Boolean) as PriceItem[];
  const materialAdjustment = materialAdjustmentForItem(lens, material.id);
  const uncutAdjustment = edgeAdjustment(edgeMode);
  const total = calculatedPrice(lens, material.id, edgeMode, addOns);
  const msrp = msrpForItem(lens, material.id);
  const selected = [lens, ...addOns];

  const updateGroup = (next: string) => {
    const group = next as LensGroup;
    setLensGroup(group);
    setLensId(lensItems.find((entry) => lensGroupForItem(entry) === group)?.id ?? lensItems[0].id);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <section className="rounded-3xl border border-[#dfd2bf] bg-white/90 p-5 shadow-[0_16px_44px_rgba(18,32,51,0.07)]">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-[#122033] md:col-span-2">
            Lens category
            <select value={lensGroup} onChange={(event) => updateGroup(event.target.value)} className="min-h-11 rounded-2xl border border-[#dfd2bf] bg-white px-3 text-sm outline-none focus:border-[#c7ad7b]">
              {lensGroupLabels.map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <SelectRow label="Lens design" value={lens.id} onChange={setLensId} items={availableLensItems} allowNone={false} />
          <SelectRow label="AR coating" value={coatingId} onChange={setCoatingId} items={compatibleCoatings} />
          <SelectRow label="Photochromic Options" value={photochromicId} onChange={setPhotochromicId} items={photochromicItems} />
          <SelectRow label="Polarized Options" value={polarizedId} onChange={setPolarizedId} items={polarizedItems} />
          <SelectRow label="Mirror Options" value={mirrorId} onChange={setMirrorId} items={mirrorItems} />
          <SelectRow label="Blue Light Options" value={blueLightId} onChange={setBlueLightId} items={blueLightItems} />
          <SelectRow label="Finishing option" value={finishingId} onChange={setFinishingId} items={finishingItems} />
          <SelectRow label="Shipping option" value={shippingId} onChange={setShippingId} items={shippingItems} />
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <MaterialSelector selectedLens={lens} value={materialId} onChange={setMaterialId} />
          <EdgedUncutToggle value={edgeMode} onChange={setEdgeMode} />
        </div>
      </section>

      <aside className="rounded-3xl border border-[#d4c09a] bg-[#122033] p-5 text-white shadow-[0_24px_70px_rgba(18,32,51,0.18)] lg:sticky lg:top-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d9c394]">Estimated Lab Price</p>
        <div className="mt-3 text-4xl font-semibold">{money(total)}</div>
        <p className="mt-1 text-sm text-white/65">MSRP: {msrp ? money(msrp) : "guidance unavailable"}</p>
        <div className="mt-5 grid gap-2">
          {[
            ["Base lens price", lens.price],
            ["Material adjustment", materialAdjustment],
            [edgeMode === "Edged" ? "Edged" : "Uncut Deduction", uncutAdjustment],
            ["AR add on", coating?.price ?? 0],
            ["Photochromic add on", photochromic?.price ?? 0],
            ["Polarized add on", polarized?.price ?? 0],
            ["Mirror add on", mirror?.price ?? 0],
            ["Blue light add on", blueLight?.price ?? 0],
            ["Finishing add on", finishing?.price ?? 0],
            ["Shipping", shipping?.price ?? 0],
          ].map(([label, price]) => (
            <div key={label} className="flex justify-between rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-sm">
              <span className="text-white/74">{label}</span>
              <span className="font-semibold">{label === "Uncut Deduction" ? money(price as number) : adjustmentLabel(price as number)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {selected.some((entry) => entry.recommended) ? <PriceBadge tone="recommended">Recommended</PriceBadge> : null}
          {selected.some((entry) => entry.outsourced) ? <PriceBadge tone="outsourced">Outsourced</PriceBadge> : null}
          <PriceBadge tone="dark">{priceTypeLabel(lens.type)}</PriceBadge>
        </div>
        <p className="mt-4 text-sm leading-6 text-white/75">Edged is included. Select uncut to apply the Uncut Deduction of -$8. Compatible AR options are filtered by the selected lens.</p>
      </aside>
    </div>
  );
}
