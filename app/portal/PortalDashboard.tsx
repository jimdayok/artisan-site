import Link from "next/link";
import Image from "next/image";
import { forbidden } from "next/navigation";
import {
  Activity,
  BadgeCheck,
  BookOpen,
  CircleDollarSign,
  ExternalLink,
  Home,
  Layers,
  LogOut,
  MapPin,
  Newspaper,
  Package,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  getCustomerTypeInfoFromProfile,
  hasModernPackageSavingsWarning,
} from "@/lib/portal/accountInsights";
import {
  getConfiguredDevelopmentAdminEmails,
  getPortalAuthenticatedEmailFromHeaders,
  isLocalhostDevelopmentRequest,
} from "@/lib/portal/auth";
import {
  buildPortalOnboardingHref,
  isEligibleOnboardingAccount,
} from "@/lib/portal/onboardingEligibility";
import {
  customerHasPortalSection,
  type PortalCustomer,
  type PortalSection,
} from "@/lib/portal/customers";
import {
  getAuthorizedPortalCustomer,
  getAuthorizedPortalCustomers,
} from "@/lib/portal/portalAuthorization";
import {
  canAccessPortalAdmin,
  getPortalStaffRole,
} from "@/lib/portal/portalRoles";
import { isPortalAdminEmail } from "@/lib/portal/admin";
import { normalizeAssignedPriceListCodes } from "@/lib/portal/assignedPriceLists";
import {
  getPortalWorkbookDiagnostics,
  loadPortalUserAccess,
} from "@/lib/portal/userDataAccess";
import { getPriceListByCode, type PortalPriceList } from "@/lib/portal/priceLists";
import {
  isPackagePriceListCode,
  isVisiblePriceListCode,
  priceListDisplayName,
} from "@/lib/pricing/priceListCodes";
import {
  getPortalWorkbookProfileByEmail,
  getPortalWorkbookProfilesByEmail,
  type PortalWorkbookProfile,
  type PortalWorkbookAccount,
} from "@/lib/portal/workbookAccountData";
import { normalizeAccountNumber } from "@/lib/portal/normalizeAccounts";
import {
  getPortalPeerBenchmarks,
  getPortalDashboardV1ByAccount,
  type PortalPeerBenchmarks,
  type PortalDashboardV1Account,
  type PortalDashboardV1State,
} from "@/lib/portal/dashboardV1";
import {
  ServiceExcellenceCharts,
  MonthlyUsageCharts,
  TrendsPerformanceCharts,
  type MixPoint,
  type MonthlyUsagePoint,
  type QualityPoint,
  type TrendPoint,
} from "./PracticeIntelligenceCharts";

