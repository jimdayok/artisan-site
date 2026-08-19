"use client";

import { ArrowLeft, ArrowRight, CircleHelp, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type TourStep = {
  target: string;
  eyebrow: string;
  title: string;
  body: string;
};

type HighlightRect = {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

const TOUR_VERSION = "portal-intelligence-v2";

const tourSteps: TourStep[] = [
  {
    target: "navigation",
    eyebrow: "Your portal home base",
    title: "Everything starts here",
    body: "Your dashboard, resources, newsletters, account tools, and secure sign-out are always within reach. What appears here is based on your account and permissions.",
  },
  {
    target: "overview",
    eyebrow: "Practice Intelligence Center",
    title: "See the health of your partnership at a glance",
    body: "This opening view brings together purchases, order volume, orders per day, benefits usage, assigned pricing, lab relationship, and data freshness for your practice.",
  },
  {
    target: "trends",
    eyebrow: "Momentum and planning",
    title: "Understand what is changing—not just what happened",
    body: "Monthly trends, projected activity, and payer mix turn routine lab activity into a clearer picture of practice momentum and near-term opportunity.",
  },
  {
    target: "opportunities",
    eyebrow: "Actionable intelligence",
    title: "Turn account data into practical next steps",
    body: "Growth signals call attention to opportunities in order volume, multiple pairs, remakes, frame packages, specialty products, and other areas worth discussing with your Artisan lab team.",
  },
  {
    target: "products",
    eyebrow: "Product and program mix",
    title: "See how your practice is using key products",
    body: "Brand, material, specialty, and program views help your team identify training opportunities and compare recent usage without sorting through spreadsheets.",
  },
  {
    target: "service",
    eyebrow: "Service excellence",
    title: "Keep quality and turnaround visible",
    body: "Remake, warranty, non-adapt, volume, and turnaround signals make service conversations more specific and help protect staff time and patient confidence.",
  },
  {
    target: "rewards-programs",
    eyebrow: "Partnership value",
    title: "Follow programs, packages, and earned benefits",
    body: "Enrolled rewards, qualification progress, and program participation are brought together so your team can see the value available through the Artisan relationship.",
  },
  {
    target: "engagement",
    eyebrow: "Practice engagement",
    title: "Keep important forms and invitations together",
    body: "Customer profile tools and eligible program invitations give the practice a dependable place to complete updates and act on new opportunities.",
  },
  {
    target: "resources",
    eyebrow: "Secure tools and pricing",
    title: "Your assigned resources live in one place",
    body: "The real portal displays only the price sheets and tools assigned to the signed-in customer. This demonstration preserves the complete section while intentionally withholding every actual price.",
  },
  {
    target: "account-support",
    eyebrow: "Account confidence",
    title: "Confirm details, users, and support paths",
    body: "Review the practice profile, authorized portal users, service details, and correction links so the right people have the right information when they need help.",
  },
];

function getTarget(step: TourStep) {
  return document.querySelector<HTMLElement>(`[data-portal-tour="${step.target}"]`);
}

export default function PortalGuidedTour({ demo = false }: { demo?: boolean }) {
  const [availableSteps, setAvailableSteps] = useState<TourStep[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [rect, setRect] = useState<HighlightRect | null>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  const activeStep = activeIndex === null ? null : availableSteps[activeIndex];

  const updateRect = useCallback(() => {
    if (!activeStep) return;
    const target = getTarget(activeStep);
    if (!target) return;
    const bounds = target.getBoundingClientRect();
    const padding = 8;
    setRect({
      top: Math.max(8, bounds.top - padding),
      left: Math.max(8, bounds.left - padding),
      right: Math.min(window.innerWidth - 8, bounds.right + padding),
      bottom: Math.min(window.innerHeight - 8, bounds.bottom + padding),
      width: Math.min(window.innerWidth - 16, bounds.width + padding * 2),
      height: Math.min(window.innerHeight - 16, bounds.height + padding * 2),
    });
  }, [activeStep]);

  const startTour = useCallback(() => {
    const visible = tourSteps.filter((step) => Boolean(getTarget(step)));
    setAvailableSteps(visible);
    setActiveIndex(visible.length ? 0 : null);
  }, []);

  const finishTour = useCallback(() => {
    setActiveIndex(null);
    setRect(null);
    if (!demo) window.localStorage.setItem(TOUR_VERSION, "complete");
  }, [demo]);

  const next = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null || current >= availableSteps.length - 1) {
        if (!demo) window.localStorage.setItem(TOUR_VERSION, "complete");
        return null;
      }
      return current + 1;
    });
  }, [availableSteps.length, demo]);

  const previous = useCallback(() => {
    setActiveIndex((current) => (current === null ? null : Math.max(0, current - 1)));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (demo || window.localStorage.getItem(TOUR_VERSION) !== "complete") startTour();
    }, 650);
    return () => window.clearTimeout(timer);
  }, [demo, startTour]);

  useEffect(() => {
    if (!activeStep) return;
    getTarget(activeStep)?.scrollIntoView({ behavior: "smooth", block: "center" });
    const timer = window.setTimeout(updateRect, 420);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, { capture: true, passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [activeStep, updateRect]);

  useEffect(() => {
    if (!activeStep) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") finishTour();
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") previous();
    };
    window.addEventListener("keydown", onKeyDown);
    const timer = window.setTimeout(() => nextButtonRef.current?.focus(), 480);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeStep, finishTour, next, previous]);

  const cardPosition = useMemo(() => {
    if (!rect) return null;
    const width = Math.min(430, window.innerWidth - 28);
    const estimatedHeight = 300;
    const placeBelow = window.innerHeight - rect.bottom >= estimatedHeight || rect.top < estimatedHeight;
    return {
      width,
      top: placeBelow
        ? Math.min(window.innerHeight - estimatedHeight - 12, rect.bottom + 22)
        : Math.max(12, rect.top - estimatedHeight - 22),
      left: Math.max(14, Math.min(window.innerWidth - width - 14, rect.left + rect.width / 2 - width / 2)),
      placeBelow,
    };
  }, [rect]);

  return (
    <>
      {demo ? (
        <div className="fixed inset-x-0 top-0 z-40 bg-[#d8c49b] px-4 py-2 text-center text-xs font-bold text-[#172a28] shadow-sm">
          Interactive demonstration · Every practice name, user, location, and number on this page is fictional
        </div>
      ) : null}
      <button
        type="button"
        onClick={startTour}
        className="fixed bottom-5 right-5 z-30 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#172a28] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(23,42,40,0.28)] transition hover:bg-[#315f60] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b89a61]"
      >
        <CircleHelp className="h-4 w-4" />
        Tour this portal
      </button>
      {activeStep && rect && cardPosition ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Guided customer portal tour">
          <div className="fixed z-[51] bg-[#07101c]/75 backdrop-blur-[1px]" style={{ inset: `0 0 auto 0`, height: rect.top }} />
          <div className="fixed z-[51] bg-[#07101c]/75 backdrop-blur-[1px]" style={{ top: rect.top, left: 0, width: rect.left, height: rect.height }} />
          <div className="fixed z-[51] bg-[#07101c]/75 backdrop-blur-[1px]" style={{ top: rect.top, left: rect.right, right: 0, height: rect.height }} />
          <div className="fixed z-[51] bg-[#07101c]/75 backdrop-blur-[1px]" style={{ top: rect.bottom, left: 0, right: 0, bottom: 0 }} />
          <div
            className="pointer-events-none fixed z-[52] box-border rounded-lg border-[3px] border-[#f2d88f] shadow-[0_0_0_4px_rgba(242,216,143,0.24),0_18px_45px_rgba(0,0,0,0.3)]"
            style={rect}
          />
          <div
            className="fixed z-[60] rounded-lg bg-white p-6 text-[#172a28] shadow-[0_24px_80px_rgba(0,0,0,0.38)]"
            style={{ width: cardPosition.width, top: cardPosition.top, left: cardPosition.left }}
          >
            <span
              aria-hidden="true"
              className={`absolute left-1/2 h-0 w-0 -translate-x-1/2 border-x-[12px] border-x-transparent ${cardPosition.placeBelow ? "-top-3 border-b-[12px] border-b-white" : "-bottom-3 border-t-[12px] border-t-white"}`}
            />
            <button type="button" onClick={finishTour} aria-label="Exit guided tour" className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-[#f1eee8] text-[#59635f] transition hover:bg-[#e4ddd1]">
              <X className="h-4 w-4" />
            </button>
            <p className="pr-10 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8b7650]">{activeStep.eyebrow}</p>
            <h2 className="mt-2 pr-8 text-2xl font-semibold tracking-[-0.03em]">{activeStep.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[#646b67]">{activeStep.body}</p>
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#e8dfd0] pt-4">
              <span className="text-xs font-semibold text-[#7d817e]">{(activeIndex ?? 0) + 1} of {availableSteps.length}</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={finishTour} className="px-3 py-2 text-sm font-semibold text-[#59635f]">Exit</button>
                {activeIndex ? (
                  <button type="button" onClick={previous} aria-label="Previous explanation" className="grid h-10 w-10 place-items-center rounded-full border border-[#d8c49b] text-[#172a28]">
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                ) : null}
                <button ref={nextButtonRef} type="button" onClick={next} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#172a28] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#315f60]">
                  {activeIndex === availableSteps.length - 1 ? "Explore portal" : "Next"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
