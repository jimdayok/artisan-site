type RingsAccentProps = {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center-right";
  size?: "sm" | "md" | "lg";
  opacity?: string;
  className?: string;
};

export default function RingsAccent({
  position = "bottom-right",
  size = "md",
  opacity = "opacity-[0.06]",
  className = "",
}: RingsAccentProps) {
  const positionClass =
    position === "top-left"
      ? "-left-28 -top-24"
      : position === "top-right"
        ? "-right-28 -top-24"
        : position === "bottom-left"
          ? "-bottom-36 -left-28"
          : position === "center-right"
            ? "-right-32 top-1/2 -translate-y-1/2"
            : "-bottom-36 -right-28";

  const sizeClass =
    size === "lg" ? "h-[560px] w-[560px]" : size === "sm" ? "h-[340px] w-[340px]" : "h-[460px] w-[460px]";

  return (
    <div
      className={`pointer-events-none absolute bg-contain bg-center bg-no-repeat ${positionClass} ${sizeClass} ${opacity} ${className}`}
      style={{ backgroundImage: "url('/Rings.png')" }}
      aria-hidden="true"
    />
  );
}
