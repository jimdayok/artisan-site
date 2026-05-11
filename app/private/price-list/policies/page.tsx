import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  BadgeCheck,
  ClipboardList,
  FileText,
  Handshake,
  PackageCheck,
  RefreshCcw,
  ShieldCheck,
  Truck,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

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
    id: "ar-policies",
    title: "AR Policies",
    icon: ShieldCheck,
    summary: "Warranty support for AR treatments, including brand-specific warranty terms.",
    body: ["We do not require lenses to be returned for AR treatment warranty usage."],
    terms: [
      { label: "Artisan AR Technologies, excluding Standard AR", value: "2 years, 2 times" },
      { label: "Artisan Standard and Backside AR", value: "1 year, 1 time" },
      { label: "TechShield AR Technologies", value: "2 years, 2 times" },
      { label: "Tokai AR Technologies", value: "2 years, 2 times" },
      { label: "Crizal AR Technologies", value: "2 years, 2 times" },
      { label: "Shamir AR Technologies", value: "2 years, 2 times" },
      { label: "Hoya AR Technologies", value: "2 years, 2 times" },
    ],
  },
  {
    id: "scratch-coating-policies",
    title: "Scratch Coating Policies",
    icon: BadgeCheck,
    summary: "Scratch coating warranty terms for factory and Diamond Defense coating support.",
    body: ["We do not require lenses to be returned for scratch coating warranty usage."],
    terms: [
      { label: "Factory Scratch Coat", value: "1 year, 1 time" },
      { label: "Diamond Defense Scratch Coat", value: "2 years, 2 times" },
    ],
  },
  {
    id: "doctor-redo-non-adapt",
    title: "Doctor Redo and Non Adapt Changes",
    icon: RefreshCcw,
    summary: "Guidance for patient non-adaptable elements and doctor-requested changes.",
    body: [
      "Requests for changes to design, power, PD, frame, segment height, or any other patient non adaptable elements within the first year will be accommodated 1 time at no charge.",
      "If a lens remake involves upgrading to a higher priced product, the original invoice will be credited, and the new, higher priced lens order will be invoiced when the remake is shipped.",
    ],
  },
  {
    id: "lab-error-remake-process",
    title: "Lab Error Remake Process",
    icon: Wrench,
    summary: "How lab error remake requests are reviewed and processed.",
    body: [
      "All remakes due to lab error will be processed at no charge with valid reason or reasons if received within 30 days from the date the order was shipped.",
      "If, upon evaluation, the remake request is not valid, the customer's 1 time redo will be used.",
      "Lenses are required to be returned for inspection and quality control when requested.",
    ],
  },
  {
    id: "frame-policies",
    title: "Frame Policies",
    icon: Wrench,
    summary: "Frame manifest, suitability, patient-owned frame, and replacement guidance.",
    body: [
      "Frames will only be replaced if accompanied by a frame manifest, available on the Artisan Lab Network Practice Resources page.",
      "PAL may reject frames prone to damage or unsuitable for the Rx and lens order.",
      "Patient owned frames are processed at the practice's risk. PAL is not liable for breakage during handling or processing.",
      "If an order is more than 30 days old, patient owned frame policies apply. This means these frames are not warranted or guaranteed by the lab. If the frame breaks during processing, the practice is responsible for replacing it.",
    ],
  },
  {
    id: "shipping-policies",
    title: "Shipping Policies",
    icon: Truck,
    summary: "Outbound and inbound shipping guidance for Artisan lab orders.",
    body: [
      "Option 1: Outbound per job shipping fee: $4.",
      "Option 2: Outbound per box shipping fee: $16.",
      "Inbound shipping is provided complimentary.",
      "The method of shipping is determined by PAL with the intention to deliver outbound shipments next day, volume dependent.",
    ],
  },
  {
    id: "canceled-orders",
    title: "Canceled Orders",
    icon: AlertTriangle,
    summary: "How charges apply when an order is canceled before or after production begins.",
    body: [
      "Canceled orders that have already started will be charged as an uncut.",
      "Canceled orders that have not been started will not be charged.",
    ],
  },
  {
    id: "multiple-pair-program",
    title: "Multiple Pair Program: Pair Up with PAL",
    icon: PackageCheck,
    summary: "Discount guidance for eligible additional lens pairs.",
    body: [
      "Additional pairs purchased within 30 days of the original pair are eligible for a 50% discount on the lesser priced invoice. There are no limits to the number of additional lens pairs eligible for the multiple pair discount program.",
      "Each pair must include one of the following: AR Treatment or Polarization.",
    ],
  },
  {
    id: "account-portal-use",
    title: "Account and Portal Use",
    icon: Users,
    summary: "Authorized access, credential responsibility, and partner resource use.",
    body: [
      "Pricing, policy tools, and private partner resources are intended for authorized Artisan Lab Network partners only.",
      "Customers are responsible for protecting their login credentials and keeping confidential pricing information inside their practice.",
    ],
  },
  {
    id: "confidential-pricing",
    title: "Confidential Pricing",
    icon: FileText,
    summary: "Private pricing and customer-specific terms must stay inside the authorized practice team.",
    body: [
      "Price lists, program pricing, partner terms, and customer specific pricing are confidential and should not be shared outside the authorized practice team.",
    ],
  },
  {
    id: "warranty-redo-guidelines",
    title: "Warranty and Redo Guidelines",
    icon: ShieldCheck,
    summary: "Fair-use guidance for warranty and redo support.",
    body: [
      "Warranty and redo support is designed to help practices serve patients well while protecting fair use of lab resources.",
      "Warranty terms may vary by product, coating, vendor, material, or program.",
    ],
  },
  {
    id: "returned-lens-requirements",
    title: "Returned Lens Requirements",
    icon: ClipboardList,
    summary: "When lenses may or may not need to be returned for warranty or remake review.",
    body: [
      "Some warranty claims do not require returned lenses, including AR and scratch coating warranty usage as stated above.",
      "Lab error remake evaluation may require returned lenses for inspection and quality control.",
    ],
  },
  {
    id: "patient-owned-frame-risk",
    title: "Patient Owned Frame Risk",
    icon: AlertTriangle,
    summary: "Practice responsibility for patient-owned frame handling risk.",
    body: [
      "Patient owned frames are processed at the practice's risk. The lab is not liable for breakage during handling or processing.",
      "Practices should review patient-owned frame condition and suitability before sending orders to the lab.",
    ],
  },
  {
    id: "outsourced-specialty-orders",
    title: "Outsourced or Specialty Orders",
    icon: Wrench,
    summary: "Special handling guidance for out-of-range, specialty, vendor-required, or outsourced work.",
    body: [
      "Some specialty, out of range, or vendor required orders may follow separate manufacturer or subcontractor policies.",
      "When special handling applies, the practice should be notified when possible before the order is completed.",
    ],
  },
  {
    id: "program-eligibility",
    title: "Program Eligibility",
    icon: Handshake,
    summary: "Eligibility guidance for promotions, discounts, and partner programs.",
    body: [
      "Promotions, discounts, multiple pair benefits, and partner programs may be subject to eligibility rules, product requirements, timing rules, and account standing.",
    ],
  },
  {
    id: "contact-support",
    title: "Contact and Support",
    icon: Users,
    summary: "Where practices should go for policy questions and customer service support.",
    body: [
      "For questions about policies, practices should contact customer service or their Artisan Lab Network representative.",
      "Customer service contacts are available on the Provider Resources page.",
    ],
  },
];

