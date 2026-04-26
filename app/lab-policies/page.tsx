"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";

const SIGNUP_URL = "https://form.typeform.com/to/quuPCSff";
const CONTACT_FORM_URL = "https://form.typeform.com/to/m0lQ9zjD";
const CUSTOMER_SERVICE_MAILTO =
  "mailto:customerservice@artisanlabnetwork.com?subject=Lab%20Policy%20Question";

const fadeUp = {
  initial: { opacity: 0, y: 34 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.5, ease: "easeOut" },
} as const;

type PolicyItem = {
  title?: string;
  body: string;
};

type PolicySection = {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  tags: string[];
  items: PolicyItem[];
};

const quickCards = [
  {
    label: "Warranty",
    title: "How long is coverage?",
    body: "Most Artisan standard and regular bar products are covered for 2 years, 2 times.",
    href: "#warranty-coverage",
  },
  {
    label: "Redo",
    title: "What about doctor redos?",
    body: "Eligible patient non-adaptable changes within the first year are accommodated 1 time at no charge.",
    href: "#doctor-redos",
  },
  {
    label: "Frames",
    title: "Are patient-owned frames covered?",
    body: "Patient-owned frames are processed at the practice's risk and are not warranted by the lab.",
    href: "#frame-policies",
  },
  {
    label: "Shipping",
    title: "How does shipping work?",
    body: "Inbound shipping is complimentary. Outbound fees are generally applied per job or per box.",
    href: "#shipping-policies",
  },
];

