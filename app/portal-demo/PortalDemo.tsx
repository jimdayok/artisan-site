"use client";

import Image from "next/image";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Download,
  FileText,
  Gauge,
  Gift,
  HelpCircle,
  Home,
  MapPin,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./portal-demo.module.css";

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

const tourSteps: TourStep[] = [
  {
    target: "account",
    eyebrow: "Your portal, at a glance",
    title: "A personalized home base",
    body: "Customers see their practice, assigned lab, account details, and reporting period as soon as they sign in.",
  },
  {
    target: "summary",
    eyebrow: "Operational snapshot",
    title: "The numbers that matter most",
    body: "Key activity, turnaround, quality, and rewards indicators are summarized in one quick, easy-to-read view.",
  },
  {
    target: "performance",
    eyebrow: "Practice intelligence",
    title: "Spot trends without a spreadsheet",
    body: "Monthly activity and year-over-year comparisons help customers understand momentum and plan with confidence.",
  },
  {
    target: "quality",
    eyebrow: "Service visibility",
    title: "See quality and service performance",
    body: "Customers can follow remake trends and turnaround performance, making conversations with their lab more productive.",
  },
  {
    target: "rewards",
    eyebrow: "Partnership value",
    title: "Make loyalty benefits visible",
    body: "Program progress and benefits are easy to find, so customers can see the added value of consolidating with Artisan labs.",
  },
  {
    target: "resources",
    eyebrow: "Useful tools",
    title: "Resources stay close at hand",
    body: "Policies, forms, educational materials, and support links live in one dependable place for the whole practice.",
  },
  {
    target: "pricing",
    eyebrow: "Secure by design",
    title: "Pricing stays private",
    body: "The real portal shows each customer only their assigned pricing after secure sign-in. This public demo never loads or exposes it.",
  },
];

const activity = [
  { month: "Mar", jobs: 132, prior: 118 },
  { month: "Apr", jobs: 149, prior: 126 },
  { month: "May", jobs: 158, prior: 141 },
  { month: "Jun", jobs: 172, prior: 146 },
  { month: "Jul", jobs: 185, prior: 159 },
  { month: "Aug", jobs: 196, prior: 168 },
];

const recentOrders = [
  { id: "DEMO-4821", type: "Progressive", status: "Shipped", date: "Aug 18" },
  { id: "DEMO-4814", type: "Single vision", status: "In production", date: "Aug 17" },
  { id: "DEMO-4807", type: "Office lens", status: "Quality check", date: "Aug 16" },
];

