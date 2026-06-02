"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Factory,
  Handshake,
  MapPin,
  Network,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";

const ACCOUNT_APPLICATION_URL = "https://form.typeform.com/to/quuPCSff";
const CONTACT_FORM_URL = "https://form.typeform.com/to/m0lQ9zjD";

type Journey = "gateway" | "switch" | "welcome";

const labs = [
  {
    name: "Pacific Artisan Labs",
    city: "Portland, OR",
    href: "/pacific-artisan-labs",
    logo: "/logos/PAL_2CTan.png",
    position: { left: "18%", top: "39%" },
  },
  {
    name: "Peak Artisan Labs",
    city: "Aurora, CO",
    href: "/peak-artisan-labs",
    logo: "/logos/Peak_Artisan_Logo 9-1-23_FINAL.png",
    position: { left: "43%", top: "54%" },
  },
  {
    name: "Pike Artisan Labs",
    city: "Indianapolis, IN",
    href: "/pike-artisan-labs",
    logo: "/logos/Pike_Labs_Logo-4C.png",
    position: { left: "67%", top: "45%" },
  },
];

const quickAccess = [
  { label: "Portal", href: "/portal" },
  { label: "Provider Resources", href: "/provider-resources" },
  { label: "Policies", href: "/lab-policies" },
  { label: "Contact Support", href: "mailto:sales@artisanlabnetwork.com" },
  { label: "Price Sheets", href: "/portal/price-list" },
];

const switchProblems = [
  {
    title: "You feel like a number",
    body: "Support is routed through systems instead of people who know your account.",
    icon: Users,
  },
  {
    title: "Choice keeps narrowing",
    body: "Product, process, and pricing decisions begin to feel dictated by someone else's model.",
    icon: ShieldCheck,
  },
  {
    title: "Service is hard to trust",
    body: "Delays, unclear communication, and surprise outcomes make patient promises harder to keep.",
    icon: BadgeCheck,
  },
];

const switchReasons = [
  "They want a lab relationship that feels personal again.",
  "They need clearer communication and practical support.",
  "They want access to strong products without giving up control.",
  "They believe independent practices deserve independent lab partners.",
];

const artisanDifferences = [
  {
    title: "Independent by design",
    body: "ALN is built around locally operated labs, not a one-size corporate production system.",
  },
  {
    title: "Relationship-driven",
    body: "Practices work with teams who understand their account, their patients, and their workflow.",
  },
  {
    title: "Performance-focused",
    body: "Turnaround, quality, communication, and support are treated as practice outcomes, not internal metrics.",
  },
  {
    title: "Built to help practices grow",
    body: "Programs, resources, and reporting help independent practices compete with more confidence.",
  },
];

const welcomeTimeline = [
  {
    year: "Foundation",
    title: "Independent labs choose a connected future",
    body: "Artisan begins with the belief that independent eyecare needs strong independent laboratory partners.",
  },
  {
    year: "Network",
    title: "Regional labs align around one standard",
    body: "Pacific, Peak, and Pike extend local service while sharing programs, resources, and operational strength.",
  },
  {
    year: "Now",
    title: "The model becomes a movement",
    body: "ALN supports practices, partners, and future labs that want independence to remain viable.",
  },
  {
    year: "Next",
    title: "Growth without losing the local relationship",
    body: "The vision is a larger independent network that still feels close to the practices it serves.",
  },
];

const growthNodes: Array<{
  label: string;
  position: string;
  icon: LucideIcon;
}> = [
  { label: "Practices", position: "left-[8%] top-[16%]", icon: Users },
  { label: "Labs", position: "right-[8%] top-[16%]", icon: Factory },
  { label: "Partners", position: "left-[10%] bottom-[16%]", icon: Handshake },
  { label: "Future", position: "right-[10%] bottom-[16%]", icon: Sparkles },
];

const missionCards = [
  {
    title: "Protect independence",
    body: "Give practices and labs a stronger path outside corporate consolidation.",
    icon: ShieldCheck,
  },
  {
    title: "Connect strength",
    body: "Let independent labs share resources without losing local identity.",
    icon: Network,
  },
  {
    title: "Build what is next",
    body: "Create programs and partnerships that keep independent eyecare competitive.",
    icon: Sparkles,
  },
];

