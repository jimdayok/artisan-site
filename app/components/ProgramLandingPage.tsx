"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import {
  COMPLIANCE_NOTE,
  type ProgramPageData,
  programHref,
} from "../programs/programData";

const whyCards = [
  {
    title: "Real pricing",
    body: "Clear pricing and direct program value without inflated lists or hidden math.",
  },
  {
    title: "More choice",
    body: "Access a broader lab relationship with trusted lens, AR, and workflow options.",
  },
  {
    title: "Independent partnership",
    body: "Support designed for independent practices that want more control and better options.",
  },
  {
    title: "Responsive service",
    body: "A practical team that helps your practice move quickly when orders and questions come up.",
  },
];

const steps = [
  {
    title: "Sign up",
    body: "Submit the program form so Artisan can review your invitation and account eligibility.",
  },
  {
    title: "Send orders",
    body: "Start routing eligible work through Artisan and let the program support your next move.",
  },
  {
    title: "Experience the difference",
    body: "Evaluate the service, product choice, and profitability support with real orders.",
  },
];

function openExternal(href: string) {
  window.open(href, "_blank", "noopener,noreferrer");
}

function BackgroundSection({
  children,
  className = "",
  theme = "dark",
  image = "/graphics/rings2.jpg",
}: {
  children: ReactNode;
  className?: string;
  theme?: "dark" | "light";
  image?: string;
}) {
  const overlay = theme === "dark" ? "bg-black/72" : "bg-[#fbf8f3]/88";

  return (
    <section
      data-theme={theme}
      className={`relative isolate overflow-hidden bg-cover bg-center bg-scroll md:bg-fixed ${className}`}
      style={{ backgroundImage: `url('${image}')` }}
    >
      <div className={`pointer-events-none absolute inset-0 -z-10 ${overlay}`} />
      {children}
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  body,
  tone = "light",
}: {
  eyebrow: string;
  title: string;
  body?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div className="max-w-3xl">
      <p
        className={`text-xs font-semibold uppercase tracking-[0.28em] ${
          tone === "dark" ? "text-[#d4c09a]" : "text-[#8a7654]"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-4 text-3xl font-semibold tracking-tight md:text-5xl ${
          tone === "dark" ? "text-white" : "text-[#201a16]"
        }`}
      >
        {title}
      </h2>
      {body ? (
        <p
          className={`mt-5 text-base leading-8 md:text-lg ${
            tone === "dark" ? "text-white/72" : "text-[#62584d]"
          }`}
        >
          {body}
        </p>
      ) : null}
    </div>
  );
}

function CtaLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "dark";
}) {
  const className =
    variant === "primary"
      ? "inline-flex min-h-12 items-center justify-center rounded-full bg-[#d4c09a] px-7 py-3 text-sm font-semibold text-[#171311] shadow-[0_18px_45px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 hover:bg-[#e2cca2]"
      : variant === "dark"
        ? "inline-flex min-h-12 items-center justify-center rounded-full bg-[#1f1a17] px-7 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(49,39,26,0.14)] transition hover:-translate-y-0.5 hover:bg-[#c9b28b] hover:text-[#1f1a17]"
        : "inline-flex min-h-12 items-center justify-center rounded-full border border-white/18 bg-white/8 px-7 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[#d4c09a]/65 hover:bg-white/14";

  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  );
}

function ProgramLogo({ program }: { program: ProgramPageData }) {
  if (!program.logo) return null;
  const isUnity = program.slug === "unity-rebate";

  return (
    <div
      className={`mb-7 flex w-fit items-center rounded-2xl border border-white/12 bg-[#fbf8f3] shadow-[0_18px_45px_rgba(0,0,0,0.18)] ${
        isUnity ? "px-4 py-3" : "px-5 py-3"
      }`}
    >
      <Image
        src={program.logo.src}
        alt={program.logo.alt}
        width={560}
        height={220}
        priority
        className={`w-auto object-contain ${
          isUnity ? "max-h-[150px] max-w-[380px] scale-[1.25]" : "max-h-[100px] max-w-[300px] scale-[1.15]"
        }`}
      />
    </div>
  );
}

