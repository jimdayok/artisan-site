import Link from "next/link";
import { priceListMeta } from "../../data/privatePriceList";

export default function PricingHeader({
  eyebrow,
  title,
  description,
  showNavigation = true,
}: {
  eyebrow: string;
  title: string;
  description: string;
  showNavigation?: boolean;
}) {
  return (
    <header className="rounded-3xl border border-[#dfd2bf] bg-[#fbf7ef]/88 p-4 shadow-[0_14px_38px_rgba(18,32,51,0.06)] backdrop-blur md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#122033] md:text-4xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#4d5664]">{description}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[520px]">
          <div className="grid gap-1.5 rounded-2xl border border-[#dfd2bf] bg-white/80 p-3 text-xs text-[#4d5664]">
            <span><strong className="text-[#122033]">Confidential Partner Pricing</strong></span>
            <span>Private pricing for assigned Artisan Equity Partner accounts.</span>
            <span className="font-semibold text-[#8a4f28]">{priceListMeta.distributionNotice}</span>
          </div>
          <div className="grid gap-1.5 rounded-2xl border border-[#d8c6a8] bg-[#fffaf2] p-3 text-xs text-[#4d5664]">
            <span><strong className="text-[#122033]">Shipping Rates</strong></span>
            <span>Next Day Air: <strong className="text-[#122033]">$4 per job</strong></span>
            <span>2-Day Shipping: <strong className="text-[#122033]">$16 per box</strong></span>
          </div>
        </div>
      </div>
      {showNavigation ? (
        <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap">
          {[
            ["/portal/price-list/g6", "Dashboard"],
            ["/portal/price-list/catalog", "Catalog"],
            ["/portal/price-list/calculator", "Quote Builder"],
            ["/portal/price-list/b5", "B5 Pricing"],
            ["/policies", "Artisan Policies"],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-full border border-[#d7c5a8] bg-white/90 px-3.5 py-1.5 text-sm font-semibold text-[#122033] transition hover:bg-[#eadcc6]">
              {label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
