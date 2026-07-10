"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Header from "./components/Header";
import Footer from "./components/Footer";

const ACCOUNT_APPLICATION_URL = "https://form.typeform.com/to/quuPCSff";
const CONTACT_FORM_URL = "https://form.typeform.com/to/m0lQ9zjD";
const CAPABILITY_AUTO_COLLAPSE_MS = 9000;
const PROOF_STAT_ROTATION_MS = 4200;

const heroPaths = [
  {
    title: "I’m learning about the Artisan Lab Network",
    body: "See how our connected labs support independent practices with more choice, better service, and stronger partnership.",
    cta: "Explore the Network",
    href: "#proof",
  },
  {
    title: "I’m an Artisan Partner looking for resources",
    body: "Find product guides, training, ordering tools, patient resources, and support materials.",
    cta: "Visit Partner Resources",
    href: "/provider-resources",
  },
];

const heroSignals = [
  { value: "3 Labs", label: "Connected network" },
  { value: "U.S.", label: "Production focus" },
  { value: "Doctor-owned", label: "Independent model" },
];

const heroTrustNotes = [
  "Freedom to choose lens designs",
  "Faster, clearer lab communication",
  "A partner model built for independent practices",
];

const eventCards = [
  {
    name: "UOA Leadership Conference",
    date: "June 25–27, 2026",
    location: "Chicago, IL",
    description:
      "Opticians and industry leaders gather to explore innovation, leadership, and the future of opticianry.",
    logo: "/uoa-logo.jpg",
    logoAlt: "UOA Leadership Conference logo",
    href: "https://www.uoaleadership.org/",
  },
  {
    name: "Vision Council 2026 Lab Leadership Forum",
    date: "Sept. 16 to 18, 2026",
    location: "M Resort Spa Casino, Henderson, NV",
    description:
      "Tailored educational sessions, networking, and industry insights for optical lab professionals.",
    logo: "/logos/TheVisionCouncil-logo-IAPB-Member.png",
    logoAlt: "The Vision Council logo",
    href: "https://thevisioncouncil.org/lab-leadership-forum-2026",
  },
];

const industryConnectionLogos = [
  { src: "/logos/VSP_Vision_Logotype_RGB_Blk.png", alt: "VSP Vision", href: "https://vspvision.com/" },
  { src: "/logos/nbn-logo.png", alt: "Northwest Administrators", href: "https://www.nwadmin.com/" },
  { src: "/logos/acquios-alliance.png", alt: "Acquios Alliance", href: "https://acquios.com/services/acquios-alliance/" },
  { src: "/logos/TheVisionCouncil-logo-IAPB-Member.png", alt: "The Vision Council", href: "https://thevisioncouncil.org/" },
  { src: "/logos/ultimate-partners.png", alt: "Vision Monday Ultimate Partners", href: "https://visionmonday.com" },
];

const systemsIntegrationLogos = [
  { src: "/logos/crystal", alt: "Crystal Practice Management" },
  { src: "/logos/officemate.png", alt: "OfficeMate" },
  { src: "/logos/compulink.png", alt: "Compulink" },
  { src: "/logos/eyefinitypm.png", alt: "Eyefinity Practice Management" },
  { src: "/logos/revolution.png", alt: "RevolutionEHR" },
  { src: "/logos/barti.png", alt: "Barti" },
  { src: "/logos/eyecloudpro.png", alt: "Eye Cloud Pro" },
];

const proofStats = [
  {
    id: "turnaround",
    value: 3.5,
    start: 9.9,
    suffix: "",
    decimals: 1,
    label: "Average Turnaround",
    hover: "3.5 business day average turnaround across the entire network - April 2026",
  },
  {
    id: "fourth-day",
    value: 84,
    start: 50,
    suffix: "%",
    decimals: 0,
    label: "Orders Shipped by the 4th Day",
    hover: "84% of all orders shipped by the fourth business day - April 2026",
  },
  {
    id: "remake",
    value: 98.5,
    start: 75,
    suffix: "%",
    decimals: 1,
    label: "Quality Standard",
    hover: "1.5% lab remake rate, approximately half of typical labs - YTD 2026",
  },
  {
    id: "service",
    value: "4.9/5.0",
    label: "Customer Service",
    hover: "Based on 2024-2025 customer feedback survey",
    rating: true,
  },
  {
    id: "production",
    value: "U.S.",
    label: "U.S. Production Focus",
    hover: "Core production is handled in the United States with a focus on quality, service, and control.",
    flagIcon: true,
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: "easeOut" },
} as const;

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.08,
    },
  },
} as const;

const cardReveal = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.48, ease: "easeOut" },
} as const;

const partnerBrands = [
  {
    name: "Artisan Designs & Treatments",
    logo: "/aln-icon.png",
    href: "/provider-resources/professional-resources#artisan",
    logoClass: "max-h-14 w-14",
    cardLabel: "Artisan Design Series",
  },
  {
    name: "IOT",
    logo: "/iot-logo.png",
    href: "/provider-resources/professional-resources#iot",
    logoClass: "max-h-16 w-[78%]",
  },
  {
    name: "Tokai",
    logo: "/tokai-logo.png",
    href: "/provider-resources#tokai",
    logoClass: "max-h-16 w-[80%]",
  },
  {
    name: "Hoya",
    logo: "/hoya-logo.png",
    href: "/provider-resources/professional-resources#hoya",
    logoClass: "max-h-[62px] w-[90%]",
  },
  {
    name: "Varilux / Essilor",
    logo: "/varilux-logo.png",
    href: "/provider-resources/professional-resources#varilux",
    logoClass: "max-h-[56px] w-[96%]",
  },
  {
    name: "Shamir",
    logo: "/shamir-logo.png",
    href: "/provider-resources/professional-resources#shamir",
    logoClass: "max-h-16 w-[82%]",
  },
  {
    name: "Unity",
    logo: "/unity-logo.png",
    href: "/provider-resources/professional-resources#unity",
    logoClass: "max-h-[60px] w-[80%]",
  },
  {
    name: "Newton / Neurolens",
    logo: "/neurolens-logo.png",
    href: "/provider-resources/professional-resources#newton",
    logoClass: "max-h-[62px] w-[88%]",
  },
  {
    name: "Younger Optics",
    logo: "/younger-optics-logo.png",
    href: "/provider-resources/professional-resources#younger-optics",
    logoClass: "max-h-[62px] w-[92%]",
  },
  {
    name: "Chemistrie",
    logo: "/chemistrie-logo.png",
    href: "/provider-resources#chemistrie",
    logoClass: "max-h-[62px] w-[90%]",
  },
];

