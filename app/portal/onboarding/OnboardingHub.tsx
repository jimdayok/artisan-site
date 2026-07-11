"use client";

import { useEffect, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import Image from "next/image";
import Link from "next/link";
import { artisanControlClass } from "@/app/components/controlStyles";
import {
  ArrowRight,
  Check,
  Clock,
  ExternalLink,
  Lock,
  PlayCircle,
  RotateCcw,
  Search,
} from "lucide-react";
import type { OnboardingAccess, OnboardingAccount } from "./onboardingAccess";
import {
  arTreatments,
  labs,
  lensFamilyOptions,
  modules,
  orderingMethodOptions,
  portalResources,
  providerResources,
  supportContacts,
  type LensFamilyId,
  type ModuleId,
  type OrderingMethodId,
  type ResourceLink,
} from "./onboardingData";

type Answers = {
  selectedLensFamilies: LensFamilyId[];
  orderingMethods: OrderingMethodId[];
  vsp: string;
  frameShipping: string;
  advanced: string;
  completedModules: ModuleId[];
  lastVisitedModule: ModuleId | "";
  percentComplete: number;
  updatedAt: string;
};

const defaultAnswers: Answers = {
  selectedLensFamilies: [],
  orderingMethods: [],
  vsp: "",
  frameShipping: "",
  advanced: "",
  completedModules: [],
  lastVisitedModule: "",
  percentComplete: 0,
  updatedAt: "",
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function progressKey(email: string, accountNumber: string) {
  return `artisan-onboarding-progress:${email}:${accountNumber}`;
}

function isAnswerSnapshot(value: unknown): value is Partial<Answers> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readStoredProgress(email: string, accountNumber: string) {
  if (!email || !accountNumber || typeof window === "undefined") return defaultAnswers;

  try {
    const raw = window.localStorage.getItem(progressKey(email, accountNumber));
    if (!raw) return defaultAnswers;

    const parsed = JSON.parse(raw) as unknown;
    return isAnswerSnapshot(parsed) ? { ...defaultAnswers, ...parsed } : defaultAnswers;
  } catch {
    return defaultAnswers;
  }
}

function mailtoCorrection({
  email,
  name,
  account,
}: {
  email: string;
  name: string;
  account: OnboardingAccount;
}) {
  const body = [
    "Issue type: access correction",
    `Logged-in email: ${email || "Not available"}`,
    `Displayed name: ${name || "Not available"}`,
    `Selected account number: ${account.accountNumber || "Not available"}`,
    `Displayed lab: ${account.labName || account.rawLabName || "Not available"}`,
    "",
    "Please describe what looks incorrect:",
  ].join("\n");

  return `mailto:${supportContacts.onboarding.email}?subject=${encodeURIComponent("Onboarding access correction")}&body=${encodeURIComponent(body)}`;
}

function ResourceButton({ link }: { link: ResourceLink }) {
  const base = artisanControlClass({ tone: "secondary" });

  if (link.href.startsWith("mailto:") || link.external) {
    return (
      <a href={link.href} target={link.external ? "_blank" : undefined} rel={link.external ? "noreferrer" : undefined} className={base}>
        {link.label}
        {link.external ? <ExternalLink className="h-4 w-4" aria-hidden="true" /> : <ArrowRight className="h-4 w-4" aria-hidden="true" />}
      </a>
    );
  }

  if (link.href.startsWith("#")) {
    return <a href={link.href} className={base}>{link.label}<ArrowRight className="h-4 w-4" aria-hidden="true" /></a>;
  }

  return <Link href={link.href} className={base}>{link.label}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>;
}

function TrainingResourceCard({ title }: { title: string }) {
  return (
    <div className="rounded-[20px] border border-dashed border-[#b8a27d]/70 bg-[#fbf8f3] p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1f1a17] text-[#d4c09a]">
          <PlayCircle className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#1f1a17]">{title}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7654]">Training Video</p>
        </div>
      </div>
    </div>
  );
}

function StepPreviewCard({ title }: { title: string }) {
  return (
    <div className="rounded-[20px] border border-dashed border-[#b8a27d]/70 bg-white p-4">
      <div className="rounded-2xl bg-[#f5f1eb] p-4">
        <div className="h-3 w-28 rounded-full bg-[#d8c6a8]" />
        <div className="mt-4 grid gap-2">
          <div className="h-12 rounded-xl bg-white" />
          <div className="h-12 rounded-xl bg-white" />
          <div className="h-12 rounded-xl bg-white" />
        </div>
      </div>
      <p className="mt-3 text-sm font-semibold text-[#1f1a17]">{title}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7654]">Step Preview</p>
    </div>
  );
}

function toggleListValue<T extends string>(values: T[], value: T) {
  return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
}

function statusFor(completed: ModuleId[], id: ModuleId) {
  return completed.includes(id) ? "Complete" : "Not started";
}

function useStoredProgress(email: string, accountNumber: string) {
  const [answers, setAnswers] = useState<Answers>(() => readStoredProgress(email, accountNumber));

  useEffect(() => {
    if (!email || !accountNumber) return;
    const percentComplete = Math.round((answers.completedModules.length / modules.length) * 100);
    const payload = {
      ...answers,
      selectedAccount: accountNumber,
      percentComplete,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(progressKey(email, accountNumber), JSON.stringify(payload));
  }, [answers, email, accountNumber]);

  return [answers, setAnswers] as const;
}

function AccountPanel({
  access,
  account,
  setSelectedAccount,
}: {
  access: Extract<OnboardingAccess, { status: "authorized" }>;
  account: OnboardingAccount;
  setSelectedAccount: (accountNumber: string) => void;
}) {
  const [query, setQuery] = useState("");
  const visibleAdminAccounts = access.adminAccounts
    .filter((entry) => `${entry.practiceName} ${entry.accountNumber} ${entry.aliases.join(" ")}`.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 30);

  return (
    <section className="rounded-[28px] border border-[#d8c6a8]/70 bg-[#fbf8f3] p-5 shadow-[0_22px_70px_rgba(49,39,26,0.12)] md:p-7">
      {access.isAdmin ? (
        <div className="mb-5 rounded-2xl border border-[#d4c09a] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7654]">Admin/testing mode</p>
          <p className="mt-2 text-sm leading-6 text-[#625b53]">You can preview onboarding for eligible accounts. These controls are not shown to customer logins.</p>
          <label className="mt-4 flex items-center gap-2 rounded-full border border-[#d8c6a8] bg-[#fbf8f3] px-4 py-2">
            <Search className="h-4 w-4 text-[#8a7654]" aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search eligible accounts" className="w-full bg-transparent text-sm outline-none" />
          </label>
          {query ? (
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {visibleAdminAccounts.map((entry) => (
                <button key={entry.accountNumber} type="button" onClick={() => setSelectedAccount(entry.accountNumber)} className="rounded-2xl border border-[#d8c6a8] bg-[#fbf8f3] p-3 text-left text-sm font-semibold text-[#1f1a17] hover:border-[#b99355]">
                  {entry.practiceName}
                  <span className="mt-1 block text-xs font-medium text-[#756c63]">{entry.accountNumber} {entry.aliases.length ? `(${entry.aliases.join(", ")})` : ""}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">Account identity</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f1a17]">Welcome to Artisan Lab Network</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#625b53]">
            Your onboarding center is built around your account, your lab, your ordering systems, and the lens products your practice will use.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Info label="Signed in as" value={access.userName || "We need to confirm this"} />
            <Info label="Email" value={access.email} />
            <Info label="Practice" value={account.practiceName || "We need to confirm this"} />
            <Info label="Your lab" value={account.labName || "We need to confirm this"} />
          </div>
        </div>
        <div className="rounded-[22px] border border-[#d8c6a8]/70 bg-white p-4">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7654]" htmlFor="account-select">Selected account</label>
          <select
            id="account-select"
            value={account.accountNumber}
            onChange={(event) => setSelectedAccount(event.target.value)}
            className="mt-3 min-h-12 w-full rounded-2xl border border-[#d8c6a8] bg-[#fbf8f3] px-4 text-sm font-semibold text-[#1f1a17]"
          >
            {access.accounts.map((entry) => (
              <option key={entry.accountNumber} value={entry.accountNumber}>
                {entry.practiceName} - {entry.accountNumber}
              </option>
            ))}
          </select>
          <div className="mt-4 flex flex-wrap gap-2">
            {account.aliases.map((alias) => <span key={alias} className="rounded-full bg-[#f5f1eb] px-3 py-1 text-xs font-bold text-[#7a6544]">{alias}</span>)}
          </div>
          <a href={mailtoCorrection({ email: access.email, name: access.userName, account })} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#1f1a17] px-4 text-sm font-semibold text-white transition hover:bg-[#d4c09a] hover:text-[#171311]">
            Does this look wrong? Request an access correction.
          </a>
        </div>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#d8c6a8]/70 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7654]">{label}</p>
      <p className="mt-2 text-sm font-semibold text-[#1f1a17]">{value}</p>
    </div>
  );
}

function PlanBuilder({ answers, setAnswers }: { answers: Answers; setAnswers: Dispatch<SetStateAction<Answers>> }) {
  return (
    <section id="plan" className="rounded-[28px] border border-[#d8c6a8]/70 bg-white p-5 shadow-[0_18px_54px_rgba(49,39,26,0.08)] md:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">Build Your Onboarding Plan</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f1a17]">Tell us what your team will use.</h2>
      <p className="mt-3 text-sm leading-7 text-[#625b53]">We only ask what the portal cannot confidently infer. This is training and execution guidance, not a product decision tool.</p>

      <QuestionBlock title="Which lens families will your practice be using? Select all that apply.">
        {lensFamilyOptions.map((option) => (
          <CheckPill
            key={option.id}
            label={option.label}
            checked={answers.selectedLensFamilies.includes(option.id)}
            onClick={() => setAnswers((current) => ({ ...current, selectedLensFamilies: toggleListValue(current.selectedLensFamilies, option.id) }))}
          />
        ))}
      </QuestionBlock>

      <QuestionBlock title="Are you using Artisan Lab Network for VSP orders?">
        {["Yes", "No", "Not sure"].map((value) => <RadioPill key={value} label={value} checked={answers.vsp === value} onClick={() => setAnswers((current) => ({ ...current, vsp: value }))} />)}
      </QuestionBlock>

      <QuestionBlock title="Which ordering methods will your team use? Select all that apply.">
        {orderingMethodOptions.map((option) => (
          <CheckPill
            key={option.id}
            label={option.label}
            checked={answers.orderingMethods.includes(option.id)}
            onClick={() => setAnswers((current) => ({ ...current, orderingMethods: toggleListValue(current.orderingMethods, option.id) }))}
          />
        ))}
      </QuestionBlock>

      <QuestionBlock title="Do you send frames to the lab with orders?">
        {["Yes", "No", "Sometimes", "Not sure"].map((value) => <RadioPill key={value} label={value} checked={answers.frameShipping === value} onClick={() => setAnswers((current) => ({ ...current, frameShipping: value }))} />)}
      </QuestionBlock>

      <QuestionBlock title="Do you want advanced/customized lens version training?">
        {["Yes, show customized versions", "No, keep it simple for now", "Not sure"].map((value) => <RadioPill key={value} label={value} checked={answers.advanced === value} onClick={() => setAnswers((current) => ({ ...current, advanced: value }))} />)}
      </QuestionBlock>
    </section>
  );
}

function QuestionBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="mt-6 rounded-[22px] border border-[#e0d1b9] bg-[#fbf8f3] p-4">
      <legend className="px-1 text-sm font-bold text-[#1f1a17]">{title}</legend>
      <div className="mt-4 flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function CheckPill({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={cx("rounded-full border px-4 py-2 text-sm font-semibold transition", checked ? "border-[#1f1a17] bg-[#1f1a17] text-white" : "border-[#d8c6a8] bg-white text-[#4f463e] hover:border-[#b99355]")}>{label}</button>;
}

function RadioPill(props: { label: string; checked: boolean; onClick: () => void }) {
  return <CheckPill {...props} />;
}

function recommendedModuleIds(answers: Answers): ModuleId[] {
  const ids = new Set<ModuleId>(["welcome", "lab", "portal", "ordering", "shipping", "lens", "remakes", "launch"]);
  if (answers.selectedLensFamilies.includes("artisan-ar")) ids.add("ar");
  if (answers.selectedLensFamilies.includes("photochromic")) ids.add("sun");
  if (answers.selectedLensFamilies.includes("safety-systems")) ids.add("systems");
  if (answers.vsp === "Yes" || answers.orderingMethods.includes("eyefinity")) ids.add("vsp");
  if (answers.orderingMethods.length) ids.add("ordering");
  return modules.filter((module) => ids.has(module.id)).map((module) => module.id);
}

function LaunchPath({ answers, setAnswers }: { answers: Answers; setAnswers: Dispatch<SetStateAction<Answers>> }) {
  const recommended = recommendedModuleIds(answers);
  const completeCount = answers.completedModules.length;
  const percent = Math.round((completeCount / modules.length) * 100);

  return (
    <section className="rounded-[28px] bg-[#171311] p-6 text-white shadow-[0_24px_70px_rgba(49,39,26,0.16)] md:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4c09a]">Your launch path</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">Start with these modules.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72">The full page remains available below. Your path updates as your team answers the setup questions.</p>
        </div>
        <div className="min-w-52">
          <div className="flex items-center justify-between text-sm font-semibold"><span>{completeCount} of {modules.length} complete</span><span>{percent}%</span></div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/12"><div className="h-full rounded-full bg-[#d4c09a]" style={{ width: `${percent}%` }} /></div>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.filter((module) => recommended.includes(module.id)).map((module) => {
          const Icon = module.icon;
          const complete = answers.completedModules.includes(module.id);
          return (
            <article key={module.id} className="rounded-[24px] border border-white/12 bg-white/[0.06] p-5">
              <div className="flex items-center justify-between gap-4">
                <Icon className="h-6 w-6 text-[#d4c09a]" aria-hidden="true" />
                <span className={cx("rounded-full px-3 py-1 text-xs font-bold", complete ? "bg-[#e4f2df] text-[#31551f]" : "bg-white/10 text-white/80")}>{complete ? "Complete" : "Not started"}</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold">{module.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/68">{module.why}</p>
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-[#d4c09a]">{module.time}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={`#${module.id}`} onClick={() => setAnswers((current) => ({ ...current, lastVisitedModule: module.id }))} className="rounded-full bg-[#d4c09a] px-4 py-2 text-sm font-bold text-[#171311]">Start module</a>
                <button type="button" onClick={() => setAnswers((current) => ({ ...current, completedModules: toggleListValue(current.completedModules, module.id) }))} className="rounded-full border border-white/18 px-4 py-2 text-sm font-bold text-white">{complete ? "Mark incomplete" : "Mark complete"}</button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ProgressNav({ answers }: { answers: Answers }) {
  return (
    <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
      <div className="rounded-[24px] border border-[#d8c6a8]/70 bg-white/88 p-4 shadow-[0_18px_54px_rgba(49,39,26,0.08)] backdrop-blur">
        <p className="px-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">Progress</p>
        <nav className="mt-3 space-y-1" aria-label="Onboarding modules">
          {modules.map((module) => (
            <a key={module.id} href={`#${module.id}`} className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-[#1f1a17] hover:bg-[#f5f1eb]">
              {answers.completedModules.includes(module.id) ? <Check className="h-4 w-4 text-[#54743b]" aria-hidden="true" /> : <Lock className="h-4 w-4 text-[#d8c6a8]" aria-hidden="true" />}
              <span className="line-clamp-1">{module.title}</span>
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}

function ModuleShell({ id, title, children, answers, setAnswers }: { id: ModuleId; title: string; children: ReactNode; answers: Answers; setAnswers: Dispatch<SetStateAction<Answers>> }) {
  const complete = answers.completedModules.includes(id);
  return (
    <section id={id} className="scroll-mt-24 rounded-[28px] border border-[#d8c6a8]/70 bg-white p-5 shadow-[0_18px_54px_rgba(49,39,26,0.08)] md:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">{statusFor(answers.completedModules, id)}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f1a17]">{title}</h2>
        </div>
        <button type="button" onClick={() => setAnswers((current) => ({ ...current, completedModules: toggleListValue(current.completedModules, id) }))} className={cx("inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-bold", complete ? "bg-[#e4f2df] text-[#31551f]" : "bg-[#1f1a17] text-white")}>{complete ? "Mark incomplete" : "Mark complete"}</button>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function BulletGrid({ items }: { items: string[] }) {
  return <div className="grid gap-3 md:grid-cols-2">{items.map((item) => <div key={item} className="rounded-[18px] bg-[#fbf8f3] p-4 text-sm leading-6 text-[#625b53]"><Check className="mb-2 h-4 w-4 text-[#8a7654]" aria-hidden="true" />{item}</div>)}</div>;
}

function LabModule({ account }: { account: OnboardingAccount }) {
  const lab = labs[account.labKey];
  return (
    <div>
      <div className="rounded-[22px] border border-[#d8c6a8]/70 bg-[#fbf8f3] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">Lab relationship from account data</p>
        <h3 className="mt-2 text-2xl font-semibold text-[#1f1a17]">{lab.name}</h3>
        {account.labKey === "unknown" ? <p className="mt-3 text-sm leading-7 text-[#625b53]">We need to confirm your lab connection. Request help and we will verify the correct lab for this account.</p> : null}
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <a href={`mailto:${lab.email}`} className="rounded-2xl bg-white p-4 text-sm font-semibold text-[#1f1a17]">{lab.email}</a>
          <a href={lab.phoneHref} className="rounded-2xl bg-white p-4 text-sm font-semibold text-[#1f1a17]">{lab.phone}</a>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {[lab.handles, lab.shipping, lab.remake].map((item) => <div key={item} className="rounded-[18px] bg-[#fbf8f3] p-4 text-sm leading-6 text-[#625b53]">{item}</div>)}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <ResourceButton link={{ label: "Contact My Lab", href: `mailto:${lab.email}?subject=Onboarding%20Help` }} />
        <ResourceButton link={{ label: "Escalate to Jim Day", href: `mailto:${supportContacts.onboarding.email}?subject=Onboarding%20Escalation` }} />
      </div>
      <div className="mt-5"><TrainingResourceCard title="Meet Your Lab" /></div>
    </div>
  );
}

function PortalModule({ account }: { account: OnboardingAccount }) {
  return (
    <div>
      <BulletGrid items={[
        `Account-specific pricing is in the portal for ${account.accountNumber}.`,
        "Use price lists, packages, calculator, catalog, and policies from the portal navigation when available.",
        "Reports may show purchases, orders, trends, product mix, current month, previous month, and similar customer-facing views.",
        account.priceLists.length ? `Available price-list codes found for this account: ${account.priceLists.join(", ")}.` : "We need to confirm available price-list codes for this account.",
      ]} />
      <div className="mt-5 flex flex-wrap gap-2">{portalResources.map((link) => <ResourceButton key={link.label} link={link} />)}<ResourceButton link={{ label: "Request Report Access", href: `mailto:${supportContacts.onboarding.email}?subject=Report%20Access%20Request` }} /></div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StepPreviewCard title="Portal home" />
        <StepPreviewCard title="Price list page" />
        <StepPreviewCard title="Reports/performance page" />
        <StepPreviewCard title="Account selector" />
      </div>
    </div>
  );
}

function ResourcesModule() {
  return (
    <div>
      <BulletGrid items={[
        "The onboarding center is the launch hub.",
        "Provider Resources is where your team returns for product education and training.",
        "The portal is where account-specific pricing and reports live.",
        "Public product pages are for education, positioning, and staff training; private portal pages are for account-specific information.",
      ]} />
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{providerResources.map((link) => <div key={link.label} className="rounded-[18px] border border-[#d8c6a8]/70 bg-[#fbf8f3] p-4"><h3 className="font-semibold text-[#1f1a17]">{link.label}</h3><div className="mt-3"><ResourceButton link={{ ...link, label: "Open resource" }} /></div></div>)}</div>
      <div className="mt-5"><StepPreviewCard title="Provider resources navigation" /></div>
    </div>
  );
}

const orderingDetails = [
  ["DVI Rx Wizard", "Use this if your practice orders through DVI. Send us the login email if you have used it before; if not, we can create access.", "Submitting an Order in DVI"],
  ["SpecCheck", "Share the email used with SpecCheck so we can connect the lab. If you are new to SpecCheck, we can create access and send instructions.", "Submitting an Order in SpecCheck"],
  ["VisionWeb", "Add the appropriate Artisan Lab Network lab as the lab in VisionWeb and we will confirm the connection.", "VisionWeb Setup"],
  ["Eyefinity", "For VSP routing, add Pacific Artisan Labs when instructed. Peak or Pike customers may still need Pacific routing depending on setup.", "Eyefinity / VSP Setup"],
];

function OrderingModule() {
  return <div className="grid gap-4">{orderingDetails.map(([title, copy, video]) => <details key={title} className="rounded-[22px] border border-[#d8c6a8]/70 bg-[#fbf8f3] p-5" open={title === "DVI Rx Wizard"}><summary className="cursor-pointer text-lg font-semibold text-[#1f1a17]">{title}</summary><BulletGrid items={[`Use this system if: ${copy}`, "What the practice needs to do: confirm current access, send the login/contact email, and wait for connection confirmation.", "What Artisan Lab Network needs to do: connect the lab, confirm account routing, and help review the first order.", "Common mistakes: submitting before connection is confirmed, using an old login, or assuming VSP routing matches private-pay routing.", "Confirmation checklist: login works, correct lab appears, account is connected, and the first order path is understood."]} /><div className="mt-4"><TrainingResourceCard title={video} /></div></details>)}</div>;
}

function ShippingModule({ labKey }: { labKey: string }) {
  return <div><BulletGrid items={["Request shipping labels from your lab customer service team.", "Package frames securely and include a frame manifest when frames are sent to the lab.", "The manifest should match the orders being sent; missing or mismatched frame information can delay orders.", "Label shipments clearly and include practice/account information.", "Inbound and outbound shipping handling may vary by method, program, and VSP setup.", labKey === "peak" ? "Ask about local Colorado courier notes when applicable." : labKey === "pike" ? "Ask about local Indiana courier notes when applicable." : "Ask customer service whether local courier notes apply to your account."]} /><div className="mt-5 grid gap-3 md:grid-cols-3"><TrainingResourceCard title="Using a Frame Manifest" /><TrainingResourceCard title="Sending Frames to the Lab" /><TrainingResourceCard title="Requesting Shipping Labels" /></div><div className="mt-5"><StepPreviewCard title="Frame manifest process" /></div></div>;
}

function LensModule({ answers }: { answers: Answers }) {
  const selected = answers.selectedLensFamilies;
  const showAdvanced = answers.advanced === "Yes, show customized versions";
  if (selected.length === 0) return <div className="rounded-[20px] bg-[#fbf8f3] p-5 text-sm font-semibold text-[#625b53]">Select your lens families above and this section will build your training path.</div>;

  return (
    <div className="space-y-5">
      <p className="text-sm font-semibold text-[#625b53]">Your selected lens training</p>
      {selected.includes("iot-progressive") ? <LensCard title="IOT Branded Progressive Lenses" cta="View IOT Pricing" items={["Best: Camber Pure or Camber Steady Plus", "Better: Endless Steady", "Good: Essential Steady", "Value Option: CFB", "IOT is known for advanced lens design technology and free-form design expertise.", "Artisan Lab Network makes these advanced designs accessible to independent practices.", "These designs are built for strong adaptation, broad utility, and premium patient experience when ordered and fit correctly."]} video="Understanding IOT Progressive Options"><details className="mt-4 rounded-2xl bg-white p-4"><summary className="cursor-pointer font-semibold">Why IOT matters</summary><p className="mt-3 text-sm leading-7 text-[#625b53]">The point is not just having more lens names. The point is giving opticians practical, dependable choices across best/better/good/value needs.</p></details></LensCard> : null}
      {selected.includes("iot-sv") ? <LensCard title="IOT Branded Single Vision" cta="View Single Vision Pricing" items={["Use IOT single vision training for modern single vision options when your account uses this path.", "Review when to recommend, ordering/fitting basics, and portal pricing.", "Ask your onboarding contact to confirm the current IOT single vision product ladder for your account."]} /> : null}
      {selected.includes("iot-anti-fatigue") ? <LensCard title="IOT Branded Anti-Fatigue" cta="View Anti-Fatigue Pricing" items={["Anti-fatigue lenses support patients who need help with near demand and digital visual behavior.", "Review who they are for, ordering/fitting basics, and portal pricing.", "Ask your onboarding contact to confirm the current IOT anti-fatigue product ladder for your account."]} /> : null}
      {selected.includes("artisan-design") ? <LensCard title="Artisan Design Series" cta="View Artisan Design Series Pricing" items={["DS", "PS", "GS", "CFB", "Artisan Design Series is Artisan Lab Network's private-label lens portfolio.", "These private-label products were selected and curated with IOT-powered design options for independent practices.", "Private-label naming gives practices a cleaner way to present premium lenses."]} video="Understanding the Artisan Design Series" /> : null}
      {(selected.includes("unity-v3") || selected.includes("unity-office")) ? <LensCard title="Unity V3 / Unity Office / Unity Relieve" cta="Review Unity Pricing" items={["Unity V3 is the third iteration of the Unity progressive design family.", "Unity V3 is meaningfully different from earlier Unity versions.", "The design is intended to deliver a strong adaptation experience when ordered and fit correctly.", "Include Unity Office, Unity Relieve, SunSync, TechShield, and VSP/Unity Rewards where relevant."]} video="Unity V3: What Changed and How to Order" /> : null}
      {showAdvanced ? <LensCard title="Advanced/customized lens versions" cta="Review advanced pricing" items={["Artisan Design Series: DS Stable, DS Mobile, DS Vista.", "Confirm exact DS variant positioning with your product manager before launch.", "IOT: Camber Steady D, Camber Steady I, Camber Steady N, and Camber Steady Balance as default.", "There is currently no special-fit/custom version for Camber Pure unless confirmed otherwise.", "There is currently no special-fit/custom version for CFB unless confirmed otherwise.", "Ask your product manager to review advanced IOT variant positioning for your account."]} /> : null}
    </div>
  );
}

function LensCard({ title, items, cta, video, children }: { title: string; items: string[]; cta: string; video?: string; children?: ReactNode }) {
  return <article className="rounded-[22px] border border-[#d8c6a8]/70 bg-[#fbf8f3] p-5"><h3 className="text-2xl font-semibold text-[#1f1a17]">{title}</h3><div className="mt-4"><BulletGrid items={items} /></div><div className="mt-5 flex flex-wrap gap-2"><ResourceButton link={{ label: cta, href: "/portal/price-list" }} /></div>{children}{video ? <div className="mt-4"><TrainingResourceCard title={video} /></div> : null}</article>;
}

function ARModule() {
  return <div><p className="text-sm leading-7 text-[#625b53]">Availability can vary by lens material, lens design, lab, and program. Confirm availability in your ordering system or with your lab before promising a specific combination.</p><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{arTreatments.map((ar) => <article key={ar.name} className="rounded-[20px] border border-[#d8c6a8]/70 bg-[#fbf8f3] p-5">{ar.logo ? <Image src={ar.logo} alt={ar.name} width={180} height={72} className="h-14 w-auto object-contain" /> : <div className="grid h-14 w-36 place-items-center rounded-2xl bg-white text-sm font-bold text-[#1f1a17]">{ar.name}</div>}<h3 className="mt-4 text-xl font-semibold text-[#1f1a17]">{ar.name}</h3><p className="mt-2 text-sm leading-6 text-[#625b53]">{ar.use}</p><p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8a7654]">{ar.note}</p><div className="mt-4"><ResourceButton link={{ label: "Open training", href: ar.href }} /></div></article>)}</div><div className="mt-5 flex flex-wrap gap-2"><ResourceButton link={{ label: "View AR Pricing", href: "/portal/price-list" }} /><ResourceButton link={{ label: "Ask My Lab About Compatibility", href: `mailto:${supportContacts.onboarding.email}?subject=AR%20Compatibility%20Question` }} /></div><div className="mt-5"><TrainingResourceCard title="Choosing the Right AR Treatment" /></div></div>;
}

function TeamProgress() {
  return <section className="rounded-[28px] border border-[#d8c6a8]/70 bg-[#fbf8f3] p-5 md:p-7"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">Team Progress</p><h2 className="mt-2 text-3xl font-semibold text-[#1f1a17]">Coordinate onboarding progress with your team.</h2><p className="mt-3 text-sm leading-7 text-[#625b53]">Use this hub as the shared checklist for account setup, product training, ordering, and first-order readiness.</p></section>;
}

function OnboardingAccountContent({
  access,
  account,
  setSelectedAccountNumber,
}: {
  access: Extract<OnboardingAccess, { status: "authorized" }>;
  account: OnboardingAccount;
  setSelectedAccountNumber: Dispatch<SetStateAction<string>>;
}) {
  const [answers, setAnswers] = useStoredProgress(access.email, account.accountNumber);

  const resetProgress = () => {
    window.localStorage.removeItem(progressKey(access.email, account.accountNumber));
    setAnswers(defaultAnswers);
  };

  const resumeHref = answers.lastVisitedModule ? `#${answers.lastVisitedModule}` : "#plan";

  return (
    <main className="min-h-screen bg-[#f5f1eb] text-[#1f1a17]">
      <section data-theme="dark" className="relative isolate overflow-hidden bg-[#171311] px-6 pb-14 pt-20 text-white md:px-10 md:pt-28">
        <div className="absolute inset-0 -z-20 bg-cover bg-center opacity-35" style={{ backgroundImage: "url('/graphics/rings2.jpg')" }} />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(18,14,12,0.96),rgba(18,14,12,0.78)_58%,rgba(18,14,12,0.52))]" />
        <div className="mx-auto max-w-7xl">
          <Link href="/portal" className="text-xs font-semibold uppercase tracking-[0.26em] text-[#d4c09a]">Back to portal</Link>
          <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">Welcome to Artisan Lab Network</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/76 md:text-2xl md:leading-10">Your onboarding center is built around your account, your lab, your ordering systems, and the lens products your practice will use.</p>
          <div className="mt-8 flex flex-wrap gap-3"><a href={resumeHref} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#d4c09a] px-6 text-sm font-semibold text-[#171311]"><Clock className="h-4 w-4" aria-hidden="true" />Resume where you left off</a><button type="button" onClick={resetProgress} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/18 bg-white/10 px-6 text-sm font-semibold text-white"><RotateCcw className="h-4 w-4" aria-hidden="true" />Reset my progress</button></div>
        </div>
      </section>

      <section className="px-6 py-10 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
          <ProgressNav answers={answers} />
          <div className="space-y-6">
            <AccountPanel access={access} account={account} setSelectedAccount={setSelectedAccountNumber} />
            <PlanBuilder answers={answers} setAnswers={setAnswers} />
            <LaunchPath answers={answers} setAnswers={setAnswers} />

            <ModuleShell id="welcome" title="Welcome / How to Use This Hub" answers={answers} setAnswers={setAnswers}><BulletGrid items={["This hub is for approved Artisan Lab Network customers and team members.", "It is built around the selected account.", "It teaches lab connection, ordering, portal usage, pricing, reports, lens education, AR, shipping, remakes, and launch readiness.", "Complete the modules that match the account, lab, and selected product path."]} /></ModuleShell>
            <ModuleShell id="lab" title="Lab Connection Information" answers={answers} setAnswers={setAnswers}><LabModule account={account} /></ModuleShell>
            <ModuleShell id="portal" title="Portal Pricing and Reports" answers={answers} setAnswers={setAnswers}><PortalModule account={account} /></ModuleShell>
            <ModuleShell id="resources" title="Website and Provider Resources Training" answers={answers} setAnswers={setAnswers}><ResourcesModule /></ModuleShell>
            <ModuleShell id="ordering" title="Ordering Methods" answers={answers} setAnswers={setAnswers}><OrderingModule /></ModuleShell>
            <ModuleShell id="shipping" title="Sending Frames and Shipping Labels" answers={answers} setAnswers={setAnswers}><ShippingModule labKey={account.labKey} /></ModuleShell>
            <ModuleShell id="lens" title="Lens Education" answers={answers} setAnswers={setAnswers}><LensModule answers={answers} /></ModuleShell>
            <ModuleShell id="ar" title="AR Treatments" answers={answers} setAnswers={setAnswers}><ARModule /></ModuleShell>
            <ModuleShell id="sun" title="Photochromics and Sun Options" answers={answers} setAnswers={setAnswers}><BulletGrid items={["Review SunSync and Neochromes.", "Match photochromic options to indoor/outdoor patient profiles.", "Discuss when to recommend photochromic lenses versus dedicated sunwear.", "Find available colors, options, and pricing in the portal."]} /><div className="mt-5 flex flex-wrap gap-2"><ResourceButton link={{ label: "View Photochromic Pricing", href: "/portal/price-list" }} /><ResourceButton link={{ label: "Open Sun Options Training", href: "/provider-resources" }} /></div><div className="mt-5"><TrainingResourceCard title="Photochromic and Sun Options" /></div></ModuleShell>
            <ModuleShell id="systems" title="Artisan Systems / Safety / Bundles" answers={answers} setAnswers={setAnswers}><BulletGrid items={["Use Artisan Systems, lens/frame/safety bundles, and safety programs when they simplify ordering.", "Bundles help teams follow a cleaner order path for defined programs.", "Find pricing and resources in the portal and Provider Resources."]} /><div className="mt-5 flex flex-wrap gap-2"><ResourceButton link={{ label: "Review Safety and Bundle Resources", href: "/provider-resources#specialty-systems" }} /><ResourceButton link={{ label: "View System Pricing", href: "/portal/price-list/packages" }} /></div><div className="mt-5"><TrainingResourceCard title="Using Artisan Systems" /></div></ModuleShell>
            <ModuleShell id="vsp" title="VSP / Eyefinity / Managed Care" answers={answers} setAnswers={setAnswers}><BulletGrid items={["VSP orders may route through Eyefinity.", "You may need to add Pacific Artisan Labs in Eyefinity when instructed for VSP routing.", "Even if you primarily work with Peak or Pike, VSP routing may require Pacific depending on setup.", "Some managed vision care arrangements may restrict lab usage; some states may allow provider choice or freedom-of-choice lab access.", "This is operational guidance, not legal advice. If you are unsure, contact us and we can help review your setup."]} /><div className="mt-5 flex flex-wrap gap-2"><ResourceButton link={{ label: "Request VSP Setup Help", href: `mailto:${supportContacts.onboarding.email}?subject=VSP%20Setup%20Help` }} /><ResourceButton link={{ label: "Ask Us to Review Managed Care Setup", href: `mailto:${supportContacts.onboarding.email}?subject=Managed%20Care%20Setup%20Review` }} /></div><div className="mt-5"><TrainingResourceCard title="How to Add Artisan for VSP/Eyefinity" /></div></ModuleShell>
            <ModuleShell id="remakes" title="Remakes and Policies" answers={answers} setAnswers={setAnswers}><BulletGrid items={["Report a remake to customer service with the order number, patient initials, remake reason, and measurements or frame details when requested.", "Work with customer service to confirm what the lab needs before resubmission.", "Avoid remake delays by providing clear details and matching frame/order information.", "Use the official policy location for exact policy terms."]} /><div className="mt-5 flex flex-wrap gap-2"><ResourceButton link={{ label: "Open Lab Policies", href: "/portal/price-list/policies" }} /><ResourceButton link={{ label: "Contact Customer Service About a Remake", href: `mailto:${labs[account.labKey].email}?subject=Remake%20Question` }} /></div></ModuleShell>
            <ModuleShell id="complimentary" title="Complimentary Lens Orders" answers={answers} setAnswers={setAnswers}><BulletGrid items={["Complimentary lenses are for practice owner/staff education and experience.", "They are not for normal patient orders.", "They are not for family/friends unless explicitly approved by program rules.", "Staff should experience products before recommending them.", "Request the current complimentary lens guidelines before submitting staff training orders."]} /><div className="mt-5 flex flex-wrap gap-2"><ResourceButton link={{ label: "Review Complimentary Lens Guidelines", href: `mailto:${supportContacts.onboarding.email}?subject=Complimentary%20Lens%20Guidelines` }} /></div><div className="mt-5"><TrainingResourceCard title="How to Use Staff Training Lens Orders" /></div></ModuleShell>
            <ModuleShell id="launch" title="First Order Launch Checklist" answers={answers} setAnswers={setAnswers}><BulletGrid items={["I know which Artisan Lab Network lab I am working with.", "My account number is correct.", "My practice/team contacts are correct.", "My ordering platform is connected.", "My VSP/Eyefinity setup is complete or not needed.", "I know whether I am using IOT branded, Artisan Design Series, Unity, or mixed lens solutions.", "I know where to find my price list.", "I know where to find my reports.", "I know where to find Provider Resources.", "I understand AR treatment options.", "I understand how to send frames and request shipping labels.", "I know how to work with the lab on remakes.", "I know who to contact for help.", "I am ready to submit my first order."]} /><div className="mt-5 flex flex-wrap gap-2"><ResourceButton link={{ label: "Submit Your First Order", href: "#ordering" }} /><ResourceButton link={{ label: "Schedule Final Launch Help", href: `mailto:${supportContacts.onboarding.email}?subject=Final%20Launch%20Help` }} /><ResourceButton link={{ label: "Contact My Lab", href: `mailto:${labs[account.labKey].email}?subject=Launch%20Help` }} /></div></ModuleShell>
            <TeamProgress />
          </div>
        </div>
      </section>
    </main>
  );
}

export default function OnboardingHub({ access }: { access: Extract<OnboardingAccess, { status: "authorized" }> }) {
  const [selectedAccountNumber, setSelectedAccountNumber] = useState(access.accounts[0]?.accountNumber ?? "");
  const account = access.accounts.find((entry) => entry.accountNumber === selectedAccountNumber) ?? access.accounts[0]!;

  return (
    <OnboardingAccountContent
      key={`${access.email}:${account.accountNumber}`}
      access={access}
      account={account}
      setSelectedAccountNumber={setSelectedAccountNumber}
    />
  );
}
