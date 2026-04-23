import type { ReactNode } from "react";

type BackgroundSectionProps = {
  backgroundImage: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  id?: string;
  minHeight?: "screen" | "content";
  overlayClassName?: string;
  theme?: "dark" | "light";
};

export default function BackgroundSection({
  backgroundImage,
  children,
  className = "",
  contentClassName = "",
  id,
  minHeight = "content",
  overlayClassName = "bg-black/45",
  theme = "dark",
}: BackgroundSectionProps) {
  const minHeightClass = minHeight === "screen" ? "min-h-svh" : "";

  return (
    <section
      id={id}
      data-theme={theme}
      className={[
        "relative isolate overflow-hidden bg-cover bg-center bg-no-repeat bg-fixed",
        minHeightClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      <div className={["pointer-events-none absolute inset-0 -z-10", overlayClassName].join(" ")} />
      <div className={["relative z-20", contentClassName].filter(Boolean).join(" ")}>
        {children}
      </div>
    </section>
  );
}
