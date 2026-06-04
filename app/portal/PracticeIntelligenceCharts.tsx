"use client";

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

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

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
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-md border border-[#d9c8a6] bg-[#fffdf8]/90 p-5 shadow-[0_20px_48px_rgba(20,39,36,0.08)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7a6b49]">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-xl font-semibold text-[#142724]">{title}</h3>
      <div className="mt-5 h-72 min-w-0">{children}</div>
    </div>
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
      <ResponsiveContainer width="100%" height="100%">
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
      <Panel eyebrow="Revenue" title="Monthly Revenue Trend">
        <ResponsiveContainer width="100%" height="100%">
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

      <Panel eyebrow="Orders" title="Monthly Job Trend">
        <ResponsiveContainer width="100%" height="100%">
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

      <Panel eyebrow="Mix" title="VSP Mix Trend">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={vspMix} dataKey="value" nameKey="label" innerRadius="62%" outerRadius="88%" stroke="none">
              {vspMix.map((entry) => (
                <Cell key={entry.label} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${Math.round(Number(value))}%`, name]} contentStyle={tooltipStyle()} />
          </PieChart>
        </ResponsiveContainer>
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
          <ResponsiveContainer width="100%" height="100%">
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
      <Panel eyebrow="Service Timing" title="Turnaround Performance">
        {hasTurnaround ? (
          <ResponsiveContainer width="100%" height="100%">
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
              Turnaround Data Coming Soon
            </p>
            <p className="mt-3 text-sm leading-6 text-[#6d746f]">
              Average turnaround appears when timing fields exist for this account.
            </p>
          </div>
        )}
      </Panel>

      <Panel eyebrow="Quality" title="Quality Metrics">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={quality} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#eadfce" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#746b5f", fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "#746b5f", fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, ""]} contentStyle={tooltipStyle()} />
            <Bar dataKey="warranty" stackId="quality" fill="#c9a24f" radius={[4, 4, 0, 0]} />
            <Bar dataKey="officeRedo" stackId="quality" fill="#c96856" radius={[4, 4, 0, 0]} />
            <Bar dataKey="labRedo" stackId="quality" fill="#2f5f9c" radius={[4, 4, 0, 0]} />
            <Bar dataKey="nonAdapt" stackId="quality" fill="#8067aa" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel eyebrow="Order Volume" title="Monthly Order Trend">
        <ResponsiveContainer width="100%" height="100%">
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
}: {
  title: string;
  eyebrow: string;
  data: MonthlyUsagePoint[];
  valueType?: "count" | "percent";
}) {
  const formatter =
    valueType === "percent"
      ? (value: number) => `${numberFormatter.format(Number(value))}%`
      : (value: number) => numberFormatter.format(Number(value));

  return (
    <Panel eyebrow={eyebrow} title={title}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#eadfce" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#746b5f", fontSize: 11 }} tickLine={false} axisLine={false} interval={0} />
          <YAxis tick={{ fill: "#746b5f", fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => formatter(Number(value))} />
          <Tooltip formatter={(value) => formatter(Number(value))} contentStyle={tooltipStyle()} />
          <Bar dataKey="prior" name="Prior Previous" fill="#d8c49b" radius={[4, 4, 0, 0]} />
          <Bar dataKey="previous" name="Previous" fill="#2f5f9c" radius={[4, 4, 0, 0]} />
          <Bar dataKey="current" name="Current" fill="#1f8a70" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  );
}

export function BenchmarkingChart({ data }: { data: BenchmarkPoint[] }) {
  return (
    <div className="h-80 min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#eadfce" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#746b5f", fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: "#746b5f", fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle()} />
          <Bar dataKey="practice" name="Your Practice" fill="#1f8a70" radius={[4, 4, 0, 0]} />
          <Bar dataKey="average" name="Network Average" fill="#c9a24f" radius={[4, 4, 0, 0]} />
          <Bar dataKey="top" name="Top 25%" fill="#2f5f9c" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
