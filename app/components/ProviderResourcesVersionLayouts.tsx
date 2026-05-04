"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Header from "./Header";
import Footer from "./Footer";

type Version = "a" | "b" | "c";
type VideoCategory = "All" | "Training" | "Product" | "Education";

const SIGNUP_URL = "https://form.typeform.com/to/quuPCSff";
const SAFETY_KIT_URL = "https://form.typeform.com/to/rDUQssNn";
const VSP_HEART_LOGO = "/logos/VSP_V_Heart_Symbol_RGB_2x.png";

const fadeUp = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.52, ease: "easeOut" },
} as const;

const navItems = [
  ["Systems", "#systems"],
  ["Ordering Tools", "#tools-ordering"],
  ["Training", "#training-education"],
  ["Practice Lookup", "#practice-lookup"],
  ["Customer Service", "#lab-customer-service"],
];

const systems = [
  {
    title: "Artisan Lens Systems",
    logo: "/aln-icon.png",
    logoAlt: "Artisan Lab Network",
    body: "Premium lens bundles, AR treatment guidance, and clearer product paths for independent practices.",
    detail:
      "A practical system for recommending strong lens technology without forcing every dispense into a one-off research project.",
    href: "#product-information",
    cta: "View Lens Resources",
  },
  {
    title: "Frame Systems",
    logo: "/images/framesystems.png",
    logoAlt: "Frame Systems",
    body: "Complete-pair structure and frame program support for cleaner patient conversations.",
    detail:
      "Useful for practices that want a more intentional retail experience, simpler handoffs, and less confusion around frame and lens paths.",
    href: "#tools-ordering",
    cta: "Review Frame Support",
  },
  {
    title: "Safety Systems",
    logo: "/logos/safetysystems.png",
    logoAlt: "Safety Systems",
    body: "Occupational eyewear support, demonstration materials, and approved ordering paths.",
    detail:
      "Built for practices serving employers, workers, and safety eyewear programs with a more complete support model.",
    href: SAFETY_KIT_URL,
    cta: "Order Safety Kit",
  },
];

const orderingTools = [
  {
    title: "SpecCheck",
    logo: "/logos/speccheck.png",
    logoAlt: "SpecCheck",
    body: "Use SpecCheck for lab payment and practical account workflow support.",
    href: "https://www.speccheckrx.com/",
    cta: "Open SpecCheck",
  },
  {
    title: "Rx Wizard",
    logo: "/RXWizard-logo-color.png",
    logoAlt: "Rx Wizard",
    body: "Ordering support for cleaner prescription workflows and lab submissions.",
    href: "https://www.dvirx.com/",
    cta: "Open Rx Wizard",
  },
  {
    title: "GoStock",
    logo: "/logos/gostock_logo.png",
    logoAlt: "GoStock",
    body: "Search and source stock lenses through the GoStock lens marketplace.",
    href: "https://www.globalopticsinc.com/gostock",
    cta: "Open GoStock",
  },
  {
    title: "Safety Demonstration Frames",
    logo: "/logos/safetysystems.png",
    logoAlt: "Safety Systems",
    body: "Request demonstration frames and safety program materials for your practice.",
    href: SAFETY_KIT_URL,
    cta: "Order Demo Frames",
    supporting: [
      { src: "/logos/armourrx.png", alt: "ArmourRx" },
      { src: "/logos/safevision.png", alt: "SafeVision" },
      { src: "/wiley-x.png", alt: "Wiley X" },
    ],
  },
];

const brands = [
  { name: "IOT", logo: "/iot-logo.png", href: "#iot", copy: "Camber Pure, occupational options, and IOT product training." },
  { name: "Tokai", logo: "/tokai-logo.png", href: "#tokai", copy: "Premium lens resources, product guides, and cutout support." },
  { name: "Chemistrie", logo: "/chemistrie-logo.png", href: "#chemistrie", copy: "Order forms, demo kit support, fitting help, and clip resources." },
  { name: "Unity", logo: "/unity-logo.png", href: "#unity", copy: "VSP-aligned resources and coverage-focused dispensing material." },
  { name: "Neurolens", logo: "/neurolens-logo.png", href: "#newton", copy: "Specialty lens positioning and team education resources." },
  { name: "Younger Optics", logo: "/younger-optics-logo.png", href: "#younger-optics", copy: "Specialty lens and polarized lens support." },
];

