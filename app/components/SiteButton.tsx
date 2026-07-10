import Link from "next/link";
import { ArrowRight, ExternalLink, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type SiteButtonVariant = "primary" | "secondary" | "quiet" | "dark" | "light" | "portal";
type SiteButtonSize = "sm" | "md" | "lg";

type SiteButtonProps = {
  href?: string;
  children: ReactNode;
  variant?: SiteButtonVariant;
  size?: SiteButtonSize;
  icon?: LucideIcon;
  trailingIcon?: LucideIcon | false;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  external?: boolean;
};

const variantClasses: Record<SiteButtonVariant, string> = {
  primary:
    "border-[#d4c09a] bg-[#d4c09a] text-[#14110f] shadow-[0_14px_30px_rgba(31,26,23,0.16)] hover:border-[#e2cca2] hover:bg-[#e2cca2]",
  secondary:
    "border-[#d8c6a8] bg-white text-[#142033] shadow-sm hover:border-[#c9b28b] hover:bg-[#fbf8f3]",
  quiet:
    "border-transparent bg-transparent text-current hover:border-current/20 hover:bg-current/5",
  dark:
    "border-[#142033] bg-[#142033] text-white shadow-[0_14px_30px_rgba(20,32,51,0.16)] hover:border-[#24364b] hover:bg-[#24364b]",
  light:
    "border-white bg-white text-[#142033] shadow-[0_14px_30px_rgba(0,0,0,0.16)] hover:bg-[#f7efe3]",
  portal:
    "border-[#8fded4] bg-[#8fded4] text-[#082421] shadow-[0_14px_30px_rgba(10,84,75,0.2)] hover:border-[#a8eee5] hover:bg-[#a8eee5]",
};

const sizeClasses: Record<SiteButtonSize, string> = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-6 text-sm",
};

export default function SiteButton({
  href,
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  trailingIcon,
  className = "",
  onClick,
  type = "button",
  external,
}: SiteButtonProps) {
  const isExternal = external ?? Boolean(href && !href.startsWith("/"));
  const TrailingIcon = trailingIcon === false ? null : trailingIcon ?? (isExternal ? ExternalLink : ArrowRight);
  const classes = [
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border font-semibold transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4c09a] focus-visible:ring-offset-2 active:translate-y-0",
    variantClasses[variant],
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
      <span>{children}</span>
      {TrailingIcon ? <TrailingIcon className="h-4 w-4" aria-hidden="true" /> : null}
    </>
  );

  if (href) {
    if (href.startsWith("/")) {
      return (
        <Link href={href} className={classes} onClick={onClick}>
          {content}
        </Link>
      );
    }

    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes} onClick={onClick}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick}>
      {content}
    </button>
  );
}
