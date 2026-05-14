import Link from "next/link";
import { getAuthenticatedEmailFromHeaders } from "@/lib/portal/auth";
import {
  customerHasPortalSection,
  getCustomerByEmail,
  type PortalCustomer,
  type PortalSection,
} from "@/lib/portal/customers";
import { getPriceListByCode, type PortalPriceList } from "@/lib/portal/priceLists";

const PORTAL_ACCESS_LOGIN_URL =
  "https://artisanslabs.com/portal";
const PORTAL_ACCESS_LOGOUT_URL =
  "/cdn-cgi/access/logout?returnTo=%2Fportal";

function PortalShell({
  children,
  eyebrow = "Customer Portal",
}: {
  children: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <main className="min-h-screen bg-[#f4efe6] text-[#172a28]">
      <section className="relative isolate overflow-hidden px-5 py-10 sm:px-8 lg:px-10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_12%,rgba(47,89,98,0.16),transparent_34%),linear-gradient(135deg,#f7f2e9_0%,#efe6d8_55%,#dfe9e8_100%)]" />
        <div className="absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgba(23,42,40,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(23,42,40,0.55)_1px,transparent_1px)] [background-size:42px_42px]" />

        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-center">
          <Link
            href="/"
            className="mb-14 inline-flex w-fit items-center text-xs font-semibold uppercase tracking-[0.32em] text-[#6f5f3f] transition hover:text-[#172a28]"
          >
            Artisan Lab Network
          </Link>

          <div className="mb-5 h-px w-24 bg-[#b89a61]" />
          <h1 className="mb-5 text-3xl font-semibold tracking-[-0.03em] text-[#172a28] sm:text-4xl">
            Artisan Lab Network Customer Portal
          </h1>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.32em] text-[#7c6b48]">
            {eyebrow}
          </p>
          {children}
        </div>
      </section>
    </main>
  );
}

