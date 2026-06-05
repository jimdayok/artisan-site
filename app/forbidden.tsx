export default function Forbidden() {
  return (
    <main className="min-h-screen bg-[#f4efe6] px-5 py-12 text-[#172a28] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-3xl border border-[#d8c49b] bg-[#fffaf1]/88 p-8 shadow-[0_24px_80px_rgba(23,42,40,0.12)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b7650]">
          Customer Portal
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">
          Portal access unavailable
        </h1>
        <p className="mt-4 text-base leading-7 text-[#706759]">
          This email is not currently tied to an Artisan Lab Network portal
          account. Please contact ALN support if you believe this is an error.
        </p>
      </div>
    </main>
  );
}
