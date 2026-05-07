import Image from "next/image";
import Link from "next/link";
import NewsletterScrollButton from "./NewsletterScrollButton";

type NewsletterSectionProps = {
  id: string;
  label: string;
  title: string;
  icon: string;
  iconAlt?: string;
  supportingLogos?: {
    src: string;
    alt: string;
  }[];
  featureImage?: {
    src: string;
    alt: string;
  };
  backgroundImage?: {
    src: string;
    alt: string;
  };
  children: React.ReactNode;
  pullQuote?: string;
  tone?: "light" | "dark" | "warm";
  productLink?: {
    label: string;
    href: string;
  };
  readNext?: {
    label: string;
    href: string;
  };
};

export default function NewsletterSection({
  id,
  label,
  title,
  icon,
  iconAlt,
  supportingLogos,
  featureImage,
  backgroundImage,
  children,
  pullQuote,
  tone = "light",
  productLink,
  readNext,
}: NewsletterSectionProps) {
  const dark = tone === "dark";
  const warm = tone === "warm";

  return (
    <section
      id={id}
      className={`relative w-full scroll-mt-20 overflow-hidden rounded-[26px] border p-4 shadow-[0_30px_84px_rgba(18,32,51,0.1)] sm:p-6 md:scroll-mt-24 md:rounded-[38px] md:p-9 lg:p-11 ${
        dark
          ? "border-white/10 bg-[#122033] text-white"
          : warm
            ? "border-[#dbc28d] bg-[#fff7e8] text-[#122033]"
            : "border-[#dfd2bf] bg-white/88 text-[#122033]"
      }`}
    >
      {backgroundImage ? (
        <Image
          src={backgroundImage.src}
          alt={backgroundImage.alt}
          fill
          sizes="(min-width: 1280px) 1200px, 100vw"
          className="absolute inset-0 z-0 object-cover"
          priority={false}
        />
      ) : null}
      {backgroundImage ? (
        <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(115deg,rgba(18,32,51,0.92),rgba(18,32,51,0.8)_48%,rgba(18,32,51,0.7))]" />
      ) : null}
      <div className={`pointer-events-none absolute inset-x-4 top-0 h-px md:inset-x-8 ${dark ? "bg-[linear-gradient(90deg,transparent,rgba(217,195,148,0.75),transparent)]" : "bg-[linear-gradient(90deg,transparent,rgba(199,173,123,0.78),transparent)]"}`} />

      <div className="relative z-10 grid min-w-0 gap-7 lg:grid-cols-[minmax(0,0.26fr)_minmax(0,1fr)] lg:gap-8">
        <aside className="lg:pt-2">
          <div className={`flex h-16 w-16 items-center justify-center rounded-3xl border shadow-[0_14px_34px_rgba(18,32,51,0.08)] ${
            dark ? "border-white/12 bg-white/8" : "border-[#dfd2bf] bg-[#f8f3eb]"
          }`}>
            <Image src={icon} alt={iconAlt ?? ""} width={84} height={48} className={`max-h-9 max-w-20 object-contain ${dark ? "invert" : ""}`} />
          </div>
          {supportingLogos && supportingLogos.length > 0 ? (
            <div className="mt-4 grid gap-2">
              {supportingLogos.map((logo) => (
                <div key={logo.src} className="flex h-12 w-28 items-center justify-center rounded-2xl border border-[#dfd2bf] bg-white px-3">
                  <Image src={logo.src} alt={logo.alt} width={150} height={52} className="max-h-7 w-auto object-contain" />
                </div>
              ))}
            </div>
          ) : null}
          <p className={`mt-5 text-xs font-semibold uppercase tracking-[0.26em] ${dark ? "text-[#d9c394]" : "text-[#8a7654]"}`}>
            {label}
          </p>
          <div className={`mt-5 h-px w-28 ${dark ? "bg-[#d9c394]/50" : "bg-[#c7ad7b]/70"}`} />
        </aside>

        <div className="min-w-0">
          <h2 className={`max-w-4xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-6xl ${dark ? "text-white" : "text-[#122033]"}`}>
            {title}
          </h2>

          {featureImage ? (
            <div className={`mt-6 overflow-hidden rounded-[22px] border shadow-[0_22px_56px_rgba(18,32,51,0.1)] md:mt-8 md:rounded-[30px] ${
              dark ? "border-white/12 bg-white/8" : warm ? "border-[#d8bb7a] bg-white/54" : "border-[#dfd2bf] bg-[#f8f3eb]"
            }`}>
              <div className="relative aspect-[4/3] min-h-0 sm:aspect-[16/9] md:aspect-[16/7] md:min-h-56">
                <Image
                  src={featureImage.src}
                  alt={featureImage.alt}
                  fill
                  sizes="(min-width: 1024px) 820px, 100vw"
                  className="object-cover"
                />
                <div className={`absolute inset-0 ${
                  dark
                    ? "bg-[linear-gradient(180deg,rgba(18,32,51,0.08),rgba(18,32,51,0.42))]"
                    : "bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(18,32,51,0.12))]"
                }`} />
              </div>
            </div>
          ) : null}

          <div className={`mt-7 max-w-4xl space-y-5 text-base leading-8 md:mt-8 md:text-lg md:leading-9 ${dark ? "text-white/76" : "text-[#3f4856]"}`}>
            {children}
          </div>

          {pullQuote ? (
            <blockquote className={`mt-8 rounded-[22px] border px-5 py-5 text-xl font-semibold leading-snug md:mt-10 md:rounded-[28px] md:px-6 md:py-6 md:text-3xl ${
              dark
                ? "border-[#d9c394]/30 bg-white/[0.06] text-[#f4e4bf]"
                : warm
                  ? "border-[#d8bb7a] bg-white/62 text-[#122033]"
                  : "border-[#dfd2bf] bg-[#f8f3eb] text-[#122033]"
            }`}>
              "{pullQuote}"
            </blockquote>
          ) : null}

          <div className={`mt-8 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:flex-wrap md:mt-10 ${dark ? "border-white/12" : "border-[#dfd2bf]"}`}>
            {productLink ? (
              <Link
                href={productLink.href}
                target={productLink.href.startsWith("http") ? "_blank" : undefined}
                rel={productLink.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className={`inline-flex min-h-11 w-full items-center justify-center rounded-full border px-5 py-2 text-center text-sm font-semibold transition hover:-translate-y-0.5 sm:w-auto ${
                  dark
                    ? "border-[#d9c394]/55 text-[#f4e4bf] hover:bg-white/10"
                    : warm
                      ? "border-[#d8bb7a] bg-white/62 text-[#122033] hover:bg-white"
                      : "border-[#dfd2bf] bg-[#f8f3eb] text-[#122033] hover:bg-white"
                }`}
              >
                {productLink.label}
              </Link>
            ) : null}
            {readNext ? (
              <NewsletterScrollButton
                targetId={readNext.href.replace("#", "")}
                className={`inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 py-2 text-center text-sm font-semibold transition hover:-translate-y-0.5 sm:w-auto ${
                  dark
                    ? "bg-[#d9c394] text-[#122033] hover:bg-white"
                    : "bg-[#122033] text-white hover:bg-[#c7ad7b] hover:text-[#122033]"
                }`}
              >
                Read next: {readNext.label}
              </NewsletterScrollButton>
            ) : null}
            <NewsletterScrollButton
              targetId="top"
              className={`inline-flex min-h-11 w-full items-center justify-center rounded-full border px-5 py-2 text-center text-sm font-semibold transition hover:-translate-y-0.5 sm:w-auto ${
                dark
                  ? "border-white/20 text-white hover:bg-white/10"
                  : "border-[#dfd2bf] text-[#122033] hover:bg-[#f2eadf]"
              }`}
            >
              Back to top
            </NewsletterScrollButton>
          </div>
        </div>
      </div>
    </section>
  );
}
