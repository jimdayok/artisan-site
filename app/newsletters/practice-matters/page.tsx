import type { Metadata } from "next";
import NewsletterShell from "../../components/newsletter/NewsletterShell";

export const metadata: Metadata = {
  title: "Practice Matters | Artisan Lab Network",
  description: "Practice Matters is Artisan Lab Network's newsletter for independent eye care practices.",
};

export default function PracticeMattersPage() {
  return (
    <NewsletterShell>
      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#8a7654]">
            Artisan Lab Network Publication
          </p>
          <h1 className="mt-5 text-6xl font-semibold tracking-tight text-[#142033] md:text-8xl">
            Practice Matters
          </h1>
          <p className="mt-6 max-w-3xl text-xl leading-9 text-[#4c5563]">
            What is happening. What is changing. What matters to independent eye care.
          </p>

          <div className="mt-12 rounded-[30px] border border-[#dfd2bf] bg-white/82 p-7 shadow-[0_22px_60px_rgba(20,32,51,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">
              Latest Issue
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-[#142033]">
              Issue 001
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#4c5563]">
              People, products, updates, and ideas shaping the Artisan Lab Network experience.
            </p>
            <a
              href="/newsletters/practice-matters/issue-001"
              className="mt-7 inline-flex rounded-full bg-[#142033] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#c7ad7b] hover:text-[#142033]"
            >
              Read Issue 001
            </a>
          </div>
        </div>
      </section>
    </NewsletterShell>
  );
}
