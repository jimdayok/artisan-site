"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Theme = "dark" | "light";

type NavItem = { label: string; href?: string; dividerBefore?: boolean };
type Dropdown = { label: string; items: NavItem[] };

const CUSTOMER_PORTAL_URL = "/portal";

function Capsule({
  children,
  href,
  theme,
  onClick,
}: {
  children: React.ReactNode;
  href?: string;
  theme: Theme;
  onClick?: () => void;
}) {
  const base =
    theme === "light"
      ? "px-4 py-2 text-sm font-medium rounded-full border border-black/10 bg-white/50 backdrop-blur-md text-black transition hover:bg-white/70 hover:border-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a7654] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      : "px-4 py-2 text-sm font-medium rounded-full border border-white/15 bg-white/10 backdrop-blur-md text-white transition hover:bg-white/15 hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4c09a] focus-visible:ring-offset-2 focus-visible:ring-offset-black";

  if (!href)
    return (
      <button type="button" onClick={onClick} className={base}>
        {children}
      </button>
    );

  if (href.startsWith("/"))
    return (
      <Link className={base} href={href} onClick={onClick}>
        {children}
      </Link>
    );

  return (
    <a className={base} href={href} onClick={onClick}>
      {children}
    </a>
  );
}

function DropdownMenu({
  label,
  items,
  theme,
  onAnyClick,
}: Dropdown & { theme: Theme; onAnyClick: () => void }) {
  const [open, setOpen] = useState(false);

  const trigger =
    theme === "light"
      ? "px-4 py-2 text-sm font-medium rounded-full border border-black/10 bg-white/50 backdrop-blur-md text-black transition hover:bg-white/70 hover:border-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a7654] focus-visible:ring-offset-2 focus-visible:ring-offset-white flex items-center gap-2"
      : "px-4 py-2 text-sm font-medium rounded-full border border-white/15 bg-white/10 backdrop-blur-md text-white transition hover:bg-white/15 hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4c09a] focus-visible:ring-offset-2 focus-visible:ring-offset-black flex items-center gap-2";

  const menu =
    theme === "light"
      ? "absolute left-0 mt-2 w-64 rounded-2xl border border-black/10 bg-white/90 backdrop-blur-md shadow-xl overflow-hidden z-[1100]"
      : "absolute left-0 mt-2 w-64 rounded-2xl border border-white/15 bg-black/60 backdrop-blur-xl shadow-xl overflow-hidden z-[1100]";

  const itemCls =
    theme === "light"
      ? "block px-4 py-3 text-sm text-black/80 hover:bg-black/5 hover:text-black"
      : "block px-4 py-3 text-sm text-white/85 hover:bg-white/10 hover:text-white";

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className={trigger}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {label}
        <span className="text-xs opacity-70">{open ? "▲" : "▼"}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className={menu}
          >
            {items.map((item) => {
              const href = item.href ?? "#";
              const handleClick = () => {
                setOpen(false);
                onAnyClick();
              };

              if (href.startsWith("/")) {
                return (
                  <div key={item.label}>
                    {item.dividerBefore ? (
                      <div
                        className={`mx-4 my-1 border-t ${
                          theme === "light" ? "border-black/10" : "border-white/12"
                        }`}
                      />
                    ) : null}
                    <Link
                      href={href}
                      className={`${itemCls} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4c09a] focus-visible:ring-inset`}
                      onClick={handleClick}
                    >
                      {item.label}
                    </Link>
                  </div>
                );
              }

              return (
                <div key={item.label}>
                  {item.dividerBefore ? (
                    <div
                      className={`mx-4 my-1 border-t ${
                        theme === "light" ? "border-black/10" : "border-white/12"
                      }`}
                    />
                  ) : null}
                  <a
                    href={href}
                    className={`${itemCls} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4c09a] focus-visible:ring-inset`}
                    onClick={handleClick}
                  >
                    {item.label}
                  </a>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Header({
  onContactClick,
  signUpHref = "https://form.typeform.com/to/quuPCSff",
}: {
  onContactClick?: () => void;
  signUpHref?: string;
}) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mobileOpen, setMobileOpen] = useState(false);

  const resources: Dropdown = useMemo(
    () => ({
      label: "Resources",
      items: [
        { label: "Professional Resources", href: "/provider-resources" },
        { label: "Patient Resources", href: "/patient-resources" },
        { label: "Lab Ownership & Partnership", href: "/artisan-model" },
        { label: "Customer Portal", href: CUSTOMER_PORTAL_URL, dividerBefore: true },
      ],
    }),
    []
  );

  const labs: Dropdown = useMemo(
    () => ({
      label: "Our Labs",
      items: [
        { label: "Pacific Artisan Labs", href: "/pacific-artisan-labs" },
        { label: "Peak Artisan Labs", href: "/peak-artisan-labs" },
        { label: "Pike Artisan Labs", href: "/pike-artisan-labs" },
        { label: "Meet the Artisans", href: "/meet-the-artisans", dividerBefore: true },
      ],
    }),
    []
  );

  useEffect(() => {
    const watched = document.querySelectorAll("[data-theme]");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const t = (entry.target as HTMLElement).dataset.theme as Theme | undefined;
          if (t) setTheme(t);
        });
      },
      { threshold: 0.45 }
    );

    watched.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const headerBg =
    theme === "light"
      ? "bg-[#f2eee7]/88 border-[#d6c3a1]/35"
      : "bg-black/15 border-white/10";

  const logoFilter =
    theme === "light"
      ? "brightness(0) saturate(100%) drop-shadow(0 1px 0 rgba(255,255,255,0.2))"
      : "drop-shadow(0 0 10px rgba(0,0,0,0.6))";

  const iconFilter =
    theme === "light"
      ? "brightness(0) saturate(100%) drop-shadow(0 1px 0 rgba(255,255,255,0.2))"
      : "drop-shadow(0 0 10px rgba(0,0,0,0.55))";

  const handleMobileIconClick = () => {
    setMobileOpen((v) => !v);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000]">
      <div className={`pointer-events-none absolute inset-0 -z-10 ${headerBg} backdrop-blur-xl`} />

      <div className="mx-auto max-w-7xl px-5 md:px-8 lg:px-10">
        <div className="flex h-[72px] items-center justify-between gap-4 md:h-[76px]">
          <Link
            href="/"
            className="shrink-0 flex items-center"
            aria-label="Home"
          >
            <Image
              src="/aln-white-logo.png"
              alt="Artisan Lab Network"
              width={1000}
              height={471}
              priority
              className="h-12 w-auto md:h-[60px]"
              style={{
                maxHeight: 62,
                filter: logoFilter,
              }}
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-3">
            <Capsule href="/" theme={theme}>
              Home
            </Capsule>
            <Capsule href="/about" theme={theme}>
              About Us
            </Capsule>

            <DropdownMenu {...labs} theme={theme} onAnyClick={() => setMobileOpen(false)} />

            <DropdownMenu {...resources} theme={theme} onAnyClick={() => setMobileOpen(false)} />

            <Capsule theme={theme} onClick={onContactClick}>
              Contact Us
            </Capsule>

            <a
              href={signUpHref}
              target="_blank"
              rel="noreferrer"
              className="ml-1 rounded-full border border-[#d4c09a] bg-[#d4c09a] px-6 py-2 text-sm font-semibold text-black shadow transition hover:-translate-y-0.5 hover:bg-[#e2cca2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4c09a] focus-visible:ring-offset-2 focus-visible:ring-offset-black active:translate-y-0"
            >
              Get Started
            </a>
          </nav>

          <button
            className="flex flex-col items-center justify-center rounded-full p-2 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4c09a] lg:hidden"
            onClick={handleMobileIconClick}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
          >
            <Image
              src="/aln-icon.png"
              alt=""
              width={260}
              height={260}
              className="h-7 w-7 object-contain"
              style={{ filter: iconFilter }}
            />
            <span className="mt-1 flex flex-col items-center gap-[3px]" aria-hidden="true">
              <span className="block h-[2px] w-7 rounded-full bg-[#d4c09a]" />
              <span className="block h-[2px] w-7 rounded-full bg-[#d4c09a]" />
              <span className="block h-[2px] w-7 rounded-full bg-[#d4c09a]" />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className={`lg:hidden border-t ${
              theme === "light"
                ? "bg-[#f2eee7]/92 border-[#d6c3a1]/35 text-black"
                : "bg-black/70 border-white/10 text-white"
            } backdrop-blur-xl`}
          >
            <div className="max-w-7xl mx-auto px-5 py-4 space-y-3">
              <Link
                className="block min-h-10 rounded-lg px-2 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4c09a]"
                href="/"
                onClick={() => setMobileOpen(false)}
              >
                Home
              </Link>
              <Link
                className="block min-h-10 rounded-lg px-2 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4c09a]"
                href="/about"
                onClick={() => setMobileOpen(false)}
              >
                About Us
              </Link>

              <div className="mt-3">
                <div className="text-xs uppercase tracking-[0.28em] opacity-60 mb-2">Our Labs</div>
                {labs.items.map((item) => (
                  <div key={item.label}>
                    {item.dividerBefore ? (
                      <div
                        className={`my-3 border-t ${
                          theme === "light" ? "border-black/10" : "border-white/12"
                        }`}
                      />
                    ) : null}
                    {item.href?.startsWith("/") ? (
                      <Link
                        className="mt-2 block min-h-10 rounded-lg px-2 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4c09a]"
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <a
                        className="mt-2 block min-h-10 rounded-lg px-2 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4c09a]"
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.label}
                      </a>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-3">
                <div className="text-xs uppercase tracking-[0.28em] opacity-60 mb-2">Resources</div>
                {resources.items.map((item) => {
                  const href = item.href ?? "#";
                  const className = "mt-2 block min-h-10 rounded-lg px-2 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4c09a]";

                  if (href.startsWith("/")) {
                    return (
                      <Link
                        key={item.label}
                        className={className}
                        href={href}
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.label}
                      </Link>
                    );
                  }

                  return (
                    <a
                      key={item.label}
                      className={className}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </a>
                  );
                })}
              </div>

              <button
                type="button"
                className="mt-3 block min-h-10 rounded-lg px-2 py-2 text-left text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4c09a]"
                onClick={() => {
                  setMobileOpen(false);
                  onContactClick?.();
                }}
              >
                Contact Us
              </button>

              <a
                href={signUpHref}
                target="_blank"
                rel="noreferrer"
                className={`mt-4 inline-flex min-h-11 items-center rounded-full px-6 py-2 text-sm font-semibold transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4c09a] ${
                  theme === "light" ? "bg-black text-white" : "bg-[#d4c09a] text-black"
                } shadow active:translate-y-0`}
                onClick={() => setMobileOpen(false)}
              >
                Get Started
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
