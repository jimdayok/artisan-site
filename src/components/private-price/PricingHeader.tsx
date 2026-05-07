import Link from "next/link";
import { priceListMeta } from "../../data/privatePriceList";

export default function PricingHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <header className="rounded-[30px] border border-[#dfd2bf] bg-[#fbf7ef]/92 p-6 shadow-[0_28px_80px_rgba(18,32,51,0.1)] md:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">{eyebrow}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#122033] md:text-6xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[#4d5664] md:text-lg">{description}</p>
        </div>
        <div className="grid gap-2 rounded-2xl border border-[#dfd2bf] bg-white/78 p-4 text-sm text-[#4d5664]">
          <span><strong className="text-[#122033]">General Pricing</strong></span>
          <span>{priceListMeta.guideLabel}</span>
          <span className="font-semibold text-[#8a4f28]">{priceListMeta.distributionNotice}</span>
        </div>
      </div>
      <nav className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {[
          ["/private/price-list", "Dashboard"],
          ["/private/price-list/catalog", "Catalog"],
          ["/private/price-list/calculator", "Quote Builder"],
          ["/private/price-list/packages", "Packages"],
        ].map(([href, label]) => (
          <Link key={href} href={href} className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d7c5a8] bg-white px-5 py-2 text-sm font-semibold text-[#122033] transition hover:bg-[#eadcc6]">
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
