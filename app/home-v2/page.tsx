"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Factory,
  Globe2,
  Handshake,
  MapPin,
  Network,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const ACCOUNT_APPLICATION_URL = "https://form.typeform.com/to/quuPCSff";
const CONTACT_FORM_URL = "https://form.typeform.com/to/m0lQ9zjD";

const montageImages = [
  {
    src: "/images/team-at-lab-2025-1.jpg",
    alt: "Artisan lab team in a laboratory",
  },
  {
    src: "/images/eye-exam-office-2022-1.jpg",
    alt: "Doctor with patient in an eyecare practice",
  },
  {
    src: "/images/factory-conveyor-machine-2026-1.jpg",
    alt: "Optical laboratory production equipment",
  },
  {
    src: "/images/eyeglasses-display-2022-1.jpg",
    alt: "Finished eyewear on display",
  },
  {
    src: "/images/business-meeting-discussion-2022-1.jpg",
    alt: "Independent practice team collaborating",
  },
  {
    src: "/meet-the-artisans/labs/shared/factory-conveyor-trays-2024-1.jpg",
    alt: "Lab trays moving through production",
  },
];

const industrySteps = [
  "Independent Practices",
  "Industry Consolidation",
  "Fewer Choices",
  "ALN Network Model",
];

const modelPillars = [
  {
    title: "Independence",
    body: "Maintain relationships, flexibility, and choice.",
    icon: ShieldCheck,
  },
  {
    title: "Collaboration",
    body: "Gain access to the strength of a growing network.",
    icon: Handshake,
  },
  {
    title: "Innovation",
    body: "Leverage programs, technology, and resources built specifically for independent eyecare.",
    icon: Sparkles,
  },
];

const modelNodes: Array<{ label: string; icon: LucideIcon }> = [
  { label: "Independent Practices", icon: Users },
  { label: "Independent Laboratories", icon: Factory },
  { label: "Artisan Lab Network", icon: Network },
];

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

const futureLocations = [
  { label: "Expansion Market", position: { left: "55%", top: "32%" } },
  { label: "Expansion Market", position: { left: "78%", top: "58%" } },
];

const futureNodes: Array<{
  label: string;
  position: string;
  icon: LucideIcon;
}> = [
  { label: "Practices", position: "left-[7%] top-[12%]", icon: Users },
  { label: "Labs", position: "right-[7%] top-[12%]", icon: Factory },
  { label: "Programs", position: "left-[9%] bottom-[12%]", icon: Sparkles },
  { label: "Partners", position: "right-[9%] bottom-[12%]", icon: Handshake },
];

const networkStats = [
  { value: "3", label: "Independent Labs", icon: Factory },
  { value: "3.5", label: "Day Average Turnaround", icon: BadgeCheck },
  { value: "84%", label: "Orders Shipped by Day 4", icon: ArrowRight },
  { value: "U.S.", label: "Production Focus", icon: Globe2 },
  { value: "4.9/5.0", label: "Customer Service", icon: Users },
];

const choiceCards = [
  {
    title: "Relationships Matter",
    body: "Work with people who know your business.",
    image: "/images/business-handshake-flags-2022-1.jpg",
  },
  {
    title: "Independence Matters",
    body: "Protect choice and flexibility.",
    image: "/images/storefront-group-photo-2025-1.jpg",
  },
  {
    title: "Performance Matters",
    body: "Access leading products, programs, and expertise.",
    image: "/images/lens-cutting-machine-2024-1.jpg",
  },
  {
    title: "Growth Matters",
    body: "Build a stronger future for your practice.",
    image: "/images/conference-networking-event-2022-1.jpg",
  },
];

const comparison = {
  traditional: [
    "Centralized",
    "Corporate ownership",
    "Limited flexibility",
    "One-size-fits-all",
  ],
  artisan: [
    "Independent",
    "Locally operated",
    "Relationship-driven",
    "Built for independent practices",
  ],
};

const programs = [
  {
    title: "Acquios Alliance",
    body: "A practical partnership path for practices looking for stronger support, resources, and business alignment.",
    href: "/acquios",
    logo: "/logos/acquios-alliance.png",
  },
  {
    title: "UOA",
    body: "Education, community, and industry connection for opticians and eyecare leaders.",
    href: "/uoa",
    logo: "/uoa-logo.jpg",
  },
  {
    title: "New Lab Partner",
    body: "A dedicated path for independent labs interested in joining the Artisan model.",
    href: "/new-lab-partner",
    logo: "/aln-icon.png",
  },
  {
    title: "Provider Resources",
    body: "Product guides, patient materials, policies, and tools for current Artisan customers.",
    href: "/provider-resources",
    logo: "/aln_4c_square_logo.png",
  },
];

