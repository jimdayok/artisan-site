"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import NetworkMap from "../components/NetworkMap";
import RingsAccent from "../components/RingsAccent";
import SiteIcon from "../components/SiteIcon";

const SIGNUP_URL = "https://form.typeform.com/to/quuPCSff";
const CONTACT_FORM_URL = "https://form.typeform.com/to/m0lQ9zjD";

const problemItems = [
  {
    title: "Limited product flexibility",
    body: "Practices can feel boxed into narrow product paths that do not always match patient needs or practice preferences.",
  },
  {
    title: "Margin pressure",
    body: "Pricing structures and program requirements can make it harder to protect long-term practice economics.",
  },
  {
    title: "Vendor influence",
    body: "Lab decisions can become shaped by vendor priorities instead of what best supports the independent practice.",
  },
  {
    title: "Operational friction",
    body: "Ordering, remakes, delays, and exceptions create avoidable work for already busy teams.",
  },
  {
    title: "Communication gaps",
    body: "When answers are slow or unclear, staff lose confidence and patients feel the impact.",
  },
];

const networkPillars = [
  {
    title: "Group Buying Leverage",
    icon: "/icons/site/layers.svg",
    items: ["Better pricing access", "Vendor leverage", "Scale advantage"],
  },
  {
    title: "Expanded Access",
    icon: "/icons/site/badge-check.svg",
    items: ["Broader lens portfolios", "Multiple lab capabilities", "Flexibility in product choice"],
  },
  {
    title: "Shared Intelligence",
    icon: "/icons/site/chart-line.svg",
    items: ["Best practices", "Peer insights", "Operational knowledge"],
  },
];

const controlItems = [
  { title: "Better turnaround", icon: "/icons/site/chart-line.svg" },
  { title: "More predictability", icon: "/icons/site/badge-check.svg" },
  { title: "Direct communication", icon: "/icons/site/handshake.svg" },
  { title: "Reduced dependency", icon: "/icons/site/lock.svg" },
];

const partnershipItems = [
  {
    title: "Real support",
    icon: "/icons/site/handshake.svg",
    body: "People who know the work, understand the stakes, and help resolve issues without making the practice chase answers.",
  },
  {
    title: "Accountability",
    icon: "/icons/site/badge-check.svg",
    body: "A lab relationship should be clear about what is happening, why it matters, and what comes next.",
  },
  {
    title: "Human communication",
    icon: "/icons/site/handshake.svg",
    body: "The model works best when practices can reach people who can make decisions and help move work forward.",
  },
];

const timeline = [
  ["2023", "Peak Artisan Labs launches and expands ownership group"],
  ["2024", "Peak Artisan Labs adds new practice partners"],
  ["2024", "Pacific Artisan Labs expands capacity and network reach"],
  ["2025", "Launch of Pike Artisan Labs in Indianapolis with over 20 locations"],
  ["2025", "First network-wide ownership conference across Pacific, Peak, and Pike"],
  ["Current", "Over 60 practice groups participating across the network"],
];

const fitItems = [
  { title: "Practices that value independence", icon: "/icons/site/lock.svg" },
  { title: "Practices seeking more control", icon: "/icons/site/layers.svg" },
  { title: "Practices focused on long-term improvement", icon: "/icons/site/chart-line.svg" },
  { title: "Practices that care about operational efficiency", icon: "/icons/site/badge-check.svg" },
];

const outcomes = [
  { title: "More control", icon: "/icons/site/layers.svg" },
  { title: "Better alignment", icon: "/icons/site/handshake.svg" },
  { title: "More flexibility", icon: "/icons/site/badge-check.svg" },
  { title: "Stronger long-term position", icon: "/icons/site/chart-line.svg" },
];

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
            className="relative z-10 flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-[24px] border border-white/15 bg-[#f5f1eb] shadow-[0_24px_80px_rgba(0,0,0,0.38)]"
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
                className="grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white/70 text-xl leading-none text-black/65 transition hover:bg-white hover:text-black"
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