const capabilities = [
  {
    title: "Freeform lens options",
    icon: "/icons/artisan/freedom-to-choose.svg",
    detail:
      "Practice control starts with choice. ALN gives independent practices access to the lens brands and design families they already trust, so recommendations can be based on the patient instead of a forced path.",
    brands: partnerBrands,
  },
  {
    title: "AR treatments",
    icon: "/icons/artisan/transparency.svg",
    detail:
      "Artisan AR treatments and TechShield AR treatments are produced on site. Additional access is available to Hoya, Shamir, Glacier, and Tokai AR options.",
  },
  {
    title: "Fast turnaround",
    icon: "/icons/artisan/fast-turnaround.svg",
    detail:
      "Connected production across the network helps improve turnaround, consistency, and confidence for practices and patients.",
  },
  {
    title: "Systems integrations",
    icon: "/icons/artisan/integrated-systems.svg",
    detail:
      "ALN supports practical ordering paths across common practice systems, open ordering tools, and custom workflows.",
    integrations: systemsIntegrationLogos,
  },
  {
    title: "Clear communication",
    icon: "/icons/artisan/clear-communication.svg",
    detail:
      "We provide clear and transparent WIP reports, access to real-time order information, and chat features with the lab.",
  },
  {
    title: "Quality control you can count on",
    icon: "/icons/artisan/quality-control.svg",
    // Claim is supported by internal/source data; keep verification package ready before final publish.
    detail:
      "We maintain a satisfaction rate above 98% and rank in the top third of DVI labs for low remake rates according to published data.",
  },
  {
    title: "Support that scales with you",
    icon: "/icons/artisan/practice-control.svg",
    detail:
      "Comprehensive Artisan Intel reports, regular training programs, and strong resources for opticians and staff.",
  },
  {
    title: "A partner mindset",
    icon: "/icons/artisan/partner-mindset.svg",
    detail:
      "We are the largest doctor-owned lab network in the United States. That means we do not just support optometry. We are optometry.",
  },
];

const homeLabs = [
  {
    id: "pacific",
    city: "Portland",
    state: "OR",
    label: "Pacific Artisan Labs",
    logo: "/logos/PAL_2C_White_Black.png",
    logoAlt: "Pacific Artisan Labs logo",
    logoPanel: "dark",
    description:
      "The original Artisan lab, serving independent practices with full-service production, responsive customer service, and strong regional relationships.",
    address: ["12302 NE Marx St.", "Portland, OR 97230"],
    meetHref: "/pacific-artisan-labs",
    phone: "877.390.6900",
    phoneHref: "8773906900",
    email: "customerservice@pacificartisanlabs.com",
    position: { left: "19%", top: "33%" },
  },
  {
    id: "peak",
    city: "Aurora",
    state: "CO",
    label: "Peak Artisan Labs",
    logo: "/logos/Peak_Artisan_Logo 9-1-23_FINAL.png",
    logoAlt: "Peak Artisan Labs logo",
    logoPanel: "light",
    description:
      "A Colorado-based Artisan lab bringing local support, finishing expertise, and practical service to independent practices across the mountain region.",
    address: ["3568 Peoria St., Suite 608", "Aurora, CO 80010"],
    meetHref: "/peak-artisan-labs",
    phone: "833.690.4321",
    phoneHref: "8336904321",
    email: "customerservice@peakartisanlabs.com",
    position: { left: "44%", top: "51%" },
  },
  {
    id: "pike",
    city: "Indianapolis",
    state: "IN",
    label: "Pike Artisan Labs",
    logo: "/logos/Pike_Labs_Logo-4C.png",
    logoAlt: "Pike Artisan Labs logo",
    logoPanel: "light",
    description:
      "The central U.S. Artisan lab, built to add speed, flexibility, and personal support for practices that want a better lab relationship.",
    address: ["8902 Vincennes Cir., Suite F", "Indianapolis, IN 46268"],
    meetHref: "/pike-artisan-labs",
    phone: "888.239.0303",
    phoneHref: "8882390303",
    email: "customerservice@pikeartisanlabs.com",
    position: { left: "67%", top: "43%" },
  },
];

function ArtisanIcon({
  src,
  tone = "gold",
  size = "md",
  className = "",
}: {
  src: string;
  tone?: "gold" | "cream";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass =
    size === "lg" ? "h-9 w-9" : size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const toneClass =
    tone === "cream"
      ? "[filter:brightness(0)_saturate(100%)_invert(86%)_sepia(15%)_saturate(545%)_hue-rotate(356deg)_brightness(91%)_contrast(89%)]"
      : "[filter:brightness(0)_saturate(100%)_invert(53%)_sepia(17%)_saturate(815%)_hue-rotate(358deg)_brightness(90%)_contrast(88%)]";

  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-2xl border transition duration-300 ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className={`${sizeClass} object-contain opacity-90 transition duration-300 group-hover:scale-105 ${toneClass}`}
      />
    </span>
  );
}

function RatingStars() {
  return (
    <div className="flex items-center justify-center gap-1 text-[#d4c09a]/90" aria-label="4.5 out of 5 stars">
      {[0, 1, 2, 3].map((star) => (
        <svg key={star} viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 drop-shadow-[0_1px_6px_rgba(212,192,154,0.18)]">
          <path
            fill="currentColor"
            d="m12 2.8 2.72 5.52 6.09.88-4.4 4.29 1.04 6.06L12 16.68l-5.45 2.87 1.04-6.06-4.4-4.29 6.09-.88L12 2.8Z"
          />
        </svg>
      ))}
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 drop-shadow-[0_1px_6px_rgba(212,192,154,0.18)]">
        <defs>
          <linearGradient id="service-rating-half-star">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="rgba(212,192,154,0.22)" />
          </linearGradient>
        </defs>
        <path
          fill="url(#service-rating-half-star)"
          d="m12 2.8 2.72 5.52 6.09.88-4.4 4.29 1.04 6.06L12 16.68l-5.45 2.87 1.04-6.06-4.4-4.29 6.09-.88L12 2.8Z"
        />
      </svg>
    </div>
  );
}

