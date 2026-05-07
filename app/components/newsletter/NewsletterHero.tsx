import Image from "next/image";

type NewsletterHeroProps = {
  issueLabel: string;
  title: string;
  subheading: string;
  intro: string;
};

export default function NewsletterHero({
  issueLabel,
  title,
  subheading,
  intro,
}: NewsletterHeroProps) {
  return (
    <section className="w-full px-4 pb-14 pt-5 md:px-8 md:pb-24 md:pt-10">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[26px] border border-[#dfd2bf] bg-[#fbf7ef]/82 shadow-[0_34px_90px_rgba(18,32,51,0.12)] backdrop-blur md:rounded-[38px]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(199,173,123,0.22),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.78),rgba(244,238,228,0.64))]" />
          <div className="relative grid min-w-0 gap-8 p-5 md:p-10 lg:grid-cols-[minmax(0,1fr)_0.46fr] lg:items-end">
            <div>
              <Image
                src="/aln-logo.svg"
                alt="Artisan Lab Network"
                width={210}
                height={62}
                className="mb-7 h-12 w-auto"
                priority
              />
              <div className="inline-flex items-center gap-3 rounded-full border border-[#d8c6a8] bg-white/78 px-4 py-2 shadow-[0_12px_28px_rgba(18,32,51,0.06)]">
                <span className="h-2 w-2 rounded-full bg-[#c7ad7b]" />
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a7654]">
                  {issueLabel}
                </span>
              </div>
              <h1 className="mt-7 max-w-5xl text-5xl font-semibold leading-[0.96] tracking-tight text-[#122033] sm:text-6xl md:text-8xl lg:text-9xl">
                {title}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[#2d3542] md:text-2xl md:leading-10">
                {subheading}
              </p>
            </div>

            <aside className="relative min-w-0 overflow-hidden rounded-[24px] border border-[#dfd2bf] bg-white/82 p-5 shadow-[0_22px_60px_rgba(18,32,51,0.09)] md:rounded-[30px] md:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#122033]">
                  <Image src="/icons/site/book-open.svg" alt="" width={24} height={24} className="h-6 w-6 invert" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">
                    Editorial Note
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#122033]">
                    From Artisan Lab Network
                  </p>
                </div>
              </div>
              <p className="text-base leading-8 text-[#4d5664]">
                {intro}
              </p>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
