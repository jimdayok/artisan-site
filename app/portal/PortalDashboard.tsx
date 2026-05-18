import Link from "next/link";
import { isPortalAdminEmail } from "@/lib/portal/admin";
import { getPortalAuthenticatedEmailFromHeaders } from "@/lib/portal/auth";
import {
  customerHasPortalSection,
  getCustomerByEmail,
  type PortalCustomer,
  type PortalSection,
} from "@/lib/portal/customers";
import { getPriceListByCode, type PortalPriceList } from "@/lib/portal/priceLists";
import {
  getPortalWorkbookProfileByEmail,
  profileHasSequelRebateInvitation,
  type PortalWorkbookProfile,
  type PortalWorkbookAccount,
} from "@/lib/portal/workbookAccountData";

const PORTAL_ACCESS_LOGIN_URL =
  "https://artisanslabs.com/portal";
const PORTAL_ACCESS_LOGOUT_URL =
  "/cdn-cgi/access/logout?returnTo=%2Fportal";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-US");

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function formatPortalDate(value: string) {
  if (!value) return "Not available";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

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
    section: "performance",
    title: "Performance Review",
    body: "Review monthly lens pairs, sales mix, premium adoption, and remake activity.",
    href: "/portal/performance",
    cta: "Open Performance",
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

function SequelRewardsInvitationCard() {
  return (
    <section className="border border-[#d8c49b] bg-[#fffaf1]/90 p-6 shadow-[0_24px_90px_rgba(23,42,40,0.13)] backdrop-blur sm:p-9 lg:col-span-2">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b7650]">
        Invitation Program
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#172a28]">
        You&apos;ve Been Invited: Sequel Artisan Rewards
      </h2>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-[#706759]">
        Your practice has been invited to participate in the Sequel Artisan
        Rewards program. Learn how the program works and how your practice can
        qualify for rewards.
      </p>
      <Link
        href="/programs/sequel-arSQL26"
        className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[#172a28] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#27433f]"
      >
        Learn About Sequel Artisan Rewards
      </Link>
    </section>
  );
}

function AccountStatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#d8c49b] bg-[#fffaf1] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b7650]">
        {label}
      </p>
      <p className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#172a28]">
        {value}
      </p>
    </div>
  );
}

function UsageRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-5 border-t border-[#d8c49b] py-4 text-sm">
      <span className="font-semibold text-[#172a28]">{label}</span>
      <span className="text-[#706759]">{value || "Not available"}</span>
    </div>
  );
}

