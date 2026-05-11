"use client";

import { useState } from "react";
import { arCompatibilityForItem } from "../../data/arCompatibility";
import { coatingItems, logoForPriceItem, money, type PriceItem } from "../../data/privatePriceList";

export default function ARCompatibilityPanel({ item }: { item: PriceItem }) {
  const [open, setOpen] = useState(false);
  const groups = arCompatibilityForItem(item);

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex min-h-8 items-center rounded-full border border-[#dfd2bf] bg-white px-3 text-xs font-bold text-[#122033] transition hover:bg-[#eadcc6]"
      >
        Compatible AR
      </button>
      {open ? (
        <div className="mt-3 grid gap-3 rounded-2xl border border-[#eadfce] bg-[#fbf8f3] p-3">
          {groups.map((group) => (
            <div key={group.title}>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-bold text-[#122033]">{group.title}</p>
                {group.preferred ? <span className="rounded-full bg-[#122033] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white">Preferred AR</span> : null}
              </div>
              {group.note ? <p className="mt-1 text-xs leading-5 text-[#625b53]">{group.note}</p> : null}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {group.coatingIds.map((id) => {
                  const coating = coatingItems.find((entry) => entry.id === id);
                  if (!coating) return null;
                  const logo = logoForPriceItem(coating);
                  return (
                    <a key={id} href={`/private/price-list?coating=${encodeURIComponent(id)}`} className="inline-flex items-center gap-1.5 rounded-full border border-[#dfd2bf] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#122033]">
                      {logo ? <img src={logo} alt="" className="h-4 max-w-14 object-contain" /> : <span className="grid h-4 min-w-4 place-items-center rounded-full bg-[#122033] px-1 text-[9px] text-white">{coating.name.slice(0, 2).toUpperCase()}</span>}
                      {coating.name} {money(coating.price)}
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
