"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  Cog,
  Compass,
  Factory,
  Gauge,
  Gem,
  Glasses,
  Handshake,
  Leaf,
  MapPin,
  Mountain,
  Route,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  Trees,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";

type IconName =
  | "arrowRight"
  | "clock"
  | "cog"
  | "compass"
  | "factory"
  | "gauge"
  | "gem"
  | "glasses"
  | "handshake"
  | "leaf"
  | "mapPin"
  | "mountain"
  | "route"
  | "scanLine"
  | "shieldCheck"
  | "sparkles"
  | "target"
  | "timer"
  | "trees"
  | "users"
  | "zap";

export type LabLandingConfig = {
  labName: string;
  locationLabel: string;
  logo: string;
  logoAlt: string;
  logoDark?: boolean;
  heroImage: string;
  heroAlt: string;
  heroEyebrowIcon: IconName;
  headline: string;
  subheadline: string;
  theme: "pacific" | "peak" | "pike";
  accent: string;
  accentSoft: string;
  dark: string;
  heroOverlay: string;
  primaryHref: string;
  contactHref: string;
  resourcesHref: string;
  intro: {
    eyebrow: string;
    title: string;
    body: string[];
    image: string;
    imageAlt: string;
    icon: IconName;
  };
  difference: {
    eyebrow: string;
    title: string;
    cards: Array<{ icon: IconName; title: string; body: string }>;
  };
  strengths: {
    eyebrow: string;
    title: string;
    body: string;
    image: string;
    imageAlt: string;
    points: Array<{ icon: IconName; title: string; body: string }>;
  };
  technology: {
    eyebrow: string;
    title: string;
    body: string;
    image: string;
    imageAlt: string;
    cards: Array<{ icon: IconName; title: string; body: string }>;
  };
  partnership: {
    eyebrow: string;
    title: string;
    body: string;
    image: string;
    imageAlt: string;
    stats: Array<{ icon: IconName; value: string; label: string }>;
  };
  features: {
    eyebrow: string;
    title: string;
    cards: Array<{ icon: IconName; title: string; body: string }>;
  };
  culture: {
    eyebrow: string;
    title: string;
    body: string;
    image: string;
    imageAlt: string;
    notes: string[];
  };
  finalCta: {
    title: string;
    body: string;
    image: string;
    imageAlt: string;
    icon: IconName;
  };
  stats: {
    partnerLocations: number;
    regionLine: string;
  };
};

const iconMap: Record<IconName, LucideIcon> = {
  arrowRight: ArrowRight,
  clock: Clock,
  cog: Cog,
  compass: Compass,
  factory: Factory,
  gauge: Gauge,
  gem: Gem,
  glasses: Glasses,
  handshake: Handshake,
  leaf: Leaf,
  mapPin: MapPin,
  mountain: Mountain,
  route: Route,
  scanLine: ScanLine,
  shieldCheck: ShieldCheck,
  sparkles: Sparkles,
  target: Target,
  timer: Timer,
  trees: Trees,
  users: Users,
  zap: Zap,
};

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: "easeOut" },
} as const;

export default function LabLandingPage({ config }: { config: LabLandingConfig }) {
  return (
    <main className="min-h-screen bg-[#f4eee4] text-[#142033]">
      <Header signUpHref={config.primaryHref} />
      <Hero config={config} />
      <Identity config={config} />
      <LabStats config={config} />
      <MeetArtisans config={config} />
      <Difference config={config} />
      <Strengths config={config} />
      <Technology config={config} />
      <Partnership config={config} />
      <FeatureGrid config={config} />
      <Culture config={config} />
      <FinalCta config={config} />
      <Footer signUpHref={config.primaryHref} />
    </main>
  );
}