const policySections: PolicySection[] = [
  {
    id: "warranty-coverage",
    eyebrow: "Coverage",
    title: "Warranty Coverage",
    summary: "Core warranty timing and usage rules by product type.",
    tags: ["warranty", "diamond", "mirror", "AR", "coverage"],
    items: [
      {
        title: "Artisan standard and regular bar products",
        body: "2 years, 2 times warranty.",
      },
      {
        title: "Artisan Diamond and similar products",
        body: "1 year, 1 time warranty.",
      },
      {
        title: "Diamond Defense",
        body: "2 years, 2 times warranty.",
      },
      {
        title: "Mirror coating alone",
        body: "1 year, 1 time warranty.",
      },
      {
        title: "Mirror plus Artisan Diamond backside AR",
        body: "2 years, 2 times warranty.",
      },
    ],
  },
  {
    id: "ar-policies",
    eyebrow: "Treatments",
    title: "AR Policies",
    summary: "AR warranty usage and treatment brands included in this policy area.",
    tags: ["AR", "anti reflective", "Artisan", "TechShield", "Tokai", "Crizal", "Shamir", "Hoya"],
    items: [
      {
        body: "We do not require lenses to be returned for AR treatment warranty usage.",
      },
      {
        title: "Included AR treatment brands",
        body: "Artisan AR Technologies, excluding Standard AR; Artisan Standard and Backside AR; TechShield AR Technologies; Tokai AR Technologies; Crizal AR Technologies; Shamir AR Technologies; and Hoya AR Technologies.",
      },
    ],
  },
  {
    id: "scratch-coating",
    eyebrow: "Scratch",
    title: "Scratch Coating Policies",
    summary: "Scratch coating return requirements and coverage timing.",
    tags: ["scratch", "coating", "factory", "Diamond Defense"],
    items: [
      {
        body: "We do not require lenses to be returned for scratch coating warranty usage.",
      },
      {
        title: "Factory Scratch Coat",
        body: "1 year, 1 time.",
      },
      {
        title: "Diamond Defense Scratch Coat",
        body: "2 years, 2 times.",
      },
    ],
  },
  {
    id: "vsp-unity",
    eyebrow: "Programs",
    title: "VSP and Unity Products",
    summary: "Authorization and redo rules for VSP and Unity products.",
    tags: ["VSP", "Unity", "authorization", "redo"],
    items: [
      {
        body: "VSP non-adapt Unity products require a new VSP authorization for reimbursement.",
      },
      {
        body: "Unity VSP doctor redos are covered for 6 months.",
      },
    ],
  },
  {
    id: "doctor-redos",
    eyebrow: "Redos",
    title: "Doctor Redos and Rx Changes",
    summary: "Rules for design, power, PD, prism, frame, segment height, and other patient changes.",
    tags: ["redo", "Rx", "doctor redo", "PD", "prism", "segment height", "patient changes", "high patient changes"],
    items: [
      {
        body: "Requests for changes to design, power, PD, prism, frame, segment height, or other patient non-adaptable elements within the first year will be accommodated 1 time at no charge.",
      },
      {
        body: "Patient changes and high patient changes are included in this policy area.",
      },
      {
        body: "If a lens remake involves upgrading to a higher-priced product, the original invoice will be credited and the new higher-priced lens order will be invoiced when the remake ships.",
      },
    ],
  },
  {
    id: "lab-error-remake",
    eyebrow: "Remakes",
    title: "Lab Error Remake Process",
    summary: "How lab error remakes are reviewed, processed, and credited.",
    tags: ["lab error", "remake", "quality control", "inspection", "return"],
    items: [
      {
        body: "All remakes due to lab error will be processed at no charge with valid reason if received within 30 days from the date the order was shipped.",
      },
      {
        body: "Lenses are required to be returned for inspection and quality control.",
      },
      {
        body: "If the remake request is not valid after review, the customer's 1 time redo may be used.",
      },
    ],
  },
  {
    id: "frame-policies",
    eyebrow: "Frames",
    title: "Frame Replacement and Frame Policies",
    summary: "Frame manifest requirements, patient-owned frame risk, and replacement rules.",
    tags: ["frame", "shipping", "manifest", "PAL", "patient-owned", "Portland", "new accounts"],
    items: [
      {
        body: "Frames will only be replaced if accompanied by a frame manifest.",
      },
      {
        body: "The frame manifest should be available on the Artisan Lab Network Practice Resources page.",
      },
      {
        body: "PAL may reject frames that are prone to damage or unsuitable for the Rx and lens order.",
      },
      {
        body: "Patient-owned frames are processed at the practice's risk. PAL is not liable for breakage during handling or processing.",
      },
      {
        body: "If an order is more than 30 days old, patient-owned frame policies apply. These frames are not warranted or guaranteed by the lab. If the frame breaks during processing, the practice is responsible for replacing it.",
      },
      {
        title: "New account exception",
        body: "For new accounts, allow a 1 time exception if approved.",
      },
      {
        title: "Manifest records",
        body: "Portland retains copies of manifests.",
      },
    ],
  },
  {
    id: "multiple-pair-discount",
    eyebrow: "Discounts",
    title: "Multiple-Pair Discount",
    summary: "Eligibility and exclusions for additional lens pairs.",
    tags: ["multiple pair", "discount", "premium AR", "polarization", "Neurolens", "specialty"],
    items: [
      {
        body: "Additional pairs purchased within 30 days of the original invoice date are eligible.",
      },
      {
        body: "The lesser-priced pair receives 50% off when the pair includes premium AR or polarization.",
      },
      {
        body: "There are no limits to the number of additional eligible lens pairs unless otherwise stated.",
      },
      {
        body: "Exclusions apply, including Neurolens and specialty jobs.",
      },
      {
        body: "Each practice location is handled according to the lab's approved program terms.",
      },
    ],
  },
  {
    id: "cancelled-orders",
    eyebrow: "Orders",
    title: "Cancelled Orders",
    summary: "How cancelled orders are handled after production has or has not started.",
    tags: ["cancelled", "uncut", "charge", "orders"],
    items: [
      {
        body: "Cancelled orders that have already started will be charged as an uncut.",
      },
      {
        body: "Cancelled orders that have not started will not be charged.",
      },
    ],
  },
  {
    id: "shipping-policies",
    eyebrow: "Shipping",
    title: "Shipping Policies",
    summary: "Inbound and outbound shipping rules, fees, and delivery intent.",
    tags: ["shipping", "inbound", "outbound", "box", "job", "next day"],
    items: [
      {
        title: "Option 1",
        body: "Outbound per job shipping fee: $4.",
      },
      {
        title: "Option 2",
        body: "Outbound per box shipping fee: $16.",
      },
      {
        body: "Inbound shipping is complimentary.",
      },
      {
        body: "The lab determines the shipping method with the intent to deliver outbound shipments next day, volume dependent.",
      },
      {
        body: "A $4 flat outbound shipping fee is generally applied.",
      },
    ],
  },
  {
    id: "specialty-outsourced",
    eyebrow: "Specialty",
    title: "Specialty and Outsourced Jobs",
    summary: "How specialty and outsourced work is priced, quoted, and governed.",
    tags: ["specialty", "outsourced", "contract pricing", "lead time"],
    items: [
      {
        body: "Specialty and outsourced jobs are handled at contract pricing.",
      },
      {
        body: "The customer should be notified of cost and estimated lead time before proceeding.",
      },
      {
        body: "Specialty lab policies supersede normal lab policies when applicable.",
      },
    ],
  },
  {
    id: "manufacturer-credits",
    eyebrow: "Credits",
    title: "Manufacturer and Lab Warranty Credits",
    summary: "Vendor return requirements and credit approval considerations.",
    tags: ["manufacturer", "vendor", "credit", "returns", "Neurolens"],
    items: [
      {
        body: "Some manufacturers and labs require lens returns for credit.",
      },
      {
        body: "Requirements vary by vendor.",
      },
      {
        body: "Neurolens refunds require the lenses to be returned.",
      },
    ],
  },
  {
    id: "chemiclips-retrofit",
    eyebrow: "Chemistrie",
    title: "Chemiclips and Retrofit Magnets",
    summary: "Scratch warranty and charge rules for Chemiclips and retrofit magnets.",
    tags: ["Chemistrie", "Chemiclips", "retrofit magnets", "scratch warranty"],
    items: [
      {
        body: "Chemiclips do not include a scratch warranty.",
      },
      {
        body: "Retrofit magnets are charged at $40 when applicable.",
      },
    ],
  },
];

