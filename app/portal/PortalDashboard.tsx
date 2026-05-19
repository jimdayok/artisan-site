import Link from "next/link";
import { PortalPerformanceCharts } from "./PortalPerformanceCharts";
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

const PORTAL_ACCESS_LOGIN_URL =
  "https://artisanslabs.com/portal";
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

        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col">
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
      division?: string;
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
      customerTypeLabel: optionsByAccount.get(key)?.customerTypeLabel,
      division: profile.account?.division || profile.person.division,
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
                  {option.division ? `Division ${option.division}` : "Division not available"}
                  {" · "}
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

function SequelRewardsInvitationCard() {
  return (
    <section className="relative isolate overflow-hidden border border-[#b89a61] bg-[#172a28] p-6 text-white shadow-[0_24px_90px_rgba(23,42,40,0.18)] sm:p-9 lg:col-span-3">
      <div className="absolute inset-y-0 right-0 -z-10 w-1/2 bg-[radial-gradient(circle_at_70%_35%,rgba(216,196,155,0.22),transparent_42%)]" />
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8c49b]">
          Invitation Program
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
          You&apos;ve Been Invited: Sequel Artisan Rewards
        </h2>
        <p className="mt-4 text-sm leading-7 text-white/76">
          Your practice has been invited to participate in the Sequel Artisan
          Rewards program. Learn how the program works and how your practice can
          qualify for rewards.
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
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: "light" | "dark";
}) {
  const isDark = tone === "dark";

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
    <div className="grid grid-cols-[1fr_auto] gap-5 border-t border-[#d8c49b] py-4 text-sm">
      <span className="font-semibold text-[#172a28]">{label}</span>
      <span className="text-[#706759]">{value || "Not available"}</span>
    </div>
  );
}

