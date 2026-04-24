const labLocations = [
  {
    city: "Portland, OR",
    position: "left-[12%] top-[31%]",
  },
  {
    city: "Denver, CO",
    position: "left-[42%] top-[52%]",
  },
  {
    city: "Indianapolis, IN",
    position: "left-[66%] top-[47%]",
  },
];

export default function NetworkMap() {
  return (
    <section
      id="network-map"
      data-theme="dark"
      className="relative overflow-hidden border-y border-white/10 bg-[#0f0f0f] px-5 py-16 text-white md:px-8 md:py-20 lg:px-10"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_32%_26%,rgba(212,192,154,0.13),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent_42%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d4c09a]">
            National Footprint
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
            A Network Built Across the Country
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/68 md:text-lg">
            Three labs. One aligned system. Built to support independent practices
            at scale.
          </p>
        </div>

        <div className="relative mx-auto mt-10 aspect-[1.55/1] max-w-5xl overflow-hidden border border-white/10 bg-[#141414] shadow-[0_28px_90px_rgba(0,0,0,0.35)] md:mt-12">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-25" />

          <svg
            viewBox="0 0 900 560"
            aria-hidden="true"
            className="absolute inset-[8%] h-[84%] w-[84%] translate-x-[4%] text-white/10"
          >
            <path
              d="M94 214 137 181l62 8 27-22 74 15 42-21 59 18 67-14 77 24 57-3 62 34 70 2 47 42-12 51 31 39-57 41-83 4-40 36-86-16-52 25-73-18-68 13-56-30-81 14-52-29-63 3-34-52 28-41-22-51z"
              fill="currentColor"
            />
            <path
              d="M112 238 202 220l96 28 110-31 119 35 105-14 123 73"
              fill="none"
              stroke="rgba(212,192,154,0.24)"
              strokeWidth="2"
            />
            <path
              d="M225 327 372 304l112 40 156-32"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1.5"
            />
          </svg>

          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full"
          >
            <path
              d="M14 34 C25 42, 33 49, 43 55 S58 55, 68 50"
              fill="none"
              stroke="rgba(212,192,154,0.62)"
              strokeWidth="0.45"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M43 55 C52 47, 59 45, 68 50"
              fill="none"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="0.35"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {labLocations.map((location) => (
            <div
              key={location.city}
              className={`absolute ${location.position} z-10 -translate-x-1/2 -translate-y-1/2`}
            >
              <div className="group relative flex items-center gap-3">
                <span className="aln-map-pulse absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d4c09a]/50" />
                <span className="relative h-4 w-4 rounded-full border border-[#fff3d7] bg-[#d4c09a] shadow-[0_0_26px_rgba(212,192,154,0.9)]" />
                <span className="whitespace-nowrap border border-white/10 bg-black/50 px-3 py-1.5 text-xs font-semibold text-white/86 shadow-[0_10px_35px_rgba(0,0,0,0.28)] backdrop-blur-md transition group-hover:border-[#d4c09a]/50 group-hover:text-white">
                  {location.city}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-7 max-w-3xl text-center">
          <p className="text-sm font-semibold tracking-[0.08em] text-white/82">
            Portland, OR · Denver, CO · Indianapolis, IN
          </p>
          <p className="mt-2 text-sm text-[#d4c09a]">
            Supporting over 60 practice groups nationwide
          </p>
        </div>
      </div>
    </section>
  );
}
