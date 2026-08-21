"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { arTreatments } from "../artisan-ar/arData";
import Header from "./Header";
import Footer from "./Footer";
import EmbeddedTypeform from "./analytics/EmbeddedTypeform";

const ACCOUNT_APPLICATION_URL = "https://form.typeform.com/to/quuPCSff";
const CAPABILITY_AUTO_COLLAPSE_MS = 9000;

type Variant = "a" | "b" | "c";

const proofStats = [
  { value: "3.5", label: "day average turnaround" },
  { value: "84%", label: "orders shipped by the 4th day" },
  { value: "98.5%", label: "satisfaction rate" },
  { value: "Doctor-owned", label: "network" },
  { value: "U.S.", label: "production focus" },
];

const integrationLogos = [
  { src: "/logos/crystal", alt: "Crystal Practice Management" },
  { src: "/logos/officemate.png", alt: "OfficeMate" },
  { src: "/logos/compulink.png", alt: "Compulink" },
  { src: "/logos/eyefinitypm.png", alt: "Eyefinity PM" },
  { src: "/logos/revolution.png", alt: "RevolutionEHR" },
  { src: "/logos/barti.png", alt: "Barti" },
  { src: "/logos/eyecloudpro.png", alt: "EyeCloud Pro" },
];

const capabilities = [
  {
    title: "Freeform lens options",
    icon: "/icons/artisan/freedom-to-choose.svg",
    detail: "Access major lens vendors and keep product choice close to the doctor, optician, and patient need.",
  },
  {
    title: "AR treatments",
    icon: "/icons/artisan/transparency.svg",
    detail: "Artisan AR treatments and TechShield AR treatments are produced on site. Artisan's in-house AR portfolio is ultra premium, and additional premium brand access is available when needed.",
  },
  {
    title: "Fast turnaround",
    icon: "/icons/artisan/fast-turnaround.svg",
    detail: "Connected production across the network helps practices improve turnaround confidence and patient communication.",
  },
  {
    title: "Systems integrations",
    icon: "/icons/artisan/integrated-systems.svg",
    detail: "Ordering paths built around real practice workflows, not one rigid system.",
    integrations: integrationLogos,
  },
  {
    title: "Clear communication",
    icon: "/icons/artisan/clear-communication.svg",
    detail: "WIP reporting, order visibility, and direct lab communication help teams stay ahead of surprises.",
  },
  {
    title: "Quality control",
    icon: "/icons/artisan/quality-control.svg",
    detail: "Service standards, remake focus, and consistent process control help protect the patient experience.",
  },
  {
    title: "Support that scales",
    icon: "/icons/artisan/practice-control.svg",
    detail: "Artisan Intel reporting, training programs, and partner support help practices keep improving.",
  },
  {
    title: "Partner mindset",
    icon: "/icons/artisan/partner-mindset.svg",
    detail: "A doctor-owned network means the lab relationship is aligned with independent optometry, not against it.",
  },
];

const labs = [
  {
    id: "pacific",
    city: "Portland",
    state: "OR",
    label: "Pacific Artisan Labs",
    logo: "/logos/PAL_2CTan.png",
    logoAlt: "Pacific Artisan Labs logo",
    logoTone: "dark",
    address: ["12302 NE Marx St.", "Portland, OR 97230"],
    description: "The original Artisan lab, serving independent practices with full-service production and responsive customer service.",
    website: "/pacific-artisan-labs",
    meetHref: "/meet-the-artisans#pacific",
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
    logoTone: "light",
    address: ["3568 Peoria St., Suite 608", "Aurora, CO 80010"],
    description: "A Colorado-based Artisan lab bringing local support, finishing expertise, and practical service to independent practices.",
    website: "/peak-artisan-labs",
    meetHref: "/meet-the-artisans#peak",
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
    logoTone: "light",
    address: ["8902 Vincennes Cir., Suite F", "Indianapolis, IN 46268"],
    description: "The central U.S. Artisan lab, adding speed, flexibility, and personal support for practices that want a better lab relationship.",
    website: "/pike-artisan-labs",
    meetHref: "/meet-the-artisans#pike",
    phone: "888.239.0303",
    phoneHref: "8882390303",
    email: "customerservice@pikeartisanlabs.com",
    position: { left: "67%", top: "43%" },
  },
];

