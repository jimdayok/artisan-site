"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type TimelineAsset = {
  src: string;
  alt: string;
  kind: "logo" | "photo";
  className?: string;
};

type TimelineMilestone = {
  year: string;
  title: string;
  label: string;
  body: string;
  quote: string;
  photo: TimelineAsset;
  logos: TimelineAsset[];
  href?: string;
  meetHref?: string;
};

const timelineMilestones: TimelineMilestone[] = [
  {
    year: "2018",
    title: "Pacific Artisan Labs",
    label: "The independent lab movement begins.",
    body: "Foundation of the Artisan model and independent lab vision.",
    quote: "A stronger model starts where craft, ownership, and service meet.",
    photo: {
      src: "/images/lab-machine-2024-1.jpg",
      alt: "Pacific Artisan Labs optical production equipment",
      kind: "photo",
    },
    logos: [{ src: "/logos/PAL_2CTan.png", alt: "Pacific Artisan Labs", kind: "logo" }],
    href: "/pacific-artisan-labs",
    meetHref: "/meet-the-artisans#pacific",
  },
  {
    year: "2019",
    title: "IOT Launch",
    label: "Technology alignment begins.",
    body: "Artisan begins partnership with IOT and launches Artisan lens technologies.",
    quote: "Independent practices need technology that helps them compete without giving up control.",
    photo: {
      src: "/images/glasses-lens-design-2024-1.jpg",
      alt: "Lens design technology and eyewear",
      kind: "photo",
    },
    logos: [{ src: "/iot-logo.png", alt: "IOT", kind: "logo" }],
  },
  {
    year: "2023",
    title: "Peak Artisan Labs",
    label: "Expansion into Colorado.",
    body: "Expansion into Colorado strengthens the Artisan model across another regional lab relationship.",
    quote: "Regional labs can grow together without losing the local relationships that make them matter.",
    photo: {
      src: "/images/peak_employees-optimized.jpg",
      alt: "Peak Artisan Labs team",
      kind: "photo",
    },
    logos: [
      {
        src: "/logos/Peak_Artisan_Logo 9-1-23_FINAL.png",
        alt: "Peak Artisan Labs",
        kind: "logo",
      },
    ],
    href: "/peak-artisan-labs",
    meetHref: "/meet-the-artisans#peak",
  },
  {
    year: "2025",
    title: "Pike Artisan Labs",
    label: "National growth continues.",
    body: "Expansion into Indianapolis adds another Artisan lab serving independent practices.",
    quote: "Every new lab relationship expands what independent eye care can own, build, and lead.",
    photo: {
      src: "/images/team-at-lab-2025-1.jpg",
      alt: "Pike Artisan Labs opening team",
      kind: "photo",
      className: "object-[50%_34%]",
    },
    logos: [{ src: "/logos/Pike_Labs_Logo-4C.png", alt: "Pike Artisan Labs", kind: "logo" }],
    href: "/pike-artisan-labs",
    meetHref: "/meet-the-artisans#pike",
  },
];

