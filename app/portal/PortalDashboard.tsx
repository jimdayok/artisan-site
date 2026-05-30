import Link from "next/link";
import Image from "next/image";
import { PortalPerformanceCharts } from "./PortalPerformanceCharts";
import {
  Activity,
  BadgeCheck,
  BookOpen,
  ExternalLink,
  Eye,
  Glasses,
  Home,
  Layers,
  LogOut,
  Mail,
  Minus,
  Newspaper,
  Package,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { isPortalAdminEmail } from "@/lib/portal/admin";
import {
  getCustomerTypeInfoFromProfile,
  hasModernPackageSavingsWarning,
  hasProgramUsage,
} from "@/lib/portal/accountInsights";
import {
  getPortalAuthenticatedEmailFromHeaders,
  isLocalhostDevelopmentRequest,
} from "@/lib/portal/auth";
import {
  customerHasPortalSection,
  getCustomerByEmailAndAccount,
  getCustomersByEmail,
  type PortalCustomer,
  type PortalSection,
} from "@/lib/portal/customers";
import { getPriceListByCode, type PortalPriceList } from "@/lib/portal/priceLists";
import {
  getPortalWorkbookProfileByEmail,
  getPortalWorkbookProfilesByEmail,
  getPortalWorkbookEmails,
  profileHasSequelRebateInvitation,
  type PortalWorkbookProfile,
  type PortalWorkbookAccount,
} from "@/lib/portal/workbookAccountData";
import { normalizeAccountNumber } from "@/lib/portal/normalizeAccounts";
import {
  getPortalDashboardV1ByAccount,
  type PortalDashboardV1Account,
  type PortalDashboardV1State,
} from "@/lib/portal/dashboardV1";

const PORTAL_ACCESS_LOGIN_URL = portalAccessLoginUrl();
const PORTAL_ACCESS_LOGOUT_URL =
  "/cdn-cgi/access/logout?returnTo=/portal";
const LOCAL_TEST_ADMIN_EMAILS = [
  "jimdayok@me.com",
  "jim.day@artisanlabnetwork.com",
];

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

function correctionHref({
  subject,
  practiceName,
  accountNumber,
  details,
}: {
  subject: string;
  practiceName: string;
  accountNumber: string;
  details: string;
}) {
  const body = [
    `Practice: ${practiceName || "Not available"}`,
    `Account Number: ${accountNumber || "Not available"}`,
    "",
    details,
  ].join("\n");

  return `mailto:sales@artisanlabnetwork.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function formatPercent(value: number) {
  const normalizedValue = value <= 1 ? value * 100 : value;

  return Math.max(0, Math.min(100, Math.round(normalizedValue)));
}

function formatDecimal(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value);
}

function containsText(value: string | undefined, match: string) {
  return Boolean(value?.toLowerCase().includes(match.toLowerCase()));
}

function getPercentChange(current: number, previous: number) {
  if (previous === 0) {
    if (current === 0) return { direction: "flat" as const, label: "No change" };

    return { direction: "up" as const, label: "New activity" };
  }

  const change = ((current - previous) / Math.abs(previous)) * 100;

  if (Math.abs(change) < 0.1) {
    return { direction: "flat" as const, label: "Flat vs previous month" };
  }

  return {
    direction: change > 0 ? ("up" as const) : ("down" as const),
    label: `${change > 0 ? "+" : ""}${change.toFixed(1)}% vs previous month`,
  };
}

function formatPerDayMetric(value: number, unit: string) {
  return `${formatDecimal(value)} ${unit}/day`;
}

function formatCurrencyPerDay(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "$0/day";
  return `${currencyFormatter.format(value)}/day`;
}

function getSalesPerDay(sales: number, jobs: number, jobsPerDay: number) {
  if (sales <= 0 || jobs <= 0 || jobsPerDay <= 0) return 0;

  // days = total jobs / jobs-per-day, then dollars-per-day = sales / days.
  return sales / (jobs / jobsPerDay);
}

function loyaltyTierLabel(value?: string) {
  const raw = (value ?? "").trim();
  if (!raw) return "";
  const withoutPrefix = raw.replace(/^tier\s*/i, "").trim();
  return withoutPrefix ? `Loyalty Tier ${withoutPrefix}` : "Loyalty Tier";
}

function isVisibleSalesRep(value?: string) {
  return ["OP", "HB"].includes((value ?? "").trim().toUpperCase());
}

function customerCategoryLabel({
  customerTypeLabel,
  account,
}: {
  customerTypeLabel?: string;
  account?: PortalWorkbookAccount;
}) {
  if (customerTypeLabel) return customerTypeLabel;

  return getCustomerTypeInfoFromProfile(
    account
      ? {
          person: {
            name: "",
            organization: account.accountName,
            accountNumber: account.accountNumber,
            emails: [],
            division: account.division,
            artisanLab: account.lastLabName,
            targetedPrograms: "",
            lastOrderShipped: account.lastShippedDate,
          },
          account,
        }
      : undefined
  )?.label;
}

function showNeurolensContent(account?: PortalWorkbookAccount) {
  if (!account) return false;

  return (
    account.division.trim().toUpperCase() === "NL" ||
    containsText(account.primaryPalPrivatePay, "neurolens") ||
    account.cmNlJobs + account.pmNlJobs + account.ppmNlJobs > 0
  );
}

function showSequelRewardsContent({
  account,
  invited,
}: {
  account?: PortalWorkbookAccount;
  invited: boolean;
}) {
  return Boolean(
    invited ||
      (account &&
        account.cmSqlJobs + account.pmSqlJobs + account.ppmSqlJobs > 0)
  );
}

function mixData({
  activeLabel,
  activePercent,
  activeColor = "#172a28",
}: {
  activeLabel: string;
  activePercent: number;
  activeColor?: string;
}) {
  const active = formatPercent(activePercent);

  return [
    { label: activeLabel, value: active, color: activeColor },
    { label: `Non-${activeLabel}`, value: Math.max(0, 100 - active), color: "#e8ddca" },
  ];
}

function formatAddressLines(value?: string) {
  return (value ?? "")
    .split(/,\s*|\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function PortalShell({
  children,
  eyebrow = "Customer Portal",
  header,
  footer,
  showIntro = true,
}: {
  children: React.ReactNode;
  eyebrow?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  showIntro?: boolean;
}) {
  return (
    <main className="min-h-screen bg-[#f4efe6] text-[#172a28]">
      <section className="relative isolate overflow-hidden px-5 py-6 sm:px-8 lg:px-10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_12%,rgba(47,89,98,0.16),transparent_34%),linear-gradient(135deg,#f7f2e9_0%,#efe6d8_55%,#dfe9e8_100%)]" />
        <div className="absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgba(23,42,40,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(23,42,40,0.55)_1px,transparent_1px)] [background-size:42px_42px]" />

        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col">
          {header ?? (
            <Link
              href="/"
              className="mb-14 inline-flex w-fit items-center text-xs font-semibold uppercase tracking-[0.32em] text-[#6f5f3f] transition hover:text-[#172a28]"
            >
              Artisan Lab Network
            </Link>
          )}

          {showIntro ? (
            <>
              <div className="mb-5 h-px w-24 bg-[#b89a61]" />
              <h1 className="mb-5 text-3xl font-semibold tracking-[-0.03em] text-[#172a28] sm:text-4xl">
                Artisan Lab Network Customer Portal
              </h1>
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.32em] text-[#7c6b48]">
                {eyebrow}
              </p>
            </>
          ) : null}
          {children}
          {footer}
        </div>
      </section>
    </main>
  );
}

function PortalHeader({
  practiceName,
  hasMultipleAccounts,
  isAdminPreview,
}: {
  practiceName: string;
  hasMultipleAccounts?: boolean;
  isAdminPreview?: boolean;
}) {
  return (
    <header className="mb-7 border border-[#d8c49b] bg-[#fffaf1]/88 px-4 py-3 shadow-[0_18px_55px_rgba(23,42,40,0.09)] backdrop-blur sm:px-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href="/"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#172a28]"
            aria-label="Artisan Lab Network"
          >
            <Image
              src="/aln-white-logo.png"
              alt="Artisan Lab Network"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
              priority
            />
          </Link>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">
              Customer Portal
            </p>
            <p className="truncate text-lg font-semibold tracking-[-0.02em] text-[#172a28]">
              {practiceName}
            </p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#172a28]">
          <Link
            href="/portal"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d8c49b] bg-white/55 px-4 transition hover:bg-white"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/provider-resources"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d8c49b] bg-white/55 px-4 transition hover:bg-white"
          >
            <BookOpen className="h-4 w-4" />
            Resources
          </Link>
          <Link
            href="/newsletter"
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#172a28] px-4 text-white shadow-[0_10px_24px_rgba(23,42,40,0.14)] transition hover:bg-[#27433f]"
          >
            <Newspaper className="h-4 w-4" />
            Newsletter
          </Link>
          {hasMultipleAccounts ? (
            <Link
              href="/portal"
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#b89a61] bg-[#fffaf1] px-4 transition hover:bg-white"
            >
              <Layers className="h-4 w-4" />
              Switch Account
            </Link>
          ) : null}
          {isAdminPreview ? (
            <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#b89a61] bg-[#f3e6c8] px-4 text-[#5c4724]">
              <ShieldCheck className="h-4 w-4" />
              Admin Preview
            </span>
          ) : null}
          <a
            href={PORTAL_ACCESS_LOGOUT_URL}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#172a28]/20 bg-transparent px-4 transition hover:bg-[#172a28] hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </a>
        </nav>
      </div>
    </header>
  );
}

function PortalFooter() {
  const links = [
    { label: "Provider Resources", href: "/provider-resources" },
    { label: "Newsletter", href: "/newsletter" },
    { label: "Policies", href: "/lab-policies" },
    { label: "Contact Support", href: "mailto:sales@artisanlabnetwork.com" },
    { label: "ArtisanLabNetwork.com", href: "/" },
  ];

  return (
    <footer className="mt-8 border-t border-[#d8c49b] py-7">
      <div className="flex flex-col gap-4 text-sm text-[#706759] lg:flex-row lg:items-center lg:justify-between">
        <p className="font-semibold text-[#172a28]">
          Artisan Lab Network Customer Portal
        </p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          {links.map((link) =>
            link.href.startsWith("mailto:") ? (
              <a
                key={link.label}
                href={link.href}
                className="transition hover:text-[#172a28]"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="transition hover:text-[#172a28]"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>
      </div>
    </footer>
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

function LocalTestLoginPanel() {
  const emails = [
    ...new Set([...LOCAL_TEST_ADMIN_EMAILS, ...getPortalWorkbookEmails()]),
  ];

  return (
    <PortalShell eyebrow="Local Test Login">
      <section className="max-w-4xl border border-[#d8c49b] bg-[#fffaf1]/88 p-7 shadow-[0_24px_80px_rgba(23,42,40,0.12)] sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b7650]">
          Local Development
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#172a28] sm:text-5xl">
          Choose a portal test user.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#706759]">
          Cloudflare Access is not present on localhost. Select a workbook user
          to set a local-only test cookie for this browser.
        </p>
        <form
          action="/portal/local-test-login"
          method="post"
          className="mt-8 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end"
        >
          <label className="grid gap-2 text-sm font-semibold text-[#172a28]">
            Test email
            <select
              name="email"
              className="min-h-12 border border-[#d8c49b] bg-white px-4 text-base font-normal text-[#172a28] outline-none transition focus:border-[#172a28]"
              defaultValue={LOCAL_TEST_ADMIN_EMAILS[0]}
            >
              {emails.map((email) => (
                <option key={email} value={email}>
                  {email}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#172a28] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#27433f]"
          >
            Continue
          </button>
        </form>
      </section>
    </PortalShell>
  );
}

function PriceListCard({
  priceList,
  accountNumber,
}: {
  priceList: PortalPriceList;
  accountNumber?: string;
}) {
  const downloadParams = new URLSearchParams({ code: priceList.code });

  if (accountNumber) downloadParams.set("account", accountNumber);

  return (
    <div className="group relative overflow-hidden border border-[#d8c49b] bg-white/64 p-5 shadow-[0_12px_34px_rgba(23,42,40,0.06)] transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_18px_44px_rgba(23,42,40,0.1)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-[#b89a61] opacity-0 transition group-hover:opacity-100" />
      <div>
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">
            {priceList.code}
          </p>
          <span className="rounded-full border border-[#d8c49b] px-3 py-1 text-xs font-semibold text-[#706759]">
            Assigned
          </span>
        </div>
        <p className="mt-4 text-2xl font-semibold tracking-[-0.025em] text-[#172a28]">
          {priceList.label}
        </p>
        <p className="mt-2 break-all text-sm text-[#706759]">{priceList.fileName}</p>
        {!priceList.r2Key ? (
          <p className="mt-2 text-sm font-semibold text-[#172a28]">
            Interactive pricing available in portal.
          </p>
        ) : null}
      </div>
      <div className="mt-6 flex flex-col gap-3">
        {priceList.onlineUrl ? (
          <Link
            href={priceList.onlineUrl}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#172a28] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#27433f]"
          >
            View {priceList.code} Online Pricing
          </Link>
        ) : null}
        {priceList.r2Key ? (
          <a
            href={`/api/portal/download?${downloadParams.toString()}`}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#d8c49b] bg-[#fffaf1] px-5 py-2 text-sm font-semibold text-[#172a28] transition hover:bg-white"
          >
            Download PDF
          </a>
        ) : null}
      </div>
    </div>
  );
}

function portalAccessLoginUrl() {
  const configuredPortalUrl = process.env.NEXT_PUBLIC_PORTAL_LOGIN_URL?.trim();
  if (configuredPortalUrl) return configuredPortalUrl;

  const configuredHost = process.env.NEXT_PUBLIC_SITE_DOMAIN?.trim();
  if (configuredHost) return `https://${configuredHost.replace(/^https?:\/\//, "")}/portal`;

  return "/portal";
}

function PortalAccountSelector({
  authenticatedEmail,
  profiles,
  customers,
}: {
  authenticatedEmail: string;
  profiles: PortalWorkbookProfile[];
  customers: PortalCustomer[];
}) {
  const optionsByAccount = new Map<
    string,
    {
      accountNumber: string;
      practiceName: string;
      customerTypeLabel?: string;
      lastShippedDate?: string;
    }
  >();

  for (const customer of customers) {
    optionsByAccount.set(normalizeAccountNumber(customer.accountNumber), {
      accountNumber: customer.accountNumber,
      practiceName: customer.practiceName,
      customerTypeLabel: customer.customerTypeLabel,
    });
  }

  for (const profile of profiles) {
    const accountNumber =
      profile.account?.accountNumber || profile.person.accountNumber || "";
    const key = normalizeAccountNumber(accountNumber);

    if (!key) continue;

    optionsByAccount.set(key, {
      accountNumber,
      practiceName:
        profile.account?.accountName ||
        profile.person.organization ||
        optionsByAccount.get(key)?.practiceName ||
        "Customer account",
      customerTypeLabel:
        optionsByAccount.get(key)?.customerTypeLabel ||
        customerCategoryLabel({
          account: profile.account,
        }),
      lastShippedDate:
        profile.account?.lastShippedDate || profile.person.lastOrderShipped,
    });
  }

  const options = [...optionsByAccount.values()];

  return (
    <PortalShell eyebrow="Choose Account">
      <section className="max-w-4xl border border-[#d8c49b] bg-[#fffaf1]/88 p-7 shadow-[0_24px_80px_rgba(23,42,40,0.12)] sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b7650]">
          Multiple Accounts
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#172a28] sm:text-5xl">
          Select the account you want to view.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#706759]">
          Logged in as {authenticatedEmail}. Each account is shown separately so
          pricing, performance, and downloads stay tied to the right practice.
        </p>
        <div className="mt-8 grid gap-4">
          {options.map((option) => (
            <Link
              key={option.accountNumber}
              href={`/portal?account=${encodeURIComponent(option.accountNumber)}`}
              className="group flex flex-col justify-between gap-4 border border-[#d8c49b] bg-white/70 p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_18px_45px_rgba(23,42,40,0.1)] sm:flex-row sm:items-center"
            >
              <span>
                <span className="block text-2xl font-semibold tracking-[-0.03em] text-[#172a28]">
                  {option.practiceName}
                </span>
                <span className="mt-2 block text-sm text-[#706759]">
                  Account {option.accountNumber}
                  {option.customerTypeLabel ? ` · ${option.customerTypeLabel}` : ""}
                </span>
                <span className="mt-2 block text-xs uppercase tracking-[0.18em] text-[#8b7650]">
                  Last shipped {formatPortalDate(option.lastShippedDate ?? "")}
                </span>
              </span>
              <span className="inline-flex w-fit items-center justify-center rounded-full bg-[#172a28] px-5 py-2 text-sm font-semibold text-white">
                View Portal
              </span>
            </Link>
          ))}
        </div>
      </section>
    </PortalShell>
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
      className="group block border border-[#d8c49b] bg-white/60 p-5 transition hover:-translate-y-0.5 hover:border-[#172a28] hover:bg-white"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b7650]">
        {card.section}
      </p>
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

function SequelRewardsInvitationCard({ invited }: { invited: boolean }) {
  return (
    <section className="relative isolate overflow-hidden border border-[#b89a61] bg-[#172a28] p-6 text-white shadow-[0_24px_90px_rgba(23,42,40,0.18)] sm:p-9 lg:col-span-3">
      <div className="absolute inset-y-0 right-0 -z-10 w-1/2 bg-[radial-gradient(circle_at_70%_35%,rgba(216,196,155,0.22),transparent_42%)]" />
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8c49b]">
          Invitation Program
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
          {invited
            ? "You've Been Invited: Sequel Artisan Rewards"
            : "Sequel Artisan Rewards"}
        </h2>
        <p className="mt-4 text-sm leading-7 text-white/76">
          {invited
            ? "Your practice has been invited to participate in the Sequel Artisan Rewards program. Learn how the program works and how your practice can qualify for rewards."
            : "Your practice has Sequel Artisan Rewards activity. Review program details and see how Artisan supports independent practices using Sequel designs."}
        </p>
      </div>
      <Link
        href="/programs#sequel-artisan-rewards"
        className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[#d8c49b] px-6 py-3 text-sm font-semibold text-[#172a28] transition hover:bg-white"
      >
        Learn About Sequel Artisan Rewards
      </Link>
    </section>
  );
}

function AccountStatCard({
  label,
  value,
  detail,
  tone = "light",
  perDay,
  trend,
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: "light" | "dark";
  perDay?: string;
  trend?: ReturnType<typeof getPercentChange>;
}) {
  const isDark = tone === "dark";
  const TrendIcon =
    trend?.direction === "up"
      ? TrendingUp
      : trend?.direction === "down"
        ? TrendingDown
        : Minus;
  const trendClass =
    trend?.direction === "up"
      ? isDark
        ? "text-[#9dbf9a]"
        : "text-[#315f48]"
      : trend?.direction === "down"
        ? isDark
          ? "text-[#d7aaa2]"
          : "text-[#9b5148]"
        : isDark
          ? "text-white/62"
          : "text-[#706759]";

  return (
    <div
      className={`relative overflow-hidden border p-5 shadow-[0_14px_38px_rgba(23,42,40,0.07)] ${
        isDark
          ? "border-[#172a28] bg-[#172a28] text-white"
          : "border-[#d8c49b] bg-[#fffaf1] text-[#172a28]"
      }`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 ${
          isDark ? "bg-[#d8c49b]" : "bg-[#b89a61]"
        }`}
      />
      <p
        className={`text-xs font-semibold uppercase tracking-[0.22em] ${
          isDark ? "text-[#d8c49b]" : "text-[#8b7650]"
        }`}
      >
        {label}
      </p>
      <p className="mt-4 text-3xl font-semibold tracking-[-0.035em]">
        {value}
      </p>
      {perDay ? (
        <p className={`mt-2 text-sm font-semibold ${isDark ? "text-white/72" : "text-[#5d5548]"}`}>
          {perDay}
        </p>
      ) : null}
      {trend ? (
        <p className={`mt-3 inline-flex items-center gap-1.5 text-xs font-semibold ${trendClass}`}>
          <TrendIcon className="h-4 w-4" />
          {trend.label}
        </p>
      ) : null}
      {detail ? (
        <p className={`mt-2 text-xs leading-5 ${isDark ? "text-white/68" : "text-[#706759]"}`}>
          {detail}
        </p>
      ) : null}
    </div>
  );
}

function UsageRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2 border-t border-[#d8c49b] py-4 text-sm sm:grid-cols-[minmax(9rem,1fr)_minmax(0,1.35fr)] sm:gap-5">
      <span className="font-semibold text-[#172a28]">{label}</span>
      <span className="min-w-0 whitespace-pre-line break-words text-[#706759] sm:text-right">
        {value || "Not available"}
      </span>
    </div>
  );
}

function ProgramUsageCard({
  label,
  value,
  href,
  recommendation,
  icon: Icon,
}: {
  label: string;
  value: string;
  href: string;
  recommendation?: string;
  icon: LucideIcon;
}) {
  const active = hasProgramUsage(value);

  return (
    <Link
      href={href}
      className="group relative flex min-h-56 flex-col overflow-hidden border border-[#d8c49b] bg-[#fffaf1] p-5 shadow-[0_12px_34px_rgba(23,42,40,0.06)] transition hover:-translate-y-0.5 hover:border-[#b89a61] hover:bg-white hover:shadow-[0_20px_46px_rgba(23,42,40,0.1)]"
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 ${
          active ? "bg-[#172a28]" : "bg-[#d8c49b]"
        }`}
      />
      <div className="flex items-start justify-between gap-4">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
            active ? "bg-[#172a28] text-white" : "bg-white text-[#8b7650]"
          }`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            active
              ? "bg-[#e6f0e7] text-[#315f48]"
              : "border border-[#d8c49b] bg-white/60 text-[#706759]"
          }`}
        >
          {active ? "Active" : "Available"}
        </span>
      </div>
      <div className="mt-5 flex flex-1 flex-col">
        <h3 className="text-xl font-semibold leading-6 tracking-[-0.02em] text-[#172a28]">
          {label}
        </h3>
        <p className="mt-3 min-h-12 text-sm leading-6 text-[#706759]">
          {value || "No current activity"}
        </p>
        <div className="mt-auto pt-5">
          {recommendation ? (
            <p className="mb-4 border-t border-[#d8c49b] pt-4 text-xs leading-5 text-[#8b7650]">
              {recommendation}
            </p>
          ) : null}
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#172a28] underline decoration-[#d8c49b] underline-offset-4 transition group-hover:decoration-[#172a28]">
            Learn more
            <ExternalLink className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function ModernPackageSavingsAlert() {
  return (
    <section className="border border-[#b89a61] bg-[#172a28] p-6 text-white shadow-[0_24px_90px_rgba(23,42,40,0.16)] sm:p-8 lg:col-span-2">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8c49b]">
        Package Opportunity
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
        You May Be Missing Package Savings
      </h2>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-white/76">
        Your account shows Modern Frame System usage, but not Modern Package
        System usage. You may be missing reduced costs available through our
        package program.
      </p>
      <Link
        href="/provider-resources#modern-package-system"
        className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[#d8c49b] px-6 py-3 text-sm font-semibold text-[#172a28] transition hover:bg-white"
      >
        Learn About Modern Package Savings
      </Link>
    </section>
  );
}

function NeurolensExpansionInvitation() {
  return (
    <section className="relative isolate overflow-hidden border border-[#b89a61] bg-[#fffaf1]/90 p-6 shadow-[0_24px_90px_rgba(23,42,40,0.13)] sm:p-9 lg:col-span-3">
      <div className="absolute right-0 top-0 -z-10 h-full w-1/2 bg-[radial-gradient(circle_at_68%_22%,rgba(49,95,88,0.15),transparent_42%)]" />
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#172a28] text-white">
            <Sparkles className="h-5 w-5" />
          </span>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#8b7650]">
            Lens Opportunities
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#172a28]">
            Explore More Artisan Lens Options
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#706759]">
            Your account currently utilizes Neurolens as a primary private-pay
            design. Artisan also offers additional premium lens technologies and
            independent-exclusive solutions through IOT, Tokai, Artisan Lens
            Systems, and more.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <Link
            href="/provider-resources#lens-systems"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#172a28] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#27433f]"
          >
            <BookOpen className="h-4 w-4" />
            Explore Lens Technologies
          </Link>
          <a
            href="mailto:sales@artisanlabnetwork.com"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#d8c49b] bg-white/65 px-6 py-3 text-sm font-semibold text-[#172a28] transition hover:bg-white"
          >
            <Mail className="h-4 w-4" />
            Contact Artisan Support
          </a>
        </div>
      </div>
    </section>
  );
}

function PortalAccountHero({
  practiceName,
  accountNumber,
  customerTypeLabel,
  account,
  dashboardAccount,
  authenticatedEmail,
  adminPreviewAccountName,
}: {
  practiceName: string;
  accountNumber: string;
  customerTypeLabel?: string;
  account?: PortalWorkbookAccount;
  dashboardAccount?: PortalDashboardV1Account;
  authenticatedEmail: string;
  adminPreviewAccountName?: string;
}) {
  const palItems = [
    { label: "Primary PAL Private", value: account?.primaryPalPrivatePay },
    { label: "Primary PAL VSP", value: account?.primaryPalVsp },
  ].filter((item) => item.value);

  return (
    <section className="relative isolate overflow-hidden border border-[#b89a61] bg-[#172a28] p-6 text-white shadow-[0_28px_100px_rgba(23,42,40,0.22)] sm:p-8 lg:col-span-3">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_18%,rgba(216,196,155,0.2),transparent_34%),linear-gradient(135deg,rgba(49,95,88,0.38),transparent_52%)]" />
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d8c49b]">
            Acct ID {dashboardAccount?.account_id || accountNumber || "Unavailable"}
          </p>
          <h1 className="mt-5 break-words text-4xl font-semibold tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            {dashboardAccount?.business_name || practiceName}
          </h1>
          <div className="mt-6 flex flex-wrap gap-3">
            {customerTypeLabel ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d8c49b]/55 bg-[#fffaf1]/10 px-4 py-2 text-sm font-semibold">
                {customerTypeLabel}
              </span>
            ) : null}
            {(dashboardAccount?.all_account_numbers || accountNumber) ? (
              <span className="rounded-full border border-white/18 px-4 py-2 text-sm text-white/82">
                Accounts {dashboardAccount?.all_account_numbers || accountNumber}
              </span>
            ) : null}
            {(dashboardAccount?.tier_status?.previous_month_tier_rank_by_acct_id || account?.tier) ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d8c49b]/70 bg-[#d8c49b] px-4 py-2 text-sm font-semibold text-[#172a28] shadow-[0_10px_28px_rgba(0,0,0,0.12)]">
                <BadgeCheck className="h-4 w-4" />
                {loyaltyTierLabel(
                  dashboardAccount?.tier_status?.previous_month_tier_rank_by_acct_id || account?.tier
                )}
              </span>
            ) : null}
          </div>
          {palItems.length > 0 ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {palItems.map((item) => (
                <div
                  key={item.label}
                  className="border border-white/16 bg-white/[0.06] p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d8c49b]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 text-sm leading-6 text-white/78 lg:min-w-80">
          <p>
            <span className="text-[#d8c49b]">Last shipped</span>
            <br />
            <span className="font-semibold text-white">
              {formatPortalDate(account?.lastShippedDate ?? "")}
            </span>
          </p>
          <p>
            <span className="text-[#d8c49b]">Primary lab</span>
            <br />
            <span className="font-semibold text-white">
              {account?.lastLabName || "Not available"}
            </span>
          </p>
          <p>
            <span className="text-[#d8c49b]">
              {adminPreviewAccountName ? "Admin preview identity" : "Logged in as"}
            </span>
            <br />
            <span className="font-semibold text-white">{authenticatedEmail}</span>
          </p>
        </div>
      </div>
    </section>
  );
}

function AccountPerformanceSection({
  account,
  showNeurolens,
  showSequelRewards,
}: {
  account: PortalWorkbookAccount;
  showNeurolens: boolean;
  showSequelRewards: boolean;
}) {
  const vspShare =
    account.cmVspSow || (account.cmJobs > 0 ? account.cmVspJobs / account.cmJobs : 0);
  const nlShare =
    account.cmNlSow || (account.cmJobs > 0 ? account.cmNlJobs / account.cmJobs : 0);
  const sqlShare = account.cmJobs > 0 ? account.cmSqlJobs / account.cmJobs : 0;
  const mixCharts = [
    mixData({
      activeLabel: "VSP",
      activePercent: vspShare,
    }),
    ...(showNeurolens
      ? [
          mixData({
            activeLabel: "Neurolens",
            activePercent: nlShare,
            activeColor: "#315f58",
          }),
        ]
      : []),
    ...(showSequelRewards
      ? [
          mixData({
            activeLabel: "Sequel",
            activePercent: sqlShare,
            activeColor: "#8b7650",
          }),
        ]
      : []),
  ];
  const trendData = [
    {
      label: "PPM",
      purchases: account.ppmSales,
      rxOrders: account.ppmJobs,
      rxOrdersPerDay: account.ppmJpd,
    },
    {
      label: "PM",
      purchases: account.pmSales,
      rxOrders: account.pmJobs,
      rxOrdersPerDay: account.pmJpd,
    },
    {
      label: "CM",
      purchases: account.cmSales,
      rxOrders: account.cmJobs,
      rxOrdersPerDay: account.cmJpd,
    },
  ];

  return (
    <section className="border border-[#d8c49b] bg-[#fffaf1]/86 p-6 shadow-[0_24px_90px_rgba(23,42,40,0.13)] backdrop-blur sm:p-9 lg:col-span-3">
      <div className="mb-7 border-b border-[#d8c49b] pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b7650]">
          Account Performance
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#172a28]">
          Performance snapshot
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#706759]">
          Purchases include the VSP portion paid directly to the lab when
          applicable. Rx Orders are shown as current, previous, and prior
          previous month views.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <AccountStatCard
          label="Current Month Purchases"
          value={formatCurrency(account.cmSales)}
          tone="dark"
          perDay={formatCurrencyPerDay(
            getSalesPerDay(account.cmSales, account.cmJobs, account.cmJpd)
          )}
          trend={getPercentChange(account.cmSales, account.pmSales)}
        />
        <AccountStatCard
          label="Previous Month Purchases"
          value={formatCurrency(account.pmSales)}
          perDay={formatCurrencyPerDay(
            getSalesPerDay(account.pmSales, account.pmJobs, account.pmJpd)
          )}
          trend={getPercentChange(account.pmSales, account.ppmSales)}
        />
        <AccountStatCard
          label="Current Month Rx Orders"
          value={formatNumber(account.cmJobs)}
          perDay={formatPerDayMetric(account.cmJpd, "orders")}
          trend={getPercentChange(account.cmJobs, account.pmJobs)}
        />
        <AccountStatCard
          label="Previous Month Rx Orders"
          value={formatNumber(account.pmJobs)}
          perDay={formatPerDayMetric(account.pmJpd, "orders")}
          trend={getPercentChange(account.pmJobs, account.ppmJobs)}
        />
        <AccountStatCard
          label="Current Month Redo %"
          value="TBD"
          detail="Live redo data will appear here when available."
        />
        <AccountStatCard
          label="Previous Month Redo %"
          value="TBD"
          detail="Live redo data will appear here when available."
        />
      </div>

      <div className="mt-8">
        <PortalPerformanceCharts
          trends={trendData}
          mixes={mixCharts}
        />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <AccountStatCard
          label="VSP Rx Orders"
          value={formatNumber(account.cmVspJobs)}
          detail={`${formatPercent(vspShare)}% VSP · ${100 - formatPercent(vspShare)}% Non-VSP`}
        />
        {showNeurolens ? (
          <AccountStatCard
            label="Neurolens Rx Orders"
            value={formatNumber(account.cmNlJobs)}
            detail={`${formatPercent(nlShare)}% of current Rx order mix`}
          />
        ) : null}
        {showSequelRewards ? (
          <AccountStatCard
            label="Sequel Rx Orders"
            value={formatNumber(account.cmSqlJobs)}
            detail={`${formatPercent(sqlShare)}% of current Rx order mix`}
          />
        ) : null}
      </div>
    </section>
  );
}

function AccountProfileSection({
  account,
  practiceName,
  accountNumber,
}: {
  account?: PortalWorkbookAccount;
  practiceName: string;
  accountNumber: string;
}) {
  if (!account && !practiceName && !accountNumber) return null;

  const correctionLink = correctionHref({
    subject: "Portal Account Information Correction",
    practiceName,
    accountNumber,
    details: "Please describe the account information that should be corrected.",
  });
  const addressLines = formatAddressLines(account?.fullAddress);
  const stateZip = [account?.state, account?.zipCode].filter(Boolean).join(" ");

  return (
    <section className="border border-[#d8c49b] bg-[#fffaf1]/86 p-6 shadow-[0_24px_90px_rgba(23,42,40,0.13)] backdrop-blur sm:p-9">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b7650]">
        Account Details
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#172a28]">
        Profile and support
      </h2>
      <p className="mt-3 text-sm leading-6 text-[#706759]">
        Review the account details Artisan uses for service, support, and
        program eligibility.
      </p>
      <div className="mt-6 grid gap-4 text-sm leading-6 text-[#706759]">
        {isVisibleSalesRep(account?.salesRep) ? (
          <UsageRow label="Sales Rep" value={account?.salesRep ?? ""} />
        ) : null}
        <UsageRow
          label="Address"
          value={addressLines.length > 0 ? addressLines.join("\n") : ""}
        />
        <UsageRow label="Phone Number" value={account?.phoneNumber ?? ""} />
        <UsageRow label="State / ZIP" value={stateZip} />
      </div>
      <a
        href={correctionLink}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-[#d8c49b] bg-white/62 px-5 py-2 text-sm font-semibold text-[#172a28] transition hover:bg-white"
      >
        Is this information incorrect?
      </a>
    </section>
  );
}

function UserContactSection({
  workbookProfile,
  authenticatedEmail,
  practiceName,
  accountNumber,
}: {
  workbookProfile?: PortalWorkbookProfile;
  authenticatedEmail: string;
  practiceName: string;
  accountNumber: string;
}) {
  const correctionLink = correctionHref({
    subject: "Portal User Information Correction",
    practiceName,
    accountNumber,
    details: "Please describe the user/contact information that should be corrected.",
  });

  return (
    <section className="border border-[#d8c49b] bg-[#fffaf1]/86 p-6 shadow-[0_24px_90px_rgba(23,42,40,0.13)] backdrop-blur sm:p-9">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b7650]">
        Portal User
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#172a28]">
        {workbookProfile?.person.name || "Portal Contact"}
      </h2>
      <div className="mt-6">
        <UsageRow label="Signed In Email" value={authenticatedEmail} />
        <UsageRow
          label="Workbook Emails"
          value={workbookProfile?.person.emails.join(", ") ?? authenticatedEmail}
        />
      </div>
      <a
        href={correctionLink}
        className="mt-6 inline-flex text-sm font-semibold text-[#172a28] underline decoration-[#d8c49b] underline-offset-4 transition hover:decoration-[#172a28]"
      >
        Is this contact information incorrect?
      </a>
    </section>
  );
}

function ProgramUsageSection({
  account,
  showNeurolens,
  showSequelRewards,
  hasSequelRebateInvitation,
}: {
  account: PortalWorkbookAccount;
  showNeurolens: boolean;
  showSequelRewards: boolean;
  hasSequelRebateInvitation: boolean;
}) {
  const missingPackageSavings = hasModernPackageSavingsWarning(account);
  const programCards: Array<{
    label: string;
    value: string;
    href: string;
    icon: LucideIcon;
    recommendation?: string;
  }> = [
    {
      label: "Modern Package System",
      value: account.modernPkgUsage,
      href: "/provider-resources#modern-package-system",
      icon: Package,
      recommendation: missingPackageSavings
        ? "Recommended: compare package savings for accounts already using Modern Frame."
        : undefined,
    },
    {
      label: "Modern Frame System",
      value: account.modernFrmUsage,
      href: "/provider-resources#modern-frame-system",
      icon: Layers,
    },
    {
      label: "Chemistrie/ChemClip",
      value: account.chemClipUsage,
      href: "/provider-resources#specialty-systems",
      icon: Glasses,
    },
    {
      label: "SpecCheck",
      value: account.specCheckUsage,
      href: "/provider-resources#speccheck",
      icon: Eye,
    },
    {
      label: "Tokai",
      value: account.tokaiUsage,
      href: "/provider-resources#tokai",
      icon: Sparkles,
    },
    ...(showNeurolens
      ? [
          {
            label: "Neurolens",
            value:
              account.cmNlJobs + account.pmNlJobs + account.ppmNlJobs > 0
                ? `${formatNumber(account.cmNlJobs)} current month orders`
                : account.primaryPalPrivatePay,
            href: "/provider-resources#lens-systems",
            icon: Activity,
          },
        ]
      : []),
    ...(showSequelRewards
      ? [
          {
            label: "Sequel Artisan Rewards",
            value: hasSequelRebateInvitation
              ? "Invited account"
              : `${formatNumber(account.cmSqlJobs)} current month orders`,
            href: "/programs#sequel-artisan-rewards",
            icon: BadgeCheck,
          },
        ]
      : []),
  ];

  return (
    <section className="border border-[#d8c49b] bg-[#fffaf1]/86 p-6 shadow-[0_24px_90px_rgba(23,42,40,0.13)] backdrop-blur sm:p-9 lg:col-span-3">
      <div className="mb-7 border-b border-[#d8c49b] pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b7650]">
          Programs and Tools
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#172a28]">
          System usage
        </h2>
      </div>
      <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4">
        {programCards.map((card) => (
          <ProgramUsageCard key={card.label} {...card} />
        ))}
      </div>
    </section>
  );
}

function PortalHelpSection({
  isLocalhostDevelopment,
}: {
  isLocalhostDevelopment?: boolean;
}) {
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
        {isLocalhostDevelopment ? (
          <a
            href="/portal/local-test-login"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#172a28]/20 bg-transparent px-5 py-2 text-sm font-semibold text-[#172a28] transition hover:bg-[#172a28] hover:text-white"
          >
            Switch User / Logout
          </a>
        ) : null}
      </div>
    </section>
  );
}

