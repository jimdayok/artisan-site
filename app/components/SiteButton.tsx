import Link from "next/link";
import { ArrowRight, ExternalLink, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { artisanControlClass, type ArtisanControlTone } from "./controlStyles";

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

const variantTones: Record<SiteButtonVariant, ArtisanControlTone> = {
  primary: "accent",
  secondary: "secondary",
  quiet: "quiet",
  dark: "primary",
  light: "secondary",
  portal: "primary",
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
    artisanControlClass({ tone: variantTones[variant], size }),
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
