"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type TrendPoint = {
  label: string;
  sales: number;
  jobs: number;
};

export type MixPoint = {
  label: string;
  value: number;
  color: string;
};

export type QualityPoint = {
  label: string;
  warranty: number;
  officeRedo: number;
  labRedo: number;
  nonAdapt: number;
};

export type MonthlyUsagePoint = {
  label: string;
  prior: number;
  previous: number;
  current: number;
};

export type BenchmarkPoint = {
  label: string;
  practice: number;
  average: number;
  top: number;
};

export type LocationPerformancePoint = {
  accountNumber: string;
  accountName: string;
  address: string;
  purchases: { ppm: number; pm: number; cm: number };
  jobs: { ppm: number; pm: number; cm: number };
};

export type LocationPerformanceTotals = {
  purchases: { ppm: number; pm: number; cm: number };
  jobs: { ppm: number; pm: number; cm: number };
};

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const locationColors = [
  "#1f8a70",
  "#2f5f9c",
  "#c7833f",
  "#8a5da8",
  "#c05268",
  "#477f8d",
  "#829b4b",
  "#a76b4f",
  "#5266a6",
];

function tooltipStyle() {
  return {
    background: "#fffdf8",
    border: "1px solid #d9c8a6",
    borderRadius: 6,
    color: "#142724",
    boxShadow: "0 18px 44px rgba(20,39,36,0.12)",
  };
}

