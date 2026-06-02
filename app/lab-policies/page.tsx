"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RingsAccent from "../components/RingsAccent";
import SiteIcon from "../components/SiteIcon";

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

const stagger = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.07 } },
} as const;

type IconName =
  | "shield"
  | "refresh"
  | "lab"
  | "spark"
  | "card"
  | "frame"
  | "truck"
  | "star"
  | "example"
  | "search"
  | "chat"
  | "check";

type PolicySection = {
  id: string;
  navLabel: string;
  icon: IconName;
  title: string;
  summary: string;
  whatThisMeans: string;
  qualifies: string[];
  doesNotQualify: string[];
  nextSteps: string[];
  keywords: string[];
};

type ExampleCard = {
  title: string;
  result: string;
  href: string;
  icon: string;
};

const commonQuestions = [
  {
    label: "Warranty",
    title: "How long is coverage?",
    body: "Most Artisan lenses are covered for 2 years with up to 2 remakes, depending on product type.",
    href: "#warranty-coverage",
    icon: "/icons/site/shield.svg",
  },
  {
    label: "Redo",
    title: "What about patient changes?",
    body: "Patient non-adapt changes may qualify for a one-time redo within the first year.",
    href: "#doctor-redos",
    icon: "/icons/site/repeat.svg",
  },
  {
    label: "Frames",
    title: "Are patient-owned frames covered?",
    body: "Patient-owned frames are handled with care but cannot be guaranteed due to variability in condition.",
    href: "#frame-policies",
    icon: "/icons/site/file-check.svg",
  },
  {
    label: "Shipping",
    title: "How does shipping work?",
    body: "Inbound shipping is covered. Outbound shipping is structured per job or per box.",
    href: "#shipping",
    icon: "/icons/site/truck.svg",
  },
];

const realWorldExamples: ExampleCard[] = [
  {
    title: "Patient cannot adapt to a progressive after 3 weeks",
    result: "May qualify for a one-time non-adapt redo within 1 year.",
    href: "#doctor-redos",
    icon: "/icons/site/repeat.svg",
  },
  {
    title: "Power change requested after delivery",
    result: "May qualify under doctor redo depending on timing and eligibility.",
    href: "#doctor-redos",
    icon: "/icons/site/repeat.svg",
  },
  {
    title: "Patient-owned frame breaks during processing",
    result: "Frames are handled with care but are not guaranteed due to condition variability.",
    href: "#frame-policies",
    icon: "/icons/site/alert-circle.svg",
  },
  {
    title: "VSP Unity non-adapt",
    result: "Requires a new VSP authorization for reimbursement.",
    href: "#vsp-unity",
    icon: "/icons/site/file-check.svg",
  },
  {
    title: "Mirror coating issue",
    result: "Mirror-only coverage follows a 1 year, 1 time policy.",
    href: "#warranty-coverage",
    icon: "/icons/site/shield.svg",
  },
  {
    title: "Specialty lab job",
    result: "Specialty lab pricing and policies may override standard policies.",
    href: "#specialty-outsourced",
    icon: "/icons/site/alert-circle.svg",
  },
];