export default function ArtisanPoliciesPage() {
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
          </div>
        </div>
      </section>

      <section className="border-b border-[#dfd2bf] bg-[#fbf8f3] px-5 py-6 md:px-10">
        <nav aria-label="Policy categories" className="mx-auto flex max-w-7xl gap-2 overflow-x-auto pb-1">
          {policySections.map((section) => (
            <a key={section.id} href={`#${section.id}`} className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-[#dfd2bf] bg-white px-4 text-sm font-semibold text-[#122033] transition hover:border-[#c9b28b] hover:bg-[#eadcc6]">
              {section.title}
            </a>
          ))}
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
    <section id={section.id} className={`scroll-mt-24 rounded-[2rem] border bg-white/90 p-5 shadow-[0_18px_48px_rgba(18,32,51,0.08)] md:p-6 ${featured ? "border-[#d6bd84] ring-1 ring-[#f2dfad]" : "border-[#dfd2bf]"}`}>
      <div className="flex items-start gap-4">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${featured ? "bg-[#122033] text-[#d4c09a]" : "bg-[#fbf8f3] text-[#8a7654]"}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#122033]">{section.title}</h2>
          <p className="mt-2 text-sm leading-6 text-[#5f6570]">{section.summary}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {section.body.map((line) => (
          <p key={line} className="rounded-2xl border border-[#eadfce] bg-[#fbf8f3] px-4 py-3 text-sm leading-7 text-[#4d5664]">
            {line}
          </p>
        ))}
      </div>

      {section.terms ? (
        <div className="mt-5 overflow-hidden rounded-2xl border border-[#eadfce]">
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
