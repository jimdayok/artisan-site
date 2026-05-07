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
      className="group relative flex h-full min-h-[250px] min-w-0 flex-col overflow-hidden rounded-[24px] border border-[#dfd2bf] bg-white/82 p-5 shadow-[0_22px_54px_rgba(18,32,51,0.08)] transition duration-300 hover:-translate-y-1.5 hover:border-[#c7ad7b] hover:bg-white hover:shadow-[0_34px_82px_rgba(18,32,51,0.13)] md:min-h-[285px] md:rounded-[30px] md:p-6"
    >
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(199,173,123,0.9),transparent)]" />
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#dfd2bf] bg-[#f8f3eb] shadow-[0_12px_26px_rgba(18,32,51,0.06)]">
          <Image src={article.icon} alt={article.iconAlt ?? ""} width={42} height={42} className="max-h-8 max-w-8 object-contain opacity-90" />
        </span>
        <span className="text-5xl font-semibold leading-none text-[#c7ad7b]/32">
          {article.number}
        </span>
      </div>
      {article.supportingLogo ? (
        <div className="mt-5 flex h-10 w-fit items-center rounded-2xl border border-[#dfd2bf] bg-white px-3">
          <Image
            src={article.supportingLogo}
            alt={article.supportingLogoAlt ?? ""}
            width={130}
            height={44}
            className="max-h-6 w-auto object-contain"
          />
        </div>
      ) : null}
      <span className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7654] md:tracking-[0.24em]">
        {article.label}
      </span>
      <h2 className="mt-3 text-2xl font-semibold leading-tight text-[#122033]">
        {article.title}
      </h2>
      <p className="mt-4 flex-1 text-sm leading-7 text-[#4d5664]">
        {article.dek}
      </p>
      <span className="mt-7 inline-flex w-fit rounded-full border border-[#dfd2bf] bg-[#f8f3eb] px-4 py-2 text-sm font-semibold text-[#122033] transition group-hover:border-[#c7ad7b] group-hover:bg-[#eadcc6]">
        Read article
      </span>
    </Link>
  );
}
