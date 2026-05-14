import Link from "next/link";

export default function PriceListAccessMessage({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-[#f4eee4] px-4 py-10 text-[#122033] md:px-8">
      <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center">
        <section className="w-full rounded-[2px] border border-[#dfd2bf] bg-[#fbf8f3]/90 p-7 shadow-[0_22px_70px_rgba(18,32,51,0.08)] md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">
            Private Pricing
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
            Access required
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#4d5664]">
            {message}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/portal"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#122033] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#25364a]"
            >
              Return to Customer Portal
            </Link>
            <a
              href="mailto:info@artisanlabnetwork.com?subject=Private%20Price%20List%20Access"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d7c5a8] bg-white/80 px-5 py-2 text-sm font-semibold text-[#122033] transition hover:bg-white"
            >
              Request help
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
