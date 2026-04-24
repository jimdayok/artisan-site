"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "./components/Header";
import LabsSection from "./components/LabsSection";
import NetworkMap from "./components/NetworkMap";
import Footer from "./components/Footer";

const ACCOUNT_APPLICATION_URL = "https://form.typeform.com/to/quuPCSff";
const CONTACT_FORM_URL = "https://form.typeform.com/to/m0lQ9zjD";
const CAPABILITY_AUTO_COLLAPSE_MS = 9000;
const PROOF_ROTATION_MS = 5500;

const capabilities = [
  {
    title: "Freeform lens options",
    detail:
      "We carry products from major lens vendors and give practices more freedom of choice.",
    link: { label: "Jump to vendor partners", href: "#vendor-partners" },
  },
  {
    title: "AR treatments",
    detail:
      "Artisan AR treatments and TechShield AR treatments are produced on site. Additional access is available to Hoya, Shamir, Glacier, and Tokai AR options.",
  },
  {
    title: "Fast turnaround",
    detail:
      "Connected production across the network helps improve turnaround, consistency, and confidence for practices and patients.",
  },
  {
    title: "Open platform ordering",
    detail:
      "We accept orders from SpecCheck, DVI Rx Wizard, VisionWeb, and Eyefinity.",
    link: { label: "Learn more about SpecCheck", href: "https://speccheckrx.com" },
  },
  {
    title: "Clear communication",
    detail:
      "We provide clear and transparent WIP reports, access to real-time order information, and chat features with the lab.",
  },
  {
    title: "Quality control you can count on",
    // Claim is supported by internal/source data; keep verification package ready before final publish.
    detail:
      "We maintain a satisfaction rate above 98% and rank in the top third of DVI labs for low remake rates according to published data.",
  },
  {
    title: "Support that scales with you",
    detail:
      "Comprehensive Artisan Intel reports, regular training programs, and strong resources for opticians and staff.",
  },
  {
    title: "A partner mindset",
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

export default function Home() {
  const [showHeroMessage, setShowHeroMessage] = useState(true);
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
      <div className="pointer-events-none fixed inset-0 z-0">
        <video className="h-full w-full bg-black object-cover object-center md:hidden" autoPlay loop muted playsInline poster="/backgroundimage.jpeg">
          <source src="https://pub-92e180f20b704255b9a7625dd6a6cb0b.r2.dev/hero-vertical.mp4" type="video/mp4" />
        </video>
        <video className="hidden h-full w-full bg-black object-contain object-top md:block" autoPlay loop muted playsInline poster="/backgroundimage.jpeg">
          <source src="https://pub-92e180f20b704255b9a7625dd6a6cb0b.r2.dev/hero.mp4" type="video/mp4" />
        </video>
      </div>

      {/* HERO */}
      <section
        id="top"
        data-theme="dark"
        className="relative z-20 min-h-[500px] overflow-hidden md:min-h-[560px] lg:min-h-[620px]"
      >
        {showHeroMessage ? <div className="pointer-events-none absolute inset-0 bg-black/68" /> : null}

        {showHeroMessage ? (
          <div className="relative z-20 flex min-h-[500px] items-center justify-center px-5 pt-16 text-center md:min-h-[560px] md:px-6 md:pt-[72px] lg:min-h-[620px]">
            <div className="relative max-w-5xl rounded-2xl border border-white/15 bg-black/42 px-5 py-6 shadow-2xl backdrop-blur-md md:px-8 md:py-8 lg:px-9">
              <button
                type="button"
                onClick={() => setShowHeroMessage(false)}
                aria-label="Hide intro message"
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/10 text-white/75 transition hover:border-white/30 hover:bg-white/20 hover:text-white"
              >
                <span aria-hidden="true" className="text-xl leading-none">
                  X
                </span>
              </button>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight">
                Take Control of Your Lab Relationship.
              </h1>
              <p className="mx-auto mt-3 max-w-4xl text-lg text-white/82 md:text-xl">
                Independence means choice. We help practices win with better options, faster service, and real partnership.
              </p>
              <p className="mx-auto mt-2 max-w-3xl text-sm font-medium text-[#d4c09a] md:text-base">
                The largest independent doctor-owned lab network in the United States.
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3 md:gap-4">
                <a
                  href={ACCOUNT_APPLICATION_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-[#d4c09a] px-5 py-3 text-sm font-semibold text-black shadow hover:opacity-90 md:px-6"
                >
                  Get Started
                </a>
                <a
                  href="#better-model"
                  className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold hover:border-white/25 hover:bg-white/15 md:px-6"
                >
                  Upgrade Your Lab Experience
                </a>
              </div>

              <a
                href="/artisan-model"
                className="mt-3 inline-flex text-sm font-semibold text-white/68 underline decoration-[#d4c09a]/45 underline-offset-4 transition hover:text-[#d4c09a]"
              >
                Discover Ownership →
              </a>

              <div className="mx-auto mt-5 max-w-[18rem] text-[10px] uppercase leading-5 tracking-[0.16em] text-[#d4c09a] sm:max-w-none sm:text-xs md:tracking-[0.35em]">
                Independent. Anti-Corporate. Pro-Patient.
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* PROBLEM */}
      <section
        data-theme="dark"
        className="relative px-6 py-[72px] md:py-20"
        style={{
          backgroundImage: "url('/backgroundwithglasses2.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-black/75" />
        <div className="relative z-20 max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-semibold text-white">
            The Corporate Lab Problem
          </h2>
          <p className="mt-4 text-lg text-white/75 max-w-3xl">
            Corporate labs look safe, until you realize they’re designed to limit your control, limit your choices, and limit your margins.
          </p>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {[
              "Restricted product choice",
              "Pricing pressure, always pushing down",
              "Slow or inconsistent turnaround",
              "Poor communication and surprise delays",
              "Policies that make you feel boxed in",
            ].map((item) => (
              <div key={item} className="rounded-2xl bg-white/5 border border-white/15 backdrop-blur-md p-5 md:p-6">
                <div className="text-[#d4c09a] text-xs uppercase tracking-[0.28em]">YOU FEEL IT</div>
                <div className="mt-3 text-lg text-white">{item}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section
        id="better-model"
        data-theme="light"
        className="relative bg-[#f2eee7] px-6 py-16 text-black md:py-[72px]"
      >
        <div className="relative z-20 max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-semibold">The Better Model</h2>
          <p className="mt-4 max-w-3xl text-lg text-black/72">
            Artisan Lab Network gives you freedom of choice, real partnership, and a modern system that fits the way you run your practice.
          </p>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {[
              { title: "Freedom to choose", body: "More lens options. Less forcing you into one path." },
              { title: "Transparency", body: "You always know what to expect: service, timing, and cost." },
              { title: "Flexibility", body: "Systems designed to support your process, not punish it." },
              { title: "Outcomes first", body: "Better turnaround, better consistency, better patient experience." },
            ].map((card) => (
              <div key={card.title} className="rounded-2xl border border-[#d6c3a1]/50 bg-[#fffaf2] p-6 shadow-[0_18px_45px_rgba(49,39,26,0.08)]">
                <div className="text-xs uppercase tracking-[0.24em] text-black/50 md:tracking-[0.28em]">{card.title}</div>
                <div className="mt-2 text-xl font-semibold text-[#1f1718]">{card.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OUR MODEL / HOW IT WORKS */}
      <section
        id="how-it-works"
        data-theme="light"
        className="relative px-6 py-16 text-black md:py-[72px]"
        style={{
          backgroundImage: "url('/backgroundwithglasses2.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-white/70" />
        <div className="relative z-20 max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-semibold">How the Network Works</h2>
          <p className="mt-4 text-lg text-black/75 max-w-3xl">
            Multiple labs. Real systems. Simple control. Built for modern independent practices.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { title: "Multiple Labs", body: "Strength + flexibility across the network." },
              { title: "In-House Production", body: "Quality you can rely on." },
              { title: "Integrated Systems", body: "Ordering and updates without chaos." },
            ].map((step) => (
              <div key={step.title} className="rounded-2xl bg-white/80 border border-black/10 p-5 shadow md:p-6">
                <div className="text-xs uppercase tracking-[0.28em] text-black/50">{step.title}</div>
                <div className="mt-2 text-xl font-semibold text-[#1f1718]">{step.body}</div>
              </div>
            ))}
          </div>

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
      </section>

      <section
        id="network-map"
        data-theme="dark"
        className="relative bg-black px-6 py-24 text-white md:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-xs uppercase tracking-[0.3em] text-[#d4c09a]">
              Our Network
            </div>

            <h2 className="mt-4 text-4xl font-semibold md:text-5xl">
              Three Labs. One Standard.
            </h2>

            <p className="mt-4 text-lg text-white/70">
              Our connected lab network gives you flexibility, speed, and consistency across every order.
            </p>
          </div>

          <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md md:p-10">
            <NetworkMap />
          </div>
        </div>
      </section>

      {/* OUR LABS */}
      <LabsSection />

      {/* CAPABILITIES */}
      <section
        id="capabilities"
        data-theme="dark"
        className="relative overflow-hidden px-6 py-[60px] md:py-16"
      >
        <div className="pointer-events-none absolute inset-0 bg-black/90" />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-full bg-no-repeat opacity-[0.13]"
          style={{
            backgroundImage: "url('/backgroundwithglasses2.jpeg')",
            backgroundSize: "50% auto",
            backgroundPosition: "bottom center",
          }}
        />
        <div className="relative z-20 max-w-7xl mx-auto">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
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
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((cap) => {
              const isActive = activeCapability === cap.title;
              const isDimmed = activeCapability !== null && !isActive;

              return (
                <motion.div
                  key={cap.title}
                  layout
                  className={`
                    pointer-events-auto group min-h-[150px] overflow-hidden rounded-[18px] border text-left
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
                      <div>
                        <div className="text-xs uppercase tracking-[0.28em] text-[#d4c09a]">
                          Capability
                        </div>
                        <div className="mt-3 text-lg font-semibold leading-snug text-white md:text-xl">
                          {cap.title}
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
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-black/84" />
        <div className="relative z-20 max-w-7xl mx-auto">
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
        </div>
      </section>

      {/* OWNERSHIP / PARTNERSHIP */}
      <section
        data-theme="dark"
        className="relative px-6 py-16 md:py-[72px]"
        style={{
          backgroundImage: "url('/backgroundimage.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-black/80" />
        <div className="relative z-20 max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-semibold">Partnership, Not Pitches</h2>
          <p className="mt-4 text-lg text-white/75 max-w-3xl">
            In some cases, qualified practices can participate in ownership by invitation. It creates deeper alignment and a stronger long-term relationship.
          </p>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {[
              "More alignment",
              "More loyalty",
              "More control over your experience",
            ].map((x) => (
              <div key={x} className="rounded-2xl bg-white/5 border border-white/15 backdrop-blur-md p-5 md:p-6">
                <div className="text-[#d4c09a] text-xs uppercase tracking-[0.28em]">OUTCOME</div>
                <div className="mt-3 text-xl text-white">{x}</div>
              </div>
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
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-white/70" />
        <div className="relative z-20 max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold">Resources</h2>
          <p className="mt-3 text-black/65 max-w-3xl">
            Practice resources, patient education, and tools to help your team run smoother.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <a href="#practice-resources" className="flex min-h-[174px] flex-col rounded-2xl bg-white/80 border border-black/10 p-5 shadow transition hover:-translate-y-1 hover:bg-white md:p-6">
              <div className="text-lg font-semibold">Practice Resources</div>
              <p className="mt-3 text-sm leading-6 text-black/60">
                Tools and information for independent practice teams.
              </p>
            </a>
            <a href="/patient-resources" className="flex min-h-[174px] flex-col rounded-2xl bg-white/80 border border-black/10 p-5 shadow transition hover:-translate-y-1 hover:bg-white md:p-6">
              <div className="text-lg font-semibold">Patient Resources</div>
              <p className="mt-3 text-sm leading-6 text-black/60">
                Education and support content for patient conversations.
              </p>
            </a>
            <a href="#lab-resources" className="flex min-h-[174px] flex-col rounded-2xl bg-white/80 border border-black/10 p-5 shadow transition hover:-translate-y-1 hover:bg-white md:p-6">
              <div className="text-lg font-semibold">Lab Resources</div>
              <p className="mt-3 text-sm leading-6 text-black/60">
                Practical lab access, ordering, and product information.
              </p>
            </a>
            <a href="/artisan-model" className="flex min-h-[174px] flex-col rounded-2xl bg-white/80 border border-[#d4c09a]/60 p-5 shadow transition hover:-translate-y-1 hover:bg-white md:p-6">
              <div className="text-lg font-semibold">Lab Ownership &amp; Partnership</div>
              <p className="mt-3 text-sm leading-6 text-black/60">
                Learn how some practices participate more deeply in the Artisan model.
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section data-theme="dark" className="relative overflow-hidden px-6 py-16 md:py-[72px]">
        <div className="pointer-events-none absolute inset-0 bg-black/70" />
        <div className="relative z-20 max-w-4xl mx-auto text-center">
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
              Get Started
            </a>
            <button
              type="button"
              onClick={openContactModal}
              className="rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-semibold hover:bg-white/15 hover:border-white/25"
            >
              Contact Us
            </button>
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
