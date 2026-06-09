"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Circle,
  Copy,
  Download,
  ExternalLink,
  Mail,
  Minus,
  Printer,
  RotateCcw,
  Slash,
} from "lucide-react";
import {
  labs,
  lensOptions,
  lensTrainingTracks,
  orderingMethods,
  portalFeatures,
  portalLoginSteps,
  providerResourceGroups,
  requiredTrainingResources,
  resourceLinks,
  safetyTrainingResources,
  sections,
  shippingVisuals,
  supportContacts,
  type LabId,
  type LensId,
  type PracticeManagementAnswer,
  type ResourceLink,
  type SetupStatus,
  type TrainingResource,
} from "./onboardingData";
import {
  arComparisonColumns,
  arComparisonRows,
  comparisonColumns,
  productComparisonRows,
} from "./comparisonData";

const STATUS_KEY = "artisan-new-lab-partner-section-status-v2";
const LAB_KEY = "artisan-new-lab-partner-lab-v2";
const LENS_KEY = "artisan-new-lab-partner-lenses-v2";
const PMS_KEY = "artisan-new-lab-partner-pms-v2";
const ORDERING_KEY = "artisan-new-lab-partner-ordering-v1";
const PRACTICE_NAME_KEY = "artisan-new-lab-partner-practice-name-v1";

