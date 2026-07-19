import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import NewsletterShell from "../../../components/newsletter/NewsletterShell";
import { canPreviewNewsletterDrafts } from "../../../../lib/newsletters/draftPreview";

export const metadata: Metadata = {
  title: "Practice Matters Editorial Staging",
  robots: { index: false, follow: false },
};

const drafts = [
  {
    issue: "Issue 002",
    month: "August 2026",
    title: "Product conversations that build confidence",
    href: "/newsletters/practice-matters/issue-002",
    status: "First editorial draft complete",
  },
  {
    issue: "Issue 003",
    month: "September 2026",
    title: "Service, turnaround, and the practice experience",
    href: "/newsletters/practice-matters/issue-003",
    status: "First editorial draft complete",
  },
];

export default async function NewsletterStagingPage() {
  await connection();
  if (!canPreviewNewsletterDrafts()) notFound();

  return (
    <NewsletterShell>
      <div className="border-b border-[#c99c77] bg-[#a46f52] px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
        Internal editorial workspace · Not published
      </div>
      <section className="px-4 py-12 md:px-8 md:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="font-[family-name:var(--font-alfons-script)] text-4xl text-[#a46f52]">On the editor&apos;s desk</p>
          <h1 className="mt-3 max-w-3xl font-[family-name:Georgia,serif] text-4xl leading-tight text-[#122033] md:text-6xl">Practice Matters staging room</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#4d5664]">Review future issues here before any route is opened to the public archive or production newsletter navigation.</p>

          <div className="mt-12 space-y-5">
            {drafts.map((draft, index) => (
              <Link key={draft.issue} href={draft.href} className="group grid gap-5 rounded-[16px_3px_16px_3px] border border-[#d0bfa8] bg-[#fbf6ed] p-6 shadow-[0_14px_36px_rgba(73,55,37,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(73,55,37,0.12)] md:grid-cols-[80px_minmax(0,1fr)_auto] md:items-center md:p-8">
                <span className="font-[family-name:var(--font-alfons-script)] text-5xl text-[#a46f52]">0{index + 2}</span>
                <span>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a7654]">{draft.issue} · {draft.month}</span>
                  <span className="mt-2 block font-[family-name:Georgia,serif] text-2xl text-[#122033]">{draft.title}</span>
                  <span className="mt-3 block text-sm text-[#5a6270]">{draft.status}</span>
                </span>
                <span className="text-sm font-semibold text-[#122033] underline decoration-[#a46f52] underline-offset-4">Open draft →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </NewsletterShell>
  );
}