const testimonials = [
  {
    eyebrow: "Practice Voice",
    quote:
      "A great lab partner helps the whole practice feel more confident with patients.",
    image: "/images/office-meeting-room-2025-1.jpg",
  },
  {
    eyebrow: "Lab Voice",
    quote:
      "The relationship still matters. Local teams see the practice behind every order.",
    image: "/images/team-at-lab-2025-1.jpg",
  },
  {
    eyebrow: "Partner Voice",
    quote:
      "Independent practices need partners who help them compete without giving up control.",
    image: "/images/conference-panel-speakers-2025-1.jpg",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.5, ease: "easeOut" },
} as const;

function ContactModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
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
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Close contact form"
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-md border border-white/15 bg-[#f5f1eb] shadow-[0_24px_80px_rgba(0,0,0,0.38)]"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between gap-4 border-b border-black/10 bg-[#f5f1eb] px-5 py-4 md:px-6">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-black/45">
                  Contact
                </p>
                <h2 className="text-lg font-semibold text-[#1f1a17]">
                  Talk With An Artisan
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
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function PageShell({
  children,
  onContactClick,
}: {
  children: React.ReactNode;
  onContactClick: () => void;
}) {
  return (
    <>
      <Header
        onContactClick={onContactClick}
        signUpHref={ACCOUNT_APPLICATION_URL}
      />
      <main>{children}</main>
      <ExistingCustomerAccess />
      <Footer signUpHref={ACCOUNT_APPLICATION_URL} onContactClick={onContactClick} />
    </>
  );
}

function CtaLink({
  href,
  children,
  tone = "dark",
}: {
  href: string;
  children: React.ReactNode;
  tone?: "dark" | "light" | "outline";
}) {
  const className =
    tone === "light"
      ? "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/22 bg-white px-5 py-2 text-sm font-semibold text-[#142724] transition hover:-translate-y-0.5 hover:bg-[#efe1c6]"
      : tone === "outline"
        ? "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#d8c49b] bg-transparent px-5 py-2 text-sm font-semibold text-[#142724] transition hover:-translate-y-0.5 hover:bg-white"
        : "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#142724] bg-[#142724] px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#27443f]";

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
        <ArrowRight className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
      <ArrowRight className="h-4 w-4" />
    </a>
  );
}

function SectionIntro({
  eyebrow,
  title,
  body,
  tone = "light",
  align = "left",
}: {
  eyebrow: string;
  title: string;
  body?: string;
  tone?: "light" | "dark";
  align?: "left" | "center";
}) {
  const color = tone === "dark" ? "text-white" : "text-[#142724]";
  const bodyColor = tone === "dark" ? "text-white/68" : "text-[#5f6965]";
  const eyebrowColor = tone === "dark" ? "text-[#d6bd89]" : "text-[#8a6f43]";

  return (
    <motion.div
      {...fadeUp}
      className={align === "center" ? "mx-auto max-w-4xl text-center" : "max-w-4xl"}
    >
      <p className={`text-xs font-bold uppercase tracking-[0.28em] ${eyebrowColor}`}>
        {eyebrow}
      </p>
      <h2 className={`mt-4 text-4xl font-semibold leading-[1.02] tracking-normal md:text-6xl ${color}`}>
        {title}
      </h2>
      {body ? (
        <p className={`mt-5 text-base leading-8 md:text-lg ${bodyColor}`}>
          {body}
        </p>
      ) : null}
    </motion.div>
  );
}

function GatewayHero() {
  return (
    <section
      data-theme="dark"
      className="relative min-h-screen overflow-hidden bg-[#111c1b] px-6 pb-16 pt-32 text-white md:px-10"
    >
      <Image
        src="/images/team-at-lab-2025-1.jpg"
        alt="Artisan lab team"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-48"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,28,27,0.92),rgba(17,28,27,0.68),rgba(17,28,27,0.45))]" />
      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-10rem)] max-w-7xl content-end gap-10">
        <motion.div {...fadeUp} className="max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#d6bd89]">
            Artisan Lab Network
          </p>
          <h1 className="mt-5 text-5xl font-semibold leading-[0.98] tracking-normal md:text-7xl">
            Choose the Artisan journey that fits why you are here.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/74 md:text-xl">
            Prospective customers can move straight into the lab-switching
            story. New visitors, partners, and industry friends can learn why
            ALN exists and where the independent movement is going.
          </p>
        </motion.div>
        <div className="grid gap-5 lg:grid-cols-2">
          <GatewayCard
            eyebrow="For Practices"
            title="Switch To Artisan"
            body="If your practice is evaluating lab alternatives, start here."
            href="/switch-to-artisan"
            image="/images/eye-exam-office-2022-1.jpg"
          />
          <GatewayCard
            eyebrow="For Everyone Else"
            title="Welcome To Artisan"
            body="If you want to understand ALN, the network, and the movement, start here."
            href="/welcome-to-artisan"
            image="/images/business-networking-event-2022-1.jpg"
          />
        </div>
      </div>
    </section>
  );
}

