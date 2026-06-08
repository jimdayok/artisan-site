"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Circle,
  Clock,
  ExternalLink,
  Mail,
  PlayCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  finalChecklist,
  firstNeedModuleMap,
  labs,
  lensTracks,
  modules,
  orderingSystems,
  portalResources,
  providerResources,
  questions,
  statusIcons,
  supportContacts,
  type LabId,
  type LensPathId,
  type ModuleStatus,
  type OnboardingAnswers,
  type OnboardingModule,
  type OrderingSystem,
  type ResourceLink,
} from "./onboardingData";

const ANSWERS_KEY = "artisan-new-lab-partner-answers-v1";
const COMPLETED_KEY = "artisan-new-lab-partner-completed-modules-v1";
const LENS_KEY = "artisan-new-lab-partner-lens-track-v1";

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
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d8c6a8]/70 bg-white px-4 py-2 text-sm font-semibold text-[#1f1a17] shadow-sm transition hover:-translate-y-0.5 hover:border-[#c9b28b] hover:bg-[#fbf8f3]";

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

function VideoPlaceholder({ title }: { title: string }) {
  return (
    <div className="rounded-[20px] border border-dashed border-[#b8a27d]/70 bg-[#fbf8f3] p-5">
      {/* TODO: Replace this placeholder with the final onboarding video asset when available. */}
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1f1a17] text-[#d4c09a]">
          <PlayCircle className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#1f1a17]">{title}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7654]">
            Video placeholder
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: ModuleStatus }) {
  const Icon = statusIcons[status];
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
        status === "Complete" && "bg-[#e4f2df] text-[#31551f]",
        status === "In progress" && "bg-[#fff1cf] text-[#745719]",
        status === "Not started" && "bg-[#efe7dc] text-[#6d6258]",
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {status}
    </span>
  );
}

