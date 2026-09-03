"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Building2, ChevronDown, Handshake, Mail, Menu, X, type LucideIcon } from "lucide-react";
import SiteButton from "./SiteButton";

type Theme = "dark" | "light";

type NavItem = { label: string; href?: string; dividerBefore?: boolean };
type Dropdown = { label: string; items: NavItem[] };

const CUSTOMER_PORTAL_URL = "/portal";
const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/artisanlabnetwork", icon: "/social/facebook.svg" },
  { label: "Instagram", href: "https://www.instagram.com/artisanlabnetwork", icon: "/social/instagram.svg" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/artisan-lab-network/", icon: "/social/linkedin.svg" },
];

function Capsule({
  children,
  href,
  theme,
  onClick,
  active = false,
}: {
  children: React.ReactNode;
  href?: string;
  theme: Theme;
  onClick?: () => void;
  active?: boolean;
}) {
  const base =
    theme === "light"
      ? `px-4 py-2 text-sm font-semibold rounded-lg border backdrop-blur-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a7654] focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
          active
            ? "border-[#8a7654]/45 bg-[#d4c09a]/35 text-black"
            : "border-black/10 bg-white/55 text-black hover:bg-white/80 hover:border-black/20"
        }`
      : `px-4 py-2 text-sm font-semibold rounded-lg border backdrop-blur-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4c09a] focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
          active
            ? "border-[#d4c09a]/55 bg-[#d4c09a]/18 text-white"
            : "border-white/15 bg-white/10 text-white hover:bg-white/15 hover:border-white/25"
        }`;

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
  active = false,
}: Dropdown & { theme: Theme; onAnyClick: () => void; active?: boolean }) {
  const [open, setOpen] = useState(false);

  const trigger =
    theme === "light"
      ? `px-4 py-2 text-sm font-semibold rounded-lg border backdrop-blur-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a7654] focus-visible:ring-offset-2 focus-visible:ring-offset-white flex items-center gap-2 ${
          active
            ? "border-[#8a7654]/45 bg-[#d4c09a]/35 text-black"
            : "border-black/10 bg-white/55 text-black hover:bg-white/80 hover:border-black/20"
        }`
      : `px-4 py-2 text-sm font-semibold rounded-lg border backdrop-blur-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4c09a] focus-visible:ring-offset-2 focus-visible:ring-offset-black flex items-center gap-2 ${
          active
            ? "border-[#d4c09a]/55 bg-[#d4c09a]/18 text-white"
            : "border-white/15 bg-white/10 text-white hover:bg-white/15 hover:border-white/25"
        }`;

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
        <ChevronDown className={`h-4 w-4 opacity-70 transition ${open ? "rotate-180" : ""}`} aria-hidden="true" />
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

function SocialLink({ label, href, icon, theme }: { label: string; href: string; icon: string; theme: Theme }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className={`grid h-11 w-11 place-items-center rounded-lg border backdrop-blur-md transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4c09a] ${
        theme === "light"
          ? "border-black/10 bg-white/55 hover:bg-white"
          : "border-white/15 bg-white/10 hover:border-white/25 hover:bg-white/15"
      }`}
    >
      <Image src={icon} alt="" width={18} height={18} className={theme === "light" ? "opacity-80" : "brightness-0 invert opacity-90"} />
    </a>
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
  const pathname = usePathname();

  const resources: Dropdown = useMemo(
    () => ({
      label: "Resources",
      items: [
        { label: "Professional Resources", href: "/provider-resources" },
        { label: "Patient Resources", href: "/patient-resources" },
        { label: "Optical Engineering Center", href: "/optical-engineering" },
        { label: "Freedom of Choice", href: "/advocacy" },
        { label: "Doctor Owned Labs", href: "/artisan-model" },
        { label: "New Partner Setup", href: "/new-lab-partner", dividerBefore: true },
        { label: "Customer Portal", href: CUSTOMER_PORTAL_URL },
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

  const navIsActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  const dropdownIsActive = (dropdown: Dropdown) =>
    dropdown.items.some((item) => item.href?.startsWith("/") && navIsActive(item.href));

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

  const handleMobileIconClick = () => {
    setMobileOpen((v) => !v);
  };

  const handleContactClick = () => {
    if (onContactClick) {
      onContactClick();
      return;
    }

    window.location.href = "mailto:info@artisanlabnetwork.com";
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
              preload
              className="h-12 w-auto md:h-[60px]"
              style={{
                maxHeight: 62,
                filter: logoFilter,
              }}
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-2">
            <Capsule href="/" theme={theme} active={navIsActive("/")}>
              Home
            </Capsule>
            <Capsule href="/about" theme={theme} active={navIsActive("/about")}>
              About
            </Capsule>
            <DropdownMenu {...labs} theme={theme} active={dropdownIsActive(labs)} onAnyClick={() => setMobileOpen(false)} />
            <DropdownMenu {...resources} theme={theme} active={dropdownIsActive(resources)} onAnyClick={() => setMobileOpen(false)} />
            <Capsule theme={theme} onClick={handleContactClick}>
              Contact
            </Capsule>
            <SiteButton href={signUpHref} variant="primary" size="sm" icon={Handshake} className="ml-1" external>
              Partner With Us
            </SiteButton>
            <div className="ml-1 flex items-center gap-2">
              {socialLinks.map((item) => (
                <SocialLink key={item.label} {...item} theme={theme} />
              ))}
            </div>
          </nav>

          <button
            className={`grid h-11 w-11 place-items-center rounded-lg border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4c09a] lg:hidden ${
              theme === "light"
                ? "border-black/10 bg-white/60 text-[#142033] hover:bg-white"
                : "border-white/15 bg-white/10 text-white hover:bg-white/15"
            }`}
            onClick={handleMobileIconClick}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
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
            } max-h-[calc(100dvh-72px)] overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)] backdrop-blur-xl`}
          >
            <div className="mx-auto max-w-7xl px-5 py-5">
              <div className="grid gap-2">
                <SiteButton href={signUpHref} variant={theme === "light" ? "dark" : "primary"} icon={Handshake} onClick={() => setMobileOpen(false)} external>
                  Partner With Us
                </SiteButton>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <MobileLinkGroup title="Our Labs" icon={Building2} items={labs.items} theme={theme} onAnyClick={() => setMobileOpen(false)} />
                <MobileLinkGroup title="Resources" icon={BookOpen} items={resources.items} theme={theme} onAnyClick={() => setMobileOpen(false)} />
              </div>

              <div className={`mt-5 flex flex-wrap gap-2 border-t pt-4 ${theme === "light" ? "border-black/10" : "border-white/12"}`}>
                <Link
                  className="inline-flex min-h-11 items-center rounded-full border border-transparent px-4 text-sm font-semibold transition hover:border-current/15 hover:bg-current/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4c09a]"
                  href="/"
                  onClick={() => setMobileOpen(false)}
                >
                  Home
                </Link>
                <Link
                  className="inline-flex min-h-11 items-center rounded-full border border-transparent px-4 text-sm font-semibold transition hover:border-current/15 hover:bg-current/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4c09a]"
                  href="/about"
                  onClick={() => setMobileOpen(false)}
                >
                  About
                </Link>
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-transparent px-4 text-left text-sm font-semibold transition hover:border-current/15 hover:bg-current/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4c09a]"
                  onClick={() => {
                    setMobileOpen(false);
                    handleContactClick();
                  }}
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Contact
                </button>
                {socialLinks.map((item) => (
                  <SocialLink key={item.label} {...item} theme={theme} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function MobileLinkGroup({
  title,
  icon: Icon,
  items,
  theme,
  onAnyClick,
}: {
  title: string;
  icon: LucideIcon;
  items: NavItem[];
  theme: Theme;
  onAnyClick: () => void;
}) {
  const linkClass =
    theme === "light"
      ? "flex min-h-11 items-center rounded-lg px-3 py-2 text-sm font-semibold text-black/78 transition hover:bg-black/5 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a7654]"
      : "flex min-h-11 items-center rounded-lg px-3 py-2 text-sm font-semibold text-white/82 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4c09a]";

  return (
    <section>
      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] opacity-60">
        <Icon className="h-4 w-4" aria-hidden="true" />
        {title}
      </div>
      <div className="grid gap-1">
        {items.map((item) => {
          const href = item.href ?? "#";
          const spacer = item.dividerBefore ? (
            <div className={`my-1 border-t ${theme === "light" ? "border-black/10" : "border-white/12"}`} />
          ) : null;

          if (href.startsWith("/")) {
            return (
              <div key={item.label}>
                {spacer}
                <Link href={href} className={linkClass} onClick={onAnyClick}>
                  {item.label}
                </Link>
              </div>
            );
          }

          return (
            <div key={item.label}>
              {spacer}
              <a href={href} className={linkClass} onClick={onAnyClick}>
                {item.label}
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