function SectionShell({
  id,
  theme = "light",
  className = "",
  accent,
  children,
}: {
  id?: string;
  theme?: "light" | "dark";
  className?: string;
  accent?: React.ReactNode;
  children: React.ReactNode;
}) {
  const themeClass =
    theme === "dark"
      ? "bg-[#171311] text-[#f7f1e8]"
      : "bg-[#f5f1eb] text-[#1f1a17]";

  return (
    <section
      id={id}
      data-theme={theme}
      className={`relative scroll-mt-24 border-b px-5 py-14 md:px-8 md:py-[72px] lg:px-10 ${
        theme === "dark" ? "border-white/10" : "border-[#d8c6a8]/35"
      } ${themeClass} ${className}`}
    >
      {accent}
      <div className="relative z-10 mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  body,
  light = false,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  light?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p
          className={`text-xs font-semibold uppercase tracking-[0.24em] ${
            light ? "text-[#d4c09a]" : "text-[#9a8564]"
          }`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
        {title}
      </h2>
      {body ? (
        <p
          className={`mt-5 text-base leading-8 md:text-lg ${
            light ? "text-white/72" : "text-[#5f5750]"
          }`}
        >
          {body}
        </p>
      ) : null}
    </div>
  );
}

function GoldRule() {
  return <div className="h-px w-16 bg-[#d4c09a]" aria-hidden="true" />;
}

export default function ArtisanModelPage() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#171311] text-[#f7f1e8]">
      <Header onContactClick={() => setContactOpen(true)} />

      <section
        id="top"
        data-theme="dark"
        className="relative min-h-[650px] overflow-hidden px-5 pt-24 text-white md:min-h-[720px] md:px-8 lg:px-10"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/backgroundwithglasses2.jpeg')",
            backgroundAttachment: "fixed",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,14,12,0.94),rgba(18,14,12,0.78)_46%,rgba(18,14,12,0.5))]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#171311] to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[560px] max-w-7xl items-center md:min-h-[640px]">
          <div className="max-w-4xl">
            <GoldRule />
            <h1 className="mt-7 text-4xl font-semibold leading-[1.04] tracking-tight md:text-6xl lg:text-7xl">
              Take Control of Your Lab Relationship
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/78 md:text-xl">
              A model built for independent practices that want more control,
              better alignment, and a stronger long-term position.
            </p>
            <p className="mt-5 max-w-3xl border-l border-[#d4c09a]/60 pl-5 text-sm leading-7 text-white/68 md:text-base">
              The largest independent doctor-owned lab network in the United
              States, built alongside more than 60 practice groups participating
              in ownership.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#how-it-works"
                className="inline-flex min-h-12 items-center rounded-full bg-[#d4c09a] px-6 py-3 text-sm font-semibold text-[#171311] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e2cca2]"
              >
                See How It Works
              </a>
              <button
                type="button"
                onClick={() => setContactOpen(true)}
                className="inline-flex min-h-12 items-center rounded-full border border-white/18 bg-white/8 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/12"
              >
                Start a Conversation
              </button>
            </div>
          </div>
        </div>
      </section>

      <SectionShell id="problem" theme="dark" className="border-t border-white/10">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <SectionHeader
            eyebrow="The Problem"
            title="Why Most Lab Relationships Break Down"
            body="The issues are usually practical. Independent practices need access, consistency, and clear communication, but many lab relationships become harder to manage over time."
            light
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {problemItems.map((item, index) => (
              <div
                key={item.title}
                className={`group border border-white/12 bg-white/[0.045] p-5 shadow-[0_16px_50px_rgba(0,0,0,0.14)] backdrop-blur-md transition hover:-translate-y-1 hover:border-[#d4c09a]/50 hover:bg-white/[0.065] ${
                  index === problemItems.length - 1 ? "sm:col-span-2" : ""
                }`}
              >
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full border border-[#d4c09a]/45 text-sm font-semibold text-[#d4c09a]">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/65">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell id="how-it-works" className="border-y border-[#d8c6a8]/40">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
          <div>
            <SectionHeader
              eyebrow="The Shift"
              title="A Different Way to Work"
              body="Artisan is not just a lab. It is a network model built around alignment between the lab, the practice, and the long-term health of independent eye care."
            />
          </div>
          <div className="border border-[#d8c6a8]/55 bg-[#fffaf2]/75 p-6 shadow-[0_24px_80px_rgba(49,39,26,0.08)] md:p-8">
            <GoldRule />
            <p className="mt-6 text-2xl font-semibold leading-snug text-[#1f1a17] md:text-3xl">
              The model works because practices are not treated as accounts to
              manage. They are treated as serious operators with real goals,
              constraints, and decisions to make.
            </p>
            <p className="mt-6 text-base leading-8 text-[#5f5750]">
              This model has grown into the largest independent doctor-owned lab
              network in the U.S., built through real practice participation, not
              corporate acquisition.
            </p>
          </div>
        </div>
      </SectionShell>

      <SectionShell id="network">
        <div className="flex flex-col gap-8">
          <SectionHeader
            eyebrow="The Power of the Network"
            title="Stronger Together Than Alone"
            body="The strength of the model comes from the network itself. Today, Artisan Lab Network is the largest independent doctor-owned lab network in the United States, built alongside more than 60 practice groups working together."
          />
          <div className="grid gap-4 lg:grid-cols-3">
            {networkPillars.map((pillar) => (
              <div
                key={pillar.title}
                className="group border border-[#d8c6a8]/50 bg-[#171311] p-5 text-white shadow-[0_20px_70px_rgba(49,39,26,0.12)] transition hover:-translate-y-1 hover:border-[#d4c09a]/75 md:p-6"
              >
                <SiteIcon
                  src={pillar.icon}
                  tone="cream"
                  size="sm"
                  className="mb-5 h-12 w-12 border-white/12 bg-white/[0.08]"
                />
                <h3 className="text-2xl font-semibold">{pillar.title}</h3>
                <ul className="mt-7 space-y-4">
                  {pillar.items.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-6 text-white/72">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d4c09a]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell id="control" theme="dark">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <SectionHeader
            eyebrow="Supply Chain"
            title="Control Changes Everything"
            body="When practices have a clearer path through the lab relationship, the work becomes easier to manage. Turnaround is easier to understand. Communication is more direct. Dependency on a single outside structure is reduced."
            light
          />
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {controlItems.map((item) => (
              <div
                key={item.title}
                className="group min-h-32 border border-white/12 bg-white/[0.045] p-5 transition hover:-translate-y-1 hover:border-[#d4c09a]/50 hover:bg-white/[0.065]"
              >
                <div className="flex items-center gap-3">
                  <SiteIcon
                    src={item.icon}
                    tone="cream"
                    size="sm"
                    className="h-10 w-10 rounded-xl border-white/12 bg-white/[0.08]"
                  />
                  <div className="text-xs uppercase tracking-[0.22em] text-[#d4c09a]">
                    Control
                  </div>
                </div>
                <div className="mt-4 text-lg font-semibold leading-snug text-white md:text-xl">
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell id="partnership">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHeader
            eyebrow="Partnership"
            title="Partnership That Shows Up"
            body="A better lab model is only useful if it shows up in the work. Support, accountability, and communication have to be visible in daily operations."
          />
          <div className="grid gap-4">
            {partnershipItems.map((item) => (
              <div
                key={item.title}
                className="group border-l-2 border-[#d4c09a] bg-white/55 p-5 shadow-[0_16px_55px_rgba(49,39,26,0.08)] transition hover:bg-white/80 md:p-6"
              >
                <div className="flex items-center gap-4">
                  <SiteIcon
                    src={item.icon}
                    size="sm"
                    className="h-10 w-10 rounded-xl border-[#d8c6a8]/70 bg-[#fffaf2]"
                  />
                  <h3 className="text-xl font-semibold text-[#1f1a17]">{item.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-7 text-[#5f5750]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell id="ownership" theme="dark" className="overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div
            className="h-full w-full bg-cover bg-center"
            style={{
              backgroundImage: "url('/glassesbackground.jpeg')",
              backgroundAttachment: "fixed",
            }}
          />
        </div>
        <div className="absolute inset-0 bg-[#171311]/88" />
        <div className="relative mx-auto max-w-4xl">
          <SectionHeader eyebrow="Ownership" title="Going Deeper" light />
          <div className="mt-7 space-y-5 border border-white/12 bg-black/22 p-6 text-base leading-8 text-white/72 shadow-[0_24px_90px_rgba(0,0,0,0.22)] backdrop-blur-md md:p-8 md:text-lg">
            <SiteIcon
              src="/icons/site/lock.svg"
              tone="cream"
              className="h-14 w-14 border-white/12 bg-white/[0.08]"
            />
            <p>Some practices choose to go beyond a standard lab relationship.</p>
            <p>
              In certain cases, qualified practices may be invited to participate
              more closely in the network. This creates stronger alignment and a
              shared long-term view.
            </p>
            <p>
              These conversations are private and based on fit, timing, and
              shared goals.
            </p>
            <p>This is not publicly offered. It is built through relationships.</p>
            <p className="border-t border-white/10 pt-6 font-semibold text-white">
              This level of participation is what has helped shape the largest
              doctor-owned lab network in the country.
            </p>
          </div>
        </div>
      </SectionShell>

      <SectionShell
        id="timeline"
        className="overflow-hidden"
        accent={<RingsAccent position="top-right" size="lg" opacity="opacity-[0.055]" />}
      >
        <SectionHeader
          eyebrow="Timeline"
          title="Built With Intention. Proven Through Participation."
          body="Growth is measured by the practices that choose to be part of the model."
        />
        <p className="mt-5 text-sm font-semibold text-[#8a7654]">
          Scroll left to explore the timeline.
        </p>
        <div className="relative mt-8">
          <div className="absolute left-0 right-0 top-[3.25rem] hidden h-px bg-[#d8c6a8] md:block" />
          <div className="flex snap-x gap-3 overflow-x-auto pb-3 [scrollbar-width:thin]">
            {timeline.map(([year, title]) => (
              <div
                key={`${year}-${title}`}
                className="group relative min-w-[238px] snap-start border border-[#d8c6a8]/65 bg-[#fffaf2]/82 p-5 shadow-[0_12px_36px_rgba(49,39,26,0.07)] transition duration-200 hover:scale-[1.015] hover:border-[#c9b28b] hover:bg-white hover:shadow-[0_20px_55px_rgba(49,39,26,0.13)] md:min-w-[260px]"
              >
                <div className="mb-4 h-2 w-2 rounded-full bg-[#d4c09a] shadow-[0_0_18px_rgba(212,192,154,0.85)]" />
                <div className="text-4xl font-semibold leading-none tracking-tight text-[#9a8564]">
                  {year}
                </div>
                <div className="mt-4 text-sm font-semibold leading-6 text-[#1f1a17]">
                  {title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionShell>

      <NetworkMap />

      <SectionShell
        id="fit"
        theme="dark"
        className="overflow-hidden"
        accent={<RingsAccent position="center-right" size="md" opacity="opacity-[0.04]" />}
      >
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <SectionHeader
            eyebrow="Fit"
            title="Who This Works Best For"
            body="The model is built for practices that think carefully about independence, operations, and long-term position."
            light
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {fitItems.map((item) => (
              <div
                key={item.title}
                className="group flex min-h-24 items-center gap-4 border border-white/12 bg-white/[0.045] p-5 transition hover:-translate-y-1 hover:border-[#d4c09a]/50"
              >
                <SiteIcon
                  src={item.icon}
                  tone="cream"
                  size="sm"
                  className="h-10 w-10 rounded-xl border-white/12 bg-white/[0.08]"
                />
                <span className="text-base font-semibold leading-snug text-white">
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell
        id="outcomes"
        className="overflow-hidden"
        accent={<RingsAccent position="bottom-left" size="md" opacity="opacity-[0.045]" />}
      >
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <SectionHeader
            eyebrow="Outcomes"
            title="What This Means for Your Practice"
            body="The benefit is not abstract. The model is designed to give serious independent practices a stronger position in the work they do every day."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {outcomes.map((outcome) => (
              <div
                key={outcome.title}
                className="group border border-[#d8c6a8]/55 bg-white/60 p-6 shadow-[0_16px_55px_rgba(49,39,26,0.08)] transition hover:-translate-y-1 hover:bg-white/85"
              >
                <div className="flex items-center gap-3">
                  <SiteIcon
                    src={outcome.icon}
                    size="sm"
                    className="h-10 w-10 rounded-xl border-[#d8c6a8]/70 bg-[#fffaf2]"
                  />
                  <div className="text-xs uppercase tracking-[0.22em] text-[#9a8564]">
                    Outcome
                  </div>
                </div>
                <div className="mt-4 text-2xl font-semibold text-[#1f1a17]">
                  {outcome.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionShell>

      <section data-theme="dark" className="relative overflow-hidden px-5 py-16 text-white md:px-8 md:py-20 lg:px-10">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/backgroundimage.jpeg')",
            backgroundAttachment: "fixed",
          }}
        />
        <div className="absolute inset-0 bg-[#171311]/84" />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d4c09a]">
            Next Step
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
            Start the Right Conversation
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/70 md:text-lg">
            A serious practice deserves a serious conversation about control,
            alignment, and whether the model fits.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="inline-flex min-h-12 items-center rounded-full bg-[#d4c09a] px-6 py-3 text-sm font-semibold text-[#171311] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e2cca2]"
            >
              See If There's a Fit
            </button>
            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="inline-flex min-h-12 items-center rounded-full border border-white/18 bg-white/8 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/12"
            >
              Talk to Our Team
            </button>
          </div>
        </div>
      </section>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
      <Footer onContactClick={() => setContactOpen(true)} signUpHref={SIGNUP_URL} />
    </main>
  );
}