const statusLabels: Record<SetupStatus, string> = {
  complete: "Complete",
  "not-started": "Not Started",
  "not-applicable": "Does Not Apply",
  skipped: "Skip",
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function ResourceButton({ link }: { link: ResourceLink }) {
  const className =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d8c6a8] bg-white px-4 py-2 text-sm font-semibold text-[#1f1a17] shadow-sm transition hover:-translate-y-0.5 hover:border-[#b99355] hover:bg-[#fbf8f3]";

  if (link.href.startsWith("mailto:") || link.href.startsWith("tel:") || link.external) {
    return (
      <a href={link.href} target={link.external ? "_blank" : undefined} rel={link.external ? "noreferrer" : undefined} className={className}>
        {link.label}
        {link.external ? <ExternalLink className="h-4 w-4" aria-hidden="true" /> : <ArrowRight className="h-4 w-4" aria-hidden="true" />}
      </a>
    );
  }

  if (link.href.startsWith("#")) {
    return (
      <a href={link.href} className={className}>
        {link.label}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </a>
    );
  }

  return (
    <Link href={link.href} className={className}>
      {link.label}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

function StatusIcon({ status }: { status: SetupStatus }) {
  if (status === "complete") return <Check className="h-4 w-4 text-[#2f6d3a]" aria-hidden="true" />;
  if (status === "not-applicable") return <Slash className="h-4 w-4 text-[#8c8a86]" aria-hidden="true" />;
  if (status === "skipped") return <Minus className="h-4 w-4 text-[#a4a09a]" aria-hidden="true" />;
  return <Circle className="h-4 w-4 text-[#b8aa96]" aria-hidden="true" />;
}

function StatusControls({
  sectionId,
  status,
  setStatus,
}: {
  sectionId: string;
  status: SetupStatus;
  setStatus: (sectionId: string, status: SetupStatus) => void;
}) {
  const statuses: SetupStatus[] = ["complete", "skipped", "not-applicable"];
  const statusHelp: Record<SetupStatus, string> = {
    complete: "Mark this section complete",
    skipped: "Skip this section for now",
    "not-applicable": "Mark this section as not applicable",
    "not-started": "Not started",
  };

  return (
    <div className="w-full max-w-xl rounded-[8px] border border-[#d8c6a8] bg-[#fbf8f3]/90 p-2 shadow-[0_12px_34px_rgba(49,39,26,0.08)] xl:w-auto">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {statuses.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={status === option}
          title={status === option ? "Click again to undo" : statusHelp[option]}
          onClick={() => setStatus(sectionId, status === option ? "not-started" : option)}
          className={cx(
            "group inline-flex min-h-12 items-center justify-center gap-2 rounded-[6px] border px-3 text-sm font-bold transition",
            status === option && option === "complete" && "border-[#86b889] bg-[#e6f3e1] text-[#24562d] shadow-sm",
            status === option && option === "skipped" && "border-[#d3cec7] bg-[#ebe7e1] text-[#625b53] shadow-sm",
            status === option && option === "not-applicable" && "border-[#d3cec7] bg-[#ebe7e1] text-[#625b53] shadow-sm line-through decoration-[#8c8a86]",
            status !== option && "border-transparent bg-white/62 text-[#4f463e] hover:border-[#d8c6a8] hover:bg-white",
          )}
        >
          <StatusIcon status={option} />
          <span>{statusLabels[option]}</span>
          {status === option ? (
            <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#716b63] no-underline opacity-0 transition group-hover:opacity-100">
              Undo
            </span>
          ) : null}
        </button>
      ))}
      </div>
    </div>
  );
}

function ProgressNav({ statuses, activeSection, setActiveSection }: { statuses: Record<string, SetupStatus>; activeSection: string; setActiveSection: (id: string) => void }) {
  return (
    <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
      <div className="rounded-[8px] border border-[#d8c6a8]/70 bg-white/92 p-4 shadow-[0_18px_54px_rgba(49,39,26,0.08)] backdrop-blur">
        <p className="px-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">Getting Started</p>
        <nav className="mt-3 space-y-1" aria-label="Onboarding sections">
          {sections.map((section) => {
            const status = statuses[section.id] ?? "not-started";
            const muted = status === "skipped" || status === "not-applicable";
            const active = section.id === activeSection;
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={() => setActiveSection(section.id)}
                className={cx(
                  "flex items-center gap-2 rounded-[8px] px-3 py-2 text-sm font-semibold transition hover:bg-[#f5f1eb]",
                  active && "bg-[#1f1a17] text-white hover:bg-[#1f1a17]",
                  !active && muted && "text-[#aaa39a]",
                  !active && !muted && "text-[#1f1a17]",
                  status === "not-applicable" && "line-through decoration-[#aaa39a]",
                )}
              >
                <StatusIcon status={status} />
                <span className="line-clamp-1">{section.title}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

function MobileProgress({ statuses, activeSection, setActiveSection }: { statuses: Record<string, SetupStatus>; activeSection: string; setActiveSection: (id: string) => void }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:hidden">
      {sections.map((section) => {
        const status = statuses[section.id] ?? "not-started";
        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            onClick={() => setActiveSection(section.id)}
            className={cx(
              "flex items-center gap-2 rounded-[8px] border px-3 py-2 text-sm font-semibold",
              activeSection === section.id ? "border-[#1f1a17] bg-[#1f1a17] text-white" : "border-[#d8c6a8] bg-white text-[#1f1a17]",
            )}
          >
            <StatusIcon status={status} />
            {section.title}
          </a>
        );
      })}
    </div>
  );
}

function WelcomeCard() {
  return (
    <section className="relative z-10 -mt-12 px-6 md:px-10">
      <div className="mx-auto max-w-7xl rounded-[8px] border border-[#d8c6a8]/70 bg-[#fbf8f3] p-5 shadow-[0_28px_80px_rgba(49,39,26,0.16)] md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">Welcome to Artisan Lab Network</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-[#1f1a17] md:text-4xl">Get operational first. Learn only what applies.</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#625b53] md:text-base">
              This hub helps your practice move work to Artisan Lab Network. Use it to confirm your lab contact information, understand how to order, access pricing, find policies, choose product resources, and train only on the products your team plans to use.
              Most practices complete setup in under 20 minutes.
            </p>
          </div>
          <p className="rounded-[8px] border border-[#d8c6a8] bg-white p-4 text-sm font-semibold leading-6 text-[#1f1a17]">
            Choose any section below and complete only what applies to your team.
          </p>
        </div>
      </div>
    </section>
  );
}

function LabSection({ selectedLab, setSelectedLab }: { selectedLab: LabId; setSelectedLab: (id: LabId) => void }) {
  const activeLab = labs.find((lab) => lab.id === selectedLab) ?? labs[0];

  return (
    <div className="mt-6">
      <div className="rounded-[8px] border border-[#d8c6a8] bg-[#fbf8f3] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7654]">Automatic Lab Detection</p>
        <p className="mt-2 text-sm leading-6 text-[#625b53]">
          If account data identifies the lab, this section should already be selected. If not, choose the Artisan lab your practice will send work to.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {labs.map((lab) => (
            <button
              key={lab.id}
              type="button"
              onClick={() => setSelectedLab(lab.id)}
              className={cx(
                "min-h-20 rounded-[8px] border px-5 text-left text-base font-bold transition",
                selectedLab === lab.id ? "border-[#1f1a17] bg-[#1f1a17] text-white shadow-md" : "border-[#d8c6a8] bg-white text-[#4f463e] hover:border-[#b99355]",
              )}
            >
              {lab.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-[8px] border border-[#d8c6a8]/70 bg-white">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative h-72 lg:h-full">
            <Image src={activeLab.image} alt={`${activeLab.name} lab`} fill sizes="(min-width: 1024px) 44vw, 100vw" className="object-cover" />
          </div>
          <div className="p-5 md:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">Lab Profile</p>
            <h3 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f1a17]">{activeLab.name}</h3>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["Phone", activeLab.phone, activeLab.phoneHref],
                ["Email", activeLab.email, `mailto:${activeLab.email}`],
                ["Hours", activeLab.hours],
                ["Mailing / Shipping Address", activeLab.address],
                ["Your ALN Representative", activeLab.representative],
              ].map(([label, value, href]) => (
                <div key={label} className="rounded-[8px] bg-[#fbf8f3] p-4">
                  <dt className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a7654]">{label}</dt>
                  <dd className="mt-2 text-sm font-semibold leading-6 text-[#1f1a17]">
                    {href ? <a href={href} className="hover:underline">{value}</a> : value}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              <ResourceButton link={{ label: "Meet the Artisans", href: activeLab.href }} />
              <ResourceButton link={{ label: "Contact customer service", href: `mailto:${activeLab.email}?subject=New%20Lab%20Partner%20Setup` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PortalSection() {
  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {portalLoginSteps.map((step, index) => (
          <article key={step.title} className="overflow-hidden rounded-[8px] border border-[#d8c6a8] bg-[#fbf8f3]">
            <PortalMockup step={index + 1} title={step.title} />
            <div className="p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a7654]">Step {index + 1}</p>
              <h3 className="mt-2 text-base font-semibold text-[#1f1a17]">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#625b53]">{step.detail}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {portalFeatures.map((feature) => (
          <article key={feature.title} className="overflow-hidden rounded-[8px] border border-[#d8c6a8] bg-white">
            <PortalFeatureMockup label={feature.label} title={feature.title} />
            <div className="p-5">
              <h3 className="text-xl font-semibold tracking-tight text-[#1f1a17]">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#625b53]">{feature.training}</p>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-[#625b53]">
                {feature.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-[#8a7654]" aria-hidden="true" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function PortalMockup({ step, title }: { step: number; title: string }) {
  return (
    <div className="h-36 bg-[#171311] p-4 text-white">
      <div className="flex items-center justify-between border-b border-white/15 pb-3">
        <span className="font-serif text-lg italic text-[#d4c09a]">Artisan</span>
        <div className="flex gap-1.5">
          {["Labs", "Resources", "Portal"].map((item) => (
            <span key={item} className={cx("rounded-full px-2 py-1 text-[10px] font-bold", step === 2 && item === "Portal" ? "bg-[#d4c09a] text-[#171311]" : "bg-white/10")}>
              {item}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 rounded-[8px] bg-white p-3 text-[#1f1a17] shadow-lg">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a7654]">Customer Portal</p>
        <div className="mt-2 h-7 rounded border border-[#d8c6a8] bg-[#fbf8f3] px-2 py-1 text-xs font-semibold">
          {step === 3 ? "registered@email.com" : step === 4 ? "PIN: 123456" : title}
        </div>
      </div>
    </div>
  );
}

function PortalFeatureMockup({ label, title }: { label: string; title: string }) {
  return (
    <div className="h-44 bg-[#f4eee4] p-4">
      <div className="h-full rounded-[8px] border border-[#d8c6a8] bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8a7654]">{label}</p>
          <span className="rounded-full bg-[#1f1a17] px-2 py-1 text-[10px] font-bold text-white">Portal</span>
        </div>
        <p className="mt-3 text-base font-semibold text-[#1f1a17]">{title}</p>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[55, 72, 44, 86].map((height) => (
            <div key={height} className="flex h-14 items-end rounded bg-[#fbf8f3] px-1">
              <span className="block w-full rounded-t bg-[#d4c09a]" style={{ height: `${height}%` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OrderingSection({
  lenses,
  selectedMethods,
  toggleMethod,
  pmsAnswer,
  setPmsAnswer,
}: {
  lenses: LensId[];
  selectedMethods: string[];
  toggleMethod: (name: string) => void;
  pmsAnswer: PracticeManagementAnswer;
  setPmsAnswer: (value: PracticeManagementAnswer) => void;
}) {
  const usesVsp = lenses.includes("unity");
  const [openMethod, setOpenMethod] = useState(usesVsp ? "Eyefinity" : orderingMethods[0]?.name);

  return (
    <div className="mt-6 space-y-5">
      <fieldset className="rounded-[8px] border border-[#d8c6a8] bg-[#fbf8f3] p-5">
        <legend className="px-1 text-base font-bold text-[#1f1a17]">Which ordering methods will your practice use?</legend>
        <p className="mt-2 text-sm leading-6 text-[#625b53]">
          Select every method your office will use. If Unity/VSP is selected in Product and Lens Training, Eyefinity is preselected as the default VSP workflow.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {orderingMethods.map((method) => {
            const selected = selectedMethods.includes(method.name);
            return (
              <label
                key={method.name}
                className={cx(
                  "flex cursor-pointer items-center gap-3 rounded-[8px] border p-4 transition",
                  selected ? "border-[#1f1a17] bg-white shadow-sm" : "border-[#d8c6a8] bg-white/70 hover:border-[#b99355]",
                )}
              >
                <input type="checkbox" checked={selected} onChange={() => toggleMethod(method.name)} className="h-4 w-4 accent-[#1f1a17]" />
                <OrderingLogo method={method.name} logo={method.logo} />
                <span className="text-sm font-bold text-[#1f1a17]">{method.name}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {orderingMethods.filter((method) => selectedMethods.includes(method.name)).map((method) => {
        const highlighted = usesVsp && method.name === "Eyefinity";
        const isOpen = openMethod === method.name;
        return (
          <article key={method.name} className={cx("overflow-hidden rounded-[8px] border bg-[#fbf8f3]", highlighted ? "border-[#1f1a17] ring-2 ring-[#d4c09a]" : "border-[#d8c6a8]")}>
            <button
              type="button"
              onClick={() => setOpenMethod(isOpen ? "" : method.name)}
              className="flex w-full items-center justify-between gap-4 p-4 text-left"
              aria-expanded={isOpen}
            >
              <div className="flex min-w-0 items-center gap-3">
                <OrderingLogo method={method.name} logo={method.logo} />
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a7654]">{highlighted ? "Pre-selected for VSP users" : "Ordering Method"}</p>
                  <h3 className="mt-1 text-xl font-semibold tracking-tight text-[#1f1a17]">{method.name}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#625b53]">{method.summary}</p>
                </div>
              </div>
              <ChevronDown className={cx("h-5 w-5 shrink-0 text-[#8a7654] transition", isOpen && "rotate-180")} aria-hidden="true" />
            </button>
            {isOpen ? (
              <div className="border-t border-[#d8c6a8] bg-white p-5">
                <p className="text-sm leading-7 text-[#625b53]">{method.setupHelp}</p>
                <ol className="mt-4 space-y-3 text-sm leading-6 text-[#625b53]">
                  {method.steps.map((step, index) => (
                    <li key={step} className="flex gap-3">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#1f1a17] text-xs font-bold text-white">{index + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                {method.watch?.length ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {method.watch.map((link) => (
                      <ResourceButton key={link.label} link={link} />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </article>
        );
      })}
      <PracticeManagementSection value={pmsAnswer} setValue={setPmsAnswer} />
    </div>
  );
}

function OrderingLogo({ method, logo }: { method: string; logo?: string }) {
  if (!logo || logo === "/aln-icon.png") {
    return (
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[8px] bg-white text-sm font-black text-[#1f1a17] shadow-sm">
        {method.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <div className="relative h-12 w-16 shrink-0 rounded-[8px] bg-white p-2 shadow-sm">
      <Image src={logo} alt={`${method} logo`} fill sizes="64px" className="object-contain p-2" />
    </div>
  );
}

function ProductComparisonGuide({
  lenses,
  practiceName,
  setPracticeName,
}: {
  lenses: LensId[];
  practiceName: string;
  setPracticeName: (value: string) => void;
}) {
  const [showGuide, setShowGuide] = useState(false);
  const selectedColumns = comparisonColumns.filter((column) => lenses.includes(column.lensId));
  const knownColumns = selectedColumns.filter((column) => column.workbookName);
  const missingColumns = selectedColumns.filter((column) => !column.workbookName);
  const printableName = practiceName.trim() || "Your Practice";
  const generatedDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date());

  const guideHtml = () => {
    const productHeaders = knownColumns.map((column) => `<th>${column.label}</th>`).join("");
    const productRows = productComparisonRows
      .map((row) => `<tr><th>${row.category}</th>${knownColumns.map((column) => `<td>${row.values[column.lensId] || "Data coming soon"}</td>`).join("")}</tr>`)
      .join("");
    const missing = missingColumns.length
      ? `<section class="placeholder"><h2>Comparison data coming soon</h2><p>${missingColumns.map((column) => column.label).join(", ")} ${missingColumns.length === 1 ? "is" : "are"} selected, but not yet mapped in Comparisons.xlsx.</p></section>`
      : "";
    const arHeaders = arComparisonColumns.map((label) => `<th>${label}</th>`).join("");
    const arRows = arComparisonRows
      .map((row) => `<tr><th>${row.need}<span>Category ${row.category}</span></th>${arComparisonColumns.map((label) => `<td>${row.values[label] || "—"}</td>`).join("")}</tr>`)
      .join("");

    return `<!doctype html><html><head><meta charset="utf-8"><title>${printableName} Product Comparison Guide</title><style>
      body{font-family:Arial,sans-serif;margin:0;background:#f7f1e8;color:#1f1a17}
      main{max-width:1100px;margin:0 auto;padding:34px}
      header{background:#171311;color:#fff;padding:28px;border-radius:10px}
      .logo{max-width:160px;height:auto;margin-bottom:22px}
      .eyebrow{color:#d4c09a;font-size:11px;letter-spacing:.24em;text-transform:uppercase;font-weight:700}
      h1{margin:10px 0 0;font-size:34px;line-height:1.05}
      .meta{margin-top:12px;color:rgba(255,255,255,.72)}
      section{background:#fff;margin-top:18px;padding:24px;border:1px solid #d8c6a8;border-radius:10px}
      h2{font-size:22px;margin:0 0 14px}
      table{width:100%;border-collapse:collapse;font-size:13px}
      th,td{border:1px solid #e5d7bd;padding:12px;text-align:left;vertical-align:top}
      thead th{background:#1f1a17;color:#fff}
      tbody th{background:#fbf8f3;width:24%}
      td{background:#fff}
      span{display:block;color:#8a7654;font-size:11px;margin-top:4px}
      .placeholder{background:#fbf8f3}
      @media print{body{background:#fff} main{padding:0} section,header{break-inside:avoid}}
    </style></head><body><main>
      <header><img class="logo" src="/aln-white-logo.png" alt="Artisan Lab Network"><div class="eyebrow">Product Comparison Guide</div><h1>${printableName}</h1><p class="meta">Generated ${generatedDate}. Built from Comparisons.xlsx and filtered to selected launch brands.</p></header>
      <section><h2>Lens Design Crosswalk</h2><table><thead><tr><th>Category</th>${productHeaders}</tr></thead><tbody>${productRows}</tbody></table></section>
      ${missing}
      <section><h2>Anti-Reflective Coatings Crosswalk</h2><table><thead><tr><th>Need</th>${arHeaders}</tr></thead><tbody>${arRows}</tbody></table></section>
    </main></body></html>`;
  };

  const openPrintGuide = () => {
    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) return;
    printWindow.document.write(guideHtml());
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const downloadGuide = () => {
    const blob = new Blob([guideHtml()], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${printableName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "artisan"}-product-comparison-guide.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const copyShare = async () => {
    const summary = [
      `${printableName} Product Comparison Guide`,
      `Selected brands: ${selectedColumns.map((column) => column.label).join(", ") || "None selected"}`,
      "Open the New Partner Setup Hub and use Generate My Product Comparison Guide in Product and Lens Training.",
      `${window.location.origin}/new-lab-partner#lens`,
    ].join("\n");

    if (navigator.share) {
      await navigator.share({ title: `${printableName} Product Comparison Guide`, text: summary });
      return;
    }

    await navigator.clipboard.writeText(summary);
  };

  return (
    <div id="comparison-guide" className="mt-5 rounded-[8px] border border-[#d8c6a8] bg-[#171311] p-5 text-white">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d4c09a]">Branded Setup Tool</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight">Product Comparison Guide</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/72">
            Generate a customer-ready crosswalk from Comparisons.xlsx. The guide only includes the brands selected above and adds placeholders when comparison data is not available yet.
          </p>
        </div>
        <label className="grid min-w-64 gap-2 text-sm font-semibold text-white">
          Customer name
          <input
            value={practiceName}
            onChange={(event) => setPracticeName(event.target.value)}
            placeholder="Practice name"
            className="min-h-11 rounded-[6px] border border-white/20 bg-white px-3 text-[#1f1a17] outline-none"
          />
        </label>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => setShowGuide(true)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#d4c09a] px-5 text-sm font-bold text-[#171311] transition hover:bg-[#e2cca2]">
          <Check className="h-4 w-4" />
          Generate My Product Comparison Guide
        </button>
        <button type="button" onClick={downloadGuide} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/18 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/16">
          <Download className="h-4 w-4" />
          Download Product Comparison Guide
        </button>
        <button type="button" onClick={openPrintGuide} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/18 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/16">
          <Printer className="h-4 w-4" />
          Export to PDF
        </button>
        <button type="button" onClick={copyShare} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/18 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/16">
          <Copy className="h-4 w-4" />
          Copy/share with team
        </button>
      </div>
      {showGuide ? (
        <div className="mt-6 overflow-hidden rounded-[8px] bg-[#fbf8f3] text-[#1f1a17]">
          <div className="flex flex-col gap-4 bg-[#241d18] p-5 text-white md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d4c09a]">Product Comparison Guide</p>
              <h4 className="mt-2 text-2xl font-semibold">{printableName}</h4>
              <p className="mt-1 text-sm text-white/68">Generated {generatedDate}</p>
            </div>
            <Image src="/aln-white-logo.png" alt="Artisan Lab Network" width={150} height={54} className="h-auto w-32 object-contain" />
          </div>
          <div className="p-5">
            {knownColumns.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="border border-[#d8c6a8] bg-[#1f1a17] p-3 text-left text-white">Category</th>
                      {knownColumns.map((column) => (
                        <th key={column.lensId} className="border border-[#d8c6a8] bg-[#1f1a17] p-3 text-left text-white">{column.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {productComparisonRows.map((row) => (
                      <tr key={row.category}>
                        <th className="border border-[#d8c6a8] bg-white p-3 text-left font-bold">{row.category}</th>
                        {knownColumns.map((column) => (
                          <td key={column.lensId} className="border border-[#d8c6a8] bg-white p-3">{row.values[column.lensId] || "Data coming soon"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            {missingColumns.length ? (
              <div className="mt-4 rounded-[8px] border border-[#d8c6a8] bg-white p-4">
                <p className="font-semibold">Comparison data coming soon</p>
                <p className="mt-2 text-sm leading-6 text-[#625b53]">
                  {missingColumns.map((column) => column.label).join(", ")} {missingColumns.length === 1 ? "is" : "are"} selected but not mapped in Comparisons.xlsx yet.
                </p>
              </div>
            ) : null}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border border-[#d8c6a8] bg-[#1f1a17] p-3 text-left text-white">AR Need</th>
                    {arComparisonColumns.map((column) => (
                      <th key={column} className="border border-[#d8c6a8] bg-[#1f1a17] p-3 text-left text-white">{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {arComparisonRows.map((row) => (
                    <tr key={row.need}>
                      <th className="border border-[#d8c6a8] bg-white p-3 text-left font-bold">
                        {row.need}
                        <span className="mt-1 block text-xs uppercase tracking-[0.14em] text-[#8a7654]">Category {row.category}</span>
                      </th>
                      {arComparisonColumns.map((column) => (
                        <td key={column} className="border border-[#d8c6a8] bg-white p-3">{row.values[column] || "—"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LensSelection({
  lenses,
  toggleLens,
  practiceName,
  setPracticeName,
}: {
  lenses: LensId[];
  toggleLens: (id: LensId) => void;
  practiceName: string;
  setPracticeName: (value: string) => void;
}) {
  const selectedTracks = lensTrainingTracks.filter((track) =>
    track.lensIds.some((lensId) => lenses.includes(lensId)),
  );
  const tracks = selectedTracks.length
    ? [...selectedTracks].sort((a, b) => {
        const aArtisan = a.lensIds.includes("artisan");
        const bArtisan = b.lensIds.includes("artisan");
        const aIot = a.lensIds.includes("iot");
        const bIot = b.lensIds.includes("iot");
        if (lenses.includes("artisan") && aArtisan !== bArtisan) return aArtisan ? -1 : 1;
        if (!lenses.includes("artisan") && aIot !== bIot) return aIot ? -1 : 1;
        return 0;
      })
    : lensTrainingTracks.filter((track) => track.lensIds.includes("iot"));
  const logoByLens = new Map(comparisonColumns.map((column) => [column.lensId, column.logo]));

  return (
    <div className="mt-6">
      <fieldset>
        <legend className="text-base font-bold text-[#1f1a17]">Which lenses do you expect to use?</legend>
        <p className="mt-2 text-sm leading-6 text-[#625b53]">
          Select everything your team expects to dispense. The training modules below update to show the relevant videos, guides, brochures, layout charts, and comparison tools.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {lensOptions.map((option) => {
            const checked = lenses.includes(option.id);
            return (
              <label
                key={option.id}
                className={cx(
                  "cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition",
                  checked ? "border-[#1f1a17] bg-[#1f1a17] text-white" : "border-[#d8c6a8] bg-[#fbf8f3] text-[#4f463e] hover:border-[#b99355]",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleLens(option.id)}
                  className="sr-only"
                  aria-label={option.label}
                />
                {logoByLens.get(option.id) ? (
                  <span className="relative mr-2 inline-block h-5 w-12 align-middle">
                    <Image src={logoByLens.get(option.id) ?? ""} alt="" fill sizes="48px" className={cx("object-contain", checked && "brightness-0 invert")} />
                  </span>
                ) : null}
                {option.label}
              </label>
            );
          })}
        </div>
      </fieldset>
      <ProductComparisonGuide lenses={lenses} practiceName={practiceName} setPracticeName={setPracticeName} />
      <div className="mt-5 rounded-[8px] border border-[#d8c6a8] bg-[#fbf8f3] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">Required for Everyone</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#1f1a17]">Anti-Reflective Coatings</h3>
        <p className="mt-2 text-sm leading-6 text-[#625b53]">
          Every launch should include Artisan AR, TechShield AR, layout chart usage, and comparison-guide practice. Use Artisan AR for Artisan lens recommendations, TechShield for Unity/VSP-aligned workflows, and the comparison resources before staff begin quoting from memory.
        </p>
        <ResourceGrid resources={requiredTrainingResources} />
      </div>
      <div className="mt-5 space-y-4">
        {tracks.map((track) => (
          <article key={track.title} className="rounded-[8px] border border-[#d8c6a8] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">Selected Training</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#1f1a17]">{track.title}</h3>
            <p className="mt-3 text-sm leading-7 text-[#625b53]">{track.why}</p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {track.learn.map((item) => (
                <div key={item} className="rounded-[8px] bg-[#fbf8f3] p-4 text-sm leading-6 text-[#625b53]">
                  <Check className="mb-2 h-4 w-4 text-[#8a7654]" aria-hidden="true" />
                  {item}
                </div>
              ))}
            </div>
            <ResourceGrid resources={track.resources} />
          </article>
        ))}
      </div>
    </div>
  );
}

function ResourceGrid({ resources }: { resources: TrainingResource[] }) {
  return (
    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {resources.map((resource) => (
        <ResourceCard key={`${resource.type}-${resource.label}`} resource={resource} />
      ))}
    </div>
  );
}

function ResourceCard({ resource }: { resource: TrainingResource }) {
  const actionLabel =
    resource.type === "Video"
      ? "Watch Training Video"
      : resource.type === "Layout Chart"
        ? "Download Layout Chart"
        : resource.type === "Brochure"
          ? "Download Brochure"
          : resource.type === "Comparison"
            ? "View Comparison Guide"
            : resource.type === "Frame Book"
              ? "Download Frame Book"
              : resource.type === "Price List"
                ? "Open Safety Price List"
                : resource.type === "Placeholder"
                  ? resource.label
                  : resource.type === "Treatment"
                    ? "Open AR Resource"
                    : resource.label;

  return (
    <article className="rounded-[8px] border border-[#d8c6a8] bg-white p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8a7654]">{resource.type}</p>
      <h4 className="mt-2 text-base font-semibold leading-6 text-[#1f1a17]">{resource.label}</h4>
      <p className="mt-2 text-sm leading-6 text-[#625b53]">{resource.description}</p>
      <div className="mt-4">
        <ResourceButton link={{ ...resource, label: actionLabel }} />
      </div>
    </article>
  );
}

function ProviderResourcesSection() {
  const directLinks: ResourceLink[] = [
    { label: "Championing MVC Vision Rights", href: "/provider-resources#championing-mvc-vision-rights" },
    { label: "Training Videos", href: "/provider-resources#videos" },
    { label: "Product Education", href: "/provider-resources#product-education" },
    { label: "Practice Downloads", href: "/provider-resources#downloads" },
    { label: "Layout Charts", href: "/provider-resources#layout-charts" },
    { label: "Policies", href: "/lab-policies" },
    { label: "Brochures", href: "/provider-resources#brochures" },
  ];
  const descriptions: Record<string, string> = {
    "Training Videos": "Use videos for product positioning, fitting habits, and team refreshers. Videos are best assigned after the team knows which lens families the practice will actually use.",
    Downloads: "Use downloads as the source of truth for guides, brochures, charts, policies, and patient-facing references. Do not train from screenshots of old PDFs.",
    "Lens Layout Charts": "Use layout charts before first orders and whenever a design is unfamiliar. They prevent measurement assumptions from becoming remakes.",
    Brochures: "Use brochures to support patient conversations and staff language, especially when introducing a premium or specialty product.",
    "Championing MVC Vision Rights": "Use this content when the practice needs to understand managed vision care choice conversations and how provider-choice issues affect lab routing.",
    "Recorded Training": "Use recorded training when onboarding new hires or when a practice needs to repeat product education without waiting for a live session.",
    Videos: "Use practice videos for repeatable internal training and staff meetings.",
    Policies: "Use policies before promising remake, warranty, shipping, or frame handling answers.",
    "Marketing Materials": "Use marketing materials to support launch conversations, patient education, and office merchandising.",
    "Comparison Guides": "Use comparison guides to help staff choose between lens systems without flattening everything into price.",
    "Safety Resources": "Use safety resources for frame books, kit requests, and occupational eyewear setup.",
    "Tokai Resources": "Use Tokai resources when the practice will recommend Tokai materials, Reset, Largo, tint, or specialty designs.",
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-[8px] border border-[#d8c6a8] bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">Ongoing Resource Library</p>
        <p className="mt-2 text-sm leading-6 text-[#625b53]">
          Provider Resources is the public library for practice teams after activation. Use these shortcuts when staff need refreshers, public downloads, charts, policy references, videos, or brochures.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {directLinks.map((link) => (
            <ResourceButton key={link.label} link={link} />
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {providerResourceGroups.map((group) => (
          <article key={group.title} className="rounded-[8px] border border-[#d8c6a8] bg-[#fbf8f3] p-5">
            <h3 className="text-xl font-semibold tracking-tight text-[#1f1a17]">{group.title}</h3>
            <div className="mt-4 grid gap-2">
              {group.items.map((item) => (
                <div key={item} className="rounded-[8px] bg-white p-4">
                  <p className="text-sm font-semibold text-[#1f1a17]">{item}</p>
                  <p className="mt-2 text-sm leading-6 text-[#625b53]">{descriptions[item] ?? "Use this as a working reference during launch and staff training."}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function SafetySection() {
  const workflow = [
    {
      title: "What Artisan Safety Systems is",
      body:
        "Artisan Safety Systems is a safety frame and lens program for practices serving employers, workers, and occupational eyewear needs. It gives the office a defined frame path, tiered pricing, and ordering support instead of forcing staff to treat safety work like an ordinary retail frame order.",
    },
    {
      title: "Where safety pricing lives",
      body:
        "Safety pricing is tiered on the Y5 safety price list. Use the tier shown on the price list before quoting frames, safety lenses, upgrades, side-shield needs, or package combinations.",
    },
    {
      title: "How to order safety",
      body:
        "Confirm the employer or occupational need, choose an approved safety frame option, then place the lens order through the correct ordering method. Ask customer service to review the first safety orders if the practice has not used the program before.",
    },
    {
      title: "How to obtain safety frames",
      body:
        "Order the free safety kit for demonstration frames and program materials. Use the frame books below to compare ArmouRx, DVX/Wiley X, Wiley X, ArtCraft, and SafeVision options.",
    },
  ];

  return (
    <div className="mt-6 space-y-5">
      <div className="rounded-[8px] border border-[#d8c6a8] bg-[#171311] p-7 text-center text-white">
        <Image src="/logos/safetysystemswhite.png" alt="Artisan Safety Systems" width={760} height={280} className="mx-auto h-auto max-h-44 w-auto max-w-[560px]" />
        <p className="mx-auto mt-6 max-w-3xl text-sm leading-7 text-white/76 md:text-base">
          Artisan Safety Systems is a frame and lens safety program. It includes safety frames, safety lenses, and tiered pricing shown on the safety price list. Use this section before quoting safety jobs, ordering frames, or sending safety work to the lab.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ResourceButton link={{ label: "Open Safety Price List", href: "/portal/price-list/y5" }} />
          <ResourceButton link={{ label: "Download Frame Manifest PDF", href: "#shipping" }} />
          <ResourceButton link={{ label: "Request Shipping Labels", href: `mailto:${supportContacts.general.email}?subject=Request%20Shipping%20Labels` }} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          {workflow.map((item) => (
            <div key={item.title} className="rounded-[8px] border border-[#d8c6a8] bg-[#fbf8f3] p-5">
              <ShieldVisual />
              <h3 className="mt-4 text-base font-semibold text-[#1f1a17]">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#625b53]">{item.body}</p>
            </div>
          ))}
        </div>
        <div className="rounded-[8px] border border-[#d8c6a8] bg-[#fbf8f3] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">How to Participate</p>
          <ol className="mt-4 space-y-3 text-sm leading-6 text-[#625b53]">
            {[
              "Open the Y5 Safety Systems price list and review frame tiers.",
              "Order the free safety kit or use the vendor frame books to choose frames.",
              "Confirm ordering method and lab routing before sending safety jobs.",
              "Include a frame manifest for customer-supplied frames or safety frames sent to the lab.",
              "Ask customer service to review anything unusual before promising the patient or employer.",
            ].map((item, index) => (
              <li key={item} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#1f1a17] text-xs font-bold text-white">{index + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-sm leading-6 text-[#625b53]">
            Need help? Contact customer service for shipping labels, first-order review, safety pricing questions, or frame program setup.
          </p>
        </div>
      </div>
      <div className="rounded-[8px] border border-[#d8c6a8] bg-[#fbf8f3] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">Vendors and Working References</p>
        <p className="mt-2 text-sm leading-6 text-[#625b53]">
          Provider Resources lists ArmouRx, DVX / Wiley X, Wiley X, ArtCraft, and SafeVision references. Use these as the active frame catalogs for safety and occupational eyewear conversations.
        </p>
        <ResourceGrid resources={safetyTrainingResources} />
      </div>
    </div>
  );
}

function ShieldVisual() {
  return (
    <div className="grid h-11 w-11 place-items-center rounded-[8px] bg-[#1f1a17] text-[#d4c09a]">
      <Check className="h-5 w-5" aria-hidden="true" />
    </div>
  );
}

function PatientSection({ lenses }: { lenses: LensId[] }) {
  const items = [
    {
      title: "Find Tokai providers",
      body: "Patients may use public resources to locate participating practices or understand where Tokai specialty products are available.",
    },
    {
      title: "Learn about specialty lenses",
      body: "Patient resources should explain why a lens category matters in plain language. Staff should use it to support, not replace, the in-office recommendation.",
    },
    {
      title: "Review educational content",
      body: "Use public education when a patient wants to read after the visit or when staff need a consistent explanation for premium, specialty, or occupational recommendations.",
    },
    {
      title: "Find participating practices",
      body: "Locator content helps direct patients to practices connected to specific product relationships or specialty offerings.",
    },
    ...(lenses.includes("tokai")
      ? [{
          title: "Tokai relationship",
          body: "Because Tokai is selected above, staff should connect patient-facing Tokai content to the practice's actual Tokai recommendation path.",
        }]
      : []),
  ];

  return (
    <div className="mt-6 rounded-[8px] border border-[#d8c6a8] bg-[#fbf8f3] p-5">
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <div key={item.title} className="rounded-[8px] bg-white p-4">
            <p className="text-sm font-semibold leading-6 text-[#1f1a17]">{item.title}</p>
            <p className="mt-2 text-sm leading-6 text-[#625b53]">{item.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-5">
        <ResourceButton link={{ label: "Open Patient Resources", href: "/patient-resources" }} />
      </div>
    </div>
  );
}

function PracticeManagementSection({
  value,
  setValue,
}: {
  value: PracticeManagementAnswer;
  setValue: (value: PracticeManagementAnswer) => void;
}) {
  const options: { value: PracticeManagementAnswer; label: string }[] = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
    { value: "not-sure", label: "Not Sure" },
  ];

  return (
    <div className="mt-6 rounded-[8px] border border-[#d8c6a8] bg-[#fbf8f3] p-5">
      <fieldset>
        <legend className="text-base font-bold text-[#1f1a17]">Does your practice management software automatically send orders?</legend>
        <div className="mt-4 flex flex-wrap gap-2">
          {options.map((option) => (
            <label
              key={option.value}
              className={cx(
                "cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition",
                value === option.value ? "border-[#1f1a17] bg-[#1f1a17] text-white" : "border-[#d8c6a8] bg-white text-[#4f463e] hover:border-[#b99355]",
              )}
            >
              <input type="radio" name="pms" checked={value === option.value} onChange={() => setValue(option.value)} className="sr-only" />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
      {value === "yes" || value === "not-sure" ? (
        <div className="mt-5 rounded-[8px] bg-white p-5">
          <h3 className="text-xl font-semibold tracking-tight text-[#1f1a17]">Do you need help adding ALN lenses, lab routing, or order configuration?</h3>
          <p className="mt-3 text-sm leading-6 text-[#625b53]">
            Contact {supportContacts.onboarding.name} at{" "}
            <a href={`mailto:${supportContacts.onboarding.email}`} className="font-semibold text-[#1f1a17] underline">
              {supportContacts.onboarding.email}
            </a>
            .
          </p>
        </div>
      ) : null}
    </div>
  );
}

function ShippingSection() {
  const steps = [
    {
      title: "Sending frames to the lab",
      body: "Confirm whether the order is frame-to-come, traced, uncuts only, or part of a complete-pair/frame program. Package frames so they arrive with the order information the lab needs to match the job.",
    },
    {
      title: "Labels and order paperwork",
      body: "Use the shipping label or ordering paperwork tied to the correct lab and account. If the practice works with more than one Artisan lab, do not reuse labels without confirming the route.",
    },
    {
      title: "Packaging expectations",
      body: "Protect frames from bending, scratching, or case damage. Include enough identifying information that receiving can connect the physical frame to the electronic order.",
    },
    {
      title: "When to ask before shipping",
      body: "Ask before shipping unusual frames, safety frames, drilled mounts, high-wrap jobs, fragile patient frames, or anything tied to a program rule the team has not used before.",
    },
  ];

  return (
    <div className="mt-6 space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        {steps.map((step, index) => {
          const visual = shippingVisuals[index % shippingVisuals.length];
          const Icon = visual.icon;
          return (
            <article key={step.title} className="rounded-[8px] border border-[#d8c6a8] bg-[#fbf8f3] p-5">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[8px] bg-white text-[#8a7654] shadow-sm">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a7654]">Shipping Step {index + 1}</p>
                  <h3 className="mt-2 text-lg font-semibold text-[#1f1a17]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#625b53]">{step.body}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <div className="rounded-[8px] border border-[#d8c6a8] bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">Shipping Actions</p>
        <p className="mt-2 text-sm leading-6 text-[#625b53]">
          Use the frame manifest when sending frames to the lab so the lab can match frames, patients, accounts, and orders correctly. Request labels before the first shipment so frames route to the correct lab.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <ResourceButton link={{ label: "Download Frame Manifest PDF", href: "#shipping" }} />
          <ResourceButton link={{ label: "Request Shipping Labels from Customer Service", href: `mailto:${supportContacts.general.email}?subject=Request%20Shipping%20Labels` }} />
          <ResourceButton link={{ label: "Contact Customer Service", href: `mailto:${supportContacts.general.email}?subject=Shipping%20Question` }} />
        </div>
      </div>
    </div>
  );
}

function SectionBody({
  id,
  selectedLab,
  setSelectedLab,
  lenses,
  toggleLens,
  practiceName,
  setPracticeName,
  selectedMethods,
  toggleMethod,
  pmsAnswer,
  setPmsAnswer,
}: {
  id: string;
  selectedLab: LabId;
  setSelectedLab: (id: LabId) => void;
  lenses: LensId[];
  toggleLens: (id: LensId) => void;
  practiceName: string;
  setPracticeName: (value: string) => void;
  selectedMethods: string[];
  toggleMethod: (name: string) => void;
  pmsAnswer: PracticeManagementAnswer;
  setPmsAnswer: (value: PracticeManagementAnswer) => void;
}) {
  if (id === "lab") return <LabSection selectedLab={selectedLab} setSelectedLab={setSelectedLab} />;
  if (id === "portal") return <PortalSection />;
  if (id === "pricing-safety") return <SafetySection />;
  if (id === "ordering") return <OrderingSection lenses={lenses} selectedMethods={selectedMethods} toggleMethod={toggleMethod} pmsAnswer={pmsAnswer} setPmsAnswer={setPmsAnswer} />;
  if (id === "lens") return <LensSelection lenses={lenses} toggleLens={toggleLens} practiceName={practiceName} setPracticeName={setPracticeName} />;
  if (id === "provider-resources") return <ProviderResourcesSection />;
  if (id === "patient-resources") return <PatientSection lenses={lenses} />;
  if (id === "shipping") return <ShippingSection />;
  return null;
}

function SetupSection({
  section,
  status,
  setStatus,
  selectedLab,
  setSelectedLab,
  lenses,
  toggleLens,
  practiceName,
  setPracticeName,
  selectedMethods,
  toggleMethod,
  pmsAnswer,
  setPmsAnswer,
}: {
  section: (typeof sections)[number];
  status: SetupStatus;
  setStatus: (sectionId: string, status: SetupStatus) => void;
  selectedLab: LabId;
  setSelectedLab: (id: LabId) => void;
  lenses: LensId[];
  toggleLens: (id: LensId) => void;
  practiceName: string;
  setPracticeName: (value: string) => void;
  selectedMethods: string[];
  toggleMethod: (name: string) => void;
  pmsAnswer: PracticeManagementAnswer;
  setPmsAnswer: (value: PracticeManagementAnswer) => void;
}) {
  const Icon = section.icon;

  return (
    <section
      id={section.id}
      className={cx(
        "scroll-mt-24 rounded-[8px] border bg-white p-5 shadow-[0_18px_54px_rgba(49,39,26,0.08)] md:p-7",
        status === "not-applicable" ? "border-[#ddd8d1] opacity-70" : "border-[#d8c6a8]/70",
      )}
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[8px] bg-[#1f1a17] text-[#d4c09a]">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">{section.eyebrow}</p>
            <h2 className={cx("mt-2 text-2xl font-semibold tracking-tight text-[#1f1a17] md:text-3xl", status === "not-applicable" && "line-through decoration-[#aaa39a]")}>
              {section.title}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#625b53] md:text-base">{section.summary}</p>
          </div>
        </div>
        <StatusControls sectionId={section.id} status={status} setStatus={setStatus} />
      </div>

      <SectionBody
        id={section.id}
        selectedLab={selectedLab}
        setSelectedLab={setSelectedLab}
        lenses={lenses}
        toggleLens={toggleLens}
        practiceName={practiceName}
        setPracticeName={setPracticeName}
        selectedMethods={selectedMethods}
        toggleMethod={toggleMethod}
        pmsAnswer={pmsAnswer}
        setPmsAnswer={setPmsAnswer}
      />
    </section>
  );
}

export default function NewLabPartnerHub() {
  const [statuses, setStatuses] = useState<Record<string, SetupStatus>>({});
  const [selectedLab, setSelectedLab] = useState<LabId>("peak");
  const [lenses, setLenses] = useState<LensId[]>(["artisan"]);
  const [selectedMethods, setSelectedMethods] = useState<string[]>(["DVI"]);
  const [pmsAnswer, setPmsAnswer] = useState<PracticeManagementAnswer>("");
  const [practiceName, setPracticeName] = useState("");
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? "lab");
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    window.requestAnimationFrame(() => {
      if (cancelled) return;
      const storedLenses = safeRead<LensId[]>(LENS_KEY, ["artisan"]);
      const storedMethods = safeRead<string[]>(ORDERING_KEY, ["DVI"]);
      setStatuses(safeRead<Record<string, SetupStatus>>(STATUS_KEY, {}));
      setSelectedLab(safeRead<LabId>(LAB_KEY, "peak"));
      setLenses(storedLenses);
      setSelectedMethods(storedLenses.includes("unity") && !storedMethods.includes("Eyefinity") ? [...storedMethods, "Eyefinity"] : storedMethods);
      setPmsAnswer(safeRead<PracticeManagementAnswer>(PMS_KEY, ""));
      setPracticeName(safeRead<string>(PRACTICE_NAME_KEY, ""));
      setHasHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    window.localStorage.setItem(STATUS_KEY, JSON.stringify(statuses));
  }, [statuses, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;
    window.localStorage.setItem(LAB_KEY, JSON.stringify(selectedLab));
  }, [selectedLab, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;
    window.localStorage.setItem(LENS_KEY, JSON.stringify(lenses));
  }, [lenses, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;
    window.localStorage.setItem(PMS_KEY, JSON.stringify(pmsAnswer));
  }, [pmsAnswer, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;
    window.localStorage.setItem(ORDERING_KEY, JSON.stringify(selectedMethods));
  }, [selectedMethods, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;
    window.localStorage.setItem(PRACTICE_NAME_KEY, JSON.stringify(practiceName));
  }, [practiceName, hasHydrated]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0.15, 0.3, 0.6] },
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const setStatus = (sectionId: string, status: SetupStatus) => {
    setStatuses((current) => {
      if (status !== "not-started") return { ...current, [sectionId]: status };

      const next = { ...current };
      delete next[sectionId];
      return next;
    });
  };

  const toggleLens = (id: LensId) => {
    const addingUnity = id === "unity" && !lenses.includes("unity");
    setLenses((current) => (current.includes(id) ? current.filter((lens) => lens !== id) : [...current, id]));
    if (addingUnity) {
      setSelectedMethods((methods) => (methods.includes("Eyefinity") ? methods : [...methods, "Eyefinity"]));
    }
  };

  const toggleMethod = (name: string) => {
    setSelectedMethods((current) => (current.includes(name) ? current.filter((method) => method !== name) : [...current, name]));
  };

  const completion = useMemo(() => {
    const complete = sections.filter((section) => statuses[section.id] === "complete").length;
    return Math.round((complete / sections.length) * 100);
  }, [statuses]);

  const resetAll = () => {
    setStatuses({});
    setSelectedLab("peak");
    setLenses(["artisan"]);
    setSelectedMethods(["DVI"]);
    setPmsAnswer("");
    setPracticeName("");
    if (typeof window !== "undefined") {
      [STATUS_KEY, LAB_KEY, LENS_KEY, PMS_KEY, ORDERING_KEY, PRACTICE_NAME_KEY].forEach((key) => window.localStorage.removeItem(key));
    }
  };

  return (
    <>
      <section data-theme="dark" className="relative isolate overflow-hidden bg-[#171311] px-6 pb-28 pt-32 text-white md:px-10 md:pt-40">
        <div className="absolute inset-0 -z-20 bg-cover bg-center opacity-38 md:bg-fixed" style={{ backgroundImage: "url('/images/team-at-lab-2025-1.jpg')" }} />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(18,14,12,0.97),rgba(18,14,12,0.84)_58%,rgba(18,14,12,0.48))]" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d4c09a]">New Lab Partner Setup</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">Get Your Practice Operational</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/76 md:text-2xl md:leading-10">
              Connect with your lab, learn how to order, find pricing, access product resources, and move work to Artisan Lab Network with confidence.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#lab" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#d4c09a] px-7 py-3 text-sm font-semibold text-[#171311] shadow-[0_18px_50px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-[#e2cca2]">
                Start Setup
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href={`mailto:${supportContacts.general.email}?subject=New%20Lab%20Partner%20Customer%20Service`} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/18 bg-white/10 px-7 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/15">
                Contact Customer Service
                <Mail className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="rounded-[8px] border border-white/12 bg-white/[0.06] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d4c09a]">Setup Progress</p>
            <p className="mt-2 text-4xl font-semibold">{completion}%</p>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/12">
              <div className="h-full rounded-full bg-[#d4c09a]" style={{ width: `${completion}%` }} />
            </div>
            <div className="mt-6 grid gap-3">
              {["Who is my lab?", "How do I order?", "Where is pricing?", "Who do I call?"].map((item) => (
                <div key={item} className="rounded-[8px] bg-white/8 p-4 text-sm font-semibold text-white/82">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <WelcomeCard />

      <section className="px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[300px_1fr]">
          <ProgressNav statuses={statuses} activeSection={activeSection} setActiveSection={setActiveSection} />
          <div className="min-w-0 space-y-5">
            <MobileProgress statuses={statuses} activeSection={activeSection} setActiveSection={setActiveSection} />
            <div className="rounded-[8px] border border-[#d8c6a8]/70 bg-[#fbf8f3] p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">Activation Checklist</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f1a17]">Complete only what applies.</h2>
                </div>
                <button type="button" onClick={resetAll} className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-[#1f1a17] px-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#d4c09a] hover:text-[#171311]">
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset Progress
                </button>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {resourceLinks.map((link) => (
                  <ResourceButton key={link.label} link={link} />
                ))}
              </div>
            </div>

            {sections.map((section) => (
              <SetupSection
                key={section.id}
                section={section}
                status={statuses[section.id] ?? "not-started"}
                setStatus={setStatus}
                selectedLab={selectedLab}
                setSelectedLab={setSelectedLab}
                lenses={lenses}
                toggleLens={toggleLens}
                practiceName={practiceName}
                setPracticeName={setPracticeName}
                selectedMethods={selectedMethods}
                toggleMethod={toggleMethod}
                pmsAnswer={pmsAnswer}
                setPmsAnswer={setPmsAnswer}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
