import Image from "next/image";

type NewsletterHeroProps = {
  issueLabel: string;
  title: string;
  subheading: string;
  intro: string;
  publishedDate?: string;
  readTime?: string;
};

export default function NewsletterHero({
  issueLabel,
  title,
  subheading,
  intro,
  publishedDate = "July 2026",
  readTime = "8 minute read",
}: NewsletterHeroProps) {
  return (
    <section className="w-full px-4 pb-12 pt-6 md:px-8 md:pb-16 md:pt-10">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[18px_4px_18px_4px] border border-[#d0bfa8] bg-[#fbf6ed] shadow-[0_28px_70px_rgba(73,55,37,0.13)]">
        <div className="grid lg:grid-cols-[minmax(0,1.45fr)_minmax(290px,0.55fr)]">
          <div className="relative overflow-hidden px-6 py-10 sm:px-10 sm:py-14 md:px-14 md:py-16">
            <div className="pointer-events-none absolute -right-32 -top-44 h-[430px] w-[430px] rounded-full border border-[#b59862]/15" />
            <div className="pointer-events-none absolute -right-20 -top-32 h-[330px] w-[330px] rounded-full border border-[#b59862]/20" />
            <div className="relative">
              <p className="font-[family-name:var(--font-alfons-script)] text-2xl font-extralight text-[#a46f52] sm:text-3xl">
                A note for independent practices
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7654]">
                <span>{issueLabel}</span>
                <span className="h-px w-8 bg-[#b59862]/70" />
                <span>{publishedDate}</span>
                <span className="text-[#766d62]">{readTime}</span>
              </div>
              <h1 className="mt-8 max-w-4xl font-[family-name:var(--font-alfons-display)] text-5xl font-normal leading-[0.94] tracking-[-0.03em] text-[#122033] sm:text-6xl md:text-7xl lg:text-[5.3rem]">
                {title}
              </h1>
              <p className="mt-7 max-w-2xl border-l-2 border-[#a46f52] pl-5 font-[family-name:Georgia,serif] text-lg leading-8 text-[#47505d] md:text-xl md:leading-9">
                {subheading}
              </p>
            </div>
          </div>

          <aside className="relative flex min-w-0 flex-col justify-between border-t border-[#d0bfa8] bg-[#dfcbb2] p-6 text-[#122033] sm:p-8 lg:border-l lg:border-t-0 lg:p-9">
            <div className="pointer-events-none absolute bottom-5 right-4 font-[family-name:Georgia,serif] text-[9rem] leading-none text-white/18">“</div>
            <div>
              <div className="relative flex items-center justify-between gap-4 border-b border-[#b89f82] pb-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6f563d]">From our desk</p>
                <Image src="/aln-icon.png" alt="" width={32} height={32} className="h-7 w-7 object-contain" />
              </div>
              <p className="relative mt-6 font-[family-name:Georgia,serif] text-lg leading-8 text-[#344052]">
                {intro}
              </p>
            </div>
            <p className="relative mt-8 font-[family-name:var(--font-alfons-script)] text-2xl text-[#704d3b]">Artisan Lab Network</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