function ModuleCard({
  module,
  active,
  status,
  onStart,
  onComplete,
}: {
  module: OnboardingModule;
  active: boolean;
  status: ModuleStatus;
  onStart: () => void;
  onComplete: () => void;
}) {
  const Icon = module.icon;

  return (
    <article
      className={cx(
        "rounded-[24px] border bg-white p-5 shadow-[0_18px_46px_rgba(49,39,26,0.08)] transition",
        active ? "border-[#b99355] ring-2 ring-[#d4c09a]/45" : "border-[#d8c6a8]/65",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#1f1a17] text-[#d4c09a]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <StatusPill status={status} />
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">
        {module.eyebrow} - {module.time}
      </p>
      <h3 className="mt-2 text-xl font-semibold tracking-tight text-[#1f1a17]">{module.title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#625b53]">{module.why}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {module.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-[#f5f1eb] px-3 py-1 text-xs font-semibold text-[#7a6544]">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <a
          href={`#${module.id}`}
          onClick={onStart}
          className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#1f1a17] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#d4c09a] hover:text-[#171311]"
        >
          Start module
        </a>
        <button
          type="button"
          onClick={onComplete}
          className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#d8c6a8] px-4 text-sm font-semibold text-[#1f1a17] transition hover:-translate-y-0.5 hover:bg-[#fbf8f3]"
        >
          Mark complete
        </button>
      </div>
    </article>
  );
}

function ProgressNav({
  recommendedIds,
  completedIds,
}: {
  recommendedIds: string[];
  completedIds: string[];
}) {
  return (
    <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
      <div className="rounded-[24px] border border-[#d8c6a8]/70 bg-white/88 p-4 shadow-[0_18px_54px_rgba(49,39,26,0.08)] backdrop-blur">
        <p className="px-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">
          Progress
        </p>
        <nav className="mt-3 space-y-1" aria-label="Onboarding modules">
          {modules.map((module) => {
            const isRecommended = recommendedIds.includes(module.id);
            const isComplete = completedIds.includes(module.id);
            return (
              <a
                key={module.id}
                href={`#${module.id}`}
                className={cx(
                  "flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition hover:bg-[#f5f1eb]",
                  isRecommended ? "text-[#1f1a17]" : "text-[#756c63]",
                )}
              >
                {isComplete ? (
                  <Check className="h-4 w-4 text-[#54743b]" aria-hidden="true" />
                ) : (
                  <Circle className={cx("h-3 w-3", isRecommended ? "fill-[#d4c09a] text-[#d4c09a]" : "text-[#d8c6a8]")} aria-hidden="true" />
                )}
                <span className="line-clamp-1">{module.title}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

function MobileProgressMenu({
  recommendedIds,
  completedIds,
}: {
  recommendedIds: string[];
  completedIds: string[];
}) {
  return (
    <details className="rounded-[22px] border border-[#d8c6a8]/70 bg-white p-4 shadow-sm lg:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-[#1f1a17]">
        Module progress
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </summary>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {modules.map((module) => (
          <a
            key={module.id}
            href={`#${module.id}`}
            className={cx(
              "rounded-2xl border px-3 py-2 text-sm font-semibold",
              recommendedIds.includes(module.id) ? "border-[#d4c09a] bg-[#fbf8f3] text-[#1f1a17]" : "border-[#eadfcc] text-[#756c63]",
            )}
          >
            {completedIds.includes(module.id) ? "Done: " : ""}
            {module.title}
          </a>
        ))}
      </div>
    </details>
  );
}

function PathBuilder({
  answers,
  setAnswer,
  onRestart,
}: {
  answers: OnboardingAnswers;
  setAnswer: (id: keyof OnboardingAnswers, value: string) => void;
  onRestart: () => void;
}) {
  return (
    <section id="path-builder" className="relative z-10 -mt-12 px-6 md:px-10">
      <div className="mx-auto max-w-7xl rounded-[28px] border border-[#d8c6a8]/70 bg-[#fbf8f3] p-5 shadow-[0_28px_80px_rgba(49,39,26,0.16)] md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">
              Build My Onboarding Path
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#1f1a17] md:text-4xl">
              Answer a few setup questions.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#625b53] md:text-base">
              Your answers prioritize the right modules on this page. Nothing is submitted to a database in V1, and your progress is saved only in this browser.
            </p>
          </div>
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-[#d8c6a8] bg-white px-4 text-sm font-semibold text-[#1f1a17] transition hover:-translate-y-0.5 hover:bg-[#f5f1eb]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Restart questionnaire
          </button>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {questions.map((question) => (
            <fieldset key={question.id} className="rounded-[22px] border border-[#e0d1b9] bg-white p-4">
              <legend className="px-1 text-sm font-bold text-[#1f1a17]">{question.prompt}</legend>
              {question.helper ? <p className="mt-2 text-sm leading-6 text-[#756c63]">{question.helper}</p> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {question.options.map((option) => {
                  const selected = answers[question.id] === option.value;
                  return (
                    <label
                      key={option.value}
                      className={cx(
                        "cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition",
                        selected
                          ? "border-[#1f1a17] bg-[#1f1a17] text-white"
                          : "border-[#d8c6a8] bg-[#fbf8f3] text-[#4f463e] hover:border-[#b99355]",
                      )}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option.value}
                        checked={selected}
                        onChange={() => setAnswer(question.id, option.value)}
                        className="sr-only"
                        aria-label={`${question.prompt}: ${option.label}`}
                      />
                      {option.label}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      </div>
    </section>
  );
}

function LaunchPath({
  recommendedModules,
  recommendedIds,
  completedIds,
  inProgressIds,
  setInProgressIds,
  toggleComplete,
}: {
  recommendedModules: OnboardingModule[];
  recommendedIds: string[];
  completedIds: string[];
  inProgressIds: string[];
  setInProgressIds: (ids: string[]) => void;
  toggleComplete: (id: string) => void;
}) {
  const completedRecommended = recommendedIds.filter((id) => completedIds.includes(id)).length;
  const progress = recommendedIds.length ? Math.round((completedRecommended / recommendedIds.length) * 100) : 0;

  return (
    <section className="px-6 py-12 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[28px] bg-[#171311] p-6 text-white shadow-[0_24px_70px_rgba(49,39,26,0.16)] md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4c09a]">
                Your Launch Path
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
                Start with these modules first.
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72 md:text-base">
                This path updates as you answer the setup questions. You can still use every module below.
              </p>
            </div>
            <div className="min-w-48">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>{completedRecommended} of {recommendedIds.length} complete</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/12">
                <div className="h-full rounded-full bg-[#d4c09a] transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recommendedModules.map((module) => {
            const status: ModuleStatus = completedIds.includes(module.id)
              ? "Complete"
              : inProgressIds.includes(module.id)
                ? "In progress"
                : "Not started";
            return (
              <ModuleCard
                key={module.id}
                module={module}
                active={recommendedIds.includes(module.id)}
                status={status}
                onStart={() => {
                  if (!inProgressIds.includes(module.id) && !completedIds.includes(module.id)) {
                    setInProgressIds([...inProgressIds, module.id]);
                  }
                }}
                onComplete={() => toggleComplete(module.id)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function LabSelector({ selectedLab, setSelectedLab }: { selectedLab: LabId; setSelectedLab: (id: LabId) => void }) {
  const activeLab = labs.find((lab) => lab.id === selectedLab) ?? labs[0];

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Artisan lab selector">
        {labs.map((lab) => (
          <button
            key={lab.id}
            type="button"
            onClick={() => setSelectedLab(lab.id)}
            className={cx(
              "rounded-full border px-4 py-2 text-sm font-bold transition",
              selectedLab === lab.id ? "border-[#1f1a17] bg-[#1f1a17] text-white" : "border-[#d8c6a8] bg-[#fbf8f3] text-[#4f463e]",
            )}
            role="tab"
            aria-selected={selectedLab === lab.id}
          >
            {lab.shortName}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-[24px] border border-[#d8c6a8]/70 bg-[#fbf8f3] p-5">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">
              {activeLab.location}
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#1f1a17]">{activeLab.name}</h3>
            <p className="mt-3 text-sm leading-7 text-[#625b53]">{activeLab.notes}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <a href={`mailto:${activeLab.email}`} className="rounded-2xl border border-[#d8c6a8] bg-white p-4 text-sm font-semibold text-[#1f1a17] transition hover:border-[#b99355]">
                <Mail className="mb-2 h-4 w-4 text-[#8a7654]" aria-hidden="true" />
                {activeLab.email}
              </a>
              <a href={activeLab.phoneHref} className="rounded-2xl border border-[#d8c6a8] bg-white p-4 text-sm font-semibold text-[#1f1a17] transition hover:border-[#b99355]">
                <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-[#8a7654]">Phone</span>
                {activeLab.phone}
              </a>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <ResourceButton link={{ label: "Contact customer service", href: `mailto:${activeLab.email}?subject=New%20Lab%20Partner%20Onboarding` }} />
              <ResourceButton link={{ label: "Schedule onboarding help", href: `mailto:${supportContacts.onboarding.email}?subject=Schedule%20Onboarding%20Help` }} />
              <ResourceButton link={{ label: "Meet your lab page", href: activeLab.href }} />
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-[20px] bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7654]">What this lab handles</p>
              <p className="mt-3 text-sm leading-7 text-[#625b53]">{activeLab.handles}</p>
            </div>
            <div className="rounded-[20px] bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7654]">Network fit</p>
              <p className="mt-3 text-sm leading-7 text-[#625b53]">{activeLab.networkFit}</p>
            </div>
            <VideoPlaceholder title="Meet your lab" />
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderingSystemAccordion() {
  const [openId, setOpenId] = useState(orderingSystems[0]?.id ?? "");

  return (
    <div className="mt-6 space-y-3">
      {orderingSystems.map((system) => (
        <article key={system.id} className="overflow-hidden rounded-[22px] border border-[#d8c6a8]/70 bg-[#fbf8f3]">
          <button
            type="button"
            onClick={() => setOpenId(openId === system.id ? "" : system.id)}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            aria-expanded={openId === system.id}
          >
            <span className="text-lg font-semibold text-[#1f1a17]">{system.name}</span>
            <ChevronDown className={cx("h-5 w-5 transition", openId === system.id && "rotate-180")} aria-hidden="true" />
          </button>
          {openId === system.id ? <OrderingSystemPanel system={system} /> : null}
        </article>
      ))}
    </div>
  );
}

function OrderingSystemPanel({ system }: { system: OrderingSystem }) {
  const groups = [
    ["Use this system if", [system.useIf]],
    ["What the practice needs to do", system.practiceSteps],
    ["What Artisan needs to do", system.artisanSteps],
    ["What information the customer should send us", system.sendUs],
    ["Common mistakes", system.mistakes],
    ["Confirmation checklist", system.confirmation],
  ] as const;

  return (
    <div className="border-t border-[#d8c6a8]/70 px-5 pb-5 pt-2">
      <div className="grid gap-4 md:grid-cols-2">
        {groups.map(([title, items]) => (
          <div key={title} className="rounded-[18px] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7654]">{title}</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[#625b53]">
              {items.map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-[#8a7654]" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <VideoPlaceholder title={`${system.name} setup walkthrough`} />
      </div>
    </div>
  );
}

function LensPathModule({ selected, setSelected }: { selected: LensPathId; setSelected: (id: LensPathId) => void }) {
  const activeTrack = lensTracks.find((track) => track.id === selected) ?? lensTracks[0];

  return (
    <div className="mt-6">
      <fieldset>
        <legend className="text-base font-bold text-[#1f1a17]">Which lens path did your practice select?</legend>
        <p className="mt-2 text-sm leading-6 text-[#625b53]">
          This is training guidance for the path your practice already selected.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {lensTracks.map((track) => (
            <label
              key={track.id}
              className={cx(
                "cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition",
                selected === track.id ? "border-[#1f1a17] bg-[#1f1a17] text-white" : "border-[#d8c6a8] bg-[#fbf8f3] text-[#4f463e]",
              )}
            >
              <input
                type="radio"
                name="lens-training-track"
                checked={selected === track.id}
                onChange={() => setSelected(track.id)}
                className="sr-only"
                aria-label={track.title}
              />
              {track.title.replace(" Lens Solutions", "").replace("Branded ", "")}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 rounded-[24px] border border-[#d8c6a8]/70 bg-[#fbf8f3] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7654]">Highlighted track</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#1f1a17]">{activeTrack.title}</h3>
        <p className="mt-3 text-sm leading-7 text-[#625b53]">{activeTrack.summary}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {activeTrack.bullets.map((bullet) => (
            <div key={bullet} className="rounded-2xl bg-white p-4 text-sm leading-6 text-[#625b53]">
              <Check className="mb-2 h-4 w-4 text-[#8a7654]" aria-hidden="true" />
              {bullet}
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {activeTrack.links.map((link) => (
            <ResourceButton key={link.label} link={link} />
          ))}
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <VideoPlaceholder title="Understanding Your Artisan Lens Lineup" />
          <VideoPlaceholder title="Understanding IOT Lens Designs" />
          <VideoPlaceholder title="Getting Started with Unity" />
        </div>
      </div>
    </div>
  );
}

function PortalCards() {
  const steps = [
    "How to log into the portal",
    "How portal access works",
    "Where to find price lists",
    "Where to find reports/performance data",
    "Where to find downloads/resources",
    "Where to find policies",
    "How to request access for additional team members",
    "What to do if login is not working",
  ];

  return (
    <div className="mt-6">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => (
          <div key={step} className="rounded-[18px] border border-[#d8c6a8]/70 bg-[#fbf8f3] p-4">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a7654]">Step {index + 1}</span>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#1f1a17]">{step}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {portalResources.map((link) => (
          <ResourceButton key={link.label} link={link} />
        ))}
      </div>
    </div>
  );
}

function ResourceCards() {
  return (
    <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {providerResources.map((link) => (
        <div key={link.label} className="rounded-[20px] border border-[#d8c6a8]/70 bg-[#fbf8f3] p-4">
          <p className="text-base font-semibold text-[#1f1a17]">{link.label}</p>
          <p className="mt-2 text-sm leading-6 text-[#625b53]">
            {link.note ?? "Open this resource when your team needs education, positioning, policies, or support guidance."}
          </p>
          <div className="mt-4">
            <ResourceButton link={{ ...link, label: "Open resource" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function VspCallouts() {
  const prompts = [
    "Are you using us for VSP?",
    "Do you use Eyefinity?",
    "Do you take NBN or managed vision care plans?",
    "Are you in a state with provider-choice/freedom-of-choice lab protections?",
  ];

  return (
    <div className="mt-6 grid gap-3 md:grid-cols-2">
      {prompts.map((prompt) => (
        <div key={prompt} className="rounded-[18px] border border-[#d8c6a8]/70 bg-[#fbf8f3] p-4">
          <p className="text-sm font-bold text-[#1f1a17]">{prompt}</p>
          <p className="mt-2 text-sm leading-6 text-[#625b53]">
            If yes or unsure, use this module before submitting managed care or VSP orders.
          </p>
        </div>
      ))}
    </div>
  );
}

function FinalChecklist() {
  return (
    <div className="mt-6 grid gap-3 md:grid-cols-2">
      {finalChecklist.map((item) => (
        <label key={item} className="flex cursor-pointer gap-3 rounded-[18px] border border-[#d8c6a8]/70 bg-[#fbf8f3] p-4 text-sm font-semibold leading-6 text-[#1f1a17]">
          <input type="checkbox" className="mt-1 h-4 w-4 accent-[#1f1a17]" aria-label={item} />
          <span>{item}</span>
        </label>
      ))}
    </div>
  );
}

function ModuleSection({
  module,
  selectedLab,
  setSelectedLab,
  selectedLens,
  setSelectedLens,
  completed,
  toggleComplete,
}: {
  module: OnboardingModule;
  selectedLab: LabId;
  setSelectedLab: (id: LabId) => void;
  selectedLens: LensPathId;
  setSelectedLens: (id: LensPathId) => void;
  completed: boolean;
  toggleComplete: (id: string) => void;
}) {
  const Icon = module.icon;

  return (
    <section id={module.id} className="scroll-mt-24 rounded-[28px] border border-[#d8c6a8]/70 bg-white p-5 shadow-[0_18px_54px_rgba(49,39,26,0.08)] md:p-7">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#1f1a17] text-[#d4c09a]">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">
              {module.eyebrow} - {module.time}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#1f1a17] md:text-3xl">
              {module.title}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#625b53] md:text-base">{module.summary}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => toggleComplete(module.id)}
          className={cx(
            "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-sm font-bold transition",
            completed ? "bg-[#e4f2df] text-[#31551f]" : "bg-[#1f1a17] text-white hover:bg-[#d4c09a] hover:text-[#171311]",
          )}
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          {completed ? "Complete" : "Mark complete"}
        </button>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {module.bullets.map((bullet) => (
          <div key={bullet} className="rounded-[18px] bg-[#fbf8f3] p-4 text-sm leading-6 text-[#625b53]">
            <Check className="mb-2 h-4 w-4 text-[#8a7654]" aria-hidden="true" />
            {bullet}
          </div>
        ))}
      </div>

      {module.id === "lab" ? <LabSelector selectedLab={selectedLab} setSelectedLab={setSelectedLab} /> : null}
      {module.id === "ordering" ? <OrderingSystemAccordion /> : null}
      {module.id === "vsp" ? <VspCallouts /> : null}
      {module.id === "portal" ? <PortalCards /> : null}
      {module.id === "resources" ? <ResourceCards /> : null}
      {module.id === "lens" ? <LensPathModule selected={selectedLens} setSelected={setSelectedLens} /> : null}
      {module.id === "first-order" ? <FinalChecklist /> : null}

      {module.links?.length && !["portal", "resources", "lens"].includes(module.id) ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {module.links.map((link) => (
            <ResourceButton key={link.label} link={link} />
          ))}
        </div>
      ) : null}

      {module.videos?.length && !["lab", "ordering", "lens"].includes(module.id) ? (
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {module.videos.map((video) => (
            <VideoPlaceholder key={video} title={video} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default function NewLabPartnerHub() {
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [inProgressIds, setInProgressIds] = useState<string[]>([]);
  const [selectedLab, setSelectedLab] = useState<LabId>("pacific");
  const [selectedLens, setSelectedLens] = useState<LensPathId>("artisan");
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const storedAnswers = safeRead<OnboardingAnswers>(ANSWERS_KEY, {});
    const storedCompleted = safeRead<string[]>(COMPLETED_KEY, []);
    const storedLens = safeRead<LensPathId>(LENS_KEY, "artisan");

    setAnswers(storedAnswers);
    setCompletedIds(storedCompleted);
    setSelectedLab((storedAnswers.lab as LabId | undefined) ?? "pacific");
    setSelectedLens((storedAnswers.lensPath as LensPathId | undefined) ?? storedLens);
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    window.localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
  }, [answers, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;
    window.localStorage.setItem(COMPLETED_KEY, JSON.stringify(completedIds));
  }, [completedIds, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;
    window.localStorage.setItem(LENS_KEY, JSON.stringify(selectedLens));
  }, [selectedLens, hasHydrated]);

  const setAnswer = (id: keyof OnboardingAnswers, value: string) => {
    setAnswers((current) => ({ ...current, [id]: value }));
    if (id === "lab") setSelectedLab(value as LabId);
    if (id === "lensPath") setSelectedLens(value as LensPathId);
  };

  const recommendedIds = useMemo(() => {
    const ids = new Set<string>(["welcome", "lab", "account"]);

    const firstNeed = answers.firstNeed;
    if (firstNeed && firstNeedModuleMap[firstNeed]) {
      firstNeedModuleMap[firstNeed].forEach((id) => ids.add(id));
    }

    if (answers.vsp === "yes" || answers.eyefinity === "yes" || answers.vsp === "unsure" || answers.eyefinity === "unsure") {
      ids.add("vsp");
      ids.add("ordering");
    }

    if (answers.managedCare === "yes" || answers.providerChoiceState === "review") {
      ids.add("vsp");
    }

    if (answers.lensPath) {
      ids.add("lens");
      ids.add("pricing");
      if (answers.lensPath === "unity") ids.add("vsp");
      if (["artisan", "iot", "unity", "mixed"].includes(answers.lensPath)) ids.add("ar");
    }

    ids.add("portal");
    ids.add("resources");
    ids.add("shipping");
    ids.add("first-order");

    return modules.filter((module) => ids.has(module.id)).map((module) => module.id);
  }, [answers]);

  const recommendedModules = useMemo(
    () => modules.filter((module) => recommendedIds.includes(module.id)),
    [recommendedIds],
  );

  const toggleComplete = (id: string) => {
    setCompletedIds((current) =>
      current.includes(id) ? current.filter((moduleId) => moduleId !== id) : [...current, id],
    );
    setInProgressIds((current) => current.filter((moduleId) => moduleId !== id));
  };

  const resetAll = () => {
    setAnswers({});
    setCompletedIds([]);
    setInProgressIds([]);
    setSelectedLab("pacific");
    setSelectedLens("artisan");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ANSWERS_KEY);
      window.localStorage.removeItem(COMPLETED_KEY);
      window.localStorage.removeItem(LENS_KEY);
    }
  };

  const completionPercent = Math.round((completedIds.length / modules.length) * 100);

  return (
    <>
      <section data-theme="dark" className="relative isolate overflow-hidden bg-[#171311] px-6 pb-28 pt-32 text-white md:px-10 md:pt-40">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center opacity-35 md:bg-fixed"
          style={{ backgroundImage: "url('/graphics/rings2.jpg')" }}
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(18,14,12,0.97),rgba(18,14,12,0.82)_56%,rgba(18,14,12,0.55))]" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.72fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d4c09a]">
              New Lab Partner Onboarding
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
              Start Strong with Artisan Lab Network
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/76 md:text-2xl md:leading-10">
              Everything your practice needs to open your account, connect your ordering system, choose your lab, understand your products, use the portal, find pricing and reports, and start ordering with confidence.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#path-builder"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#d4c09a] px-7 py-3 text-sm font-semibold text-[#171311] shadow-[0_18px_50px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-[#e2cca2]"
              >
                Build My Onboarding Path
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={`mailto:${supportContacts.onboarding.email}?subject=Schedule%20New%20Lab%20Partner%20Help`}
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/18 bg-white/10 px-7 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/15"
              >
                Schedule Help
                <Mail className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="rounded-[28px] border border-white/12 bg-white/[0.06] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d4c09a]">V1 launch center</p>
                <p className="mt-2 text-3xl font-semibold">{completionPercent}%</p>
              </div>
              <Clock className="h-9 w-9 text-[#d4c09a]" aria-hidden="true" />
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/12">
              <div className="h-full rounded-full bg-[#d4c09a]" style={{ width: `${completionPercent}%` }} />
            </div>
            <div className="mt-6 grid gap-3">
              {[
                "Lab and account setup",
                "Ordering, VSP, and managed care",
                "Portal pricing and reports",
                "Lens, AR, sun, systems, shipping, and launch checklist",
              ].map((item) => (
                <div key={item} className="rounded-2xl bg-white/8 p-4 text-sm font-semibold text-white/82">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PathBuilder answers={answers} setAnswer={setAnswer} onRestart={() => setAnswers({})} />

      <LaunchPath
        recommendedModules={recommendedModules}
        recommendedIds={recommendedIds}
        completedIds={completedIds}
        inProgressIds={inProgressIds}
        setInProgressIds={setInProgressIds}
        toggleComplete={toggleComplete}
      />

      <section className="px-6 pb-20 md:px-10 md:pb-24">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
          <ProgressNav recommendedIds={recommendedIds} completedIds={completedIds} />
          <div className="min-w-0 space-y-5">
            <MobileProgressMenu recommendedIds={recommendedIds} completedIds={completedIds} />
            <div className="rounded-[24px] border border-[#d8c6a8]/70 bg-[#fbf8f3] p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">All modules</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f1a17]">
                    Stay anchored on this page.
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-7 text-[#625b53]">
                    Open resource buttons are available when a portal or public page is useful, but the training path stays here.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetAll}
                  className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-[#1f1a17] px-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#d4c09a] hover:text-[#171311]"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset onboarding progress
                </button>
              </div>
            </div>

            {modules.map((module) => (
              <ModuleSection
                key={module.id}
                module={module}
                selectedLab={selectedLab}
                setSelectedLab={(id) => {
                  setSelectedLab(id);
                  setAnswers((current) => ({ ...current, lab: id }));
                }}
                selectedLens={selectedLens}
                setSelectedLens={(id) => {
                  setSelectedLens(id);
                  setAnswers((current) => ({ ...current, lensPath: id }));
                }}
                completed={completedIds.includes(module.id)}
                toggleComplete={toggleComplete}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#171311] px-6 py-16 text-white md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d4c09a]">Ready for launch</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">Submit your first order with confidence.</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70 md:text-base">
              Confirm the checklist, ask us to review anything unclear, and use your connected ordering platform when your setup is complete.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="#ordering" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d4c09a] px-6 text-sm font-semibold text-[#171311] transition hover:-translate-y-0.5 hover:bg-[#e2cca2]">
              Submit Your First Order
            </a>
            <a href={`mailto:${supportContacts.onboarding.email}?subject=Final%20Launch%20Help`} className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/18 bg-white/10 px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/15">
              Schedule Final Launch Help
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
