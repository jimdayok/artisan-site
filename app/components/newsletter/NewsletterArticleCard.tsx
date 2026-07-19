import Image from "next/image";
import Link from "next/link";

export type NewsletterNavArticle = {
  id: string;
  label: string;
  title: string;
  dek: string;
  icon: string;
  iconAlt?: string;
  supportingLogo?: string;
  supportingLogoAlt?: string;
  number: string;
};

type NewsletterArticleCardProps = {
  article: NewsletterNavArticle;
};

export default function NewsletterArticleCard({ article }: NewsletterArticleCardProps) {
  return (
    <Link
      href={`#${article.id}`}
      className="group relative grid min-w-0 grid-cols-[52px_minmax(0,1fr)_auto] items-start gap-4 border-t border-[#d8c9b5] bg-[#fbf6ed]/80 px-4 py-5 transition hover:bg-[#f1e4d5] md:px-5 last:md:col-span-2"
    >
      <span className="font-[family-name:var(--font-alfons-script)] text-4xl leading-none text-[#a46f52]">{article.number}</span>
      <span className="min-w-0">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a7654]">{article.label}</span>
        <span className="mt-1.5 block font-[family-name:Georgia,serif] text-xl leading-tight text-[#122033]">{article.title}</span>
        <span className="mt-2 block max-w-xl text-sm leading-6 text-[#5a6270]">{article.dek}</span>
        {article.supportingLogo ? (
          <Image src={article.supportingLogo} alt={article.supportingLogoAlt ?? ""} width={105} height={34} className="mt-3 max-h-5 w-auto object-contain" />
        ) : null}
      </span>
      <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-[#cdbb9e] text-lg text-[#8a7654] transition group-hover:border-[#122033] group-hover:bg-[#122033] group-hover:text-white" aria-hidden="true">↘</span>
    </Link>
  );
}