const events = [
  {
    name: "OAO Convention",
    date: "May 1-2, 2026",
    location: "Sunriver, OR",
    description: "Opticians from across Oregon gather for education, networking, and collaboration.",
    logo: "/oao-logo.jpg",
  },
  {
    name: "UOA Leadership Conference",
    date: "June 25-27, 2026",
    location: "Chicago, IL",
    description: "Opticians and industry leaders explore leadership and the future of opticianry.",
    logo: "/uoa-logo.jpg",
  },
  {
    name: "Vision Council 2026 Lab Leadership Forum",
    date: "September 16-18, 2026",
    location: "M Resort Spa Casino, Henderson, NV",
    description: "Tailored educational sessions, networking, and industry insights for optical lab professionals.",
    logo: "/logos/TheVisionCouncil-logo-IAPB-Member.png",
  },
];

const industryLogos = [
  { src: "/logos/VSP_Vision_Logotype_RGB_Blk.png", alt: "VSP Vision", href: "https://vspvision.com/" },
  { src: "/logos/nbn-logo.png", alt: "Northwest Administrators", href: "https://www.nwadmin.com/" },
  { src: "/logos/acquios-alliance.png", alt: "Acquios Alliance", href: "https://acquios.com/services/acquios-alliance/" },
  { src: "/logos/TheVisionCouncil-logo-IAPB-Member.png", alt: "The Vision Council", href: "https://thevisioncouncil.org/" },
  { src: "/logos/ultimate-partners.png", alt: "Vision Monday Ultimate Partners", href: "https://visionmonday.com" },
];

const betterCardsByVariant = {
  a: [
    ["Choice", "More lens options without forcing the practice into one corporate path.", "/icons/artisan/freedom-to-choose.svg"],
    ["Transparency", "Clear expectations around timing, cost, communication, and outcomes.", "/icons/artisan/transparency.svg"],
    ["Practice Control", "Systems built to support your workflow instead of punishing it.", "/icons/artisan/practice-control.svg"],
  ],
  b: [
    ["Choice", "Keep the product conversation close to the patient and practice.", "/icons/artisan/freedom-to-choose.svg"],
    ["Speed", "Turnaround practices can feel in the day-to-day patient experience.", "/icons/artisan/fast-turnaround.svg"],
    ["Transparency", "Fewer surprises, clearer communication, stronger trust.", "/icons/artisan/transparency.svg"],
    ["U.S. Production", "Made here, accountable here, and built around independent practices.", "/icons/site/factory.svg"],
  ],
  c: [
    ["Choice", "A broader product platform for better patient recommendations.", "/icons/artisan/freedom-to-choose.svg"],
    ["Speed", "A network operating model built around reliable turnaround.", "/icons/artisan/fast-turnaround.svg"],
    ["Clarity", "Reporting and communication that help teams plan confidently.", "/icons/artisan/clear-communication.svg"],
    ["U.S. Production", "Production focus through U.S. labs and the people who make optical work possible.", "/icons/site/factory.svg"],
  ],
};

const problemItems = [
  "Restricted product choice",
  "Pricing pressure that keeps pushing down",
  "Slow or inconsistent turnaround",
  "Poor communication and surprise delays",
  "Policies that make your team feel boxed in",
];

const fadeUp = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.55, ease: "easeOut" },
} as const;

function SiteGlyph({ src, tone = "dark" }: { src: string; tone?: "dark" | "light" }) {
  const filter =
    tone === "light"
      ? "[filter:brightness(0)_saturate(100%)_invert(88%)_sepia(14%)_saturate(570%)_hue-rotate(356deg)_brightness(92%)_contrast(90%)]"
      : "[filter:brightness(0)_saturate(100%)_invert(49%)_sepia(17%)_saturate(823%)_hue-rotate(358deg)_brightness(92%)_contrast(89%)]";

  return (
    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-current/15 bg-current/[0.04]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className={`h-7 w-7 object-contain ${filter}`} />
    </span>
  );
}

function ContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
        >
          <button type="button" className="absolute inset-0" aria-label="Close contact form" onClick={onClose} />
          <motion.div
            className="relative z-10 flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-white/15 bg-[#f5f1eb] shadow-[0_24px_80px_rgba(0,0,0,0.38)]"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between gap-4 border-b border-black/10 bg-[#f5f1eb] px-5 py-4 md:px-6">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-black/45">Contact</p>
                <h2 className="text-lg font-semibold text-[#1f1a17]">Start the Conversation</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white/70 text-2xl leading-none text-black/65 transition hover:bg-white hover:text-black"
                aria-label="Close contact form"
              >
                x
              </button>
            </div>
            <EmbeddedTypeform formId="m0lQ9zjD" formName="general_contact" className="min-h-0 flex-1 bg-[#f5f1eb]" title="Contact Artisan Lab Network" />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function HeroVideo({ framed = false }: { framed?: boolean }) {
  return (
    <div className={`${framed ? "relative aspect-[16/10] overflow-hidden rounded-[32px] border border-black/10 shadow-[0_30px_90px_rgba(24,18,13,0.18)]" : "absolute inset-0"}`}>
      <video
        className="h-full w-full object-cover object-center"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster="/backgroundimage.jpeg"
      >
        <source src="https://pub-92e180f20b704255b9a7625dd6a6cb0b.r2.dev/hero.mp4" type="video/mp4" />
      </video>
    </div>
  );
}

function Hero({ variant, onContactClick }: { variant: Variant; onContactClick: () => void }) {
  if (variant === "c") {
    return (
      <section data-theme="light" className="relative overflow-hidden bg-[#f5f1eb] px-6 pb-16 pt-32 text-[#1f1a17] md:px-10 md:pb-20 md:pt-40">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_16%,rgba(201,178,139,0.16),transparent_28%)]" />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#8a7654]">Artisan Lab Network</p>
            <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
              Better lab relationships for independent eye care.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#625b53] md:text-xl md:leading-9">
              Doctor-owned, service-focused, and built to help practices protect choice, speed, and patient experience.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="#proof" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#1f1a17] px-7 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5">
                Explore the Network
              </Link>
              <a href={ACCOUNT_APPLICATION_URL} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-full border border-black/12 bg-white px-7 py-3 text-sm font-semibold text-[#1f1a17] transition hover:-translate-y-0.5">
                Open an Account
              </a>
            </div>
            <p className="mt-6 text-sm leading-6 text-[#625b53]">
              Interested in Camber Pure?{" "}
              <Link href="/provider-resources#iot" className="font-semibold text-[#8a7654] underline underline-offset-4">
                Learn more in Practice Resources.
              </Link>
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }}>
            <HeroVideo framed />
          </motion.div>
        </div>
      </section>
    );
  }

  if (variant === "b") {
    return (
      <section data-theme="dark" className="relative min-h-[100svh] overflow-hidden bg-black px-6 pb-20 pt-32 text-white md:px-10 md:pt-40">
        <HeroVideo />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.34),rgba(0,0,0,0.78)),linear-gradient(90deg,rgba(0,0,0,0.68),rgba(0,0,0,0.16),rgba(0,0,0,0.68))]" />
        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-10rem)] max-w-5xl flex-col items-center justify-center text-center">
          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-semibold uppercase tracking-[0.34em] text-[#d4c09a]">
            Artisan Lab Network
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mt-5 text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
            Better lab relationships for independent eye care.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/76 md:text-xl md:leading-9">
            Doctor-owned, service-focused, and built to help practices protect choice, speed, and patient experience.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="#proof" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d4c09a] px-7 py-3 text-sm font-semibold text-[#171311] transition hover:-translate-y-0.5">
              Explore the Network
            </Link>
            <a href={ACCOUNT_APPLICATION_URL} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5">
              Open an Account
            </a>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mt-6 text-sm leading-6 text-white/60">
            Interested in Camber Pure?{" "}
            <Link href="/provider-resources#iot" className="font-semibold text-[#d4c09a] underline decoration-[#d4c09a]/40 underline-offset-4">
              Learn more in Practice Resources.
            </Link>
          </motion.p>
        </div>
      </section>
    );
  }

  return (
    <section data-theme="dark" className="relative min-h-[100svh] overflow-hidden bg-black px-6 pb-16 pt-32 text-white md:px-10 md:pt-40">
      <HeroVideo />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.82),rgba(0,0,0,0.52)_48%,rgba(0,0,0,0.22)),linear-gradient(180deg,rgba(0,0,0,0.22),rgba(0,0,0,0.62))]" />
      <div className="relative z-10 mx-auto grid min-h-[calc(100svh-10rem)] max-w-7xl gap-8 lg:grid-cols-[0.95fr_0.72fr] lg:items-center">
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#d4c09a]">Artisan Lab Network</p>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
            Better lab relationships for independent eye care.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/76 md:text-xl md:leading-9">
            Doctor-owned, service-focused, and built to help practices protect choice, speed, and patient experience.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="#proof" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d4c09a] px-7 py-3 text-sm font-semibold text-[#171311] transition hover:-translate-y-0.5">
              Explore the Network
            </Link>
            <a href={ACCOUNT_APPLICATION_URL} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/18 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5">
              Open an Account
            </a>
          </div>
          <p className="mt-6 text-sm leading-6 text-white/60">
            Interested in Camber Pure?{" "}
            <Link href="/provider-resources#iot" className="font-semibold text-[#d4c09a] underline decoration-[#d4c09a]/40 underline-offset-4">
              Learn more in Practice Resources.
            </Link>
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }} className="rounded-[30px] border border-white/15 bg-black/38 p-5 shadow-[0_28px_90px_rgba(0,0,0,0.36)] backdrop-blur-xl md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#d4c09a]">Choose your path</p>
          <div className="mt-5 grid gap-3">
            {[
              ["I am exploring a new lab", "#proof"],
              ["I need practice resources", "/provider-resources"],
              ["I am interested in lab ownership", "#ownership"],
            ].map(([label, href]) => (
              <Link key={label} href={href} className="flex items-center justify-between rounded-2xl border border-white/12 bg-white/[0.07] px-4 py-4 text-sm font-semibold text-white transition hover:border-[#d4c09a]/55 hover:bg-white/[0.11]">
                {label}
                <span>→</span>
              </Link>
            ))}
          </div>
          <button type="button" onClick={onContactClick} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#d4c09a] px-5 py-2.5 text-sm font-semibold text-[#171311] transition hover:bg-[#e2cca2]">
            Talk to Our Team
          </button>
        </motion.div>
      </div>
    </section>
  );
}

