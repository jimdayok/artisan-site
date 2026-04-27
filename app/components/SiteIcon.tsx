type SiteIconProps = {
  src: string;
  tone?: "gold" | "cream" | "charcoal";
  size?: "sm" | "md" | "lg";
  className?: string;
  imgClassName?: string;
};

export default function SiteIcon({
  src,
  tone = "gold",
  size = "md",
  className = "",
  imgClassName = "",
}: SiteIconProps) {
  const sizeClass =
    size === "lg" ? "h-9 w-9" : size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const toneClass =
    tone === "cream"
      ? "[filter:brightness(0)_saturate(100%)_invert(86%)_sepia(15%)_saturate(545%)_hue-rotate(356deg)_brightness(91%)_contrast(89%)]"
      : tone === "charcoal"
        ? "[filter:brightness(0)_saturate(100%)_invert(9%)_sepia(11%)_saturate(663%)_hue-rotate(337deg)_brightness(95%)_contrast(90%)]"
        : "[filter:brightness(0)_saturate(100%)_invert(53%)_sepia(17%)_saturate(815%)_hue-rotate(358deg)_brightness(90%)_contrast(88%)]";

  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-2xl border transition duration-300 ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className={`${sizeClass} object-contain opacity-90 transition duration-300 group-hover:scale-105 ${toneClass} ${imgClassName}`}
      />
    </span>
  );
}
