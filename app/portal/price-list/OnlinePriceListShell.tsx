import Link from "next/link";
import PricingHeader from "../../../src/components/private-price/PricingHeader";
import type { PortalPriceList } from "@/lib/portal/priceLists";
import PortalPriceListScrollReset from "./PortalPriceListScrollReset";

export function OnlinePriceListShell({
  priceList,
  children,
}: {
  priceList: PortalPriceList;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen overflow-x-hidden overflow-y-auto bg-[#f4eee4] px-3 py-5 text-[#122033] md:px-6">
      <PortalPriceListScrollReset />
      <div className="mx-auto w-full max-w-[1680px]">
        <PricingHeader
          eyebrow="Private Online Pricing"
          title={`${priceList.code} Online Pricing`}
          description="Account-assigned pricing tools are available only through secure portal access."
          showNavigation={priceList.code === "G6"}
        />
        <div className="mt-7">{children}</div>
      </div>
    </main>
  );
}

export function PendingOnlinePriceList({ priceList }: { priceList: PortalPriceList }) {
  return (
    <OnlinePriceListShell priceList={priceList}>
      <section className="grid gap-6 rounded-[2px] border border-[#dfd2bf] bg-[#fbf8f3]/92 p-6 shadow-[0_22px_60px_rgba(18,32,51,0.08)] md:grid-cols-[0.9fr_1.1fr] md:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">
            Source of truth
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
            {priceList.label}
          </h2>
          <p className="mt-4 text-sm leading-6 text-[#4d5664]">
            The official PDF remains the current source of truth for this price
            list while the interactive web table is prepared from the source
            document.
          </p>
        </div>
        <div className="rounded-[2px] border border-[#d7c5a8] bg-white/82 p-5">
          <h3 className="text-xl font-semibold tracking-[-0.02em]">
            Online pricing table in progress
          </h3>
          <p className="mt-3 text-sm leading-6 text-[#4d5664]">
            Pricing has not been transcribed into structured web data for this
            code yet. No pricing has been guessed or approximated on this page.
          </p>
          {priceList.r2Key ? (
            <a
              href={`/api/portal/download?code=${encodeURIComponent(priceList.code)}`}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#122033] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#25364a]"
            >
              Download {priceList.code} PDF
            </a>
          ) : null}
          <Link
            href="/portal"
            className="ml-0 mt-3 inline-flex min-h-11 items-center justify-center rounded-full border border-[#d7c5a8] bg-white px-5 py-2 text-sm font-semibold text-[#122033] transition hover:bg-[#fbf8f3] sm:ml-3"
          >
            Back to portal
          </Link>
        </div>
      </section>
    </OnlinePriceListShell>
  );
}
