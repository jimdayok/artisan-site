"use client";

import { useState } from "react";
import Link from "next/link";

type FooterProps = {
  onContactClick?: () => void;
  signUpHref: string;
};

export default function Footer({
  onContactClick = () => {
    window.location.href = "mailto:info@artisanlabnetwork.com";
  },
  signUpHref,
}: FooterProps) {
  const [footerIconClicks, setFooterIconClicks] = useState(0);
  const [privacyClicks, setPrivacyClicks] = useState(0);
  const socialLinks = [
    { label: "Facebook", icon: "/social/facebook.svg", href: "https://www.facebook.com/artisanlabnetwork" },
    { label: "Instagram", icon: "/social/instagram.svg", href: "https://www.instagram.com/artisanlabnetwork" },
    { label: "LinkedIn", icon: "/social/linkedin.svg", href: "https://www.linkedin.com/company/artisan-lab-network/" },
  ];

  const handleFooterIconClick = () => {
    setFooterIconClicks((current) => {
      const next = current + 1;
      if (next >= 5) {
        window.location.href = "/programs?p=aln2026";
        return 0;
      }

      return next;
    });
  };

  const handlePrivacyClick = () => {
    setPrivacyClicks((current) => {
      const next = current + 1;
      if (next >= 3) {
        window.location.href = "/break-the-system";
        return 0;
      }

      return next;
    });
  };

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
            <button
              type="button"
              onClick={handleFooterIconClick}
              aria-label="Artisan Lab Network"
              className="rounded-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/aln-icon.png"
                alt=""
                className="h-12 w-12 rounded-full border border-white/10 bg-white/5 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
              />
            </button>
            <div>
              <div className="text-xl font-semibold">Artisan Lab Network</div>
              <div className="mt-1 text-xs uppercase tracking-[0.24em] text-[#c9b28b]">
                Doctor-owned network
              </div>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/68">
            Artisan Lab Network is the parent organization supporting{" "}
            <Link href="/pacific-artisan-labs" className="transition hover:text-white">Pacific Artisan Labs</Link>,{" "}
            <Link href="/peak-artisan-labs" className="transition hover:text-white">Peak Artisan Labs</Link>, and{" "}
            <Link href="/pike-artisan-labs" className="transition hover:text-white">Pike Artisan Labs</Link>, built to
            serve independent eye care with more choice, more control, and
            better partnership.
          </p>
          <div className="mt-6 flex gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="group grid h-10 w-10 place-items-center rounded-full border border-white/12 bg-white/[0.04] text-white/75 transition hover:border-[#c9b28b]/70 hover:bg-[#c9b28b]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={social.icon}
                  alt=""
                  className="h-5 w-5 object-contain opacity-80 [filter:brightness(0)_invert(1)] transition group-hover:opacity-100 group-hover:[filter:brightness(0)_saturate(100%)_invert(8%)_sepia(8%)_saturate(652%)_hue-rotate(337deg)_brightness(95%)_contrast(92%)]"
                />
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
            <li><Link href="/meet-the-artisans" className="transition hover:text-white">Meet the Artisans</Link></li>
            <li><Link href="/#labs" className="transition hover:text-white">Our Labs</Link></li>
            <li><Link href="/provider-resources" className="transition hover:text-white">Resources</Link></li>
            <li><Link href="/portal" className="transition hover:text-white">Customer Portal</Link></li>
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
            <li><Link href="/about#press-releases" className="transition hover:text-white">Press Releases</Link></li>
            <li><Link href="/newsletter" className="transition hover:text-white">Newsletter</Link></li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-[#c9b28b]">
            Contact
          </h3>
          <div className="mt-5 space-y-4 text-sm leading-7 text-white/72">
            <p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=12302%20NE%20Marx%20St%20Portland%20OR%2097230"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-white"
              >
                12302 NE Marx St.<br />
                Portland, OR 97230
              </a>
              <a
                href="https://www.google.com/maps/search/?api=1&query=12302%20NE%20Marx%20St%20Portland%20OR%2097230"
                target="_blank"
                rel="noreferrer"
                className="mt-1 block text-xs font-semibold text-[#c9b28b] transition hover:text-white"
              >
                Open in Maps
              </a>
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
              Privacy is not a game (
              <button
                type="button"
                onClick={handlePrivacyClick}
                className="inline cursor-default appearance-none border-0 bg-transparent p-0 text-inherit no-underline"
              >
                this is
              </button>
              ), and we respect your privacy. Information submitted through this site is used only to respond to your inquiry and support your relationship with Artisan Lab Network.
            </p>
          </div>
          <div className="flex shrink-0 gap-5">
            <Link href="/terms-and-conditions" className="transition hover:text-white/80">Terms &amp; Conditions</Link>
            <Link href="/privacy-policy" className="transition hover:text-white/80">Privacy Policy</Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
