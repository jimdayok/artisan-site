type SectionIntroProps = {
  title: string;
  body?: string;
  eyebrow?: string;
  size?: "hero" | "standard";
  theme?: "dark" | "light";
};

export default function SectionIntro({
  title,
  body,
  eyebrow,
  size = "standard",
  theme = "dark",
}: SectionIntroProps) {
  const isHero = size === "hero";
  const Heading = isHero ? "h1" : "h2";
  const isLight = theme === "light";

  return (
    <div
      className={[
        "mx-auto max-w-4xl text-center",
        isHero
          ? "px-6"
          : isLight
            ? "rounded-lg border border-black/10 bg-white/65 px-6 py-10 shadow-2xl shadow-black/10 backdrop-blur-md sm:px-10"
            : "rounded-lg border border-white/10 bg-black/25 px-6 py-10 shadow-2xl shadow-black/20 backdrop-blur-md sm:px-10",
      ].join(" ")}
    >
      {eyebrow ? (
        <p
          className={[
            "mb-4 text-xs font-semibold uppercase tracking-[0.3em]",
            isLight ? "text-[#8d7650]" : "text-[#d6c3a1]",
          ].join(" ")}
        >
          {eyebrow}
        </p>
      ) : null}
      <Heading
        className={[
          "text-balance font-normal leading-tight",
          isLight ? "text-black" : "text-white",
          isHero ? "text-5xl sm:text-6xl md:text-7xl" : "text-4xl sm:text-5xl",
        ].join(" ")}
      >
        {title}
      </Heading>
      {body ? (
        <p
          className={[
            "mx-auto mt-6 max-w-3xl text-pretty leading-8",
            isLight ? "text-black/70" : "text-white/78",
            isHero ? "text-xl sm:text-2xl" : "text-base sm:text-lg",
          ].join(" ")}
        >
          {body}
        </p>
      ) : null}
    </div>
  );
}
