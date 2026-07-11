export type ArtisanControlTone = "primary" | "accent" | "secondary" | "inverse" | "quiet";
export type ArtisanControlSize = "sm" | "md" | "lg";

const base =
  "inline-flex max-w-full shrink-0 items-center justify-center gap-2 rounded-full border font-semibold leading-tight transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4c09a] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45";

const tones: Record<ArtisanControlTone, string> = {
  primary:
    "border-[#172a28] bg-[#172a28] text-white shadow-[0_10px_24px_rgba(23,42,40,0.14)] hover:border-[#27433f] hover:bg-[#27433f]",
  accent:
    "border-[#d8c49b] bg-[#d8c49b] text-[#172a28] shadow-[0_10px_24px_rgba(23,42,40,0.1)] hover:border-[#e4d2aa] hover:bg-[#e4d2aa]",
  secondary:
    "border-[#d8c49b] bg-[#fffaf1] text-[#172a28] shadow-sm hover:border-[#bda36f] hover:bg-white",
  inverse:
    "border-white/25 bg-white/5 text-white hover:border-white/45 hover:bg-white/12",
  quiet:
    "border-transparent bg-transparent text-current hover:border-current/20 hover:bg-current/5",
};

const sizes: Record<ArtisanControlSize, string> = {
  sm: "min-h-11 px-4 py-2 text-xs",
  md: "min-h-11 px-5 py-2.5 text-sm",
  lg: "min-h-12 px-6 py-3 text-sm",
};

export function artisanControlClass({
  tone = "secondary",
  size = "md",
  className = "",
}: {
  tone?: ArtisanControlTone;
  size?: ArtisanControlSize;
  className?: string;
} = {}) {
  return [base, tones[tone], sizes[size], className].filter(Boolean).join(" ");
}

export const artisanSegmentGroupClass =
  "max-w-full items-stretch gap-1 overflow-x-auto rounded-full border border-[#d8c49b] bg-[#fffaf1] p-1 shadow-sm";

export function artisanSegmentClass(active: boolean, className = "") {
  return [
    "inline-flex min-h-11 shrink-0 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4c09a] focus-visible:ring-offset-2",
    active
      ? "bg-[#172a28] text-white shadow-sm"
      : "text-[#172a28] hover:bg-[#eee3d0]",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