function Hero({ config }: { config: LabLandingConfig }) {
  const EyebrowIcon = iconMap[config.heroEyebrowIcon];

  return (
    <section data-theme="dark" className="relative isolate min-h-screen overflow-hidden pt-24 text-white">
      <div
        aria-hidden
        className={`absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat md:bg-fixed ${heroPositionClass(config.theme)}`}
        style={{ backgroundImage: `url(${config.heroImage})` }}
      />
      <Image src={config.heroImage} alt={config.heroAlt} width={1} height={1} priority className="sr-only" />
      <div className={`absolute inset-0 -z-10 ${config.heroOverlay}`} />
      <div className={heroAccentClass(config.theme)} aria-hidden />

      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-7xl flex-col justify-end px-5 pb-12 md:px-10 md:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <Image
            src={config.logo}
            alt={config.logoAlt}
            width={360}
            height={160}
            className={`mb-8 h-auto max-h-28 w-52 object-contain sm:w-72 ${config.logoDark ? "rounded-3xl bg-white/86 p-4 shadow-2xl" : ""}`}
          />
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/82 backdrop-blur">
            <EyebrowIcon className="h-4 w-4" />
            {config.locationLabel}
          </div>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            {config.headline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80 md:text-xl">{config.subheadline}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={config.primaryHref} variant="gold">Become an Artisan Partner</ButtonLink>
            <ButtonLink href={config.contactHref} variant="light">Contact the Lab</ButtonLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function LabStats({ config }: { config: LabLandingConfig }) {
  const cards = [
    { value: String(config.stats.partnerLocations), label: "Equity Ownership Partner Locations", icon: Users },
    { value: "Yes", label: "VSP", icon: ShieldCheck, check: true },
    { value: "Yes", label: "NBN", icon: ShieldCheck, check: true },
  ];
  const networkNotes = ["Doctor owned network", "Independent lab model", "Premium lens production", "Service first support", "Built for independent practices"];

  return (
    <section data-theme="dark" className="relative isolate overflow-hidden px-5 py-20 text-white md:px-10 lg:py-24" style={{ background: config.dark }}>
      <div className="pointer-events-none absolute -left-28 top-8 -z-10 h-80 w-80 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute right-[-8rem] top-20 -z-10 h-[28rem] w-[28rem] rounded-full border opacity-35" style={{ borderColor: config.accent }} />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_15%,rgba(212,192,154,0.14),transparent_34%),radial-gradient(circle_at_82%_60%,rgba(255,255,255,0.08),transparent_30%)]" />
      <div className="mx-auto max-w-7xl">
        <motion.div {...reveal} className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <SectionLabel config={config} light icon={iconMap.gem}>Network Strength</SectionLabel>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Local lab character with connected network advantages.
            </h2>
            <p className="mt-5 text-lg leading-8 text-white/68">
              {config.stats.regionLine}
            </p>
          </div>
          <BrandTicker config={config} />
        </motion.div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.label}
                {...reveal}
                transition={{ duration: 0.48, delay: index * 0.06, ease: "easeOut" }}
                className="group rounded-[1.75rem] border border-white/12 bg-white/[0.065] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur transition hover:-translate-y-1 hover:border-white/24 hover:bg-white/[0.09]"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/12 bg-white/10">
                  <Icon className="h-5 w-5" style={{ color: config.accent }} />
                </span>
                <div className="mt-6 flex items-center gap-3 text-5xl font-semibold tracking-tight">
                  {card.value}
                  {card.check ? <ShieldCheck className="h-8 w-8" style={{ color: config.accent }} /> : null}
                </div>
                <p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/58">{card.label}</p>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {networkNotes.map((note) => (
            <div key={note} className="rounded-2xl border border-white/10 bg-black/18 px-4 py-4 text-sm font-semibold text-white/72 backdrop-blur">
              {note}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const brandNames = [
  "Hoya",
  "Varilux",
  "IOT",
  "Younger",
  "Transitions",
  "TechShield",
  "Artisan",
  "Shamir",
  "SunSync",
  "Glacier",
  "Sequel",
  "Neochromes",
  "Tokai",
  "Sensity",
  "Unity",
  "Crizal",
  "Essilor",
  "Neurolens",
  "10+ Brands You Trust",
];

function BrandTicker({ config }: { config: LabLandingConfig }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= brandNames.length - 1) return;
    const timer = window.setTimeout(() => setIndex((current) => Math.min(current + 1, brandNames.length - 1)), 900);
    return () => window.clearTimeout(timer);
  }, [index]);

  return (
    <div className="rounded-[1.75rem] border border-white/12 bg-white/[0.07] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/52">Brand Access</p>
        <span className="rounded-full border border-white/12 bg-black/18 px-3 py-1 text-xs font-semibold" style={{ color: config.accent }}>
          Partner Choice
        </span>
      </div>
      <motion.div
        key={brandNames[index]}
        initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.38, ease: "easeOut" }}
        className="mt-6 min-h-20 text-4xl font-semibold tracking-tight md:text-5xl"
      >
        {brandNames[index]}
      </motion.div>
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: config.accent }}
          animate={{ width: `${((index + 1) / brandNames.length) * 100}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function MeetArtisans({ config }: { config: LabLandingConfig }) {
  return (
    <section data-theme="light" className="relative overflow-hidden border-b border-[#dccbaa] bg-[#fbf7ef] px-5 py-16 md:px-10 lg:py-20">
      <DecorativeRings config={config} />
      <motion.div {...reveal} className="mx-auto grid max-w-7xl gap-8 rounded-[2rem] border border-[#dccbaa] bg-white/78 p-6 shadow-[0_20px_58px_rgba(30,22,14,0.08)] backdrop-blur md:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <SectionLabel icon={iconMap.users} config={config}>Meet Your Artisans</SectionLabel>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Real people, real craft, real service behind every order.
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[#4f5662] md:text-lg">
            Behind every prescription is a team that cares about the result. Meet the people who bring craft, service, and independent values to your lab experience.
          </p>
        </div>
        <Link
          href="/meet-the-artisans"
          className="inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
          style={{ backgroundColor: config.dark }}
        >
          Meet the Team Behind Your Lab
        </Link>
      </motion.div>
    </section>
  );
}

function Identity({ config }: { config: LabLandingConfig }) {
  const Icon = iconMap[config.intro.icon];

  return (
    <section data-theme="light" className="relative overflow-hidden px-5 py-20 md:px-10 lg:py-28">
      <DecorativeRings config={config} />
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
        <motion.div {...reveal} className="relative">
          <div className="absolute -left-4 -top-4 hidden h-36 w-36 rounded-full border md:block" style={{ borderColor: config.accentSoft }} />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-[0_26px_70px_rgba(30,22,14,0.14)]">
            <Image src={config.intro.image} alt={config.intro.imageAlt} fill sizes="(max-width: 1024px) 100vw, 46vw" className="object-cover" />
          </div>
        </motion.div>
        <motion.div {...reveal}>
          <SectionLabel icon={Icon} config={config}>{config.intro.eyebrow}</SectionLabel>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">{config.intro.title}</h2>
          <div className="mt-6 space-y-5 text-lg leading-8 text-[#4f5662]">
            {config.intro.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Difference({ config }: { config: LabLandingConfig }) {
  return (
    <section data-theme="dark" className="relative overflow-hidden px-5 py-20 text-white md:px-10 lg:py-24" style={{ background: config.dark }}>
      <div className={differenceTextureClass(config.theme)} aria-hidden />
      <div className="mx-auto max-w-7xl">
        <motion.div {...reveal} className="max-w-3xl">
          <SectionLabel config={config} light>{config.difference.eyebrow}</SectionLabel>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">{config.difference.title}</h2>
        </motion.div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {config.difference.cards.map((card, index) => <PremiumCard key={card.title} card={card} config={config} dark index={index} />)}
        </div>
      </div>
    </section>
  );
}

function Strengths({ config }: { config: LabLandingConfig }) {
  return (
    <section data-theme="light" className="px-5 py-20 md:px-10 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
        <motion.div {...reveal}>
          <SectionLabel icon={iconMap.factory} config={config}>{config.strengths.eyebrow}</SectionLabel>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">{config.strengths.title}</h2>
          <p className="mt-6 text-lg leading-8 text-[#4f5662]">{config.strengths.body}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {config.strengths.points.map((point) => <FeatureRow key={point.title} item={point} config={config} />)}
          </div>
        </motion.div>
        <motion.div {...reveal} className="relative aspect-[5/6] overflow-hidden rounded-[2rem] shadow-[0_26px_70px_rgba(30,22,14,0.14)]">
          <Image src={config.strengths.image} alt={config.strengths.imageAlt} fill sizes="(max-width: 1024px) 100vw, 44vw" className="object-cover" />
        </motion.div>
      </div>
    </section>
  );
}

function Technology({ config }: { config: LabLandingConfig }) {
  return (
    <section data-theme="light" className="border-y border-[#dccbaa] bg-[#fbf7ef] px-5 py-20 md:px-10 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <motion.div {...reveal} className="grid gap-4 sm:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-[0_22px_54px_rgba(30,22,14,0.12)] sm:translate-y-8">
            <Image src={config.technology.image} alt={config.technology.imageAlt} fill sizes="(max-width: 1024px) 50vw, 28vw" className="object-cover" />
          </div>
          <div className="grid content-center gap-4">
            {config.technology.cards.map((card) => <MiniCard key={card.title} card={card} config={config} />)}
          </div>
        </motion.div>
        <motion.div {...reveal}>
          <SectionLabel icon={iconMap.scanLine} config={config}>{config.technology.eyebrow}</SectionLabel>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">{config.technology.title}</h2>
          <p className="mt-6 text-lg leading-8 text-[#4f5662]">{config.technology.body}</p>
        </motion.div>
      </div>
    </section>
  );
}

function Partnership({ config }: { config: LabLandingConfig }) {
  return (
    <section data-theme="dark" className="relative isolate overflow-hidden px-5 py-20 text-white md:px-10 lg:py-28" style={{ background: config.dark }}>
      <Image src={config.partnership.image} alt={config.partnership.imageAlt} fill sizes="100vw" className="absolute inset-0 -z-20 object-cover opacity-28" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(15,25,38,0.94),rgba(15,25,38,0.7),rgba(15,25,38,0.9))]" />
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.82fr] lg:items-end">
        <motion.div {...reveal}>
          <SectionLabel config={config} light>{config.partnership.eyebrow}</SectionLabel>
          <h2 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight md:text-5xl">{config.partnership.title}</h2>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/72">{config.partnership.body}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={config.primaryHref} variant="gold">Become an Artisan Partner</ButtonLink>
            <ButtonLink href={config.resourcesHref} variant="ghost">Explore Practice Resources</ButtonLink>
          </div>
        </motion.div>
        <motion.div {...reveal} className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {config.partnership.stats.map((stat) => {
            const Icon = iconMap[stat.icon];
            return (
              <div key={stat.label} className="rounded-[1.5rem] border border-white/12 bg-white/[0.075] p-5 backdrop-blur">
                <Icon className="h-5 w-5" style={{ color: config.accent }} />
                <div className="mt-4 text-3xl font-semibold">{stat.value}</div>
                <p className="mt-1 text-sm leading-6 text-white/65">{stat.label}</p>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

function FeatureGrid({ config }: { config: LabLandingConfig }) {
  return (
    <section data-theme="light" className="px-5 py-20 md:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div {...reveal} className="max-w-3xl">
          <SectionLabel icon={iconMap.sparkles} config={config}>{config.features.eyebrow}</SectionLabel>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">{config.features.title}</h2>
        </motion.div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {config.features.cards.map((card, index) => <PremiumCard key={card.title} card={card} config={config} index={index} />)}
        </div>
      </div>
    </section>
  );
}

function Culture({ config }: { config: LabLandingConfig }) {
  return (
    <section data-theme="light" className="bg-[#fbf7ef] px-5 py-20 md:px-10 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
        <motion.div {...reveal} className="relative aspect-[5/4] overflow-hidden rounded-[2rem] shadow-[0_26px_70px_rgba(30,22,14,0.13)]">
          <Image src={config.culture.image} alt={config.culture.imageAlt} fill sizes="(max-width: 1024px) 100vw, 46vw" className="object-cover" />
        </motion.div>
        <motion.div {...reveal}>
          <SectionLabel icon={iconMap.users} config={config}>{config.culture.eyebrow}</SectionLabel>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">{config.culture.title}</h2>
          <p className="mt-6 text-lg leading-8 text-[#4f5662]">{config.culture.body}</p>
          <div className="mt-8 grid gap-3">
            {config.culture.notes.map((note) => (
              <div key={note} className="flex items-start gap-3 rounded-2xl border border-[#dccbaa] bg-white/76 p-4">
                <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full" style={{ backgroundColor: config.accentSoft, color: config.dark }}>
                  <ArrowRight className="h-4 w-4" />
                </span>
                <p className="text-sm leading-6 text-[#4f5662]">{note}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FinalCta({ config }: { config: LabLandingConfig }) {
  const Icon = iconMap[config.finalCta.icon];

  return (
    <section data-theme="dark" className="relative isolate overflow-hidden px-5 py-24 text-white md:px-10 lg:py-32">
      <Image src={config.finalCta.image} alt={config.finalCta.imageAlt} fill sizes="100vw" className="absolute inset-0 -z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(15,25,38,0.94),rgba(15,25,38,0.64),rgba(15,25,38,0.88))]" />
      <motion.div {...reveal} className="mx-auto max-w-4xl text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-white/15 bg-white/10 backdrop-blur">
          <Icon className="h-7 w-7" style={{ color: config.accent }} />
        </span>
        <h2 className="mt-6 text-4xl font-semibold tracking-tight md:text-6xl">{config.finalCta.title}</h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/76">{config.finalCta.body}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href={config.primaryHref} variant="gold">Become an Artisan Partner</ButtonLink>
          <ButtonLink href={config.contactHref} variant="light">Contact the Lab</ButtonLink>
          <ButtonLink href={config.resourcesHref} variant="ghost">Explore Practice Resources</ButtonLink>
        </div>
      </motion.div>
    </section>
  );
}

function PremiumCard({
  card,
  config,
  dark = false,
  index,
}: {
  card: { icon: IconName; title: string; body: string };
  config: LabLandingConfig;
  dark?: boolean;
  index: number;
}) {
  const Icon = iconMap[card.icon];

  return (
    <motion.article
      {...reveal}
      transition={{ duration: 0.48, delay: index * 0.04, ease: "easeOut" }}
      className={dark ? "rounded-[1.75rem] border border-white/12 bg-white/[0.06] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur" : "rounded-[1.75rem] border border-[#dccbaa] bg-white/82 p-6 shadow-[0_18px_48px_rgba(30,22,14,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_54px_rgba(30,22,14,0.12)]"}
    >
      <IconContainer config={config} icon={Icon} dark={dark} />
      <h3 className={`mt-5 text-2xl font-semibold ${dark ? "text-white" : "text-[#142033]"}`}>{card.title}</h3>
      <p className={`mt-3 text-sm leading-7 ${dark ? "text-white/68" : "text-[#5f6570]"}`}>{card.body}</p>
    </motion.article>
  );
}

function MiniCard({ card, config }: { card: { icon: IconName; title: string; body: string }; config: LabLandingConfig }) {
  const Icon = iconMap[card.icon];

  return (
    <article className="rounded-[1.5rem] border border-[#dccbaa] bg-white/86 p-5 shadow-[0_14px_34px_rgba(30,22,14,0.08)]">
      <IconContainer config={config} icon={Icon} />
      <h3 className="mt-4 text-lg font-semibold">{card.title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#5f6570]">{card.body}</p>
    </article>
  );
}

function FeatureRow({ item, config }: { item: { icon: IconName; title: string; body: string }; config: LabLandingConfig }) {
  const Icon = iconMap[item.icon];

  return (
    <div className="rounded-[1.35rem] border border-[#dccbaa] bg-white/78 p-5 shadow-[0_14px_34px_rgba(30,22,14,0.06)]">
      <IconContainer config={config} icon={Icon} />
      <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#5f6570]">{item.body}</p>
    </div>
  );
}

function IconContainer({ icon: Icon, config, dark = false }: { icon: LucideIcon; config: LabLandingConfig; dark?: boolean }) {
  return (
    <span className={`grid h-11 w-11 place-items-center rounded-2xl border ${dark ? "border-white/12 bg-white/10" : "border-[#dccbaa] bg-[#fbf7ef]"}`}>
      <Icon className="h-5 w-5" style={{ color: dark ? config.accent : config.dark }} strokeWidth={1.8} />
    </span>
  );
}

function SectionLabel({
  children,
  config,
  light = false,
  icon: Icon,
}: {
  children: React.ReactNode;
  config: LabLandingConfig;
  light?: boolean;
  icon?: LucideIcon;
}) {
  return (
    <p className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] ${light ? "text-[#d8c098]" : "text-[#8a6f3d]"}`}>
      {Icon ? <Icon className="h-4 w-4" style={{ color: light ? config.accent : config.dark }} /> : null}
      {children}
    </p>
  );
}