function PortalMessage({
  message,
  showLoginLink = false,
}: {
  message: string;
  showLoginLink?: boolean;
}) {
  return (
    <PortalShell>
      <div className="max-w-2xl rounded-[2px] border border-[#d9c9aa] bg-[#fffaf1]/82 p-8 shadow-[0_24px_80px_rgba(23,42,40,0.12)] backdrop-blur">
        <h1 className="mb-5 text-4xl font-semibold tracking-[-0.03em] text-[#172a28] sm:text-5xl">
          Secure portal access
        </h1>
        <p className="text-lg leading-8 text-[#5d5548]">{message}</p>
        {showLoginLink ? (
          <a
            href={PORTAL_ACCESS_LOGIN_URL}
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-[#172a28] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#27433f]"
          >
            Sign in through secure access
          </a>
        ) : null}
      </div>
    </PortalShell>
  );
}

function PriceListCard({ priceList }: { priceList: PortalPriceList }) {
  return (
    <div className="group flex flex-col justify-between gap-5 border-t border-[#d8c49b] py-6 sm:flex-row sm:items-center">
      <div>
        <p className="text-2xl font-semibold tracking-[-0.02em] text-[#172a28]">
          {priceList.label}
        </p>
        <p className="mt-2 text-sm text-[#706759]">{priceList.fileName}</p>
      </div>
      <div className="flex flex-col gap-3 sm:items-end">
        {priceList.r2Key ? (
          <a
            href={`/api/portal/download?code=${encodeURIComponent(priceList.code)}`}
            className="inline-flex w-fit items-center justify-center rounded-full bg-[#172a28] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#27433f]"
          >
            Download {priceList.code} PDF
          </a>
        ) : null}
        {priceList.onlineUrl ? (
          <Link
            href={priceList.onlineUrl}
            className="inline-flex w-fit items-center justify-center rounded-full border border-[#d8c49b] bg-[#fffaf1] px-6 py-3 text-sm font-semibold text-[#172a28] transition hover:bg-white"
          >
            View {priceList.code} Online Pricing
          </Link>
        ) : null}
      </div>
    </div>
  );
}

type PortalSectionCard = {
  section: PortalSection;
  title: string;
  body: string;
  href: string;
  cta: string;
  requiresPriceList?: string;
};

const portalSectionCards: PortalSectionCard[] = [
  {
    section: "packages",
    title: "Package Pricing",
    body: "View IOT Lens System package pricing and package quote tools.",
    href: "/portal/price-list/packages",
    cta: "Open Packages",
    requiresPriceList: "B5",
  },
  {
    section: "calculator",
    title: "Quote Builder",
    body: "Build an estimated lab price from assigned online pricing.",
    href: "/portal/price-list/calculator",
    cta: "Open Calculator",
    requiresPriceList: "G6",
  },
  {
    section: "catalog",
    title: "Catalog",
    body: "Browse pricing by brand, product family, and AR compatibility.",
    href: "/portal/price-list/catalog",
    cta: "Open Catalog",
    requiresPriceList: "G6",
  },
  {
    section: "policies",
    title: "Artisan Policies",
    body: "Review warranties, remakes, shipping, frame handling, and support policies.",
    href: "/portal/price-list/policies",
    cta: "Open Policies",
  },
  {
    section: "exports",
    title: "Pricing Exports",
    body: "Use the G6 pricing page export tools for filtered PDF exports.",
    href: "/portal/price-list/g6",
    cta: "Open G6 Pricing",
    requiresPriceList: "G6",
  },
];

function visiblePortalSectionCards(customer: PortalCustomer) {
  const assignedCodes = new Set(customer.priceLists.map((code) => code.toUpperCase()));

  return portalSectionCards.filter((card) => {
    if (!customerHasPortalSection(customer, card.section)) return false;
    if (!card.requiresPriceList) return true;

    return assignedCodes.has(card.requiresPriceList);
  });
}

function PortalResourceCard({ card }: { card: PortalSectionCard }) {
  return (
    <Link
      href={card.href}
      className="group block border-t border-[#d8c49b] py-5 transition hover:border-[#172a28]"
    >
      <p className="text-xl font-semibold tracking-[-0.02em] text-[#172a28]">
        {card.title}
      </p>
      <p className="mt-2 text-sm leading-6 text-[#706759]">{card.body}</p>
      <span className="mt-4 inline-flex text-sm font-semibold text-[#172a28] underline decoration-[#d8c49b] underline-offset-4 transition group-hover:decoration-[#172a28]">
        {card.cta}
      </span>
    </Link>
  );
}

function PortalHelpSection() {
  return (
    <section className="mt-10 border-t border-[#d8c49b] pt-6">
      <h2 className="text-xl font-semibold tracking-[-0.02em] text-[#172a28]">
        Help and sign out
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#706759]">
        Need help with portal access or assigned price sheets? Contact Artisan Lab
        Network and include your practice name and account number.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <a
          href="mailto:info@artisanlabnetwork.com?subject=Customer%20Portal%20Help"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d8c49b] bg-[#fffaf1] px-5 py-2 text-sm font-semibold text-[#172a28] transition hover:bg-white"
        >
          Get portal help
        </a>
        <a
          href={PORTAL_ACCESS_LOGOUT_URL}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#172a28]/20 bg-transparent px-5 py-2 text-sm font-semibold text-[#172a28] transition hover:bg-[#172a28] hover:text-white"
        >
          Sign out
        </a>
      </div>
    </section>
  );
}

export default function PortalDashboard({ headerList }: { headerList: Headers }) {
  const authenticatedEmail = getAuthenticatedEmailFromHeaders(headerList);

  if (!authenticatedEmail) {
    return (
      <PortalMessage
        message="Unable to verify your secure login. Please sign in through the protected portal."
        showLoginLink
      />
    );
  }

  const customer = getCustomerByEmail(authenticatedEmail);

  if (!customer) {
    return (
      <PortalMessage message="Your login was verified, but your account has not yet been assigned portal access. Please contact Artisan Lab Network." />
    );
  }

  const availablePriceLists = customer.priceLists
    .map(getPriceListByCode)
    .filter((priceList): priceList is PortalPriceList => Boolean(priceList));
  const availablePortalSections = visiblePortalSectionCards(customer);

  return (
    <PortalShell eyebrow="Verified Customer Portal">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <h1 className="text-5xl font-semibold tracking-[-0.045em] text-[#172a28] sm:text-6xl lg:text-7xl">
            Welcome,
            <br />
            {customer.practiceName}
          </h1>
          <div className="mt-8 space-y-3 text-base leading-7 text-[#5b5245]">
            <p>
              <span className="font-semibold text-[#172a28]">Account Number:</span>{" "}
              {customer.accountNumber}
            </p>
            <p>
              <span className="font-semibold text-[#172a28]">Logged in as:</span>{" "}
              {authenticatedEmail}
            </p>
          </div>
        </div>

        <section className="border border-[#d8c49b] bg-[#fffaf1]/86 p-6 shadow-[0_24px_90px_rgba(23,42,40,0.13)] backdrop-blur sm:p-9">
          <div className="mb-6 flex flex-col gap-3 border-b border-[#d8c49b] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b7650]">
                Secure Downloads
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#172a28]">
                Your Available Price Sheets
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-[#706759]">
              Files are assigned by account and served through the secure portal only.
            </p>
          </div>

          {availablePriceLists.length > 0 ? (
            <div>
              {availablePriceLists.map((priceList) => (
                <PriceListCard key={priceList.code} priceList={priceList} />
              ))}
            </div>
          ) : (
            <p className="border-t border-[#d8c49b] py-6 text-[#5b5245]">
              No price sheets have been assigned to this account yet.
            </p>
          )}

          <PortalHelpSection />
        </section>

        {availablePortalSections.length > 0 ? (
          <section className="border border-[#d8c49b] bg-[#fffaf1]/86 p-6 shadow-[0_24px_90px_rgba(23,42,40,0.13)] backdrop-blur sm:p-9 lg:col-start-2">
            <div className="mb-6 border-b border-[#d8c49b] pb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b7650]">
                Assigned Tools
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#172a28]">
                Your Portal Sections
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#706759]">
                These sections are available based on your account permissions.
              </p>
            </div>
            <div>
              {availablePortalSections.map((card) => (
                <PortalResourceCard key={card.title} card={card} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </PortalShell>
  );
}