const quickNav = [
  { label: "Warranty", href: "#warranty-coverage" },
  { label: "AR", href: "#ar-policies" },
  { label: "Redos", href: "#doctor-redos" },
  { label: "Lab Error", href: "#lab-error-remake" },
  { label: "Frames", href: "#frame-policies" },
  { label: "Shipping", href: "#shipping-policies" },
  { label: "Specialty", href: "#specialty-outsourced" },
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
      {open ? (
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
      ) : null}
    </AnimatePresence>
  );
}

function sectionText(section: PolicySection) {
  return [
    section.eyebrow,
    section.title,
    section.summary,
    ...section.tags,
    ...section.items.flatMap((item) => [item.title ?? "", item.body]),
  ]
    .join(" ")
    .toLowerCase();
}

function PolicyAccordion({
  section,
  isOpen,
  onToggle,
}: {
  section: PolicySection;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const panelId = `${section.id}-panel`;

  return (
    <motion.article
      id={section.id}
      variants={fadeUp}
      className="scroll-mt-40 overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_18px_54px_rgba(24,18,13,0.07)]"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-start justify-between gap-5 px-5 py-5 text-left md:px-7 md:py-6"
      >
        <span>
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">
            {section.eyebrow}
          </span>
          <span className="mt-2 block text-2xl font-semibold leading-tight text-[#1f1a17]">
            {section.title}
          </span>
          <span className="mt-2 block text-sm leading-6 text-[#625b53]">
            {section.summary}
          </span>
        </span>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#d8c6a8] bg-[#fbf8f3] text-2xl leading-none text-[#8a7654]">
          {isOpen ? "-" : "+"}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id={panelId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-black/10 bg-[#fffaf2]/65 px-5 py-5 md:px-7 md:py-6">
              <div className="grid gap-3 md:grid-cols-2">
                {section.items.map((item, index) => (
                  <div
                    key={`${section.id}-${index}`}
                    className={`rounded-2xl border border-[#e1d4c2] bg-white/80 p-4 shadow-[0_10px_28px_rgba(24,18,13,0.04)] ${
                      !item.title ? "md:col-span-2" : ""
                    }`}
                  >
                    {item.title ? (
                      <h3 className="text-base font-semibold text-[#1f1a17]">
                        {item.title}
                      </h3>
                    ) : null}
                    <p className={`${item.title ? "mt-2" : ""} text-sm leading-7 text-[#625b53]`}>
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {section.tags.slice(0, 6).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#e1d4c2] bg-[#fbf8f3] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a7654]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  );
}

export default function LabPoliciesPage() {
  const [contactOpen, setContactOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [openSectionIds, setOpenSectionIds] = useState<string[]>(["warranty-coverage"]);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleSections = useMemo(() => {
    if (!normalizedQuery) return policySections;
    return policySections.filter((section) => sectionText(section).includes(normalizedQuery));
  }, [normalizedQuery]);

  const resultLabel =
    normalizedQuery.length > 0
      ? `${visibleSections.length} ${visibleSections.length === 1 ? "policy area" : "policy areas"} found`
      : "Search by product, vendor, policy type, or procedure";

  const toggleSection = (sectionId: string) => {
    setOpenSectionIds((current) =>
      current.includes(sectionId)
        ? current.filter((id) => id !== sectionId)
        : [...current, sectionId]
    );
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f1eb] text-[#1f1a17]">
      <Header onContactClick={() => setContactOpen(true)} />

      <section
        data-theme="dark"
        className="relative overflow-hidden px-6 pb-16 pt-32 text-white md:px-10 md:pb-24 md:pt-40"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/backgroundwithglasses2.jpeg')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,13,11,0.96),rgba(17,13,11,0.82)_52%,rgba(17,13,11,0.58))]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#171311] to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="max-w-5xl"
          >
            <div className="h-px w-16 bg-[#d4c09a]" />
            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.3em] text-[#d4c09a]">
              Lab Policies
            </p>
            <h1 className="mt-4 text-5xl font-semibold leading-[1.03] tracking-tight md:text-7xl">
              Lab Remake, Redo and Warranty Policies
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/76 md:text-xl">
              Clear policies. Simple procedures. Built to help your practice work confidently with our lab.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="#warranty-coverage"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d4c09a] px-6 py-3 text-sm font-semibold text-[#171311] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e2cca2]"
              >
                View Warranty Coverage
              </a>
              <a
                href="#doctor-redos"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/16 bg-white/8 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/12"
              >
                Check Redo Policies
              </a>
              <a
                href="#shipping-policies"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/16 bg-white/8 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/12"
              >
                Review Shipping and Frame Rules
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <nav
        data-theme="light"
        aria-label="Lab policy quick navigation"
        className="sticky top-[72px] z-40 border-y border-[#e5d9c8] bg-[#f5f1eb]/92 px-5 py-3 backdrop-blur-xl md:top-[76px]"
      >
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto [scrollbar-width:thin]">
          {quickNav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-semibold text-[#1f1a17] shadow-sm transition hover:border-[#d4c09a] hover:bg-[#d4c09a]"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <section data-theme="light" className="px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">
                Most Asked
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
                Start with the common questions.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-8 text-[#625b53]">
              These cards summarize the areas practices ask about most often. Use them as a shortcut, then open the detailed policy section below.
            </p>
          </motion.div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {quickCards.map((card, index) => (
              <motion.a
                key={card.title}
                href={card.href}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.06, ease: "easeOut" }}
                className="group rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(24,18,13,0.07)] transition duration-300 hover:-translate-y-1.5 hover:border-[#d4c09a] hover:shadow-[0_28px_64px_rgba(24,18,13,0.12)]"
              >
                <div className="mb-5 flex items-center justify-between gap-4">
                  <span className="rounded-full border border-[#e1d4c2] bg-[#fbf8f3] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a7654]">
                    {card.label}
                  </span>
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[#d4c09a] text-sm font-semibold text-[#171311] transition group-hover:translate-x-0.5">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-xl font-semibold leading-tight text-[#1f1a17]">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#625b53]">{card.body}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      <section data-theme="light" className="border-y border-[#e7ddd0] bg-[#fbf8f3] px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="rounded-[34px] border border-black/10 bg-white p-5 shadow-[0_24px_70px_rgba(24,18,13,0.08)] md:p-7">
            <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">
                  Search Policies
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
                  Find a policy by term.
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#625b53]">
                  Try AR, scratch, redo, frame, shipping, VSP, Unity, Chemistrie, or Neurolens.
                </p>
              </div>
              <div>
                <label className="sr-only" htmlFor="policy-search">
                  Search lab policies
                </label>
                <input
                  id="policy-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search policies..."
                  className="min-h-14 w-full rounded-full border border-[#d8c6a8] bg-[#fbf8f3] px-5 text-base font-semibold text-[#1f1a17] outline-none transition placeholder:text-[#8a7654]/60 focus:border-[#d4c09a] focus:bg-white focus:shadow-[0_0_0_4px_rgba(212,192,154,0.18)]"
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-[#625b53]">
                  <span>{resultLabel}</span>
                  {query ? (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="font-semibold text-[#8a7654] underline decoration-[#d4c09a] underline-offset-4 transition hover:text-[#1f1a17]"
                    >
                      Clear search
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={{
              initial: {},
              whileInView: { transition: { staggerChildren: 0.06 } },
            }}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, amount: 0.08 }}
            className="mt-10 grid gap-4"
          >
            {visibleSections.map((section) => (
              <PolicyAccordion
                key={section.id}
                section={section}
                isOpen={normalizedQuery ? true : openSectionIds.includes(section.id)}
                onToggle={() => toggleSection(section.id)}
              />
            ))}
          </motion.div>

          {visibleSections.length === 0 ? (
            <div className="mt-10 rounded-[28px] border border-black/10 bg-white p-8 text-center shadow-[0_18px_54px_rgba(24,18,13,0.07)]">
              <h3 className="text-2xl font-semibold text-[#1f1a17]">No matching policy found.</h3>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#625b53]">
                Try a broader term, or contact customer service before submitting a remake, redo, or warranty request.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <section data-theme="dark" className="relative overflow-hidden bg-[#171311] px-6 py-20 text-white md:px-10 md:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_10%,rgba(212,192,154,0.16),transparent_32%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <motion.div {...fadeUp}>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4c09a]">
              Need Help?
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Questions About a Policy?
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/72 md:text-lg">
              Our team is here to help you understand the best next step before you submit a remake, redo, or warranty request.
            </p>
          </motion.div>
          <motion.div
            {...fadeUp}
            className="rounded-[30px] border border-white/12 bg-white/[0.06] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-md md:p-8"
          >
            <h3 className="text-2xl font-semibold">Before you submit</h3>
            <p className="mt-3 text-sm leading-7 text-white/68">
              If a policy depends on product, vendor, specialty lab rules, or account program terms, customer service can help confirm the right path.
            </p>
            <a
              href={CUSTOMER_SERVICE_MAILTO}
              className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-[#d4c09a] px-6 py-3 text-sm font-semibold text-[#171311] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e2cca2]"
            >
              Contact Customer Service
            </a>
            <p className="mt-6 border-t border-white/10 pt-5 text-xs leading-6 text-white/48">
              Policies may vary by product, vendor, account program, or specialty lab requirements. Final credit approval is subject to lab review.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer onContactClick={() => setContactOpen(true)} signUpHref={SIGNUP_URL} />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </main>
  );
}