function ButtonLink({
  href,
  children,
  variant,
}: {
  href: string;
  children: React.ReactNode;
  variant: "gold" | "light" | "ghost";
}) {
  const classes = {
    gold: "bg-[#d4c09a] text-[#121a25] border-[#d4c09a] hover:bg-[#e2cca2]",
    light: "bg-white text-[#121a25] border-white hover:bg-[#f7efe3]",
    ghost: "bg-white/10 text-white border-white/25 hover:bg-white/18",
  }[variant];
  const shared = `inline-flex min-h-12 items-center justify-center rounded-full border px-6 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 ${classes}`;

  if (href.startsWith("/")) {
    return <Link href={href} className={shared}>{children}</Link>;
  }

  return <a href={href} target="_blank" rel="noreferrer" className={shared}>{children}</a>;
}

function DecorativeRings({ config }: { config: LabLandingConfig }) {
  return (
    <>
      <div className="pointer-events-none absolute right-[-90px] top-20 h-72 w-72 rounded-full border opacity-40" style={{ borderColor: config.accentSoft }} />
      <div className="pointer-events-none absolute right-[-24px] top-40 h-40 w-40 rounded-full border opacity-40" style={{ borderColor: config.accent }} />
    </>
  );
}

function heroAccentClass(theme: LabLandingConfig["theme"]) {
  if (theme === "pike") {
    return "pointer-events-none absolute bottom-0 left-0 right-0 -z-10 h-40 bg-[linear-gradient(110deg,transparent_0%,rgba(185,58,48,0.2)_42%,transparent_62%)]";
  }

  if (theme === "peak") {
    return "pointer-events-none absolute bottom-0 left-0 right-0 -z-10 h-44 bg-[linear-gradient(150deg,transparent_0%,rgba(139,161,176,0.2)_50%,transparent_72%)]";
  }

  return "pointer-events-none absolute bottom-0 left-0 right-0 -z-10 h-44 bg-[radial-gradient(circle_at_24%_82%,rgba(199,173,121,0.2),transparent_34%)]";
}

function heroPositionClass(theme: LabLandingConfig["theme"]) {
  if (theme === "pacific") return "bg-[position:center_center]";
  if (theme === "peak") return "bg-[position:center_center]";
  return "bg-[position:center_center]";
}

function differenceTextureClass(theme: LabLandingConfig["theme"]) {
  if (theme === "pike") {
    return "pointer-events-none absolute inset-0 opacity-30 bg-[linear-gradient(105deg,transparent_0%,transparent_42%,rgba(255,255,255,0.08)_42.3%,transparent_45%,transparent_58%,rgba(255,255,255,0.06)_58.2%,transparent_61%)]";
  }

  if (theme === "peak") {
    return "pointer-events-none absolute inset-0 opacity-35 bg-[linear-gradient(135deg,transparent_0%,transparent_52%,rgba(255,255,255,0.08)_52.3%,transparent_64%)]";
  }

  return "pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_12%_22%,rgba(216,192,152,0.2),transparent_28%),radial-gradient(circle_at_82%_72%,rgba(81,108,88,0.25),transparent_28%)]";
}
