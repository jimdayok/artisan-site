import Image from "next/image";
import Link from "next/link";

export type NewsletterNavArticle = {
  id: string;
  label: string;
  title: string;
  dek: string;
  icon: string;
  iconAlt?: string;
  image?: string;
  imageAlt?: string;
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
      className="group min-w-0 overflow-hidden rounded-2xl border border-[#d8c9b5] bg-white shadow-[0_10px_28px_rgba(18,32,51,0.07)] transition duration-200 hover:-translate-y-1 hover:border-[#b99a6b] hover:shadow-[0_18px_38px_rgba(18,32,51,0.13)] last:md:col-span-2"
    >
      {article.image ? (
        <span className="relative block aspect-[16/8] overflow-hidden bg-[#e8ded2]">
          <Image
            src={article.image}
            alt={article.imageAlt ?? ""}
            fill
            sizes="(min-width: 768px) 520px, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute inset-0 bg-[linear-gradient(180deg,transparent_42%,rgba(18,32,51,0.42))]" />
          <span className="absolute bottom-3 left-3 rounded-full bg-[#122033] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white">
            Story {article.number}
          </span>
        </span>
      ) : null}
      <span className="grid min-w-0 grid-cols-[44px_minmax(0,1fr)_auto] items-start gap-4 p-5 sm:p-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#dfd2bf] bg-[#f8f3eb]">
          <Image src={article.icon} alt={article.iconAlt ?? ""} width={56} height={34} className="max-h-7 max-w-9 object-contain" />
        </span>
        <span className="min-w-0">
          <span className="block text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#765f45]">{article.label}</span>
          <span className="font-newsletter-editorial mt-1.5 block text-xl font-semibold leading-tight text-[#122033]">{article.title}</span>
          <span className="mt-2 block max-w-xl text-sm font-medium leading-6 text-[#4b5563]">{article.dek}</span>
          {article.supportingLogo ? (
            <Image src={article.supportingLogo} alt={article.supportingLogoAlt ?? ""} width={105} height={34} className="mt-3 max-h-5 w-auto object-contain" />
          ) : null}
        </span>
        <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#efe3d2] text-lg font-bold text-[#765f45] transition group-hover:bg-[#122033] group-hover:text-white" aria-hidden="true">→</span>
      </span>
    </Link>
  );
}
