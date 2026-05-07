import type { Metadata } from "next";
import NewsletterShell from "../components/newsletter/NewsletterShell";

export const metadata: Metadata = {
  title: "Newsletters | Artisan Lab Network",
  description: "Artisan Lab Network publication archive for independent eye care practices.",
};

export default function NewslettersPage() {
  return (
    <NewsletterShell>
      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#8a7654]">
            Publications
          </p>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight text-[#142033] md:text-7xl">
            Newsletter Archive
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#4c5563]">
            Explore Artisan Lab Network publications created for independent eye care practices.
          </p>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <a
              href="/newsletters/practice-matters/issue-001"
              className="group rounded-[30px] border border-[#dfd2bf] bg-white/82 p-7 shadow-[0_22px_60px_rgba(20,32,51,0.08)] transition hover:-translate-y-1 hover:border-[#c7ad7b] hover:bg-white"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">
                Practice Matters
              </p>
              <h2 className="mt-4 text-3xl font-semibold text-[#142033]">
                What matters to independent eye care.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#4c5563]">
                People, products, updates, and ideas from Artisan Lab Network.
              </p>
              <span className="mt-7 inline-flex rounded-full bg-[#142033] px-5 py-2.5 text-sm font-semibold text-white transition group-hover:bg-[#c7ad7b] group-hover:text-[#142033]">
                Read Issue 001
              </span>
            </a>
          </div>
        </div>
      </section>
    </NewsletterShell>
  );
}