function ProofBand({ variant }: { variant: Variant }) {
  const light = variant === "c";
  return (
    <section id="proof" data-theme={light ? "light" : "dark"} className={`${light ? "bg-[#fbf8f3] text-[#1f1a17]" : "bg-[#171311] text-white"} scroll-mt-24 border-y ${light ? "border-[#e6d9c8]" : "border-white/10"} px-6 py-14 md:px-10 md:py-16`}>
      <div className="mx-auto max-w-7xl">
        <motion.div {...fadeUp} className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${light ? "text-[#8a7654]" : "text-[#d4c09a]"}`}>Proof</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">Proof before promises.</h2>
            <p className={`mt-4 max-w-xl text-base leading-8 ${light ? "text-[#625b53]" : "text-white/68"}`}>
              Practices need a lab relationship they can feel in turnaround, communication, quality, and control.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {proofStats.map((stat) => (
              <article key={stat.label} className={`flex min-h-[154px] flex-col justify-center rounded-[24px] border p-5 text-center shadow-[0_18px_46px_rgba(0,0,0,0.08)] ${
                light ? "border-[#e1d4c2] bg-white" : "border-white/10 bg-white/[0.065]"
              }`}>
                <div className={`text-3xl font-semibold tracking-tight md:text-[2.35rem] ${light ? "text-[#1f1a17]" : "text-[#d4c09a]"}`}>{stat.value}</div>
                <p className={`mt-4 text-xs font-semibold uppercase leading-5 tracking-[0.16em] ${light ? "text-[#8a7654]" : "text-white/62"}`}>{stat.label}</p>
              </article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CorporateProblem({ variant }: { variant: Variant }) {
  if (variant === "b") {
    return (
      <section data-theme="dark" className="bg-[#0f0c0b] px-6 py-16 text-white md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <motion.div {...fadeUp}>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d4c09a]">The control question</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              What happens when you do not control your lab?
            </h2>
            <p className="mt-5 text-lg leading-8 text-white/68">
              Corporate labs can look safe from the outside. But many are owned by multinational corporations built to protect their own systems, not your independence.
            </p>
          </motion.div>
          <div className="grid gap-3 sm:grid-cols-2">
            {problemItems.map((item, index) => (
              <motion.article
                key={item}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{ duration: 0.45, delay: index * 0.04 }}
                className="rounded-[24px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.18)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d4c09a]">You feel it</p>
                <h3 className="mt-4 text-xl font-semibold leading-snug">{item}</h3>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const light = variant === "c";
  return (
    <section data-theme={light ? "light" : "dark"} className={`${light ? "bg-[#f5f1eb] text-[#1f1a17]" : "bg-[#0f0c0b] text-white"} px-6 py-16 md:px-10 md:py-20`}>
      <div className="mx-auto max-w-7xl">
        <motion.div {...fadeUp} className="max-w-4xl">
          <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${light ? "text-[#8a7654]" : "text-[#d4c09a]"}`}>The Corporate Lab Problem</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">Corporate systems were not built around your independence.</h2>
          <p className={`mt-5 max-w-3xl text-lg leading-8 ${light ? "text-[#625b53]" : "text-white/70"}`}>
            Corporate labs can look safe from the outside. But many are owned by multinational corporations built to protect their own systems, not your independence.
          </p>
        </motion.div>
        <div className="mt-9 grid gap-3 lg:grid-cols-5">
          {problemItems.map((item) => (
            <article key={item} className={`min-h-[154px] rounded-[24px] border p-5 ${light ? "border-[#e1d4c2] bg-white shadow-[0_18px_48px_rgba(49,39,26,0.08)]" : "border-white/10 bg-white/[0.06]"}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${light ? "text-[#8a7654]" : "text-[#d4c09a]"}`}>You feel it</p>
              <h3 className="mt-4 text-lg font-semibold leading-snug">{item}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BetterModel({ variant }: { variant: Variant }) {
  const light = variant === "c";
  const cards = betterCardsByVariant[variant];

  return (
    <section id="better-model" data-theme={light ? "light" : "light"} className={`${light ? "bg-[#fbf8f3]" : "bg-[#f5f1eb]"} px-6 py-16 text-[#1f1a17] md:px-10 md:py-20`}>
      <div className="mx-auto max-w-7xl">
        {variant === "a" ? (
          <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch">
            <motion.div {...fadeUp} className="rounded-[30px] border border-[#d8c6a8]/70 bg-white p-7 shadow-[0_24px_64px_rgba(49,39,26,0.08)] md:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8a7654]">The Better Model</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">Built for practices that want control back.</h2>
              <p className="mt-5 text-lg leading-8 text-[#625b53]">
                Artisan Lab Network gives you freedom of choice, real partnership, and a modern system that fits the way you run your practice.
              </p>
            </motion.div>
            <motion.div {...fadeUp} className="rounded-[30px] border border-[#d8c6a8]/70 bg-[#171311] p-7 text-white shadow-[0_24px_64px_rgba(49,39,26,0.12)] md:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d4c09a]">U.S. Production Focus</p>
              <h3 className="mt-4 text-3xl font-semibold tracking-tight">Made in America. Built for Independent Practices.</h3>
              <p className="mt-5 text-base leading-8 text-white/72">
                Artisan Lab Network is based in the United States and focused on producing as much work as possible through U.S. labs, protecting quality, service, and the people who make great optical work possible.
              </p>
            </motion.div>
          </div>
        ) : (
          <motion.div {...fadeUp} className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8a7654]">The Better Model</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
              {variant === "b"
                ? "Made here. Accountable here. Built for independent practices."
                : "Independence works better when your lab is built around you."}
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[#625b53]">
              Artisan Lab Network connects local lab relationships with the shared strength, systems, and production focus of a national doctor-owned network.
            </p>
          </motion.div>
        )}

        <div className={`mt-9 grid gap-4 ${cards.length === 3 ? "lg:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-4"}`}>
          {cards.map(([title, body, icon]) => (
            <article key={title} className="rounded-[24px] border border-[#e1d4c2] bg-white p-6 shadow-[0_18px_48px_rgba(49,39,26,0.08)]">
              <SiteGlyph src={icon} />
              <h3 className="mt-5 text-2xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#625b53]">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Capabilities() {
  const [activeCapability, setActiveCapability] = useState<string | null>(null);

  useEffect(() => {
    if (activeCapability === null) return;
    const timer = setTimeout(() => setActiveCapability(null), CAPABILITY_AUTO_COLLAPSE_MS);
    return () => clearTimeout(timer);
  }, [activeCapability]);

  return (
    <section id="capabilities" data-theme="dark" className="relative bg-black px-6 py-16 text-white md:px-10 md:py-20">
      <div className="mx-auto max-w-7xl">
        <motion.div {...fadeUp} className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d4c09a]">Capabilities</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Built for Real Practice Control.</h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-white/62">
            Expand a capability to see how the network supports real practice workflows.
          </p>
        </motion.div>

        <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((cap) => {
            const isActive = activeCapability === cap.title;
            const isDimmed = activeCapability !== null && !isActive;
            return (
              <motion.article
                key={cap.title}
                layout
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                className={`overflow-hidden rounded-[22px] border text-left backdrop-blur-md transition-all duration-300 ${
                  isActive ? "border-[#d4c09a] bg-white/12 shadow-2xl lg:col-span-2" : "border-white/12 bg-white/[0.055]"
                } ${isDimmed ? "opacity-55" : "opacity-100"}`}
              >
                <button type="button" onClick={() => setActiveCapability((current) => current === cap.title ? null : cap.title)} className="block w-full px-5 py-5 text-left" aria-expanded={isActive}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <SiteGlyph src={cap.icon} tone="light" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d4c09a]">Capability</p>
                        <h3 className="mt-3 text-xl font-semibold leading-snug">{cap.title}</h3>
                      </div>
                    </div>
                    <span className="text-xs text-white/55">{isActive ? "Close" : "Open"}</span>
                  </div>
                </button>
                <AnimatePresence>
                  {isActive ? (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} className="mx-5 mb-5 overflow-hidden border-t border-white/10 pt-4">
                      <p className="text-sm leading-7 text-white/76">{cap.detail}</p>
                      {cap.title === "AR treatments" ? (
                        <div className="mt-5">
                          <div className="flex flex-wrap gap-3">
                            <Link href="/artisan-ar" className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d4c09a]/55 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/16">
                              Open main AR coating page
                            </Link>
                            <Link href="/artisan-ar/nytopia" className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#d4c09a] px-5 text-sm font-semibold text-[#171311] transition hover:bg-[#e2cca2]">
                              View Artisan AR treatments
                            </Link>
                          </div>
                          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {arTreatments.map((treatment) => (
                              <div key={treatment.slug} className="flex h-20 items-center justify-center rounded-2xl border border-white/10 bg-white px-3">
                                <Image src={treatment.logo} alt={treatment.name} width={160} height={72} className="max-h-10 w-auto max-w-full object-contain" />
                              </div>
                            ))}
                          </div>
                          <p className="mt-4 text-sm leading-7 text-white/72">
                            Our in-house AR lineup is positioned as ultra premium for practices that want clear differentiation, stronger cosmetics, and a tighter story around value.
                          </p>
                        </div>
                      ) : null}
                      {"integrations" in cap && cap.integrations ? (
                        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {cap.integrations.map((logo) => (
                            <div key={logo.alt} className="flex h-20 items-center justify-center rounded-2xl border border-white/10 bg-white px-3">
                              <Image src={logo.src} alt={logo.alt} width={210} height={90} className="max-h-11 w-auto max-w-full object-contain" />
                            </div>
                          ))}
                          <div className="flex h-20 items-center justify-center rounded-2xl border border-[#d4c09a]/35 bg-[#d4c09a]/12 px-3 text-center text-sm font-semibold text-[#d4c09a]">
                            and many more
                          </div>
                        </div>
                      ) : null}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function LabSection({ variant }: { variant: Variant }) {
  const [activeLabId, setActiveLabId] = useState("pacific");
  const activeLab = labs.find((lab) => lab.id === activeLabId) ?? labs[0];
  const light = variant === "c";

  return (
    <section id="labs" data-theme={light ? "light" : "dark"} className={`${light ? "bg-[#f5f1eb] text-[#1f1a17]" : "bg-[#171311] text-white"} px-6 py-16 md:px-10 md:py-20`}>
      <div className="mx-auto max-w-7xl">
        <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
          <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${light ? "text-[#8a7654]" : "text-[#d4c09a]"}`}>Our Labs</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">One Network. Local Lab Relationships.</h2>
          <p className={`mx-auto mt-5 max-w-2xl text-base leading-8 md:text-lg ${light ? "text-[#625b53]" : "text-white/68"}`}>
            Pacific Artisan Labs is selected first. Choose Peak or Pike to see each local team relationship.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] lg:items-stretch">
          <div className={`rounded-[28px] border p-4 shadow-[0_28px_80px_rgba(0,0,0,0.16)] md:p-6 ${light ? "border-[#e1d4c2] bg-white" : "border-white/10 bg-white/[0.055]"}`}>
            <div className="relative mx-auto max-w-4xl">
              <Image src="/network-map.png" alt="Artisan Lab Network map" width={1600} height={875} className="mx-auto h-auto w-full rounded-2xl object-contain" />
              {labs.map((lab) => {
                const selected = activeLab.id === lab.id;
                return (
                  <button key={lab.id} type="button" onClick={() => setActiveLabId(lab.id)} className={`absolute -translate-x-1/2 -translate-y-1/2 transition ${selected ? "z-20" : "z-10 opacity-80 hover:opacity-100"}`} style={lab.position} aria-label={`Show ${lab.label}`}>
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

          <motion.article key={activeLab.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className={`rounded-[28px] border p-5 shadow-[0_28px_80px_rgba(0,0,0,0.14)] md:p-6 ${light ? "border-[#e1d4c2] bg-white" : "border-white/10 bg-white/[0.065]"}`}>
            <div className={`flex h-32 items-center justify-center rounded-2xl border px-5 ${activeLab.logoTone === "dark" ? "border-white/10 bg-[#171311]" : "border-[#e6d9c8] bg-white"}`}>
              <Image src={activeLab.logo} alt={activeLab.logoAlt} width={340} height={140} className="max-h-20 w-auto max-w-full object-contain" />
            </div>
            <p className={`mt-6 text-xs font-semibold uppercase tracking-[0.26em] ${light ? "text-[#8a7654]" : "text-[#d4c09a]"}`}>{activeLab.city}, {activeLab.state}</p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight">{activeLab.label}</h3>
            <p className={`mt-4 text-sm leading-7 ${light ? "text-[#625b53]" : "text-white/70"}`}>{activeLab.description}</p>
            <div className={`mt-5 space-y-2 text-sm leading-6 ${light ? "text-[#625b53]" : "text-white/72"}`}>
              {activeLab.address.map((line) => <div key={line}>{line}</div>)}
              <a href={`tel:${activeLab.phoneHref}`} className="block font-semibold transition hover:text-[#d4c09a]">{activeLab.phone}</a>
              <a href={`mailto:${activeLab.email}`} className="block break-words transition hover:text-[#d4c09a]">{activeLab.email}</a>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href={activeLab.website} className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#d4c09a] px-5 py-2.5 text-sm font-semibold text-[#171311] transition hover:-translate-y-0.5 hover:bg-[#e2cca2]">
                Visit Lab Website
              </Link>
              <Link href={activeLab.meetHref} className={`inline-flex min-h-11 items-center justify-center rounded-full border px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 ${light ? "border-[#d8c6a8] bg-[#fbf8f3] text-[#1f1a17] hover:bg-white" : "border-white/12 bg-white/8 text-white hover:border-[#d4c09a]/55 hover:bg-white/14"}`}>
                Meet Your Lab
              </Link>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}

function Ownership({ variant, onContactClick }: { variant: Variant; onContactClick: () => void }) {
  const dark = variant !== "c";
  return (
    <section id="ownership" data-theme={dark ? "dark" : "light"} className={`${dark ? "bg-[#0f0c0b] text-white" : "bg-[#fbf8f3] text-[#1f1a17]"} px-6 py-16 md:px-10 md:py-20`}>
      <div className="mx-auto max-w-7xl">
        <motion.div {...fadeUp} className="max-w-3xl">
          <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${dark ? "text-[#d4c09a]" : "text-[#8a7654]"}`}>Ownership</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">Partnership, not pitches.</h2>
          <p className={`mt-5 text-lg leading-8 ${dark ? "text-white/70" : "text-[#625b53]"}`}>
            In some cases, qualified practices can participate in ownership by invitation, creating deeper alignment and a stronger long-term lab relationship.
          </p>
        </motion.div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {["More alignment", "More loyalty", "More control over your experience"].map((item) => (
            <article key={item} className={`rounded-[24px] border p-5 ${dark ? "border-white/10 bg-white/[0.055]" : "border-[#e1d4c2] bg-white"}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${dark ? "text-[#d4c09a]" : "text-[#8a7654]"}`}>Outcome</p>
              <h3 className="mt-4 text-xl font-semibold">{item}</h3>
            </article>
          ))}
        </div>
        <button type="button" onClick={onContactClick} className="mt-8 rounded-full bg-[#d4c09a] px-6 py-3 text-sm font-semibold text-[#171311] transition hover:bg-[#e2cca2]">
          Talk to Our Team
        </button>
      </div>
    </section>
  );
}

function EventsAndIndustry({ variant, onContactClick }: { variant: Variant; onContactClick: () => void }) {
  const light = variant === "c";
  return (
    <>
      <section data-theme={light ? "light" : "light"} className="bg-[#f5f1eb] px-6 py-16 text-[#1f1a17] md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8a7654]">Where We&apos;ll Be</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">Meet the Artisan team.</h2>
            </div>
            <p className="max-w-3xl text-base leading-8 text-[#625b53] md:text-lg">
              Find us at industry events where independent practices, lab leaders, and partners gather.
            </p>
          </motion.div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {events.map((event) => (
              <article key={event.name} className="rounded-[26px] border border-[#e1d4c2] bg-white p-6 shadow-[0_18px_48px_rgba(49,39,26,0.08)]">
                <div className="flex h-24 items-center justify-center rounded-2xl border border-[#e6d9c8] bg-[#fbf8f3] px-4">
                  <Image src={event.logo} alt={`${event.name} logo`} width={240} height={110} className="max-h-16 w-auto max-w-full object-contain" />
                </div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">{event.date}</p>
                <h3 className="mt-3 text-2xl font-semibold leading-tight">{event.name}</h3>
                <p className="mt-2 text-sm font-semibold text-[#75664e]">{event.location}</p>
                <p className="mt-4 text-sm leading-7 text-[#625b53]">{event.description}</p>
                <button type="button" onClick={onContactClick} className="mt-5 rounded-full border border-[#d8c6a8] bg-[#fbf8f3] px-5 py-2.5 text-sm font-semibold transition hover:bg-[#d4c09a]">
                  Schedule a Meeting
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-theme="dark" className="bg-[#171311] px-6 py-16 text-white md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d4c09a]">Industry Connections</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">Connected Across the Industry</h2>
            <p className="mt-5 text-lg leading-8 text-white/68">
              Our network works with organizations that help independent practices compete, grow, and stay in control.
            </p>
          </motion.div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {industryLogos.map((logo) => (
              <a key={logo.src} href={logo.href} target="_blank" rel="noreferrer" className="group flex h-32 items-center justify-center rounded-[24px] border border-white/10 bg-white px-5 shadow-[0_18px_48px_rgba(0,0,0,0.16)] transition hover:-translate-y-1 hover:border-[#d4c09a]">
                <Image src={logo.src} alt={logo.alt} width={300} height={120} className="max-h-24 w-auto max-w-full object-contain transition group-hover:scale-[1.03]" />
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function FinalCta({ onContactClick }: { onContactClick: () => void }) {
  return (
    <section data-theme="dark" className="bg-black px-6 py-16 text-center text-white md:px-10 md:py-20">
      <motion.div {...fadeUp} className="mx-auto max-w-4xl">
        <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">Ready for a Better Lab Relationship?</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/70">
          Start with a conversation. We&apos;ll help you find the right path for your practice.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={ACCOUNT_APPLICATION_URL} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d4c09a] px-7 py-3 text-sm font-semibold text-[#171311]">
            Open an Account
          </a>
          <button type="button" onClick={onContactClick} className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/10 px-7 py-3 text-sm font-semibold text-white">
            Talk to Our Team
          </button>
        </div>
      </motion.div>
    </section>
  );
}

export default function HomeVersionLayout({ variant }: { variant: Variant }) {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <main className={`min-h-screen overflow-x-hidden ${variant === "c" ? "bg-[#f5f1eb] text-[#1f1a17]" : "bg-black text-white"}`}>
      <Header onContactClick={() => setContactOpen(true)} signUpHref={ACCOUNT_APPLICATION_URL} />
      <Hero variant={variant} onContactClick={() => setContactOpen(true)} />
      <ProofBand variant={variant} />
      <CorporateProblem variant={variant} />
      <BetterModel variant={variant} />
      <Capabilities />
      <LabSection variant={variant} />
      <Ownership variant={variant} onContactClick={() => setContactOpen(true)} />
      <EventsAndIndustry variant={variant} onContactClick={() => setContactOpen(true)} />
      <FinalCta onContactClick={() => setContactOpen(true)} />
      <Footer onContactClick={() => setContactOpen(true)} signUpHref={ACCOUNT_APPLICATION_URL} />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </main>
  );
}