function useTourPosition(activeStep: number | null) {
  const [rect, setRect] = useState<HighlightRect | null>(null);

  const update = useCallback(() => {
    if (activeStep === null) return;
    const target = document.querySelector<HTMLElement>(
      `[data-tour-key="${tourSteps[activeStep].target}"]`
    );
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

  useEffect(() => {
    if (activeStep === null) return;
    const target = document.querySelector<HTMLElement>(
      `[data-tour-key="${tourSteps[activeStep].target}"]`
    );
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
    const timer = window.setTimeout(update, 380);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [activeStep, update]);

  return rect;
}

function GuidedTour({
  activeStep,
  onNext,
  onExit,
}: {
  activeStep: number | null;
  onNext: () => void;
  onExit: () => void;
}) {
  const rect = useTourPosition(activeStep);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeStep === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onExit();
      if (event.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKeyDown);
    const timer = window.setTimeout(() => nextButtonRef.current?.focus(), 450);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeStep, onExit, onNext]);

  if (activeStep === null || !rect) return null;

  const step = tourSteps[activeStep];
  const tooltipWidth = Math.min(380, window.innerWidth - 32);
  const roomBelow = window.innerHeight - rect.bottom;
  const roomAbove = rect.top;
  const placeBelow = roomBelow >= 260 || roomBelow >= roomAbove;
  const tooltipTop = placeBelow
    ? Math.min(window.innerHeight - 246, rect.bottom + 22)
    : Math.max(16, rect.top - 246);
  const tooltipLeft = Math.max(
    16,
    Math.min(window.innerWidth - tooltipWidth - 16, rect.left + rect.width / 2 - tooltipWidth / 2)
  );

  return (
    <div className={styles.tour} role="dialog" aria-modal="true" aria-label="Guided portal tour">
      <div className={styles.shade} style={{ top: 0, left: 0, right: 0, height: rect.top }} />
      <div className={styles.shade} style={{ top: rect.top, left: 0, width: rect.left, height: rect.height }} />
      <div className={styles.shade} style={{ top: rect.top, left: rect.right, right: 0, height: rect.height }} />
      <div className={styles.shade} style={{ top: rect.bottom, left: 0, right: 0, bottom: 0 }} />
      <div className={styles.focusRing} style={rect} aria-hidden="true" />
      <div
        className={`${styles.tourCard} ${placeBelow ? styles.arrowUp : styles.arrowDown}`}
        style={{ top: tooltipTop, left: tooltipLeft, width: tooltipWidth }}
      >
        <button className={styles.exitTour} type="button" onClick={onExit} aria-label="Exit guided tour">
          <X size={18} />
        </button>
        <p className={styles.tourEyebrow}>{step.eyebrow}</p>
        <h2>{step.title}</h2>
        <p>{step.body}</p>
        <div className={styles.tourFooter}>
          <span>{activeStep + 1} of {tourSteps.length}</span>
          <div className={styles.tourActions}>
            <button type="button" className={styles.textButton} onClick={onExit}>Exit</button>
            <button ref={nextButtonRef} type="button" className={styles.nextButton} onClick={onNext}>
              {activeStep === tourSteps.length - 1 ? "Explore portal" : "Next"}
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PortalDemo() {
  const [activeStep, setActiveStep] = useState<number | null>(0);
  const [pricingOpen, setPricingOpen] = useState(false);

  const finishTour = useCallback(() => setActiveStep(null), []);
  const nextStep = useCallback(() => {
    setActiveStep((step) => {
      if (step === null || step >= tourSteps.length - 1) return null;
      return step + 1;
    });
  }, []);

  const maxJobs = useMemo(() => Math.max(...activity.flatMap((item) => [item.jobs, item.prior])), []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className={styles.portal}>
      <div className={styles.demoNotice}>
        <Sparkles size={15} />
        Interactive demo · All practice names, account details, and numbers are fictional
      </div>

      <header className={styles.header}>
        <button className={styles.brand} type="button" onClick={() => scrollTo("overview")}>
          <Image src="/aln_4c_logo.png" alt="Artisan Lab Network" width={154} height={102} priority />
          <span>Customer Portal</span>
        </button>
        <nav className={styles.nav} aria-label="Demo portal navigation">
          <button type="button" onClick={() => scrollTo("overview")}><Home size={17} />Overview</button>
          <button type="button" onClick={() => scrollTo("performance")}><BarChart3 size={17} />Performance</button>
          <button type="button" onClick={() => scrollTo("rewards")}><Gift size={17} />Rewards</button>
          <button type="button" onClick={() => scrollTo("resources")}><BookOpen size={17} />Resources</button>
          <button data-tour-key="pricing" type="button" onClick={() => setPricingOpen(true)}><CircleDollarSign size={17} />Pricing</button>
        </nav>
        <button className={styles.tourButton} type="button" onClick={() => setActiveStep(0)}>
          <HelpCircle size={18} /> Take the tour
        </button>
      </header>

      <section id="overview" className={styles.content}>
        <div className={styles.accountHero} data-tour-key="account">
          <div>
            <p className={styles.eyebrow}>Welcome back, Dr. Morgan</p>
            <h1>Lakeshore Demo Eye Care</h1>
            <p className={styles.location}><MapPin size={17} /> 1042 Artisan Way · Madison, WI 53703</p>
          </div>
          <div className={styles.accountMeta}>
            <div><span>Demo account</span><strong>DEMO-1042</strong></div>
            <div><span>Primary lab</span><strong>Sample Artisan Lab</strong></div>
            <div><span>Reporting through</span><strong>August 2026</strong></div>
          </div>
        </div>

        <div className={styles.metricGrid} data-tour-key="summary">
          <article className={styles.metricCard}>
            <span className={styles.iconBubble}><PackageCheck size={21} /></span>
            <div><p>Jobs year to date</p><strong>1,284</strong><span className={styles.positive}><TrendingUp size={14} /> 12.6% vs last year</span></div>
          </article>
          <article className={styles.metricCard}>
            <span className={styles.iconBubble}><Clock3 size={21} /></span>
            <div><p>Average turnaround</p><strong>2.6 days</strong><span className={styles.positive}><TrendingDown size={14} /> 0.4 days faster</span></div>
          </article>
          <article className={styles.metricCard}>
            <span className={styles.iconBubble}><ShieldCheck size={21} /></span>
            <div><p>Quality success rate</p><strong>98.2%</strong><span className={styles.positive}><TrendingUp size={14} /> 0.7 points</span></div>
          </article>
          <article className={styles.metricCard}>
            <span className={styles.iconBubble}><Trophy size={21} /></span>
            <div><p>Rewards progress</p><strong>3,760 pts</strong><span>Gold tier · 78% complete</span></div>
          </article>
        </div>

        <div className={styles.twoColumn}>
          <article id="performance" className={`${styles.panel} ${styles.performancePanel}`} data-tour-key="performance">
            <div className={styles.panelHeader}>
              <div><p className={styles.eyebrow}>Practice intelligence</p><h2>Monthly activity</h2></div>
              <div className={styles.legend}><span><i className={styles.currentDot} />2026</span><span><i className={styles.priorDot} />2025</span></div>
            </div>
            <div className={styles.chart} aria-label="Fictional monthly job volume chart">
              {activity.map((item) => (
                <div className={styles.barGroup} key={item.month}>
                  <div className={styles.bars}>
                    <span className={styles.priorBar} style={{ height: `${(item.prior / maxJobs) * 100}%` }} />
                    <span className={styles.currentBar} style={{ height: `${(item.jobs / maxJobs) * 100}%` }} />
                  </div>
                  <span>{item.month}</span>
                </div>
              ))}
            </div>
            <div className={styles.insight}><TrendingUp size={18} /><p><strong>Momentum is building.</strong> Fictional job volume is up 16.7% across the latest three months.</p></div>
          </article>

          <article className={styles.panel} data-tour-key="quality">
            <div className={styles.panelHeader}>
              <div><p className={styles.eyebrow}>Service excellence</p><h2>Quality & turnaround</h2></div>
              <Gauge size={24} />
            </div>
            <div className={styles.gaugeWrap}>
              <div className={styles.gauge}><div><strong>98.2%</strong><span>quality success</span></div></div>
              <div className={styles.qualityStats}>
                <div><span>First-time success</span><strong>98.2%</strong></div>
                <div><span>Average turnaround</span><strong>2.6 days</strong></div>
                <div><span>Rush jobs on time</span><strong>96.4%</strong></div>
              </div>
            </div>
            <p className={styles.panelNote}>Performance shown here is fictional and is provided only to demonstrate the portal experience.</p>
          </article>
        </div>

        <div className={`${styles.twoColumn} ${styles.balancedColumns}`}>
          <article id="rewards" className={`${styles.panel} ${styles.rewardsPanel}`} data-tour-key="rewards">
            <div className={styles.panelHeader}>
              <div><p className={styles.eyebrow}>Artisan rewards</p><h2>Your partnership progress</h2></div>
              <span className={styles.goldBadge}><Trophy size={16} /> Gold</span>
            </div>
            <p>Keep consolidating eligible work with your Artisan lab to unlock additional program benefits.</p>
            <div className={styles.progressLabels}><strong>3,760 points</strong><span>4,800-point next tier</span></div>
            <div className={styles.progressTrack}><span /></div>
            <div className={styles.rewardBenefits}>
              <span><Check size={15} /> Priority education access</span>
              <span><Check size={15} /> Practice-building resources</span>
              <span><Check size={15} /> Dedicated lab partnership</span>
            </div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <div><p className={styles.eyebrow}>Recent activity</p><h2>Orders at a glance</h2></div>
              <button className={styles.smallLink} type="button">View all <ChevronRight size={16} /></button>
            </div>
            <div className={styles.orderList}>
              {recentOrders.map((order) => (
                <div key={order.id}>
                  <span className={styles.orderIcon}><PackageCheck size={18} /></span>
                  <div><strong>{order.id}</strong><span>{order.type}</span></div>
                  <div><strong>{order.status}</strong><span>{order.date}</span></div>
                </div>
              ))}
            </div>
          </article>
        </div>

        <article id="resources" className={`${styles.panel} ${styles.resourcesPanel}`} data-tour-key="resources">
          <div className={styles.panelHeader}>
            <div><p className={styles.eyebrow}>Practice resources</p><h2>Everything your team needs</h2></div>
            <button className={styles.smallLink} type="button">Browse library <ChevronRight size={16} /></button>
          </div>
          <div className={styles.resourceGrid}>
            <button type="button"><span><FileText size={22} /></span><div><strong>Lab policies</strong><small>Shipping, warranties, and service guidance</small></div><Download size={18} /></button>
            <button type="button"><span><BookOpen size={22} /></span><div><strong>Product education</strong><small>Materials for your optical team</small></div><ChevronRight size={18} /></button>
            <button type="button"><span><Sparkles size={22} /></span><div><strong>Patient resources</strong><small>Tools that support patient conversations</small></div><ChevronRight size={18} /></button>
          </div>
        </article>

        <footer className={styles.footer}>
          <Image src="/aln_4c_logo.png" alt="Artisan Lab Network" width={132} height={87} />
          <p>Fictional portal demonstration · No customer information or confidential pricing is used.</p>
          <button type="button" onClick={() => setActiveStep(0)}><RotateCcw size={15} /> Restart tour</button>
        </footer>
      </section>

      {pricingOpen ? (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setPricingOpen(false)}>
          <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="pricing-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className={styles.modalClose} type="button" onClick={() => setPricingOpen(false)} aria-label="Close pricing message"><X size={20} /></button>
            <span className={styles.modalIcon}><ShieldCheck size={30} /></span>
            <p className={styles.eyebrow}>Protected customer information</p>
            <h2 id="pricing-title">Your customer-specific pricing will be shown here.</h2>
            <p>In the live portal, customers securely see only the price lists assigned to their account. Pricing is intentionally hidden in this public demonstration.</p>
            <div className={styles.privacyNote}><ShieldCheck size={17} /><span>No real pricing or customer data is loaded on this page.</span></div>
            <button className={styles.modalButton} type="button" onClick={() => setPricingOpen(false)}>Return to demo</button>
          </div>
        </div>
      ) : null}

      <GuidedTour activeStep={activeStep} onNext={nextStep} onExit={finishTour} />
    </main>
  );
}
