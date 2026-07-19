import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import NewsletterShell from "../components/newsletter/NewsletterShell";

export const metadata: Metadata = {
  title: "Practice Matters Newsletter | Artisan Lab Network",
  description:
    "Practice Matters is Artisan Lab Network's publication for independent eye care practices, featuring current issues and upcoming editorial themes.",
};

const issueUrl = "/newsletters/practice-matters/issue-001";

const upcomingIssues = [
  {
    label: "Issue 002",
    title: "Product conversations that build confidence",
    description:
      "Practical ways to help teams connect premium lens choices to patient needs without making the conversation feel forced.",
  },
  {
    label: "Issue 003",
    title: "Service, turnaround, and the practice experience",
    description:
      "A closer look at the lab behaviors that help practices protect trust at the dispensing table.",
  },
  {
    label: "Issue 004",
    title: "Training notes for independent optical teams",
    description:
      "Short, usable education pieces for opticians who want clearer language, stronger recommendations, and better patient conversations.",
  },
];

export default function NewsletterPage() {
  return (
    <NewsletterShell>
      <section className="px-4 py-8 md:px-8 md:py-12">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[18px_4px_18px_4px] border border-[#cdb99f] bg-[#fbf6ed] shadow-[0_28px_70px_rgba(73,55,37,0.13)]">
          <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
            <div className="relative bg-[#dfcbb2] px-6 py-12 sm:px-10 md:px-14 md:py-16">
              <div className="pointer-events-none absolute -right-40 -top-52 h-[520px] w-[520px] rounded-full border border-white/25" />
              <p className="relative font-[family-name:var(--font-alfons-script)] text-3xl text-[#8f6048]">
                From our desk to yours
              </p>
              <p className="relative mt-5 text-[10px] font-semibold uppercase tracking-[0.23em] text-[#6f563d]">A publication by Artisan Lab Network</p>
              <h1 className="relative mt-7 max-w-2xl font-[family-name:var(--font-alfons-display)] text-5xl font-normal leading-[0.94] tracking-[-0.03em] text-[#122033] sm:text-6xl md:text-7xl">
                Practice Matters
              </h1>
              <p className="relative mt-7 max-w-xl border-l-2 border-[#a46f52] pl-5 font-[family-name:Georgia,serif] text-lg leading-8 text-[#374352] md:text-xl">
                What&apos;s happening. What&apos;s changing. What matters to independent eye care.
              </p>
              <p className="relative mt-7 max-w-xl text-sm leading-7 text-[#4f5966] md:text-base md:leading-8">
                People, products, ideas, and timely updates for practices that want to stay informed, independent, and in control.
              </p>
            </div>

            <div className="border-t border-[#cdb99f] bg-[#f8f0e5] p-5 text-[#122033] sm:p-7 lg:border-l lg:border-t-0 lg:p-8">
              <div className="overflow-hidden rounded-[3px_13px_3px_13px] border border-[#c9b294] bg-[#ded6ca] shadow-[8px_9px_0_rgba(164,111,82,0.12)] lg:rotate-[0.6deg]">
                <Image
                  src="/newsletter-assets/jennc.jpg"
                  alt="Jenn C., featured in Practice Matters Issue 001"
                  width={900}
                  height={640}
                  className="aspect-[16/10] w-full object-cover"
                  priority
                />
              </div>
              <div className="mt-6 flex items-center justify-between gap-4 border-b border-[#d8c9b5] pb-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7654]">Current issue · July 2026</p>
                <span className="font-[family-name:Georgia,serif] text-2xl text-[#b59862]">001</span>
              </div>
              <h2 className="mt-5 font-[family-name:Georgia,serif] text-3xl font-normal leading-tight">People, products, and the power of choice.</h2>
              <p className="mt-4 text-sm leading-7 text-[#515b69]">
                Meet Jenn C., explore Chemistrie and Unity V3, revisit what independence makes possible, and review the Tokai availability update.
              </p>
              <Link href={issueUrl} className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-[#122033] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#9a8054]">
                Read Issue 001 <span className="ml-2" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 pt-6 md:px-8 md:pb-24 md:pt-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid border-y border-[#cdbb9e] py-8 md:grid-cols-[0.7fr_1fr] md:items-end md:py-10">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8a7654]">The publication</p>
              <h2 className="mt-3 font-[family-name:Georgia,serif] text-3xl font-normal text-[#122033] sm:text-4xl">Useful by design.</h2>
            </div>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#4c5563] md:mt-0 md:justify-self-end">
              Each edition follows the familiar rhythm of the email: a quick issue guide, focused stories, practical product context, and clear next steps your team can use.
            </p>
          </div>

          <div className="mt-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8a7654]">On the editorial calendar</p>
              <h2 className="mt-3 font-[family-name:Georgia,serif] text-3xl font-normal text-[#122033] sm:text-4xl">Coming next</h2>
            </div>
            <Link href="/newsletters" className="text-sm font-semibold text-[#122033] underline decoration-[#b59862] underline-offset-4">Browse the archive</Link>
          </div>

          <div className="mt-7 border-b border-[#cdbb9e]">
            {upcomingIssues.map((issue, index) => (
              <article key={issue.label} className="grid gap-4 border-t border-[#cdbb9e] px-1 py-7 md:grid-cols-[90px_minmax(0,0.75fr)_minmax(0,1fr)] md:items-start md:gap-8 md:py-9">
                <p className="font-[family-name:var(--font-alfons-script)] text-4xl text-[#a46f52]">0{index + 2}</p>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a7654]">{issue.label} · In development</p>
                  <h3 className="mt-2 text-xl font-semibold leading-7 text-[#122033]">{issue.title}</h3>
                </div>
                <p className="text-sm leading-7 text-[#4c5563]">{issue.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </NewsletterShell>
  );
}