const videos = [
  {
    id: "eFw7BzI1SZY",
    title: "ALN | Camber Pure Training Webinar",
    category: "Training" as const,
    logo: "/iot-logo.png",
    logoAlt: "IOT",
    thumb: "/camber-pure-poster.png",
    href: "https://youtu.be/eFw7BzI1SZY",
    body: "Camber Pure training for positioning, fitting, and patient conversations.",
  },
  {
    id: "cLhLfThS7Gs",
    title: "ALN | IOT Product Training Webinar",
    category: "Product" as const,
    logo: "/iot-logo.png",
    logoAlt: "IOT",
    href: "https://youtu.be/cLhLfThS7Gs",
    body: "IOT product education for teams comparing modern lens platforms.",
  },
  {
    id: "9P7VEmI0ZwY",
    title: "ALN | Chemistrie Product Training Webinar",
    category: "Training" as const,
    logo: "/chemistrie-logo.png",
    logoAlt: "Chemistrie",
    href: "https://youtu.be/9P7VEmI0ZwY",
    body: "Chemistrie clip options, ordering support, and dispensing guidance.",
  },
  {
    id: "phvH3ahy2e4",
    title: "Tokai | ALN Product Training Webinar",
    category: "Education" as const,
    logo: "/tokai-logo.png",
    logoAlt: "Tokai",
    href: "https://youtu.be/phvH3ahy2e4",
    body: "Tokai education for premium lens conversations and advanced materials.",
  },
  {
    id: "Rown4Yp9U4c",
    title: "ALN | Additional Training",
    category: "Training" as const,
    logo: "/aln-icon.png",
    logoAlt: "Artisan Lab Network",
    href: "https://youtu.be/Rown4Yp9U4c",
    body: "Additional team training and practice support from Artisan Lab Network.",
  },
];

const serviceContacts = [
  ["Pacific Artisan Labs", "877.390.6900", "customerservice@pacificartisanlabs.com"],
  ["Peak Artisan Labs", "833.690.4321", "customerservice@peakartisanlabs.com"],
  ["Pike Artisan Labs", "888.239.0303", "customerservice@pikeartisanlabs.com"],
];

function isExternal(href: string) {
  return href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");
}

function SmartLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  if (isExternal(href)) {
    return (
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function SectionHeader({
  eyebrow,
  title,
  body,
  dark = false,
  center = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  dark?: boolean;
  center?: boolean;
}) {
  return (
    <motion.div {...fadeUp} className={`${center ? "mx-auto text-center" : ""} max-w-4xl`}>
      <p className={`text-xs font-semibold uppercase tracking-[0.28em] ${dark ? "text-[#d4c09a]" : "text-[#8a7654]"}`}>
        {eyebrow}
      </p>
      <h2 className={`mt-4 text-4xl font-semibold tracking-tight md:text-5xl ${dark ? "text-white" : "text-[#1f1a17]"}`}>
        {title}
      </h2>
      <p className={`mt-5 text-base leading-8 md:text-lg ${dark ? "text-white/68" : "text-[#625b53]"}`}>
        {body}
      </p>
    </motion.div>
  );
}

function Hero({ version }: { version: Version }) {
  const copy =
    version === "c"
      ? ["Practice Support Portal", "Find the right tool, training, system, or lab contact fast."]
      : version === "b"
        ? ["Premium Provider Resources", "A guided resource hub for ordering, systems, training, and product support."]
        : ["Provider Resources", "Clean access to practice systems, ordering tools, training, and support."];

  return (
    <section data-theme="light" className="relative overflow-hidden border-b border-[#e6d9c8] bg-[#f5f1eb] px-6 pb-16 pt-32 md:px-10 md:pb-24 md:pt-40">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(201,178,139,0.24),transparent_30%),linear-gradient(180deg,#fbf8f3_0%,#f5f1eb_68%,#eee5d8_100%)]" />
      <div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.78fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#8a7654]">{copy[0]}</p>
          <h1 className="mt-5 max-w-5xl text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
            Practice resources that are easy to use.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#625b53] md:text-2xl md:leading-10">
            {copy[1]}
          </p>
          <div className="mt-10 rounded-[28px] border border-[#d8c6a8]/80 bg-[#fbf8f3]/82 p-2 shadow-[0_20px_50px_rgba(24,18,13,0.07)] backdrop-blur">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {navItems.map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#e1d4c2] bg-white/70 px-4 py-2 text-center text-sm font-semibold text-[#1f1a17] transition hover:-translate-y-0.5 hover:border-[#c9b28b] hover:bg-white"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <motion.div {...fadeUp} className="relative min-h-[330px] overflow-hidden rounded-[28px] border border-white/60 shadow-[0_26px_70px_rgba(24,18,13,0.16)] lg:min-h-[430px]">
          <Image
            src={version === "c" ? "/images/office-reception-desk-2025-1.jpg" : "/images/eyewear-brochure-meeting-2022-1.jpg"}
            alt="Provider resources and practice support"
            fill
            sizes="(min-width: 1024px) 38vw, 100vw"
            className="object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}

function SystemsSection({ version }: { version: Version }) {
  const [open, setOpen] = useState(systems[0].title);

  if (version === "b") {
    return (
      <section id="systems" data-theme="light" className="bg-[#fbf8f3] px-6 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Systems" title="Choose a system, then expand the details." body="A more guided approach for practices that want context before they open a resource." />
          <div className="mt-10 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid gap-4">
              {systems.map((system) => (
                <button
                  key={system.title}
                  type="button"
                  onClick={() => setOpen(system.title)}
                  className={`rounded-[24px] border p-5 text-left transition ${open === system.title ? "border-[#c9b28b] bg-white shadow-[0_18px_48px_rgba(24,18,13,0.09)]" : "border-black/10 bg-white/60 hover:bg-white"}`}
                >
                  <div className="flex items-center gap-4">
                    <LogoBox src={system.logo} alt={system.logoAlt} />
                    <div>
                      <h3 className="text-xl font-semibold">{system.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-[#625b53]">{system.body}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {systems.map((system) => (
              <AnimatePresence key={system.title}>
                {open === system.title ? (
                  <motion.article
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-[30px] border border-[#d8c6a8] bg-white p-7 shadow-[0_24px_64px_rgba(24,18,13,0.10)]"
                  >
                    <LogoBox src={system.logo} alt={system.logoAlt} large />
                    <h3 className="mt-7 text-3xl font-semibold">{system.title}</h3>
                    <p className="mt-4 text-base leading-8 text-[#625b53]">{system.detail}</p>
                    <SmartLink href={system.href} className="mt-7 inline-flex rounded-full bg-[#1f1a17] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d4c09a] hover:text-[#1f1a17]">
                      {system.cta}
                    </SmartLink>
                  </motion.article>
                ) : null}
              </AnimatePresence>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="systems" data-theme="light" className="bg-[#fbf8f3] px-6 py-20 md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow="Systems" title="Three balanced systems for practice support." body="Each system has a clear role, clear next step, and enough context for your team to use it confidently." />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {systems.map((system) => (
            <article key={system.title} className="flex min-h-[360px] flex-col rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_18px_48px_rgba(24,18,13,0.07)]">
              <LogoBox src={system.logo} alt={system.logoAlt} large />
              <h3 className="mt-6 text-2xl font-semibold">{system.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-[#625b53]">{system.body}</p>
              <p className="mt-4 text-sm leading-7 text-[#75664e]">{system.detail}</p>
              <SmartLink href={system.href} className="mt-6 inline-flex w-fit rounded-full border border-[#d8c6a8] bg-[#fbf8f3] px-5 py-2.5 text-sm font-semibold text-[#1f1a17] transition hover:bg-[#d4c09a]">
                {system.cta}
              </SmartLink>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function LogoBox({ src, alt, large = false }: { src: string; alt: string; large?: boolean }) {
  return (
    <div className={`flex items-center justify-center rounded-2xl border border-[#e4d7c6] bg-[#fbf8f3] px-5 ${large ? "h-28" : "h-20 w-32 shrink-0"}`}>
      <Image src={src} alt={alt} width={360} height={140} className={`${alt === "Artisan Lab Network" ? "h-16 w-16" : "max-h-20"} w-auto max-w-full object-contain`} />
    </div>
  );
}

function ToolsSection({ version }: { version: Version }) {
  return (
    <section id="tools-ordering" data-theme="dark" className="bg-[#1f1a17] px-6 py-20 text-white md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeader dark eyebrow="Tools and Ordering" title={version === "c" ? "Open the right ordering tool fast." : "Premium ordering tools with clear next steps."} body="Each tool has a plain-language purpose, a readable logo, and one obvious action." />
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {orderingTools.map((tool) => (
            <a key={tool.title} href={tool.href} target="_blank" rel="noreferrer" className="group flex min-h-[330px] flex-col rounded-[24px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_18px_54px_rgba(0,0,0,0.22)] transition hover:-translate-y-1.5 hover:border-[#d4c09a]/60 hover:bg-white/[0.09]">
              <div className="flex h-28 items-center justify-center rounded-2xl bg-white px-5">
                <Image src={tool.logo} alt={tool.logoAlt} width={360} height={140} className="max-h-20 w-auto max-w-full object-contain" />
              </div>
              {tool.supporting ? (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {tool.supporting.map((logo) => (
                    <div key={logo.src} className="flex h-11 items-center justify-center rounded-xl bg-white px-2">
                      <Image src={logo.src} alt={logo.alt} width={150} height={60} className="max-h-8 w-auto max-w-full object-contain" />
                    </div>
                  ))}
                </div>
              ) : null}
              <h3 className="mt-6 text-2xl font-semibold">{tool.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-white/68">{tool.body}</p>
              <span className="mt-7 inline-flex min-h-11 w-fit items-center justify-center rounded-full border border-white/12 bg-white/8 px-5 py-2.5 text-sm font-semibold text-white transition group-hover:border-[#d4c09a] group-hover:bg-[#d4c09a] group-hover:text-[#171311]">
                {tool.cta}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function VspSection() {
  return (
    <section data-theme="light" className="bg-[#f6f1e9] px-6 py-20 md:px-10 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <SectionHeader eyebrow="VSP Setup" title="Connect Artisan for VSP orders." body="VSP setup has one important naming detail. Follow these steps so orders route correctly." />
        <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
          <div className="rounded-[28px] border border-[#d8c6a8]/70 bg-white p-8 text-center shadow-[0_18px_48px_rgba(24,18,13,0.07)]">
            <Image src="/logos/VSP_Vision_Logotype_RGB_Blk.png" alt="VSP Vision" width={360} height={140} className="mx-auto max-h-24 w-auto max-w-full object-contain" />
            <Image src={VSP_HEART_LOGO} alt="VSP heart icon" width={120} height={120} className="mx-auto mt-6 h-16 w-16 object-contain" />
          </div>
          <div className="grid gap-4">
            {[
              "Tell customer service you want to use Artisan Lab Network for VSP.",
              "Add Pacific Artisan Labs inside VSP, even if your orders are produced by Pike or Peak.",
              "Orders still route to the correct Artisan lab after setup.",
            ].map((step, index) => (
              <article key={step} className="rounded-[24px] border border-black/10 bg-white p-5 shadow-[0_16px_42px_rgba(24,18,13,0.06)]">
                <div className="flex gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1f1a17] text-sm font-semibold text-white">{index + 1}</span>
                  <p className="text-sm leading-7 text-[#625b53]">{step}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BrandLibrary({ compact = false }: { compact?: boolean }) {
  return (
    <section id="product-information" data-theme="light" className="border-y border-[#e7ddd0] bg-[#fbf8f3] px-6 py-20 md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow="Product Information" title="Brand resources organized by topic." body="Start with the brand your team needs, then move into guides, forms, training, or product information." />
        <div className={`mt-10 grid gap-5 ${compact ? "md:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
          {brands.map((brand) => (
            <a key={brand.name} href={brand.href} className="group rounded-[26px] border border-black/10 bg-white p-6 shadow-[0_16px_42px_rgba(24,18,13,0.06)] transition hover:-translate-y-1 hover:border-[#d4c09a]">
              <div className="flex h-24 items-center justify-center rounded-2xl border border-[#e4d7c6] bg-[#fbf8f3] px-5">
                <Image src={brand.logo} alt={`${brand.name} logo`} width={300} height={120} className="max-h-16 w-auto max-w-full object-contain" />
              </div>
              <h3 className="mt-5 text-2xl font-semibold">{brand.name}</h3>
              <p className="mt-3 text-sm leading-7 text-[#625b53]">{brand.copy}</p>
              <span className="mt-6 inline-flex text-sm font-semibold text-[#8a7654] transition group-hover:translate-x-1">View resources →</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function VideoSection() {
  const [filter, setFilter] = useState<VideoCategory>("All");
  const [showAll, setShowAll] = useState(false);
  const filtered = useMemo(
    () => (filter === "All" ? videos : videos.filter((video) => video.category === filter)),
    [filter]
  );
  const visible = showAll ? filtered : filtered.slice(0, 4);
  const hasMore = filtered.length > 4;

  return (
    <section id="training-education" data-theme="light" className="bg-[#f5f1eb] px-6 py-20 md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow="Training" title="Insights and training that match the topic." body="Video cards use the correct brand logo for the actual video topic, with consistent thumbnails, filters, and actions." />
        <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
          {(["All", "Training", "Product", "Education"] as VideoCategory[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setFilter(tab);
                setShowAll(false);
              }}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${filter === tab ? "border-[#1f1a17] bg-[#1f1a17] text-white" : "border-black/10 bg-white/70 text-[#625b53] hover:bg-white"}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {visible.map((video) => (
            <a key={video.id} href={video.href} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-[26px] border border-black/10 bg-white shadow-[0_18px_48px_rgba(24,18,13,0.07)] transition hover:-translate-y-1.5 hover:shadow-[0_28px_70px_rgba(24,18,13,0.14)]">
              <div className="relative aspect-video overflow-hidden bg-[#211b17]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={video.thumb ?? `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <span className="absolute left-3 top-3 flex h-12 min-w-24 items-center justify-center rounded-2xl bg-white px-3 shadow-[0_12px_30px_rgba(0,0,0,0.2)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={video.logo} alt={video.logoAlt} loading="lazy" className="max-h-8 w-auto max-w-[120px] object-contain" />
                </span>
                <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/92 text-[#1f1a17] shadow-[0_14px_36px_rgba(0,0,0,0.28)] transition group-hover:scale-110 group-hover:bg-[#d4c09a]">
                  <span className="ml-1 text-lg">▶</span>
                </span>
              </div>
              <div className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a7654]">{video.category}</p>
                <h3 className="mt-3 text-xl font-semibold leading-tight">{video.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#625b53]">{video.body}</p>
              </div>
            </a>
          ))}
        </div>
        {hasMore ? (
          <div className="mt-10 flex justify-center">
            <button type="button" onClick={() => setShowAll((current) => !current)} className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-[#1f1a17] shadow-sm transition hover:bg-[#d4c09a]">
              {showAll ? "Show Fewer Videos" : "See More Videos"}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function PracticeLookup() {
  return (
    <section id="practice-lookup" data-theme="light" className="bg-[#f2eee7] px-6 py-20 md:px-10 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
        <SectionHeader eyebrow="Practice Lookup" title="Find the right support path for your account." body="Use the original lookup-style path: start with your lab or account need, then contact the correct team. No map required." />
        <div className="grid gap-4 md:grid-cols-3">
          {serviceContacts.map(([name, phone, email]) => (
            <article key={name} className="rounded-[24px] border border-black/10 bg-white p-5 shadow-[0_16px_42px_rgba(24,18,13,0.06)]">
              <h3 className="text-xl font-semibold">{name}</h3>
              <a href={`tel:${phone.replace(/\D/g, "")}`} className="mt-4 block font-semibold text-[#8a7654]">{phone}</a>
              <a href={`mailto:${email}`} className="mt-2 block break-words text-sm leading-6 text-[#625b53]">{email}</a>
            </article>
          ))}
          <div className="rounded-[24px] border border-[#c9b28b] bg-[#1f1a17] p-5 text-white shadow-[0_18px_48px_rgba(24,18,13,0.15)] md:col-span-3">
            <p className="text-sm leading-7 text-white/72">
              Not sure which lab supports your account? Contact Artisan support and include your practice name, city, and account number if available.
            </p>
            <a href="mailto:customerservice@artisanlabnetwork.com?subject=Practice%20Lookup%20Request" className="mt-5 inline-flex rounded-full bg-[#d4c09a] px-5 py-2.5 text-sm font-semibold text-[#171311]">
              Request Practice Lookup
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function CustomerService() {
  return (
    <section id="lab-customer-service" data-theme="dark" className="bg-[#171311] px-6 py-20 text-white md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeader dark eyebrow="Customer Service" title="Talk to the right lab team." body="For practical order support, contact the lab team closest to your account." />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {serviceContacts.map(([name, phone, email]) => (
            <article key={name} className="rounded-[24px] border border-white/12 bg-white/[0.055] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
              <h3 className="text-xl font-semibold">{name}</h3>
              <a href={`tel:${phone.replace(/\D/g, "")}`} className="mt-5 block font-semibold text-[#d4c09a]">{phone}</a>
              <a href={`mailto:${email}`} className="mt-3 block break-words text-sm leading-6 text-white/72">{email}</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SupportCta({ version }: { version: Version }) {
  return (
    <section data-theme="light" className="bg-[linear-gradient(180deg,#fbf8f3_0%,#f5f1eb_100%)] px-6 py-20 md:px-10 md:py-24">
      <div className="mx-auto max-w-5xl rounded-[34px] border border-[#e1d4c2] bg-white p-8 text-center shadow-[0_24px_60px_rgba(24,18,13,0.08)] md:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#8a7654]">Support</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
          {version === "c" ? "Need a fast answer?" : "Need help finding the right resource?"}
        </h2>
        <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[#625b53]">
          Tell us what you are trying to solve and we will point you to the clearest next step.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a href="mailto:customerservice@artisanlabnetwork.com?subject=Provider%20Resources%20Help" className="rounded-full bg-[#1f1a17] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#d4c09a] hover:text-[#1f1a17]">
            Contact Support
          </a>
          <a href={SIGNUP_URL} target="_blank" rel="noreferrer" className="rounded-full border border-black/10 bg-[#fbf8f3] px-7 py-3 text-sm font-semibold text-[#1f1a17] transition hover:bg-[#d4c09a]">
            Open an Account
          </a>
        </div>
      </div>
    </section>
  );
}

export default function ProviderResourcesVersionLayout({ version }: { version: Version }) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f1eb] text-[#1f1a17]">
      <Header signUpHref={SIGNUP_URL} />
      <Hero version={version} />
      {version === "c" ? (
        <>
          <ToolsSection version={version} />
          <SystemsSection version={version} />
          <PracticeLookup />
          <VideoSection />
          <BrandLibrary compact />
          <VspSection />
          <CustomerService />
        </>
      ) : (
        <>
          <SystemsSection version={version} />
          <ToolsSection version={version} />
          <VspSection />
          <BrandLibrary compact={version === "a"} />
          <VideoSection />
          <PracticeLookup />
          <CustomerService />
        </>
      )}
      <SupportCta version={version} />
      <Footer signUpHref={SIGNUP_URL} />
    </main>
  );
}