function GatewayCard({
  eyebrow,
  title,
  body,
  href,
  image,
}: {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  image: string;
}) {
  return (
    <motion.article
      {...fadeUp}
      className="group overflow-hidden rounded-md border border-white/14 bg-white/[0.08] shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur"
    >
      <div className="relative h-56 overflow-hidden">
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-6">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d6bd89]">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-3xl font-semibold">{title}</h2>
        <p className="mt-3 leading-7 text-white/68">{body}</p>
        <Link
          href={href}
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#142724] transition hover:bg-[#efe1c6]"
        >
          Start Here
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.article>
  );
}

function SwitchHero() {
  return (
    <section
      data-theme="dark"
      className="relative min-h-[88vh] overflow-hidden bg-[#122724] px-6 pb-16 pt-32 text-white md:px-10"
    >
      <Image
        src="/images/eye-exam-office-2022-1.jpg"
        alt="Doctor helping a patient"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-58"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,39,36,0.92),rgba(18,39,36,0.7),rgba(18,39,36,0.36))]" />
      <div className="relative z-10 mx-auto flex min-h-[calc(88vh-10rem)] max-w-7xl flex-col justify-end">
        <motion.div {...fadeUp} className="max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#d6bd89]">
            Switch To Artisan
          </p>
          <h1 className="mt-5 text-5xl font-semibold leading-[0.98] tracking-normal md:text-7xl">
            A better lab relationship for independent practices.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/76 md:text-xl">
            If your practice is tired of feeling boxed in, slowed down, or
            treated like a transaction, Artisan gives you a relationship-first
            alternative built around independence, service, and outcomes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CtaLink href={ACCOUNT_APPLICATION_URL} tone="light">
              Become a Customer
            </CtaLink>
            <CtaLink href="/welcome-to-artisan" tone="light">
              Learn About ALN
            </CtaLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function WelcomeHero() {
  return (
    <section
      data-theme="dark"
      className="relative min-h-[88vh] overflow-hidden bg-[#111c1b] px-6 pb-16 pt-32 text-white md:px-10"
    >
      <Image
        src="/images/business-networking-event-2022-1.jpg"
        alt="Independent eyecare gathering"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-54"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,28,27,0.94),rgba(17,28,27,0.68),rgba(17,28,27,0.34))]" />
      <div className="relative z-10 mx-auto flex min-h-[calc(88vh-10rem)] max-w-7xl flex-col justify-end">
        <motion.div {...fadeUp} className="max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#d6bd89]">
            Welcome To Artisan
          </p>
          <h1 className="mt-5 text-5xl font-semibold leading-[0.98] tracking-normal md:text-7xl">
            Protecting the Future of Independent Eyecare
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/76 md:text-xl">
            Artisan Lab Network brings independent laboratories, practices, and
            partners together around one mission: keep independent eyecare
            strong, competitive, and locally connected.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CtaLink href="/switch-to-artisan" tone="light">
              Switch To Artisan
            </CtaLink>
            <CtaLink href="#model" tone="light">
              Explore the Model
            </CtaLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section className="bg-[#f5f1eb] px-6 py-16 text-[#142724] md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Traditional Lab Friction"
          title="When the lab relationship is wrong, the whole practice feels it."
          body="Practices usually do not switch labs over one order. They switch when the relationship starts costing time, confidence, flexibility, and trust."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {switchProblems.map((item) => (
            <IconCard key={item.title} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function WhySwitchSection() {
  return (
    <section className="bg-white px-6 py-16 text-[#142724] md:px-10 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <motion.div
          {...fadeUp}
          className="relative min-h-[560px] overflow-hidden rounded-md shadow-[0_24px_80px_rgba(20,39,36,0.12)]"
        >
          <Image
            src="/images/storefront-group-photo-2025-1.jpg"
            alt="Independent eyecare practice team"
            fill
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover"
          />
        </motion.div>
        <div>
          <SectionIntro
            eyebrow="Why Practices Switch"
            title="They are not only buying lenses. They are choosing a partner."
          />
          <div className="mt-8 grid gap-3">
            {switchReasons.map((reason) => (
              <motion.div
                key={reason}
                {...fadeUp}
                className="flex gap-3 rounded-md border border-[#d8c49b] bg-[#fffaf6] p-4"
              >
                <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#1b5b66]" />
                <p className="font-semibold leading-7">{reason}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ArtisanDifferenceSection() {
  return (
    <section className="bg-[#142724] px-6 py-16 text-white md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Why Artisan Is Different"
          title="Independent labs, connected strength, and a service model practices can feel."
          body="Artisan keeps the local lab relationship at the center while adding the scale, programs, and resources practices need to compete."
          tone="dark"
          align="center"
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {artisanDifferences.map((item) => (
            <motion.article
              key={item.title}
              {...fadeUp}
              className="rounded-md border border-white/12 bg-white/[0.055] p-6"
            >
              <h3 className="text-2xl font-semibold">{item.title}</h3>
              <p className="mt-4 leading-7 text-white/66">{item.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function MissionSection() {
  return (
    <section className="bg-[#f5f1eb] px-6 py-16 text-[#142724] md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Why ALN Exists"
          title="Independent practices deserve independent labs."
          body="ALN was created to protect choice, preserve strong local lab relationships, and give independent eyecare a network model built for its own future."
          align="center"
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {missionCards.map((card) => (
            <IconCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ConsolidationSection() {
  const steps = [
    "Independent Practices",
    "Industry Consolidation",
    "Fewer Choices",
    "Artisan Network Model",
  ];

  return (
    <section className="bg-white px-6 py-16 text-[#142724] md:px-10 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <SectionIntro
          eyebrow="The Consolidation Problem"
          title="The industry keeps getting bigger. Independent practices need a model that gets stronger."
          body="As ownership, products, and distribution channels consolidate, practices can lose flexibility and leverage. ALN is a different answer: independent labs working together without erasing what makes them local."
        />
        <motion.div
          {...fadeUp}
          className="rounded-md border border-[#d8c49b] bg-[#f5f1eb] p-5 shadow-[0_24px_80px_rgba(20,39,36,0.1)]"
        >
          {steps.map((step, index) => (
            <div key={step}>
              <div className="grid min-h-16 grid-cols-[auto_1fr] items-center gap-4 rounded-md border border-[#eadfce] bg-white p-4">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#142724] text-sm font-bold text-white">
                  {index + 1}
                </span>
                <p className="text-lg font-semibold">{step}</p>
              </div>
              {index < steps.length - 1 ? (
                <div className="ml-5 h-7 border-l-2 border-dashed border-[#b8945c]" />
              ) : null}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function ModelSection() {
  const nodes: Array<{ label: string; icon: LucideIcon }> = [
    { label: "Independent Practices", icon: Users },
    { label: "Independent Laboratories", icon: Factory },
    { label: "Artisan Lab Network", icon: Network },
  ];

  return (
    <section id="model" className="bg-[#142724] px-6 py-16 text-white md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="The Artisan Model"
          title="Built by independent labs. Designed for independent practices."
          body="The model connects local lab teams, shared programs, and practice-focused resources without turning the relationship into another corporate channel."
          tone="dark"
          align="center"
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {nodes.map((node) => (
            <motion.article
              key={node.label}
              {...fadeUp}
              className="rounded-md border border-white/12 bg-white/[0.055] p-6 text-center"
            >
              <node.icon className="mx-auto h-9 w-9 text-[#d6bd89]" />
              <h3 className="mt-5 text-2xl font-semibold">{node.label}</h3>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function LabsSection({ dark = false }: { dark?: boolean }) {
  return (
    <section
      id="labs"
      className={`${dark ? "bg-[#111c1b] text-white" : "bg-[#f5f1eb] text-[#142724]"} px-6 py-16 md:px-10 md:py-24`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionIntro
              eyebrow="Meet The Labs"
              title="Three labs. One connected standard."
              body="Pacific, Peak, and Pike each keep the local relationship close while operating as part of a larger independent network."
              tone={dark ? "dark" : "light"}
            />
            <div className="mt-8 grid gap-3">
              {labs.map((lab) => (
                <Link
                  key={lab.name}
                  href={lab.href}
                  className={`${dark ? "border-white/12 bg-white/[0.055] hover:bg-white/[0.09]" : "border-[#d8c49b] bg-white hover:bg-[#fffaf6]"} flex items-center gap-4 rounded-md border p-4 transition`}
                >
                  <span className="grid h-14 w-14 place-items-center rounded-md bg-white p-2">
                    <Image
                      src={lab.logo}
                      alt=""
                      width={90}
                      height={60}
                      className="max-h-10 w-auto object-contain"
                    />
                  </span>
                  <span>
                    <span className="block text-lg font-semibold">{lab.name}</span>
                    <span className={dark ? "text-white/58" : "text-[#5f6965]"}>
                      {lab.city}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <NetworkMap />
        </div>
      </div>
    </section>
  );
}

function NetworkMap() {
  return (
    <motion.div
      {...fadeUp}
      className="relative min-h-[500px] overflow-hidden rounded-md border border-white/12 bg-[#1b2b29] shadow-[0_30px_90px_rgba(0,0,0,0.18)]"
    >
      <Image
        src="/map.png"
        alt="Map of Artisan Lab Network locations"
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover opacity-55 saturate-[0.78]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,28,27,0.08),rgba(17,28,27,0.58))]" />
      {labs.map((lab) => (
        <Link
          key={lab.name}
          href={lab.href}
          className="group absolute -translate-x-1/2 -translate-y-1/2"
          style={lab.position}
        >
          <span className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d6bd89]/45 bg-[#d6bd89]/18 aln-map-pulse" />
          <span className="relative grid h-12 w-12 place-items-center rounded-full border border-[#d6bd89] bg-[#f5f1eb] shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
            <MapPin className="h-5 w-5 text-[#142724]" />
          </span>
          <span className="absolute left-8 top-8 min-w-44 rounded-md border border-white/12 bg-[#f5f1eb] p-3 text-[#142724] opacity-0 shadow-xl transition group-hover:opacity-100">
            <span className="block text-sm font-bold">{lab.name}</span>
            <span className="mt-1 block text-xs text-[#5f6965]">{lab.city}</span>
          </span>
        </Link>
      ))}
    </motion.div>
  );
}

function TestimonialsSection() {
  return (
    <section className="bg-white px-6 py-16 text-[#142724] md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Testimonials"
          title="The right lab relationship shows up in daily practice life."
          body="This section is ready for real customer video or written testimonials as they are approved."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.map((story) => (
            <motion.article
              key={story.eyebrow}
              {...fadeUp}
              className="overflow-hidden rounded-md border border-[#d8c49b] bg-[#fffaf6]"
            >
              <div className="relative h-52">
                <Image
                  src={story.image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8a6f43]">
                  {story.eyebrow}
                </p>
                <blockquote className="mt-4 text-lg font-semibold leading-8">
                  &quot;{story.quote}&quot;
                </blockquote>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TimelineSection() {
  return (
    <section className="bg-[#f5f1eb] px-6 py-16 text-[#142724] md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Company Timeline"
          title="A growing network with a clear reason to exist."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {welcomeTimeline.map((item) => (
            <motion.article
              key={item.year}
              {...fadeUp}
              className="rounded-md border border-[#d8c49b] bg-white p-5"
            >
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a6f43]">
                {item.year}
              </p>
              <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#5f6965]">{item.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function GrowthSection() {
  return (
    <section className="bg-white px-6 py-16 text-[#142724] md:px-10 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <SectionIntro
          eyebrow="Growth And Vision"
          title="The goal is not to become corporate. The goal is to make independence stronger."
          body="ALN can grow by connecting more independent labs, more practices, and more partners around shared resources while keeping the relationship local and accountable."
        />
        <motion.div
          {...fadeUp}
          className="relative min-h-[420px] rounded-md border border-[#d8c49b] bg-[#f5f1eb] p-6"
        >
          <div className="absolute inset-6 rounded-md border border-dashed border-[#c5aa76]" />
          <div className="relative grid h-full min-h-[372px] place-items-center">
            <div className="grid h-36 w-36 place-items-center rounded-full bg-[#142724] text-center text-white shadow-[0_18px_50px_rgba(20,39,36,0.2)]">
              <Network className="h-10 w-10 text-[#d6bd89]" />
              <span className="text-xs font-bold uppercase tracking-[0.16em]">ALN</span>
            </div>
            {growthNodes.map(({ label, position, icon: Icon }) => (
              <div
                key={label}
                className={`absolute ${position} rounded-md border border-[#d8c49b] bg-white p-4 text-center`}
              >
                <Icon className="mx-auto h-6 w-6 text-[#1b5b66]" />
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ConversionCta({
  title,
  body,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  body: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}) {
  return (
    <section className="bg-[#142724] px-6 py-16 text-white md:px-10 md:py-24">
      <div className="mx-auto max-w-5xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d6bd89]">
          Next Step
        </p>
        <h2 className="mt-5 text-5xl font-semibold leading-[1] tracking-normal md:text-7xl">
          {title}
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/72">
          {body}
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <CtaLink href={primaryHref} tone="light">
            {primaryLabel}
          </CtaLink>
          <CtaLink href={secondaryHref} tone="light">
            {secondaryLabel}
          </CtaLink>
        </div>
      </div>
    </section>
  );
}

function ExistingCustomerAccess() {
  return (
    <section className="bg-[#f5f1eb] px-6 py-10 text-[#142724] md:px-10">
      <div className="mx-auto max-w-7xl rounded-md border border-[#d8c49b] bg-white p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a6f43]">
              Existing Customers
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Quick access for current Artisan partners.
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickAccess.map((item) =>
              item.href.startsWith("/") ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-full border border-[#d8c49b] px-4 py-2 text-sm font-semibold text-[#142724] transition hover:bg-[#f5f1eb]"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-full border border-[#d8c49b] px-4 py-2 text-sm font-semibold text-[#142724] transition hover:bg-[#f5f1eb]"
                >
                  {item.label}
                </a>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function IconCard({
  title,
  body,
  icon: Icon,
}: {
  title: string;
  body: string;
  icon: LucideIcon;
}) {
  return (
    <motion.article
      {...fadeUp}
      className="rounded-md border border-[#d8c49b] bg-white p-6 shadow-[0_18px_48px_rgba(20,39,36,0.08)]"
    >
      <Icon className="h-8 w-8 text-[#1b5b66]" />
      <h3 className="mt-5 text-2xl font-semibold">{title}</h3>
      <p className="mt-3 leading-7 text-[#5f6965]">{body}</p>
    </motion.article>
  );
}

function JourneyPage({ journey }: { journey: Journey }) {
  const [contactOpen, setContactOpen] = useState(false);
  const openContact = () => setContactOpen(true);

  if (journey === "switch") {
    return (
      <>
        <PageShell onContactClick={openContact}>
          <SwitchHero />
          <ProblemSection />
          <WhySwitchSection />
          <ArtisanDifferenceSection />
          <LabsSection />
          <TestimonialsSection />
          <ConversionCta
            title="Become a Customer"
            body="Discover what a true independent laboratory partnership can do for your practice."
            primaryHref={ACCOUNT_APPLICATION_URL}
            primaryLabel="Become a Customer"
            secondaryHref="/welcome-to-artisan"
            secondaryLabel="Explore ALN"
          />
        </PageShell>
        <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
      </>
    );
  }

  if (journey === "welcome") {
    return (
      <>
        <PageShell onContactClick={openContact}>
          <WelcomeHero />
          <MissionSection />
          <ConsolidationSection />
          <ModelSection />
          <LabsSection dark />
          <TimelineSection />
          <GrowthSection />
          <ConversionCta
            title="Join the movement"
            body="Whether you are a practice, partner, or independent lab, ALN exists to make the independent future stronger."
            primaryHref="/switch-to-artisan"
            primaryLabel="Switch To Artisan"
            secondaryHref={ACCOUNT_APPLICATION_URL}
            secondaryLabel="Become a Customer"
          />
        </PageShell>
        <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
      </>
    );
  }

  return (
    <>
      <PageShell onContactClick={openContact}>
        <GatewayHero />
      </PageShell>
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}

export function ArtisanGatewayPage() {
  return <JourneyPage journey="gateway" />;
}

export function SwitchToArtisanPage() {
  return <JourneyPage journey="switch" />;
}

export function WelcomeToArtisanPage() {
  return <JourneyPage journey="welcome" />;
}
