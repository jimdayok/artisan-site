import Image from "next/image";
import Link from "next/link";
import CookiePreferencesButton from "../CookiePreferencesButton";

type NewsletterShellProps = {
  children: React.ReactNode;
};

export default function NewsletterShell({ children }: NewsletterShellProps) {
  return (
    <main
      id="top"
      className="min-h-screen overflow-x-clip bg-[#f0e8dd] text-[#122033]"
    >
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(164,111,82,0.12),transparent_26%),radial-gradient(circle_at_88%_34%,rgba(196,160,101,0.13),transparent_28%),linear-gradient(180deg,#f7f1e8_0%,#f0e8dd_52%,#eadfd2_100%)]" />
        <div className="absolute inset-0 opacity-[0.22] [background-image:radial-gradient(rgba(83,62,45,0.16)_0.55px,transparent_0.55px)] [background-size:7px_7px]" />
        <div
          className="absolute -right-44 top-24 hidden h-[620px] w-[620px] bg-contain bg-center bg-no-repeat opacity-[0.035] md:block"
          style={{ backgroundImage: "url('/rings.png')" }}
          aria-hidden="true"
        />
        <div
          className="absolute -left-56 bottom-20 hidden h-[540px] w-[540px] bg-contain bg-center bg-no-repeat opacity-[0.04] md:block"
          style={{ backgroundImage: "url('/rings.png')" }}
          aria-hidden="true"
        />
      </div>

      <header className="relative z-30 border-b border-[#d8c9b5] bg-[#f9f6f0]/94 px-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-5 py-4 md:py-5">
          <Link href="/newsletter" className="flex min-w-0 items-center gap-4" aria-label="Practice Matters newsletter home">
            <Image
              src="/aln-icon.png"
              alt=""
              width={40}
              height={40}
              className="h-8 w-8 object-contain sm:h-9 sm:w-9"
              priority
            />
            <span className="block min-w-0 border-l border-[#d8c9b5] pl-4">
              <span className="block truncate font-[family-name:var(--font-alfons-display)] text-sm leading-none text-[#122033] sm:text-lg">Practice Matters</span>
              <span className="mt-1 hidden text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8a7654] sm:block">Independent eye care briefing</span>
            </span>
          </Link>
          <nav className="flex shrink-0 items-center gap-4" aria-label="Publication navigation">
            <Link
              href="/provider-resources"
              className="hidden text-sm font-semibold text-[#122033] underline decoration-[#c7ad7b] underline-offset-4 transition hover:text-[#8a7654] md:inline"
            >
              Provider Resources
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#122033] px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#9a8054]"
            >
              Main website
            </Link>
          </nav>
        </div>
      </header>

      <div className="relative z-10">{children}</div>

      <footer className="relative z-10 border-t border-[#d8c9b5] bg-[#122033] px-4 py-12 text-white md:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-white/15 bg-white">
              <Image src="/aln-icon.png" alt="" width={30} height={30} className="h-7 w-7 object-contain" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d9c394]">
                Practice Matters
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                A publication from Artisan Lab Network for independent eye care practices.
              </p>
              <p className="mt-2 text-xs leading-5 text-white/50">
                © 2026 Artisan Lab Network · This webpage was built and designed by{" "}
                <a
                  href="https://d2dmktg.com"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#d9c394] underline decoration-[#d9c394] underline-offset-4 transition hover:text-white"
                >
                  D2D Marketing
                </a>
                .
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap md:justify-end">
            <Link href="/" className="text-sm font-semibold text-white/75 underline decoration-[#d9c394] underline-offset-4 hover:text-white">
              Main Website
            </Link>
            <Link href="/provider-resources" className="text-sm font-semibold text-white/75 underline decoration-[#d9c394] underline-offset-4 hover:text-white">
              Provider Resources
            </Link>
            <Link href="/newsletters" className="text-sm font-semibold text-white/75 underline decoration-[#d9c394] underline-offset-4 hover:text-white">
              Newsletter Archive
            </Link>
            <Link href="/cookie-policy" className="text-sm font-semibold text-white/75 underline decoration-[#d9c394] underline-offset-4 hover:text-white">
              Cookie Policy
            </Link>
            <Link href="/privacy-policy" className="text-sm font-semibold text-white/75 underline decoration-[#d9c394] underline-offset-4 hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="text-sm font-semibold text-white/75 underline decoration-[#d9c394] underline-offset-4 hover:text-white">
              Terms &amp; Conditions
            </Link>
            <CookiePreferencesButton className="text-sm font-semibold text-white/75 underline decoration-[#d9c394] underline-offset-4 hover:text-white" />
          </div>
        </div>
      </footer>
    </main>
  );
}