function Panel({
  title,
  eyebrow,
  children,
  legend,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
  legend?: Array<{ label: string; color: string }>;
}) {
  return (
    <div className="min-w-0 rounded-md border border-[#d9c8a6] bg-[#fffdf8]/90 p-5 shadow-[0_20px_48px_rgba(20,39,36,0.08)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7a6b49]">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-xl font-semibold text-[#142724]">{title}</h3>
      {legend?.length ? <ChartKey items={legend} /> : null}
      <div className="mt-4 h-72 min-h-72 min-w-[240px] overflow-hidden">{children}</div>
    </div>
  );
}

function ChartFrame({ children }: { children: React.ReactNode }) {
  return <div className="h-full min-h-[240px] min-w-[240px]">{children}</div>;
}

function ChartKey({ items }: { items: Array<{ label: string; color: string }> }) {
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-2 text-xs font-semibold text-[#59635f]">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function cityState(address: string) {
  const match = address.match(/,\s*([^,]+),\s*([A-Z]{2})(?:\s+\d{5}(?:-\d{4})?)?\s*$/i);
  return match ? `${match[1].trim()}, ${match[2].toUpperCase()}` : "Location";
}

function locationLabel(location: LocationPerformancePoint) {
  return `${location.accountName} — ${location.accountNumber} — ${cityState(location.address)}`;
}

function valuesReconcile(
  locations: LocationPerformancePoint[],
  totals: LocationPerformanceTotals
) {
  return (["purchases", "jobs"] as const).every((metric) =>
    (["ppm", "pm", "cm"] as const).every((period) => {
      const locationTotal = locations.reduce(
        (sum, location) => sum + Number(location[metric][period] || 0),
        0
      );
      return Math.abs(locationTotal - Number(totals[metric][period] || 0)) <= 0.02;
    })
  );
}

function LocationComparisonChart({
  title,
  metric,
  locations,
}: {
  title: string;
  metric: "purchases" | "jobs";
  locations: LocationPerformancePoint[];
}) {
  const data = (["ppm", "pm", "cm"] as const).map((period) => ({
    period: period.toUpperCase(),
    ...Object.fromEntries(
      locations.map((location) => [location.accountNumber, location[metric][period]])
    ),
  }));
  const minimumWidth = Math.max(300, locations.length * 76);

  return (
    <article className="min-w-0 rounded-2xl border border-white/12 bg-white/[0.075] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d8c49b]">
            PPM · PM · CM
          </p>
          <h3 className="mt-1 text-xl font-semibold text-white">{title}</h3>
        </div>
        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/72">
          {locations.length === 1 && locations[0]?.accountNumber === "GROUP"
            ? "All locations combined"
            : `${locations.length} locations`}
        </span>
      </div>
      <div className="mt-5 overflow-x-auto pb-2">
        <div className="h-72" style={{ minWidth: minimumWidth }}>
          <ResponsiveContainer width="100%" height="100%" debounce={50}>
            <BarChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.11)" vertical={false} />
              <XAxis dataKey="period" tick={{ fill: "#f6efe2", fontSize: 12, fontWeight: 700 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.62)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={metric === "purchases" ? (value) => `$${Math.round(Number(value) / 1000)}k` : undefined}
              />
              <Tooltip
                formatter={(value, name) => [
                  metric === "purchases"
                    ? moneyFormatter.format(Number(value))
                    : numberFormatter.format(Number(value)),
                  locations.find((location) => location.accountNumber === String(name))
                    ? locationLabel(locations.find((location) => location.accountNumber === String(name))!)
                    : String(name),
                ]}
                contentStyle={tooltipStyle()}
              />
              {locations.map((location, index) => (
                <Bar
                  key={location.accountNumber}
                  dataKey={location.accountNumber}
                  fill={locationColors[index % locationColors.length]}
                  radius={[5, 5, 0, 0]}
                  maxBarSize={38}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </article>
  );
}

export function MultiLocationPerformanceSnapshot({
  locations,
  totals,
}: {
  locations: LocationPerformancePoint[];
  totals: LocationPerformanceTotals;
}) {
  const [view, setView] = useState<"group" | "locations">("group");

  if (locations.length <= 1) return null;

  const legend = locations.map((location, index) => ({
    label: locationLabel(location),
    color: locationColors[index % locationColors.length],
  }));
  const reconciled = valuesReconcile(locations, totals);
  const groupSeries: LocationPerformancePoint[] = [{
    accountNumber: "GROUP",
    accountName: "Entire Group",
    address: "All locations combined",
    purchases: totals.purchases,
    jobs: totals.jobs,
  }];
  const chartLocations = view === "group" ? groupSeries : locations;

  return (
    <section
      id="location-performance"
      className="relative isolate min-w-0 w-[calc(100vw-2.5rem)] max-w-[calc(100vw-2.5rem)] scroll-mt-24 overflow-hidden rounded-[1.8rem] border border-[#315f60]/35 bg-[#13211f] p-5 text-white shadow-[0_30px_90px_rgba(19,33,31,0.24)] sm:w-full sm:max-w-full sm:p-7 lg:col-span-3"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(47,95,156,0.35),transparent_34%),linear-gradient(135deg,#13211f_0%,#173f43_62%,#244c4e_100%)]" />
      <div className="min-w-0 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d8c49b]">
            Location Performance Snapshot
          </p>
          <h2 className="mt-2 max-w-full break-words text-3xl font-semibold tracking-[-0.04em] text-white sm:max-w-3xl sm:text-4xl">
            See how every practice contributes to the group.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/68">
            Each color represents one location across prior-prior month, prior month, and current month-to-date.
          </p>
        </div>
        <div className="flex w-fit rounded-full border border-[#d8c49b]/45 bg-black/15 p-1" aria-label="Choose group or location chart view">
          {(["group", "locations"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setView(option)}
              aria-pressed={view === option}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition ${
                view === option
                  ? "bg-[#d8c49b] text-[#13211f]"
                  : "text-[#ead9b7] hover:bg-white/10"
              }`}
            >
              {option === "group" ? "Entire Group" : "By Location"}
            </button>
          ))}
        </div>
      </div>

      {reconciled ? (
        <>
          <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-black/10 p-4 sm:grid-cols-3">
            {(["ppm", "pm", "cm"] as const).map((period) => (
              <div key={period}>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#d8c49b]">{period.toUpperCase()} group total</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {moneyFormatter.format(totals.purchases[period])} · {numberFormatter.format(totals.jobs[period])} jobs
                </p>
              </div>
            ))}
          </div>
          {view === "locations" ? <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 rounded-2xl border border-white/10 bg-black/10 p-4">
            {legend.map((item) => (
              <span key={item.label} className="inline-flex min-w-0 w-full items-center gap-2 break-words text-xs font-semibold text-white/78 sm:w-auto">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                {item.label}
              </span>
            ))}
          </div> : null}
          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            <LocationComparisonChart title={view === "group" ? "Entire Group Purchases" : "Purchases by Location"} metric="purchases" locations={chartLocations} />
            <LocationComparisonChart title={view === "group" ? "Entire Group Jobs" : "Jobs by Location"} metric="jobs" locations={chartLocations} />
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-2xl border border-[#d8c49b]/35 bg-white/[0.08] p-5">
          <p className="font-semibold text-white">Location comparison is updating.</p>
          <p className="mt-2 text-sm leading-6 text-white/68">
            The consolidated group totals are available, but the location-level detail is not complete enough to compare accurately yet.
          </p>
        </div>
      )}
    </section>
  );
}

export function PracticePerformanceScoreChart({
  score,
}: {
  score: number;
}) {
  const normalized = Math.max(0, Math.min(100, score));

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[280px]">
      <ChartFrame>
        <ResponsiveContainer width="100%" height="100%" debounce={50}>
          <RadialBarChart
            data={[{ value: normalized }]}
            innerRadius="72%"
            outerRadius="98%"
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" fill="#1f8a70" background={{ fill: "#e7ddcc" }} cornerRadius={16} />
          </RadialBarChart>
        </ResponsiveContainer>
      </ChartFrame>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-5xl font-semibold text-[#142724]">{Math.round(normalized)}</p>
        <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-[#7a6b49]">
          of 100
        </p>
      </div>
    </div>
  );
}

export function TrendsPerformanceCharts({
  trends,
  vspMix,
}: {
  trends: TrendPoint[];
  vspMix: MixPoint[];
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <Panel eyebrow="Purchases" title="Monthly Purchase Trend" legend={[{ label: "Completed months and current-month business-day projection", color: "#1f8a70" }]}>
        <ResponsiveContainer width="100%" height="100%" debounce={50}>
          <AreaChart data={trends} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#1f8a70" stopOpacity={0.42} />
                <stop offset="100%" stopColor="#1f8a70" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#eadfce" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#746b5f", fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "#746b5f", fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}k`} />
            <Tooltip formatter={(value) => moneyFormatter.format(Number(value))} contentStyle={tooltipStyle()} />
            <Area type="monotone" dataKey="sales" stroke="#1f8a70" strokeWidth={3} fill="url(#salesGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </Panel>

      <Panel eyebrow="Orders" title="Monthly Order Trend" legend={[{ label: "Completed months and current-month business-day projection", color: "#2f5f9c" }]}>
        <ResponsiveContainer width="100%" height="100%" debounce={50}>
          <AreaChart data={trends} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="jobsGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#2f5f9c" stopOpacity={0.38} />
                <stop offset="100%" stopColor="#2f5f9c" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#eadfce" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#746b5f", fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "#746b5f", fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip formatter={(value) => numberFormatter.format(Number(value))} contentStyle={tooltipStyle()} />
            <Area type="monotone" dataKey="jobs" stroke="#2f5f9c" strokeWidth={3} fill="url(#jobsGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </Panel>

      <Panel eyebrow="Previous Month Mix" title="VSP vs Non-VSP Orders" legend={vspMix.map((item) => ({ label: item.label, color: item.color }))}>
        <div className="relative h-full">
          <ResponsiveContainer width="100%" height="100%" debounce={50}>
            <PieChart>
            <Pie data={vspMix} dataKey="value" nameKey="label" innerRadius="62%" outerRadius="88%" stroke="none">
              {vspMix.map((entry) => (
                <Cell key={entry.label} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${Math.round(Number(value))}%`, name]} contentStyle={tooltipStyle()} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-4xl font-semibold text-[#142724]">
                {Math.round(vspMix[0]?.value ?? 0)}%
              </p>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7a6b49]">
                VSP
              </p>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

export function MixIntelligenceCharts({
  lensMix,
  materialMix,
  brandMix,
  programMix,
}: {
  lensMix: MixPoint[];
  materialMix: MixPoint[];
  brandMix: MixPoint[];
  programMix: MixPoint[];
}) {
  const chartGroups = [
    ["Lens Mix", lensMix],
    ["Material Mix", materialMix],
    ["Brand Mix", brandMix],
    ["Program Mix", programMix],
  ] as const;

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {chartGroups.map(([title, data]) => (
        <Panel key={title} eyebrow="Mix Intelligence" title={title}>
          <ResponsiveContainer width="100%" height="100%" debounce={50}>
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 18, left: 10, bottom: 4 }}>
              <CartesianGrid stroke="#eadfce" horizontal={false} />
              <XAxis type="number" hide domain={[0, 100]} />
              <YAxis type="category" dataKey="label" tick={{ fill: "#4f5a56", fontSize: 11 }} tickLine={false} axisLine={false} width={86} />
              <Tooltip formatter={(value) => [`${Math.round(Number(value))}%`, "Share"]} contentStyle={tooltipStyle()} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.label} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      ))}
    </div>
  );
}

export function ServiceExcellenceCharts({
  quality,
  orderVolume,
  turnaround,
}: {
  quality: QualityPoint[];
  orderVolume: TrendPoint[];
  turnaround: MonthlyUsagePoint[];
}) {
  const hasTurnaround = turnaround.some((point) => point.current > 0 || point.previous > 0 || point.prior > 0);

  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <Panel eyebrow="Service Timing" title="Turnaround Performance" legend={[{ label: "Average business days in lab production", color: "#1f8a70" }]}>
        {hasTurnaround ? (
          <ResponsiveContainer width="100%" height="100%" debounce={50}>
            <BarChart data={turnaround} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#eadfce" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#746b5f", fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#746b5f", fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} days`, "Avg turnaround"]} contentStyle={tooltipStyle()} />
              <Bar dataKey="current" name="Average Days" fill="#1f8a70" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col justify-center rounded-md border border-dashed border-[#d9c8a6] bg-[#f8f1e6]/70 p-5 text-center">
            <p className="text-sm font-semibold text-[#142724]">
              Turnaround data unavailable
            </p>
            <p className="mt-3 text-sm leading-6 text-[#6d746f]">
              Average turnaround appears when timing fields exist for this account.
            </p>
          </div>
        )}
      </Panel>

      <Panel eyebrow="Quality" title="Remake Intelligence" legend={[
        { label: "Warranty Remake %", color: "#c9a24f" },
        { label: "Office Remake %", color: "#c96856" },
        { label: "Non-Adapt %", color: "#8067aa" },
      ]}>
        <ResponsiveContainer width="100%" height="100%" debounce={50}>
          <BarChart data={quality} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#eadfce" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#746b5f", fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "#746b5f", fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `${numberFormatter.format(Number(value))}%`} />
            <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, ""]} contentStyle={tooltipStyle()} />
            <Bar dataKey="warranty" stackId="quality" fill="#c9a24f" radius={[4, 4, 0, 0]} />
            <Bar dataKey="officeRedo" stackId="quality" fill="#c96856" radius={[4, 4, 0, 0]} />
            <Bar dataKey="nonAdapt" stackId="quality" fill="#8067aa" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel eyebrow="Order Volume" title="Orders Per Day Trend" legend={[{ label: "Actual orders per day, including current month-to-date", color: "#8067aa" }]}>
        <ResponsiveContainer width="100%" height="100%" debounce={50}>
          <AreaChart data={orderVolume} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#eadfce" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#746b5f", fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "#746b5f", fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip formatter={(value) => numberFormatter.format(Number(value))} contentStyle={tooltipStyle()} />
            <Area type="monotone" dataKey="jobs" stroke="#8067aa" strokeWidth={3} fill="#8067aa22" />
          </AreaChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}

export function MonthlyUsageCharts({
  title,
  eyebrow,
  data,
  valueType = "count",
  monthLabels,
  horizontal = false,
}: {
  title: string;
  eyebrow: string;
  data: MonthlyUsagePoint[];
  valueType?: "count" | "percent";
  monthLabels: { prior: string; previous: string; current: string };
  horizontal?: boolean;
}) {
  const formatter =
    valueType === "percent"
      ? (value: number) => `${numberFormatter.format(Number(value))}%`
      : (value: number) => numberFormatter.format(Number(value));

  return (
    <Panel eyebrow={eyebrow} title={title} legend={[
      { label: monthLabels.prior, color: "#d8c49b" },
      { label: monthLabels.previous, color: "#2f5f9c" },
      { label: `${monthLabels.current} MTD`, color: "#1f8a70" },
    ]}>
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ top: 8, right: 12, left: horizontal ? 18 : 0, bottom: 0 }}>
          <CartesianGrid stroke="#eadfce" vertical={!horizontal} horizontal={horizontal} />
          {horizontal ? (
            <>
              <XAxis type="number" tick={{ fill: "#746b5f", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(value) => formatter(Number(value))} />
              <YAxis type="category" dataKey="label" width={90} tick={{ fill: "#4f5a56", fontSize: 11 }} tickLine={false} axisLine={false} />
            </>
          ) : (
            <>
              <XAxis dataKey="label" tick={{ fill: "#746b5f", fontSize: 11 }} tickLine={false} axisLine={false} interval={0} />
              <YAxis tick={{ fill: "#746b5f", fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => formatter(Number(value))} />
            </>
          )}
          <Tooltip formatter={(value) => formatter(Number(value))} contentStyle={tooltipStyle()} />
          <Bar dataKey="prior" name={monthLabels.prior} fill="#d8c49b" radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} />
          <Bar dataKey="previous" name={monthLabels.previous} fill="#2f5f9c" radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} />
          <Bar dataKey="current" name={`${monthLabels.current} MTD`} fill="#1f8a70" radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  );
}

export function BenchmarkingChart({ data }: { data: BenchmarkPoint[] }) {
  return (
    <div className="h-80 min-w-0">
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <BarChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#eadfce" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#746b5f", fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: "#746b5f", fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle()} />
          <Bar dataKey="practice" name="Your Practice" fill="#1f8a70" radius={[4, 4, 0, 0]} />
          <Bar dataKey="average" name="Average Practice at Lab" fill="#c9a24f" radius={[4, 4, 0, 0]} />
          <Bar dataKey="top" name="Top 25%" fill="#2f5f9c" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