function ProductionFlagIcon() {
  return (
    <svg
      viewBox="0 0 56 38"
      aria-hidden="true"
      className="h-10 w-14 text-[#d4c09a] drop-shadow-[0_10px_22px_rgba(212,192,154,0.12)]"
    >
      <path
        fill="currentColor"
        d="M6 5.5c0-.55.45-1 1-1h42c.55 0 1 .45 1 1v27c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-27Z"
        opacity="0.16"
      />
      <path
        fill="currentColor"
        d="M8 7h40v3H8V7Zm0 6h40v3H8v-3Zm0 6h40v3H8v-3Zm0 6h40v3H8v-3Zm0 6h40v2H8v-2Z"
        opacity="0.82"
      />
      <path fill="currentColor" d="M8 7h18v14H8V7Z" opacity="0.95" />
      <path
        fill="#171311"
        d="m12 10.2.62 1.25 1.38.2-1 .97.24 1.37L12 13.35l-1.24.64.24-1.37-1-.97 1.38-.2L12 10.2Zm6 0 .62 1.25 1.38.2-1 .97.24 1.37-1.24-.64-1.24.64.24-1.37-1-.97 1.38-.2L18 10.2Zm-3 5 .62 1.25 1.38.2-1 .97.24 1.37L15 18.35l-1.24.64.24-1.37-1-.97 1.38-.2L15 15.2Zm6 0 .62 1.25 1.38.2-1 .97.24 1.37-1.24-.64-1.24.64.24-1.37-1-.97 1.38-.2L21 15.2Z"
        opacity="0.8"
      />
    </svg>
  );
}

