type AnimatedWordPanelProps = {
  word: string;
  eyebrow?: string;
  className?: string;
  tone?: "warm" | "dark";
};

export default function AnimatedWordPanel({
  word,
  eyebrow,
  className = "",
  tone = "warm",
}: AnimatedWordPanelProps) {
  const isDark = tone === "dark";

  return (
    <div
      className={`aln-word-panel relative isolate min-h-[430px] overflow-hidden rounded-[32px] ${
        isDark
          ? "bg-[#111827] shadow-[0_30px_90px_rgba(17,24,39,0.28)]"
          : "bg-[#fbf8f1] shadow-[0_30px_90px_rgba(73,48,28,0.18)]"
      } ${className}`}
      aria-label={word}
    >
      <div
        className={`absolute inset-0 ${
          isDark
            ? "bg-[radial-gradient(circle_at_30%_25%,rgba(158,230,216,0.18),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]"
            : "bg-[radial-gradient(circle_at_30%_25%,rgba(217,200,172,0.42),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.78),rgba(239,228,211,0.42))]"
        }`}
      />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-current/0 via-current/0 to-transparent" />
      <div className="absolute inset-0 flex items-center">
        <span
          className={`aln-contained-word font-alfons-script whitespace-nowrap text-[clamp(5.5rem,12vw,12rem)] leading-none ${
            isDark ? "text-white/16" : "text-[#b98a56]/18"
          }`}
        >
          {word}
        </span>
      </div>
      <div
        className={`pointer-events-none absolute inset-6 rounded-[26px] border ${
          isDark ? "border-white/10" : "border-[#d9c8ac]/55"
        }`}
      />
      {eyebrow ? (
        <div
          className={`absolute bottom-7 left-7 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] backdrop-blur ${
            isDark
              ? "border-white/12 bg-white/8 text-white/72"
              : "border-[#d9c8ac] bg-white/70 text-[#8a5a32]"
          }`}
        >
          {eyebrow}
        </div>
      ) : null}
    </div>
  );
}
