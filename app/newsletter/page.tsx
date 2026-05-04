"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";

const SIGNUP_URL = "https://form.typeform.com/to/quuPCSff";
const CONTACT_FORM_URL = "https://form.typeform.com/to/m0lQ9zjD";

const issues = [
  {
    title: "Practice Matters: Spring Update",
    date: "Spring 2026",
    description:
      "A seasonal look at practice growth, network news, and the conversations shaping independent eye care.",
  },
  {
    title: "Product Spotlight: Tokai Thin Lens Options",
    date: "Coming Soon",
    description:
      "Product education and dispensing notes for helping patients understand advanced thin lens options.",
  },
  {
    title: "Building Stronger Independent Practices",
    date: "Coming Soon",
    description:
      "Ideas for strengthening practice control, improving margins, and building more resilient lab relationships.",
  },
  {
    title: "Lab Updates: Service, Turnaround, and Support",
    date: "Coming Soon",
    description:
      "Operational updates from the Artisan network, including service improvements and support reminders.",
  },
  {
    title: "Training Corner: Helping Opticians Explain Lens Options",
    date: "Coming Soon",
    description:
      "Practical language and team education ideas for clearer lens conversations at the dispensing table.",
  },
  {
    title: "Artisan Intel: Smarter Practice Reporting",
    date: "Coming Soon",
    description:
      "A preview of better reporting habits and the practice insights that help teams make confident decisions.",
  },
];

const newsletterBenefits = [
  "Product education",
  "Lab updates",
  "Managed care tips",
  "Practice growth ideas",
  "Partner announcements",
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

    const originalOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/72 px-4 py-6 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative h-[82vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-white/15 bg-[#171311] shadow-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-full border border-white/15 bg-black/45 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Close
            </button>
            <iframe
              title="Contact Artisan Lab Network"
              src={CONTACT_FORM_URL}
              className="h-full w-full"
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default function NewsletterPage() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fbf8f2] text-[#1f1a17]">
      <Header onContactClick={() => setContactOpen(true)} />

      <section
        data-theme="light"
        className="relative overflow-hidden bg-[#f2eee7] px-6 pb-20 pt-36 md:px-10 md:pb-24 md:pt-44"
      >
        <div className="absolute inset-x-0 bottom-0 h-px bg-[#d6c3a1]/70" />
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#8b7656]">
              Practice Matters
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">
              Insights for Independent Eye Care
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-black/68 md:text-xl md:leading-9">
              Get updates, product education, lab news, program announcements,
              and ideas to help independent practices stay informed and grow
              with confidence.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#newsletter-signup"
                className="inline-flex items-center justify-center rounded-full bg-[#1f1a17] px-7 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(31,26,23,0.18)] transition hover:-translate-y-0.5 hover:bg-black"
              >
                Sign Up for the Newsletter
              </a>
              <a
                href="#past-issues"
                className="inline-flex items-center justify-center rounded-full border border-black/14 bg-white/60 px-7 py-3 text-sm font-semibold text-[#1f1a17] transition hover:-translate-y-0.5 hover:bg-white"
              >
                View Past Issues
              </a>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {newsletterBenefits.map((benefit) => (
                <div key={benefit} className="rounded-2xl border border-[#d6c3a1]/70 bg-white/70 px-4 py-3 text-sm font-semibold text-[#1f1a17] shadow-[0_10px_26px_rgba(49,39,26,0.06)]">
                  {benefit}
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-2xl border border-[#d6c3a1]/70 bg-[#fffaf2]/72 p-5 shadow-[0_16px_45px_rgba(49,39,26,0.08)]">
              <p className="text-sm leading-7 text-black/62">
                Prefer a feed reader? Subscribe to updates through RSS.
              </p>
              <Link
                href="/newsletter/feed.xml"
                className="mt-2 inline-flex text-sm font-semibold text-[#7b6647] transition hover:text-black"
              >
                Subscribe by RSS
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
            className="relative min-h-[360px] overflow-hidden rounded-[28px] border border-[#d6c3a1]/70 bg-[#171311] p-3 shadow-[0_28px_80px_rgba(49,39,26,0.16)]"
          >
            <Image
              src="/images/eyewear-brochure-meeting-2022-1.jpg"
              alt="Eyewear education materials during an Artisan meeting"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="rounded-[22px] object-cover object-center"
            />
            <div className="absolute inset-x-3 bottom-3 rounded-b-[22px] bg-gradient-to-t from-black/82 via-black/42 to-transparent px-6 pb-6 pt-24">
              <p className="max-w-md text-2xl font-semibold tracking-tight text-white">
                Product education, practice ideas, and lab updates in one place.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section
        id="past-issues"
        data-theme="light"
        className="scroll-mt-24 bg-[#fbf8f2] px-6 py-24 md:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/45">
              Past Issues
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Newsletter Archive
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {issues.map((issue, index) => (
              <motion.article
                key={issue.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.42, delay: index * 0.04, ease: "easeOut" }}
                className="group flex min-h-[300px] flex-col rounded-[24px] border border-black/10 bg-white p-6 shadow-[0_18px_45px_rgba(49,39,26,0.08)] transition hover:-translate-y-1 hover:shadow-[0_26px_65px_rgba(49,39,26,0.13)]"
              >
                <div className="mb-7 flex items-center justify-between gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-full border border-[#d6c3a1]/70 bg-[#f2eee7] text-xs font-bold tracking-[0.18em] text-[#7b6647]">
                    PM
                  </div>
                  <div className="text-xs uppercase tracking-[0.22em] text-black/42">
                    {issue.date}
                  </div>
                </div>
                <h3 className="text-xl font-semibold leading-snug">
                  {issue.title}
                </h3>
                <p className="mt-4 flex-1 text-sm leading-7 text-black/62">
                  {issue.description}
                </p>
                <a
                  href="#"
                  className="mt-7 inline-flex w-fit items-center justify-center rounded-full border border-black/12 bg-[#1f1a17] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
                >
                  {issue.date === "Coming Soon" ? "Preview Topic" : "Read Issue"}
                </a>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="newsletter-signup"
        data-theme="dark"
        className="scroll-mt-24 border-y border-white/10 bg-[#171311] px-6 py-20 text-white md:px-10"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d4c09a]">
              Newsletter
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Stay Connected
            </h2>
            <p className="mt-5 text-lg leading-8 text-white/70">
              We&apos;ll send helpful updates, resources, and announcements without
              filling your inbox with noise.
            </p>
          </div>
          <a
            href="#"
            className="inline-flex w-fit items-center justify-center rounded-full bg-[#d4c09a] px-7 py-3 text-sm font-semibold text-[#171311] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e2cca2]"
          >
            Sign Up Coming Soon
          </a>
        </div>
      </section>

      <Footer onContactClick={() => setContactOpen(true)} signUpHref={SIGNUP_URL} />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </main>
  );
}
