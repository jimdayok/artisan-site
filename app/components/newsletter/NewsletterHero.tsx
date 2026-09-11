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
  publishedDate = "September 2026",
  readTime = "8 minute read",
}: NewsletterHeroProps) {
  return (
    <section className="w-full px-4 pb-10 pt-6 md:px-8 md:pb-14 md:pt-10">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[28px] border border-[#cdbfae] bg-white shadow-[0_30px_80px_rgba(18,32,51,0.16)]">
        <div className="grid lg:grid-cols-[minmax(0,1.28fr)_minmax(330px,0.72fr)]">
          <div className="relative overflow-hidden bg-[#122033] px-6 py-10 text-white sm:px-10 sm:py-14 md:px-14 md:py-16">
            <div className="pointer-events-none absolute -right-40 -top-40 h-[440px] w-[440px] rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-24 -top-24 h-[310px] w-[310px] rounded-full border border-[#d9c394]/20" />
            <div className="relative">
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#d9c394]">
                Independent eye care briefing
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                <span className="rounded-full border border-white/20 bg-white/[0.06] px-3 py-1.5 text-white">{issueLabel}</span>
                <span>{publishedDate}</span>
                <span className="h-1 w-1 rounded-full bg-[#d9c394]" />
                <span>{readTime}</span>
              </div>
              <h1 className="font-newsletter-editorial mt-8 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.035em] text-white sm:text-6xl md:text-7xl lg:text-[5rem]">
                {title}
              </h1>
              <p className="mt-7 max-w-2xl border-l-4 border-[#d9c394] pl-5 text-lg font-semibold leading-8 text-white/90 md:text-xl md:leading-9">
                {subheading}
              </p>
            </div>
          </div>

          <aside className="relative flex min-w-0 flex-col bg-[#efe3d2] p-6 text-[#122033] sm:p-8 lg:p-10">
            <div className="relative overflow-hidden rounded-[18px] border border-[#c8b496] bg-[#d8c4a9] shadow-[0_14px_30px_rgba(73,55,37,0.14)]">
              <div className="relative aspect-[16/10]">
                <Image
                  src="/newsletter-assets/jennc.jpg"
                  alt="Jenn C., featured in Practice Matters"
                  fill
                  sizes="(min-width: 1024px) 420px, 100vw"
                  className="object-cover object-[center_38%]"
                  priority
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(18,32,51,0.5))]" />
              </div>
            </div>
            <div className="mt-7 border-t-2 border-[#b99a6b] pt-6">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#765f45]">From our desk</p>
              <p className="mt-4 text-base font-medium leading-7 text-[#344052]">
                {intro}
              </p>
            </div>
            <Image
              src="/aln_logo_black.jpeg"
              alt="Artisan Lab Network"
              width={180}
              height={101}
              className="mt-6 h-auto w-40 mix-blend-multiply"
            />
          </aside>
        </div>
      </div>
    </section>
  );
}
