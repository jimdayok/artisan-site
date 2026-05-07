import Image from "next/image";
import Link from "next/link";

type NewsletterShellProps = {
  children: React.ReactNode;
};

export default function NewsletterShell({ children }: NewsletterShellProps) {
  return (
    <main
      id="top"
      className="min-h-screen overflow-x-clip bg-[#f4eee4] text-[#122033]"
    >
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(199,173,123,0.24),transparent_31%),radial-gradient(circle_at_82%_12%,rgba(255,255,255,0.82),transparent_28%),linear-gradient(180deg,#f8f2e9_0%,#f4eee4_48%,#efe5d8_100%)]" />
        <div
          className="absolute -right-44 top-24 hidden h-[620px] w-[620px] bg-contain bg-center bg-no-repeat opacity-[0.055] md:block"
          style={{ backgroundImage: "url('/rings.png')" }}
          aria-hidden="true"
        />
        <div
          className="absolute -left-56 bottom-20 hidden h-[540px] w-[540px] bg-contain bg-center bg-no-repeat opacity-[0.04] md:block"
          style={{ backgroundImage: "url('/rings.png')" }}
          aria-hidden="true"
        />
      </div>

      <header className="relative z-30 border-b border-[#dfd2bf]/80 bg-[#f8f3eb]/86 px-4 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex w-fit items-center gap-3" aria-label="Artisan Lab Network home">
            <Image
              src="/aln-logo.svg"
              alt="Artisan Lab Network"
              width={206}
              height={60}
              className="h-11 w-auto"
              priority
            />
          </Link>
          <nav className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap" aria-label="Publication navigation">
            <Link
              href="/provider-resources"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#d7c5a8] bg-white/78 px-4 py-2 text-center text-sm font-semibold text-[#122033] shadow-sm transition hover:-translate-y-0.5 hover:border-[#c7ad7b] hover:bg-white sm:w-auto"
            >
              Provider Resources
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#122033] px-4 py-2 text-center text-sm font-semibold text-white shadow-[0_14px_28px_rgba(18,32,51,0.18)] transition hover:-translate-y-0.5 hover:bg-[#c7ad7b] hover:text-[#122033] sm:w-auto"
            >
              Back to Artisan Lab Network
            </Link>
          </nav>
        </div>
      </header>

      <div className="relative z-10">{children}</div>

      <footer className="relative z-10 border-t border-[#dfd2bf] bg-[#f8f3eb]/94 px-4 py-12 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#dfd2bf] bg-white shadow-[0_12px_28px_rgba(18,32,51,0.07)]">
              <Image src="/aln-icon.png" alt="" width={30} height={30} className="h-7 w-7 object-contain" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8a7654]">
                Practice Matters
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#4d5664]">
                A publication from Artisan Lab Network for independent eye care practices.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap md:justify-end">
            <Link href="/" className="text-sm font-semibold text-[#122033] underline decoration-[#c7ad7b] underline-offset-4">
              Main Website
            </Link>
            <Link href="/provider-resources" className="text-sm font-semibold text-[#122033] underline decoration-[#c7ad7b] underline-offset-4">
              Provider Resources
            </Link>
            <Link href="/newsletters" className="text-sm font-semibold text-[#122033] underline decoration-[#c7ad7b] underline-offset-4">
              Newsletter Archive
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
