"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "../components/Footer";
import Header from "../components/Header";

const SIGNUP_URL = "https://form.typeform.com/to/quuPCSff";
const CONTACT_FORM_URL = "https://form.typeform.com/to/m0lQ9zjD";
const CAMBER_PURE_HREF = "/provider-resources#iot";
const PROFESSIONAL_SERVICES_HREF = "/provider-resources/professional-resources";
const OPTICAL_ENGINEERING_HREF = "/optical-engineering";

const switchReasons = [
  {
    title: "Freedom to Choose",
    body: "Recommend the lens that fits the patient, not the one a corporate program is trying to move.",
  },
  {
    title: "No Pressure",
    body: "Keep your product conversations clinical, personal, and rooted in the way you practice.",
  },
  {
    title: "Premium Independent Systems",
    body: "Access modern lens options, specialty designs, and vendor flexibility through one responsive lab network.",
  },
  {
    title: "Optical People",
    body: "Get support from teams who understand troubleshooting, fitting realities, and the pace of an optical floor.",
  },
  {
    title: "Built Around Practices",
    body: "Work with a lab partner designed for independent optical success, not corporate restriction.",
  },
];

const camberPoints = [
  "A premium progressive option with a strong patient story",
  "Easy to introduce when patients want sharper everyday performance",
  "Backed by ALN support for positioning, fitting, and adoption",
];

const proofItems = [
  "Independent choice",
  "Premium lens access",
  "Real lab partnership",
];

const actionLinks = [
  {
    title: "Professional Services",
    body: "Practical resources, product education, and support tools for independent optical teams.",
    href: PROFESSIONAL_SERVICES_HREF,
    cta: "Explore Services",
  },
  {
    title: "Optical Engineering Center",
    body: "Calculators, references, and technical optical tools built for real-world troubleshooting.",
    href: OPTICAL_ENGINEERING_HREF,
    cta: "Open Engineering Center",
  },
  {
    title: "Camber Pure",
    body: "See the premium progressive story you can bring to patients without sacrificing choice.",
    href: CAMBER_PURE_HREF,
    cta: "View Camber Pure",
  },
];

const camberRequirements = [
  "Open an Artisan Lab Network account",
  "Be an employee of a qualified optical practice that works directly with patients or is involved in lens selection",
  "Wear a progressive lens",
  "Use an Artisan AR treatment",
  "Keep the account in good standing",
];

const HERO_VIDEO_SRC = new URL("../../backgroundvid1.mp4", import.meta.url).toString();

function OpticalRings({
  className,
}: {
  className: string;
}) {
  return (
    <div className={`pointer-events-none absolute ${className}`} aria-hidden="true">
      <div className="absolute inset-0 rounded-full border-[34px] border-white/[0.075]" />
      <div className="absolute -bottom-[52%] left-[34%] h-[74%] w-[74%] rounded-full border-[28px] border-white/[0.06]" />
      <div className="absolute -right-[48%] top-[42%] h-[56%] w-[56%] rounded-full border-[22px] border-white/[0.045]" />
    </div>
  );
}

function useUoaMotion() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1,
      smoothWheel: true,
    });

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
      gsap.utils.toArray<HTMLElement>("[data-uoa-reveal]").forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 22 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 86%",
              once: true,
            },
          }
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-uoa-parallax]").forEach((element) => {
        gsap.to(element, {
          yPercent: -5,
          ease: "none",
          scrollTrigger: {
            trigger: element.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-uoa-box]").forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 30, scale: 0.985 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.95,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 82%",
              once: true,
            },
          }
        );
      });
    }, root);

    return () => context.revert();
  }, []);

  return rootRef;
}

function ContactModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
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

function PrimaryButton({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d4c09a] px-7 py-3 text-sm font-semibold text-[#142f2b] shadow-[0_14px_32px_rgba(31,26,23,0.16)] transition hover:-translate-y-0.5 hover:bg-[#e2cca2]"
    >
      {children}
    </a>
  );
}