function AnimatedStatValue({
  stat,
  active,
}: {
  stat: (typeof proofStats)[number];
  active: boolean;
}) {
  const [display, setDisplay] = useState(
    typeof stat.value === "number" ? stat.start : stat.value
  );

  useEffect(() => {
    if (typeof stat.value !== "number" || !active) return;

    let frame = 0;
    let raf = 0;
    const frames = 102;
    const start = stat.start ?? stat.value;
    const end = stat.value;

    const tick = () => {
      frame += 1;
      const progress = Math.min(frame / frames, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + (end - start) * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(() => {
      setDisplay(start);
      tick();
    });
    return () => cancelAnimationFrame(raf);
  }, [active, stat]);

  if ("flagIcon" in stat && stat.flagIcon) {
    return <ProductionFlagIcon />;
  }

  if (typeof stat.value !== "number") {
    return (
      <div className="text-3xl font-semibold tracking-tight text-[#d4c09a] md:text-[2.35rem]">
        <span className="whitespace-nowrap">{stat.value}</span>
      </div>
    );
  }

  return (
    <div className="text-3xl font-semibold tracking-tight text-[#d4c09a] md:text-[2.35rem]">
      <span className="whitespace-nowrap">
        {Number(display).toFixed(stat.decimals)}
        {stat.suffix}
      </span>
    </div>
  );
}

function ProofStatCard({
  stat,
  active,
  selected,
  onActivate,
}: {
  stat: (typeof proofStats)[number];
  active: boolean;
  selected: boolean;
  onActivate: () => void;
}) {
  return (
    <article
      tabIndex={0}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onClick={onActivate}
      className={`relative flex h-[180px] min-h-[180px] flex-col items-center justify-center overflow-hidden rounded-[24px] border bg-[linear-gradient(145deg,rgba(255,255,255,0.12),rgba(255,255,255,0.045))] p-5 text-center shadow-[0_22px_58px_rgba(0,0,0,0.28)] outline-none backdrop-blur-md transition duration-300 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-[#d4c09a]/50 ${
        selected ? "border-[#d4c09a]/60 bg-white/[0.09]" : "border-white/10 hover:border-[#d4c09a]/55 focus-visible:border-[#d4c09a]"
      }`}
      aria-label={`${stat.value} ${stat.label}. ${stat.hover}`}
    >
      <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      <div className="flex h-12 items-end justify-center">
        <AnimatedStatValue stat={stat} active={active} />
      </div>
      <div className="mt-3 h-5">
        {"rating" in stat && stat.rating ? <RatingStars /> : null}
      </div>
      <p className="mt-4 max-w-full text-center text-xs font-semibold uppercase leading-5 tracking-[0.14em] text-white/68">
        {stat.label}
      </p>
    </article>
  );
}

function HomeNetworkMap() {
  const [activeLabId, setActiveLabId] = useState<string | null>(null);
  const activeLab = activeLabId ? homeLabs.find((lab) => lab.id === activeLabId) ?? null : null;

  return (
    <section
      id="labs"
      data-theme="dark"
      className="relative overflow-hidden border-y border-white/10 bg-[#171311] px-6 py-16 text-white md:px-10 md:py-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(212,192,154,0.16),transparent_34%)]" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d4c09a]">
            Our Labs
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Three Labs. One Connected Standard.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/68 md:text-lg">
            View the full network, then choose a lab for local contact details and team information.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:items-stretch">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.055] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.30)] backdrop-blur-md md:p-6">
            <div className="relative mx-auto max-w-4xl">
              <Image
                src="/network-map.png"
                alt="Artisan Lab Network map"
                width={1600}
                height={875}
                className="mx-auto h-auto w-full object-contain"
              />
              {homeLabs.map((lab) => {
                const selected = activeLab?.id === lab.id;
                return (
                  <button
                    key={lab.id}
                    type="button"
                    onClick={() => setActiveLabId(lab.id)}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 transition ${selected ? "z-20" : "z-10 opacity-80 hover:opacity-100"}`}
                    style={lab.position}
                    aria-label={`Show ${lab.label}`}
                  >
                    <span className={`absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d4c09a]/20 blur-xl ${selected ? "opacity-100" : "opacity-70"}`} />
                    <span className={`relative block h-5 w-5 rounded-full bg-[#d4c09a] shadow-[0_0_28px_rgba(212,192,154,0.95)] ${selected ? "ring-8 ring-[#d4c09a]/18" : ""}`} />
                    <span className={`absolute left-7 top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] shadow-lg backdrop-blur-md sm:block ${
                      selected ? "border-[#d4c09a]/60 bg-[#d4c09a] text-black" : "border-white/10 bg-black/75 text-white"
                    }`}>
                      {lab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <motion.article
            key={activeLab?.id ?? "all-labs"}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className={`rounded-[28px] border p-5 shadow-[0_28px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl md:p-6 ${
              activeLab ? "border-white/10 bg-white/[0.065] text-white" : "border-white/10 bg-white/[0.065] text-white"
            }`}
          >
            {activeLab ? (
              <>
                <div className="flex h-32 items-center justify-center rounded-2xl border border-[#e6d9c8] bg-[#fbf8f3] px-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_18px_44px_rgba(0,0,0,0.22)]">
                  <Image
                    src={activeLab.id === "pacific" ? "/logos/PAL_2CTan.png" : activeLab.logo}
                    alt={activeLab.logoAlt}
                    width={360}
                    height={150}
                    className="max-h-20 w-auto max-w-full object-contain"
                  />
                </div>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.26em] text-[#d4c09a]">
                  {activeLab.city}, {activeLab.state}
                </p>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight">
                  {activeLab.label}
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/70">
                  {activeLab.description}
                </p>
                <div className="mt-6 grid gap-2 text-sm leading-6 text-white/72">
                  {activeLab.address.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                  <a href={`tel:${activeLab.phoneHref}`} className="font-semibold text-white transition hover:text-[#d4c09a]">
                    {activeLab.phone}
                  </a>
                  <a href={`mailto:${activeLab.email}`} className="break-words font-semibold text-white transition hover:text-[#d4c09a]">
                    {activeLab.email}
                  </a>
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={activeLab.meetHref}
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#d4c09a] px-5 py-2.5 text-sm font-semibold text-[#171311] transition hover:bg-[#e2cca2]"
                  >
                    Meet Your Lab
                  </a>
                  <a
                    href={`mailto:${activeLab.email}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 bg-white/8 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-[#d4c09a]/55 hover:bg-[#d4c09a] hover:text-[#171311]"
                  >
                    Email Customer Service
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveLabId(null)}
                  className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/72 transition hover:border-[#d4c09a]/55 hover:bg-white/[0.08] hover:text-white"
                >
                  View All Labs
                </button>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#d4c09a]">
                  Network View
                </p>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight">
                  All Artisan Labs
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/70">
                  Three regional labs operate with one connected standard for service, quality, and independent practice support.
                </p>
                <div className="mt-6 grid gap-3">
                  {homeLabs.map((lab) => (
                    <button
                      key={lab.id}
                      type="button"
                      onClick={() => setActiveLabId(lab.id)}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-4 text-left transition hover:border-[#d4c09a]/55 hover:bg-white/[0.09]"
                    >
                      <span>
                        <span className="block font-semibold text-white">{lab.label}</span>
                        <span className="mt-1 block text-sm text-white/58">{lab.city}, {lab.state}</span>
                      </span>
                      <span className="text-[#d4c09a]" aria-hidden="true">→</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </motion.article>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [showHeroBox, setShowHeroBox] = useState(true);
  const [activeCapability, setActiveCapability] = useState<string | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const proofRef = useRef<HTMLElement | null>(null);
  const [proofInView, setProofInView] = useState(false);
  const [activeProofStatId, setActiveProofStatId] = useState(proofStats[0].id);
  const [isProofStatHovering, setIsProofStatHovering] = useState(false);

  useEffect(() => {
    if (activeCapability === null) return;
    const timer = setTimeout(() => setActiveCapability(null), CAPABILITY_AUTO_COLLAPSE_MS);
    return () => clearTimeout(timer);
  }, [activeCapability]);

  useEffect(() => {
    const section = proofRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setProofInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!proofInView || isProofStatHovering) return;

    const timer = window.setInterval(() => {
      setActiveProofStatId((currentId) => {
        const currentIndex = proofStats.findIndex((stat) => stat.id === currentId);
        const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % proofStats.length;
        return proofStats[nextIndex].id;
      });
    }, PROOF_STAT_ROTATION_MS);

    return () => window.clearInterval(timer);
  }, [proofInView, isProofStatHovering]);

  const activeProofStat =
    proofStats.find((stat) => stat.id === activeProofStatId) ?? proofStats[0];

  const openContactModal = () => {
    setIsContactModalOpen(true);
  };

  useEffect(() => {
    if (!isContactModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsContactModalOpen(false);
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isContactModalOpen]);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <Header onContactClick={openContactModal} />

      {/* HERO */}
      <section
        id="top"
        data-theme="dark"
        className="relative z-20 min-h-[100svh] overflow-hidden bg-black"
      >
        <div className="absolute inset-0">
          <video className="h-full w-full object-cover object-center md:hidden" autoPlay loop muted playsInline preload="metadata" poster="/backgroundimage.jpeg">
            <source src="https://pub-92e180f20b704255b9a7625dd6a6cb0b.r2.dev/hero-vertical.mp4" type="video/mp4" />
          </video>
          <video className="hidden h-full w-full object-cover object-center md:block" autoPlay loop muted playsInline preload="metadata" poster="/backgroundimage.jpeg">
            <source src="https://pub-92e180f20b704255b9a7625dd6a6cb0b.r2.dev/hero.mp4" type="video/mp4" />
          </video>
        </div>
        <div className={`pointer-events-none absolute inset-0 transition-colors duration-500 ${showHeroBox ? "bg-black/54" : "bg-transparent"}`} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/55 via-black/15 to-transparent" />
        <div className="pointer-events-none absolute inset-0 opacity-80" style={{ backgroundImage: "radial-gradient(circle at 50% 22%, rgba(212,192,154,0.2), transparent 28%), radial-gradient(circle at 82% 70%, rgba(255,255,255,0.08), transparent 22%)" }} />

        <div className="relative z-20 flex min-h-[100svh] items-center justify-center px-5 pb-20 pt-24 text-center md:px-6 md:pb-24 md:pt-28">
          <AnimatePresence mode="wait">
            {showHeroBox ? (
              <motion.div
                key="hero-question"
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="relative w-full max-w-5xl overflow-hidden rounded-[30px] border border-white/15 bg-[linear-gradient(145deg,rgba(0,0,0,0.60),rgba(10,10,10,0.42))] px-5 py-5 text-center shadow-[0_28px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl md:px-7 md:py-7"
              >
                <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
                <div className="pointer-events-none absolute -right-20 top-8 h-48 w-48 rounded-full bg-[#d4c09a]/10 blur-3xl" />
                <button
                  type="button"
                  onClick={() => setShowHeroBox(false)}
                  aria-label="Close hero message and watch the video"
                  className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/10 text-white/72 transition hover:border-white/30 hover:bg-white/18 hover:text-white"
                >
                  <span aria-hidden="true" className="text-xl leading-none">
                    ×
                  </span>
                </button>

                <div className="mx-auto max-w-3xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#d4c09a]">
                    Artisan Lab Network
                  </p>
                  <h1 className="mt-3 text-3xl font-semibold leading-tight md:mt-4 md:text-[3.8rem]">
                    What brought you to Artisan?
                  </h1>
                  <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/74 md:mt-4 md:text-lg md:leading-7">
                    Choose the path that fits you best and we&apos;ll help you find the right next step.
                  </p>
                </div>

                <div className="mx-auto mt-5 grid max-w-3xl gap-3 sm:grid-cols-3">
                  {heroSignals.map((signal) => (
                    <div
                      key={signal.label}
                      className="rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-center shadow-[0_10px_28px_rgba(0,0,0,0.18)]"
                    >
                      <div className="text-lg font-semibold text-[#f3e7cf] md:text-xl">
                        {signal.value}
                      </div>
                      <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/54">
                        {signal.label}
                      </div>
                    </div>
                  ))}
                </div>

                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="whileInView"
                  className="mt-5 grid gap-3 md:mt-7 md:grid-cols-2"
                >
                  {heroPaths.map((path) => (
                    <motion.a
                      key={path.title}
                      href={path.href}
                      variants={cardReveal}
                      className="group relative flex min-h-0 flex-col overflow-hidden rounded-[22px] border border-white/12 bg-[linear-gradient(160deg,rgba(255,255,255,0.11),rgba(255,255,255,0.05))] p-4 text-left shadow-[0_14px_44px_rgba(0,0,0,0.20)] transition duration-300 hover:-translate-y-1 hover:border-[#d4c09a]/55 hover:bg-white/[0.105] md:min-h-[172px] md:p-5"
                    >
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d4c09a]/90">
                        {path.href.startsWith("/") ? "Existing partner path" : "New to Artisan"}
                      </div>
                      <h2 className="text-lg font-semibold leading-tight text-white md:text-2xl">
                        {path.title}
                      </h2>
                      <p className="mt-2 hidden flex-1 text-sm leading-6 text-white/66 sm:block md:mt-3">
                        {path.body}
                      </p>
                      <div className="mt-4 inline-flex w-fit items-center rounded-full border border-[#d4c09a]/35 bg-[#d4c09a] px-4 py-2.5 text-sm font-semibold text-black transition group-hover:bg-[#e2cca2] md:mt-5">
                        {path.cta}
                        <span className="ml-2 transition group-hover:translate-x-0.5">→</span>
                      </div>
                    </motion.a>
                  ))}
                </motion.div>

                <div className="mt-5 flex flex-col items-center justify-center gap-3 border-t border-white/10 pt-4 sm:flex-row sm:flex-wrap md:mt-6 md:pt-5">
                  <a
                    href={ACCOUNT_APPLICATION_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#d4c09a] px-6 py-3 text-sm font-semibold text-black shadow-[0_12px_34px_rgba(212,192,154,0.18)] transition hover:-translate-y-0.5 hover:bg-[#e2cca2]"
                  >
                    Open An Account
                  </a>
                  <p className="text-sm leading-6 text-white/58">
                    Are you a doctor interested in deeper partnership?{" "}
                    <Link
                      href="/artisan-model"
                      className="font-semibold text-[#d4c09a] underline decoration-[#d4c09a]/45 underline-offset-4 transition hover:text-white"
                    >
                      Learn about our unique lab model.
                    </Link>
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-white/10 pt-4 text-[11px] font-medium uppercase tracking-[0.18em] text-white/50">
                  {heroTrustNotes.map((note) => (
                    <span key={note} className="inline-flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#d4c09a]/85" />
                      {note}
                    </span>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
        <a
          href="#proof"
          className="absolute bottom-4 left-1/2 z-30 inline-flex -translate-x-1/2 items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55 transition hover:text-[#d4c09a]"
          aria-label="Scroll to Why We Win section"
        >
          <span className="h-px w-10 bg-white/28" />
          <span>Scroll</span>
          <span className="h-px w-10 bg-white/28" />
        </a>
      </section>

      <AnimatePresence initial={false}>
        {!showHeroBox ? (
          <motion.section
            key="hero-note"
            data-theme="light"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative z-10 border-b border-[#d6c3a1]/35 bg-[#f5f1eb] px-5 py-5 text-[#1f1a17] md:px-8 md:py-6"
          >
            <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-[22px] border border-black/10 bg-white/66 px-5 py-4 shadow-[0_14px_36px_rgba(31,26,23,0.07)] backdrop-blur-md sm:flex-row sm:items-center sm:gap-5 md:px-6">
              <div className="flex shrink-0 items-center sm:w-28 sm:justify-center">
                <Image
                  src="/iot-logo.png"
                  alt="IOT"
                  width={160}
                  height={74}
                  className="h-auto w-20 object-contain sm:w-24"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold leading-snug tracking-normal text-[#1f1a17] md:text-lg">
                  Discover Camber Pure from IOT
                </h2>
                <p className="mt-1.5 text-sm leading-6 text-[#625b53]">
                  Camber Pure is an advanced progressive lens technology designed to improve the visual experience for patients who need more from their lenses.
                </p>
              </div>
              <div className="shrink-0 sm:text-right">
                <Link
                  href="/provider-resources#iot"
                  className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#d6c3a1]/65 bg-[#fffaf2]/80 px-4 py-2 text-sm font-semibold text-[#8a7654] shadow-[0_8px_22px_rgba(31,26,23,0.05)] transition hover:border-[#8a7654]/45 hover:bg-white hover:text-[#1f1a17]"
                >
                  Learn more in Practice Resources
                </Link>
              </div>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <section
        id="proof"
        ref={proofRef}
        data-theme="dark"
        className="relative scroll-mt-24 border-y border-white/10 bg-[#171311] px-6 py-14 text-white md:px-10 md:py-18"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(212,192,154,0.14),transparent_28%),radial-gradient(circle_at_82%_78%,rgba(255,255,255,0.08),transparent_22%)]" />
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="grid min-w-0 gap-9 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-center">
            <div className="min-w-0 max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d4c09a]">
                Why We Win
              </p>
              <h2 className="mt-4 text-[clamp(2rem,10vw,3.4rem)] font-semibold leading-[1.08] tracking-tight">
                Performance your team can actually feel.
              </h2>
              <p className="mt-4 text-base leading-8 text-white/68">
                Practices need a lab relationship they can feel in turnaround, communication, quality, and control.
              </p>
              <div className="mobile-scroll-row mt-6 flex max-w-full items-center gap-3 overflow-x-auto rounded-full border border-white/10 bg-white/[0.055] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/54 shadow-[0_12px_34px_rgba(0,0,0,0.16)]">
                <span className="text-[#d4c09a]">Measured</span>
                <span className="h-1 w-1 rounded-full bg-white/25" />
                <span>Turnaround</span>
                <span className="h-1 w-1 rounded-full bg-white/25" />
                <span>Quality</span>
                <span className="h-1 w-1 rounded-full bg-white/25" />
                <span>Service</span>
              </div>
            </div>
            <div
              className="grid min-w-0 gap-4"
              onMouseEnter={() => setIsProofStatHovering(true)}
              onMouseLeave={() => setIsProofStatHovering(false)}
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {proofStats.map((stat) => (
                  <ProofStatCard
                    key={stat.id}
                    stat={stat}
                    active={proofInView}
                    selected={activeProofStatId === stat.id}
                    onActivate={() => setActiveProofStatId(stat.id)}
                  />
                ))}
              </div>
              <div className="min-h-[72px] rounded-[18px] border border-white/10 bg-white/[0.055] px-5 py-4 shadow-[0_18px_48px_rgba(0,0,0,0.18)] backdrop-blur-md">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeProofStat.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d4c09a]">
                      {activeProofStat.label}
                    </p>
                    <p className="mt-1.5 text-sm leading-6 text-white/72">
                      {activeProofStat.hover}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PROBLEM */}
      <section
        data-theme="dark"
        className="relative overflow-hidden bg-[#0f0c0b] px-6 py-16 md:px-10 md:py-20"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(212,192,154,0.15),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.045),transparent_42%)]" />
        <div
          className="pointer-events-none absolute -right-28 top-2 h-[460px] w-[460px] rounded-full opacity-[0.16] blur-[0.2px]"
          style={{
            backgroundImage:
              "repeating-radial-gradient(circle at center, transparent 0 48px, rgba(212,192,154,0.28) 49px 51px, transparent 52px 86px)",
            maskImage: "radial-gradient(circle at center, black 0 58%, transparent 76%)",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-20 top-24 h-[260px] w-[260px] rounded-full border border-[#d4c09a]/10 opacity-50"
          style={{
            boxShadow: "0 0 0 42px rgba(212,192,154,0.035), 0 0 0 86px rgba(212,192,154,0.025)",
          }}
          aria-hidden="true"
        />
        <div className="relative z-20 mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <motion.div {...fadeUp}>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d4c09a]">
              Corporate Lab Problem
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Corporate systems were never built for your independence.
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/68">
              Corporate labs can look safe from the outside. But many are owned by multinational corporations built to protect their own systems, not your independence.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-3 sm:grid-cols-2"
          >
            {[
              "Restricted product choice",
              "Pricing pressure that keeps pushing down",
              "Slow or inconsistent turnaround",
              "Poor communication and surprise delays",
              "Policies that make your team feel boxed in",
            ].map((item) => (
              <motion.div
                key={item}
                variants={cardReveal}
                className="min-h-[154px] rounded-[24px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.18)] backdrop-blur-md transition hover:-translate-y-1 hover:border-[#d4c09a]/45 hover:bg-white/[0.08]"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d4c09a]">You feel it</div>
                <div className="mt-4 text-xl font-semibold leading-snug text-white">{item}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SOLUTION / HOW IT WORKS */}
      <section
        data-theme="light"
        className="relative overflow-hidden px-6 py-16 text-black md:px-10 md:py-20"
        style={{
          backgroundImage: "url('/backgroundwithglasses2.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-white/70" />
        <div
          className="pointer-events-none absolute -bottom-32 -right-24 h-[420px] w-[420px] bg-contain bg-center bg-no-repeat opacity-[0.07]"
          style={{ backgroundImage: "url('/rings.png')" }}
          aria-hidden="true"
        />
        <div className="relative z-20 mx-auto max-w-7xl">
          <div id="better-model" className="scroll-mt-24">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <motion.div {...fadeUp}>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8a7654]">
                  The Better Model
                </p>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">Built for practices that want control back.</h2>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-black/72">
                  Artisan Lab Network gives you freedom of choice, real partnership, and a modern system that fits the way you run your practice.
                </p>
              </motion.div>
              <motion.div
                {...fadeUp}
                className="relative min-h-[340px] overflow-hidden rounded-[28px] shadow-[0_24px_70px_rgba(49,39,26,0.16)]"
              >
                <Image
                  src="/images/business-meeting-discussion-2022-1.jpg"
                  alt="Independent practice partnership discussion"
                  fill
                  sizes="(min-width: 1024px) 48vw, 100vw"
                  className="object-cover"
                />
              </motion.div>
            </div>

            <motion.div
              {...fadeUp}
              className="mt-8 grid overflow-hidden rounded-[28px] border border-[#d6c3a1]/70 bg-white/82 shadow-[0_24px_64px_rgba(49,39,26,0.10)] backdrop-blur-md lg:grid-cols-[260px_1fr]"
            >
              <div className="flex items-center justify-center border-b border-[#d6c3a1]/55 bg-[#171311] p-8 text-center text-white lg:border-b-0 lg:border-r">
                <div className="flex flex-col items-center">
                  <Image
                    src="/icons/us-flag.svg"
                    alt=""
                    width={176}
                    height={118}
                    className="h-auto w-32 rounded-sm shadow-[0_16px_34px_rgba(0,0,0,0.24)] md:w-36"
                    aria-hidden="true"
                  />
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#d4c09a]">
                    U.S. Based
                  </p>
                </div>
              </div>
              <div className="p-6 md:p-8">
                <h3 className="text-2xl font-semibold tracking-tight text-[#1f1718] md:text-3xl">
                  Made Here. Built for Independent Practices.
                </h3>
                <p className="mt-4 text-base leading-8 text-[#625b53] md:text-lg">
                  Artisan Lab Network is based in the United States and focused on producing as much work as possible through U.S. labs. We are not chasing cheap offshore labor at the expense of quality, service, or the people who make great optical work possible.
                </p>
              </div>
            </motion.div>

            <motion.div
              {...fadeUp}
              className="mt-8 overflow-hidden rounded-[30px] border border-[#d6c3a1]/35 bg-[#171311] text-white shadow-[0_28px_80px_rgba(31,26,23,0.22)]"
            >
              <div className="relative px-6 py-8 md:px-8 md:py-10">
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.22]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 12% 10%, rgba(212,192,154,0.28), transparent 34%), radial-gradient(circle at 88% 80%, rgba(255,255,255,0.13), transparent 32%)",
                  }}
                  aria-hidden="true"
                />
                <div className="relative z-10 grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4c09a]">
                      From independence to control
                    </p>
                    <h3 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                      Made here matters most when it gives your practice more control.
                    </h3>
                    <p className="mt-4 max-w-3xl text-base leading-8 text-white/68 md:text-lg">
                      That is the point of the Artisan model: more real choices, cleaner workflows, stronger lab communication, and support that helps your team serve patients without being boxed into a corporate system.
                    </p>
                  </div>
                  <a
                    href="#capabilities"
                    className="inline-flex min-h-12 w-fit items-center justify-center rounded-full border border-[#d4c09a]/40 bg-[#d4c09a] px-6 py-3 text-sm font-semibold text-[#171311] shadow-[0_14px_34px_rgba(212,192,154,0.18)] transition hover:-translate-y-0.5 hover:bg-[#e2cca2]"
                  >
                    See Practice Control
                    <span className="ml-2" aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section
        id="capabilities"
        data-theme="dark"
        className="relative px-6 py-16 md:px-10 md:py-20"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.18]"
          style={{
            backgroundImage: "url('/backgroundwithglasses2.jpeg')",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-black/88" />
        <div className="relative z-20 mx-auto max-w-7xl">
          <motion.div
            {...fadeUp}
            className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-[#d6c09a]">
                Capabilities
              </div>
              <h2 className="mt-2 text-4xl font-semibold md:text-5xl">
                Built for Real Practice Control.
              </h2>
            </div>

            <p className="max-w-md text-sm text-white/65">
              Click a capability to expand details. The selected capability comes forward while the rest stay in view.
            </p>
          </motion.div>

          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((cap) => {
              const isActive = activeCapability === cap.title;
              const isDimmed = activeCapability !== null && !isActive;

              return (
                <motion.div
                  key={cap.title}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className={`
                    pointer-events-auto group min-h-[166px] overflow-hidden rounded-[18px] border text-left
                    backdrop-blur-md transition-all duration-300
                    ${isActive ? "bg-white/12 border-[#d4c09a] shadow-2xl lg:col-span-2" : "bg-white/6 border-white/15"}
                    ${isDimmed ? "scale-[0.99] opacity-55 blur-[0.2px]" : "scale-100 opacity-100"}
                    hover:scale-[1.01] hover:bg-white/8
                  `}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setActiveCapability((prev) => (prev === cap.title ? null : cap.title))
                    }
                    className="block w-full cursor-pointer px-5 py-5 text-left"
                    aria-expanded={isActive}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <ArtisanIcon
                          src={cap.icon}
                          tone="cream"
                          size="sm"
                          className="h-12 w-12 border-[#d4c09a]/18 bg-[#d4c09a]/10"
                        />
                        <div>
                          <div className="text-xs uppercase tracking-[0.28em] text-[#d4c09a]">
                            Capability
                          </div>
                          <div className="mt-3 text-lg font-semibold leading-snug text-white md:text-xl">
                            {cap.title}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 text-xs text-white/55">
                        {isActive ? "Close" : "Open"}
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        key="details"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22 }}
                        className="pointer-events-auto mx-5 mb-5 border-t border-white/10 pt-4"
                      >
                        <p className="text-sm leading-6 text-white/78 md:text-base">
                          {cap.detail}
                        </p>

                        {"brands" in cap && cap.brands ? (
                          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                            {cap.brands.map((brand) => (
                              <Link
                                key={brand.name}
                                href={brand.href}
                                className={`group/logo flex h-24 items-center justify-center rounded-2xl border border-white/10 bg-white px-4 py-4 shadow-[0_12px_30px_rgba(0,0,0,0.14)] transition hover:-translate-y-0.5 hover:border-[#d4c09a] ${
                                  brand.cardLabel ? "flex-col" : ""
                                }`}
                                aria-label={`View ${brand.name} resources`}
                              >
                                <Image
                                  src={brand.logo}
                                  alt={`${brand.name} logo`}
                                  width={220}
                                  height={80}
                                  className={`${brand.logoClass} object-contain transition group-hover/logo:scale-[1.02]`}
                                />
                                {brand.cardLabel ? (
                                  <span className="mt-2 text-center text-[12.5px] font-semibold leading-[1.2] text-[#1f1718]">
                                    {brand.cardLabel}
                                  </span>
                                ) : null}
                              </Link>
                            ))}
                          </div>
                        ) : null}

                        {"integrations" in cap && cap.integrations ? (
                          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {cap.integrations.map((logo) => (
                              <div
                                key={logo.alt}
                                className="flex h-20 items-center justify-center rounded-2xl border border-white/10 bg-white px-3 shadow-[0_12px_30px_rgba(0,0,0,0.14)]"
                              >
                                <Image
                                  src={logo.src}
                                  alt={logo.alt}
                                  width={210}
                                  height={90}
                                  className="max-h-11 w-auto max-w-full object-contain"
                                />
                              </div>
                            ))}
                            <div className="flex h-20 items-center justify-center rounded-2xl border border-[#d4c09a]/35 bg-[#d4c09a]/12 px-3 text-center text-sm font-semibold text-[#d4c09a]">
                              and many more
                            </div>
                          </div>
                        ) : null}

                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* OUR LABS */}
      <HomeNetworkMap />

      <section
        id="where-well-be"
        data-theme="light"
        className="relative overflow-hidden bg-[#f5f1eb] px-6 py-16 text-[#1f1a17] md:py-20"
      >
        <div
          className="pointer-events-none absolute -left-28 top-8 h-[460px] w-[460px] bg-contain bg-center bg-no-repeat opacity-[0.08]"
          style={{ backgroundImage: "url('/rings.png')" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-40 right-0 h-[520px] w-[520px] bg-contain bg-center bg-no-repeat opacity-[0.045]"
          style={{ backgroundImage: "url('/rings.png')" }}
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto max-w-7xl">
          <motion.div
            {...fadeUp}
            className="grid gap-5 md:grid-cols-[0.85fr_1.15fr] md:items-end"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9a8564]">
                Industry Events
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
                Where We&apos;ll Be
              </h2>
            </div>
            <p className="max-w-3xl text-base leading-8 text-[#625b53] md:text-lg">
              Meet with our team at upcoming industry events and shows where we connect with customers, partners, and independent eye care professionals.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, amount: 0.16 }}
            className="mt-10 grid gap-5 lg:grid-cols-2"
          >
            {eventCards.map((event) => (
              <motion.article
                key={event.name}
                variants={cardReveal}
                className="group flex h-full flex-col rounded-[28px] border border-[#d8c6a8]/70 bg-white/86 p-6 shadow-[0_18px_55px_rgba(49,39,26,0.08)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[#c9b28b] hover:bg-white hover:shadow-[0_26px_70px_rgba(49,39,26,0.13)] md:p-7"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-24 w-36 shrink-0 items-center justify-center rounded-2xl border border-black/10 bg-white p-4 shadow-[0_10px_28px_rgba(49,39,26,0.07)]">
                    <Image
                      src={event.logo}
                      alt={event.logoAlt}
                      width={220}
                      height={120}
                      className="max-h-14 w-auto max-w-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9a8564]">
                      {event.date}
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold leading-tight text-[#1f1a17]">
                      {event.name}
                    </h3>
                    <p className="mt-2 text-sm font-semibold text-[#7a6b5b]">
                      {event.location}
                    </p>
                  </div>
                </div>
                <p className="mt-5 flex-1 text-sm leading-7 text-[#625b53] md:text-base">
                  {event.description}
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <a
                    href={event.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#1f1a17] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#2d2520]"
                  >
                    Learn More
                  </a>
                  <button
                    type="button"
                    onClick={openContactModal}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d8c6a8] bg-[#fbf8f3] px-5 py-2.5 text-sm font-semibold text-[#1f1a17] shadow-sm transition hover:-translate-y-0.5 hover:border-[#d4c09a] hover:bg-[#d4c09a]"
                  >
                    Schedule a Meeting
                  </button>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section data-theme="dark" className="relative overflow-hidden bg-[#171311] px-6 py-16 text-white md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#d4c09a]">
              Industry Connections
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Connected Across the Industry
            </h2>
            <p className="mt-5 text-lg leading-8 text-white/68">
              Our network works with organizations that help independent practices compete, grow, and stay in control.
            </p>
          </motion.div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {industryConnectionLogos.map((logo) => (
              <a
                key={logo.src}
                href={logo.href}
                target="_blank"
                rel="noreferrer"
                className="group flex h-36 items-center justify-center rounded-[24px] border border-white/10 bg-white px-6 shadow-[0_18px_48px_rgba(0,0,0,0.16)] transition hover:-translate-y-1 hover:border-[#d4c09a]"
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={300}
                  height={120}
                  className="max-h-28 w-auto max-w-full object-contain transition group-hover:scale-[1.03]"
                />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section
        id="contact-section"
        data-theme="light"
        className="relative scroll-mt-24 bg-[#f5f1eb] text-[#1f1a17]"
        style={{
          backgroundImage: "url('/backgroundwithglasses2.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-white/70" />
        <div className="relative z-20 mx-auto max-w-[1600px] px-6 py-16 md:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm uppercase tracking-[0.28em] text-[#8b8177]">
              Contact
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Start the Conversation
            </h2>

            <p className="mt-5 text-lg leading-8 text-[#5f5750]">
              Tell us a little about your practice and we’ll show you what a better
              lab relationship can look like.
            </p>

            <p className="mt-4 text-base font-medium text-[#3b342f]">
              Prefer to talk now? Call{" "}
              <a href="tel:8773906900" className="underline underline-offset-4">
                877.390.6900
              </a>
            </p>

            <button
              type="button"
              onClick={openContactModal}
              className="mt-8 inline-flex items-center justify-center rounded-full bg-[#c9b28b] px-7 py-3 text-base font-semibold text-[#1f1a17] shadow-[0_12px_30px_rgba(49,39,26,0.12)] transition hover:bg-[#d6bf94]"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {isContactModalOpen && (
          <motion.div
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Contact Artisan Lab Network"
          >
            <button
              type="button"
              className="absolute inset-0 cursor-default"
              aria-label="Close contact form"
              onClick={() => setIsContactModalOpen(false)}
            />
            <motion.div
              className="relative z-10 flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-white/15 bg-[#f5f1eb] shadow-[0_24px_80px_rgba(0,0,0,0.38)]"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
            >
              <div className="flex items-center justify-between gap-4 border-b border-black/10 bg-[#f5f1eb] px-5 py-4 md:px-6">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-black/45">
                    Contact
                  </div>
                  <h2 className="text-lg font-semibold text-[#1f1a17] md:text-xl">
                    Start the Conversation
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white/70 text-2xl leading-none text-black/65 transition hover:bg-white hover:text-black"
                  aria-label="Close contact form"
                >
                  ×
                </button>
              </div>
              <iframe
                src={CONTACT_FORM_URL}
                className="min-h-0 flex-1 bg-[#f5f1eb]"
                title="Contact Artisan Lab Network"
                allow="camera; microphone; autoplay; encrypted-media;"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer onContactClick={openContactModal} signUpHref={ACCOUNT_APPLICATION_URL} />

    </main>
  );
}
