import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import {
  FileText,
  Handshake,
  PackageCheck,
  RefreshCcw,
  ShieldCheck,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { getPortalAuthenticatedEmailFromHeaders } from "@/lib/portal/auth";
import {
  customerHasPortalSection,
} from "@/lib/portal/customers";
import { getAuthorizedPortalCustomer } from "@/lib/portal/portalAuthorization";
import PriceListAccessMessage from "../PriceListAccessMessage";

export const metadata: Metadata = {
  title: "Artisan Policies | Artisan Lab Network",
  description: "Official policy guide for Artisan Lab Network partners.",
};

type PolicySection = {
  id: string;
  title: string;
  icon: LucideIcon;
  summary: string;
  body: string[];
  terms?: Array<{ label: string; value: string }>;
};

const policySections: PolicySection[] = [
  {
    id: "ar-and-scratch-warranties",
    title: "AR and Scratch Warranties",
    icon: ShieldCheck,
    summary: "Coverage terms for Artisan coatings, premium AR options, and scratch warranties.",
    body: [
      "Covered AR and scratch warranty claims do not require lenses to be returned before the warranty is used.",
      "Vendor-specific programs may still carry separate return, credit, or documentation requirements.",
    ],
    terms: [
      { label: "Artisan Standard (AST)", value: "1 year, 1 time" },
      {
        label: "Artisan premium AR treatments: Azure, Nyoptia, Emerald, Armour, Diamond Sun",
        value: "2 years, 2 times",
      },
      { label: "TechShield AR Technologies", value: "2 years, 2 times" },
      { label: "Tokai AR Technologies", value: "2 years, 2 times" },
      { label: "Crizal AR Technologies", value: "2 years, 2 times" },
      { label: "Shamir AR Technologies", value: "2 years, 2 times" },
      { label: "Hoya AR Technologies", value: "2 years, 2 times" },
      { label: "Factory Scratch Coat", value: "1 year, 1 time" },
      { label: "Diamond Defence (DDE)", value: "2 years, 2 times" },
    ],
  },
  {
    id: "doctor-remake-non-adapt",
    title: "Doctor Redos and Non-Adapt Changes",
    icon: RefreshCcw,
    summary: "How patient-driven changes and doctor redos are handled after the original order ships.",
    body: [
      "Requests for changes to design, power, PD, prism, frame, segment height, or any other patient non-adaptable elements within the first year are accommodated 1 time at no charge.",
      "If a lens remake involves upgrading to a higher priced product, the original invoice will be credited, and the new, higher priced lens order will be invoiced when the remake is shipped.",
      "Submit the remake with the updated order details, the patient initials, and the reason for the change.",
    ],
  },
  {
    id: "lab-error-remake-process",
    title: "Lab Error Remake Process",
    icon: Wrench,
    summary: "How lab error remake requests are reviewed and processed.",
    body: [
      "All remakes due to lab error will be processed at no charge with valid reason or reasons if received within 30 days from the date the order was shipped.",
      "If, upon evaluation, the remake request is not valid, the customer's 1 time remake will be used.",
      "Returned lenses are required for inspection and quality control when the lab requests them.",
    ],
  },
  {
    id: "patient-owned-frame-policies",
    title: "Frame and Patient-Owned Frame Policies",
    icon: Wrench,
    summary: "Frame manifest, frame suitability, and patient-owned frame responsibility rules.",
    body: [
      "Frames will only be replaced if accompanied by a frame manifest, available on the Artisan Lab Network Practice Resources page.",
      "PAL may reject frames prone to damage or unsuitable for the Rx and lens order.",
      "Patient owned frames are processed at the practice's risk. PAL is not liable for breakage during handling or processing.",
      "If an order is more than 30 days old, patient owned frame policies apply. This means these frames are not warranted or guaranteed by the lab. If the frame breaks during processing, the practice is responsible for replacing it.",
    ],
  },
  {
    id: "multiple-pair-program",
    title: "Multiple Pair and Second Pair Discounts",
    icon: PackageCheck,
    summary: "Discount guidance for eligible additional lens pairs ordered soon after the original pair.",
    body: [
      "Additional pairs purchased within 30 days of the original pair are eligible for a 50% discount on the lesser priced invoice. There are no limits to the number of additional lens pairs eligible for the multiple pair discount program.",
      "Each pair must include one of the following: AR Treatment or Polarization.",
      "Neurolens, Chem Clips, and some specialty work may follow separate rules or be excluded.",
    ],
  },
  {
    id: "shipping-and-cancellations",
    title: "Shipping and Cancellations",
    icon: Truck,
    summary: "Outbound shipping rates, inbound shipping, and cancellation billing rules.",
    body: [
      "Next Day Air: $4 per job. 2 Day Shipping: $16 per box. Inbound shipping is complimentary.",
      "The outbound shipping method is determined by the lab based on order flow, volume, and delivery needs.",
      "Canceled orders that have already started will be charged as an uncut. Canceled orders that have not been started will not be charged.",
    ],
  },
  {
    id: "vendor-and-specialty-policies",
    title: "Vendor, VSP, and Specialty Order Policies",
    icon: Handshake,
    summary: "When outside manufacturers, Unity/VSP, or specialty labs control parts of the policy.",
    body: [
      "Unity VSP doctor redos are handled within the available coverage window, and non-adapt reimbursements may require a new VSP authorization.",
      "Some specialty, outsourced, out-of-range, or vendor-directed orders may follow separate manufacturer or subcontractor policies.",
      "Manufacturer credits and refunds may require returned lenses even when standard Artisan AR claims do not.",
    ],
  },
  {
    id: "support-and-confidentiality",
    title: "Support and Confidentiality",
    icon: FileText,
    summary: "How private pricing and policy tools should be handled inside each authorized practice.",
    body: [
      "Price lists, program pricing, partner terms, and customer specific pricing are confidential and should not be shared outside the authorized practice team.",
      "For questions about policies, practices should contact customer service or their Artisan Lab Network representative.",
      "Customer service contacts are available on the Provider Resources page.",
    ],
  },
];

export default async function ArtisanPoliciesPage() {
  const authenticatedEmail = getPortalAuthenticatedEmailFromHeaders(await headers());
  const customer = authenticatedEmail
    ? await getAuthorizedPortalCustomer(authenticatedEmail)
    : undefined;

  if (!authenticatedEmail) {
    return (
      <PriceListAccessMessage message="Unable to verify your secure login. Please sign in through the protected customer portal." />
    );
  }

  if (!customer || !customerHasPortalSection(customer, "policies")) {
    return (
      <PriceListAccessMessage message="You do not have access to this private resource." />
    );
  }

  return (
    <main className="min-h-screen bg-[#f4eee4] text-[#122033]">
      <section data-theme="dark" className="relative isolate overflow-hidden bg-[#111d2c] px-5 pb-16 pt-28 text-white md:px-10 md:pb-20 md:pt-36">
        <div className="pointer-events-none absolute -left-24 top-10 -z-10 h-80 w-80 rounded-full border border-[#d4c09a]/20" />
        <div className="pointer-events-none absolute right-[-8rem] top-20 -z-10 h-[28rem] w-[28rem] rounded-full border border-white/10" />
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_20%,rgba(212,192,154,0.14),transparent_32%),linear-gradient(135deg,#111d2c_0%,#171311_100%)]" />
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d4c09a]">Official Artisan Policies</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">Artisan Policies</h1>
          <p className="mt-6 max-w-2xl text-xl leading-9 text-white/74">Official policy guide for Artisan Lab Network partners.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/provider-resources#lab-customer-service" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d4c09a] px-6 text-sm font-semibold text-[#171311] transition hover:-translate-y-0.5 hover:bg-[#e2cca2]">
              Customer Service Contacts
            </Link>
            <Link href="/provider-resources" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/18 bg-white/10 px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/16">
              Provider Resources
            </Link>
            <a href="/files/artisan-policies-guide.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d4c09a]/55 bg-white/10 px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-[#d4c09a] hover:bg-[#d4c09a] hover:text-[#171311]">
              Download PDF Policies Guide
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-[#dfd2bf] bg-[#fbf8f3] px-5 py-6 md:px-10">
        <nav aria-label="Policy categories" className="relative mx-auto max-w-7xl">
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-[#fbf8f3] to-transparent" aria-hidden="true" />
          <div className="flex gap-2 overflow-x-auto overscroll-x-contain pb-4 pr-14 [scrollbar-gutter:stable] [scrollbar-width:thin]">
            {policySections.map((section) => (
              <a key={section.id} href={`#${section.id}`} className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-[#dfd2bf] bg-white px-4 text-sm font-semibold text-[#122033] transition hover:border-[#c9b28b] hover:bg-[#eadcc6]">
                {section.title}
              </a>
            ))}
          </div>
        </nav>
      </section>

      <section className="px-5 py-16 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-2">
          {policySections.map((section, index) => (
            <PolicyCard key={section.id} section={section} featured={index < 2} />
          ))}
        </div>
      </section>
    </main>
  );
}

function PolicyCard({ section, featured }: { section: PolicySection; featured?: boolean }) {
  const Icon = section.icon;

  return (
    <section id={section.id} className={`scroll-mt-24 rounded-[12px] border bg-white/90 p-5 shadow-[0_18px_48px_rgba(18,32,51,0.08)] md:p-6 ${featured ? "border-[#d6bd84] ring-1 ring-[#f2dfad]" : "border-[#dfd2bf]"}`}>
      <div className="flex items-start gap-4">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-[10px] ${featured ? "bg-[#122033] text-[#d4c09a]" : "bg-[#fbf8f3] text-[#8a7654]"}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#122033]">{section.title}</h2>
          <p className="mt-2 text-sm leading-6 text-[#5f6570]">{section.summary}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {section.body.map((line) => (
          <p key={line} className="rounded-[10px] border border-[#eadfce] bg-[#fbf8f3] px-4 py-3 text-sm leading-7 text-[#4d5664]">
            {line}
          </p>
        ))}
      </div>

      {section.terms ? (
        <div className="mt-5 overflow-hidden rounded-[10px] border border-[#eadfce]">
          {section.terms.map((term) => (
            <div key={term.label} className="grid gap-2 border-b border-[#eadfce] bg-white px-4 py-3 text-sm last:border-b-0 sm:grid-cols-[1fr_auto] sm:items-center">
              <span className="font-semibold text-[#122033]">{term.label}</span>
              <span className="rounded-full bg-[#f4eee4] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#8a7654]">{term.value}</span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