const policySections: PolicySection[] = [
  {
    id: "warranty-coverage",
    navLabel: "Warranty",
    icon: "shield",
    title: "Warranty Coverage",
    summary: "Coverage timing depends on the product, treatment, and warranty program attached to the order.",
    whatThisMeans:
      "Warranty coverage is designed to give your team a clear path when a covered product issue comes up after delivery.",
    qualifies: [
      "Artisan standard and regular bar products: 2 years, up to 2 warranty remakes.",
      "Artisan Diamond and similar products: 1 year, up to 1 warranty remake.",
      "Diamond Defense: 2 years, up to 2 warranty remakes.",
      "Mirror coating alone: 1 year, up to 1 warranty remake.",
      "Mirror plus Artisan Diamond backside AR: 2 years, up to 2 warranty remakes.",
    ],
    doesNotQualify: [
      "Coverage may differ when a manufacturer, specialty lab, account program, or vendor warranty has separate requirements.",
      "Requests outside the stated time or usage limits may need customer service review before credit is confirmed.",
    ],
    nextSteps: [
      "Confirm the product and treatment on the original order.",
      "Submit the warranty request with the order details and reason for review.",
      "Contact customer service if the product has multiple treatments or vendor-specific terms.",
    ],
    keywords: ["warranty", "coverage", "diamond", "diamond defense", "mirror", "backside AR"],
  },
  {
    id: "doctor-redos",
    navLabel: "Doctor Redos",
    icon: "refresh",
    title: "Doctor Redos and Rx Changes",
    summary: "Patient non-adapt changes may qualify for a one-time redo within the first year.",
    whatThisMeans:
      "When the patient experience requires a design, power, measurement, or frame change, our team will help determine the clearest redo path.",
    qualifies: [
      "Requests within the first year for design, power, PD, prism, frame, segment height, or other patient non-adaptable elements.",
      "Patient changes and high patient changes when they fit within the available redo policy.",
      "Unity VSP doctor redos when submitted within the 6 month coverage window.",
    ],
    doesNotQualify: [
      "Requests outside the available redo window may require separate review.",
      "Upgrades to a higher-priced product are not handled as a simple no-charge duplicate of the original order.",
    ],
    nextSteps: [
      "Submit the remake with the updated order information and the reason for the change.",
      "If the remake upgrades to a higher-priced product, the original invoice will be credited and the new lens order will be invoiced when the remake ships.",
      "Ask customer service for guidance when timing, product upgrades, or eligibility are unclear.",
    ],
    keywords: [
      "redo",
      "doctor redo",
      "rx",
      "power",
      "pd",
      "prism",
      "segment height",
      "patient change",
      "non adapt",
      "high patient change",
    ],
  },
  {
    id: "lab-error-remake",
    navLabel: "Lab Errors",
    icon: "lab",
    title: "Lab Error Remake Process",
    summary: "Lab error remakes are reviewed quickly and processed at no charge when the request is valid.",
    whatThisMeans:
      "If something appears incorrect because of lab production, we review the order, inspect the lenses, and help resolve it as quickly as possible.",
    qualifies: [
      "Valid lab error remake requests received within 30 days from the date the order shipped.",
      "Requests with a clear reason that can be reviewed by the lab team.",
      "Orders where returned lenses can be inspected for quality control.",
    ],
    doesNotQualify: [
      "Requests that do not review as lab error may need to be handled under the available redo policy.",
      "Requests outside the 30 day shipped-date window may require additional review.",
    ],
    nextSteps: [
      "Submit the remake request with the reason for review.",
      "Return the lenses so the lab can inspect them for quality control.",
      "Our team will help determine if the request qualifies as lab error or may fit another available policy.",
    ],
    keywords: ["lab error", "remake", "quality control", "inspection", "return", "30 days"],
  },
  {
    id: "ar-policies",
    navLabel: "AR & Scratch",
    icon: "spark",
    title: "AR Policies",
    summary: "AR warranty use is built to be simple, with no lens return required for treatment warranty usage.",
    whatThisMeans:
      "For covered AR treatment issues, your team can submit the warranty request without first sending the lenses back to the lab.",
    qualifies: [
      "Artisan AR Technologies, excluding Standard AR.",
      "Artisan Standard and Backside AR.",
      "TechShield AR Technologies.",
      "Tokai AR Technologies.",
      "Crizal AR Technologies.",
      "Shamir AR Technologies.",
      "Hoya AR Technologies.",
    ],
    doesNotQualify: [
      "Standard AR exclusions still apply where noted.",
      "Vendor programs may have separate return or credit requirements outside the standard lab process.",
    ],
    nextSteps: [
      "Submit the AR treatment warranty request with the order information.",
      "Keep the lenses available if customer service asks for additional review.",
      "Check vendor-specific requirements when the AR treatment is tied to an outside manufacturer program.",
    ],
    keywords: [
      "ar",
      "anti reflective",
      "artisan ar",
      "techshield",
      "tokai",
      "crizal",
      "shamir",
      "hoya",
      "standard ar",
    ],
  },
  {
    id: "scratch-coating",
    navLabel: "AR & Scratch",
    icon: "spark",
    title: "Scratch Coating Policies",
    summary: "Scratch coating warranty use does not require lenses to be returned before the warranty request is used.",
    whatThisMeans:
      "Scratch coating coverage gives your practice a straightforward way to handle covered coating concerns without slowing the patient solution.",
    qualifies: [
      "Factory Scratch Coat: 1 year, up to 1 warranty remake.",
      "Diamond Defense Scratch Coat: 2 years, up to 2 warranty remakes.",
    ],
    doesNotQualify: [
      "Chemiclips do not include a scratch warranty.",
      "Coverage outside the stated time and usage limits may need review before credit is confirmed.",
    ],
    nextSteps: [
      "Confirm the scratch coating attached to the original order.",
      "Submit the warranty request with the order details and reason.",
      "Contact customer service if the coating type is unclear.",
    ],
    keywords: ["scratch", "coating", "factory scratch", "diamond defense", "chemiclips"],
  },
  {
    id: "vsp-unity",
    navLabel: "VSP & Unity",
    icon: "card",
    title: "VSP and Unity Products",
    summary: "VSP and Unity orders may require authorization steps before reimbursement can be completed.",
    whatThisMeans:
      "Program orders can involve payer requirements that sit outside the lab workflow, so authorization details matter before the redo is submitted.",
    qualifies: [
      "Unity VSP doctor redos are covered for 6 months.",
      "VSP non-adapt Unity products can be reviewed when a new VSP authorization is provided for reimbursement.",
    ],
    doesNotQualify: [
      "VSP non-adapt Unity reimbursement cannot move forward without a new VSP authorization.",
      "Requests outside the Unity VSP doctor redo window may require separate review.",
    ],
    nextSteps: [
      "Confirm whether the order is a VSP Unity product.",
      "Secure the new VSP authorization when required.",
      "Send the updated authorization details with the redo request.",
    ],
    keywords: ["vsp", "unity", "authorization", "reimbursement", "non adapt", "doctor redo"],
  },
  {
    id: "frame-policies",
    navLabel: "Frames",
    icon: "frame",
    title: "Frame Replacement and Frame Policies",
    summary: "Frames are handled with care, and documentation helps determine the right replacement path.",
    whatThisMeans:
      "Frame condition, age, documentation, and order timing all affect whether the lab can guarantee or replace a frame.",
    qualifies: [
      "Frame replacement requests accompanied by a frame manifest.",
      "Frames documented through the manifest available on the Artisan Lab Network Practice Resources page.",
      "For new accounts, a one-time exception may be allowed when approved.",
      "Portland retains copies of manifests.",
    ],
    doesNotQualify: [
      "PAL may decline frames that are prone to damage or unsuitable for the Rx and lens order.",
      "Because patient-owned frames vary in age and condition, they are handled with care but cannot be guaranteed by the lab.",
      "If an order is more than 30 days old, patient-owned frame policies apply and the practice is responsible for replacing the frame if it breaks during processing.",
    ],
    nextSteps: [
      "Include the frame manifest whenever frame replacement may be involved.",
      "Review patient-owned frame condition before sending the order.",
      "Contact customer service when a frame seems fragile, high-risk, or unsuitable for the lens order.",
    ],
    keywords: [
      "frame",
      "patient-owned",
      "manifest",
      "pal",
      "breakage",
      "portland",
      "new account",
      "practice resources",
    ],
  },
  {
    id: "multiple-pair-discount",
    navLabel: "Specialty",
    icon: "star",
    title: "Multiple-Pair Discount",
    summary: "Additional eligible pairs may receive a discount when ordered within the approved timing and program terms.",
    whatThisMeans:
      "The multiple-pair program helps practices support patients who need additional lens pairs soon after the original order.",
    qualifies: [
      "Additional pairs purchased within 30 days of the original invoice date.",
      "The lesser-priced pair receives 50% off when the pair includes premium AR or polarization.",
      "There are no limits to the number of additional eligible lens pairs unless otherwise stated.",
    ],
    doesNotQualify: [
      "Exclusions apply, including Neurolens and specialty jobs.",
      "Eligibility may vary by each practice location's approved program terms.",
    ],
    nextSteps: [
      "Confirm the original invoice date and approved practice program terms.",
      "Check whether the additional pair includes premium AR or polarization.",
      "Ask customer service before quoting if Neurolens, specialty work, or account-specific terms are involved.",
    ],
    keywords: ["multiple pair", "discount", "premium ar", "polarization", "neurolens", "specialty"],
  },
  {
    id: "cancelled-orders",
    navLabel: "Specialty",
    icon: "refresh",
    title: "Cancelled Orders",
    summary: "Cancellation billing depends on whether production work has already started.",
    whatThisMeans:
      "Once materials and production time have been committed, the order has real lab cost attached to it.",
    qualifies: [
      "Orders cancelled before production has started will not be billed.",
      "Orders cancelled after production has started will be billed as an uncut because materials and work have already been committed.",
    ],
    doesNotQualify: [
      "A started order cannot be treated the same as an order cancelled before production began.",
    ],
    nextSteps: [
      "Contact the lab as soon as a cancellation is needed.",
      "Customer service can confirm whether production has started.",
      "Use that confirmation to set clear expectations with your team and patient.",
    ],
    keywords: ["cancelled", "canceled", "uncut", "charge", "order started", "production"],
  },
  {
    id: "shipping",
    navLabel: "Shipping",
    icon: "truck",
    title: "Shipping and Delivery",
    summary: "Inbound shipping is covered, with clear outbound rates for next-day and 2 day service.",
    whatThisMeans:
      "Shipping policy is designed to keep orders moving predictably while allowing the lab to choose the method that best supports next-day delivery intent.",
    qualifies: [
      "Next Day Air: $4.",
      "2 Day Shipping: $16.",
      "Inbound shipping is complimentary.",
      "Outbound method is selected by the lab based on job flow, volume, and delivery needs.",
    ],
    doesNotQualify: [
      "Outbound delivery method is determined by the lab based on volume and delivery needs.",
      "Next-day and 2 day service availability may depend on volume and shipping conditions.",
    ],
    nextSteps: [
      "Confirm whether Next Day Air or 2 Day Shipping is the right service expectation.",
      "Plan around the lab's selected outbound shipping method.",
      "Contact customer service for shipping questions on unusual order volume or timing.",
    ],
    keywords: ["shipping", "inbound", "outbound", "box", "job", "next day", "next day air", "2 day", "$4", "$16"],
  },
  {
    id: "specialty-outsourced",
    navLabel: "Specialty",
    icon: "star",
    title: "Specialty and Outsourced Jobs",
    summary: "Specialty and outsourced work may follow separate pricing, lead times, and lab rules.",
    whatThisMeans:
      "Some jobs require outside partners or specialty production, so the standard lab policy may not be the final policy that applies.",
    qualifies: [
      "Specialty and outsourced jobs handled at contract pricing.",
      "Jobs where the customer is notified of cost and estimated lead time before proceeding.",
    ],
    doesNotQualify: [
      "Standard lab policies may not override specialty lab requirements.",
      "Specialty lab policies supersede normal lab policies when applicable.",
    ],
    nextSteps: [
      "Wait for cost and estimated lead time confirmation before proceeding.",
      "Share specialty timing expectations with the patient when needed.",
      "Ask customer service which policy applies if standard and specialty requirements differ.",
    ],
    keywords: ["specialty", "outsourced", "contract pricing", "lead time", "specialty lab"],
  },
  {
    id: "manufacturer-credits",
    navLabel: "Specialty",
    icon: "card",
    title: "Manufacturer and Lab Warranty Credits",
    summary: "Some vendor and manufacturer credits require lens returns before credit can be finalized.",
    whatThisMeans:
      "Manufacturer programs can have credit requirements that differ from Artisan's standard handling, especially when the vendor needs lenses returned.",
    qualifies: [
      "Vendor or manufacturer warranty credits that meet that partner's requirements.",
      "Neurolens refund requests when the lenses are returned as required.",
    ],
    doesNotQualify: [
      "Credits cannot always be finalized without meeting the vendor's return requirements.",
      "Requirements vary by vendor and may differ from normal lab warranty handling.",
    ],
    nextSteps: [
      "Confirm whether a manufacturer or outside lab controls the credit requirements.",
      "Return lenses when the vendor requires them, including Neurolens refunds.",
      "Contact customer service if the vendor requirement is unclear.",
    ],
    keywords: ["manufacturer", "vendor", "credit", "returns", "neurolens", "refund"],
  },
  {
    id: "chemiclips-retrofit",
    navLabel: "Specialty",
    icon: "star",
    title: "Chemiclips and Retrofit Magnets",
    summary: "Chemiclips and retrofit magnet work has specific scratch warranty and charge rules.",
    whatThisMeans:
      "Clip and retrofit work can involve specialty handling, so expectations should be confirmed before the order is submitted.",
    qualifies: [
      "Retrofit magnets are charged at $40 when applicable.",
      "Chemiclips can be processed under the applicable Chemistrie workflow.",
    ],
    doesNotQualify: [
      "Chemiclips do not include a scratch warranty.",
    ],
    nextSteps: [
      "Confirm whether retrofit magnets are needed before quoting.",
      "Set expectations that Chemiclips do not carry scratch warranty coverage.",
      "Contact customer service for questions about Chemistrie clip work or retrofit requirements.",
    ],
    keywords: ["chemistrie", "chemiclips", "retrofit magnets", "scratch warranty", "$40"],
  },
];

