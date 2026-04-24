const labLocations = [
  {
    city: "Portland, OR",
    x: 117,
    y: 207,
    labelX: 62,
    labelY: 176,
  },
  {
    city: "Denver, CO",
    x: 426,
    y: 315,
    labelX: 383,
    labelY: 355,
  },
  {
    city: "Indianapolis, IN",
    x: 662,
    y: 276,
    labelX: 686,
    labelY: 246,
  },
];

export default function NetworkMap() {
  const [portland, denver, indianapolis] = labLocations;

  return (
    <section
      id="network-map"
      data-theme="dark"
      className="relative overflow-hidden border-y border-white/10 bg-[#0f0f0f] px-5 py-16 text-white md:px-8 md:py-20 lg:px-10"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_32%_26%,rgba(212,192,154,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent_42%)]" />
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

        <div className="relative mx-auto mt-10 aspect-[1.62/1] max-w-5xl overflow-hidden border border-white/10 bg-[#121212] shadow-[0_28px_90px_rgba(0,0,0,0.35)] md:mt-12">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.026)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.026)_1px,transparent_1px)] bg-[size:76px_76px] opacity-30" />

          <svg
            viewBox="0 0 1000 620"
            role="img"
            aria-label="United States map showing Artisan Lab Network locations in Portland, Denver, and Indianapolis"
            className="absolute inset-0 h-full w-full"
          >
            <defs>
              <filter id="network-node-glow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="7" result="blur" />
                <feColorMatrix
                  in="blur"
                  type="matrix"
                  values="1 0 0 0 0.83 0 1 0 0 0.75 0 0 1 0 0.55 0 0 0 0.9 0"
                />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <path
              d="M79 207 94 180 118 171 138 142 182 127 222 116 263 125 308 111 351 118 393 108 443 121 490 119 531 130 576 128 626 139 672 134 719 147 756 144 788 163 824 166 841 185 873 195 889 220 875 245 847 250 840 278 816 296 797 326 761 332 741 353 743 379 718 391 692 374 672 392 642 390 611 405 572 407 541 424 516 454 493 491 464 501 441 479 421 441 389 430 359 436 319 426 287 433 259 414 226 414 201 391 176 391 153 368 122 362 96 343 85 305 61 282 69 245 54 224 79 207Z"
              fill="rgba(255,255,255,0.24)"
              stroke="rgba(255,255,255,0.28)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M760 333 778 353 799 377 817 418 806 454 786 424 776 389 747 366Z"
              fill="rgba(255,255,255,0.22)"
              stroke="rgba(255,255,255,0.24)"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M827 158 851 139 881 129 910 132 923 148 908 166 881 167 855 174Z"
              fill="rgba(255,255,255,0.18)"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M141 384 166 409 195 417 222 444 259 457 292 455 323 471 360 466 393 479"
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1.5"
            />

            <path
              d={`M${portland.x} ${portland.y} C250 226 300 278 ${denver.x} ${denver.y}`}
              fill="none"
              stroke="rgba(212,192,154,0.62)"
              strokeLinecap="round"
              strokeWidth="2"
            />
            <path
              d={`M${denver.x} ${denver.y} C502 287 575 271 ${indianapolis.x} ${indianapolis.y}`}
              fill="none"
              stroke="rgba(212,192,154,0.62)"
              strokeLinecap="round"
              strokeWidth="2"
            />

            {labLocations.map((location) => (
              <g key={location.city}>
                <circle
                  className="aln-map-svg-pulse"
                  cx={location.x}
                  cy={location.y}
                  r="18"
                  fill="none"
                  stroke="rgba(212,192,154,0.55)"
                  strokeWidth="2"
                />
                <circle
                  cx={location.x}
                  cy={location.y}
                  r="7"
                  fill="#d4c09a"
                  stroke="#fff3d7"
                  strokeWidth="2"
                  filter="url(#network-node-glow)"
                />
                <line
                  x1={location.x}
                  y1={location.y}
                  x2={location.labelX}
                  y2={location.labelY}
                  stroke="rgba(255,255,255,0.22)"
                  strokeWidth="1"
                />
                <text
                  x={location.labelX}
                  y={location.labelY}
                  fill="rgba(255,255,255,0.86)"
                  fontSize="16"
                  fontWeight="700"
                  textAnchor={location.labelX < location.x ? "end" : "start"}
                >
                  {location.city}
                </text>
              </g>
            ))}
          </svg>
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