function DashboardV1Card({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="border border-[#d8c49b] bg-white/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b7650]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#172a28]">
        {value}
      </p>
      {detail ? <p className="mt-2 text-xs text-[#706759]">{detail}</p> : null}
    </div>
  );
}

function formatMoney(value: unknown) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "$0";
  return currencyFormatter.format(numeric);
}

function formatCount(value: unknown) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "0";
  return numberFormatter.format(numeric);
}

function formatShare(value: unknown) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "0%";
  const percentage = numeric <= 1 ? numeric * 100 : numeric;
  return `${Math.round(percentage)}%`;
}

function growthLabel(value: unknown) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "0.0%";
  const percent = numeric * 100;
  return `${percent >= 0 ? "+" : ""}${percent.toFixed(1)}%`;
}

function DashboardV1Panel({
  dashboardState,
}: {
  dashboardState: PortalDashboardV1State;
}) {
  const dashboard = dashboardState.account;
  if (!dashboard) return null;
  const jobs = dashboard.purchase_summary.jobs;
  const sales = dashboard.purchase_summary.sales;
  const cmJobs = Number(jobs.cm ?? 0);
  const pmJobs = Number(jobs.pm ?? 0);
  const cmSales = Number(sales.cm ?? 0);
  const pmSales = Number(sales.pm ?? 0);
  const jobsGrowth = pmJobs === 0 ? (cmJobs > 0 ? 1 : 0) : (cmJobs - pmJobs) / Math.abs(pmJobs);
  const salesGrowth = pmSales === 0 ? (cmSales > 0 ? 1 : 0) : (cmSales - pmSales) / Math.abs(pmSales);
  const jobsTrend = cmJobs > pmJobs ? "up" : cmJobs < pmJobs ? "down" : "flat";
  const salesTrend = cmSales > pmSales ? "up" : cmSales < pmSales ? "down" : "flat";
  const mix = dashboard.vsp_private_pay_mix;
  const productMix = dashboard.product_mix;
  const programUsage = dashboard.program_usage;
  const userSummary = dashboard.authorized_users_summary;
  const insights = dashboard.customer_insights?.suggestions ?? [];

  return (
    <section className="border border-[#d8c49b] bg-[#fffaf1]/86 p-6 shadow-[0_24px_90px_rgba(23,42,40,0.13)] backdrop-blur lg:col-span-3 sm:p-9">
      <div className="mb-6 border-b border-[#d8c49b] pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b7650]">
          Customer Dashboard v1
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#172a28]">
          {dashboard.business_name || "Account Dashboard"}
        </h2>
        <p className="mt-2 text-sm text-[#706759]">
          {dashboard.lab_name || "Unknown lab"} · {dashboard.division || "Unknown division"} ·{" "}
          {dashboard.state || "Unknown state"} · Latest ship date {dashboard.latest_ship_date || "Not available"} · Tier{" "}
          {dashboard.tier_status.previous_month_tier_rank_by_acct_id || "Unranked"}
        </p>
        <p className="mt-2 text-xs text-[#706759]">
          Pipedrive ID: {dashboard.pipedrive_id || "N/A"} · Account numbers: {dashboard.all_account_numbers || "N/A"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardV1Card
          label="PPM / PM / CM Jobs"
          value={`${formatCount(jobs.ppm)} / ${formatCount(jobs.pm)} / ${formatCount(jobs.cm)}`}
          detail={`Trend ${growthLabel(jobsGrowth)} (${jobsTrend})`}
        />
        <DashboardV1Card
          label="PPM / PM / CM Sales"
          value={`${formatMoney(sales.ppm)} / ${formatMoney(sales.pm)} / ${formatMoney(sales.cm)}`}
          detail={`Trend ${growthLabel(salesGrowth)} (${salesTrend})`}
        />
        <DashboardV1Card
          label="Net Lens Share"
          value={formatShare(mix.net_lens_share)}
          detail={`CM Net Lens jobs ${formatCount(productMix.net_lens_jobs.cm)}`}
        />
        <DashboardV1Card
          label="VSP / SQL Share"
          value={`${formatShare(mix.vsp_share)} / ${formatShare(mix.sql_share)}`}
          detail={`Private pay mix ${formatShare(mix.private_pay_mix)}`}
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="border border-[#d8c49b] bg-white/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b7650]">
            Product Mix
          </p>
          <ul className="mt-3 space-y-1 text-sm text-[#172a28]">
            <li>Net Lens jobs (CM): {formatCount(productMix.net_lens_jobs.cm)}</li>
            <li>SQL jobs (CM): {formatCount(productMix.sql_jobs.cm)}</li>
            <li>VSP jobs (CM): {formatCount(mix.vsp_jobs.cm)}</li>
            <li>Private pay brand: {dashboard.primary_pal_brand_private_pay || "N/A"}</li>
            <li>VSP brand: {dashboard.primary_pal_brand_vsp || "N/A"}</li>
          </ul>
        </div>

        <div className="border border-[#d8c49b] bg-white/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b7650]">
            Program Usage
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              ["Modern Pkg", programUsage.flags.modern_package],
              ["Modern Frame", programUsage.flags.modern_frame],
              ["ChemClip", programUsage.flags.chemclip],
              ["SpecCheck", programUsage.flags.speccheck],
              ["Tokai", programUsage.flags.tokai],
            ].map(([label, active]) => (
              <span
                key={String(label)}
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                  active
                    ? "border-[#172a28] bg-[#172a28] text-white"
                    : "border-[#d8c49b] bg-[#fffaf1] text-[#706759]"
                }`}
              >
                {label}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-[#706759]">
            Values: Modern Pkg {programUsage.modern_package_usage || "blank"} · Modern Frame {programUsage.modern_frame_usage || "blank"} · ChemClip {programUsage.chemclip_usage || "blank"} · SpecCheck {programUsage.speccheck_usage || "blank"} · Tokai {programUsage.tokai_usage || "blank"}
          </p>
        </div>

        <div className="border border-[#d8c49b] bg-white/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b7650]">
            Customer Insights
          </p>
          {insights.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm text-[#172a28]">
              {insights.map((insight) => (
                <li key={insight}>• {insight}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-[#706759]">
              No insights generated for this snapshot.
            </p>
          )}
          <p className="mt-4 text-xs text-[#706759]">
            Authorized users: {formatCount(userSummary.authorized_user_count)} · Primary emails: {userSummary.primary_emails.slice(0, 3).join(", ") || "None"}
          </p>
          <p className="mt-1 text-xs text-[#706759]">
            Marketing statuses: {Object.entries(userSummary.marketing_status_summary)
              .map(([status, count]) => `${status} (${count})`)
              .join(", ") || "None"}
          </p>
          <p className="mt-4 text-xs text-[#706759]">
            Data refresh date: {dashboard.data_refresh_date || "Unknown"}
          </p>
        </div>
      </div>
    </section>
  );
}

export function PortalDashboardContent({
  authenticatedEmail,
  customer,
  workbookProfile,
  dashboardState,
  adminPreviewAccountName,
  adminPreviewAccountNumber,
  adminPreviewEmail,
  adminReturnTo = "/portal/admin",
  isLocalhostDevelopment,
  selectableAccountCount = 1,
}: {
  authenticatedEmail: string;
  customer?: PortalCustomer;
  workbookProfile?: PortalWorkbookProfile;
  dashboardState?: PortalDashboardV1State;
  adminPreviewAccountName?: string;
  adminPreviewAccountNumber?: string;
  adminPreviewEmail?: string;
  adminReturnTo?: string;
  isLocalhostDevelopment?: boolean;
  selectableAccountCount?: number;
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
  const customerTypeInfo = getCustomerTypeInfoFromProfile(workbookProfile);
  const customerTypeLabel =
    customerTypeInfo?.label || customer?.customerTypeLabel || "";
  const hasSequelRebateInvitation =
    profileHasSequelRebateInvitation(workbookProfile);
  const shouldShowNeurolens = showNeurolensContent(account);
  const shouldShowSequelRewards = showSequelRewardsContent({
    account,
    invited: hasSequelRebateInvitation,
  });
  const shouldShowNeurolensInvitation = containsText(
    account?.primaryPalPrivatePay,
    "neurolens"
  );
  const showDashboardV1 = dashboardState?.status === "ok";
  const isAdmin = isPortalAdminEmail(authenticatedEmail);
  const shouldShowDashboardWarnings =
    isAdmin && Boolean(dashboardState) && (!showDashboardV1 || Boolean(dashboardState?.stale));

  return (
    <PortalShell
      showIntro={false}
      header={
        <PortalHeader
          practiceName={practiceName}
          hasMultipleAccounts={selectableAccountCount > 1}
          isAdminPreview={Boolean(adminPreviewAccountName)}
        />
      }
      footer={<PortalFooter />}
    >
      {adminPreviewAccountName ? (
        <div className="sticky top-4 z-20 mb-8 border border-[#b89a61] bg-[#172a28]/96 px-5 py-4 text-white shadow-[0_18px_55px_rgba(23,42,40,0.22)] backdrop-blur sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8c49b]">
                Admin Preview Mode
              </p>
              <p className="mt-2 text-sm leading-6 text-white/88">
                You are viewing the portal as {adminPreviewAccountName}, account{" "}
                {adminPreviewAccountNumber || accountNumber}. Your admin
                identity is still {adminPreviewEmail || authenticatedEmail}.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={adminReturnTo}
                className="inline-flex min-h-10 w-fit items-center justify-center rounded-full bg-[#d8c49b] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#172a28] transition hover:bg-white"
              >
                Back to Admin
              </Link>
              <Link
                href={adminReturnTo}
                className="inline-flex min-h-10 w-fit items-center justify-center rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition hover:bg-white hover:text-[#172a28]"
              >
                Go Back
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-7 lg:grid-cols-3">
        {showDashboardV1 ? (
          <DashboardV1Panel dashboardState={dashboardState} />
        ) : null}

        {shouldShowDashboardWarnings ? (
          <section className="border border-[#b89a61] bg-[#fff4dd] p-5 text-[#172a28] shadow-[0_14px_40px_rgba(23,42,40,0.08)] lg:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">
              Dashboard Snapshot Status
            </p>
            <p className="mt-2 text-sm">
              {showDashboardV1
                ? `Snapshot ${dashboardState?.manifest?.snapshot_id ?? "unknown"} is loaded.`
                : "Dashboard v1 data is missing for this account. Falling back to legacy portal view."}
            </p>
            {dashboardState?.stale ? (
              <p className="mt-1 text-sm">
                Warning: {dashboardState.staleReason || "Snapshot may be stale."}
              </p>
            ) : null}
            <p className="mt-1 text-xs text-[#706759]">
              Data refresh date: {dashboardState?.manifest?.data_refresh_date || "Unknown"} ·
              Accounts in snapshot: {dashboardState?.manifest?.row_count_output_accounts ?? 0}
            </p>
          </section>
        ) : null}

        <PortalAccountHero
          practiceName={practiceName}
          accountNumber={accountNumber}
          customerTypeLabel={customerTypeLabel}
          account={account}
          dashboardAccount={dashboardState?.account}
          authenticatedEmail={authenticatedEmail}
          adminPreviewAccountName={adminPreviewAccountName}
        />

        {isAdmin && !adminPreviewAccountName ? (
          <section className="border border-[#d8c49b] bg-[#fffaf1]/86 p-5 shadow-[0_18px_55px_rgba(23,42,40,0.08)] lg:col-span-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">
                  Admin Tools
                </p>
                <p className="mt-2 text-sm text-[#706759]">
                  Open admin views without changing the current customer portal
                  context.
                </p>
              </div>
              <Link
                href="/portal/admin"
                className="inline-flex min-h-11 w-fit items-center justify-center rounded-full bg-[#172a28] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#27433f]"
              >
                Admin Portal
              </Link>
            </div>
          </section>
        ) : null}

        {account ? (
          <AccountPerformanceSection
            account={account}
            showNeurolens={shouldShowNeurolens}
            showSequelRewards={shouldShowSequelRewards}
          />
        ) : null}

        {shouldShowSequelRewards ? (
          <SequelRewardsInvitationCard invited={hasSequelRebateInvitation} />
        ) : null}

        {account && hasModernPackageSavingsWarning(account) ? (
          <ModernPackageSavingsAlert />
        ) : null}

        {shouldShowNeurolensInvitation ? <NeurolensExpansionInvitation /> : null}

        <section className="border border-[#d8c49b] bg-[#fffaf1]/86 p-6 shadow-[0_24px_90px_rgba(23,42,40,0.13)] backdrop-blur sm:p-9 lg:col-span-2">
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
            <div className="grid gap-4 md:grid-cols-2">
              {availablePriceLists.map((priceList) => (
                <PriceListCard
                  key={priceList.code}
                  priceList={priceList}
                  accountNumber={accountNumber}
                />
              ))}
            </div>
          ) : (
            <p className="border-t border-[#d8c49b] py-6 text-[#5b5245]">
              No price sheets have been assigned to this account yet.
            </p>
          )}

          <PortalHelpSection isLocalhostDevelopment={isLocalhostDevelopment} />
        </section>

        {availablePortalSections.length > 0 ? (
          <section className="border border-[#d8c49b] bg-[#fffaf1]/86 p-6 shadow-[0_24px_90px_rgba(23,42,40,0.13)] backdrop-blur sm:p-9">
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
            <div className="grid gap-4">
              {availablePortalSections.map((card) => (
                <PortalResourceCard key={card.title} card={card} />
              ))}
            </div>
          </section>
        ) : null}

        <AccountProfileSection
          account={account}
          practiceName={practiceName}
          accountNumber={accountNumber}
        />

        <UserContactSection
          workbookProfile={workbookProfile}
          authenticatedEmail={authenticatedEmail}
          practiceName={practiceName}
          accountNumber={accountNumber}
        />

        {account ? (
          <ProgramUsageSection
            account={account}
            showNeurolens={shouldShowNeurolens}
            showSequelRewards={shouldShowSequelRewards}
            hasSequelRebateInvitation={hasSequelRebateInvitation}
          />
        ) : null}
      </div>
    </PortalShell>
  );
}

export default function PortalDashboard({
  headerList,
  selectedAccountNumber,
}: {
  headerList: Headers;
  selectedAccountNumber?: string;
}) {
  const authenticatedEmail = getPortalAuthenticatedEmailFromHeaders(headerList);
  const isLocalhostDevelopment = isLocalhostDevelopmentRequest(headerList);

  if (!authenticatedEmail) {
    if (isLocalhostDevelopment) return <LocalTestLoginPanel />;

    return (
      <PortalMessage
        message="Unable to verify your secure login. Please sign in through the protected portal."
        showLoginLink
      />
    );
  }

  const customers = getCustomersByEmail(authenticatedEmail);
  const profiles = getPortalWorkbookProfilesByEmail(authenticatedEmail);
  const selectedAccountKey = normalizeAccountNumber(selectedAccountNumber);
  const matchedCustomer = selectedAccountKey
    ? getCustomerByEmailAndAccount(authenticatedEmail, selectedAccountKey)
    : customers[0];
  const matchedProfile = selectedAccountKey
    ? getPortalWorkbookProfileByEmail(authenticatedEmail, selectedAccountKey)
    : profiles[0];
  const resolvedAccountNumber =
    matchedProfile?.account?.accountNumber ||
    matchedProfile?.person.accountNumber ||
    matchedCustomer?.accountNumber ||
    "";
  const dashboardState = getPortalDashboardV1ByAccount(resolvedAccountNumber);
  const selectableAccountCount = new Set([
    ...customers.map((customer) => normalizeAccountNumber(customer.accountNumber)),
    ...profiles.map((profile) =>
      normalizeAccountNumber(
        profile.account?.accountNumber || profile.person.accountNumber
      )
    ),
  ]).size;

  if (
    selectableAccountCount > 1 &&
    (!selectedAccountKey || (!matchedCustomer && !matchedProfile))
  ) {
    return (
      <PortalAccountSelector
        authenticatedEmail={authenticatedEmail}
        customers={customers}
        profiles={profiles}
      />
    );
  }

  return (
    <PortalDashboardContent
      authenticatedEmail={authenticatedEmail}
      customer={matchedCustomer}
      workbookProfile={matchedProfile}
      dashboardState={dashboardState}
      isLocalhostDevelopment={isLocalhostDevelopment}
      selectableAccountCount={selectableAccountCount}
    />
  );
}
