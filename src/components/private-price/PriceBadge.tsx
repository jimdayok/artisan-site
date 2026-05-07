import type { PriceType } from "../../data/privatePriceList";

const typeStyles: Record<PriceType, string> = {
  SV: "border-sky-200 bg-sky-50 text-sky-800",
  ESV: "border-indigo-200 bg-indigo-50 text-indigo-800",
  MF: "border-amber-200 bg-amber-50 text-amber-800",
  OCP: "border-emerald-200 bg-emerald-50 text-emerald-800",
  PAL: "border-[#d8c095] bg-[#f7edda] text-[#7b6238]",
  "Add-On": "border-[#d9cbb6] bg-white text-[#625b53]",
  Service: "border-[#d9cbb6] bg-[#fbf8f3] text-[#625b53]",
  Reference: "border-[#d9cbb6] bg-[#fbf8f3] text-[#625b53]",
};

export default function PriceBadge({
  children,
  tone = "neutral",
  type,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "recommended" | "outsourced" | "dark";
  type?: PriceType;
}) {
  const className = type
    ? typeStyles[type]
    : tone === "recommended"
      ? "border-[#d7bb78] bg-[#fff4d7] text-[#72571e]"
      : tone === "outsourced"
        ? "border-[#d8c0aa] bg-[#f8eee7] text-[#8a4f28]"
        : tone === "dark"
          ? "border-white/15 bg-white/10 text-white"
          : "border-[#d9cbb6] bg-white text-[#625b53]";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${className}`}>
      {children}
    </span>
  );
}
