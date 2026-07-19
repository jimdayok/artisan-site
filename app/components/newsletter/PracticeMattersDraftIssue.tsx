import Link from "next/link";
import NewsletterArticleCard, { type NewsletterNavArticle } from "./NewsletterArticleCard";
import NewsletterHero from "./NewsletterHero";
import NewsletterNavigation from "./NewsletterNavigation";
import NewsletterSection from "./NewsletterSection";
import NewsletterShell from "./NewsletterShell";

export type DraftNewsletterArticle = NewsletterNavArticle & {
  body: React.ReactNode;
  pullQuote?: string;
  tone?: "light" | "dark" | "warm";
  featureImage?: { src: string; alt: string };
};

type PracticeMattersDraftIssueProps = {
  issueLabel: string;
  publicationDate: string;
  readTime: string;
  subheading: string;
  intro: string;
  articles: DraftNewsletterArticle[];
};

export default function PracticeMattersDraftIssue({
  issueLabel,
  publicationDate,
  readTime,
  subheading,
  intro,
  articles,
}: PracticeMattersDraftIssueProps) {
  return (
    <NewsletterShell>
      <div className="border-b border-[#c99c77] bg-[#a46f52] px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
        Internal preview · Draft content · Not published
      </div>

      <NewsletterHero
        issueLabel={issueLabel}
        title="Practice Matters"
        subheading={subheading}
        intro={intro}
        publishedDate={publicationDate}
        readTime={readTime}
      />

      <section className="w-full px-4 pb-14 md:px-8 md:pb-20">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[14px_3px_14px_3px] border border-[#d0bfa8] bg-[#fbf6ed] shadow-[0_16px_42px_rgba(73,55,37,0.08)]">
          <div className="grid gap-4 border-b border-[#d8c9b5] px-5 py-7 md:grid-cols-[0.7fr_1fr] md:items-end md:px-8 md:py-9">
            <div>
              <p className="font-[family-name:var(--font-alfons-script)] text-3xl text-[#a46f52]">Inside this draft</p>
              <h2 className="mt-2 font-[family-name:Georgia,serif] text-3xl font-normal tracking-tight text-[#122033] sm:text-4xl">
                Five stories for the next conversation.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#4d5664] md:justify-self-end">
              Review the editorial flow, wording, and calls to action here before this issue is approved for publication.
            </p>
          </div>
          <div className="grid md:grid-cols-2 md:gap-x-8 md:px-4">
            {articles.map((article) => <NewsletterArticleCard key={article.id} article={article} />)}
          </div>
        </div>
      </section>

      <section className="w-full px-4 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-6xl min-w-0 gap-7 lg:grid-cols-[190px_minmax(0,1fr)] lg:items-start">
          <aside className="hidden lg:sticky lg:top-6 lg:block">
            <NewsletterNavigation articles={articles} />
          </aside>
          <div className="min-w-0 space-y-8 md:space-y-12">
            {articles.map((article, index) => (
              <NewsletterSection
                key={article.id}
                id={article.id}
                number={article.number}
                label={article.label}
                title={article.title}
                icon={article.icon}
                iconAlt={article.iconAlt}
                featureImage={article.featureImage}
                pullQuote={article.pullQuote}
                tone={article.tone}
                readNext={articles[index + 1] ? { label: articles[index + 1].label, href: `#${articles[index + 1].id}` } : undefined}
              >
                {article.body}
              </NewsletterSection>
            ))}

            <section className="rounded-[16px_3px_16px_3px] border border-[#d0bfa8] bg-[#dfcbb2] p-6 text-center shadow-[0_18px_50px_rgba(73,55,37,0.1)] md:p-11">
              <p className="font-[family-name:var(--font-alfons-script)] text-3xl text-[#704d3b]">End of draft</p>
              <h2 className="mx-auto mt-3 max-w-2xl font-[family-name:Georgia,serif] text-3xl text-[#122033] md:text-4xl">Ready for editorial review.</h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#4d5664]">This issue remains hidden from the public archive and live navigation until its status is changed for launch.</p>
              <Link href="/newsletter" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-[#122033] px-5 py-2 text-sm font-semibold text-white hover:bg-[#8f6048]">Return to newsletter home</Link>
            </section>
          </div>
        </div>
      </section>
    </NewsletterShell>
  );
}
