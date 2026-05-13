"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "../components/Footer";
import Header from "../components/Header";

const PROGRAM_CODE = "AQU2630";
const TRIAL_URL =
  "https://form.typeform.com/to/WCU5ReWQ?program=AQU2630&source=acquios";
const CONTACT_FORM_URL = "https://form.typeform.com/to/m0lQ9zjD";
const HERO_VIDEO_SRC = new URL("../../backgroundvid1.mp4", import.meta.url).toString();

const offerPoints = ["30% back", "90 day trial", "New customers only", "No long term commitment"];

const costSignals = [
  "Rising lab costs that quietly compress margins",
  "Reduced control over product decisions",
  "Limited choice when patients need better options",
  "Corporate lab pressure that changes the conversation",
  "Hidden margin erosion across private pay orders",
];

const artisanReasons = [
  {
    title: "Doctor owned network",
    body: "A lab model built by people who understand independent eye care from the inside.",
  },
  {
    title: "Broad product portfolio",
    body: "More room to choose lenses, treatments, and solutions that fit the patient.",
  },
  {
    title: "Independent focused support",
    body: "Help from optical people who care about the practice relationship, not just the order.",
  },
  {
    title: "Premium lens options",
    body: "Access to private-pay products that support better clinical conversations and better margins.",
  },
  {
    title: "Real partnership",
    body: "A network designed to help practices compare, transition, and grow with confidence.",
  },
  {
    title: "Labs that understand private practice",
    body: "Pacific Artisan Labs, Peak Artisan Labs, and Pike Artisan Labs working for independent success.",
  },
];

const steps = [
  {
    eyebrow: "Step 1",
    title: "Start the trial",
    body: "Use program code AQU2630 and tell us where you want the first comparison to begin.",
  },
  {
    eyebrow: "Step 2",
    title: "Send qualifying private pay orders",
    body: "Experience the Artisan model with real work from your practice during the trial period.",
  },
  {
    eyebrow: "Step 3",
    title: "Earn monthly statement credits",
    body: "Qualifying orders can earn 30% back as monthly statement credits during the 90 day trial.",
  },
];

function OpticalRings({ className }: { className: string }) {
  return (
    <div className={`pointer-events-none absolute ${className}`} aria-hidden="true">
      <div className="absolute inset-0 rounded-full border-[34px] border-white/[0.055]" />
      <div className="absolute -bottom-[52%] left-[34%] h-[74%] w-[74%] rounded-full border-[28px] border-white/[0.045]" />
      <div className="absolute -right-[48%] top-[42%] h-[56%] w-[56%] rounded-full border-[22px] border-white/[0.035]" />
    </div>
  );
}

function useAcquiosMotion() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({ duration: 1, smoothWheel: true });
    let animationFrame = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      animationFrame = requestAnimationFrame(raf);
    };

    animationFrame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrame);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-acquios-reveal]").forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: { trigger: element, start: "top 86%", once: true },
          }
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-acquios-box]").forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 28, scale: 0.985 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: element, start: "top 84%", once: true },
          }
        );
      });
    }, root);

    return () => context.revert();
  }, []);

  return rootRef;
}

function ContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
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
            onClick={onClose}
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
                onClick={onClose}
                className="grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white/70 text-2xl leading-none text-black/65 transition hover:bg-white hover:text-black"
                aria-label="Close contact form"
              >
                x
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
  );
}

function PrimaryButton({ children, href }: { children: ReactNode; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      data-program-code={PROGRAM_CODE}
      className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d4c09a] px-7 py-3 text-sm font-semibold text-[#071d2b] shadow-[0_14px_32px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 hover:bg-[#e2cca2]"
    >
      {children}
    </a>
  );
}

