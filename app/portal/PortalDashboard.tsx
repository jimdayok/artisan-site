import Link from "next/link";
import Image from "next/image";
import { forbidden } from "next/navigation";
import { PortalPerformanceCharts } from "./PortalPerformanceCharts";
import {
  Activity,
  BadgeCheck,
  BookOpen,
  CircleDollarSign,
  ExternalLink,
  Eye,
  Glasses,
  Home,
  Layers,
  LogOut,
  Mail,
  MapPin,
  Minus,
  Newspaper,
  Package,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
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
  type PortalCustomer,
  type PortalSection,
} from "@/lib/portal/customers";
import {
  getAuthorizedPortalCustomer,
  getAuthorizedPortalCustomers,
} from "@/lib/portal/portalAuthorization";
import { normalizeAssignedPriceListCodes } from "@/lib/portal/assignedPriceLists";
import { loadPortalUserAccess } from "@/lib/portal/userDataAccess";
import { getPriceListByCode, type PortalPriceList } from "@/lib/portal/priceLists";
import { canonicalPriceListCode } from "@/lib/portal/priceLists";
import {
  getPortalWorkbookProfileByEmail,
  getPortalWorkbookProfilesByEmail,
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
import {
  PracticePerformanceScoreChart,
  ServiceExcellenceCharts,
  MonthlyUsageCharts,
  TrendsPerformanceCharts,
  type MixPoint,
  type MonthlyUsagePoint,
  type QualityPoint,
  type TrendPoint,
} from "./PracticeIntelligenceCharts";
import {
  calculatePracticePerformanceScore,
  type PracticePerformanceScoreFactors,
} from "@/lib/portal/performanceScore";

const PORTAL_ACCESS_LOGIN_URL = portalAccessLoginUrl();
const PORTAL_ACCESS_LOGOUT_URL =
  "/cdn-cgi/access/logout?returnTo=/portal";
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
  isEmployee,
}: {
  practiceName: string;
  hasMultipleAccounts?: boolean;
  isAdminPreview?: boolean;
  isEmployee?: boolean;
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
          {isEmployee ? (
            <Link
              href="/portal/employee-resources"
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#b89a61] bg-[#fffaf1] px-4 transition hover:bg-white"
            >
              <ShieldCheck className="h-4 w-4" />
              Employee Resources
            </Link>
          ) : null}
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
        <div>
          <p className="font-semibold text-[#172a28]">
            Artisan Lab Network Customer Portal
          </p>
          <p className="mt-1 text-xs">
            © 2026 Artisan Lab Network · This webpage was built and designed by{" "}
            <a
              href="https://d2dmktg.com"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[#8b7650] transition hover:text-[#172a28]"
            >
              D2D Marketing
            </a>
            .
          </p>
        </div>
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

function LocalTestLoginPanel({ emails }: { emails: string[] }) {
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
              defaultValue={emails[0]}
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
  priceList: PortalPriceList & { configured: boolean };
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
        {!priceList.configured ? (
          <p className="mt-2 text-sm font-semibold text-[#172a28]">
            Assigned from account data. Contact portal support for download format.
          </p>
        ) : null}
        {priceList.configured && !priceList.r2Key ? (
          <p className="mt-2 text-sm font-semibold text-[#172a28]">
            Interactive pricing available in portal.
          </p>
        ) : null}
      </div>
      <div className="mt-6 flex flex-col gap-3">
        {priceList.configured && priceList.onlineUrl ? (
          <Link
            href={
              accountNumber
                ? `${priceList.onlineUrl}?account=${encodeURIComponent(accountNumber)}`
                : priceList.onlineUrl
            }
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#172a28] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#27433f]"
          >
            View {priceList.code} Online Pricing
          </Link>
        ) : null}
        {priceList.configured && priceList.r2Key ? (
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
    href: "/policies",
    cta: "Open Policies",
  },
  {
    section: "performance",
    title: "Performance Review",
    body: "Review monthly lens pairs, purchase mix, premium adoption, and remake activity.",
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
              {formatPortalDate(
                account?.lastShippedDate || dashboardAccount?.latest_ship_date || ""
              )}
            </span>
          </p>
          <p>
            <span className="text-[#d8c49b]">Primary lab</span>
            <br />
            <span className="font-semibold text-white">
              {account?.lastLabName || dashboardAccount?.lab_name || "Not available"}
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
  dashboardAccount,
  customerTypeLabel,
  practiceName,
  accountNumber,
}: {
  account?: PortalWorkbookAccount;
  dashboardAccount?: PortalDashboardV1Account;
  customerTypeLabel?: string;
  practiceName: string;
  accountNumber: string;
}) {
  if (!account && !dashboardAccount && !practiceName && !accountNumber) return null;

  const correctionLink = correctionHref({
    subject: "Portal Account Information Correction",
    practiceName,
    accountNumber,
    details: "Please describe the account information that should be corrected.",
  });
  const addressLines = formatAddressLines(
    account?.fullAddress || dashboardAccount?.address || ""
  );
  const stateZip = [
    account?.state || dashboardAccount?.state,
    account?.zipCode || "",
  ]
    .filter(Boolean)
    .join(" ");
  const phoneNumber = account?.phoneNumber || dashboardAccount?.phone || "";
  const primaryLab = account?.lastLabName || dashboardAccount?.lab_name || "";
  const latestShipDate =
    account?.lastShippedDate || dashboardAccount?.latest_ship_date || "";
  const resolvedCustomerType =
    customerTypeLabel || dashboardAccount?.division || account?.division || "";

  return (
    <section id="account-details" className="scroll-mt-24 border border-[#d8c49b] bg-[#fffaf1]/86 p-6 shadow-[0_24px_90px_rgba(23,42,40,0.13)] backdrop-blur sm:p-9">
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
        <UsageRow label="Phone Number" value={phoneNumber} />
        <UsageRow label="State / ZIP" value={stateZip} />
        <UsageRow label="Primary Lab" value={primaryLab} />
        <UsageRow label="Latest Ship Date" value={formatPortalDate(latestShipDate)} />
        <UsageRow label="Customer Type" value={resolvedCustomerType} />
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
  dashboardAccount,
  authenticatedEmail,
  practiceName,
  accountNumber,
}: {
  workbookProfile?: PortalWorkbookProfile;
  dashboardAccount?: PortalDashboardV1Account;
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

  const assignedUsers = dashboardAccount?.authorized_users ?? [];
  const hasAssignedUsers = assignedUsers.length > 0;

  return (
    <section id="support" className="scroll-mt-24 border border-[#d8c49b] bg-[#fffaf1]/86 p-6 shadow-[0_24px_90px_rgba(23,42,40,0.13)] backdrop-blur sm:p-9">
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
      <div className="mt-6 border-t border-[#d8c49b] pt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b7650]">
          Assigned Users
        </p>
        {hasAssignedUsers ? (
          <div className="mt-3 grid gap-3">
            {assignedUsers.map((user) => (
              <div key={`${user.email}-${user.name}`} className="rounded-[2px] border border-[#eadfce] bg-white/70 p-3">
                <p className="font-semibold text-[#172a28]">{user.name || "Unnamed User"}</p>
                <p className="mt-1 text-sm text-[#625b53]">{user.email}</p>
                <p className="mt-1 text-xs text-[#706759]">
                  {[user.role_type, user.marketing_status].filter(Boolean).join(" · ") || "No role/status provided"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-[#706759]">
            No assigned portal users found for this account.
          </p>
        )}
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

function formatPct(value: unknown) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "0%";
  return `${numeric.toFixed(1)}%`;
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
  const quality = dashboard.quality_metrics;
  const enrollment = dashboard.program_enrollment;
  const userSummary = dashboard.authorized_users_summary;
  const insights = dashboard.customer_insights?.suggestions ?? [];
  const rewardPrograms = enrollment
    ? [
        enrollment.arpmp26 ? "Artisan Rewards PMP (ARPMP26)" : "",
        enrollment.arsql26 ? "Artisan Rewards Sequel (ARSQL26)" : "",
        enrollment.aruty26 ? "Artisan Rewards Unity (ARUTY26)" : "",
      ].filter(Boolean)
    : [];
  const cmWarrantyPct = Number(quality?.warranty_pct?.cm ?? 0);
  const cmOfficeRedoPct = Number(quality?.office_redo_pct?.cm ?? 0);
  const cmLabRedoPct = Number(quality?.lab_redo_pct?.cm ?? 0);
  const redoAlerts = [
    cmWarrantyPct > 5
      ? `Warranty redo is ${formatPct(cmWarrantyPct)} (above 5% average-practice benchmark).`
      : "",
    cmOfficeRedoPct > 10
      ? `Office redo is ${formatPct(cmOfficeRedoPct)} (above 10% average-practice benchmark).`
      : "",
    cmLabRedoPct > 2
      ? `Lab redo is ${formatPct(cmLabRedoPct)} (above 2% average-practice benchmark).`
      : "",
  ].filter(Boolean);

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
          {rewardPrograms.length > 0 ? (
            <p className="mt-2 text-xs text-[#706759]">
              Artisan Rewards: {rewardPrograms.join(" · ")}
            </p>
          ) : null}
          {dashboard.used_price_lists?.length ? (
            <p className="mt-2 text-xs text-[#706759]">
              Used price lists: {dashboard.used_price_lists.join(", ")}
            </p>
          ) : null}
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
          {quality ? (
            <div className="mt-3 border-t border-[#e7d9bb] pt-3 text-xs text-[#706759]">
              <p>
                Lab Redo % (PPM/PM/CM): {formatPct(quality.lab_redo_pct.ppm)} / {formatPct(quality.lab_redo_pct.pm)} / {formatPct(quality.lab_redo_pct.cm)}
              </p>
              <p>
                Office Redo % (PPM/PM/CM): {formatPct(quality.office_redo_pct.ppm)} / {formatPct(quality.office_redo_pct.pm)} / {formatPct(quality.office_redo_pct.cm)}
              </p>
              <p>
                Warranty % (PPM/PM/CM): {formatPct(quality.warranty_pct.ppm)} / {formatPct(quality.warranty_pct.pm)} / {formatPct(quality.warranty_pct.cm)}
              </p>
              <p>
                Non-Adapt % (PPM/PM/CM): {formatPct(quality.non_adapt_pct.ppm)} / {formatPct(quality.non_adapt_pct.pm)} / {formatPct(quality.non_adapt_pct.cm)}
              </p>
            </div>
          ) : null}
          {redoAlerts.length > 0 ? (
            <div className="mt-3 border-t border-[#e7d9bb] pt-3 text-xs text-[#7f2f2f]">
              <p className="font-semibold uppercase tracking-[0.16em] text-[#8b3b3b]">
                Support Alert
              </p>
              <ul className="mt-2 space-y-1">
                {redoAlerts.map((alert) => (
                  <li key={alert}>• {alert}</li>
                ))}
              </ul>
              <a
                href="mailto:sales@artisanlabnetwork.com?subject=Schedule%20Additional%20Support&body=Please%20schedule%20additional%20support%20for%20our%20account.%20We%20are%20seeing%20redo%20percentages%20above%20average-practice%20benchmarks."
                className="mt-2 inline-flex text-xs font-semibold underline decoration-[#8b3b3b] underline-offset-4 hover:text-[#5a1e1e]"
              >
                Contact sales to schedule additional support
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

type PracticeIntelligenceModel = {
  trends: TrendPoint[];
  orderRateTrends: TrendPoint[];
  vspMix: MixPoint[];
  programMix: MixPoint[];
  brandUsage: MonthlyUsagePoint[];
  materialUsage: MonthlyUsagePoint[];
  specialtyUsage: MonthlyUsagePoint[];
  turnaround: MonthlyUsagePoint[];
  quality: QualityPoint[];
  score: number;
  scoreFactors: PracticePerformanceScoreFactors;
  scoreLabel: "Excellent" | "Good" | "Needs Attention";
  reportMonths: {
    prior: string;
    previous: string;
    current: string;
  };
  ppmSales: number;
  pmSales: number;
  cmSales: number;
  ppmJobs: number;
  pmJobs: number;
  cmJobs: number;
  priorJpd: number | null;
  currentJpd: number | null;
  previousJpd: number | null;
  labTurnaround: MonthlyUsagePoint[];
  vspShare: number;
  privatePayShare: number;
  salesTrend: ReturnType<typeof getPercentChange>;
  jobsTrend: ReturnType<typeof getPercentChange>;
  jpdTrend: ReturnType<typeof getPercentChange> | null;
  opportunities: Array<{
    title: string;
    priority: "green" | "yellow" | "red";
    current: string;
    why: string;
    action: string;
  }>;
  programs: Array<{
    title: string;
    status: "Active" | "Not Recorded";
    value: string;
    detail: string;
    href: string;
  }>;
  rewards: Array<{
    title: string;
    code: "ARPMP26" | "ARUTY26" | "ARSQL26";
    qualifiedLabel: string;
    payoutLabel: string;
    pmQualifiedOrders: number;
    pmPayout: number;
    cmQualifiedOrders: number;
    cmPayout: number;
    tier: string;
    tierFill: number;
    pmMonth: string;
    cmMonth: string;
  }>;
  targetInvitations: Array<{
    program: "ARUTY26" | "ARSQL26" | string;
    title: string;
    detail: string;
    benefits: string[];
    href: string;
  }>;
};

function asNumber(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function pctValue(value: unknown) {
  const numeric = asNumber(value);
  return numeric <= 1 ? numeric * 100 : numeric;
}

function isActiveUsage(value?: string) {
  const normalized = (value ?? "").trim().toLowerCase();
  return Boolean(normalized && !["0", "0%", "false", "no", "none", "n/a", "na"].includes(normalized));
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function monthlyPoint(label: string, value?: { ppm?: number; pm?: number; cm?: number }): MonthlyUsagePoint {
  return {
    label,
    prior: asNumber(value?.ppm),
    previous: asNumber(value?.pm),
    current: asNumber(value?.cm),
  };
}

function monthlySharePoint(
  label: string,
  value: { ppm?: number; pm?: number; cm?: number } | undefined,
  totals: { ppm: number; pm: number; cm: number }
): MonthlyUsagePoint {
  const share = (numerator: unknown, denominator: number) => {
    if (!denominator) return 0;
    return (asNumber(numerator) / denominator) * 100;
  };

  return {
    label,
    prior: share(value?.ppm, totals.ppm),
    previous: share(value?.pm, totals.pm),
    current: share(value?.cm, totals.cm),
  };
}

function hasUsageData(points: MonthlyUsagePoint[]) {
  return points.some((point) => point.prior > 0 || point.previous > 0 || point.current > 0);
}

function rewardTrendLabel(current: number, previous: number, unit: string) {
  const trend = getPercentChange(current, previous);
  if (trend.direction === "flat") return `Flat vs previous month (${formatCount(previous)} ${unit})`;
  return `${trend.label} vs previous month (${formatCount(previous)} ${unit})`;
}

function monthlyTierLabel(jobs: number) {
  if (jobs > 100) return "Tier 4";
  if (jobs >= 61) return "Tier 3";
  if (jobs >= 21) return "Tier 2";
  return "Tier 1";
}

function tierFillFromJobs(jobs: number) {
  if (jobs > 100) return 100;
  if (jobs >= 61) return 75;
  if (jobs >= 21) return 50;
  return 25;
}

function relativeMonthLabel(offset: number, anchorDate?: string) {
  const parsed = anchorDate ? new Date(`${anchorDate}T00:00:00Z`) : new Date();
  const anchor = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(
    new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() - offset, 1))
  );
}

function nthWeekdayOfMonth(year: number, monthIndex: number, weekday: number, ordinal: number) {
  const first = new Date(year, monthIndex, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  return new Date(year, monthIndex, 1 + offset + (ordinal - 1) * 7);
}

function lastWeekdayOfMonth(year: number, monthIndex: number, weekday: number) {
  const last = new Date(year, monthIndex + 1, 0);
  const offset = (last.getDay() - weekday + 7) % 7;
  return new Date(year, monthIndex, last.getDate() - offset);
}

function observedHoliday(date: Date) {
  const observed = new Date(date);
  if (date.getDay() === 0) observed.setDate(date.getDate() + 1);
  if (date.getDay() === 6) observed.setDate(date.getDate() - 1);
  return observed;
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function nationalHolidayKeys(year: number) {
  return new Set(
    [
      observedHoliday(new Date(year, 0, 1)),
      nthWeekdayOfMonth(year, 0, 1, 3),
      nthWeekdayOfMonth(year, 1, 1, 3),
      lastWeekdayOfMonth(year, 4, 1),
      observedHoliday(new Date(year, 5, 19)),
      observedHoliday(new Date(year, 6, 4)),
      nthWeekdayOfMonth(year, 8, 1, 1),
      nthWeekdayOfMonth(year, 9, 1, 2),
      observedHoliday(new Date(year, 10, 11)),
      nthWeekdayOfMonth(year, 10, 4, 4),
      observedHoliday(new Date(year, 11, 25)),
    ].map(dateKey)
  );
}

function businessDaysInMonth(anchorDate: string) {
  const parsed = anchorDate ? new Date(`${anchorDate}T00:00:00`) : new Date();
  const year = Number.isNaN(parsed.getTime()) ? new Date().getFullYear() : parsed.getFullYear();
  const monthIndex = Number.isNaN(parsed.getTime()) ? new Date().getMonth() : parsed.getMonth();
  const holidays = nationalHolidayKeys(year);
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  let days = 0;
  for (let day = 1; day <= lastDay; day += 1) {
    const date = new Date(year, monthIndex, day);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    if (holidays.has(dateKey(date))) continue;
    days += 1;
  }
  return days || 22;
}

function projectedJobsFromJpd(jpd: number | null, businessDays: number) {
  return jpd === null ? 0 : Math.round(jpd * businessDays);
}

function projectedSalesFromPerDay(sales: number, jobs: number, jpd: number | null, businessDays: number) {
  if (!sales || !jobs || !jpd) return sales;
  const salesPerDay = sales / (jobs / jpd);
  return Math.round(salesPerDay * businessDays);
}

function targetProgramTokens(dashboard?: PortalDashboardV1Account) {
  const values = [
    ...(dashboard?.authorized_users ?? []).map((user) => user.targeted_programs),
  ];
  return [...new Set(
    values
      .flatMap((value) => String(value || "").split(/[;,|/]/))
      .map((value) => value.trim().toUpperCase())
      .filter(Boolean)
  )];
}

function buildTargetInvitations(programs: string[]): PracticeIntelligenceModel["targetInvitations"] {
  return programs.flatMap((program) => {
    if (program.includes("ARUTY26")) {
      return [{
        program: "ARUTY26",
        title: "You've been invited to the Unity Rewards Program.",
        detail: "Program: ARUTY26",
        benefits: ["Unity rewards", "Growth incentives", "Program support"],
        href: "https://form.typeform.com/to/WCU5ReWQ",
      }];
    }
    if (program.includes("ARSQL26")) {
      return [{
        program: "ARSQL26",
        title: "You've been invited to the Sequel Rewards Program.",
        detail: "Program: ARSQL26",
        benefits: ["Sequel rewards", "Qualified Sequel PAL incentives", "Program support"],
        href: "https://form.typeform.com/to/WCU5ReWQ",
      }];
    }
    return [];
  });
}

function scoreFromInverseMetric(value: number, goodThreshold: number, badThreshold: number) {
  if (value <= goodThreshold) return 100;
  if (value >= badThreshold) return 35;
  return 100 - ((value - goodThreshold) / (badThreshold - goodThreshold)) * 65;
}

function statusForScore(score: number): PracticeIntelligenceModel["scoreLabel"] {
  if (score >= 82) return "Excellent";
  if (score >= 66) return "Good";
  return "Needs Attention";
}

function buildPracticeIntelligenceModel({
  account,
  dashboard,
  hasModernPackageWarning,
  showNeurolens,
  showSequelRewards,
}: {
  account?: PortalWorkbookAccount;
  dashboard?: PortalDashboardV1Account;
  hasModernPackageWarning: boolean;
  showNeurolens: boolean;
  showSequelRewards: boolean;
}): PracticeIntelligenceModel {
  const jobs = dashboard?.purchase_summary?.jobs;
  const sales = dashboard?.purchase_summary?.sales;
  const cmSales = asNumber(sales?.cm ?? account?.cmSales);
  const pmSales = asNumber(sales?.pm ?? account?.pmSales);
  const ppmSales = asNumber(sales?.ppm ?? account?.ppmSales);
  const cmJobs = asNumber(jobs?.cm ?? account?.cmJobs);
  const pmJobs = asNumber(jobs?.pm ?? account?.pmJobs);
  const ppmJobs = asNumber(jobs?.ppm ?? account?.ppmJobs);
  const mix = dashboard?.vsp_private_pay_mix;
  const vspJobs = asNumber(mix?.vsp_jobs?.cm ?? account?.cmVspJobs);
  const vspShare = pctValue(mix?.vsp_share ?? account?.cmVspSow ?? (cmJobs ? vspJobs / cmJobs : 0));
  const privatePayShare = Math.max(0, 100 - vspShare);
  const currentJpd =
    account && Number.isFinite(Number(account.cmJpd)) && Number(account.cmJpd) > 0
      ? Number(account.cmJpd)
      : cmJobs > 0
        ? cmJobs / 22
        : null;
  const previousJpd =
    account && Number.isFinite(Number(account.pmJpd)) && Number(account.pmJpd) > 0
      ? Number(account.pmJpd)
      : pmJobs > 0
        ? pmJobs / 22
        : null;
  const priorJpd =
    account && Number.isFinite(Number(account.ppmJpd)) && Number(account.ppmJpd) > 0
      ? Number(account.ppmJpd)
      : ppmJobs > 0
        ? ppmJobs / 22
        : null;
  const programFlags = dashboard?.program_usage?.flags;
  const quality = dashboard?.quality_metrics;
  const supplemental = dashboard?.supplemental_intelligence;
  const reportAnchor =
    dashboard?.data_refresh_date || account?.lastShippedDateGlobal || "";
  const reportMonths = {
    prior: relativeMonthLabel(2, reportAnchor),
    previous: relativeMonthLabel(1, reportAnchor),
    current: relativeMonthLabel(0, reportAnchor),
  };
  const warrantyCm = pctValue(quality?.warranty_pct?.cm);
  const warrantyPm = pctValue(quality?.warranty_pct?.pm);
  const warrantyPpm = pctValue(quality?.warranty_pct?.ppm);
  const officeRedoCm = pctValue(quality?.office_redo_pct?.cm);
  const officeRedoPm = pctValue(quality?.office_redo_pct?.pm);
  const officeRedoPpm = pctValue(quality?.office_redo_pct?.ppm);
  const labRedoCm = pctValue(quality?.lab_redo_pct?.cm);
  const labRedoPm = pctValue(quality?.lab_redo_pct?.pm);
  const labRedoPpm = pctValue(quality?.lab_redo_pct?.ppm);
  const nonAdaptCm = pctValue(quality?.non_adapt_pct?.cm);
  const nonAdaptPm = pctValue(quality?.non_adapt_pct?.pm);
  const nonAdaptPpm = pctValue(quality?.non_adapt_pct?.ppm);
  const turnaroundPm = asNumber(supplemental?.turnaround?.average_days?.pm);
  const labTurnaroundPm = asNumber(supplemental?.turnaround?.lab_average_days?.pm);
  const orderTrendPercent =
    previousJpd !== null && priorJpd !== null && priorJpd > 0
      ? (previousJpd / priorJpd) * 100
      : 0;
  const performanceScore = calculatePracticePerformanceScore({
    previousMonthTurnaround: turnaroundPm,
    previousMonthOrderTrend: orderTrendPercent,
    previousMonthOfficeRemakes: officeRedoPm,
    previousMonthLabRemakes: labRedoPm,
  });
  const score = performanceScore.score;
  const trends = [
    { label: reportMonths.prior, sales: ppmSales, jobs: ppmJobs },
    { label: reportMonths.previous, sales: pmSales, jobs: pmJobs },
    { label: `${reportMonths.current} MTD`, sales: cmSales, jobs: cmJobs },
  ];
  const orderRateTrends = [
    { label: reportMonths.prior, sales: 0, jobs: priorJpd ?? 0 },
    { label: reportMonths.previous, sales: 0, jobs: previousJpd ?? 0 },
    { label: `${reportMonths.current} MTD`, sales: 0, jobs: currentJpd ?? 0 },
  ];
  const programMix = [
    { label: "Modern Frame", value: isActiveUsage(account?.modernFrmUsage) || programFlags?.modern_frame ? 82 : 18, color: "#1f8a70" },
    { label: "ChemClip", value: isActiveUsage(account?.chemClipUsage) || programFlags?.chemclip ? 68 : 14, color: "#2f5f9c" },
    { label: "Tokai", value: isActiveUsage(account?.tokaiUsage) || programFlags?.tokai ? 70 : 12, color: "#c9a24f" },
    { label: "SpecCheck", value: isActiveUsage(account?.specCheckUsage) || programFlags?.speccheck ? 64 : 10, color: "#c96856" },
  ];
  const opportunities: PracticeIntelligenceModel["opportunities"] = [];
  if (cmJobs < pmJobs) {
    // Current month is directional only; PM vs PPM JPD below is the primary volume-health signal.
  }
  if (previousJpd !== null && priorJpd !== null && previousJpd < priorJpd) {
    const decline = ((previousJpd - priorJpd) / priorJpd) * 100;
    opportunities.push({
      title: "Orders per day declining",
      priority: "red",
      current: `${reportMonths.previous} ${previousJpd.toFixed(1)} OPD vs ${reportMonths.prior} ${priorJpd.toFixed(1)} OPD · Down ${Math.abs(decline).toFixed(0)}%`,
      why: "ALN evaluates customer health using orders per day because it normalizes for calendar timing.",
      action: "Consider staff retraining, marketing support, and multiple-pair promotions.",
    });
  }
  if (pmSales < ppmSales) {
    const decline = ppmSales > 0 ? ((pmSales - ppmSales) / ppmSales) * 100 : 0;
    opportunities.push({
      title: "Purchases declining",
      priority: "red",
      current: `${reportMonths.previous} ${formatMoney(pmSales)} vs ${reportMonths.prior} ${formatMoney(ppmSales)} · ${Math.abs(decline).toFixed(0)}% down`,
      why: "Previous month purchases are the primary account activity signal.",
      action: "Review patient flow, premium recommendation consistency, and complete-pair capture.",
    });
  }
  if (officeRedoPm > officeRedoPpm + 0.5) {
    opportunities.push({
      title: "High office remakes",
      priority: "red",
      current: `${reportMonths.previous} ${officeRedoPm.toFixed(1)}% vs ${reportMonths.prior} ${officeRedoPpm.toFixed(1)}%`,
      why: "Office remake increases usually point to measurement, progressive fitting, or frame-selection issues.",
      action: "Review measurements, progressive fitting, and frame selection with the team.",
    });
  }
  if (labRedoPm > labRedoPpm + 0.5) {
    opportunities.push({
      title: "High lab remakes",
      priority: "red",
      current: `${reportMonths.previous} ${labRedoPm.toFixed(1)}% vs ${reportMonths.prior} ${labRedoPpm.toFixed(1)}%`,
      why: "Lab remake increases should be reviewed with Artisan support so causes are identified quickly.",
      action: "Contact Artisan support for a remake review.",
    });
  }
  if (turnaroundPm > 0 && labTurnaroundPm > 0 && turnaroundPm > labTurnaroundPm + 1) {
    opportunities.push({
      title: "Turnaround above lab average",
      priority: "yellow",
      current: `Your ${reportMonths.previous} turnaround ${turnaroundPm.toFixed(1)} days vs lab ${labTurnaroundPm.toFixed(1)} days`,
      why: "Turnaround is measured as average business days in lab production, excluding shipping and frame wait.",
      action: "Review order complexity, frame availability, and support tickets with the lab team.",
    });
  }
  opportunities.push(
    {
      title: "Activate Tokai",
      priority: isActiveUsage(account?.tokaiUsage) || programFlags?.tokai ? "green" : "yellow",
      current: isActiveUsage(account?.tokaiUsage) || programFlags?.tokai ? "Program activity detected" : "No current usage detected",
      why: "Tokai can support specialty and high-index cases when the practice has appropriate demand.",
      action: "Introduce Tokai for high-index and specialty cases.",
    }
  );
  if (vspJobs > 0 || vspShare > 0) {
    opportunities.push({
      title: vspShare < 25 ? "VSP availability reminder" : "VSP education opportunity",
      priority: vspShare < 25 ? "green" : "yellow",
      current: `${Math.round(vspShare)}% VSP mix`,
      why:
        vspShare < 25
          ? "VSP is available through our labs when the practice wants to route eligible VSP work through Artisan."
          : "VSP activity is present, so education and quoting resources may improve confidence at the counter.",
      action: "To maximize VSP reimbursements through available incentives, talk to us to learn more.",
    });
  }
  opportunities.push(
    {
      title: "Reduce Remakes",
      priority: warrantyPm > 5 || officeRedoPm > 10 || labRedoPm > 2 ? "red" : "green",
      current: `${reportMonths.previous} Warranty ${warrantyPm.toFixed(1)}% · Office ${officeRedoPm.toFixed(1)}% · Lab ${labRedoPm.toFixed(1)}%`,
      why: "Remake, warranty, and non-adapt rates directly affect chair time, patient trust, and margin.",
      action:
        warrantyPm > 5 || officeRedoPm > 10 || labRedoPm > 2
          ? "Leverage our partnership with OTI's online web portal for staff training; special rates apply."
          : "Keep using consistent measurements, frame adjustment checks, and remake notes to protect chair time.",
    },
    {
      title: "Improve Frame Package Usage",
      priority: hasModernPackageWarning ? "yellow" : "green",
      current: isActiveUsage(account?.modernPkgUsage) ? account?.modernPkgUsage || "Active" : "No current usage recorded",
      why: "Frame package participation can simplify quoting and strengthen program value for complete-pair purchases.",
      action: "Review Artisan Frame Systems M5 for everyday packages and Artisan Safety Systems Y5 for safety package opportunities.",
    }
  );
  const brandUsage = [
    monthlyPoint("Hoya", supplemental?.brand_usage?.hoya_jobs),
    monthlyPoint("Shamir", supplemental?.brand_usage?.shamir_jobs),
    monthlyPoint("Tokai", supplemental?.brand_usage?.tokai_jobs),
    monthlyPoint("Varilux", supplemental?.brand_usage?.varilux_jobs),
    monthlyPoint("Neurolens", supplemental?.brand_usage?.neurolens_jobs),
    monthlyPoint("Sequel", supplemental?.brand_usage?.sequel_jobs),
    monthlyPoint("IOT Artisan", supplemental?.brand_usage?.iot_artisan_jobs),
  ];
  const materialUsage = [
    monthlySharePoint("Plastic", supplemental?.material_usage?.plastic_jobs, { ppm: ppmJobs, pm: pmJobs, cm: cmJobs }),
    monthlySharePoint("Trivex", supplemental?.material_usage?.trivex_jobs, { ppm: ppmJobs, pm: pmJobs, cm: cmJobs }),
    monthlySharePoint("1.60", supplemental?.material_usage?.hi_index_160_jobs, { ppm: ppmJobs, pm: pmJobs, cm: cmJobs }),
    monthlySharePoint("1.67", supplemental?.material_usage?.hi_index_167_jobs, { ppm: ppmJobs, pm: pmJobs, cm: cmJobs }),
    monthlySharePoint("1.74", supplemental?.material_usage?.hi_index_174_jobs, { ppm: ppmJobs, pm: pmJobs, cm: cmJobs }),
  ];
  const specialtyUsage = [
    monthlySharePoint("Photochromic", supplemental?.specialty_usage?.photochromic_jobs, { ppm: ppmJobs, pm: pmJobs, cm: cmJobs }),
    monthlySharePoint("Polarized", supplemental?.specialty_usage?.polarized_jobs, { ppm: ppmJobs, pm: pmJobs, cm: cmJobs }),
    monthlySharePoint("Multiple Pairs", supplemental?.specialty_usage?.multiple_pair_jobs, { ppm: ppmJobs, pm: pmJobs, cm: cmJobs }),
  ];
  const turnaround = [
    monthlyPoint(reportMonths.prior, { cm: supplemental?.turnaround?.average_days?.ppm }),
    monthlyPoint(reportMonths.previous, { cm: supplemental?.turnaround?.average_days?.pm }),
    monthlyPoint(`${reportMonths.current} MTD`, { cm: supplemental?.turnaround?.average_days?.cm }),
  ];
  const labTurnaround = [
    monthlyPoint(reportMonths.prior, { cm: supplemental?.turnaround?.lab_average_days?.ppm }),
    monthlyPoint(reportMonths.previous, { cm: supplemental?.turnaround?.lab_average_days?.pm }),
    monthlyPoint(`${reportMonths.current} MTD`, { cm: supplemental?.turnaround?.lab_average_days?.cm }),
  ];
  const rewards: PracticeIntelligenceModel["rewards"] = [];
  const rewardsData = supplemental?.rewards;
  const pmMonth = reportMonths.previous;
  const cmMonth = reportMonths.current;
  const rewardTier = monthlyTierLabel(pmJobs);
  const rewardTierFill = tierFillFromJobs(pmJobs);
  if (rewardsData?.arpmp26?.enrolled) {
    rewards.push({
      title: "PMP Rewards",
      code: "ARPMP26",
      qualifiedLabel: "Qualified PMP Orders",
      payoutLabel: "Total Rebate",
      pmQualifiedOrders: rewardsData.arpmp26.qualified_pmp_jobs.pm,
      pmPayout: rewardsData.arpmp26.rebate_total.pm,
      cmQualifiedOrders: rewardsData.arpmp26.qualified_pmp_jobs.cm,
      cmPayout: rewardsData.arpmp26.rebate_total.cm,
      tier: rewardTier,
      tierFill: rewardTierFill,
      pmMonth,
      cmMonth,
    });
  }
  if (rewardsData?.aruty26?.enrolled) {
    rewards.push({
      title: "Unity Rewards",
      code: "ARUTY26",
      qualifiedLabel: "Qualified Unity Orders",
      payoutLabel: "Total Rebate",
      pmQualifiedOrders: rewardsData.aruty26.qualified_jobs.pm,
      pmPayout: rewardsData.aruty26.rewards_earned.pm,
      cmQualifiedOrders: rewardsData.aruty26.qualified_jobs.cm,
      cmPayout: rewardsData.aruty26.rewards_earned.cm,
      tier: rewardTier,
      tierFill: rewardTierFill,
      pmMonth,
      cmMonth,
    });
  }
  if (rewardsData?.arsql26?.enrolled) {
    rewards.push({
      title: "Sequel Rewards",
      code: "ARSQL26",
      qualifiedLabel: "Qualified Sequel Orders",
      payoutLabel: "Total Rebate",
      pmQualifiedOrders: rewardsData.arsql26.qualified_sequel_pal_jobs.pm,
      pmPayout: rewardsData.arsql26.rebate_total.pm,
      cmQualifiedOrders: rewardsData.arsql26.qualified_sequel_pal_jobs.cm,
      cmPayout: rewardsData.arsql26.rebate_total.cm,
      tier: rewardTier,
      tierFill: rewardTierFill,
      pmMonth,
      cmMonth,
    });
  }
  const programs: PracticeIntelligenceModel["programs"] = [
    {
      title: "Modern Frame",
      status: isActiveUsage(account?.modernFrmUsage) || programFlags?.modern_frame ? "Active" : "Not Recorded",
      value: account?.modernFrmUsage || "No usage recorded",
      detail: "Frame system participation and growth signal.",
      href: "/provider-resources#modern-frame-system",
    },
    {
      title: "Modern Package",
      status: isActiveUsage(account?.modernPkgUsage) || programFlags?.modern_package ? "Active" : "Not Recorded",
      value: account?.modernPkgUsage || "No usage recorded",
      detail: "Package system participation and complete-pair usage signal.",
      href: "/provider-resources#modern-package-system",
    },
    {
      title: "ChemClip",
      status: isActiveUsage(account?.chemClipUsage) || programFlags?.chemclip ? "Active" : "Not Recorded",
      value: account?.chemClipUsage || "No usage recorded",
      detail: "Specialty clip usage signal.",
      href: "/provider-resources#specialty-systems",
    },
    {
      title: "SpecCheck",
      status: isActiveUsage(account?.specCheckUsage) || programFlags?.speccheck ? "Active" : "Not Recorded",
      value: account?.specCheckUsage || "No usage recorded",
      detail: "SpecCheck usage signal.",
      href: "/provider-resources#speccheck",
    },
    {
      title: "Tokai",
      status: isActiveUsage(account?.tokaiUsage) || programFlags?.tokai ? "Active" : "Not Recorded",
      value: account?.tokaiUsage || "Recommended for specialty growth",
      detail: "Premium high-index and outsourced specialty design path.",
      href: "/provider-resources#tokai",
    },
  ];

  return {
    trends,
    orderRateTrends,
    vspMix: [
      { label: "VSP Orders", value: Math.round(vspShare), color: "#2f5f9c" },
      { label: "Private Pay Orders", value: Math.round(privatePayShare), color: "#1f8a70" },
    ],
    programMix,
    brandUsage,
    materialUsage,
    specialtyUsage,
    turnaround,
    labTurnaround,
    quality: [
      { label: reportMonths.prior, warranty: warrantyPpm, officeRedo: officeRedoPpm, labRedo: labRedoPpm, nonAdapt: pctValue(quality?.non_adapt_pct?.ppm) },
      { label: reportMonths.previous, warranty: warrantyPm, officeRedo: officeRedoPm, labRedo: labRedoPm, nonAdapt: nonAdaptPm },
      { label: `${reportMonths.current} MTD`, warranty: warrantyCm, officeRedo: officeRedoCm, labRedo: labRedoCm, nonAdapt: nonAdaptCm },
    ],
    score,
    scoreFactors: {
      previousMonthTurnaround: performanceScore.factors.previousMonthTurnaround,
      previousMonthOrderTrend: performanceScore.factors.previousMonthOrderTrend,
      previousMonthOfficeRemakes:
        performanceScore.factors.previousMonthOfficeRemakes,
      previousMonthLabRemakes: performanceScore.factors.previousMonthLabRemakes,
    },
    scoreLabel: statusForScore(score),
    reportMonths,
    ppmSales,
    pmSales,
    cmSales,
    ppmJobs,
    pmJobs,
    cmJobs,
    priorJpd,
    currentJpd,
    previousJpd,
    vspShare,
    privatePayShare,
    salesTrend: getPercentChange(pmSales, ppmSales),
    jobsTrend:
      previousJpd !== null && priorJpd !== null
        ? getPercentChange(previousJpd, priorJpd)
        : getPercentChange(pmJobs, ppmJobs),
    jpdTrend:
      previousJpd !== null && priorJpd !== null
        ? getPercentChange(previousJpd, priorJpd)
        : null,
    opportunities,
    programs,
    rewards,
    targetInvitations: buildTargetInvitations(targetProgramTokens(dashboard)),
  };
}

function IntelligenceMetric({
  icon: Icon,
  label,
  value,
  detail,
  trend,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail?: string;
  trend?: ReturnType<typeof getPercentChange>;
}) {
  const trendTone =
    trend?.direction === "up"
      ? "text-[#8ee0bc]"
      : trend?.direction === "down"
        ? "text-[#ffb29e]"
        : "text-white/70";

  return (
    <div className="group rounded-md border border-white/15 bg-white/[0.075] p-4 shadow-[0_18px_44px_rgba(0,0,0,0.12)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/[0.11]">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white/12 text-[#f2d88f]">
          <Icon className="h-5 w-5" />
        </span>
        {trend ? (
          <span className={`text-xs font-semibold ${trendTone}`}>{trend.label}</span>
        ) : null}
      </div>
      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white/62">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      {detail ? <p className="mt-2 text-xs leading-5 text-white/62">{detail}</p> : null}
    </div>
  );
}

function PracticeIntelligenceHero({
  practiceName,
  accountNumber,
  authenticatedEmail,
  customerTypeLabel,
  account,
  dashboardAccount,
  intelligence,
  adminPreviewAccountName,
}: {
  practiceName: string;
  accountNumber: string;
  authenticatedEmail: string;
  customerTypeLabel?: string;
  account?: PortalWorkbookAccount;
  dashboardAccount?: PortalDashboardV1Account;
  intelligence: PracticeIntelligenceModel;
  adminPreviewAccountName?: string;
}) {
  const primaryLab = account?.lastLabName || dashboardAccount?.lab_name || "Not available";
  const tier = loyaltyTierLabel(
    dashboardAccount?.tier_status?.previous_month_tier_rank_by_acct_id || account?.tier
  ) || "Tier insight pending";
  const lastShipment = account?.lastShippedDate || dashboardAccount?.latest_ship_date || "";
  const dataFreshness = dashboardAccount?.data_refresh_date || "";

  return (
    <section id="overview" className="relative isolate scroll-mt-24 overflow-hidden rounded-md bg-[#13211f] p-5 text-white shadow-[0_34px_100px_rgba(19,33,31,0.28)] sm:p-7 lg:col-span-3">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#13211f_0%,#173f43_42%,#4b5f7f_100%)]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-32 bg-[linear-gradient(90deg,rgba(242,216,143,0.28),rgba(31,138,112,0.2),rgba(47,95,156,0.24))]" />
      <div className="grid gap-8 xl:grid-cols-[1.02fr_1.5fr] xl:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f2d88f]">
            Practice Intelligence Center
          </p>
          <h1 className="mt-4 max-w-4xl break-words text-4xl font-semibold leading-tight text-white sm:text-5xl">
            {dashboardAccount?.business_name || practiceName}
          </h1>
          <div className="mt-5 flex flex-wrap gap-2 text-sm">
            <span className="inline-flex items-center gap-2 rounded-md border border-white/16 bg-white/10 px-3 py-2">
              <MapPin className="h-4 w-4 text-[#f2d88f]" />
              {primaryLab}
            </span>
            <span className="inline-flex items-center gap-2 rounded-md border border-white/16 bg-white/10 px-3 py-2">
              <Trophy className="h-4 w-4 text-[#f2d88f]" />
              {tier}
            </span>
            <span className="inline-flex items-center gap-2 rounded-md border border-white/16 bg-white/10 px-3 py-2">
              <Users className="h-4 w-4 text-[#f2d88f]" />
              {dashboardAccount?.all_account_numbers || accountNumber || "Account pending"}
            </span>
          </div>
          <div className="mt-5 grid gap-2 text-sm text-white/68">
            <p>
              Last shipment: <span className="font-semibold text-white">{formatPortalDate(lastShipment)}</span>
            </p>
            <p>
              Data freshness: <span className="font-semibold text-white">{formatPortalDate(dataFreshness)}</span>
            </p>
            <p>
              {adminPreviewAccountName ? "Admin preview identity" : "Signed in"}: <span className="font-semibold text-white">{authenticatedEmail}</span>
            </p>
            {customerTypeLabel ? (
              <p>
                Relationship: <span className="font-semibold text-white">{customerTypeLabel}</span>
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <IntelligenceMetric
            icon={CircleDollarSign}
            label={`${intelligence.reportMonths.previous} Purchases`}
            value={formatMoney(intelligence.pmSales)}
            trend={intelligence.salesTrend}
            detail={`${intelligence.reportMonths.prior} ${formatMoney(intelligence.ppmSales)}`}
          />
          <IntelligenceMetric
            icon={CircleDollarSign}
            label={`${intelligence.reportMonths.current} Purchases MTD`}
            value={formatMoney(intelligence.cmSales)}
            detail="Actual month-to-date purchases."
          />
          <IntelligenceMetric
            icon={Package}
            label={`${intelligence.reportMonths.previous} Orders`}
            value={formatCount(intelligence.pmJobs)}
            detail={`${intelligence.reportMonths.prior} ${formatCount(intelligence.ppmJobs)}`}
          />
          <IntelligenceMetric
            icon={Activity}
            label={`${intelligence.reportMonths.previous} Orders Per Day`}
            value={intelligence.previousJpd === null ? "Pending" : `${intelligence.previousJpd.toFixed(1)} OPD`}
            trend={intelligence.jobsTrend}
            detail={intelligence.priorJpd === null ? `${intelligence.reportMonths.prior} OPD pending` : `${intelligence.reportMonths.prior} ${intelligence.priorJpd.toFixed(1)} OPD`}
          />
          {intelligence.currentJpd !== null ? (
            <IntelligenceMetric
              icon={Activity}
              label={`${intelligence.reportMonths.current} Orders MTD`}
              value={formatCount(intelligence.cmJobs)}
              detail={`${intelligence.currentJpd.toFixed(1)} actual orders per day MTD`}
            />
          ) : null}
          <IntelligenceMetric
            icon={Target}
            label="VSP / Private Pay"
            value={`${Math.round(intelligence.vspShare)}%`}
            detail={`${Math.round(intelligence.privatePayShare)}% private pay mix`}
          />
          <IntelligenceMetric
            icon={Layers}
            label="Assigned Price Lists"
            value={
              normalizeAssignedPriceListCodes(
                dashboardAccount?.used_price_lists ?? []
              ).join(", ") || "Pending"
            }
            detail="Only assigned customer-facing price sheets are shown."
          />
        </div>
      </div>
    </section>
  );
}

function PracticePerformanceScoreSection({ intelligence }: { intelligence: PracticeIntelligenceModel }) {
  const factorRows = [
    ["Previous Month Turnaround", intelligence.scoreFactors.previousMonthTurnaround],
    ["Previous Month Order Trend", intelligence.scoreFactors.previousMonthOrderTrend],
    ["Previous Month Office Remakes", intelligence.scoreFactors.previousMonthOfficeRemakes],
    ["Previous Month Lab Remakes", intelligence.scoreFactors.previousMonthLabRemakes],
  ] as const;

  return (
    <section className="grid gap-6 rounded-md border border-[#d9c8a6] bg-[#fffdf8]/88 p-5 shadow-[0_24px_70px_rgba(20,39,36,0.09)] sm:p-7 lg:col-span-3 xl:grid-cols-[0.85fr_1.15fr]">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7a6b49]">
          Practice Performance Score Preview
        </p>
        <p className="mt-3 rounded-md border border-[#d9c8a6] bg-white/75 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#59635f]">
          Previous-month turnaround, order trend, and remake scoring
        </p>
        <div className="mt-5">
          <PracticePerformanceScoreChart score={intelligence.score} />
        </div>
        <div className="mt-4 text-center">
          <p className="text-2xl font-semibold text-[#142724]">{intelligence.scoreLabel}</p>
          <p className="mt-1 text-sm font-semibold text-[#1f8a70]">
            Based on {intelligence.reportMonths.previous} results
          </p>
        </div>
      </div>
      <div className="grid content-center gap-3">
        {factorRows.map(([label, value]) => (
          <div key={label} className="grid gap-2 rounded-md border border-[#eadfce] bg-white/70 p-3 sm:grid-cols-[11rem_1fr_3rem] sm:items-center">
            <p className="text-sm font-semibold text-[#142724]">{label}</p>
            <div className="h-2 overflow-hidden rounded-full bg-[#e7ddcc]">
              <div className="h-full rounded-full bg-[#1f8a70]" style={{ width: `${value === 0 ? 0 : Math.max(8, Math.min(100, value))}%` }} />
            </div>
            <p className="text-sm font-semibold text-[#59635f] sm:text-right">
              {value === 0 ? "Placeholder" : Math.round(value)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TierProgressTracker({
  pmJobs,
  cmJobs,
  reportMonths,
}: {
  pmJobs: number;
  cmJobs: number;
  reportMonths: PracticeIntelligenceModel["reportMonths"];
}) {
  const tierLabel = monthlyTierLabel(pmJobs);
  const progress = Math.min(100, Math.max(0, pmJobs));

  return (
    <section className="rounded-md border border-[#d9c8a6] bg-[#fffdf8]/88 p-5 shadow-[0_20px_54px_rgba(20,39,36,0.08)] lg:col-span-3">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7a6b49]">
            Tier Progress Tracker
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-[#142724]">
            Tier Achieved in {reportMonths.previous}: {tierLabel}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#59635f]">
            Tier 1 is 0-20 orders, Tier 2 is 21-60, Tier 3 is 61-100, and Tier 4 is above 100 orders in a month.
          </p>
        </div>
        <div className="grid gap-1 text-sm font-semibold text-[#59635f] md:text-right">
          <p>{formatCount(pmJobs)} orders in {reportMonths.previous} · {progress.toFixed(0)}% toward Tier 4</p>
          <p>{reportMonths.current} MTD: {formatCount(cmJobs)} actual orders</p>
        </div>
      </div>
      <div className="mt-5 h-4 overflow-hidden rounded-full bg-[#e7ddcc]">
        <div className="h-full rounded-full bg-[linear-gradient(90deg,#1f8a70,#c9a24f)] transition-all duration-700" style={{ width: `${Math.max(8, progress)}%` }} />
      </div>
    </section>
  );
}

function DailyTrendSummary({ intelligence }: { intelligence: PracticeIntelligenceModel }) {
  const current = intelligence.currentJpd;
  const previous = intelligence.previousJpd;
  const prior = intelligence.priorJpd;

  return (
    <section className="mt-5 rounded-md border border-[#d9c8a6] bg-[#fffdf8]/88 p-5 shadow-[0_18px_48px_rgba(20,39,36,0.07)]">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7a6b49]">
        Orders Per Day Trend
      </p>
      <div className="mt-3 grid gap-4 md:grid-cols-3">
        <div>
          <p className="text-sm font-semibold text-[#59635f]">{intelligence.reportMonths.previous} orders per day</p>
          <p className="mt-1 text-2xl font-semibold text-[#142724]">
            {previous === null ? "Pending" : previous.toFixed(1)}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#59635f]">{intelligence.reportMonths.prior} orders per day</p>
          <p className="mt-1 text-2xl font-semibold text-[#142724]">
            {prior === null ? "Pending" : prior.toFixed(1)}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#59635f]">{intelligence.reportMonths.current} MTD</p>
          <p className="mt-1 text-sm leading-6 text-[#6d746f]">
            {current === null ? "Pending" : `${current.toFixed(1)} actual orders per day across ${formatCount(intelligence.cmJobs)} month-to-date orders.`}
          </p>
        </div>
      </div>
      <p className="mt-4 rounded-md border border-[#d9c8a6] bg-white/70 px-4 py-3 text-xs font-semibold leading-5 text-[#59635f]">
        {intelligence.reportMonths.current} values are actual month-to-date purchases and orders. No projected totals are shown.
      </p>
    </section>
  );
}

function OpportunitiesCenter({ opportunities }: { opportunities: PracticeIntelligenceModel["opportunities"] }) {
  const tone = {
    green: "border-[#93c9a8] bg-[#f1fbf4] text-[#1f6b45]",
    yellow: "border-[#d8c078] bg-[#fff9e8] text-[#7a5b16]",
    red: "border-[#dfa091] bg-[#fff3ef] text-[#8b3b2d]",
  } satisfies Record<PracticeIntelligenceModel["opportunities"][number]["priority"], string>;

  return (
    <section className="rounded-md border border-[#d9c8a6] bg-[#fffdf8]/88 p-5 shadow-[0_24px_70px_rgba(20,39,36,0.09)] sm:p-7 lg:col-span-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7a6b49]">
            Opportunities Identified
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-[#142724]">Practice growth signals</h2>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-md border border-[#d9c8a6] bg-white/75 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#59635f]">
          <Sparkles className="h-4 w-4 text-[#c9a24f]" />
          AI-ready framework
        </span>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {opportunities.map((item) => (
          <article key={item.title} className="rounded-md border border-[#eadfce] bg-white/78 p-4 shadow-[0_14px_36px_rgba(20,39,36,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(20,39,36,0.1)]">
            <span className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] ${tone[item.priority]}`}>
              {item.priority}
            </span>
            <h3 className="mt-4 text-lg font-semibold text-[#142724]">{item.title}</h3>
            <p className="mt-3 text-sm font-semibold text-[#59635f]">{item.current}</p>
            <p className="mt-3 text-sm leading-6 text-[#6d746f]">{item.why}</p>
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-[#1f8a70]">{item.action}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProgramParticipationCenter({ programs }: { programs: PracticeIntelligenceModel["programs"] }) {
  const statusTone = {
    Active: "bg-[#1f8a70] text-white",
    "Not Recorded": "bg-[#e7ddcc] text-[#59635f]",
  } satisfies Record<PracticeIntelligenceModel["programs"][number]["status"], string>;

  return (
    <section className="rounded-md border border-[#d9c8a6] bg-[#fffdf8]/88 p-5 shadow-[0_24px_70px_rgba(20,39,36,0.09)] sm:p-7 lg:col-span-3">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7a6b49]">
        Growth Program Center
      </p>
      <h2 className="mt-2 text-3xl font-semibold text-[#142724]">Growth programs and packages</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {programs.map((program) => (
          <Link key={program.title} href={program.href} className="rounded-md border border-[#eadfce] bg-white/78 p-4 transition hover:-translate-y-0.5 hover:border-[#1f8a70]">
            <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${statusTone[program.status]}`}>
              {program.status}
            </span>
            <h3 className="mt-4 text-xl font-semibold text-[#142724]">{program.title}</h3>
            <p className="mt-2 text-sm font-semibold text-[#59635f]">{program.value}</p>
            <p className="mt-3 text-sm leading-6 text-[#6d746f]">{program.detail}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function RewardsCenter({ rewards }: { rewards: PracticeIntelligenceModel["rewards"] }) {
  if (rewards.length === 0) return null;

  return (
    <section className="rounded-md border border-[#d9c8a6] bg-[#fffdf8]/88 p-5 shadow-[0_24px_70px_rgba(20,39,36,0.09)] sm:p-7 lg:col-span-3">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7a6b49]">
        Rewards Center
      </p>
      <h2 className="mt-2 text-3xl font-semibold text-[#142724]">Active enrolled rewards</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[#59635f]">
        Previous month rewards are the payout reference for customer service. Current month activity is month-to-date.
      </p>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {rewards.map((reward) => (
          <article key={reward.code} className="rounded-md border border-[#d9c8a6] bg-white/82 p-5 shadow-[0_18px_44px_rgba(20,39,36,0.07)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex rounded-md bg-[#1f8a70] px-2.5 py-1 text-xs font-bold text-white">Enrolled</span>
                <h3 className="mt-4 text-2xl font-semibold text-[#142724]">{reward.title}</h3>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-[#7a6b49]">{reward.code}</p>
              </div>
              <div
                className="grid h-20 w-20 shrink-0 place-items-center rounded-full"
                style={{ background: `conic-gradient(#1f8a70 0 ${reward.tierFill}%, #e7ddcc ${reward.tierFill}% 100%)` }}
                aria-label={`${reward.tier} loyalty tier`}
              >
                <div className="grid h-14 w-14 place-items-center rounded-full bg-white text-center text-xs font-bold text-[#142724]">
                  {reward.tier}
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-md border border-[#1f8a70]/35 bg-[#f1fbf4] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1f6b45]">{reward.pmMonth} Rewards</p>
              <p className="mt-2 text-5xl font-semibold tracking-[-0.05em] text-[#142724]">{formatMoney(reward.pmPayout)}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-md bg-white/78 p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#7a6b49]">{reward.pmMonth} Qualified Orders</p>
                  <p className="mt-1 text-2xl font-semibold text-[#142724]">{formatCount(reward.pmQualifiedOrders)}</p>
                </div>
                <div className="rounded-md bg-white/78 p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#7a6b49]">{reward.pmMonth} Loyalty Tier</p>
                  <p className="mt-1 text-2xl font-semibold text-[#142724]">{reward.tier}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Package className="h-5 w-5 text-[#1f8a70]" />
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#d9ebdf]">
                  <div className="h-full rounded-full bg-[#1f8a70]" style={{ width: `${reward.tierFill}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-md border border-[#eadfce] bg-[#fffdf8] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7a6b49]">{reward.cmMonth} MTD</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <p className="text-sm font-semibold text-[#59635f]">
                  Qualified Orders: <span className="text-[#142724]">{formatCount(reward.cmQualifiedOrders)}</span>
                </p>
                <p className="text-sm font-semibold text-[#59635f]">
                  Current Rewards: <span className="text-[#142724]">{formatMoney(reward.cmPayout)}</span>
                </p>
              </div>
              <p className="mt-3 text-xs leading-5 text-[#6d746f]">
                Current month rewards are month-to-date; {reward.pmMonth} remains the payout reference.
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function RemakePerformanceCenter({
  quality,
  reportMonths,
}: {
  quality: QualityPoint[];
  reportMonths: PracticeIntelligenceModel["reportMonths"];
}) {
  const current = quality[quality.length - 1];
  const previous = quality[quality.length - 2];
  const prior = quality[0];
  const metrics = [
    { label: "Warranty Remake", current: current?.warranty ?? 0, previous: previous?.warranty ?? 0, prior: prior?.warranty ?? 0 },
    { label: "Office Remake", current: current?.officeRedo ?? 0, previous: previous?.officeRedo ?? 0, prior: prior?.officeRedo ?? 0 },
    { label: "Lab Remake", current: current?.labRedo ?? 0, previous: previous?.labRedo ?? 0, prior: prior?.labRedo ?? 0 },
    { label: "Non-Adapt", current: current?.nonAdapt ?? 0, previous: previous?.nonAdapt ?? 0, prior: prior?.nonAdapt ?? 0 },
  ];

  return (
    <section className="rounded-md border border-[#d9c8a6] bg-[#fffdf8]/88 p-5 shadow-[0_24px_70px_rgba(20,39,36,0.09)] sm:p-7 lg:col-span-3">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7a6b49]">
        Remake Intelligence
      </p>
      <h2 className="mt-2 text-3xl font-semibold text-[#142724]">Quality and remake signals</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6d746f]">
        These rates use the remake percentages in the unified account record. {reportMonths.previous} is the completed comparison month and {reportMonths.current} is month-to-date.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const change = metric.current - metric.previous;
          const isWorse = change > 0.05;
          const isBetter = change < -0.05;

          return (
            <article key={metric.label} className="rounded-md border border-[#eadfce] bg-white/78 p-4">
              <span
                className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-[0.1em] ${
                  isWorse
                    ? "bg-[#fff3ef] text-[#8b3b2d]"
                    : isBetter
                      ? "bg-[#f1fbf4] text-[#1f6b45]"
                      : "bg-[#e7ddcc] text-[#59635f]"
                }`}
              >
                {isWorse ? "Increased" : isBetter ? "Improved" : "Flat"}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-[#142724]">{metric.label}</h3>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md border border-[#eadfce] bg-[#fffdf8] p-2">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#7a6b49]">{reportMonths.prior}</p>
                  <p className="mt-1 text-sm font-semibold text-[#142724]">{metric.prior.toFixed(1)}%</p>
                </div>
                <div className="rounded-md border border-[#d9c8a6] bg-[#fffaf1] p-2">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#7a6b49]">{reportMonths.previous}</p>
                  <p className="mt-1 text-sm font-semibold text-[#142724]">{metric.previous.toFixed(1)}%</p>
                </div>
                <div className="rounded-md border border-[#eadfce] bg-[#fffdf8] p-2">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#7a6b49]">{reportMonths.current} MTD</p>
                  <p className="mt-1 text-sm font-semibold text-[#142724]">{metric.current.toFixed(1)}%</p>
                </div>
              </div>
              <p className="mt-2 text-sm text-[#6d746f]">
                {reportMonths.previous} vs {reportMonths.prior} {metric.previous - metric.prior >= 0 ? "+" : ""}
                {(metric.previous - metric.prior).toFixed(1)} pts
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function TurnaroundBenchmarkCenter({
  turnaround,
  labTurnaround,
  reportMonths,
}: {
  turnaround: MonthlyUsagePoint[];
  labTurnaround: MonthlyUsagePoint[];
  reportMonths: PracticeIntelligenceModel["reportMonths"];
}) {
  const pmCustomer = turnaround[1]?.current ?? 0;
  const pmLab = labTurnaround[1]?.current ?? 0;
  const difference = pmCustomer && pmLab ? pmCustomer - pmLab : 0;

  return (
    <section className="rounded-md border border-[#d9c8a6] bg-[#fffdf8]/88 p-5 shadow-[0_24px_70px_rgba(20,39,36,0.09)] sm:p-7 lg:col-span-3">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7a6b49]">
        Turnaround Performance
      </p>
      <h2 className="mt-2 text-3xl font-semibold text-[#142724]">Your average vs entire lab average</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6d746f]">
        Turnaround Time = Average business days in lab production. Does not include shipping time. Does not include frame wait time.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <DashboardV1Card label={`Your ${reportMonths.previous} Avg Turnaround`} value={pmCustomer ? `${pmCustomer.toFixed(1)} days` : "Pending"} />
        <DashboardV1Card label={`Lab ${reportMonths.previous} Avg Turnaround`} value={pmLab ? `${pmLab.toFixed(1)} days` : "Pending"} />
        <DashboardV1Card
          label="Difference"
          value={pmCustomer && pmLab ? `${difference >= 0 ? "+" : ""}${difference.toFixed(1)} days` : "Pending"}
          detail={difference > 0 ? "Above lab average" : difference < 0 ? "Better than lab average" : "Aligned with lab average"}
        />
      </div>
    </section>
  );
}

function PlaceholderInsightCard({
  title,
  label,
  detail,
}: {
  title: string;
  label: string;
  detail: string;
}) {
  return (
    <article className="rounded-md border border-dashed border-[#d9c8a6] bg-white/72 p-5">
      <span className="inline-flex rounded-md border border-[#d9c8a6] bg-[#f8f1e6] px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#7a6b49]">
        {label}
      </span>
      <h3 className="mt-4 text-xl font-semibold text-[#142724]">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#6d746f]">{detail}</p>
    </article>
  );
}

function ProductBrandIntelligenceSection({
  brandUsage,
  materialUsage,
  specialtyUsage,
  programMix,
  reportMonths,
}: {
  brandUsage: MonthlyUsagePoint[];
  materialUsage: MonthlyUsagePoint[];
  specialtyUsage: MonthlyUsagePoint[];
  programMix: MixPoint[];
  reportMonths: PracticeIntelligenceModel["reportMonths"];
}) {
  return (
    <section className="rounded-md border border-[#d9c8a6] bg-[#fffdf8]/88 p-5 shadow-[0_24px_70px_rgba(20,39,36,0.09)] sm:p-7 lg:col-span-3">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7a6b49]">
        Product Intelligence
      </p>
      <h2 className="mt-2 text-3xl font-semibold text-[#142724]">Counts, usage, and trends</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6d746f]">
        Product reporting uses orders, pairs, and usage counts only. Purchases remain at the account level.
      </p>
      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        {hasUsageData(brandUsage) ? (
          <MonthlyUsageCharts eyebrow="Brand Usage" title="Brand Orders by Month" data={brandUsage} monthLabels={reportMonths} horizontal />
        ) : (
          <PlaceholderInsightCard title="Brand Usage" label="Additional Product Intelligence Coming Soon" detail="Brand count fields are unavailable for this account." />
        )}
        {hasUsageData(materialUsage) ? (
          <MonthlyUsageCharts eyebrow="Material Usage" title="Material Share of Monthly Orders" data={materialUsage} valueType="percent" monthLabels={reportMonths} />
        ) : (
          <PlaceholderInsightCard title="Material Usage" label="Additional Product Intelligence Coming Soon" detail="Material count fields are unavailable for this account." />
        )}
        {hasUsageData(specialtyUsage) ? (
          <MonthlyUsageCharts eyebrow="Specialty Usage" title="Specialty Share of Monthly Orders" data={specialtyUsage} valueType="percent" monthLabels={reportMonths} />
        ) : (
          <PlaceholderInsightCard title="Specialty Usage" label="Additional Product Intelligence Coming Soon" detail="Specialty product count fields are unavailable for this account." />
        )}
        <div className="rounded-md border border-[#eadfce] bg-white/78 p-5">
          <span className="inline-flex rounded-md border border-[#d9c8a6] bg-[#f8f1e6] px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#7a6b49]">
            Status Signals
          </span>
          <h3 className="mt-4 text-xl font-semibold text-[#142724]">Program Mix</h3>
          <div className="mt-4 grid gap-3">
            {programMix.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-[#142724]">{item.label}</span>
                  <span className="text-[#6d746f]">{item.value >= 50 ? "Active" : "Not Recorded"}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e7ddcc]">
                  <div className="h-full rounded-full" style={{ width: `${Math.max(10, item.value)}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BenchmarkingSection() {
  return (
    <section className="rounded-md border border-[#d9c8a6] bg-[#fffdf8]/88 p-5 shadow-[0_24px_70px_rgba(20,39,36,0.09)] sm:p-7 lg:col-span-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7a6b49]">
            Benchmarking
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-[#142724]">Your practice vs the network</h2>
        </div>
        <span className="inline-flex w-fit rounded-md border border-[#d9c8a6] bg-white/75 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#59635f]">
          Benchmarking Available Soon
        </span>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <PlaceholderInsightCard title="Your Practice" label="Coming Soon" detail="Practice-level benchmarks will appear when network comparison data is approved for customer display." />
        <PlaceholderInsightCard title="Network Average" label="Requires Benchmark Dataset" detail="Network averages require a customer-safe benchmark rollup before display." />
        <PlaceholderInsightCard title="Top 25%" label="Future Insight" detail="Top-quartile comparisons will be added once benchmarking definitions are finalized." />
      </div>
    </section>
  );
}

function FormLogoMark() {
  return (
    <span className="inline-grid h-7 w-7 grid-cols-2 gap-1 rounded-md bg-[#172a28] p-1.5" aria-hidden="true">
      <span className="rounded-full bg-[#f2d88f]" />
      <span className="rounded-full bg-[#1f8a70]" />
      <span className="rounded-full bg-white" />
      <span className="rounded-full bg-[#c96856]" />
    </span>
  );
}

function CustomerEngagementCenter({ invitations }: { invitations: PracticeIntelligenceModel["targetInvitations"] }) {
  const forms = [
    {
      title: "Update Contact Information",
      href: "https://form.typeform.com/to/svIIMiD9",
      detail: "Keep names, emails, phone numbers, and account contacts current.",
    },
    {
      title: "Complete Customer Profile",
      href: "https://form.typeform.com/to/QLjV4Oho",
      detail: "Tell us more about your practice, specialties, goals, and support needs.",
    },
    {
      title: "Share Your Artisan Experience",
      href: "https://form.typeform.com/to/iGoDcWlY",
      detail: "Share feedback on service, products, ordering, and partnership experience.",
    },
  ];

  return (
    <section className="rounded-md border border-[#d9c8a6] bg-[#fffdf8]/88 p-5 shadow-[0_24px_70px_rgba(20,39,36,0.09)] sm:p-7 lg:col-span-3">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7a6b49]">
        Help Us Improve Your Experience
      </p>
      <h2 className="mt-2 text-3xl font-semibold text-[#142724]">Customer profile and engagement</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {forms.map((form) => (
          <a key={form.title} href={form.href} target="_blank" rel="noreferrer" className="rounded-md border border-[#eadfce] bg-white/78 p-4 transition hover:-translate-y-0.5 hover:border-[#1f8a70]">
            <span className="inline-flex items-center gap-2 rounded-md border border-[#d9c8a6] bg-[#f8f1e6] px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#7a6b49]">
              <FormLogoMark />
              Form
            </span>
            <h3 className="mt-4 text-lg font-semibold text-[#142724]">{form.title}</h3>
            <p className="mt-3 text-sm leading-6 text-[#6d746f]">{form.detail}</p>
            <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#1f8a70]">
              Open form <ExternalLink className="h-4 w-4" />
            </p>
          </a>
        ))}
      </div>
      {invitations.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {invitations.map((invitation) => (
            <article key={invitation.program} className="rounded-md border border-[#d9c8a6] bg-[#fffaf1] p-5">
              <span className="inline-flex rounded-md bg-[#172a28] px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-white">
                Target Program Invitation
              </span>
              <h3 className="mt-4 text-xl font-semibold text-[#142724]">{invitation.title}</h3>
              <p className="mt-2 text-sm font-semibold text-[#59635f]">{invitation.detail}</p>
              <ul className="mt-3 space-y-1 text-sm leading-6 text-[#6d746f]">
                {invitation.benefits.map((benefit) => (
                  <li key={benefit}>• {benefit}</li>
                ))}
              </ul>
              <a href={invitation.href} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1f8a70] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#172a28]">
                Join Program <ExternalLink className="h-4 w-4" />
              </a>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ResourceCenter({
  availablePriceLists,
  availablePortalSections,
  accountNumber,
  isLocalhostDevelopment,
}: {
  availablePriceLists: Array<PortalPriceList & { configured: boolean }>;
  availablePortalSections: PortalSectionCard[];
  accountNumber: string;
  isLocalhostDevelopment?: boolean;
}) {
  return (
    <section id="price-sheets" className="scroll-mt-24 rounded-md border border-[#d9c8a6] bg-[#fffdf8]/88 p-5 shadow-[0_24px_70px_rgba(20,39,36,0.09)] sm:p-7 lg:col-span-3">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7a6b49]">
        Resource Center
      </p>
      <h2 className="mt-2 text-3xl font-semibold text-[#142724]">Pricing, policies, resources, support</h2>
      <div className="mt-6 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div>
          <h3 className="text-lg font-semibold text-[#142724]">Price Sheets</h3>
          {availablePriceLists.length > 0 ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {availablePriceLists.map((priceList) => (
                <PriceListCard key={priceList.code} priceList={priceList} accountNumber={accountNumber} />
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-md border border-[#eadfce] bg-white/70 p-4 text-sm text-[#59635f]">
              No price sheets have been assigned to this account yet.
            </p>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#142724]">Portal Tools</h3>
          <div className="mt-4 grid gap-3">
            {availablePortalSections.map((card) => (
              <PortalResourceCard key={card.title} card={card} />
            ))}
          </div>
        </div>
      </div>
      <PortalHelpSection isLocalhostDevelopment={isLocalhostDevelopment} />
    </section>
  );
}

function PortalSectionNav() {
  const links = [
    ["Overview", "#overview"],
    ["Trends", "#trends"],
    ["Opportunities", "#opportunities"],
    ["Programs", "#programs"],
    ["Policies", "/policies"],
    ["Price Sheets", "#price-sheets"],
    ["Account Details", "#account-details"],
    ["Support", "#support"],
  ] as const;

  return (
    <nav className="sticky top-3 z-10 rounded-md border border-[#d9c8a6] bg-[#fffdf8]/92 p-2 shadow-[0_18px_50px_rgba(20,39,36,0.1)] backdrop-blur lg:col-span-3">
      <div className="flex gap-2 overflow-x-auto">
        {links.map(([label, href]) => (
          <a
            key={href}
            href={href}
            className="whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#59635f] transition hover:bg-[#172a28] hover:text-white"
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function PracticeIntelligenceCenter({
  practiceName,
  accountNumber,
  customerTypeLabel,
  account,
  dashboardAccount,
  authenticatedEmail,
  adminPreviewAccountName,
  availablePriceLists,
  availablePortalSections,
  isLocalhostDevelopment,
  shouldShowNeurolens,
  shouldShowSequelRewards,
  hasSequelRebateInvitation,
}: {
  practiceName: string;
  accountNumber: string;
  customerTypeLabel?: string;
  account?: PortalWorkbookAccount;
  dashboardAccount?: PortalDashboardV1Account;
  authenticatedEmail: string;
  adminPreviewAccountName?: string;
  availablePriceLists: Array<PortalPriceList & { configured: boolean }>;
  availablePortalSections: PortalSectionCard[];
  isLocalhostDevelopment?: boolean;
  shouldShowNeurolens: boolean;
  shouldShowSequelRewards: boolean;
  hasSequelRebateInvitation: boolean;
}) {
  const intelligence = buildPracticeIntelligenceModel({
    account,
    dashboard: dashboardAccount,
    hasModernPackageWarning: Boolean(account && hasModernPackageSavingsWarning(account)),
    showNeurolens: shouldShowNeurolens,
    showSequelRewards: shouldShowSequelRewards,
  });
  return (
    <>
      <PortalSectionNav />
      <PracticeIntelligenceHero
        practiceName={practiceName}
        accountNumber={accountNumber}
        authenticatedEmail={authenticatedEmail}
        customerTypeLabel={customerTypeLabel}
        account={account}
        dashboardAccount={dashboardAccount}
        intelligence={intelligence}
        adminPreviewAccountName={adminPreviewAccountName}
      />
      <PracticePerformanceScoreSection intelligence={intelligence} />
      <section id="trends" className="scroll-mt-24 lg:col-span-3">
        <TrendsPerformanceCharts trends={intelligence.trends} vspMix={intelligence.vspMix} />
        <DailyTrendSummary intelligence={intelligence} />
      </section>
      <TierProgressTracker
        pmJobs={intelligence.pmJobs}
        cmJobs={intelligence.cmJobs}
        reportMonths={intelligence.reportMonths}
      />
      <div id="opportunities" className="scroll-mt-24 lg:col-span-3">
        <OpportunitiesCenter opportunities={intelligence.opportunities} />
      </div>
      <ProductBrandIntelligenceSection
        brandUsage={intelligence.brandUsage}
        materialUsage={intelligence.materialUsage}
        specialtyUsage={intelligence.specialtyUsage}
        programMix={intelligence.programMix}
        reportMonths={intelligence.reportMonths}
      />
      <section className="lg:col-span-3">
        <ServiceExcellenceCharts
          quality={intelligence.quality}
          orderVolume={intelligence.orderRateTrends}
          turnaround={intelligence.turnaround}
        />
      </section>
      <TurnaroundBenchmarkCenter turnaround={intelligence.turnaround} labTurnaround={intelligence.labTurnaround} reportMonths={intelligence.reportMonths} />
      <RemakePerformanceCenter quality={intelligence.quality} reportMonths={intelligence.reportMonths} />
      <RewardsCenter rewards={intelligence.rewards} />
      <div id="programs" className="scroll-mt-24 lg:col-span-3">
        <ProgramParticipationCenter programs={intelligence.programs} />
      </div>
      <CustomerEngagementCenter invitations={intelligence.targetInvitations} />
      <BenchmarkingSection />
      <ResourceCenter
        availablePriceLists={availablePriceLists}
        availablePortalSections={availablePortalSections}
        accountNumber={accountNumber}
        isLocalhostDevelopment={isLocalhostDevelopment}
      />
    </>
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
  if (!customer && !workbookProfile && dashboardState?.status !== "ok") {
    return (
      <PortalMessage message="Your login was verified, but your account has not yet been assigned portal access. Please contact Artisan Lab Network." />
    );
  }

  const dashboardAssignedPriceLists = dashboardState?.account?.used_price_lists ?? [];
  const effectivePriceListCodes =
    dashboardAssignedPriceLists.length > 0
      ? normalizeAssignedPriceListCodes(dashboardAssignedPriceLists)
      : normalizeAssignedPriceListCodes(customer?.priceLists ?? []);
  const availablePriceLists = effectivePriceListCodes.map((rawCode) => {
    const normalizedCode = rawCode.trim().toUpperCase();
    const configured = getPriceListByCode(normalizedCode);
    if (configured) return { ...configured, configured: true } satisfies PortalPriceList & { configured: boolean };

    return {
      code: normalizedCode as PortalPriceList["code"],
      label: `${normalizedCode} Price Sheet`,
      fileName: `Assigned ${normalizedCode} pricing`,
      r2Key: null,
      onlineUrl: null,
      configured: false,
    } satisfies PortalPriceList & { configured: boolean };
  });
  const availablePortalSections = customer ? visiblePortalSectionCards(customer) : [];
  const account = workbookProfile?.account;
  const practiceName =
    dashboardState?.account?.business_name ||
    account?.accountName ||
    workbookProfile?.person.organization ||
    customer?.practiceName ||
    "Customer";
  const accountNumber =
    dashboardState?.account?.account_id ||
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
          isEmployee={isAdmin && !adminPreviewAccountName}
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
              <Link
                href="/portal/employee-resources"
                className="inline-flex min-h-11 w-fit items-center justify-center rounded-full border border-[#d8c49b] bg-white px-5 py-2 text-sm font-semibold text-[#172a28] transition hover:bg-[#fffaf1]"
              >
                Employee Resources
              </Link>
            </div>
          </section>
        ) : null}

        <PracticeIntelligenceCenter
          practiceName={practiceName}
          accountNumber={accountNumber}
          customerTypeLabel={customerTypeLabel}
          account={account}
          dashboardAccount={dashboardState?.account}
          authenticatedEmail={authenticatedEmail}
          adminPreviewAccountName={adminPreviewAccountName}
          availablePriceLists={availablePriceLists}
          availablePortalSections={availablePortalSections}
          isLocalhostDevelopment={isLocalhostDevelopment}
          shouldShowNeurolens={shouldShowNeurolens}
          shouldShowSequelRewards={shouldShowSequelRewards}
          hasSequelRebateInvitation={hasSequelRebateInvitation}
        />

        <AccountProfileSection
          account={account}
          dashboardAccount={dashboardState?.account}
          customerTypeLabel={customerTypeLabel}
          practiceName={practiceName}
          accountNumber={accountNumber}
        />

        <UserContactSection
          workbookProfile={workbookProfile}
          dashboardAccount={dashboardState?.account}
          authenticatedEmail={authenticatedEmail}
          practiceName={practiceName}
          accountNumber={accountNumber}
        />
      </div>
    </PortalShell>
  );
}

export default async function PortalDashboard({
  headerList,
  selectedAccountNumber,
}: {
  headerList: Headers;
  selectedAccountNumber?: string;
}) {
  const authenticatedEmail = getPortalAuthenticatedEmailFromHeaders(headerList);
  const isLocalhostDevelopment = isLocalhostDevelopmentRequest(headerList);

  if (!authenticatedEmail) {
    if (isLocalhostDevelopment) {
      const workbookAccess = await loadPortalUserAccess();
      const emails = [
        ...(process.env.PORTAL_ADMIN_EMAILS ?? "")
          .split(",")
          .map((email) => email.trim().toLowerCase())
          .filter(Boolean),
        ...workbookAccess.usersByEmail.keys(),
      ].filter((email, index, values) => values.indexOf(email) === index);
      return <LocalTestLoginPanel emails={emails} />;
    }

    return (
      <PortalMessage
        message="Unable to verify your secure login. Please sign in through the protected portal."
        showLoginLink
      />
    );
  }

  const customers = await getAuthorizedPortalCustomers(authenticatedEmail);
  if (!isPortalAdminEmail(authenticatedEmail) && customers.length === 0) {
    forbidden();
  }
  const profiles = getPortalWorkbookProfilesByEmail(authenticatedEmail);
  const selectedAccountKey = normalizeAccountNumber(selectedAccountNumber);
  const matchedCustomer = selectedAccountKey
    ? await getAuthorizedPortalCustomer(authenticatedEmail, selectedAccountKey)
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
    selectedAccountKey &&
    !matchedCustomer &&
    !isPortalAdminEmail(authenticatedEmail)
  ) {
    forbidden();
  }

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