function SecondaryButton({
  children,
  href,
  onClick,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  const className =
    "inline-flex min-h-12 items-center justify-center rounded-full border border-white/22 bg-white/[0.04] px-7 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-[#d4c09a]/70 hover:bg-white/[0.08]";

  if (href?.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}

export default function UoaLandingPage() {
  const [contactOpen, setContactOpen] = useState(false);
  const rootRef = useUoaMotion();

  return (
    <main ref={rootRef} className="min-h-screen bg-[#f4efe6] text-[#1f1a17]">
      <Header onContactClick={() => setContactOpen(true)} signUpHref={SIGNUP_URL} />

      <section
        data-theme="dark"
        className="relative isolate min-h-[100svh] overflow-hidden bg-[#071d2b] px-6 pb-14 pt-28 text-white md:px-10 md:pb-20 md:pt-32"
      >
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-[0.28]"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src={HERO_VIDEO_SRC} type="video/mp4" />
        </video>
        <OpticalRings className="-left-36 -top-32 h-[520px] w-[520px] md:h-[680px] md:w-[680px]" />
        <OpticalRings className="-bottom-40 right-[-18rem] h-[540px] w-[540px] rotate-12 md:h-[720px] md:w-[720px]" />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,#061723_0%,rgba(7,29,43,0.96)_36%,rgba(13,44,62,0.84)_66%,rgba(33,75,84,0.72)_100%)]"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_74%_18%,rgba(212,192,154,0.12),transparent_34%)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(244,239,230,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(244,239,230,0.06) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-[linear-gradient(180deg,rgba(7,29,43,0),rgba(6,23,35,0.82))]" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div data-uoa-reveal className="mb-10 flex max-w-4xl flex-col items-start gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-[#d4c09a]/35 bg-[#d4c09a]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#ead8b4]">
                For UOA attendees
              </div>
            </div>
          </div>

          <div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
            <div data-uoa-reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#ead8b4]">
                Choose what is best for your patient
              </p>

              <h1 className="mt-6 max-w-5xl text-5xl font-black uppercase leading-[0.95] tracking-[0.02em] text-white md:text-7xl lg:text-8xl">
                Built for Independent Opticians
              </h1>
              <p className="mt-7 max-w-2xl text-xl leading-8 text-white/84 md:text-2xl md:leading-9">
                Your patients deserve options. Your lab should protect them.
              </p>

              <div className="mt-8 max-w-2xl border-l border-[#d4c09a] pl-5 text-lg leading-8 text-white/86">
                You choose what is best for your patient. We protect that freedom.
                <span className="mt-5 block space-y-1 text-3xl font-semibold uppercase leading-tight tracking-[0.08em] text-white md:text-4xl">
                  <span className="block">No limits.</span>
                  <span className="block">No pressure.</span>
                  <span className="block text-[#ead8b4]">No compromises.</span>
                </span>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <PrimaryButton href={SIGNUP_URL}>Open an Account</PrimaryButton>
                <SecondaryButton href={CAMBER_PURE_HREF}>
                  Learn More About Camber Pure
                </SecondaryButton>
              </div>
            </div>

            <div data-uoa-box className="relative lg:pb-8">
              <div className="relative border border-white/16 bg-[#061723]/72 p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.24)] md:p-7">
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.22]"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(rgba(255,255,255,0.035) 1px,transparent 1px)",
                    backgroundSize: "30px 30px",
                  }}
                />
                <div className="relative flex items-start justify-between gap-6 border-b border-[#d4c09a]/45 pb-6">
                  <p className="font-alfons-brush text-5xl leading-none text-[#ead8b4]">
                    Artisan
                  </p>
                  <p className="max-w-[9rem] text-right text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4c09a]">
                    Lab partnership for independent optical
                  </p>
                </div>
                <blockquote className="relative mt-8 text-3xl font-semibold leading-tight tracking-normal text-white md:text-4xl">
                  A better lab relationship should give an independent practice
                  more room to serve the patient, not less.
                </blockquote>
                <div className="relative mt-10 grid gap-4 border-y border-[#d4c09a]/45 py-5 sm:grid-cols-3">
                  {proofItems.map((item) => (
                    <p key={item} className="text-sm font-semibold leading-6 text-white/82">
                      {item}
                    </p>
                  ))}
                </div>
                <div className="relative mt-6 flex flex-wrap gap-3">
                  <Link
                    href={PROFESSIONAL_SERVICES_HREF}
                    className="inline-flex items-center rounded-full border border-[#d4c09a]/40 bg-[#d4c09a]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#ead8b4] transition hover:bg-[#d4c09a]/18"
                  >
                    Professional Services
                  </Link>
                  <Link
                    href={OPTICAL_ENGINEERING_HREF}
                    className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/86 transition hover:bg-white/[0.08]"
                  >
                    Optical Engineering Center
                  </Link>
                </div>
                <p className="relative mt-6 text-sm leading-7 text-white/64">
                  Stop by after the session, scan the code, or start here. We will
                  help you find the right lab path without asking you to surrender
                  product choice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section data-theme="light" className="relative bg-white px-6 py-12 text-[#1f1a17] md:px-10">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_0.55fr] lg:items-center">
          <h2 data-uoa-reveal className="text-3xl font-black uppercase tracking-[0.08em] md:text-5xl">
            Choose a lab that chooses you.
          </h2>
          <p data-uoa-reveal className="text-left text-2xl font-medium uppercase leading-tight tracking-[0.04em] text-[#2f2a25] lg:text-right">
            See why opticians are switching
          </p>
        </div>
      </section>

      <section data-theme="light" className="relative bg-[#f4efe6] px-6 py-16 text-[#1f1a17] md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 border-y border-[#d6c3a1]/70 py-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
          <p data-uoa-reveal className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">
            Welcome to Artisan Lab Network
          </p>
          <p data-uoa-reveal className="text-2xl font-semibold leading-tight tracking-normal md:text-4xl">
            If you are at UOA because you believe opticianry still belongs to
            people who care about craft, fit, and patient trust, you are in the
            right place.
          </p>
        </div>
      </section>

      <section data-theme="light" className="bg-[#f4efe6] px-6 pb-8 text-[#1f1a17] md:px-10 md:pb-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 lg:grid-cols-3">
            {actionLinks.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                data-uoa-box
                className="group rounded-[28px] border border-[#d6c3a1]/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(244,239,230,0.96))] p-6 shadow-[0_20px_45px_rgba(62,46,24,0.08)] transition hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(62,46,24,0.14)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">
                  Quick Path
                </p>
                <h3 className="mt-4 text-2xl font-semibold text-[#1f1a17]">
                  {link.title}
                </h3>
                <p className="mt-3 text-base leading-7 text-[#625b53]">
                  {link.body}
                </p>
                <span className="mt-6 inline-flex items-center text-sm font-semibold uppercase tracking-[0.16em] text-[#7a6340] transition group-hover:translate-x-1">
                  {link.cta}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section data-theme="light" className="bg-[#f4efe6] px-6 py-20 text-[#1f1a17] md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.74fr_1.26fr]">
          <div data-uoa-reveal className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8a7654]">
              Why Opticians Are Switching
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-normal md:text-6xl">
              Better partnership starts with more choice.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#625b53]">
              Independent opticians do their best work when the lab relationship
              expands what they can offer instead of narrowing it.
            </p>
            <div className="mt-10 border-y border-[#d6c3a1]/70 py-8">
              <p className="font-alfons-brush text-6xl leading-none text-[#8a7654] md:text-8xl">
                Artisan means hands on.
              </p>
              <p className="mt-5 max-w-sm text-base leading-7 text-[#625b53]">
                Practical help, product knowledge, and lab teams that understand
                the decisions independent opticians make every day.
              </p>
            </div>
          </div>

          <div className="grid gap-0 border-t border-[#d6c3a1]/75">
            {switchReasons.map((reason) => (
              <article
                key={reason.title}
                data-uoa-reveal
                className="grid gap-4 border-b border-[#d6c3a1]/75 py-6 transition hover:bg-white/30 md:grid-cols-[0.42fr_0.58fr] md:px-4"
              >
                <h3 className="text-2xl font-semibold">{reason.title}</h3>
                <p className="text-base leading-7 text-[#625b53]">
                  {reason.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-theme="dark" className="relative overflow-hidden bg-[#0b2639] px-6 py-20 text-white md:px-10 md:py-24">
        <OpticalRings className="-bottom-48 -left-44 h-[460px] w-[460px] opacity-70 md:h-[620px] md:w-[620px]" />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div data-uoa-box className="border border-white/12 bg-[#12364a] p-7 shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
            <div className="flex flex-wrap items-center gap-4">
              <Image
                src="/logos/camber_pure_recolored.png"
                alt="Camber Pure"
                width={260}
                height={120}
                className="h-auto w-44"
              />
              <span className="h-10 w-px bg-white/18" />
              <Image
                src="/iot-logo.png"
                alt="IOT"
                width={180}
                height={84}
                className="h-auto w-20 bg-white p-2"
              />
            </div>
            <h2 className="mt-8 text-4xl font-semibold tracking-normal md:text-6xl">
              Try Camber Pure with Artisan.
            </h2>
            <p className="mt-5 text-lg leading-8 text-white/72">
              Give patients a premium progressive option that feels innovative,
              easy to explain, and aligned with the kind of care independent
              opticians are known for.
            </p>
            <Link
              href={CAMBER_PURE_HREF}
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#d4c09a] px-7 py-3 text-sm font-semibold text-[#171311] transition hover:bg-[#e2cca2]"
            >
              Try Camber Pure
            </Link>
          </div>

          <div className="grid gap-0">
            <div data-uoa-box className="mb-4 border border-white/12 bg-white/[0.045] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d4c09a]">
                Trial Requirements
              </p>
              <ul className="mt-4 grid gap-3 text-sm leading-6 text-white/74">
                {camberRequirements.map((requirement) => (
                  <li key={requirement} className="flex gap-3">
                    <span className="mt-2 h-px w-5 shrink-0 bg-[#d4c09a]" />
                    <span>{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
            {camberPoints.map((point, index) => (
              <div
                key={point}
                data-uoa-box
                className="flex gap-5 border-t border-white/14 py-6"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#d4c09a]/70 text-sm font-bold text-[#d4c09a]">
                  {index + 1}
                </div>
                <p className="text-lg leading-7 text-white/78">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-theme="light" className="bg-white px-6 py-20 text-[#1f1a17] md:px-10 md:py-24">
        <div data-uoa-box className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div data-uoa-reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8a7654]">
              Choose a Lab That Chooses You
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-normal md:text-6xl">
              ALN is built to support opticians, not limit them.
            </h2>
          </div>
          <div data-uoa-reveal>
            <p className="text-xl leading-9 text-[#4e463f]">
              The right lab partner protects your independence, respects your
              clinical judgment, and helps you bring better options to patients.
              Artisan Lab Network gives independent practices premium lens
              access, real optical support, and room to make the right call with
              no compromises.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <PrimaryButton href={SIGNUP_URL}>Open an Account</PrimaryButton>
              <SecondaryButton href={PROFESSIONAL_SERVICES_HREF}>
                Professional Services
              </SecondaryButton>
              <SecondaryButton href={OPTICAL_ENGINEERING_HREF}>
                Optical Engineering Center
              </SecondaryButton>
              <button
                type="button"
                onClick={() => setContactOpen(true)}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d6c3a1] bg-[#f5f1eb] px-7 py-3 text-sm font-semibold text-[#1f1a17] transition hover:-translate-y-0.5 hover:bg-white"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      <section data-theme="dark" className="relative overflow-hidden bg-[#142f2b] px-6 py-20 text-white md:px-10 md:py-24">
        <OpticalRings className="-right-40 top-8 h-[420px] w-[420px] md:h-[620px] md:w-[620px]" />
        <div data-uoa-box className="relative z-10 mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d4c09a]">
            Ready for a Better Lab Experience?
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-normal md:text-6xl">
            Bring your patients more options and your practice a more Artisan
            lab partner.
          </h2>
          <div className="mx-auto mt-10 flex max-w-4xl flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            <PrimaryButton href={SIGNUP_URL}>Open an Account</PrimaryButton>
            <SecondaryButton onClick={() => setContactOpen(true)}>Contact Us</SecondaryButton>
            <SecondaryButton href={PROFESSIONAL_SERVICES_HREF}>
              Professional Services
            </SecondaryButton>
            <SecondaryButton href={OPTICAL_ENGINEERING_HREF}>
              Optical Engineering Center
            </SecondaryButton>
            <SecondaryButton href={CAMBER_PURE_HREF}>
              Try Camber Pure
            </SecondaryButton>
          </div>
        </div>
      </section>

      <Footer onContactClick={() => setContactOpen(true)} signUpHref={SIGNUP_URL} />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </main>
  );
}
