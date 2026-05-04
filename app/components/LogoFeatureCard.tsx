import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type LogoSize = "wide" | "small" | "tall";
type LogoTone = "light" | "dark";

type LogoFeatureCardProps = {
  title: string;
  body?: string;
  href?: string;
  logo?: string;
  logoAlt?: string;
  logoSize?: LogoSize;
  logoScale?: "scale-[1.15]" | "scale-[1.25]" | "scale-[1.35]" | "scale-[1.5]";
  tone?: LogoTone;
  cta?: string;
  children?: ReactNode;
  className?: string;
  titleClassName?: string;
};

function LogoMark({
  logo,
  logoAlt,
  title,
  logoSize = "wide",
  logoScale = "scale-[1.15]",
  tone = "light",
}: Pick<LogoFeatureCardProps, "logo" | "logoAlt" | "title" | "logoSize" | "logoScale" | "tone">) {
  const maxClass =
    logoSize === "tall"
      ? "max-h-[130px] max-w-[240px]"
      : logoSize === "small"
        ? "max-h-[100px] max-w-[260px]"
        : "max-h-[120px] max-w-[420px]";

  const panelClass =
    tone === "dark"
      ? "border-white/10 bg-white/[0.08]"
      : "border-[#e4d7c6] bg-[#fbf8f3]";

  return (
    <div className={`mb-6 flex min-h-[126px] items-center justify-center rounded-[22px] border px-5 py-4 ${panelClass}`}>
      {logo ? (
        <Image
          src={logo}
          alt={logoAlt ?? title}
          width={520}
          height={220}
          className={`${maxClass} ${logoScale} w-auto object-contain`}
        />
      ) : (
        <div className={`text-center text-3xl font-semibold tracking-tight ${tone === "dark" ? "text-white" : "text-[#1f1a17]"}`}>
          {title}
        </div>
      )}
    </div>
  );
}

export default function LogoFeatureCard({
  title,
  body,
  href,
  logo,
  logoAlt,
  logoSize = "wide",
  logoScale = "scale-[1.15]",
  tone = "light",
  cta = "Explore",
  children,
  className = "",
  titleClassName = "",
}: LogoFeatureCardProps) {
  const dark = tone === "dark";
  const cardClass = [
    "group flex h-full min-h-[320px] flex-col rounded-[28px] border p-6 shadow-[0_18px_48px_rgba(24,18,13,0.08)] transition duration-300 hover:-translate-y-1",
    dark
      ? "border-white/10 bg-white/[0.06] text-white hover:border-[#d4c09a]/55"
      : "border-black/10 bg-white text-[#1f1a17] hover:border-[#d4c09a]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <LogoMark
        logo={logo}
        logoAlt={logoAlt}
        title={title}
        logoSize={logoSize}
        logoScale={logoScale}
        tone={tone}
      />
      <h3 className={`text-2xl font-semibold leading-tight ${titleClassName}`}>
        {title}
      </h3>
      {body ? (
        <p className={`mt-4 flex-1 text-sm leading-7 ${dark ? "text-white/68" : "text-[#625b53]"}`}>
          {body}
        </p>
      ) : (
        <div className="flex-1" />
      )}
      {children}
      {cta ? (
        <span
          className={`mt-7 inline-flex w-fit items-center rounded-full px-5 py-2.5 text-sm font-semibold transition ${
            dark
              ? "border border-white/12 bg-white/8 text-white group-hover:border-[#d4c09a] group-hover:bg-[#d4c09a] group-hover:text-[#171311]"
              : "border border-[#e1d4c2] bg-[#fbf8f3] text-[#1f1a17] group-hover:border-[#d4c09a] group-hover:bg-[#d4c09a]"
          }`}
        >
          {cta}
        </span>
      ) : null}
    </>
  );

  if (!href) return <article className={cardClass}>{content}</article>;

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={cardClass}>
        {content}
      </Link>
    );
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" className={cardClass}>
      {content}
    </a>
  );
}