function AccountPerformanceSection({
  account,
}: {
  account: PortalWorkbookAccount;
}) {
  return (
    <section className="border border-[#d8c49b] bg-[#fffaf1]/86 p-6 shadow-[0_24px_90px_rgba(23,42,40,0.13)] backdrop-blur sm:p-9 lg:col-span-2">
      <div className="mb-7 border-b border-[#d8c49b] pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b7650]">
          Account Performance
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#172a28]">
          {account.accountName}
        </h2>
        <div className="mt-5 grid gap-3 text-sm leading-6 text-[#706759] sm:grid-cols-2 lg:grid-cols-4">
          <p>
            <span className="font-semibold text-[#172a28]">Account:</span>{" "}
            {account.accountNumber}
          </p>
          <p>
            <span className="font-semibold text-[#172a28]">Division:</span>{" "}
            {account.division || "Not available"}
          </p>
          <p>
            <span className="font-semibold text-[#172a28]">Sales Rep:</span>{" "}
            {account.salesRep || "Not available"}
          </p>
          <p>
            <span className="font-semibold text-[#172a28]">Last Shipped:</span>{" "}
            {formatPortalDate(account.lastShippedDate)}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <AccountStatCard label="CM Sales" value={formatCurrency(account.cmSales)} />
        <AccountStatCard label="PM Sales" value={formatCurrency(account.pmSales)} />
        <AccountStatCard label="CM Jobs" value={formatNumber(account.cmJobs)} />
        <AccountStatCard label="PM Jobs" value={formatNumber(account.pmJobs)} />
        <AccountStatCard
          label="Last Shipped"
          value={formatPortalDate(account.lastShippedDate)}
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-xl font-semibold tracking-[-0.02em] text-[#172a28]">
            Monthly Activity
          </h3>
          <div className="mt-4">
            <UsageRow label="Current Month Jobs" value={formatNumber(account.cmJobs)} />
            <UsageRow
              label="Current Month Sales"
              value={formatCurrency(account.cmSales)}
            />
            <UsageRow label="Previous Month Jobs" value={formatNumber(account.pmJobs)} />
            <UsageRow
              label="Previous Month Sales"
              value={formatCurrency(account.pmSales)}
            />
            <UsageRow
              label="Prior Previous Month Jobs"
              value={formatNumber(account.ppmJobs)}
            />
            <UsageRow
              label="Prior Previous Month Sales"
              value={formatCurrency(account.ppmSales)}
            />
            <UsageRow label="CM NL Jobs" value={formatNumber(account.cmNlJobs)} />
            <UsageRow label="CM VSP Jobs" value={formatNumber(account.cmVspJobs)} />
            <UsageRow label="CM SQL Jobs" value={formatNumber(account.cmSqlJobs)} />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold tracking-[-0.02em] text-[#172a28]">
            Product and Program Usage
          </h3>
          <div className="mt-4">
            <UsageRow label="Modern Package Usage" value={account.modernPkgUsage} />
            <UsageRow label="Modern Frame Usage" value={account.modernFrmUsage} />
            <UsageRow label="ChemClip Usage" value={account.chemClipUsage} />
            <UsageRow label="SpecCheck Usage" value={account.specCheckUsage} />
            <UsageRow label="Tokai Usage" value={account.tokaiUsage} />
            <UsageRow label="Primary PAL Private Pay" value={account.primaryPalPrivatePay} />
            <UsageRow label="Primary PAL VSP" value={account.primaryPalVsp} />
            <UsageRow label="Last Lab" value={account.lastLabName} />
          </div>
        </div>
      </div>
    </section>
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

export function PortalDashboardContent({
  authenticatedEmail,
  customer,
  workbookProfile,
  adminPreviewAccountName,
}: {
  authenticatedEmail: string;
  customer?: PortalCustomer;
  workbookProfile?: PortalWorkbookProfile;
  adminPreviewAccountName?: string;
}) {
  if (!customer && !workbookProfile) {
    return (
      <PortalMessage message="Your login was verified, but your account has not yet been assigned portal access. Please contact Artisan Lab Network." />
    );
  }

  const availablePriceLists = (customer?.priceLists ?? [])
    .map(getPriceListByCode)
    .filter((priceList): priceList is PortalPriceList => Boolean(priceList));
  const availablePortalSections = customer ? visiblePortalSectionCards(customer) : [];
  const account = workbookProfile?.account;
  const practiceName =
    account?.accountName ||
    workbookProfile?.person.organization ||
    customer?.practiceName ||
    "Customer";
  const accountNumber =
    account?.accountNumber ||
    workbookProfile?.person.accountNumber ||
    customer?.accountNumber ||
    "";
  const hasSequelRebateInvitation =
    profileHasSequelRebateInvitation(workbookProfile);

  return (
    <PortalShell eyebrow="Verified Customer Portal">
      {adminPreviewAccountName ? (
        <div className="mb-8 border border-[#b89a61] bg-[#172a28] px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(23,42,40,0.16)]">
          Admin preview mode. You are viewing this portal as{" "}
          {adminPreviewAccountName}.
        </div>
      ) : null}

      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <h1 className="text-5xl font-semibold tracking-[-0.045em] text-[#172a28] sm:text-6xl lg:text-7xl">
            Welcome,
            <br />
            {practiceName}
          </h1>
          <div className="mt-8 space-y-3 text-base leading-7 text-[#5b5245]">
            {accountNumber ? (
              <p>
                <span className="font-semibold text-[#172a28]">Account Number:</span>{" "}
                {accountNumber}
              </p>
            ) : null}
            <p>
              <span className="font-semibold text-[#172a28]">Logged in as:</span>{" "}
              {authenticatedEmail}
            </p>
          </div>
          {isPortalAdminEmail(authenticatedEmail) && !adminPreviewAccountName ? (
            <Link
              href="/portal/admin"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-[#d8c49b] bg-[#fffaf1] px-5 py-2 text-sm font-semibold text-[#172a28] transition hover:bg-white"
            >
              Admin Portal
            </Link>
          ) : null}
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

        {hasSequelRebateInvitation ? <SequelRewardsInvitationCard /> : null}

        {account ? <AccountPerformanceSection account={account} /> : null}
      </div>
    </PortalShell>
  );
}

export default function PortalDashboard({ headerList }: { headerList: Headers }) {
  const authenticatedEmail = getPortalAuthenticatedEmailFromHeaders(headerList);

  if (!authenticatedEmail) {
    return (
      <PortalMessage
        message="Unable to verify your secure login. Please sign in through the protected portal."
        showLoginLink
      />
    );
  }

  return (
    <PortalDashboardContent
      authenticatedEmail={authenticatedEmail}
      customer={getCustomerByEmail(authenticatedEmail)}
      workbookProfile={getPortalWorkbookProfileByEmail(authenticatedEmail)}
    />
  );
}