const quickAccess = [
  { label: "Portal", href: "/portal" },
  { label: "Provider Resources", href: "/provider-resources" },
  { label: "Policies", href: "/lab-policies" },
  { label: "Contact Support", href: "mailto:sales@artisanlabnetwork.com" },
  { label: "Price Sheets", href: "/portal/price-list" },
];

const fadeUp = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.55, ease: "easeOut" },
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

function CtaLink({
  href,
  children,
  tone = "dark",
}: {
  href: string;
  children: React.ReactNode;
  tone?: "dark" | "light";
}) {
  const className =
    tone === "light"
      ? "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/22 bg-white px-5 py-2 text-sm font-semibold text-[#142724] transition hover:-translate-y-0.5 hover:bg-[#efe1c6]"
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

function MontageHero() {
  return (
    <section
      data-theme="dark"
      className="relative min-h-[92vh] overflow-hidden bg-[#0f1716] text-white"
    >
      <div className="absolute inset-0 grid grid-cols-2 gap-1 opacity-80 md:grid-cols-3">
        {montageImages.map((image, index) => (
          <motion.div
            key={image.src}
            className="relative min-h-[31vh] overflow-hidden"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: [1.05, 1.01, 1.05] }}
            transition={{
              opacity: { duration: 0.7, delay: index * 0.08 },
              scale: { duration: 14 + index, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority={index < 2}
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover"
            />
          </motion.div>
        ))}
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,20,19,0.9)_0%,rgba(10,20,19,0.72)_40%,rgba(10,20,19,0.35)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(0deg,#f5f1eb_0%,rgba(245,241,235,0)_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-end px-6 pb-20 pt-32 md:px-10 lg:pb-24">
        <motion.div {...fadeUp} className="max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#d6bd89]">
            Artisan Lab Network
          </p>
          <h1 className="mt-5 max-w-5xl text-5xl font-semibold leading-[0.94] tracking-normal md:text-7xl lg:text-8xl">
            Protecting the Future of Independent Eyecare
          </h1>
          <p className="mt-6 max-w-3xl text-xl leading-8 text-white/88 md:text-2xl">
            The largest network of independent optical laboratories built to
            help independent practices thrive.
          </p>
          <p className="mt-5 max-w-3xl text-base leading-7 text-white/72 md:text-lg">
            Independent practices deserve independent labs. Artisan Lab Network
            brings together industry-leading independent laboratories,
            innovative programs, and practice-focused resources to help doctors
            compete, grow, and remain independent.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CtaLink href={ACCOUNT_APPLICATION_URL} tone="light">
              Become a Customer
            </CtaLink>
            <CtaLink href="#network" tone="light">
              Explore the Network
            </CtaLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SectionIntro({
  eyebrow,
  title,
  body,
  align = "left",
  tone = "light",
}: {
  eyebrow: string;
  title: string;
  body?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
}) {
  const eyebrowClass = tone === "dark" ? "text-[#d6bd89]" : "text-[#8a6f43]";
  const titleClass = tone === "dark" ? "text-white" : "text-[#142724]";
  const bodyClass = tone === "dark" ? "text-white/68" : "text-[#5f6965]";

  return (
    <motion.div
      {...fadeUp}
      className={align === "center" ? "mx-auto max-w-4xl text-center" : "max-w-4xl"}
    >
      <p className={`text-xs font-bold uppercase tracking-[0.28em] ${eyebrowClass}`}>
        {eyebrow}
      </p>
      <h2 className={`mt-4 text-4xl font-semibold leading-[1.02] tracking-normal md:text-6xl ${titleClass}`}>
        {title}
      </h2>
      {body ? (
        <p className={`mt-5 text-base leading-8 md:text-lg ${bodyClass}`}>
          {body}
        </p>
      ) : null}
    </motion.div>
  );
}

function IndustrySection() {
  return (
    <section className="bg-[#f5f1eb] px-6 py-16 text-[#142724] md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <SectionIntro
            eyebrow="The Industry Is Changing"
            title="ALN was created because independent practices need more than another corporate option."
            body="Large corporations continue to consolidate laboratories, products, and distribution channels. Independent practices are left with fewer choices, less flexibility, and less control over their future."
          />
          <motion.div
            {...fadeUp}
            className="rounded-md border border-[#d8c49b] bg-white p-5 shadow-[0_24px_80px_rgba(20,39,36,0.1)]"
          >
            <div className="grid gap-4">
              {industrySteps.map((step, index) => (
                <div key={step}>
                  <div className="grid min-h-16 grid-cols-[auto_1fr] items-center gap-4 rounded-md border border-[#eadfce] bg-[#fffaf6] p-4">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-[#142724] text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <p className="text-lg font-semibold">{step}</p>
                  </div>
                  {index < industrySteps.length - 1 ? (
                    <div className="ml-5 h-7 border-l-2 border-dashed border-[#b8945c]" />
                  ) : null}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ModelSection() {
  return (
    <section className="bg-white px-6 py-16 text-[#142724] md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="A Different Model"
          title="Built By Independent Labs. Designed For Independent Practices."
          align="center"
        />
        <motion.div
          {...fadeUp}
          className="mt-10 grid gap-5 rounded-md border border-[#d8c49b] bg-[#f5f1eb] p-5 shadow-[0_24px_80px_rgba(20,39,36,0.09)] lg:grid-cols-3"
        >
          {modelNodes.map(({ label, icon: Icon }, index) => (
            <div key={label} className="relative">
              <div className="flex min-h-32 flex-col justify-center rounded-md border border-[#eadfce] bg-white p-6 text-center">
                <Icon className="mx-auto h-8 w-8 text-[#8a6f43]" />
                <p className="mt-4 text-xl font-semibold">{label}</p>
              </div>
              {index < 2 ? (
                <span className="absolute -right-5 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#d8c49b] bg-[#142724] text-white lg:flex">
                  &lt;-&gt;
                </span>
              ) : null}
            </div>
          ))}
        </motion.div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {modelPillars.map((pillar) => (
            <motion.article
              key={pillar.title}
              {...fadeUp}
              className="rounded-md border border-[#d8c49b] bg-[#fffaf6] p-6"
            >
              <pillar.icon className="h-8 w-8 text-[#1b5b66]" />
              <h3 className="mt-5 text-2xl font-semibold">{pillar.title}</h3>
              <p className="mt-3 leading-7 text-[#5f6965]">{pillar.body}</p>
            </motion.article>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <CtaLink href="/artisan-model">Learn About the Artisan Model</CtaLink>
        </div>
      </div>
    </section>
  );
}

function NetworkSection() {
  return (
    <section
      id="network"
      data-theme="dark"
      className="bg-[#111c1b] px-6 py-16 text-white md:px-10 md:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <SectionIntro
              eyebrow="The Network"
              title="A Growing Network of Independent Laboratories"
              body="Three independent labs operate with one connected standard for service, quality, and independent practice support. Future locations extend the model without losing local relationships."
              tone="dark"
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {networkStats.map((stat) => (
                <article
                  key={stat.label}
                  className="rounded-md border border-white/12 bg-white/[0.055] p-4"
                >
                  <stat.icon className="h-5 w-5 text-[#d6bd89]" />
                  <p className="mt-3 text-3xl font-semibold text-white">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase leading-5 tracking-[0.16em] text-white/58">
                    {stat.label}
                  </p>
                </article>
              ))}
            </div>
            <div className="mt-8">
              <CtaLink href="/#labs" tone="light">
                Meet Our Labs
              </CtaLink>
            </div>
          </div>

          <motion.div
            {...fadeUp}
            className="relative min-h-[520px] overflow-hidden rounded-md border border-white/12 bg-[#1b2b29] shadow-[0_30px_90px_rgba(0,0,0,0.28)]"
          >
            <Image
              src="/map.png"
              alt="Map of Artisan Lab Network locations"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover opacity-55 saturate-[0.78]"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_35%,rgba(214,189,137,0.2),transparent_42%),linear-gradient(180deg,rgba(17,28,27,0.1),rgba(17,28,27,0.6))]" />
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
                  <span className="mt-1 block text-xs text-[#5f6965]">
                    {lab.city}
                  </span>
                </span>
              </Link>
            ))}
            {futureLocations.map((location) => (
              <span
                key={`${location.position.left}-${location.position.top}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/40 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/76"
                style={location.position}
              >
                {location.label}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function WhySection() {
  return (
    <section className="bg-[#f5f1eb] px-6 py-16 text-[#142724] md:px-10 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.94fr_1.06fr] lg:items-center">
        <motion.div
          {...fadeUp}
          className="relative min-h-[620px] overflow-hidden rounded-md shadow-[0_24px_90px_rgba(20,39,36,0.13)]"
        >
          <Image
            src="/images/eye-exam-office-2022-1.jpg"
            alt="Doctor working with a patient"
            fill
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover"
          />
        </motion.div>
        <div>
          <SectionIntro
            eyebrow="Why Practices Choose ALN"
            title="Because independence only works when the partnership is strong."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {choiceCards.map((card) => (
              <motion.article
                key={card.title}
                {...fadeUp}
                className="overflow-hidden rounded-md border border-[#d8c49b] bg-white shadow-[0_18px_48px_rgba(20,39,36,0.08)]"
              >
                <div className="relative h-36">
                  <Image
                    src={card.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-semibold">{card.title}</h3>
                  <p className="mt-3 leading-7 text-[#5f6965]">{card.body}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ComparisonSection() {
  const [activeSide, setActiveSide] = useState<"traditional" | "artisan">("artisan");

  return (
    <section className="bg-white px-6 py-16 text-[#142724] md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="What Makes Us Different"
          title="Traditional lab consolidation and the Artisan model are not the same story."
          align="center"
        />
        <div className="mt-10 flex justify-center">
          <div className="grid rounded-full border border-[#d8c49b] bg-[#f5f1eb] p-1 sm:grid-cols-2">
            {(["traditional", "artisan"] as const).map((side) => (
              <button
                key={side}
                type="button"
                onClick={() => setActiveSide(side)}
                className={`min-h-11 rounded-full px-5 text-sm font-semibold capitalize transition ${
                  activeSide === side
                    ? "bg-[#142724] text-white shadow"
                    : "text-[#5f6965] hover:bg-white"
                }`}
              >
                {side === "traditional" ? "Traditional Model" : "Artisan Model"}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {(["traditional", "artisan"] as const).map((side) => {
            const selected = activeSide === side;
            return (
              <motion.article
                key={side}
                {...fadeUp}
                className={`rounded-md border p-6 transition ${
                  selected
                    ? "border-[#142724] bg-[#142724] text-white shadow-[0_24px_80px_rgba(20,39,36,0.18)]"
                    : "border-[#d8c49b] bg-[#fffaf6] text-[#142724]"
                }`}
              >
                <h3 className="text-3xl font-semibold">
                  {side === "traditional" ? "Traditional Model" : "Artisan Model"}
                </h3>
                <ul className="mt-6 grid gap-3">
                  {comparison[side].map((item) => (
                    <li
                      key={item}
                      className={`flex items-center gap-3 rounded-md border p-4 ${
                        selected
                          ? "border-white/12 bg-white/[0.06]"
                          : "border-[#eadfce] bg-white"
                      }`}
                    >
                      <BadgeCheck
                        className={`h-5 w-5 ${
                          selected ? "text-[#d6bd89]" : "text-[#1b5b66]"
                        }`}
                      />
                      <span className="font-semibold">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProgramsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeProgram = programs[activeIndex];

  const go = (direction: number) => {
    setActiveIndex((current) => (current + direction + programs.length) % programs.length);
  };

  return (
    <section className="bg-[#102c34] px-6 py-16 text-white md:px-10 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Featured Programs"
          title="Programs that make independence more practical."
          body="The homepage should persuade new visitors, but the program layer still matters. These are the paths that help practices and partners move deeper."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-stretch">
          <div className="grid gap-3">
            {programs.map((program, index) => (
              <button
                key={program.title}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`rounded-md border p-4 text-left transition ${
                  activeIndex === index
                    ? "border-[#d6bd89] bg-white text-[#142724]"
                    : "border-white/12 bg-white/[0.055] text-white hover:bg-white/[0.09]"
                }`}
              >
                <p className="text-lg font-semibold">{program.title}</p>
                <p className={`mt-2 text-sm leading-6 ${activeIndex === index ? "text-[#5f6965]" : "text-white/62"}`}>
                  {program.body}
                </p>
              </button>
            ))}
          </div>
          <motion.article
            key={activeProgram.title}
            className="relative min-h-[440px] overflow-hidden rounded-md border border-white/12 bg-white p-8 text-[#142724] shadow-[0_28px_90px_rgba(0,0,0,0.22)]"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.28 }}
          >
            <div className="absolute right-0 top-0 h-full w-1/2 bg-[#f5f1eb]" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="grid h-24 w-24 place-items-center rounded-md border border-[#d8c49b] bg-white p-4">
                  <Image
                    src={activeProgram.logo}
                    alt=""
                    width={180}
                    height={120}
                    className="max-h-16 w-auto object-contain"
                  />
                </div>
                <h3 className="mt-8 max-w-2xl text-5xl font-semibold leading-[1.02] tracking-normal">
                  {activeProgram.title}
                </h3>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5f6965]">
                  {activeProgram.body}
                </p>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <CtaLink href={activeProgram.href}>Explore Program</CtaLink>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="grid h-12 w-12 place-items-center rounded-full border border-[#d8c49b] bg-white transition hover:bg-[#f5f1eb]"
                  aria-label="Previous program"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="grid h-12 w-12 place-items-center rounded-full border border-[#d8c49b] bg-white transition hover:bg-[#f5f1eb]"
                  aria-label="Next program"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}

function FutureSection() {
  return (
    <section className="overflow-hidden bg-white px-6 py-16 text-[#142724] md:px-10 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <SectionIntro
          eyebrow="The Future of Independent Labs"
          title="We're Building What's Next"
          body="The future of independent eyecare depends on strong independent laboratories, innovative partnerships, and practices committed to remaining independent. ALN exists to help make that future possible."
        />
        <motion.div
          {...fadeUp}
          className="relative min-h-[500px] rounded-md border border-[#d8c49b] bg-[#f5f1eb] p-6 shadow-[0_24px_90px_rgba(20,39,36,0.1)]"
        >
          <div className="absolute inset-6 rounded-md border border-dashed border-[#c5aa76]" />
          <div className="relative z-10 grid h-full min-h-[452px] place-items-center">
            <div className="grid h-36 w-36 place-items-center rounded-full border border-[#d8c49b] bg-[#142724] p-5 text-center text-white shadow-[0_18px_50px_rgba(20,39,36,0.22)]">
              <Image
                src="/aln-icon.png"
                alt=""
                width={80}
                height={80}
                className="h-12 w-12 object-contain"
              />
              <span className="mt-2 text-xs font-bold uppercase tracking-[0.16em]">
                ALN
              </span>
            </div>
            {futureNodes.map(({ label, position, icon: Icon }) => (
              <div
                key={label}
                className={`absolute ${position} rounded-md border border-[#d8c49b] bg-white p-4 text-center shadow-[0_14px_38px_rgba(20,39,36,0.08)]`}
              >
                <Icon className="mx-auto h-7 w-7 text-[#1b5b66]" />
                <p className="mt-3 text-sm font-bold uppercase tracking-[0.14em]">
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

function FinalCtaSection({ onContactClick }: { onContactClick: () => void }) {
  return (
    <section
      data-theme="dark"
      className="bg-[#142724] px-6 py-16 text-white md:px-10 md:py-24"
    >
      <div className="mx-auto max-w-5xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#d6bd89]">
          Ready To Experience The Difference?
        </p>
        <h2 className="mt-5 text-5xl font-semibold leading-[1] tracking-normal md:text-7xl">
          Become a Customer
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/72">
          Discover what a true independent laboratory partnership can do for
          your practice.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <CtaLink href={ACCOUNT_APPLICATION_URL} tone="light">
            Become a Customer
          </CtaLink>
          <button
            type="button"
            onClick={onContactClick}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/22 bg-transparent px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white hover:text-[#142724]"
          >
            Talk With An Artisan
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

function ExistingCustomerSection() {
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

export default function HomeV2Page() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <Header
        onContactClick={() => setContactOpen(true)}
        signUpHref={ACCOUNT_APPLICATION_URL}
      />
      <main>
        <MontageHero />
        <IndustrySection />
        <ModelSection />
        <NetworkSection />
        <WhySection />
        <ComparisonSection />
        <ProgramsSection />
        <FutureSection />
        <FinalCtaSection onContactClick={() => setContactOpen(true)} />
        <ExistingCustomerSection />
      </main>
      <Footer
        signUpHref={ACCOUNT_APPLICATION_URL}
        onContactClick={() => setContactOpen(true)}
      />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
