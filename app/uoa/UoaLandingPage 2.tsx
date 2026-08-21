"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Footer from "../components/Footer";
import Header from "../components/Header";
import RingsAccent from "../components/RingsAccent";
import EmbeddedTypeform from "../components/analytics/EmbeddedTypeform";

const SIGNUP_URL = "https://form.typeform.com/to/quuPCSff";
const CAMBER_PURE_HREF = "/provider-resources#iot";

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
            <EmbeddedTypeform
              formId="m0lQ9zjD"
              formName="general_contact"
              leadType="sales_inquiry"
              className="min-h-0 flex-1 bg-[#f5f1eb]"
              title="Contact Artisan Lab Network"
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
      className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d4c09a] px-7 py-3 text-sm font-semibold text-[#102f2c] shadow-[0_16px_36px_rgba(212,192,154,0.18)] transition hover:-translate-y-0.5 hover:bg-[#e2cca2]"
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
    "inline-flex min-h-12 items-center justify-center rounded-full border border-white/18 bg-white/8 px-7 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[#d4c09a]/60 hover:bg-white/12";

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

  return (
    <main className="min-h-screen bg-[#102f2c] text-white">
      <Header onContactClick={() => setContactOpen(true)} signUpHref={SIGNUP_URL} />

      <section
        data-theme="dark"
        className="relative isolate overflow-hidden bg-[#102f2c] px-6 pb-20 pt-32 md:px-10 md:pb-24 md:pt-36"
      >
        <RingsAccent position="top-right" size="lg" opacity="opacity-[0.08]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,192,154,0.18),transparent_32%),linear-gradient(135deg,rgba(16,47,44,0.88),rgba(13,34,32,1))]" />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="rounded-full border border-white/14 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#d4c09a]">
                United Opticians Association Show
              </div>
              <div className="rounded-full border border-white/14 bg-white px-4 py-2">
                <Image
                  src="/images/oaa_org_logo.jpeg"
                  alt="United Opticians Association"
                  width={180}
                  height={62}
                  className="h-8 w-auto object-contain"
                  priority
                />
              </div>
            </div>

            <h1 className="mt-8 max-w-5xl text-5xl font-semibold leading-[0.98] tracking-normal text-white md:text-7xl lg:text-8xl">
              Built for Independent Opticians
            </h1>
            <p className="mt-7 max-w-2xl text-xl leading-8 text-white/78 md:text-2xl md:leading-9">
              Your patients deserve options. Your lab should protect them.
            </p>

            <div className="mt-8 max-w-2xl border-l-2 border-[#d4c09a] pl-5 text-lg leading-8 text-white/82">
              You choose what is best for your patient. We protect that freedom.
              <span className="mt-3 block font-semibold text-white">
                No limits. No pressure. No sellouts.
              </span>
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton href={SIGNUP_URL}>Open an Account</PrimaryButton>
              <SecondaryButton href={CAMBER_PURE_HREF}>
                Learn More About Camber Pure
              </SecondaryButton>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[32px] border border-[#d4c09a]/18 bg-[#d4c09a]/8 blur-2xl" />
            <div className="relative overflow-hidden rounded-[28px] border border-white/14 bg-white/[0.06] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-md">
              <div className="mt-10 grid gap-4">
                {["Product choice", "Clinical freedom", "Independent success"].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/12 bg-white/[0.07] px-5 py-4 text-xl font-semibold"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <p className="mt-8 text-base leading-7 text-white/70">
                A lab network for independent practices that want premium options,
                practical support, and the freedom to serve patients their way.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section data-theme="light" className="bg-[#f5f1eb] px-6 py-20 text-[#1f1a17] md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
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
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {switchReasons.map((reason) => (
              <article
                key={reason.title}
                className="rounded-2xl border border-[#d6c3a1]/55 bg-white/72 p-5 shadow-[0_16px_44px_rgba(31,26,23,0.06)]"
              >
                <h3 className="text-xl font-semibold">{reason.title}</h3>
                <p className="mt-4 text-sm leading-6 text-[#625b53]">
                  {reason.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-theme="dark" className="relative overflow-hidden bg-[#171311] px-6 py-20 text-white md:px-10 md:py-24">
        <RingsAccent position="bottom-left" size="md" opacity="opacity-[0.07]" />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="rounded-[28px] border border-white/12 bg-[#102f2c] p-7 shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
            <Image
              src="/iot-logo.png"
              alt="IOT"
              width={180}
              height={84}
              className="h-auto w-28 rounded-xl bg-white p-3"
            />
            <h2 className="mt-8 text-4xl font-semibold tracking-normal md:text-6xl">
              Camber Pure is worth putting in the conversation.
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
              Learn More About Camber Pure
            </Link>
          </div>

          <div className="grid gap-4">
            {camberPoints.map((point, index) => (
              <div
                key={point}
                className="flex gap-5 rounded-2xl border border-white/12 bg-white/[0.06] p-5"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#d4c09a] text-sm font-bold text-[#171311]">
                  {index + 1}
                </div>
                <p className="text-lg leading-7 text-white/78">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-theme="light" className="bg-white px-6 py-20 text-[#1f1a17] md:px-10 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8a7654]">
              Choose a Lab That Chooses You
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-normal md:text-6xl">
              ALN is built to support opticians, not limit them.
            </h2>
          </div>
          <div>
            <p className="text-xl leading-9 text-[#4e463f]">
              The right lab partner protects your independence, respects your
              clinical judgment, and helps you bring better options to patients.
              Artisan Lab Network gives independent practices premium lens
              access, real optical support, and room to make the right call.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton href={SIGNUP_URL}>Open an Account</PrimaryButton>
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

      <section data-theme="dark" className="relative overflow-hidden bg-[#102f2c] px-6 py-20 text-white md:px-10 md:py-24">
        <RingsAccent position="center-right" size="lg" opacity="opacity-[0.08]" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d4c09a]">
            Ready for a Better Lab Experience?
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-normal md:text-6xl">
            Bring your patients more options and your practice a stronger partner.
          </h2>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
            <PrimaryButton href={SIGNUP_URL}>Open an Account</PrimaryButton>
            <SecondaryButton onClick={() => setContactOpen(true)}>Contact Us</SecondaryButton>
            <SecondaryButton href={CAMBER_PURE_HREF}>
              Learn More About Camber Pure
            </SecondaryButton>
          </div>
        </div>
      </section>

      <Footer onContactClick={() => setContactOpen(true)} signUpHref={SIGNUP_URL} />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </main>
  );
}