const quickNav = [
  { label: "Warranty", href: "#warranty-coverage", icon: "/icons/site/shield.svg" },
  { label: "Doctor Redos", href: "#doctor-redos", icon: "/icons/site/repeat.svg" },
  { label: "Lab Errors", href: "#lab-error-remake", icon: "/icons/site/shield-check.svg" },
  { label: "AR & Scratch", href: "#ar-policies", icon: "/icons/site/shield.svg" },
  { label: "VSP & Unity", href: "#vsp-unity", icon: "/icons/site/file-check.svg" },
  { label: "Frames", href: "#frame-policies", icon: "/icons/site/file-check.svg" },
  { label: "Shipping", href: "#shipping", icon: "/icons/site/truck.svg" },
  { label: "Specialty", href: "#specialty-outsourced", icon: "/icons/site/alert-circle.svg" },
  { label: "Examples", href: "#real-world-examples", icon: "/icons/site/handshake.svg" },
];

function LineIcon({ name, className = "" }: { name: IconName; className?: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      {name === "shield" ? (
        <path {...common} d="M12 3.5 19 6v5.4c0 4.3-2.8 7.6-7 9.1-4.2-1.5-7-4.8-7-9.1V6l7-2.5Z" />
      ) : null}
      {name === "refresh" ? (
        <>
          <path {...common} d="M19 8a7 7 0 0 0-11.8-3.1L5 7" />
          <path {...common} d="M5 3.5V7h3.5" />
          <path {...common} d="M5 16a7 7 0 0 0 11.8 3.1L19 17" />
          <path {...common} d="M19 20.5V17h-3.5" />
        </>
      ) : null}
      {name === "lab" ? (
        <>
          <path {...common} d="M9 3h6" />
          <path {...common} d="M10 3v5.5l-4.4 7.8A3 3 0 0 0 8.2 21h7.6a3 3 0 0 0 2.6-4.7L14 8.5V3" />
          <path {...common} d="M8 15h8" />
        </>
      ) : null}
      {name === "spark" ? (
        <>
          <path {...common} d="M12 3v4" />
          <path {...common} d="M12 17v4" />
          <path {...common} d="M3 12h4" />
          <path {...common} d="M17 12h4" />
          <path {...common} d="m6 6 2.8 2.8" />
          <path {...common} d="m15.2 15.2 2.8 2.8" />
          <path {...common} d="m18 6-2.8 2.8" />
          <path {...common} d="m8.8 15.2-2.8 2.8" />
        </>
      ) : null}
      {name === "card" ? (
        <>
          <rect {...common} x="3.5" y="6" width="17" height="12" rx="2.2" />
          <path {...common} d="M3.5 10h17" />
          <path {...common} d="M7 14.5h4" />
        </>
      ) : null}
      {name === "frame" ? (
        <>
          <path {...common} d="M4 13c.5-3 2.1-5 4.4-5 1.7 0 2.8 1 3.6 2 .8-1 1.9-2 3.6-2 2.3 0 3.9 2 4.4 5" />
          <circle {...common} cx="7.4" cy="14" r="3.2" />
          <circle {...common} cx="16.6" cy="14" r="3.2" />
          <path {...common} d="M10.6 14h2.8" />
        </>
      ) : null}
      {name === "truck" ? (
        <>
          <path {...common} d="M3.5 7h10v8h-10z" />
          <path {...common} d="M13.5 10h3.6l3.4 3.3V15h-7" />
          <circle {...common} cx="7" cy="17" r="1.7" />
          <circle {...common} cx="17" cy="17" r="1.7" />
        </>
      ) : null}
      {name === "star" ? (
        <path {...common} d="m12 3.8 2.3 4.9 5.2.8-3.8 3.8.9 5.3-4.6-2.5-4.6 2.5.9-5.3-3.8-3.8 5.2-.8L12 3.8Z" />
      ) : null}
      {name === "example" ? (
        <>
          <path {...common} d="M5 5h14v14H5z" />
          <path {...common} d="M8 9h8" />
          <path {...common} d="M8 13h5" />
          <path {...common} d="M8 17h7" />
        </>
      ) : null}
      {name === "search" ? (
        <>
          <circle {...common} cx="10.5" cy="10.5" r="5.8" />
          <path {...common} d="m15 15 4 4" />
        </>
      ) : null}
      {name === "chat" ? (
        <>
          <path {...common} d="M5 5h14v10.5H9l-4 3V5Z" />
          <path {...common} d="M8 9h8" />
          <path {...common} d="M8 12h5" />
        </>
      ) : null}
      {name === "check" ? (
        <>
          <circle {...common} cx="12" cy="12" r="8" />
          <path {...common} d="m8.5 12.2 2.2 2.2 4.8-5" />
        </>
      ) : null}
    </svg>
  );
}

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
    section.navLabel,
    section.title,
    section.summary,
    section.whatThisMeans,
    ...section.qualifies,
    ...section.doesNotQualify,
    ...section.nextSteps,
    ...section.keywords,
  ]
    .join(" ")
    .toLowerCase();
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-[#eadfce] bg-white/70 p-4">
      <h4 className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">
        {title}
      </h4>
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-[#625b53]">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d4c09a]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PolicyPanel({
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
      className="scroll-mt-40 rounded-[30px] border border-black/10 bg-white p-5 shadow-[0_18px_54px_rgba(24,18,13,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(24,18,13,0.1)] md:p-6"
    >
      {section.id === "shipping" ? (
        <>
          <span id="shipping" className="block scroll-mt-40" aria-hidden="true" />
          <span id="shipping-policies" className="block scroll-mt-40" aria-hidden="true" />
        </>
      ) : null}
      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">
            {section.navLabel}
          </div>
          <h3 className="mt-2 text-2xl font-semibold leading-tight text-[#1f1a17]">
            {section.title}
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#625b53] md:text-base">
            {section.summary}
          </p>
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d8c6a8] bg-[#fbf8f3] px-5 py-2.5 text-sm font-semibold text-[#1f1a17] transition hover:border-[#d4c09a] hover:bg-[#d4c09a]"
        >
          View Policy
          <span className="text-lg leading-none">{isOpen ? "-" : "+"}</span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id={panelId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.26, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-6 border-t border-black/10 pt-6">
              <div className="rounded-[24px] border border-[#eadfce] bg-[#fbf8f3] p-5 md:p-6">
                <h4 className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">
                  What this means
                </h4>
                <p className="mt-3 text-base leading-8 text-[#4f4840]">
                  {section.whatThisMeans}
                </p>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <DetailList title="What qualifies" items={section.qualifies} />
                <DetailList title="What does not qualify" items={section.doesNotQualify} />
                <DetailList title="What to do next" items={section.nextSteps} />
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
  const [openSectionIds, setOpenSectionIds] = useState<string[]>([]);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleSections = useMemo(() => {
    if (!normalizedQuery) return policySections;
    return policySections.filter((section) => sectionText(section).includes(normalizedQuery));
  }, [normalizedQuery]);

  const resultLabel =
    normalizedQuery.length > 0
      ? `${visibleSections.length} ${visibleSections.length === 1 ? "policy area" : "policy areas"} found`
      : "Search or choose a category below";

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
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,13,11,0.96),rgba(17,13,11,0.84)_54%,rgba(17,13,11,0.58))]" />
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
              Lab Policies Built Around Partnership
            </h1>
            <p className="mt-6 max-w-4xl text-lg leading-8 text-white/76 md:text-xl">
              A clear guide to remakes, redos, warranties, credits, frames, shipping, and special cases, designed to help your practice serve patients with confidence.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="#policy-search-panel"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d4c09a] px-6 py-3 text-sm font-semibold text-[#171311] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e2cca2]"
              >
                Search Policies
              </a>
              <a
                href="#real-world-examples"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/16 bg-white/8 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/12"
              >
                View Common Examples
              </a>
              <a
                href="/files/artisan-policies-guide.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d4c09a]/55 bg-white/8 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[#d4c09a] hover:bg-[#d4c09a] hover:text-[#171311]"
              >
                Download PDF Policies Guide
              </a>
              <button
                type="button"
                onClick={() => setContactOpen(true)}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/16 bg-white/8 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/12"
              >
                Contact Customer Service
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <section data-theme="dark" className="relative overflow-hidden bg-[#171311] px-6 pb-16 text-white md:px-10 md:pb-20">
        <div
          className="pointer-events-none absolute -left-28 -top-24 h-[430px] w-[430px] bg-contain bg-center bg-no-repeat opacity-[0.08]"
          style={{ backgroundImage: "url('/rings.png')" }}
          aria-hidden="true"
        />
        <motion.div
          {...fadeUp}
          className="relative z-10 mx-auto max-w-7xl rounded-[34px] border border-white/12 bg-white/[0.06] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-md md:p-8"
        >
          <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4c09a]">
                Our Shared Goal
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                Helping your team choose the clearest next step.
              </h2>
            </div>
            <div className="space-y-4 text-base leading-8 text-white/72 md:text-lg">
              <p>
                Every policy on this page is built around one outcome: helping your practice deliver the best possible experience to the patient. These guidelines are here to support your team, simplify decisions, and ensure consistency from order entry through delivery.
              </p>
              <p>
                When questions come up, our team will work with you to find the clearest and fairest next step.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      <section
        id="policy-search-panel"
        data-theme="light"
        className="scroll-mt-32 border-y border-[#e7ddd0] bg-[#fbf8f3] px-6 py-14 md:px-10 md:py-18"
      >
        <div className="mx-auto max-w-5xl text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
              Search the policy guide.
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-[#625b53]">
              Type the product, situation, policy area, or vendor you want to understand.
            </p>
          </motion.div>

          <motion.div
            {...fadeUp}
            className="mx-auto mt-8 max-w-4xl rounded-[34px] border border-black/10 bg-white p-4 shadow-[0_24px_70px_rgba(24,18,13,0.08)] md:p-5"
          >
            <label className="sr-only" htmlFor="policy-search">
              Search lab policies
            </label>
            <input
              id="policy-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by policy, product, redo type, warranty, vendor, or situation"
              className="min-h-16 w-full rounded-full border border-[#d8c6a8] bg-[#fbf8f3] px-5 text-base font-semibold text-[#1f1a17] outline-none transition placeholder:text-[#8a7654]/60 focus:border-[#d4c09a] focus:bg-white focus:shadow-[0_0_0_4px_rgba(212,192,154,0.18)] md:px-7"
            />
            <div className="mt-4 flex flex-col items-center justify-between gap-3 text-sm text-[#625b53] md:flex-row">
              <p>
                Try searching: AR warranty, doctor redo, VSP Unity, patient-owned frame, shipping, Chemistrie, Neurolens
              </p>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-[#8a7654]">{resultLabel}</span>
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
          </motion.div>
        </div>
      </section>

      <nav
        data-theme="light"
        aria-label="Lab policy quick navigation"
        className="sticky top-[72px] z-40 border-y border-[#e5d9c8] bg-[#f5f1eb]/94 px-5 py-3 shadow-[0_16px_38px_rgba(24,18,13,0.08)] backdrop-blur-xl md:top-[76px]"
      >
        <div className="relative mx-auto max-w-7xl">
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#f5f1eb] to-transparent" aria-hidden="true" />
          <div className="pointer-events-none absolute bottom-[-0.35rem] right-3 z-10 hidden items-center gap-1 rounded-full border border-[#d8c6a8] bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a7654] shadow-sm sm:flex">
            Scroll for more <span aria-hidden="true">v</span>
          </div>
          <div className="flex gap-2 overflow-x-auto overscroll-x-contain pb-4 pr-16 [scrollbar-gutter:stable] [scrollbar-width:thin]">
            {quickNav.map((item) => (
              <a
                key={`${item.href}-${item.label}`}
                href={item.href}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-black/10 bg-white/78 px-4 py-2 text-sm font-semibold text-[#1f1a17] shadow-sm transition hover:-translate-y-0.5 hover:border-[#d4c09a] hover:bg-[#d4c09a]"
              >
                <SiteIcon
                  src={item.icon}
                  size="sm"
                  className="h-8 w-8 rounded-xl border-[#e1d4c2] bg-[#fbf8f3]"
                  imgClassName="h-4 w-4"
                />
                {item.label}
              </a>
            ))}
          </div>
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
              These cards summarize common situations in plain language so your team can move faster before opening the full policy details.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, amount: 0.18 }}
            className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          >
            {commonQuestions.map((card) => (
              <motion.a
                key={card.title}
                href={card.href}
                variants={fadeUp}
                className="group rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(24,18,13,0.07)] transition duration-300 hover:-translate-y-1.5 hover:border-[#d4c09a] hover:shadow-[0_28px_64px_rgba(24,18,13,0.12)]"
              >
                <div className="mb-6 flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">
                    {card.label}
                  </span>
                  <span className="grid h-11 w-11 place-items-center rounded-2xl border border-[#e1d4c2] bg-[#fbf8f3] text-[#8a7654] transition group-hover:border-[#d4c09a] group-hover:bg-[#d4c09a] group-hover:text-[#171311]">
                    <SiteIcon
                      src={card.icon}
                      size="sm"
                      className="h-11 w-11 border-transparent bg-transparent"
                      imgClassName="h-5 w-5"
                    />
                  </span>
                </div>
                <h3 className="text-xl font-semibold leading-tight text-[#1f1a17]">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#625b53]">{card.body}</p>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>

      <section data-theme="light" className="relative overflow-hidden bg-[#fbf8f3] px-6 py-16 md:px-10 md:py-20">
        <RingsAccent position="top-right" size="md" opacity="opacity-[0.04]" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">
                How to Use This Page
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
                Four steps, no guesswork.
              </h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                "Search your situation or select a category.",
                "Review the policy summary.",
                "Open the section for details.",
                "Contact us if you want confirmation before submitting.",
              ].map((step, index) => (
                <div
                  key={step}
                  className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_14px_38px_rgba(24,18,13,0.05)]"
                >
                  <div className="mb-4 grid h-9 w-9 place-items-center rounded-full bg-[#d4c09a] text-sm font-semibold text-[#171311]">
                    {index + 1}
                  </div>
                  <p className="text-base font-semibold leading-7 text-[#1f1a17]">{step}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section data-theme="light" className="relative overflow-hidden px-6 py-16 md:px-10 md:py-20">
        <RingsAccent position="bottom-left" size="lg" opacity="opacity-[0.035]" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">
              Policy Sections
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Open the area that matches your situation.
            </h2>
            <p className="mt-4 text-base leading-8 text-[#625b53]">
              Each section gives the summary first, then breaks the policy into what it means, what qualifies, what does not qualify, and what to do next.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, amount: 0.08 }}
            className="mt-10 grid gap-5"
          >
            {visibleSections.map((section) => (
              <PolicyPanel
                key={section.id}
                section={section}
                isOpen={openSectionIds.includes(section.id)}
                onToggle={() => toggleSection(section.id)}
              />
            ))}
          </motion.div>

          {visibleSections.length === 0 ? (
            <div className="mt-10 rounded-[28px] border border-black/10 bg-white p-8 text-center shadow-[0_18px_54px_rgba(24,18,13,0.07)]">
              <h3 className="text-2xl font-semibold text-[#1f1a17]">No matching policy found.</h3>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#625b53]">
                Try a broader term, or contact customer service before submitting a remake, redo, warranty request, or credit review.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <section
        id="real-world-examples"
        data-theme="dark"
        className="relative scroll-mt-32 overflow-hidden bg-[#171311] px-6 py-20 text-white md:px-10 md:py-24"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(212,192,154,0.16),transparent_32%),radial-gradient(circle_at_86%_36%,rgba(255,255,255,0.08),transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl">
          <motion.div {...fadeUp} className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4c09a]">
                Real World Examples
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
                See how policies apply.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-8 text-white/70">
              These examples are meant to help your team quickly match a patient situation to the policy area that may apply.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, amount: 0.15 }}
            className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {realWorldExamples.map((example) => (
              <motion.a
                key={example.title}
                href={example.href}
                variants={fadeUp}
                className="group rounded-[28px] border border-white/12 bg-white/[0.07] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-[#d4c09a]/70 hover:bg-white/[0.1]"
              >
                <SiteIcon
                  src={example.icon}
                  tone="cream"
                  size="sm"
                  className="h-11 w-11 border-[#d4c09a]/30 bg-[#d4c09a]/12"
                  imgClassName="h-5 w-5"
                />
                <h3 className="mt-5 text-xl font-semibold leading-tight text-white">
                  {example.title}
                </h3>
                <p className="mt-4 border-t border-white/10 pt-4 text-sm leading-7 text-white/70">
                  <span className="font-semibold text-[#d4c09a]">Likely path: </span>
                  {example.result}
                </p>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>

      <section data-theme="light" className="relative overflow-hidden px-6 py-20 md:px-10 md:py-24">
        <div
          className="pointer-events-none absolute -bottom-40 right-0 h-[500px] w-[500px] bg-contain bg-center bg-no-repeat opacity-[0.06]"
          style={{ backgroundImage: "url('/rings.png')" }}
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <motion.div {...fadeUp}>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">
              Need Help?
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Still Have a Question?
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#625b53] md:text-lg">
              Our team is here to help you confirm the right next step before submitting a remake, redo, warranty request, or credit review.
            </p>
          </motion.div>
          <motion.div
            {...fadeUp}
            className="rounded-[30px] border border-black/10 bg-white p-6 shadow-[0_24px_80px_rgba(24,18,13,0.1)] md:p-8"
          >
            <h3 className="text-2xl font-semibold">Contact Customer Service</h3>
            <p className="mt-3 text-sm leading-7 text-[#625b53]">
              If a policy depends on product, vendor, specialty lab rules, or account program terms, customer service can help confirm the right path.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setContactOpen(true)}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d4c09a] px-6 py-3 text-sm font-semibold text-[#171311] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e2cca2]"
              >
                Contact Customer Service
              </button>
              <a
                href={CUSTOMER_SERVICE_MAILTO}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-black/10 bg-[#fbf8f3] px-6 py-3 text-sm font-semibold text-[#1f1a17] transition hover:-translate-y-0.5 hover:border-[#d4c09a] hover:bg-white"
              >
                Email Our Team
              </a>
            </div>
            <p className="mt-6 border-t border-black/10 pt-5 text-xs leading-6 text-[#625b53]">
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