function ProgramUsageCard({
  label,
  value,
  href,
  recommendation,
}: {
  label: string;
  value: string;
  href: string;
  recommendation?: string;
}) {
  const active = hasProgramUsage(value);

  return (
    <Link
      href={href}
      className="group relative block overflow-hidden border border-[#d8c49b] bg-[#fffaf1] p-5 shadow-[0_10px_28px_rgba(23,42,40,0.05)] transition hover:-translate-y-0.5 hover:border-[#172a28] hover:bg-white hover:shadow-[0_16px_38px_rgba(23,42,40,0.09)]"
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 ${
          active ? "bg-[#172a28]" : "bg-[#d8c49b]"
        }`}
      />
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base font-semibold tracking-[-0.01em] text-[#172a28]">
          {label}
        </h3>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            active
              ? "bg-[#172a28] text-white"
              : "border border-[#d8c49b] text-[#706759]"
          }`}
        >
          {active ? "Using" : "Not active"}
        </span>
      </div>
      <p className="mt-3 text-sm text-[#706759]">{value || "Not available"}</p>
      {recommendation ? (
        <p className="mt-3 border-t border-[#d8c49b] pt-3 text-xs leading-5 text-[#8b7650]">
          {recommendation}
        </p>
      ) : null}
      <span className="mt-4 inline-flex text-sm font-semibold text-[#172a28] underline decoration-[#d8c49b] underline-offset-4 transition group-hover:decoration-[#172a28]">
        Learn more
      </span>
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

function PortalAccountHero({
  practiceName,
  accountNumber,
  customerTypeLabel,
  customerTypeCode,
  account,
  authenticatedEmail,
  adminPreviewAccountName,
}: {
  practiceName: string;
  accountNumber: string;
  customerTypeLabel?: string;
  customerTypeCode?: string;
  account?: PortalWorkbookAccount;
  authenticatedEmail: string;
  adminPreviewAccountName?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden border border-[#b89a61] bg-[#172a28] p-6 text-white shadow-[0_28px_100px_rgba(23,42,40,0.22)] sm:p-8 lg:col-span-3">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_18%,rgba(216,196,155,0.2),transparent_34%),linear-gradient(135deg,rgba(49,95,88,0.38),transparent_52%)]" />
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d8c49b]">
            Customer Intelligence
          </p>
          <h1 className="mt-5 break-words text-4xl font-semibold tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            {practiceName}
          </h1>
          <div className="mt-6 flex flex-wrap gap-3">
            {customerTypeLabel ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d8c49b]/55 bg-[#fffaf1]/10 px-4 py-2 text-sm font-semibold">
                {customerTypeLabel}
                {customerTypeCode ? (
                  <span className="text-xs uppercase tracking-[0.2em] text-[#d8c49b]">
                    {customerTypeCode}
                  </span>
                ) : null}
              </span>
            ) : null}
            {accountNumber ? (
              <span className="rounded-full border border-white/18 px-4 py-2 text-sm text-white/82">
                Account {accountNumber}
              </span>
            ) : null}
            {account?.division ? (
              <span className="rounded-full border border-white/18 px-4 py-2 text-sm text-white/82">
                Division {account.division}
              </span>
            ) : null}
          </div>
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
}: {
  account: PortalWorkbookAccount;
}) {
  const vspShare =
    account.cmVspSow || (account.cmJobs > 0 ? account.cmVspJobs / account.cmJobs : 0);
  const nlShare =
    account.cmNlSow || (account.cmJobs > 0 ? account.cmNlJobs / account.cmJobs : 0);
  const sqlShare = account.cmJobs > 0 ? account.cmSqlJobs / account.cmJobs : 0;
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
        />
        <AccountStatCard
          label="Previous Month Purchases"
          value={formatCurrency(account.pmSales)}
        />
        <AccountStatCard
          label="Current Month Rx Orders"
          value={formatNumber(account.cmJobs)}
        />
        <AccountStatCard
          label="Previous Month Rx Orders"
          value={formatNumber(account.pmJobs)}
        />
        <AccountStatCard
          label="Current Month Rx Orders Per Day"
          value={formatDecimal(account.cmJpd)}
        />
        <AccountStatCard
          label="Previous Month Rx Orders Per Day"
          value={formatDecimal(account.pmJpd)}
        />
      </div>

      <div className="mt-8">
        <PortalPerformanceCharts
          trends={trendData}
          vspMix={mixData({
            activeLabel: "VSP",
            activePercent: vspShare,
          })}
          nlMix={mixData({
            activeLabel: "Neurolens",
            activePercent: nlShare,
            activeColor: "#315f58",
          })}
          sqlMix={mixData({
            activeLabel: "Sequel",
            activePercent: sqlShare,
            activeColor: "#8b7650",
          })}
        />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <AccountStatCard
          label="VSP Rx Orders"
          value={formatNumber(account.cmVspJobs)}
          detail={`${formatPercent(vspShare)}% VSP · ${100 - formatPercent(vspShare)}% Non-VSP`}
        />
        <AccountStatCard
          label="Neurolens Rx Orders"
          value={formatNumber(account.cmNlJobs)}
          detail={`${formatPercent(nlShare)}% of current Rx order mix`}
        />
        <AccountStatCard
          label="Sequel Rx Orders"
          value={formatNumber(account.cmSqlJobs)}
          detail={`${formatPercent(sqlShare)}% of current Rx order mix`}
        />
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
        <UsageRow label="Sales Rep" value={account?.salesRep ?? ""} />
        <UsageRow label="Address" value={account?.fullAddress ?? ""} />
        <UsageRow label="Phone Number" value={account?.phoneNumber ?? ""} />
        <UsageRow label="State / ZIP" value={[account?.state, account?.zipCode].filter(Boolean).join(" ") || ""} />
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

function ProgramUsageSection({ account }: { account: PortalWorkbookAccount }) {
  const missingPackageSavings = hasModernPackageSavingsWarning(account);

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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <ProgramUsageCard
          label="Modern Package System Usage"
          value={account.modernPkgUsage}
          href="/provider-resources#modern-package-system"
          recommendation={
            missingPackageSavings
              ? "Recommended: compare package savings for accounts already using Modern Frame."
              : undefined
          }
        />
        <ProgramUsageCard
          label="Modern Frame System Usage"
          value={account.modernFrmUsage}
          href="/provider-resources#modern-frame-system"
        />
        <ProgramUsageCard
          label="Chemistrie/ChemClip Usage"
          value={account.chemClipUsage}
          href="/provider-resources#specialty-systems"
        />
        <ProgramUsageCard
          label="SpecCheck Usage"
          value={account.specCheckUsage}
          href="/provider-resources#speccheck"
        />
        <ProgramUsageCard
          label="Tokai Usage"
          value={account.tokaiUsage}
          href="/provider-resources#tokai"
        />
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

export function PortalDashboardContent({
  authenticatedEmail,
  customer,
  workbookProfile,
  adminPreviewAccountName,
  adminPreviewAccountNumber,
  adminPreviewEmail,
  isLocalhostDevelopment,
}: {
  authenticatedEmail: string;
  customer?: PortalCustomer;
  workbookProfile?: PortalWorkbookProfile;
  adminPreviewAccountName?: string;
  adminPreviewAccountNumber?: string;
  adminPreviewEmail?: string;
  isLocalhostDevelopment?: boolean;
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
  const customerTypeCode = customerTypeInfo?.code || customer?.customerTypeCode || "";
  const customerTypeLabel =
    customerTypeInfo?.label || customer?.customerTypeLabel || "";
  const hasSequelRebateInvitation =
    profileHasSequelRebateInvitation(workbookProfile);

  return (
    <PortalShell eyebrow="Verified Customer Portal">
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
                href="/portal/admin"
                className="inline-flex min-h-10 w-fit items-center justify-center rounded-full bg-[#d8c49b] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#172a28] transition hover:bg-white"
              >
                Back to Admin
              </Link>
              <Link
                href="/portal/admin/accounts"
                className="inline-flex min-h-10 w-fit items-center justify-center rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition hover:bg-white hover:text-[#172a28]"
              >
                Exit Preview
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-7 lg:grid-cols-3">
        <PortalAccountHero
          practiceName={practiceName}
          accountNumber={accountNumber}
          customerTypeLabel={customerTypeLabel}
          customerTypeCode={customerTypeCode}
          account={account}
          authenticatedEmail={authenticatedEmail}
          adminPreviewAccountName={adminPreviewAccountName}
        />

        {isPortalAdminEmail(authenticatedEmail) && !adminPreviewAccountName ? (
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

        {account ? <AccountPerformanceSection account={account} /> : null}

        {hasSequelRebateInvitation ? <SequelRewardsInvitationCard /> : null}

        {account && hasModernPackageSavingsWarning(account) ? (
          <ModernPackageSavingsAlert />
        ) : null}

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

        {account ? <ProgramUsageSection account={account} /> : null}
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
      isLocalhostDevelopment={isLocalhostDevelopment}
    />
  );
}
