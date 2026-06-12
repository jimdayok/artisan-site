import Image from "next/image";

export default function PriceListLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4eee4] px-6 text-[#122033]">
      <div
        className="flex min-h-64 w-full max-w-xl flex-col items-center justify-center rounded-[2px] border border-[#dfd2bf] bg-[#fbf8f3] px-8 py-12 text-center shadow-[0_22px_60px_rgba(18,32,51,0.1)]"
        role="status"
        aria-live="polite"
      >
        <Image
          src="/rings-transparent.png"
          alt=""
          width={112}
          height={112}
          priority
          className="h-24 w-24 animate-spin object-contain [animation-duration:1.8s]"
          aria-hidden="true"
        />
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.28em] text-[#8a7654]">
          Loading
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Loading pricing...
        </h1>
        <p className="mt-2 text-sm text-[#625b53]">
          Preparing the current products, options, and customer pricing.
        </p>
      </div>
    </main>
  );
}
