"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";

const SIGNUP_URL = "https://form.typeform.com/to/quuPCSff";
const CONTACT_FORM_URL = "https://form.typeform.com/to/m0lQ9zjD";

type ResourceType = "Form" | "Download" | "Tool" | "Video" | "External";

type ResourceItem = {
  title: string;
  type: ResourceType;
  description: string;
  cta: string;
  href: string;
};

type FeaturedCard = {
  title: string;
  body: string;
  cta: string;
  href: string;
  type: ResourceType;
};

type BrandPanel = {
  label: string;
  intro: string;
  websiteHref: string;
  featuredCta?: ResourceItem;
  resources: ResourceItem[];
};

const featuredCards: FeaturedCard[] = [
  {
    title: "Pricing & Policies",
    body: "Get current price guides, policy details, and program support without waiting.",
    cta: "Request Pricing",
    href: "mailto:sales@artisanlabnetwork.com?subject=Pricing%20Guide%20Request",
    type: "Form",
  },
  {
    title: "Training & Account Review",
    body: "Book onboarding, team training, or a focused account review.",
    cta: "Schedule Training",
    href: "mailto:sales@artisanlabnetwork.com?subject=Training%20Request",
    type: "Form",
  },
  {
    title: "Shipping & Logistics",
    body: "Order shipping labels, track flow, and manage returns.",
    cta: "Request Labels",
    href: "mailto:customerservice@artisanlabnetwork.com?subject=Shipping%20Label%20Request",
    type: "Form",
  },
  {
    title: "Billing & Payments",
    body: "Use lab payment tools and keep account tasks moving cleanly.",
    cta: "Go to Lab Pay",
    href: "https://speccheckrx.com",
    type: "Tool",
  },
];

const mostUsedResources: ResourceItem[] = [
  {
    title: "Request Pricing Guide",
    type: "Form",
    description: "Get the current pricing guide and program details for your account.",
    cta: "Request Guide",
    href: "mailto:sales@artisanlabnetwork.com?subject=Pricing%20Guide%20Request",
  },
  {
    title: "Schedule Training",
    type: "Form",
    description: "Set up team training, onboarding, or a focused account review.",
    cta: "Schedule",
    href: "mailto:sales@artisanlabnetwork.com?subject=Training%20Request",
  },
  {
    title: "SpecCheck Lab Pay",
    type: "Tool",
    description: "Access SpecCheck tools for account payment and lab workflow support.",
    cta: "Open Tool",
    href: "https://speccheckrx.com",
  },
  {
    title: "IOT Comparison Sheet",
    type: "Download",
    description: "Compare Artisan Series options for daily dispensing conversations.",
    cta: "View Resource",
    href: "#product-information",
  },
  {
    title: "Shipping Label Request",
    type: "Form",
    description: "Request the labels and logistics support your practice needs.",
    cta: "Request Labels",
    href: "mailto:customerservice@artisanlabnetwork.com?subject=Shipping%20Label%20Request",
  },
];

const accountTools: ResourceItem[] = [
  {
    title: "Request Pricing Guide",
    type: "Form",
    description: "Ask for current pricing, program details, and policy guidance.",
    cta: "Request Pricing",
    href: "mailto:sales@artisanlabnetwork.com?subject=Pricing%20Guide%20Request",
  },
  {
    title: "Training Scheduler",
    type: "Form",
    description: "Book onboarding, product training, or an account performance review.",
    cta: "Schedule Training",
    href: "mailto:sales@artisanlabnetwork.com?subject=Training%20Request",
  },
  {
    title: "Shipping Label Request",
    type: "Form",
    description: "Request shipping labels and return support from the lab team.",
    cta: "Request Labels",
    href: "mailto:customerservice@artisanlabnetwork.com?subject=Shipping%20Label%20Request",
  },
  {
    title: "Merch Shop",
    type: "External",
    description: "Access branded practice and team materials when available.",
    cta: "Open Shop",
    href: "#",
  },
  {
    title: "Chemistrie Order Form",
    type: "Form",
    description: "Submit Chemistrie orders with the details needed for clean processing.",
    cta: "Open Form",
    href: "#",
  },
  {
    title: "Chemistrie Demo Kit Request",
    type: "Form",
    description: "Request a kit to support in-office demonstrations and patient education.",
    cta: "Request Kit",
    href: "#",
  },
  {
    title: "SpecCheck Lab Pay",
    type: "Tool",
    description: "Use SpecCheck for payment tools and account workflow support.",
    cta: "Go to Lab Pay",
    href: "https://speccheckrx.com",
  },
];