function SectionIntro({
  eyebrow,
  title,
  children,
  light = false,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <div data-acquios-reveal className="max-w-3xl">
      <p
        className={`text-sm font-semibold uppercase tracking-[0.24em] ${
          light ? "text-[#d4c09a]" : "text-[#8a7654]"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-4 text-4xl font-semibold tracking-normal md:text-6xl ${
          light ? "text-white" : "text-[#1f1a17]"
        }`}
      >
        {title}
      </h2>
      <div
        className={`mt-5 text-lg leading-8 ${
          light ? "text-white/72" : "text-[#625b53]"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default function AcquiosLandingPage() {
  const [contactOpen, setContactOpen] = useState(false);
  const rootRef = useAcquiosMotion();

  return (
    <main ref={rootRef} className="min-h-screen bg-[#f4efe6] text-[#1f1a17]">
      <Header onContactClick={() => setContactOpen(true)} signUpHref={TRIAL_URL} />

      <section
        data-theme="dark"
        className="relative isolate min-h-[100svh] overflow-hidden bg-[#071d2b] px-6 pb-16 pt-24 text-white md:px-10 md:pb-20 md:pt-28"
      >
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-[0.18]"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src={HERO_VIDEO_SRC} type="video/mp4" />
        </video>
        <OpticalRings className="-left-40 -top-32 h-[520px] w-[520px] md:h-[700px] md:w-[700px]" />
        <OpticalRings className="-bottom-48 right-[-20rem] h-[560px] w-[560px] rotate-12 md:h-[760px] md:w-[760px]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(108deg,#04131f_0%,rgba(7,29,43,0.98)_40%,rgba(11,46,68,0.88)_72%,rgba(37,79,91,0.68)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_20%,rgba(212,192,154,0.16),transparent_34%)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.13]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(244,239,230,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(244,239,230,0.06) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div data-acquios-reveal>
            <div className="mb-10 flex flex-col items-start gap-4">
              <Image
                src="/aln-white-logo.png"
                alt="Artisan Lab Network"
                width={1000}
                height={471}
                className="h-auto w-40 md:w-48"
                priority
              />
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full border border-[#d4c09a]/35 bg-[#d4c09a]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#ead8b4]">
                  Acquios Alliance member invitation
                </div>
                <div className="rounded-full border border-white/14 bg-white px-4 py-2">
                  <Image
                    src="/logos/acquios-alliance.png"
                    alt="Acquios Alliance"
                    width={220}
                    height={72}
                    className="h-7 w-auto object-contain"
                    priority
                  />
                </div>
              </div>
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#ead8b4]">
              Try Artisan for 90 days
            </p>
            <h1 className="mt-6 max-w-5xl text-5xl font-black uppercase leading-[0.92] tracking-[0.01em] text-white md:text-5xl lg:text-6xl xl:text-[4.9rem]">
              Your Lab May Be Costing You Thousands More Than You Think.
            </h1>
            <p className="mt-7 max-w-3xl text-xl leading-8 text-white/84 md:text-2xl md:leading-9">
              Acquios Alliance members are invited to try Artisan Lab Network for
              90 days and earn 30% back on qualifying private pay lab orders.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <PrimaryButton href={TRIAL_URL}>Start the 90 Day Trial</PrimaryButton>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#ead8b4]">
                Program Code: {PROGRAM_CODE}
              </p>
            </div>
            <p className="mt-6 max-w-2xl border-l border-[#d4c09a] pl-5 text-lg leading-8 text-white/78">
              Independent practices deserve a lab relationship built around better
              pricing, better options, real support, and long term independence.
            </p>
          </div>

          <div data-acquios-box className="relative">
            <div className="relative border border-white/16 bg-[#061723]/76 p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.26)] md:p-8">
              <div className="border-b border-[#d4c09a]/45 pb-6">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d4c09a]">
                  Limited time offer
                </p>
                <p className="mt-5 text-[5.5rem] font-black leading-none tracking-[-0.08em] text-white md:text-[8rem]">
                  30%
                </p>
                <p className="mt-2 text-3xl font-semibold uppercase tracking-[0.08em] text-[#ead8b4]">
                  back
                </p>
              </div>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                {offerPoints.map((point) => (
                  <div key={point} className="border-t border-white/14 pt-4">
                    <p className="text-lg font-semibold text-white">{point}</p>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-sm leading-7 text-white/62">
                Statement credits are issued monthly on eligible private pay orders
                during the trial period. Use program code {PROGRAM_CODE}.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section data-theme="light" className="relative bg-white px-6 py-12 text-[#1f1a17] md:px-10">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_0.56fr] lg:items-center">
          <h2 data-acquios-reveal className="text-3xl font-black uppercase tracking-[0.08em] md:text-5xl">
            Try Artisan for 90 days and earn 30% back.
          </h2>
          <p data-acquios-reveal className="text-left text-2xl font-medium uppercase leading-tight tracking-[0.04em] text-[#2f2a25] lg:text-right">
            Program Code: {PROGRAM_CODE}
          </p>
        </div>
      </section>

      <section data-theme="light" className="bg-[#f4efe6] px-6 py-20 text-[#1f1a17] md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.72fr_1.28fr]">
          <SectionIntro eyebrow="The Offer" title="Try Artisan for 90 Days and Earn 30% Back">
            <p>
              For a limited time, invited Acquios Alliance members can experience
              Artisan Lab Network with a paid trial designed to make the transition
              easier. Qualifying new customers can earn monthly statement credits
              equal to 30% back on eligible private pay orders during the trial period.
            </p>
          </SectionIntro>

          <div className="grid gap-0 border-t border-[#d6c3a1]/75 sm:grid-cols-2">
            {offerPoints.map((point) => (
              <article
                key={point}
                data-acquios-box
                className="border-b border-[#d6c3a1]/75 py-7 sm:pr-8"
              >
                <p className="text-3xl font-semibold tracking-[-0.02em]">{point}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-theme="dark" className="relative overflow-hidden bg-[#071d2b] px-6 py-20 text-white md:px-10 md:py-24">
        <OpticalRings className="-right-48 top-8 h-[520px] w-[520px] opacity-80 md:h-[720px] md:w-[720px]" />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionIntro
            eyebrow="Why This Matters"
            title="Your Current Lab Relationship May Be Costing More Than You Realize"
            light
          >
            <p>
              A lab relationship can look familiar while quietly narrowing choice,
              reducing control, and eroding margin on the orders that matter most.
            </p>
          </SectionIntro>
          <div className="grid gap-0 border-t border-white/16">
            {costSignals.map((signal) => (
              <article
                key={signal}
                data-acquios-reveal
                className="border-b border-white/16 py-6"
              >
                <p className="text-2xl font-semibold leading-tight text-white">
                  {signal}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-theme="light" className="bg-white px-6 py-20 text-[#1f1a17] md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionIntro eyebrow="Why Artisan" title="A Different Lab Model for Independent Practices">
            <p>
              Artisan Lab Network supports Pacific Artisan Labs, Peak Artisan Labs,
              and Pike Artisan Labs with a model designed around independent practice
              success.
            </p>
          </SectionIntro>
          <div className="mt-12 grid gap-0 border-t border-[#d6c3a1]/75 lg:grid-cols-3">
            {artisanReasons.map((reason) => (
              <article
                key={reason.title}
                data-acquios-box
                className="border-b border-[#d6c3a1]/75 py-7 lg:px-6"
              >
                <h3 className="text-2xl font-semibold">{reason.title}</h3>
                <p className="mt-4 text-base leading-7 text-[#625b53]">{reason.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-theme="light" className="bg-[#f4efe6] px-6 py-20 text-[#1f1a17] md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.68fr_1.32fr]">
          <SectionIntro eyebrow="How It Works" title="A simple paid trial with clear next steps.">
            <p>
              Start with the orders you want to compare, then evaluate the numbers,
              the service, and the partnership before making a long term commitment.
            </p>
          </SectionIntro>
          <div className="grid gap-5 lg:grid-cols-3">
            {steps.map((step) => (
              <article
                key={step.title}
                data-acquios-box
                className="border border-[#d6c3a1]/75 bg-white/65 p-6 shadow-[0_18px_54px_rgba(31,26,23,0.08)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">
                  {step.eyebrow}
                </p>
                <h3 className="mt-5 text-2xl font-semibold">{step.title}</h3>
                <p className="mt-4 text-base leading-7 text-[#625b53]">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-theme="light" className="bg-white px-6 py-20 text-[#1f1a17] md:px-10 md:py-24">
        <div data-acquios-box className="mx-auto grid max-w-7xl gap-10 border-y border-[#d6c3a1]/75 py-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <SectionIntro eyebrow="Who This Is For" title="Built for Independent Eye Care Practices">
            <p>
              This invitation is designed for Acquios Alliance members who want to
              compare their current lab relationship, improve profitability, and
              experience a doctor owned lab network without making a long term
              commitment upfront.
            </p>
          </SectionIntro>
          <div className="border-l-0 border-[#d6c3a1]/75 lg:border-l lg:pl-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8a7654]">
              Terms Preview
            </p>
            <p className="mt-5 text-sm leading-7 text-[#625b53]">
              New customers only. Limited time offer. Terms, conditions,
              eligibility requirements, and exclusions apply. Qualifying private
              pay orders only. Statement credits are issued monthly. Only one
              Artisan promotional program may be used at a time unless approved in
              writing.
            </p>
          </div>
        </div>
      </section>

      <section data-theme="dark" className="relative overflow-hidden bg-[#102f45] px-6 py-20 text-white md:px-10 md:py-24">
        <OpticalRings className="-left-40 -bottom-48 h-[480px] w-[480px] md:h-[680px] md:w-[680px]" />
        <div data-acquios-box className="relative z-10 mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d4c09a]">
            Program Code: {PROGRAM_CODE}
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-normal md:text-6xl">
            Ready to See the Artisan Difference?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/72">
            Put your current lab relationship next to a doctor owned network built
            for independent optical.
          </p>
          <div className="mt-10">
            <PrimaryButton href={TRIAL_URL}>Start the Trial</PrimaryButton>
          </div>
        </div>
      </section>

      <Footer onContactClick={() => setContactOpen(true)} signUpHref={TRIAL_URL} />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </main>
  );
}
