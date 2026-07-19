import Image from "next/image";
import Link from "next/link";
import NewsletterScrollButton from "./NewsletterScrollButton";

type NewsletterSectionProps = {
  id: string;
  number?: string;
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
  number,
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
      className={`relative w-full scroll-mt-20 overflow-hidden rounded-[16px_3px_16px_3px] border shadow-[0_18px_50px_rgba(73,55,37,0.085)] md:scroll-mt-24 ${
        dark
          ? "border-white/10 bg-[#122033] text-white"
          : warm
            ? "border-[#d5b98a] bg-[#fff3dc] text-[#122033]"
            : "border-[#d8c9b5] bg-[#fcf8f1] text-[#122033]"
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
      <div className={`pointer-events-none absolute left-0 top-0 h-1 w-2/3 ${dark ? "bg-[#d9c394]" : "bg-[#a46f52]"}`} />

      <div className="relative z-10 grid min-w-0 lg:grid-cols-[150px_minmax(0,1fr)]">
        <aside className={`border-b p-5 sm:p-7 lg:border-b-0 lg:border-r lg:p-8 ${dark ? "border-white/12" : "border-[#ded2c0] bg-[#f3e9dc]/65"}`}>
          {number ? (
            <p className={`font-[family-name:var(--font-alfons-script)] text-5xl leading-none ${dark ? "text-[#d9c394]" : "text-[#a46f52]"}`}>{number}</p>
          ) : null}
          <div className={`mt-5 flex h-14 w-14 items-center justify-center rounded-md border ${
            dark ? "border-white/12 bg-white/8" : "border-[#dfd2bf] bg-[#f8f3eb]"
          }`}>
            <Image src={icon} alt={iconAlt ?? ""} width={84} height={48} className={`max-h-9 max-w-20 object-contain ${dark ? "invert" : ""}`} />
          </div>
          {supportingLogos && supportingLogos.length > 0 ? (
            <div className="mt-4 grid gap-2">
              {supportingLogos.map((logo) => (
                <div key={logo.src} className="flex h-12 w-28 items-center justify-center rounded-md border border-[#dfd2bf] bg-white px-3">
                  <Image src={logo.src} alt={logo.alt} width={150} height={52} className="max-h-7 w-auto object-contain" />
                </div>
              ))}
            </div>
          ) : null}
          <p className={`mt-5 text-[10px] font-semibold uppercase leading-5 tracking-[0.22em] ${dark ? "text-[#d9c394]" : "text-[#8a7654]"}`}>
            {label}
          </p>
        </aside>

        <div className="min-w-0 p-5 sm:p-8 md:p-10 lg:p-12">
          <h2 className={`max-w-4xl font-[family-name:Georgia,serif] text-3xl font-normal leading-[1.08] tracking-[-0.025em] sm:text-4xl md:text-[2.8rem] ${dark ? "text-white" : "text-[#122033]"}`}>
            {title}
          </h2>

          {featureImage ? (
            <div className={`relative mt-7 overflow-hidden rounded-[3px_14px_3px_14px] border shadow-[8px_10px_0_rgba(164,111,82,0.10)] md:mt-9 md:-mr-5 ${
              dark ? "border-white/12 bg-white/8" : warm ? "border-[#d8bb7a] bg-white/54" : "border-[#dfd2bf] bg-[#f8f3eb]"
            }`}>
              <div className="relative aspect-[4/3] min-h-0 sm:aspect-[16/9] md:aspect-[16/8] md:min-h-56">
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

          <div className={`mt-7 max-w-3xl space-y-5 text-base leading-8 md:mt-9 md:text-[17px] md:leading-8 ${dark ? "text-white/76" : "text-[#3f4856]"}`}>
            {children}
          </div>

          {pullQuote ? (
            <blockquote className={`relative mt-9 max-w-3xl px-7 py-5 font-[family-name:Georgia,serif] text-xl italic leading-snug before:absolute before:left-0 before:top-0 before:font-[family-name:Georgia,serif] before:text-6xl before:leading-none before:content-['“'] md:mt-11 md:px-9 md:text-2xl ${
              dark
                ? "bg-white/[0.055] text-[#f4e4bf] before:text-[#d9c394]"
                : warm
                  ? "bg-white/55 text-[#122033] before:text-[#a46f52]"
                  : "bg-[#f2e7da] text-[#122033] before:text-[#a46f52]"
            }`}>
              &quot;{pullQuote}&quot;
            </blockquote>
          ) : null}

          <div className={`mt-9 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:flex-wrap md:mt-11 ${dark ? "border-white/12" : "border-[#dfd2bf]"}`}>
            {productLink ? (
              <Link
                href={productLink.href}
                target={productLink.href.startsWith("http") ? "_blank" : undefined}
                rel={productLink.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className={`inline-flex min-h-11 w-full items-center justify-center rounded-md border px-5 py-2 text-center text-sm font-semibold transition sm:w-auto ${
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
                className={`inline-flex min-h-11 w-full items-center justify-center rounded-md px-5 py-2 text-center text-sm font-semibold transition sm:w-auto ${
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
              className={`inline-flex min-h-11 w-full items-center justify-center rounded-md border px-5 py-2 text-center text-sm font-semibold transition sm:w-auto ${
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