const practicePrograms = [
  {
    title: "Artisan Designs & Treatments",
    body: "Premium Artisan lens designs and AR treatment resources in one practical place for your team.",
  },
  {
    title: "Frame Systems",
    body: "Resources for practices that want cleaner frame workflows and better patient handoffs.",
  },
  {
    title: "Safety Systems",
    body: "Program support for practices managing safety eyewear and employer-driven needs.",
  },
  {
    title: "Modern Frame",
    body: "Tools for practices building a more intentional frame and lens buying experience.",
  },
  {
    title: "ROI Frames",
    body: "Support for practices focused on better profitability and smarter retail execution.",
  },
];

const lensBrands: BrandPanel[] = [
  {
    label: "Artisan Designs & Treatments",
    intro:
      "Artisan Designs and Treatments are built to support independent practices with premium performance, flexible product choice, and practical tools for real world dispensing.",
    websiteHref: "#",
    featuredCta: {
      title: "Artisan Portfolio Overview",
      type: "Download",
      description: "A quick way to review Artisan design and treatment options with your team.",
      cta: "View Overview",
      href: "#",
    },
    resources: [
      "Design Mini Catalog",
      "Endless Steady",
      "Essential Steady",
      "Endless Office",
      "Endless Plus",
      "Occupational Chart",
      "Design Brand Comparison Sheet",
      "Treatment Guide",
      "Treatment Comparison Sheet",
      "Treatment Care Guide",
      "Treatment Training Video",
    ].map((title) => ({
      title,
      type: title.includes("Video") ? ("Video" as const) : ("Download" as const),
      description: "Curated resource for presenting and dispensing Artisan design and treatment options.",
      cta: "View Resource",
      href: "#",
    })),
  },
  {
    label: "IOT",
    intro:
      "IOT is a global optical technology company known for advanced digital lens design and flexible modern lens platforms.",
    websiteHref: "#",
    featuredCta: {
      title: "Camber Guide",
      type: "Download",
      description: "Reference material for IOT-powered designs and fitting conversations.",
      cta: "View Guide",
      href: "#",
    },
    resources: [
      "Centration Charts",
      "Camber Guide",
      "Camber Availability",
      "Training Video",
    ].map((title) => ({
      title,
      type: title.includes("Video") ? ("Video" as const) : ("Download" as const),
      description: "Curated resource for understanding and supporting IOT-specific platform options.",
      cta: "View Resource",
      href: "#",
    })),
  },
  {
    label: "Tokai",
    intro: "Premium Japanese optics focused on clarity and advanced materials.",
    websiteHref: "#",
    resources: ["Select", "Bi-AS", "Rest", "Largo", "Training", "Practice Locator", "Tints Guide"].map(
      (title) => ({
        title,
        type: title === "Practice Locator" ? ("Tool" as const) : title === "Training" ? ("Video" as const) : ("Download" as const),
        description: "Tokai resource for product selection, positioning, and patient conversations.",
        cta: "View Resource",
        href: "#",
      })
    ),
  },
  {
    label: "Hoya",
    intro: "Widely recognized lens portfolio with strong brand awareness.",
    websiteHref: "#",
    resources: ["Product Guide", "Centration Chart"].map((title) => ({
      title,
      type: "Download",
      description: "Quick reference material for fitting and explaining Hoya options.",
      cta: "View Resource",
      href: "#",
    })),
  },
  {
    label: "Varilux / Essilor",
    intro: "Recognized premium progressive designs with consumer awareness.",
    websiteHref: "#",
    resources: ["Product Range Guide", "Transitions"].map((title) => ({
      title,
      type: "Download",
      description: "Support material for premium lens conversations and product selection.",
      cta: "View Resource",
      href: "#",
    })),
  },
  {
    label: "Shamir",
    intro: "Design-driven progressive lenses with strong customization.",
    websiteHref: "#",
    resources: ["Quick Reference Guide", "Dispensing Guide"].map((title) => ({
      title,
      type: "Download",
      description: "Reference tools for fitting, dispensing, and communicating Shamir designs.",
      cta: "View Resource",
      href: "#",
    })),
  },
  {
    label: "Unity",
    intro: "VSP-aligned designs built for coverage and consistency.",
    websiteHref: "#",
    resources: ["V3 Sales Flyer", "Whitepaper"].map((title) => ({
      title,
      type: "Download",
      description: "Useful Unity materials for plan-aligned dispensing conversations.",
      cta: "View Resource",
      href: "#",
    })),
  },
  {
    label: "Newton",
    intro:
      "Newton offers specialty lens solutions designed to support modern visual needs and differentiated practice offerings.",
    websiteHref: "#",
    resources: ["Product Overview", "Quick Reference Guide", "Specialty Positioning Sheet"].map((title) => ({
      title,
      type: "Download",
      description: "Placeholder Newton resource card ready for mapped files and training assets.",
      cta: "View Resource",
      href: "#",
    })),
  },
];