function SafeAsset({
  asset,
  priority = false,
}: {
  asset: TimelineAsset;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const fallback = asset.alt
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

  if (failed) {
    return (
      <div className="grid h-full w-full place-items-center bg-[#201915] text-sm font-black uppercase tracking-[0.24em] text-[#d8bf7a]">
        {fallback || "ALN"}
      </div>
    );
  }

  return (
    <Image
      src={asset.src}
      alt={asset.alt}
      fill
      priority={priority}
      sizes={
        asset.kind === "photo"
          ? "(min-width: 1024px) 50vw, 100vw"
          : "(min-width: 1024px) 260px, 70vw"
      }
      onError={() => setFailed(true)}
      className={[
        asset.kind === "photo" ? "object-cover" : "object-contain p-5",
        asset.className ?? "",
      ].join(" ")}
    />
  );
}

function TimelinePanel({
  milestone,
  index,
  total,
}: {
  milestone: TimelineMilestone;
  index: number;
  total: number;
}) {
  return (
    <article
      className="timeline-panel relative flex min-h-[100svh] w-full shrink-0 flex-col justify-center overflow-visible border-b border-[#d8bf7a]/16 px-5 py-20 md:w-screen md:overflow-hidden md:border-b-0 md:border-r md:px-10 lg:px-14"
      data-panel-index={index}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_30%,rgba(216,191,122,0.16),transparent_30%),linear-gradient(90deg,rgba(255,247,232,0.035),transparent_35%)]" />
      <div className="pointer-events-none absolute right-4 top-10 text-[8rem] font-black leading-none tracking-normal text-[#fff7e8]/[0.035] md:right-10 md:text-[16rem] lg:text-[21rem]">
        {milestone.year}
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-12">
        <div className="timeline-copy max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#d8bf7a]">
            {index === 0 ? "Timeline" : `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`}
          </p>
          {index === 0 ? (
            <h2 className="mt-5 text-4xl font-semibold leading-[0.98] tracking-normal text-[#fff7e8] md:text-5xl lg:text-6xl">
              Built With Intention. Proven Through Growth.
            </h2>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {milestone.logos.map((logo) => (
              <div
                key={logo.src}
                className="relative h-20 w-56 overflow-hidden rounded-lg border border-[#d8bf7a]/28 bg-[#fff8ec] shadow-[0_28px_80px_rgba(0,0,0,0.28)] md:h-24 md:w-72"
              >
                <SafeAsset asset={logo} priority={index === 0} />
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.24em] text-[#f1ddb5]/80">
            {milestone.year}
          </p>
          <h3 className="mt-3 text-4xl font-semibold leading-[0.98] tracking-normal text-[#fff7e8] md:text-6xl lg:text-7xl">
            {milestone.title}
          </h3>
          <p className="mt-6 text-xl font-semibold leading-8 text-[#e4c887] md:text-2xl">
            {milestone.label}
          </p>
          <p className="mt-5 max-w-lg text-base leading-8 text-[#fff7e8]/72 md:text-lg">
            {milestone.body}
          </p>
          <p className="mt-8 border-l border-[#d8bf7a]/40 pl-5 text-lg leading-8 text-[#fff7e8]/84">
            {milestone.quote}
          </p>
          {milestone.href ? (
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={milestone.href}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#d8bf7a] px-5 text-sm font-bold text-[#17120f] transition hover:-translate-y-0.5 hover:bg-[#f1ddb5]"
              >
                Visit Lab Website
              </Link>
              <Link
                href={milestone.meetHref ?? milestone.href}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d8bf7a]/38 px-5 text-sm font-bold text-[#fff7e8] transition hover:-translate-y-0.5 hover:border-[#f1ddb5] hover:bg-white/8"
              >
                Meet Your Lab
              </Link>
            </div>
          ) : null}
        </div>

        <div className="timeline-image-wrap relative min-h-[360px] overflow-hidden rounded-lg border border-[#d8bf7a]/24 bg-[#18120f] shadow-[0_36px_110px_rgba(0,0,0,0.46)] md:min-h-[66vh]">
          <SafeAsset asset={milestone.photo} priority={index === 0} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/68 via-transparent to-black/10" />
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-5">
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-white/68">
              Artisan Lab Network
            </span>
            <span className="text-6xl font-black leading-none text-[#fff7e8]/24 md:text-8xl">
              {milestone.year}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ImmersiveTimeline({
  disableDesktopScrollEffects = false,
}: {
  disableDesktopScrollEffects?: boolean;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const progress = progressRef.current;

    if (!section || !track || !progress) return;
    if (prefersReducedMotion || disableDesktopScrollEffects) {
      progress.style.transform = "scaleX(0)";
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add("(min-width: 768px)", () => {
        const panels = gsap.utils.toArray<HTMLElement>(".timeline-panel");
        const distance = () => track.scrollWidth - window.innerWidth;

        const horizontalTween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance() + window.innerHeight * 1.15}`,
            pin: true,
            scrub: 1.05,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              progress.style.transform = `scaleX(${self.progress})`;
            },
          },
        });

        panels.forEach((panel) => {
          const copy = panel.querySelector(".timeline-copy");
          const image = panel.querySelector(".timeline-image-wrap");

          gsap.fromTo(
            copy,
            { autoAlpha: 0, y: 36 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: panel,
                containerAnimation: horizontalTween,
                start: "left 72%",
                end: "left 38%",
                scrub: true,
              },
            },
          );

          gsap.fromTo(
            image,
            { autoAlpha: 0.72, scale: 0.94, xPercent: 7 },
            {
              autoAlpha: 1,
              scale: 1,
              xPercent: -3,
              ease: "none",
              scrollTrigger: {
                trigger: panel,
                containerAnimation: horizontalTween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          );
        });

        return () => {
          progress.style.transform = "scaleX(0)";
        };
      });
    }, section);

    return () => {
      media.revert();
      context.revert();
    };
  }, [disableDesktopScrollEffects, prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="timeline"
      data-theme="dark"
      className="relative scroll-mt-24 overflow-visible bg-[#0d0a08] text-[#fff7e8] md:h-screen md:overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(216,191,122,0.15),transparent_28%),linear-gradient(180deg,#0d0a08,#17120f_48%,#0d0a08)]" />

      <div className="pointer-events-none absolute inset-x-6 bottom-7 z-30 hidden items-center gap-4 md:flex lg:inset-x-14">
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8bf7a]/80">
          Scroll
        </span>
        <div className="h-px flex-1 bg-[#d8bf7a]/22">
          <div
            ref={progressRef}
            className="h-px origin-left scale-x-0 bg-[#d8bf7a] shadow-[0_0_22px_rgba(216,191,122,0.75)]"
          />
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8bf7a]/80">
          2018 - 2025
        </span>
      </div>

      <div
        ref={trackRef}
        className="relative z-10 flex flex-col overflow-visible md:flex-row md:[will-change:transform]"
      >
        {timelineMilestones.map((milestone, index) => (
          <TimelinePanel
            key={`${milestone.year}-${milestone.title}`}
            milestone={milestone}
            index={index}
            total={timelineMilestones.length}
          />
        ))}
      </div>
    </section>
  );
}
