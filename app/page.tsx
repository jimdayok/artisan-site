"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Header from "./components/Header";
import NetworkMap from "./components/NetworkMap";
import Footer from "./components/Footer";

const ACCOUNT_APPLICATION_URL = "https://form.typeform.com/to/quuPCSff";
const CONTACT_FORM_URL = "https://form.typeform.com/to/m0lQ9zjD";
const CAPABILITY_AUTO_COLLAPSE_MS = 9000;
const PROOF_ROTATION_MS = 5500;

const heroPaths = [
  {
    title: "I’m learning about the Artisan Lab Network",
    body: "See how our connected labs support independent practices with more choice, better service, and stronger partnership.",
    cta: "Explore the Network",
    href: "#better-model",
  },
  {
    title: "I’m an Artisan Partner looking for resources",
    body: "Find product guides, training, ordering tools, patient resources, and support materials.",
    cta: "Visit Partner Resources",
    href: "/provider-resources",
  },
];

const eventCards = [
  {
    name: "OAO Convention",
    date: "May 1–2, 2026",
    location: "Sunriver, OR",
    description:
      "Opticians from across Oregon gather for education, networking, and collaboration with industry partners.",
    logo: "/oao-logo.jpg",
    logoAlt: "OAO Convention logo",
  },
  {
    name: "UOA Leadership Conference",
    date: "June 25–27, 2026",
    location: "Chicago, IL",
    description:
      "Opticians and industry leaders gather to explore innovation, leadership, and the future of opticianry.",
    logo: "/uoa-logo.jpg",
    logoAlt: "UOA Leadership Conference logo",
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
    href: "/provider-resources/professional-resources#tokai",
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

const betterModelCards = [
  {
    id: "freedom",
    title: "Freedom to Choose",
    icon: "/icons/artisan/freedom-to-choose.svg",
    body: "More lens options. Less forcing you into one path.",
    expandedTitle: "Partner Brands",
    expandedBody:
      "Access the lens brands your practice knows and trusts, with the freedom to choose what fits each patient best.",
  },
  {
    id: "transparency",
    title: "Transparency",
    icon: "/icons/artisan/transparency.svg",
    body: "You always know what to expect: service, timing, and cost.",
    expandedBody:
      "Clear expectations matter. Artisan Lab Network is built to give practices better visibility into service, timing, communication, and cost so teams can plan with confidence.",
  },
  {
    id: "flexibility",
    title: "Flexibility",
    icon: "/icons/artisan/flexibility.svg",
    body: "Systems designed to support your process, not punish it.",
    expandedBody:
      "Your practice should not have to change everything to work with your lab. Our systems are designed to support different workflows, ordering methods, product preferences, and practice needs.",
  },
  {
    id: "outcomes",
    title: "Outcomes First",
    icon: "/icons/artisan/outcomes-first.svg",
    body: "Better turnaround, better consistency, better patient experience.",
    expandedBody:
      "Better lab relationships should lead to better results. Our network is focused on dependable turnaround, consistent quality, stronger communication, and a better patient experience.",
  },
];

const capabilities = [
  {
    title: "Freeform lens options",
    icon: "/icons/artisan/freedom-to-choose.svg",
    detail:
      "We carry products from major lens vendors and give practices more freedom of choice.",
    link: { label: "Jump to vendor partners", href: "#vendor-partners" },
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
    title: "Open platform ordering",
    icon: "/icons/artisan/integrated-systems.svg",
    detail:
      "We accept orders from SpecCheck, DVI Rx Wizard, VisionWeb, and Eyefinity.",
    link: { label: "Learn more about SpecCheck", href: "https://speccheckrx.com" },
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

const proofQuotes = [
  {
    quote: "We finally feel like we have options again.",
    label: "Doctor testimonial placeholder",
    initials: "DR",
  },
  {
    quote: "Turnaround feels more predictable, and my team has fewer headaches.",
    label: "Optician testimonial placeholder",
    initials: "OP",
  },
  {
    quote: "The difference is not just service. It is control.",
    label: "Practice owner testimonial placeholder",
    initials: "PO",
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

function BetterModelCard({
  card,
  isOpen,
  onToggle,
}: {
  card: (typeof betterModelCards)[number];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const panelId = `better-model-${card.id}-panel`;

  return (
    <motion.article
      variants={cardReveal}
      className={`group rounded-2xl border border-[#d6c3a1]/50 bg-[#fffaf2]/85 p-6 shadow-[0_18px_45px_rgba(49,39,26,0.08)] backdrop-blur-md transition hover:-translate-y-1 hover:border-[#c9b28b] hover:bg-[#fffaf2] hover:shadow-[0_24px_64px_rgba(49,39,26,0.13)] ${
        isOpen ? "" : "min-h-[156px]"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-start justify-between gap-4 text-left"
      >
        <span className="flex items-start gap-4">
          <ArtisanIcon
            src={card.icon}
            size="sm"
            className="h-12 w-12 border-[#d6c3a1]/55 bg-white/70 shadow-[0_10px_24px_rgba(49,39,26,0.06)]"
          />
          <span>
            <span className="block text-xs uppercase tracking-[0.24em] text-black/50 md:tracking-[0.28em]">
              {card.title}
            </span>
            <span className="mt-2 block text-xl font-semibold text-[#1f1718]">
              {card.body}
            </span>
          </span>
        </span>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#d6c3a1]/70 bg-white/75 text-2xl leading-none text-[#7d6746] shadow-sm transition">
          {isOpen ? "−" : "+"}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id={panelId}
            key="expanded"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <div className="mt-5 border-t border-[#d6c3a1]/45 pt-5">
              {card.id !== "transparency" ? (
                <>
                  {card.expandedTitle ? (
                    <h3 className="text-lg font-semibold text-[#1f1718]">
                      {card.expandedTitle}
                    </h3>
                  ) : null}
                  <p className="mt-2 text-sm leading-7 text-black/66">
                    {card.expandedBody}
                  </p>
                </>
              ) : null}

              {card.id === "freedom" ? (
                <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                  {partnerBrands.map((brand) => (
                    <Link
                      key={brand.name}
                      href={brand.href}
                      className={`group flex h-24 items-center justify-center rounded-xl border border-[#dfd2bf] bg-white px-4 py-4 shadow-[0_10px_28px_rgba(49,39,26,0.06)] transition hover:-translate-y-0.5 hover:border-[#bca37a] hover:shadow-[0_16px_38px_rgba(49,39,26,0.12)] ${
                        brand.cardLabel ? "flex-col" : ""
                      }`}
                      aria-label={`View ${brand.name} resources`}
                    >
                      <Image
                        src={brand.logo}
                        alt={`${brand.name} logo`}
                        width={220}
                        height={80}
                        className={`${brand.logoClass} object-contain transition group-hover:scale-[1.02]`}
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

              {card.id === "transparency" ? (
                <div className="transparency-expanded-content mt-5 rounded-2xl border border-[#d6c3a1]/45 bg-white/72 p-4 shadow-[0_18px_44px_rgba(49,39,26,0.08)] md:p-5">
                  <div className="transparency-dashboard-header">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">
                      Transparency
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold leading-tight text-[#1f1718] md:text-3xl">
                      Real numbers. Clear expectations. No surprises.
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[#625b53] md:text-base">
                      Simple reporting, easy to understand pricing, and service standards your team can track.
                    </p>
                  </div>

                  <div className="mt-10">
                    <p className="transparency-performance-label text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8a7654]">
                      Performance Overview
                    </p>

                    <div className="mt-10 grid gap-6 md:grid-cols-2 md:gap-8">
                      {[
                        {
                          title: "Days Per Order",
                          icon: "/turntime-icon.png",
                          alt: "3.5 Days Per Order. Average turnaround time across completed orders.",
                        },
                        {
                          title: "Service Levels",
                          icon: "/service-icon.png",
                          alt: "98%+ Service Levels. Reliable performance your practice can track.",
                        },
                        {
                          title: "Minute Hold Time",
                          icon: "/holdtime-icon.png",
                          alt: "Less than 1 Minute Hold Time. Average hold time to customer service.",
                        },
                        {
                          title: "Tariff Fees",
                          icon: "/tariff-icon.png",
                          alt: "$0 Tariff Fees. No tariff passthrough fees. Clear pricing from the start.",
                        },
                      ].map((metric) => (
                        metric.title === "Service Levels" ? (
                          <Link
                            key={metric.title}
                            href="/break-the-system"
                            aria-label="Break the System"
                            className="block rounded-2xl border border-black/10 bg-white p-3 shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(0,0,0,0.12)]"
                          >
                            <img
                              src={metric.icon}
                              alt={metric.alt}
                              className="h-auto w-full rounded-xl object-contain"
                            />
                          </Link>
                        ) : (
                        <div
                            key={metric.title}
                            className="rounded-2xl border border-black/10 bg-white p-3 shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(0,0,0,0.12)]"
                          >
                          <img
                            src={metric.icon}
                            alt={metric.alt}
                            className="h-auto w-full rounded-xl object-contain"
                          />
                        </div>
                        )
                      ))}
                    </div>

                    <div className="mt-8 h-1 w-full rounded-full bg-[#e5ddd2]" />

                    <p className="transparency-footer-line mt-3 text-center text-sm text-[#6b6259]">
                      Clear reports. Simple pricing. No tariff passthrough fees.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  );
}

export default function Home() {
  const [showHeroBox, setShowHeroBox] = useState(true);
  const [activeBetterModelCard, setActiveBetterModelCard] = useState<string | null>(null);
  const [activeCapability, setActiveCapability] = useState<string | null>(null);
  const [activeProof, setActiveProof] = useState(0);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    if (activeCapability === null) return;
    const timer = setTimeout(() => setActiveCapability(null), CAPABILITY_AUTO_COLLAPSE_MS);
    return () => clearTimeout(timer);
  }, [activeCapability]);

  useEffect(() => {
    const timer = setInterval(
      () => setActiveProof((prev) => (prev + 1) % proofQuotes.length),
      PROOF_ROTATION_MS
    );
    return () => clearInterval(timer);
  }, []);

  const activeProofQuote = proofQuotes[activeProof];

  const renderBetterModelCard = (card: (typeof betterModelCards)[number]) => (
    <BetterModelCard
      key={card.id}
      card={card}
      isOpen={activeBetterModelCard === card.id}
      onToggle={() =>
        setActiveBetterModelCard((current) =>
          current === card.id ? null : card.id
        )
      }
    />
  );

  const goToProof = (direction: "prev" | "next") => {
    setActiveProof((prev) => {
      if (direction === "prev") return (prev - 1 + proofQuotes.length) % proofQuotes.length;
      return (prev + 1) % proofQuotes.length;
    });
  };
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

      {/* FIXED BACKGROUND MEDIA */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-black bg-cover bg-center"
        style={{ backgroundImage: "url('/backgroundimage.jpeg')" }}
      >
        <video className="h-full w-full bg-black/80 object-contain object-center md:hidden" autoPlay loop muted playsInline preload="metadata" poster="/backgroundimage.jpeg">
          <source src="https://pub-92e180f20b704255b9a7625dd6a6cb0b.r2.dev/hero-vertical.mp4" type="video/mp4" />
        </video>
        <video className="hidden h-full w-full bg-black/80 object-contain object-center md:block" autoPlay loop muted playsInline preload="metadata" poster="/backgroundimage.jpeg">
          <source src="https://pub-92e180f20b704255b9a7625dd6a6cb0b.r2.dev/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* HERO */}
      <section
        id="top"
        data-theme="dark"
        className="relative z-20 min-h-[100svh] overflow-hidden"
      >
        <div className={`pointer-events-none absolute inset-0 transition-colors duration-500 ${showHeroBox ? "bg-black/54" : "bg-black/18"}`} />

        <div className="relative z-20 flex min-h-[100svh] items-center justify-center px-5 pb-12 pt-24 text-center md:px-6 md:pt-28">
          <AnimatePresence>
            {showHeroBox && (
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="relative w-full max-w-5xl rounded-2xl border border-white/15 bg-black/46 px-5 py-6 text-center shadow-[0_28px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl md:px-7 md:py-7"
              >
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
                  <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">
                    What brought you to Artisan?
                  </h1>
                  <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/74 md:text-lg">
                    Choose the path that fits you best and we’ll help you find the right next step.
                  </p>
                </div>

                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="whileInView"
                  className="mt-7 grid gap-3 md:grid-cols-2"
                >
                  {heroPaths.map((path) => (
                    <motion.a
                      key={path.title}
                      href={path.href}
                      variants={cardReveal}
                      className="group flex min-h-[172px] flex-col rounded-xl border border-white/12 bg-white/[0.075] p-5 text-left shadow-[0_14px_44px_rgba(0,0,0,0.20)] transition duration-300 hover:-translate-y-1 hover:border-[#d4c09a]/55 hover:bg-white/[0.105]"
                    >
                      <h2 className="text-xl font-semibold leading-tight text-white md:text-2xl">
                        {path.title}
                      </h2>
                      <p className="mt-3 flex-1 text-sm leading-6 text-white/66">
                        {path.body}
                      </p>
                      <div className="mt-5 inline-flex w-fit items-center rounded-full border border-[#d4c09a]/35 bg-[#d4c09a] px-4 py-2.5 text-sm font-semibold text-black transition group-hover:bg-[#e2cca2]">
                        {path.cta}
                        <span className="ml-2 transition group-hover:translate-x-0.5">→</span>
                      </div>
                    </motion.a>
                  ))}
                </motion.div>

                <div className="mt-6 flex flex-col items-center justify-center gap-3 border-t border-white/10 pt-5 sm:flex-row sm:flex-wrap">
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
                    <a href="/artisan-model" className="font-semibold text-[#d4c09a] underline decoration-[#d4c09a]/45 underline-offset-4 transition hover:text-white">
                      Learn about the Artisan model.
                    </a>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* PROBLEM */}
      <section
        data-theme="dark"
        className="relative px-6 py-[72px] md:py-20"
        style={{
          backgroundImage: "url('/backgroundwithglasses2.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-black/75" />
        <div className="relative z-20 max-w-7xl mx-auto">
          <motion.div {...fadeUp}>
            <h2 className="text-4xl md:text-5xl font-semibold text-white">
            The Corporate Lab Problem
            </h2>
            <p className="mt-4 text-lg text-white/75 max-w-3xl">
              Corporate labs look safe, until you realize they’re designed to limit your control, limit your choices, and limit your margins.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-7 grid gap-4 md:grid-cols-2"
          >
            {[
              "Restricted product choice",
              "Pricing pressure, always pushing down",
              "Slow or inconsistent turnaround",
              "Poor communication and surprise delays",
              "Policies that make you feel boxed in",
            ].map((item) => (
              <motion.div
                key={item}
                variants={cardReveal}
                className="rounded-2xl bg-white/5 border border-white/15 backdrop-blur-md p-5 shadow-[0_14px_45px_rgba(0,0,0,0.12)] transition hover:-translate-y-1 hover:border-[#d4c09a]/45 hover:bg-white/[0.075] md:p-6"
              >
                <div className="text-[#d4c09a] text-xs uppercase tracking-[0.28em]">YOU FEEL IT</div>
                <div className="mt-3 text-lg text-white">{item}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SOLUTION / HOW IT WORKS */}
      <section
        data-theme="light"
        className="relative px-6 py-16 text-black md:py-[72px]"
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
          style={{ backgroundImage: "url('/Rings.png')" }}
          aria-hidden="true"
        />
        <div className="relative z-20 max-w-7xl mx-auto">
          <div id="better-model" className="scroll-mt-24">
            <motion.div {...fadeUp}>
              <h2 className="text-4xl md:text-5xl font-semibold">The Better Model</h2>
              <p className="mt-4 max-w-3xl text-lg text-black/72">
                Artisan Lab Network gives you freedom of choice, real partnership, and a modern system that fits the way you run your practice.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true, amount: 0.2 }}
              className="mt-7 grid items-start gap-6 md:grid-cols-2"
            >
              {betterModelCards.map(renderBetterModelCard)}
            </motion.div>
          </div>

          <div className="my-20 h-px w-full bg-black/10" />

          <div id="how-it-works" className="scroll-mt-24">
            <motion.div {...fadeUp}>
              <h2 className="text-4xl md:text-5xl font-semibold">How the Network Works</h2>
              <p className="mt-4 text-lg text-black/75 max-w-3xl">
                Multiple labs. Real systems. Simple control. Built for modern independent practices.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true, amount: 0.2 }}
              className="mt-8 grid gap-4 md:grid-cols-3"
            >
              {[
                {
                  title: "Multiple Labs",
                  body: "Strength + flexibility across the network.",
                  icon: "/icons/artisan/multiple-labs.svg",
                },
                {
                  title: "In-House Production",
                  body: "Quality you can rely on.",
                  icon: "/icons/artisan/in-house-production.svg",
                },
                {
                  title: "Integrated Systems",
                  body: "Ordering and updates without chaos.",
                  icon: "/icons/artisan/integrated-systems.svg",
                },
              ].map((step) => (
                <motion.div
                  key={step.title}
                  variants={cardReveal}
                  className="group rounded-2xl bg-white/80 border border-black/10 p-5 shadow backdrop-blur-md transition hover:-translate-y-1 hover:border-[#c9b28b] hover:bg-white hover:shadow-[0_24px_64px_rgba(49,39,26,0.12)] md:p-6"
                >
                  <ArtisanIcon
                    src={step.icon}
                    className="mb-5 h-14 w-14 border-[#d6c3a1]/55 bg-[#fffaf2]/75"
                  />
                  <div className="text-xs uppercase tracking-[0.28em] text-black/50">{step.title}</div>
                  <div className="mt-2 text-xl font-semibold text-[#1f1718]">{step.body}</div>
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#labs"
                className="rounded-full border border-black/15 bg-white/70 px-6 py-3 text-sm font-semibold text-black hover:bg-white"
              >
                Meet the Labs
              </a>
              <a
                href={ACCOUNT_APPLICATION_URL}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-[#d4c09a] px-6 py-3 text-sm font-semibold text-black hover:opacity-90 shadow"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* OUR LABS */}
      <NetworkMap
        layout="stacked"
        sectionId="labs"
        eyebrow="Our Labs"
        title="Three Labs. One Standard."
        description="Click a lab on the map or choose a location below to view contact details, customer service, and website links."
        panelEyebrow="Explore Our Network"
        panelTitle="Lab Locations"
        panelDescription="Start small, then open a lab when you need the details."
      />

      {/* CAPABILITIES */}
      <section
        id="capabilities"
        data-theme="dark"
        className="relative px-6 pb-14 pt-24 md:pb-16 md:pt-28 lg:pb-20"
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

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

                        {cap.link ? (
                          <a
                            href={cap.link.href}
                            target={cap.link.href.startsWith("http") ? "_blank" : undefined}
                            rel={cap.link.href.startsWith("http") ? "noreferrer" : undefined}
                            className="mt-4 inline-flex rounded-full border border-[#d4c09a]/50 px-4 py-2 text-sm font-semibold text-[#d4c09a] transition hover:bg-[#d4c09a] hover:text-black"
                          >
                            {cap.link.label}
                          </a>
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

      {/* SOCIAL PROOF */}
      <section
        id="proof"
        data-theme="dark"
        className="relative px-6 py-16 text-white md:py-[72px]"
        style={{
          backgroundImage: "url('/backgroundimage.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-black/84" />
        <motion.div
          {...fadeUp}
          className="relative z-20 max-w-7xl mx-auto"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-[#d6c09a]">
                Proof
              </div>
              <h2 className="mt-2 text-4xl font-semibold md:text-5xl">
                Placeholder Stories, Built to Swap.
              </h2>
            </div>

            <p className="max-w-md text-sm text-white/65">
              These cards show the final testimonial format. Replace the placeholder quotes and photo areas before publish.
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
            <div className="overflow-hidden rounded-[22px] border border-white/15 bg-white/8 p-5 shadow-2xl backdrop-blur-xl md:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeProofQuote.label}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.28 }}
                  className="grid gap-6 md:grid-cols-[140px_1fr] md:items-center"
                >
                  <div className="mx-auto grid h-32 w-32 place-items-center rounded-full border border-[#d4c09a]/45 bg-black/35 shadow-inner md:h-36 md:w-36">
                    <div className="text-center">
                      <div className="text-3xl font-semibold text-[#d4c09a]">
                        {activeProofQuote.initials}
                      </div>
                      <div className="mt-2 text-[10px] uppercase tracking-[0.22em] text-white/45">
                        Photo placeholder
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-[0.28em] text-[#d4c09a]">
                      {activeProofQuote.label}
                    </div>
                    <blockquote className="mt-4 text-3xl font-semibold leading-tight text-white md:text-4xl">
                      &ldquo;{activeProofQuote.quote}&rdquo;
                    </blockquote>
                    <p className="mt-4 max-w-xl text-sm leading-6 text-white/62">
                      Placeholder testimonial copy for layout review only. Final quotes and headshots should be added before publish.
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
                <div className="flex gap-2">
                  {proofQuotes.map((quote, index) => (
                    <button
                      key={quote.label}
                      type="button"
                      aria-label={`Show ${quote.label}`}
                      onClick={() => setActiveProof(index)}
                      className={`h-2.5 rounded-full transition-all ${
                        index === activeProof ? "w-9 bg-[#d4c09a]" : "w-2.5 bg-white/25 hover:bg-white/45"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    aria-label="Previous testimonial"
                    onClick={() => goToProof("prev")}
                    className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/8 text-lg text-white transition hover:bg-white/14"
                  >
                    &lt;
                  </button>
                  <button
                    type="button"
                    aria-label="Next testimonial"
                    onClick={() => goToProof("next")}
                    className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/8 text-lg text-white transition hover:bg-white/14"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              {proofQuotes.map((quote, index) => (
                <button
                  key={quote.label}
                  type="button"
                  onClick={() => setActiveProof(index)}
                  className={`rounded-[18px] border p-4 text-left backdrop-blur-md transition-all ${
                    index === activeProof
                      ? "border-[#d4c09a] bg-white/12 shadow-xl"
                      : "border-white/15 bg-white/6 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="text-xs uppercase tracking-[0.24em] text-[#d4c09a]">
                    {quote.label}
                  </div>
                  <div className="mt-3 text-lg font-semibold text-white">
                    &ldquo;{quote.quote}&rdquo;
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* OWNERSHIP / PARTNERSHIP */}
      <section
        data-theme="dark"
        className="relative px-6 py-16 md:py-[72px]"
        style={{
          backgroundImage: "url('/backgroundimage.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-black/80" />
        <div className="relative z-20 max-w-7xl mx-auto">
          <motion.div {...fadeUp}>
            <h2 className="text-4xl md:text-5xl font-semibold">Partnership, Not Pitches</h2>
            <p className="mt-4 text-lg text-white/75 max-w-3xl">
              In some cases, qualified practices can participate in ownership by invitation. It creates deeper alignment and a stronger long-term relationship.
            </p>
          </motion.div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {[
              "More alignment",
              "More loyalty",
              "More control over your experience",
            ].map((x) => (
              <motion.div
                key={x}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.42, ease: "easeOut" }}
                className="rounded-2xl bg-white/5 border border-white/15 backdrop-blur-md p-5 md:p-6"
              >
                <div className="text-[#d4c09a] text-xs uppercase tracking-[0.28em]">OUTCOME</div>
                <div className="mt-3 text-xl text-white">{x}</div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8">
            <button
              type="button"
              onClick={openContactModal}
              className="rounded-full bg-[#d4c09a] px-6 py-3 text-sm font-semibold text-black hover:opacity-90 shadow"
            >
              Contact Us
            </button>
          </div>

          <div className="mt-5 text-xs text-white/50">
            Ownership details are available only by invitation and subject to applicable requirements and regulations.
          </div>

          <a
            href="/artisan-model"
            className="mt-5 inline-flex text-sm font-semibold text-[#d4c09a] transition hover:text-white"
          >
            Learn how the model works →
          </a>
        </div>
      </section>

      <span id="vendor-partners" className="block scroll-mt-24" aria-hidden="true" />

      {/* RESOURCES (placeholder) */}
      <section
        id="resources"
        data-theme="light"
        className="relative px-6 py-14 text-black md:py-16"
        style={{
          backgroundImage: "url('/backgroundwithglasses1.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-white/70" />
        <div className="relative z-20 max-w-7xl mx-auto">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-semibold">Resources</h2>
            <p className="mt-3 text-black/65 max-w-3xl">
              Practice resources, patient education, and tools to help your team run smoother.
            </p>
          </motion.div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <motion.a
              href="/provider-resources"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.42, ease: "easeOut" }}
              className="group flex min-h-[174px] flex-col rounded-2xl bg-white/80 border border-black/10 p-5 shadow transition hover:-translate-y-1 hover:bg-white md:p-6"
            >
              <ArtisanIcon
                src="/icons/artisan/resources.svg"
                className="mb-5 h-14 w-14 border-[#d6c3a1]/55 bg-[#fffaf2]/75"
              />
              <div className="text-lg font-semibold">Practice Resources</div>
              <p className="mt-3 text-sm leading-6 text-black/60">
                Tools and information for independent practice teams.
              </p>
            </motion.a>
            <motion.a
              href="/patient-resources"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.42, delay: 0.04, ease: "easeOut" }}
              className="group flex min-h-[174px] flex-col rounded-2xl bg-white/80 border border-black/10 p-5 shadow transition hover:-translate-y-1 hover:bg-white md:p-6"
            >
              <ArtisanIcon
                src="/icons/artisan/patient-resources.svg"
                className="mb-5 h-14 w-14 border-[#d6c3a1]/55 bg-[#fffaf2]/75"
              />
              <div className="text-lg font-semibold">Patient Resources</div>
              <p className="mt-3 text-sm leading-6 text-black/60">
                Education and support content for patient conversations.
              </p>
            </motion.a>
            <motion.a
              href="#labs"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.42, delay: 0.08, ease: "easeOut" }}
              className="group flex min-h-[174px] flex-col rounded-2xl bg-white/80 border border-black/10 p-5 shadow transition hover:-translate-y-1 hover:bg-white md:p-6"
            >
              <ArtisanIcon
                src="/icons/artisan/integrated-systems.svg"
                className="mb-5 h-14 w-14 border-[#d6c3a1]/55 bg-[#fffaf2]/75"
              />
              <div className="text-lg font-semibold">Lab Resources</div>
              <p className="mt-3 text-sm leading-6 text-black/60">
                Practical lab access, ordering, and product information.
              </p>
            </motion.a>
            <motion.a
              href="/artisan-model"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.42, delay: 0.12, ease: "easeOut" }}
              className="group flex min-h-[174px] flex-col rounded-2xl bg-white/80 border border-[#d4c09a]/60 p-5 shadow transition hover:-translate-y-1 hover:bg-white md:p-6"
            >
              <ArtisanIcon
                src="/icons/artisan/partner-mindset.svg"
                className="mb-5 h-14 w-14 border-[#d4c09a]/70 bg-[#fffaf2]/75"
              />
              <div className="text-lg font-semibold">Lab Ownership &amp; Partnership</div>
              <p className="mt-3 text-sm leading-6 text-black/60">
                Learn how some practices participate more deeply in the Artisan model.
              </p>
            </motion.a>
          </div>
        </div>
      </section>

      <section
        id="where-well-be"
        data-theme="light"
        className="relative overflow-hidden bg-[#f5f1eb] px-6 py-16 text-[#1f1a17] md:py-20"
      >
        <div
          className="pointer-events-none absolute -left-28 top-8 h-[460px] w-[460px] bg-contain bg-center bg-no-repeat opacity-[0.08]"
          style={{ backgroundImage: "url('/Rings.png')" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-40 right-0 h-[520px] w-[520px] bg-contain bg-center bg-no-repeat opacity-[0.045]"
          style={{ backgroundImage: "url('/Rings.png')" }}
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
                className="group rounded-[28px] border border-[#d8c6a8]/70 bg-white/86 p-6 shadow-[0_18px_55px_rgba(49,39,26,0.08)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[#c9b28b] hover:bg-white hover:shadow-[0_26px_70px_rgba(49,39,26,0.13)] md:p-7"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-24 w-32 shrink-0 items-center justify-center rounded-2xl border border-black/10 bg-white p-4 shadow-[0_10px_28px_rgba(49,39,26,0.07)]">
                    <Image
                      src={event.logo}
                      alt={event.logoAlt}
                      width={220}
                      height={120}
                      className="max-h-16 w-auto max-w-full object-contain"
                    />
                  </div>
                  <div>
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
                <p className="mt-5 text-sm leading-7 text-[#625b53] md:text-base">
                  {event.description}
                </p>
                <button
                  type="button"
                  onClick={openContactModal}
                  className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-[#d8c6a8] bg-[#fbf8f3] px-5 py-2.5 text-sm font-semibold text-[#1f1a17] shadow-sm transition hover:-translate-y-0.5 hover:border-[#d4c09a] hover:bg-[#d4c09a]"
                >
                  Schedule a Meeting
                </button>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section data-theme="dark" className="relative overflow-hidden px-6 py-16 md:py-[72px]">
        <div
          className="pointer-events-none absolute -right-24 -top-32 h-[520px] w-[520px] bg-contain bg-center bg-no-repeat opacity-[0.07]"
          style={{ backgroundImage: "url('/Rings.png')" }}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-0 bg-black/70" />
        <motion.div
          {...fadeUp}
          className="relative z-20 max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-semibold">Ready to Get Control Back?</h2>
          <p className="mt-4 text-lg text-white/75 max-w-3xl mx-auto">
            If you’re tired of feeling boxed in by corporate labs, we’ll show you a better path—fast.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href={ACCOUNT_APPLICATION_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[#d4c09a] px-6 py-3 text-sm font-semibold text-black hover:opacity-90 shadow"
            >
              Get Started With Us
            </a>
            <button
              type="button"
              onClick={openContactModal}
              className="rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-semibold hover:bg-white/15 hover:border-white/25"
            >
              Contact Us
            </button>
          </div>
        </motion.div>
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