const trainingVideos: ResourceItem[] = [
  {
    title: "Training Video 1",
    type: "Video",
    description: "A concise training session for optical teams and day to day product conversations.",
    cta: "Watch Video",
    href: "https://youtu.be/eFw7BzI1SZY",
  },
  {
    title: "Training Video 2",
    type: "Video",
    description: "Short product training video for optical teams and day to day practice use.",
    cta: "Watch Video",
    href: "https://youtu.be/cLhLfThS7Gs",
  },
  {
    title: "Training Video 3",
    type: "Video",
    description: "Short product training video for optical teams and day to day practice use.",
    cta: "Watch Video",
    href: "https://youtu.be/9P7VEmI0ZwY",
  },
  {
    title: "Training Video 4",
    type: "Video",
    description: "Short product training video for optical teams and day to day practice use.",
    cta: "Watch Video",
    href: "https://youtu.be/phvH3ahy2e4",
  },
  {
    title: "Training Video 5",
    type: "Video",
    description: "Short product training video for optical teams and day to day practice use.",
    cta: "Watch Video",
    href: "https://youtu.be/Rown4Yp9U4c",
  },
];

const trainingCards: ResourceItem[] = [
  {
    title: "Product Training Videos",
    type: "Video",
    description: "Short training resources to help your team speak clearly about products.",
    cta: "View Videos",
    href: "#",
  },
  {
    title: "Dispensing Guides",
    type: "Download",
    description: "Practical fitting and dispensing references for the optical team.",
    cta: "View Guides",
    href: "#",
  },
  {
    title: "Webinars",
    type: "Video",
    description: "Education sessions for product knowledge, workflow, and practice growth.",
    cta: "Browse Webinars",
    href: "#",
  },
  {
    title: "In-Office Training Request",
    type: "Form",
    description: "Ask for hands-on training support built around your team and goals.",
    cta: "Request Training",
    href: "mailto:sales@artisanlabnetwork.com?subject=In-Office%20Training%20Request",
  },
];

function openExternal(href: string) {
  return href.startsWith("http") || href.startsWith("mailto:");
}

function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
}) {
  const centered = align === "center";
  const eyebrowClass = tone === "dark" ? "text-[#c9b28b]" : "text-[#8a7654]";
  const titleClass = tone === "dark" ? "text-white" : "text-[#1f1a17]";
  const bodyClass = tone === "dark" ? "text-white/68" : "text-[#625b53]";

  return (
    <div className={`${centered ? "mx-auto text-center" : ""} max-w-4xl`}>
      <p className={`text-sm font-semibold uppercase tracking-[0.28em] ${eyebrowClass}`}>
        {eyebrow}
      </p>
      <h2 className={`mt-4 text-4xl font-semibold tracking-tight md:text-5xl ${titleClass}`}>
        {title}
      </h2>
      <p className={`mt-5 text-lg leading-8 md:text-[1.15rem] ${bodyClass}`}>
        {description}
      </p>
    </div>
  );
}