function moneyValue(value: string, isUnity: boolean) {
  return value
    .replace(" per pair", "")
    .replace(isUnity ? "Unity + TechShield " : "", "")
    .trim();
}

function TierCards({ program }: { program: ProgramPageData }) {
  if (!program.tiers) return null;
  const isUnity = program.slug === "unity-rebate";

  return (
    <div className="mt-10">
      <div className="hidden overflow-hidden rounded-[28px] border border-[#d4c09a]/65 bg-[linear-gradient(135deg,#15100e_0%,#241d19_52%,#130f0d_100%)] shadow-[0_28px_90px_rgba(49,39,26,0.28),0_0_0_1px_rgba(212,192,154,0.18)] md:block">
        <div
          className={`grid ${
            isUnity ? "grid-cols-[1fr_1.2fr_1.1fr_1.1fr]" : "grid-cols-[1fr_1.4fr_1.2fr]"
          } border-b border-white/12 bg-black/28 px-6 py-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#d4c09a]`}
        >
          <div>Tier</div>
          <div>Total Monthly Rxs</div>
          <div className="text-right">{isUnity ? "Unity + TechShield" : "Rebate Per Sequel PAL Pair"}</div>
          {isUnity ? <div className="text-right">TechShield + Other PAL</div> : null}
        </div>
        {program.tiers.map((tier) => (
          <div
            key={tier.name}
            className={`grid ${
              isUnity ? "grid-cols-[1fr_1.2fr_1.1fr_1.1fr]" : "grid-cols-[1fr_1.4fr_1.2fr]"
            } items-center border-b border-white/10 px-6 py-6 text-white transition duration-300 last:border-b-0 hover:bg-white/[0.07] ${
              tier.featured
                ? "bg-[linear-gradient(90deg,rgba(212,192,154,0.34),rgba(212,192,154,0.16))] shadow-[inset_0_0_0_1px_rgba(212,192,154,0.78),0_0_42px_rgba(212,192,154,0.26)]"
                : "bg-white/[0.025]"
            }`}
          >
            <div className="text-lg font-semibold">{tier.name}</div>
            <div className="text-base text-white/76">{tier.range.replace("monthly Rxs", "")}</div>
            <div className="text-right text-5xl font-semibold tracking-tight text-white">
              {moneyValue(tier.payout, isUnity)}
            </div>
            {isUnity ? (
              <div className="text-right text-5xl font-semibold tracking-tight text-white">
                {tier.secondaryPayout ? moneyValue(tier.secondaryPayout, false).replace("TechShield + Other PAL ", "") : "-"}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:hidden">
        {program.tiers.map((tier) => (
          <article
            key={tier.name}
            className={`rounded-[24px] border p-5 shadow-[0_18px_48px_rgba(49,39,26,0.12)] ${
              tier.featured
                ? "border-[#d4c09a] bg-[#171311] text-white"
                : "border-[#e1d4c2] bg-white text-[#201a16]"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${tier.featured ? "text-[#d4c09a]" : "text-[#8a7654]"}`}>
                  {tier.name}
                </p>
                <h3 className="mt-2 text-lg font-semibold">{tier.range.replace("monthly Rxs", "")} monthly Rxs</h3>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-65">
                  {isUnity ? "Unity + TechShield" : "Rebate"}
                </p>
                <p className="mt-1 text-4xl font-semibold">{moneyValue(tier.payout, isUnity)}</p>
              </div>
            </div>
            {isUnity ? (
              <div className="mt-4 rounded-2xl border border-current/12 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-65">
                  TechShield + Other PAL
                </p>
                <p className="mt-1 text-3xl font-semibold">
                  {tier.secondaryPayout ? moneyValue(tier.secondaryPayout, false).replace("TechShield + Other PAL ", "") : "-"}
                </p>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}

function ArLogoCards({ program }: { program: ProgramPageData }) {
  if (!program.arLogos) return null;

  return (
    <div className="mt-10">
      <SectionHeading
        eyebrow="Free Artisan AR Options"
        title="Choose from Artisan AR treatments."
        body="Choose from Artisan AR treatments on eligible non-Neurolens orders during the promotional period."
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {program.arLogos.map((logo) => (
          <Link
          key={logo.name}
          href={`/artisan-ar/${logo.name.toLowerCase()}`}
          className="group flex min-h-[260px] flex-col rounded-[24px] border border-[#e4d8c9] bg-white p-5 shadow-[0_18px_50px_rgba(49,39,26,0.08)] transition hover:-translate-y-1 hover:border-[#d4c09a]"
        >
            <div className="flex h-28 items-center justify-center rounded-2xl bg-[#fbf8f3] px-4">
              <Image
                src={logo.src}
                alt={logo.name}
                width={260}
                height={120}
                className="max-h-[90px] w-auto max-w-full object-contain"
              />
            </div>
            <div className="mt-4 inline-flex w-fit rounded-full bg-[#d4c09a] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#171311]">
              FREE during promotion
            </div>
            <h3 className="mt-4 text-2xl font-semibold text-[#201a16]">{logo.name}</h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-[#62584d]">
              Artisan AR treatment option for eligible non-Neurolens orders.
            </p>
            <span className="mt-5 inline-flex w-fit rounded-full border border-[#e1d4c2] bg-[#fbf8f3] px-4 py-2.5 text-sm font-semibold text-[#201a16] transition group-hover:border-[#d4c09a] group-hover:bg-[#d4c09a]">
              Learn More
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function ProgramLandingPage({ program }: { program: ProgramPageData }) {
  const href = programHref(program.programCode);
  const faqs = [
    {
      question: "Who is eligible?",
      answer:
        "Programs are available by invitation only. Artisan will review eligibility requirements after you submit the form.",
    },
    {
      question: "Can this be combined with other programs?",
      answer:
        "Only one Artisan promotional program may be used at a time unless approved in writing.",
    },
    {
      question: "How long does the program last?",
      answer: program.faqDuration,
    },
    {
      question: "How do I enroll?",
      answer:
        "Use the enrollment form on this page. The program code is included automatically in the Typeform link.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#171311] text-white">
      <Header onContactClick={() => openExternal(href)} signUpHref={href} />

      <BackgroundSection
        image={program.heroImage ?? "/graphics/rings2.jpg"}
        className="px-6 pb-16 pt-32 md:px-10 md:pb-24 md:pt-40"
      >
        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <ProgramLogo program={program} />
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#d4c09a]">
              {program.eyebrow}
            </p>
            <h1 className="mt-5 max-w-5xl text-5xl font-semibold tracking-tight md:text-7xl">
              {program.headline}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/78 md:text-xl">
              {program.subheadline}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CtaLink href={href}>{program.primaryCta}</CtaLink>
              {program.secondaryCta ? (
                <CtaLink href={href} variant="secondary">
                  {program.secondaryCta}
                </CtaLink>
              ) : (
                <Link
                  href="#details"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/18 bg-white/8 px-7 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[#d4c09a]/65 hover:bg-white/14"
                >
                  View Program Details
                </Link>
              )}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/12 bg-white/[0.075] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.32)] backdrop-blur-md md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d4c09a]">
              Offer
            </p>
            <div className="mt-5 text-5xl font-semibold tracking-tight text-white md:text-6xl">
              {program.offerValue}
            </div>
            <p className="mt-5 text-base leading-7 text-white/74">
              {program.offerBody}
            </p>
            <ul className="mt-6 space-y-3 text-sm leading-6 text-white/80">
              {program.keyPoints.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d4c09a]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </BackgroundSection>

      <BackgroundSection
        theme="light"
        className="px-6 py-20 text-[#201a16] md:px-10 md:py-24"
      >
        <div className="relative z-10 mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Offer"
            title={program.offerTitle}
            body={program.offerBody}
          />
          <TierCards program={program} />
          <ArLogoCards program={program} />
          {!program.tiers && !program.arLogos ? (
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {program.offerBullets.map((item) => (
                <div
                  key={item}
                  className="rounded-[24px] border border-[#e4d8c9] bg-white p-5 shadow-[0_18px_50px_rgba(49,39,26,0.08)]"
                >
                  <div className="h-1.5 w-10 rounded-full bg-[#c9b28b]" />
                  <p className="mt-4 text-sm font-semibold leading-7 text-[#2b241f]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </BackgroundSection>

      <section
        data-theme="light"
        className="bg-[#f5f1eb] px-6 py-20 text-[#201a16] md:px-10 md:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Why Artisan"
            title="A premium lab relationship with practical support."
            body={program.opportunityBody}
          />
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {whyCards.map((card) => (
              <article
                key={card.title}
                className="rounded-[24px] border border-[#e4d8c9] bg-white p-6 shadow-[0_18px_50px_rgba(49,39,26,0.08)]"
              >
                <h3 className="text-lg font-semibold">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#62584d]">{card.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <BackgroundSection className="px-6 py-20 md:px-10 md:py-24">
        <div className="relative z-10 mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="How It Works"
            title="A simple path from interest to impact."
            body="The process is designed to be clean, direct, and easy for a busy practice team to act on."
            tone="dark"
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-[24px] border border-white/12 bg-white/[0.06] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.2)] backdrop-blur-md"
              >
                <div className="grid h-11 w-11 place-items-center rounded-full bg-[#d4c09a] text-sm font-bold text-[#171311]">
                  {index + 1}
                </div>
                <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/72">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </BackgroundSection>

      {program.extraSection ? (
        <section
          data-theme="light"
          className="bg-[#fbf8f3] px-6 py-16 text-[#201a16] md:px-10 md:py-20"
        >
          <div className="mx-auto max-w-5xl rounded-[28px] border border-[#e1d4c2] bg-white p-7 shadow-[0_24px_65px_rgba(49,39,26,0.1)] md:p-10">
            <SectionHeading
              eyebrow={program.extraSection.eyebrow}
              title={program.extraSection.title}
              body={program.extraSection.body}
            />
          </div>
        </section>
      ) : null}

      <section
        id="details"
        data-theme="light"
        className="bg-[#f5f1eb] px-6 py-20 text-[#201a16] md:px-10 md:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-[#e1d4c2] bg-white p-7 shadow-[0_24px_65px_rgba(49,39,26,0.09)] md:p-9">
            <SectionHeading eyebrow="Program Details" title={program.detailsTitle} />
            <ul className="mt-7 space-y-3 text-sm leading-7 text-[#62584d]">
              {program.details.map((detail) => (
                <li key={detail} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c9b28b]" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[28px] border border-[#e1d4c2] bg-[#fffaf3] p-7 shadow-[0_24px_65px_rgba(49,39,26,0.07)] md:p-9">
            <SectionHeading eyebrow="Restrictions" title="Clear terms, no clutter." />
            <ul className="mt-7 space-y-3 text-sm leading-7 text-[#62584d]">
              {program.restrictions.map((restriction) => (
                <li key={restriction} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c9b28b]" />
                  <span>{restriction}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-[18px] border border-[#d8c9b6] bg-white p-4 text-sm leading-7 text-[#5f554b]">
              {COMPLIANCE_NOTE}
            </p>
          </div>
        </div>
      </section>

      <BackgroundSection className="px-6 py-20 md:px-10 md:py-24">
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <SectionHeading
              eyebrow="FAQ"
              title="Simple answers before you enroll."
              body="The Artisan team will confirm details after reviewing your account."
              tone="dark"
            />
            <div className="grid gap-4">
              {faqs.map((faq) => (
                <article
                  key={faq.question}
                  className="rounded-[22px] border border-white/12 bg-white/[0.06] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-md"
                >
                  <h3 className="text-base font-semibold text-white">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/70">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </BackgroundSection>

      <section
        data-theme="light"
        className="bg-[#fbf8f3] px-6 py-16 text-center text-[#201a16] md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-4xl rounded-[32px] border border-[#e1d4c2] bg-white p-8 shadow-[0_28px_70px_rgba(49,39,26,0.1)] md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">
            Ready
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Start with Artisan today.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#62584d] md:text-lg">
            Use the enrollment form and our team will follow up with the next
            clear step for your practice.
          </p>
          <div className="mt-8">
            <CtaLink href={href} variant="dark">
              {program.primaryCta}
            </CtaLink>
          </div>
        </div>
      </section>

      <Footer onContactClick={() => openExternal(href)} signUpHref={href} />
    </main>
  );
}
