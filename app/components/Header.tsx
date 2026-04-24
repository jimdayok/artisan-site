"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Theme = "dark" | "light";

type NavItem = { label: string; href?: string; dividerBefore?: boolean };
type Dropdown = { label: string; items: NavItem[] };

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
      ? "px-4 py-2 text-sm font-medium rounded-full border border-black/10 bg-white/50 backdrop-blur-md text-black transition hover:bg-white/70 hover:border-black/20"
      : "px-4 py-2 text-sm font-medium rounded-full border border-white/15 bg-white/10 backdrop-blur-md text-white transition hover:bg-white/15 hover:border-white/25";

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
      ? "px-4 py-2 text-sm font-medium rounded-full border border-black/10 bg-white/50 backdrop-blur-md text-black transition hover:bg-white/70 hover:border-black/20 flex items-center gap-2"
      : "px-4 py-2 text-sm font-medium rounded-full border border-white/15 bg-white/10 backdrop-blur-md text-white transition hover:bg-white/15 hover:border-white/25 flex items-center gap-2";

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
                      className={itemCls}
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
                    className={itemCls}
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

export default function Header({ onContactClick }: { onContactClick?: () => void }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mobileOpen, setMobileOpen] = useState(false);

  const resources: Dropdown = useMemo(
    () => ({
      label: "Resources",
      items: [
        { label: "Professional Resources", href: "/provider-resources" },
        { label: "Patient Resources", href: "/patient-resources" },
      ],
    }),
    []
  );

  const labs: Dropdown = useMemo(
    () => ({
      label: "Our Labs",
      items: [
        { label: "Pacific Artisan Labs", href: "https://pacificartisanlabs.com" },
        { label: "Peak Artisan Labs", href: "https://peakartisanlabs.com" },
        { label: "Pike Artisan Labs", href: "https://pikeartisanlabs.com" },
        { label: "The Artisan Model", href: "/artisan-model", dividerBefore: true },
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

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000]">
      <div className={`pointer-events-none absolute inset-0 -z-10 ${headerBg} backdrop-blur-xl`} />

      <div className="mx-auto max-w-7xl px-5 md:px-8 lg:px-10">
        <div className="flex h-[72px] items-center justify-between gap-4 md:h-[76px]">
          <Link href="/" className="shrink-0 flex items-center" aria-label="Home">
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
            <Capsule href="/artisan-model" theme={theme}>
              The Artisan Model
            </Capsule>

            <DropdownMenu {...labs} theme={theme} onAnyClick={() => setMobileOpen(false)} />

            <DropdownMenu {...resources} theme={theme} onAnyClick={() => setMobileOpen(false)} />

            <Capsule theme={theme} onClick={onContactClick}>
              Contact Us
            </Capsule>

            <a
              href="https://form.typeform.com/to/quuPCSff"
              target="_blank"
              rel="noreferrer"
              className="ml-1 px-6 py-2 text-sm font-semibold rounded-full bg-[#d4c09a] text-black border border-[#d4c09a] shadow hover:opacity-90"
            >
              Get Started
            </a>
          </nav>

          <button
            className="lg:hidden p-2"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <Image
              src="/aln-icon.png"
              alt="Menu"
              width={260}
              height={260}
              className="h-9 w-9"
              style={{ filter: iconFilter }}
            />
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
                className="block text-sm font-semibold"
                href="/"
                onClick={() => setMobileOpen(false)}
              >
                Home
              </Link>
              <Link
                className="block text-sm font-semibold"
                href="/about"
                onClick={() => setMobileOpen(false)}
              >
                About Us
              </Link>
              <Link
                className="block text-sm font-semibold"
                href="/artisan-model"
                onClick={() => setMobileOpen(false)}
              >
                The Artisan Model
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
                        className="block text-sm font-semibold mt-2"
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <a
                        className="block text-sm font-semibold mt-2"
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
                  const className = "block text-sm font-semibold mt-2";

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
                className="block text-sm font-semibold mt-3 text-left"
                onClick={() => {
                  setMobileOpen(false);
                  onContactClick?.();
                }}
              >
                Contact Us
              </button>

              <a
                href="https://form.typeform.com/to/quuPCSff"
                target="_blank"
                rel="noreferrer"
                className={`mt-4 inline-flex rounded-full px-6 py-2 text-sm font-semibold ${
                  theme === "light" ? "bg-black text-white" : "bg-[#d4c09a] text-black"
                } shadow`}
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