const PORTAL_ACCESS_LOGIN_URL = portalAccessLoginUrl();
const PORTAL_ACCESS_LOGOUT_URL = "/portal/logout";
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-US");

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
  showNewPartnerOnboarding,
  onboardingHref,
}: {
  practiceName: string;
  hasMultipleAccounts?: boolean;
  isAdminPreview?: boolean;
  isEmployee?: boolean;
  showNewPartnerOnboarding?: boolean;
  onboardingHref?: string;
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
          {showNewPartnerOnboarding ? (
            <Link
              href={onboardingHref ?? "/portal/onboarding"}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#d8c49b] px-4 text-[#172a28] shadow-[0_10px_24px_rgba(184,154,97,0.2)] transition hover:bg-[#e4cca0]"
            >
              <BadgeCheck className="h-4 w-4" />
              Onboarding Center
            </Link>
          ) : null}
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

function PortalWorkbookError({
  authenticatedEmail,
  error,
}: {
  authenticatedEmail: string;
  error: unknown;
}) {
  const diagnostics = getPortalWorkbookDiagnostics();
  const errorMessage =
    error instanceof Error ? error.message : "Unable to load portal workbook.";

  return (
    <PortalShell eyebrow="Portal Data Error">
      <section className="max-w-4xl border border-[#c88575] bg-[#fffaf1]/92 p-7 shadow-[0_24px_80px_rgba(23,42,40,0.12)] sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9a4e42]">
          Authorization data unavailable
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#172a28]">
          The portal user workbook could not be loaded.
        </h1>
        <p className="mt-4 text-base leading-7 text-[#706759]">
          Authentication succeeded, but customer authorization could not be
          completed. No customer or account information has been disclosed.
        </p>
        <dl className="mt-7 grid gap-4 border border-[#d8c49b] bg-white/70 p-5 text-sm">
          <div>
            <dt className="font-semibold text-[#172a28]">Authenticated email</dt>
            <dd className="mt-1 break-all text-[#706759]">
              {authenticatedEmail || "Unavailable"}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[#172a28]">Workbook path</dt>
            <dd className="mt-1 break-all text-[#706759]">
              {diagnostics.resolvedPath}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[#172a28]">File exists</dt>
            <dd className="mt-1 text-[#706759]">
              {diagnostics.exists ? "true" : "false"}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[#172a28]">
              Authorization status
            </dt>
            <dd className="mt-1 text-[#706759]">
              blocked: workbook unavailable
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[#172a28]">Error</dt>
            <dd className="mt-1 break-all text-[#706759]">{errorMessage}</dd>
          </div>
        </dl>
      </section>
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
  const exportParams = new URLSearchParams({
    code: priceList.code,
    priceMode: "edged",
  });

  if (accountNumber) {
    downloadParams.set("account", accountNumber);
    exportParams.set("account", accountNumber);
  }

  const generatedExportHref = `/portal/price-list/export?${exportParams.toString()}`;
  const staticDownloadHref = `/api/portal/download?${downloadParams.toString()}`;
  const downloadHref = priceList.generated ? generatedExportHref : staticDownloadHref;
  const canDownload = priceList.configured && (priceList.generated || Boolean(priceList.r2Key));

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
        {canDownload ? (
          <a
            href={downloadHref}
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
        <a
          href={PORTAL_ACCESS_LOGOUT_URL}
          className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#172a28]/20 bg-transparent px-5 py-2 text-sm font-semibold text-[#172a28] transition hover:bg-[#172a28] hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </a>
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
  requiresPackagePriceList?: boolean;
};

const portalSectionCards: PortalSectionCard[] = [
  {
    section: "packages",
    title: "Lens Systems",
    body: "View assigned Artisan, Shamir, Tokai, Varilux, frame, safety, and add-on Lens System pricing.",
    href: "/portal/price-list/packages",
    cta: "Open Lens Systems",
    requiresPackagePriceList: true,
  },
  {
    section: "calculator",
    title: "Price Quote Builder",
    body: "Create an estimated lab price from assigned online pricing.",
    href: "/portal/price-list/calculator",
    cta: "Open Price Quote Builder",
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
    body: "Review your practice trends, practice-controlled remake signals, and average-practice benchmarks without exposing lab-wide totals.",
    href: "/portal/performance",
    cta: "Open Performance",
  },
  {
    section: "onboarding",
    title: "Customer Onboarding Center",
    body: "Open the guided onboarding center for lab contacts, portal access, ordering methods, pricing, safety, shipping, and first orders.",
    href: "/portal/onboarding",
    cta: "Open Onboarding",
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
    if (card.requiresPackagePriceList) {
      return [...assignedCodes].some(isPackagePriceListCode);
    }
    if (!card.requiresPriceList) return true;

    return assignedCodes.has(card.requiresPriceList);
  });
}

function isPortalOnboardingVisible({
  customer,
  workbookProfile,
  dashboardState,
}: {
  customer?: PortalCustomer;
  workbookProfile?: PortalWorkbookProfile;
  dashboardState?: PortalDashboardV1State;
}) {
  if (customer && !customerHasPortalSection(customer, "onboarding")) return false;

  return isEligibleOnboardingAccount([
    customer?.accountNumber,
    workbookProfile?.account?.accountNumber,
    workbookProfile?.person.accountNumber,
    dashboardState?.status === "ok" ? dashboardState.account?.account_id : "",
    dashboardState?.status === "ok" ? dashboardState.account?.all_account_numbers : "",
  ]);
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

function AccountProfileSection({
  account,
  dashboardAccount,
  customerTypeLabel,
  practiceName,
  accountNumber,
  showNewPartnerOnboarding,
  onboardingHref,
}: {
  account?: PortalWorkbookAccount;
  dashboardAccount?: PortalDashboardV1Account;
  customerTypeLabel?: string;
  practiceName: string;
  accountNumber: string;
  showNewPartnerOnboarding?: boolean;
  onboardingHref?: string;
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
      {showNewPartnerOnboarding ? (
        <Link
          href={onboardingHref ?? "/portal/onboarding"}
          className="mt-6 flex flex-col gap-4 border border-[#172a28] bg-[#172a28] p-5 text-white shadow-[0_18px_55px_rgba(23,42,40,0.16)] transition hover:-translate-y-0.5 hover:bg-[#243f3b] sm:flex-row sm:items-center sm:justify-between"
        >
          <span>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#d8c49b]">
              <BadgeCheck className="h-4 w-4" />
              Customer Activation
            </span>
            <span className="mt-3 block text-2xl font-semibold tracking-[-0.03em]">
              Customer Onboarding Center
            </span>
            <span className="mt-2 block text-sm leading-6 text-white/78">
              Use the onboarding center to confirm lab contacts, portal access,
              ordering methods, pricing, safety resources, shipping, and first
              orders.
            </span>
          </span>
          <span className="inline-flex min-h-11 w-fit shrink-0 items-center justify-center rounded-full bg-[#d8c49b] px-5 py-2 text-sm font-semibold text-[#172a28]">
            Open Onboarding
          </span>
        </Link>
      ) : null}
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

type PracticeIntelligenceModel = {
  trends: TrendPoint[];
  orderRateTrends: TrendPoint[];
  vspMix: MixPoint[];
  programMix: MixPoint[];
  brandUsage: MonthlyUsagePoint[];
  materialUsage: MonthlyUsagePoint[];
  highIndexDataPending: boolean;
  specialtyUsage: MonthlyUsagePoint[];
  turnaround: MonthlyUsagePoint[];
  quality: QualityPoint[];
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
  projectedMonthJobs: number | null;
  projectedMonthSales: number | null;
  businessDaysElapsed: number;
  businessDaysInMonth: number;
  currentMonthDataAvailable: boolean;
  previousJpd: number | null;
  vspShare: number;
  privatePayShare: number;
  salesTrend: ReturnType<typeof getPercentChange>;
  jobsTrend: ReturnType<typeof getPercentChange>;
  jpdTrend: ReturnType<typeof getPercentChange> | null;
  peerBenchmarks: PortalPeerBenchmarks;
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

function businessDayProgress(anchor?: string) {
  const parsed = anchor ? new Date(`${anchor.slice(0, 10)}T12:00:00`) : new Date();
  const date = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  let elapsed = 0;
  let total = 0;

  for (let current = 1; current <= new Date(year, month + 1, 0).getDate(); current += 1) {
    const weekday = new Date(year, month, current).getDay();
    if (weekday !== 0 && weekday !== 6) {
      total += 1;
      if (current <= day) elapsed += 1;
    }
  }

  return { elapsed, total };
}

function buildPracticeIntelligenceModel({
  account,
  dashboard,
  hasModernPackageWarning,
}: {
  account?: PortalWorkbookAccount;
  dashboard?: PortalDashboardV1Account;
  hasModernPackageWarning: boolean;
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
  const vspJobs = asNumber(mix?.vsp_jobs?.pm ?? account?.pmVspJobs);
  const vspShare = pctValue(account?.pmVspSow ?? (pmJobs ? vspJobs / pmJobs : 0));
  const privatePayShare = Math.max(0, 100 - vspShare);
  const reportAnchor =
    dashboard?.data_refresh_date || account?.lastShippedDateGlobal || "";
  const businessDays = businessDayProgress(reportAnchor);
  const currentMonthDataAvailable = cmJobs > 0 || cmSales > 0;
  const currentJpd =
    account && Number.isFinite(Number(account.cmJpd)) && Number(account.cmJpd) > 0
      ? Number(account.cmJpd)
      : cmJobs > 0
        ? cmJobs / Math.max(1, businessDays.elapsed)
        : null;
  const projectedMonthJobs =
    currentJpd === null ? null : currentJpd * businessDays.total;
  const projectedMonthSales =
    cmSales > 0 && businessDays.elapsed > 0
      ? (cmSales / businessDays.elapsed) * businessDays.total
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
  const peerBenchmarks = getPortalPeerBenchmarks(dashboard?.account_id || account?.accountNumber);
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
  const nonAdaptCm = pctValue(quality?.non_adapt_pct?.cm);
  const nonAdaptPm = pctValue(quality?.non_adapt_pct?.pm);
  const trends = [
    { label: reportMonths.prior, sales: ppmSales, jobs: ppmJobs },
    { label: reportMonths.previous, sales: pmSales, jobs: pmJobs },
    ...(projectedMonthJobs !== null || projectedMonthSales !== null ? [{
      label: `${reportMonths.current} projected`,
      sales: projectedMonthSales ?? 0,
      jobs: projectedMonthJobs ?? 0,
    }] : []),
  ];
  const orderRateTrends = [
    { label: reportMonths.prior, sales: 0, jobs: priorJpd ?? 0 },
    { label: reportMonths.previous, sales: 0, jobs: previousJpd ?? 0 },
    ...(currentJpd === null ? [] : [{ label: `${reportMonths.current} MTD`, sales: 0, jobs: currentJpd }]),
  ];
  const programMix = [
    { label: "Modern Frame", active: Boolean(isActiveUsage(account?.modernFrmUsage) || programFlags?.modern_frame), color: "#1f8a70" },
    { label: "ChemClip", active: Boolean(isActiveUsage(account?.chemClipUsage) || programFlags?.chemclip), color: "#2f5f9c" },
    { label: "Tokai", active: Boolean(isActiveUsage(account?.tokaiUsage) || programFlags?.tokai), color: "#c9a24f" },
    { label: "SpecCheck", active: Boolean(isActiveUsage(account?.specCheckUsage) || programFlags?.speccheck), color: "#c96856" },
  ].filter((item) => item.active).map((item) => ({ ...item, value: 100 }));
  const opportunities: PracticeIntelligenceModel["opportunities"] = [];
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
  const previousMonthMultiplePairs = asNumber(
    supplemental?.specialty_usage?.multiple_pair_jobs?.pm
  );
  const previousMonthMultiplePairPct = pmJobs > 0
    ? (previousMonthMultiplePairs / pmJobs) * 100
    : 0;
  const multiplePairBenchmarkPct = Math.max(
    6,
    peerBenchmarks.averageMultiplePairPct ?? 0
  );
  if (pmJobs > 0 && previousMonthMultiplePairPct < multiplePairBenchmarkPct) {
    opportunities.push({
      title: "Multiple-pair opportunity",
      priority: "yellow",
      current: `${previousMonthMultiplePairPct.toFixed(1)}% vs ${multiplePairBenchmarkPct.toFixed(1)}% average practice at lab`,
      why: "Multiple-pair usage is below the lab's average-account benchmark, with a minimum benchmark of 6%.",
      action: "Review second-pair recommendations and the Artisan Multiple Pair Program with the team.",
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
      priority: warrantyPm > 5 || officeRedoPm > 10 ? "red" : "green",
      current: `${reportMonths.previous} Warranty ${warrantyPm.toFixed(1)}% · Office ${officeRedoPm.toFixed(1)}% · Non-Adapt ${nonAdaptPm.toFixed(1)}%`,
      why: "Remake, warranty, and non-adapt rates directly affect chair time, patient trust, and margin.",
      action:
        warrantyPm > 5 || officeRedoPm > 10
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
  const highIndexDataPending =
    pmJobs > 0 &&
    [
      supplemental?.material_usage?.hi_index_160_jobs?.pm,
      supplemental?.material_usage?.hi_index_167_jobs?.pm,
      supplemental?.material_usage?.hi_index_174_jobs?.pm,
    ].every((value) => !Number(value));
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
    highIndexDataPending,
    specialtyUsage,
    turnaround,
    quality: [
      { label: reportMonths.prior, warranty: warrantyPpm, officeRedo: officeRedoPpm, labRedo: 0, nonAdapt: pctValue(quality?.non_adapt_pct?.ppm) },
      { label: reportMonths.previous, warranty: warrantyPm, officeRedo: officeRedoPm, labRedo: 0, nonAdapt: nonAdaptPm },
      { label: `${reportMonths.current} MTD`, warranty: warrantyCm, officeRedo: officeRedoCm, labRedo: 0, nonAdapt: nonAdaptCm },
    ],
    reportMonths,
    ppmSales,
    pmSales,
    cmSales,
    ppmJobs,
    pmJobs,
    cmJobs,
    priorJpd,
    currentJpd,
    projectedMonthJobs,
    projectedMonthSales,
    businessDaysElapsed: businessDays.elapsed,
    businessDaysInMonth: businessDays.total,
    currentMonthDataAvailable,
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
    peerBenchmarks,
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
            value={intelligence.currentMonthDataAvailable ? formatMoney(intelligence.cmSales) : "Pending source refresh"}
            detail={intelligence.projectedMonthSales === null ? "Current-month purchase data has not arrived from the source report." : `Projected month: ${formatMoney(intelligence.projectedMonthSales)}`}
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
          <IntelligenceMetric
            icon={Activity}
            label={`${intelligence.reportMonths.current} Orders MTD`}
            value={intelligence.currentMonthDataAvailable ? formatCount(intelligence.cmJobs) : "Pending source refresh"}
            detail={intelligence.projectedMonthJobs === null ? "Current-month order data has not arrived from the source report." : `${intelligence.currentJpd?.toFixed(1)} orders/day · ${formatCount(intelligence.projectedMonthJobs)} projected`}
          />
          <IntelligenceMetric
            icon={Target}
            label="VSP / Private Pay"
            value={`${Math.round(intelligence.vspShare)}%`}
            detail={`${Math.round(intelligence.privatePayShare)}% private pay · Average practice at lab ${intelligence.peerBenchmarks.averageVspPct}% VSP`}
          />
          <IntelligenceMetric
            icon={Layers}
            label={normalizeAssignedPriceListCodes(dashboardAccount?.used_price_lists ?? []).length === 1 ? "Assigned Price List" : "Assigned Price Lists"}
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

function TierProgressTracker({
  pmJobs,
  cmJobs,
  reportMonths,
  currentMonthDataAvailable,
}: {
  pmJobs: number;
  cmJobs: number;
  reportMonths: PracticeIntelligenceModel["reportMonths"];
  currentMonthDataAvailable: boolean;
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
          <p>
            {reportMonths.current} MTD: {currentMonthDataAvailable ? `${formatCount(cmJobs)} actual orders` : "Pending source refresh"}
          </p>
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
            {current === null ? "Pending source refresh" : `${current.toFixed(1)} orders per business day across ${formatCount(intelligence.cmJobs)} month-to-date orders.`}
          </p>
        </div>
      </div>
      <p className="mt-4 rounded-md border border-[#d9c8a6] bg-white/70 px-4 py-3 text-xs font-semibold leading-5 text-[#59635f]">
        {intelligence.projectedMonthJobs === null
          ? `${intelligence.reportMonths.current} current-month data is pending from the source report; zero is not being treated as a confirmed result.`
          : `${intelligence.reportMonths.current} is trending toward ${formatCount(intelligence.projectedMonthJobs)} orders based on ${intelligence.currentJpd?.toFixed(1)} orders per business day, ${intelligence.businessDaysElapsed} business days elapsed, and ${intelligence.businessDaysInMonth} business days in the month.`}
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
          AI-Assisted Insights
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
  peerBenchmarks,
}: {
  quality: QualityPoint[];
  reportMonths: PracticeIntelligenceModel["reportMonths"];
  peerBenchmarks: PortalPeerBenchmarks;
}) {
  const current = quality[quality.length - 1];
  const previous = quality[quality.length - 2];
  const prior = quality[0];
  const metrics = [
    { label: "Warranty Remake", current: current?.warranty ?? 0, previous: previous?.warranty ?? 0, prior: prior?.warranty ?? 0, peer: peerBenchmarks.medianWarrantyPct },
    { label: "Office Remake", current: current?.officeRedo ?? 0, previous: previous?.officeRedo ?? 0, prior: prior?.officeRedo ?? 0, peer: peerBenchmarks.medianOfficeRedoPct },
    { label: "Non-Adapt", current: current?.nonAdapt ?? 0, previous: previous?.nonAdapt ?? 0, prior: prior?.nonAdapt ?? 0, peer: peerBenchmarks.medianNonAdaptPct },
  ];

  return (
    <section className="rounded-md border border-[#d9c8a6] bg-[#fffdf8]/88 p-5 shadow-[0_24px_70px_rgba(20,39,36,0.09)] sm:p-7 lg:col-span-3">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7a6b49]">
        Remake Intelligence
      </p>
      <h2 className="mt-2 text-3xl font-semibold text-[#142724]">Quality and remake signals</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6d746f]">
        Compare practice-controlled remake signals over time and against the average practice at the lab. No lab-wide totals or individual-practice data is included.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
              {metric.peer !== null ? (
                <p className="mt-2 rounded-full bg-[#f4eee4] px-3 py-1.5 text-xs font-semibold text-[#59635f]">
                  Average Practice at Lab: {metric.peer.toFixed(1)}%
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function TurnaroundBenchmarkCenter({
  turnaround,
  reportMonths,
  peerBenchmarks,
}: {
  turnaround: MonthlyUsagePoint[];
  reportMonths: PracticeIntelligenceModel["reportMonths"];
  peerBenchmarks: PortalPeerBenchmarks;
}) {
  const pmCustomer = turnaround[1]?.current ?? 0;
  const peerMedian = peerBenchmarks.medianTurnaroundDays ?? 0;
  const difference = pmCustomer && peerMedian ? pmCustomer - peerMedian : 0;

  return (
    <section className="rounded-md border border-[#d9c8a6] bg-[#fffdf8]/88 p-5 shadow-[0_24px_70px_rgba(20,39,36,0.09)] sm:p-7 lg:col-span-3">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7a6b49]">
        Turnaround Performance
      </p>
      <h2 className="mt-2 text-3xl font-semibold text-[#142724]">Your turnaround vs average practice at lab</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6d746f]">
        Turnaround time is measured from when the frame is received, if applicable, until the order is marked shipped. It does not include time waiting for frames or outbound shipping time to the customer.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <DashboardV1Card label={`Your ${reportMonths.previous} Avg Turnaround`} value={pmCustomer ? `${pmCustomer.toFixed(1)} days` : "Pending"} />
        <DashboardV1Card label="Average Practice at Lab" value={peerMedian ? `${peerMedian.toFixed(1)} days` : "Pending"} />
        <DashboardV1Card
          label="Difference"
          value={pmCustomer && peerMedian ? `${difference >= 0 ? "+" : ""}${difference.toFixed(1)} days` : "Pending"}
          detail={difference > 0 ? "Longer than the average practice at lab" : difference < 0 ? "Faster than the average practice at lab" : "Aligned with the average practice at lab"}
        />
      </div>
    </section>
  );
}

function DataAvailabilityCard({
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
  highIndexDataPending,
  specialtyUsage,
  programMix,
  reportMonths,
  peerBenchmarks,
}: {
  brandUsage: MonthlyUsagePoint[];
  materialUsage: MonthlyUsagePoint[];
  highIndexDataPending: boolean;
  specialtyUsage: MonthlyUsagePoint[];
  programMix: MixPoint[];
  reportMonths: PracticeIntelligenceModel["reportMonths"];
  peerBenchmarks: PortalPeerBenchmarks;
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
          <DataAvailabilityCard title="Brand Usage" label="Data Unavailable" detail="Brand count fields are unavailable for this account." />
        )}
        {hasUsageData(materialUsage) ? (
          <div>
            <MonthlyUsageCharts eyebrow="Material Usage" title="Material Share of Monthly Orders" data={materialUsage} valueType="percent" monthLabels={reportMonths} />
            {highIndexDataPending ? (
              <p className="mt-3 rounded-md border border-[#d9c8a6] bg-[#fff8e8] px-3 py-2 text-xs font-semibold leading-5 text-[#6f5422]">
                High-index usage exists in the source report, but its 1.60, 1.67, and 1.74 breakdown is pending correction in the portal export. Zero is not being treated as no usage.
              </p>
            ) : null}
          </div>
        ) : (
          <DataAvailabilityCard title="Material Usage" label="Data Unavailable" detail="Material count fields are unavailable for this account." />
        )}
        {hasUsageData(specialtyUsage) ? (
          <div>
            <MonthlyUsageCharts eyebrow="Specialty Usage" title="Specialty Share of Monthly Orders" data={specialtyUsage} valueType="percent" monthLabels={reportMonths} />
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {[
                ["Photochromic", peerBenchmarks.averagePhotochromicPct],
                ["Polarized", peerBenchmarks.averagePolarizedPct],
                ["Multiple Pair", Math.max(6, peerBenchmarks.averageMultiplePairPct ?? 0)],
              ].map(([label, value]) => (
                <p key={String(label)} className="rounded-md border border-[#eadfce] bg-white/78 px-3 py-2 text-xs font-semibold text-[#59635f]">
                  {label} Lab Average: {typeof value === "number" ? `${value.toFixed(1)}%` : "Pending"}
                </p>
              ))}
            </div>
          </div>
        ) : (
          <DataAvailabilityCard title="Specialty Usage" label="Data Unavailable" detail="Specialty product count fields are unavailable for this account." />
        )}
        <div className="rounded-md border border-[#eadfce] bg-white/78 p-5">
          <span className="inline-flex rounded-md border border-[#d9c8a6] bg-[#f8f1e6] px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#7a6b49]">
            Status Signals
          </span>
          <h3 className="mt-4 text-xl font-semibold text-[#142724]">Program Mix</h3>
          {programMix.length > 0 ? <div className="mt-4 grid gap-3">
            {programMix.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-[#142724]">{item.label}</span>
                  <span className="text-[#6d746f]">Active</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e7ddcc]">
                  <div className="h-full rounded-full" style={{ width: `${Math.max(10, item.value)}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div> : <p className="mt-4 text-sm text-[#6d746f]">No active status signals.</p>}
        </div>
      </div>
    </section>
  );
}

function BenchmarkingSection({ benchmarks }: { benchmarks: PortalPeerBenchmarks }) {
  const position = benchmarks.growthPercentile === null
    ? "Pending"
    : benchmarks.growthPercentile >= 67
      ? "Upper third"
      : benchmarks.growthPercentile >= 34
        ? "Middle third"
        : "Opportunity range";
  return (
    <section className="rounded-md border border-[#d9c8a6] bg-[#fffdf8]/88 p-5 shadow-[0_24px_70px_rgba(20,39,36,0.09)] sm:p-7 lg:col-span-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7a6b49]">
            Benchmarking
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-[#142724]">Average practice at lab comparisons</h2>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <DataAvailabilityCard title="Growth Position" label={position} detail="Relative completed-month growth position. Peer direction, totals, and individual practices remain private." />
        <DataAvailabilityCard title="Office Remake Average" label={benchmarks.medianOfficeRedoPct === null ? "Pending" : `${benchmarks.medianOfficeRedoPct.toFixed(1)}%`} detail="Completed-month average-practice benchmark." />
        <DataAvailabilityCard title="Turnaround Average" label={benchmarks.medianTurnaroundDays === null ? "Pending" : `${benchmarks.medianTurnaroundDays.toFixed(1)} days`} detail="Completed-month average-practice benchmark without lab-wide totals." />
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
}) {
  const intelligence = buildPracticeIntelligenceModel({
    account,
    dashboard: dashboardAccount,
    hasModernPackageWarning: Boolean(account && hasModernPackageSavingsWarning(account)),
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
      <section id="trends" className="scroll-mt-24 lg:col-span-3">
        <TrendsPerformanceCharts trends={intelligence.trends} vspMix={intelligence.vspMix} />
        <DailyTrendSummary intelligence={intelligence} />
      </section>
      <TierProgressTracker
        pmJobs={intelligence.pmJobs}
        cmJobs={intelligence.cmJobs}
        reportMonths={intelligence.reportMonths}
        currentMonthDataAvailable={intelligence.currentMonthDataAvailable}
      />
      <div id="opportunities" className="scroll-mt-24 lg:col-span-3">
        <OpportunitiesCenter opportunities={intelligence.opportunities} />
      </div>
      <ProductBrandIntelligenceSection
        brandUsage={intelligence.brandUsage}
        materialUsage={intelligence.materialUsage}
        highIndexDataPending={intelligence.highIndexDataPending}
        specialtyUsage={intelligence.specialtyUsage}
        programMix={intelligence.programMix}
        reportMonths={intelligence.reportMonths}
        peerBenchmarks={intelligence.peerBenchmarks}
      />
      <section className="lg:col-span-3">
        <ServiceExcellenceCharts
          quality={intelligence.quality}
          orderVolume={intelligence.orderRateTrends}
          turnaround={intelligence.turnaround}
        />
      </section>
      <TurnaroundBenchmarkCenter turnaround={intelligence.turnaround} reportMonths={intelligence.reportMonths} peerBenchmarks={intelligence.peerBenchmarks} />
      <RemakePerformanceCenter quality={intelligence.quality} reportMonths={intelligence.reportMonths} peerBenchmarks={intelligence.peerBenchmarks} />
      <RewardsCenter rewards={intelligence.rewards} />
      <div id="programs" className="scroll-mt-24 lg:col-span-3">
        <ProgramParticipationCenter programs={intelligence.programs} />
      </div>
      <CustomerEngagementCenter invitations={intelligence.targetInvitations} />
      <BenchmarkingSection benchmarks={intelligence.peerBenchmarks} />
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
  const availablePriceLists = effectivePriceListCodes.filter(isVisiblePriceListCode).map((rawCode) => {
    const normalizedCode = rawCode.trim().toUpperCase();
    const configured = getPriceListByCode(normalizedCode);
    if (configured) return { ...configured, configured: true } satisfies PortalPriceList & { configured: boolean };

    return {
      code: normalizedCode as PortalPriceList["code"],
      label: priceListDisplayName(normalizedCode),
      fileName: `Assigned ${normalizedCode} pricing`,
      r2Key: null,
      onlineUrl: `/portal/price-list/${normalizedCode.toLowerCase()}`,
      configured: false,
      generated: false,
      package: isPackagePriceListCode(normalizedCode),
      detected: false,
      invalidOrUnknown: true,
      generationStatus: "missing",
      assignmentStatus: "assigned",
      assignedAccountCount: 0,
      visibleCustomerCount: 0,
      rowCount: 0,
    } satisfies PortalPriceList & { configured: boolean };
  });
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
  const showDashboardV1 = dashboardState?.status === "ok";
  const isAdmin = isPortalAdminEmail(authenticatedEmail);
  const showNewPartnerOnboarding = isPortalOnboardingVisible({
    customer,
    workbookProfile,
    dashboardState,
  });
  const onboardingHref = buildPortalOnboardingHref(accountNumber);
  const availablePortalSections = customer
    ? visiblePortalSectionCards(customer).filter(
        (card) => card.section !== "onboarding" || showNewPartnerOnboarding
      ).map((card) =>
        card.section === "onboarding" ? { ...card, href: onboardingHref } : card
      )
    : [];
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
          showNewPartnerOnboarding={showNewPartnerOnboarding}
          onboardingHref={onboardingHref}
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
        />

        <AccountProfileSection
          account={account}
          dashboardAccount={dashboardState?.account}
          customerTypeLabel={customerTypeLabel}
          practiceName={practiceName}
          accountNumber={accountNumber}
          showNewPartnerOnboarding={showNewPartnerOnboarding}
          onboardingHref={onboardingHref}
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
        ...getConfiguredDevelopmentAdminEmails(),
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

  let customers: PortalCustomer[];
  let profiles: PortalWorkbookProfile[];
  try {
    customers = await getAuthorizedPortalCustomers(authenticatedEmail);
    profiles = getPortalWorkbookProfilesByEmail(authenticatedEmail);
  } catch (error) {
    return (
      <PortalWorkbookError
        authenticatedEmail={authenticatedEmail}
        error={error}
      />
    );
  }

  const portalRole = getPortalStaffRole(authenticatedEmail);
  const hasStaffPortalAccess = canAccessPortalAdmin(portalRole);

  if (!hasStaffPortalAccess && customers.length === 0) {
    forbidden();
  }
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
    !hasStaffPortalAccess
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
