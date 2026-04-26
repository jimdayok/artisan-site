"use client";

import Link from "next/link";

type FooterProps = {
  onContactClick: () => void;
  signUpHref: string;
};

export default function Footer({ onContactClick, signUpHref }: FooterProps) {
  const socialLinks = [
    { label: "Facebook", short: "Fb", href: "#" },
    { label: "Instagram", short: "Ig", href: "#" },
    { label: "LinkedIn", short: "In", href: "#" },
  ];

  return (
    <footer id="site-footer" className="relative z-20 bg-[#171311] text-[#f7f1e8]">
      <div className="border-y border-white/10 bg-[linear-gradient(180deg,#241d18_0%,#1d1814_100%)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#c9b28b]">
              Artisan Lab Network
            </p>
            <h2 className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight md:text-3xl">
              Independent eye care deserves a better lab model.
            </h2>
          </div>
          <a
            href={signUpHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center justify-center rounded-full bg-[#d4c09a] px-6 py-3 text-sm font-semibold text-[#171311] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e2cca2]"
          >
            Get Started
          </a>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-12 md:px-10">
        <div className="md:col-span-5">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/aln-icon.png"
              alt=""
              className="h-12 w-12 rounded-full border border-white/10 bg-white/5 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            />
            <div>
              <div className="text-xl font-semibold">Artisan Lab Network</div>
              <div className="mt-1 text-xs uppercase tracking-[0.24em] text-[#c9b28b]">
                Doctor-owned network
              </div>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/68">
            Artisan Lab Network is the parent organization supporting Pacific
            Artisan Labs, Peak Artisan Labs, and Pike Artisan Labs, built to
            serve independent eye care with more choice, more control, and
            better partnership.
          </p>
          <div className="mt-6 flex gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/12 bg-white/[0.04] text-xs font-semibold text-white/75 transition hover:border-[#c9b28b]/70 hover:bg-[#c9b28b] hover:text-[#171311]"
              >
                {social.short}
              </a>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-[#c9b28b]">
            Explore
          </h3>
          <ul className="mt-5 space-y-3.5 text-sm text-white/72">
            <li><Link href="/" className="transition hover:text-white">Home</Link></li>
            <li><Link href="/about" className="transition hover:text-white">About Us</Link></li>
            <li><Link href="/#labs" className="transition hover:text-white">Our Labs</Link></li>
            <li><Link href="/provider-resources" className="transition hover:text-white">Resources</Link></li>
            <li>
              <button type="button" onClick={onContactClick} className="transition hover:text-white">
                Contact Us
              </button>
            </li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-[#c9b28b]">
            Company
          </h3>
          <ul className="mt-5 space-y-3.5 text-sm text-white/72">
            <li><Link href="/careers" className="transition hover:text-white">Careers</Link></li>
            <li><a href="#" className="transition hover:text-white">Press Releases</a></li>
            <li><a href="#" className="transition hover:text-white">Newsletter</a></li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-[#c9b28b]">
            Contact
          </h3>
          <div className="mt-5 space-y-4 text-sm leading-7 text-white/72">
            <p>
              12302 NE Marx St.<br />
              Portland, OR 97230
            </p>
            <p>
              <a href="tel:8773906900" className="transition hover:text-white">
                877.390.6900
              </a>
            </p>
            <p>
              <a
                href="mailto:info@artisanlabnetwork.com"
                className="transition hover:text-white"
              >
                info@artisanlabnetwork.com
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#14110f]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 text-xs leading-6 text-white/45 md:flex-row md:items-center md:justify-between md:px-10">
          <div>
            <p>© 2026 Artisan Lab Network</p>
            <p className="mt-1 max-w-2xl">
              We respect your privacy. Information submitted through this site is used only to respond to your inquiry and support your relationship with Artisan Lab Network.
            </p>
          </div>
          <div className="flex shrink-0 gap-5">
            <a href="#" className="transition hover:text-white/80">Terms &amp; Conditions</a>
            <a href="#" className="transition hover:text-white/80">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