function ResourceLabel({ type }: { type: ResourceType }) {
  return (
    <span className="inline-flex rounded-full border border-[#dbcdb9] bg-[#f8f2e9] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a7654] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
      {type}
    </span>
  );
}

function ResourceLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className: string;
}) {
  if (openExternal(href)) {
    return (
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function ResourceCard({
  item,
  compact = false,
  premium = false,
}: {
  item: ResourceItem;
  compact?: boolean;
  premium?: boolean;
}) {
  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_16px_40px_rgba(24,18,13,0.06)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_56px_rgba(24,18,13,0.12)] ${
        premium ? "bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(250,246,240,1))]" : ""
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(201,178,139,0.7),transparent)]" />
      <div className="flex items-start justify-between gap-4">
        <ResourceLabel type={item.type} />
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#eadfce] bg-[#fbf8f3] text-base text-[#b39766] transition group-hover:translate-x-0.5 group-hover:border-[#d8c095] group-hover:bg-[#f3eadb]">
          →
        </span>
      </div>
      <h3
        className={`${compact ? "mt-5 text-xl" : "mt-6 text-[1.7rem]"} font-semibold leading-tight text-[#1f1a17]`}
      >
        {item.title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-7 text-[#625b53]">{item.description}</p>
      <ResourceLink
        href={item.href}
        className="mt-7 inline-flex w-fit items-center gap-2 rounded-full border border-[#e1d4c2] bg-[#fbf8f3] px-4 py-2.5 text-sm font-semibold text-[#1f1a17] transition hover:border-[#c9b28b] hover:bg-[#f0e5d5]"
      >
        {item.cta}
        <span className="text-[#8a7654]">→</span>
      </ResourceLink>
    </article>
  );
}

function VideoCard({ item }: { item: ResourceItem }) {
  return (
    <ResourceLink
      href={item.href}
      className="group block h-full overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_18px_48px_rgba(24,18,13,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_64px_rgba(24,18,13,0.14)]"
    >
      <div className="relative overflow-hidden border-b border-black/8 bg-[radial-gradient(circle_at_top_left,rgba(201,178,139,0.5),transparent_36%),linear-gradient(135deg,#211b17,#3b3028_55%,#6b5746)] px-6 py-10 text-white">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:30px_30px]" />
        <div className="relative flex items-center justify-between gap-4">
          <ResourceLabel type="Video" />
          <div className="grid h-14 w-14 place-items-center rounded-full border border-white/20 bg-white/10 backdrop-blur">
            <span className="ml-1 text-xl">▶</span>
          </div>
        </div>
        <div className="relative mt-12 max-w-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
            Training Video
          </p>
          <h3 className="mt-3 text-2xl font-semibold leading-tight">{item.title}</h3>
        </div>
      </div>
      <div className="p-6">
        <p className="text-sm leading-7 text-[#625b53]">{item.description}</p>
        <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#1f1a17]">
          Watch Video
          <span className="text-[#8a7654] transition group-hover:translate-x-0.5">→</span>
        </div>
      </div>
    </ResourceLink>
  );
}

function BrandWebsiteLink({ href }: { href: string }) {
  return (
    <ResourceLink
      href={href}
      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#75664e] underline decoration-[#c9b28b] underline-offset-4 transition hover:text-[#1f1a17]"
    >
      Visit Company Website <span className="text-[#8a7654]">→</span>
    </ResourceLink>
  );
}

function ContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative flex h-[86vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-white/15 bg-[#f5f1eb] shadow-2xl"
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.22 }}
          >
            <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#8a7654]">Contact</p>
                <h2 className="text-lg font-semibold text-[#1f1a17]">Contact Us</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white text-2xl leading-none text-[#1f1a17] transition hover:bg-[#1f1a17] hover:text-white"
                aria-label="Close contact form"
              >
                x
              </button>
            </div>
            <iframe
              src={CONTACT_FORM_URL}
              title="Contact Artisan Lab Network"
              className="min-h-0 flex-1 bg-[#f5f1eb]"
              allow="camera; microphone; autoplay; encrypted-media;"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function ProviderResourcesPage() {
  const [activeBrand, setActiveBrand] = useState(lensBrands[0].label);
  const [openMobileBrand, setOpenMobileBrand] = useState(lensBrands[0].label);
  const [contactOpen, setContactOpen] = useState(false);

  const selectedBrand =
    lensBrands.find((brand) => brand.label === activeBrand) ?? lensBrands[0];

  return (
    <main className="min-h-screen bg-[#f5f1eb] text-[#1f1a17]">
      <Header onContactClick={() => setContactOpen(true)} />

      <section
        data-theme="light"
        className="relative overflow-hidden border-b border-[#e6d9c8] px-6 pb-20 pt-32 md:px-10 md:pb-28 md:pt-40"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(201,178,139,0.22),transparent_30%),radial-gradient(circle_at_86%_18%,rgba(255,255,255,0.82),transparent_28%),linear-gradient(180deg,#f7f2ea_0%,#f5f1eb_60%,#f2ece3_100%)]" />
        <div className="pointer-events-none absolute -right-32 top-24 h-96 w-96 rounded-full border border-[#e6d9c8]/80" />
        <div className="pointer-events-none absolute -left-24 bottom-4 h-80 w-80 rounded-full border border-[#e6d9c8]/80" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="max-w-5xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#8a7654]">
              Provider Resources
            </p>
            <h1 className="mt-5 max-w-5xl text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
              Practice Resources That Actually Help You Move Faster
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#625b53] md:text-2xl md:leading-10">
              Pricing, ordering, shipping, training, and product information built
              to help independent practices move faster and stay in control.
            </p>

            <div className="mt-10 max-w-6xl rounded-[30px] border border-black/10 bg-white/65 p-3 shadow-[0_20px_50px_rgba(24,18,13,0.07)] backdrop-blur">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <a
                  href="mailto:sales@artisanlabnetwork.com?subject=Pricing%20Guide%20Request"
                  className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-[#d7c8b1] bg-[#efe3cf] px-6 py-3 text-center text-sm font-semibold text-[#1f1a17] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#ead9bd]"
                >
                  Request Pricing Guide
                </a>
                <a
                  href="mailto:customerservice@artisanlabnetwork.com?subject=Shipping%20Label%20Request"
                  className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-[#e4d7c6] bg-[#fbf8f3] px-6 py-3 text-center text-sm font-semibold text-[#1f1a17] shadow-sm transition hover:-translate-y-0.5 hover:border-[#d8c095] hover:bg-white"
                >
                  Request Shipping Labels
                </a>
                <a
                  href="#practice-tools"
                  className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-[#e4d7c6] bg-[#fbf8f3] px-6 py-3 text-center text-sm font-semibold text-[#1f1a17] shadow-sm transition hover:-translate-y-0.5 hover:border-[#d8c095] hover:bg-white"
                >
                  Practice Tools
                </a>
                <a
                  href="#product-information"
                  className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-[#e4d7c6] bg-[#fbf8f3] px-6 py-3 text-center text-sm font-semibold text-[#1f1a17] shadow-sm transition hover:-translate-y-0.5 hover:border-[#d8c095] hover:bg-white"
                >
                  Product Information
                </a>
                <a
                  href="#training-education"
                  className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-[#e4d7c6] bg-[#fbf8f3] px-6 py-3 text-center text-sm font-semibold text-[#1f1a17] shadow-sm transition hover:-translate-y-0.5 hover:border-[#d8c095] hover:bg-white"
                >
                  Training &amp; Education
                </a>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="mt-6 text-sm font-semibold text-[#75664e] underline decoration-[#c9b28b] underline-offset-4 transition hover:text-[#1f1a17]"
            >
              Need help finding something? Contact support
            </button>
          </div>
        </div>
      </section>

      <section id="practice-tools" className="bg-[#f6f1e9] px-6 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              eyebrow="Practice Tools"
              title="Your resource command center."
              description="Start with the workflow you are trying to solve, then move directly into the right form, tool, or training asset."
            />
            <p className="max-w-xl text-base leading-7 text-[#625b53]">
              Designed for busy practices that need quick paths, not clutter.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featuredCards.map((card) => (
              <ResourceCard
                key={card.title}
                premium
                item={{
                  title: card.title,
                  type: card.type,
                  description: card.body,
                  cta: card.cta,
                  href: card.href,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#e7ddd0] bg-[#fbf8f3] px-6 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <SectionHeader
              eyebrow="Most Used"
              title="The fastest paths to what practices usually need."
              description="Start here when the goal is speed. These are the requests and tools teams reach for most often."
            />

            <div className="grid gap-3">
              {mostUsedResources.map((item, index) => (
                <ResourceLink
                  key={item.title}
                  href={item.href}
                  className="group grid gap-4 rounded-[28px] border border-black/10 bg-[linear-gradient(180deg,#fff,#f8f4ee)] p-6 shadow-[0_16px_40px_rgba(24,18,13,0.07)] transition hover:-translate-y-1 hover:shadow-[0_24px_56px_rgba(24,18,13,0.12)] md:grid-cols-[64px_1fr_auto] md:items-center"
                >
                  <div className="grid h-14 w-14 place-items-center rounded-full border border-[#e6d9c8] bg-[#f0e5d5] text-sm font-semibold text-[#8a7654] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <ResourceLabel type={item.type} />
                    <h3 className="mt-3 text-[1.35rem] font-semibold leading-tight">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#625b53]">{item.description}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#8a7654] transition group-hover:translate-x-1">
                    {item.cta}
                    <span>→</span>
                  </span>
                </ResourceLink>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f5f1eb] px-6 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Account Tools"
            title="Forms and tools for everyday account work."
            description="Keep common account tasks in one place so your team can move without digging."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {accountTools.map((item) => (
              <ResourceCard key={item.title} item={item} compact />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#1f1a17] px-6 py-20 text-white md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              eyebrow="Practice Programs"
              title="Programs built to help your practice perform better."
              description="Build stronger retail conversations, cleaner workflows, and better team confidence."
              tone="dark"
            />
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {practicePrograms.map((program) => (
              <article
                key={program.title}
                className="group rounded-[28px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.12)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-[#c9b28b]/50 hover:bg-white/[0.1] hover:shadow-[0_22px_48px_rgba(0,0,0,0.18)]"
              >
                <h3 className="text-xl font-semibold leading-tight">{program.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/68">{program.body}</p>
                <a href="#" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#c9b28b] transition group-hover:translate-x-1">
                  Learn More <span>→</span>
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#e7ddd0] bg-[#fbf8f3] px-6 py-20 md:px-10 md:py-24" id="product-information">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Lens Brand Library"
            title="Find the brand first. Then find the exact resource."
            description="Curated by brand so your team does not have to sort through a giant pile of files."
          />

          <div className="mt-12 hidden gap-3 overflow-x-auto rounded-[999px] border border-black/10 bg-white p-2 shadow-[0_16px_40px_rgba(24,18,13,0.06)] md:flex">
            {lensBrands.map((brand) => (
              <button
                key={brand.label}
                type="button"
                onClick={() => setActiveBrand(brand.label)}
                className={`shrink-0 rounded-full px-5 py-3 text-sm font-semibold transition ${
                  selectedBrand.label === brand.label
                    ? "bg-[#1f1a17] text-white shadow-[0_12px_24px_rgba(24,18,13,0.22)]"
                    : "text-[#625b53] hover:bg-[#f3eadb] hover:text-[#1f1a17]"
                }`}
              >
                {brand.label}
              </button>
            ))}
          </div>

          <div className="mt-8 hidden rounded-[34px] border border-black/10 bg-white p-6 shadow-[0_24px_64px_rgba(24,18,13,0.08)] md:block md:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#8a7654]">
                  Selected Brand
                </p>
                <h3 className="mt-4 text-4xl font-semibold tracking-tight">{selectedBrand.label}</h3>
                <p className="mt-5 text-lg leading-8 text-[#625b53]">{selectedBrand.intro}</p>
                <BrandWebsiteLink href={selectedBrand.websiteHref} />
                {selectedBrand.featuredCta && (
                  <div className="mt-8">
                    <ResourceCard item={selectedBrand.featuredCta} compact premium />
                  </div>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {selectedBrand.resources.map((item) => (
                  <ResourceCard key={`${selectedBrand.label}-${item.title}`} item={item} compact />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4 md:hidden">
            {lensBrands.map((brand) => {
              const isOpen = openMobileBrand === brand.label;
              return (
                <div
                  key={brand.label}
                  className="overflow-hidden rounded-[26px] border border-black/10 bg-white shadow-[0_14px_36px_rgba(24,18,13,0.06)]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenMobileBrand(isOpen ? "" : brand.label)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-lg font-semibold">{brand.label}</span>
                    <span className="text-2xl leading-none text-[#8a7654]">{isOpen ? "−" : "+"}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-black/10 px-5 pb-5 pt-4">
                          <p className="text-sm leading-7 text-[#625b53]">{brand.intro}</p>
                          <BrandWebsiteLink href={brand.websiteHref} />
                          <div className="mt-5 grid gap-4">
                            {brand.resources.map((item) => (
                              <ResourceCard key={`${brand.label}-mobile-${item.title}`} item={item} compact />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="training-education" className="bg-[#f5f1eb] px-6 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Training & Education"
            title="Help your team sell, fit, and communicate better."
            description="Training should feel like a usable media library, not a pile of links."
          />
          <div className="mt-10">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl font-semibold tracking-tight text-[#1f1a17]">
                Featured Training Videos
              </h3>
              <a
                href="mailto:sales@artisanlabnetwork.com?subject=Training%20Video%20Questions"
                className="hidden text-sm font-semibold text-[#8a7654] underline decoration-[#c9b28b] underline-offset-4 transition hover:text-[#1f1a17] md:inline-flex"
              >
                Request guided training
              </a>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {trainingVideos.map((item) => (
                <VideoCard key={item.href} item={item} />
              ))}
            </div>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {trainingCards.map((item) => (
              <ResourceCard key={item.title} item={item} compact />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#e7ddd0] bg-[linear-gradient(180deg,#fbf8f3_0%,#f5f1eb_100%)] px-6 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-5xl rounded-[36px] border border-[#e1d4c2] bg-white p-8 text-center shadow-[0_24px_60px_rgba(24,18,13,0.08)] md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#8a7654]">
            Support
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Need a fast answer from the right team?
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[#625b53]">
            Tell us what you are trying to solve and we will point you to the
            clearest next step quickly.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="rounded-full bg-[#1f1a17] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c9b28b] hover:text-[#1f1a17]"
            >
              Contact Support
            </button>
            <a
              href="mailto:sales@artisanlabnetwork.com?subject=Training%20Request"
              className="rounded-full border border-black/10 bg-[#fbf8f3] px-7 py-3 text-sm font-semibold text-[#1f1a17] shadow-sm transition hover:-translate-y-0.5 hover:border-[#c9b28b] hover:bg-[#c9b28b]"
            >
              Schedule Training
            </a>
            <a
              href="mailto:customerservice@artisanlabnetwork.com?subject=Account%20Help%20Request"
              className="rounded-full border border-black/10 bg-[#fbf8f3] px-7 py-3 text-sm font-semibold text-[#1f1a17] shadow-sm transition hover:-translate-y-0.5 hover:border-[#c9b28b] hover:bg-[#c9b28b]"
            >
              Request Account Help
            </a>
          </div>
        </div>
      </section>

      <Footer onContactClick={() => setContactOpen(true)} signUpHref={SIGNUP_URL} />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </main>
  );
}
