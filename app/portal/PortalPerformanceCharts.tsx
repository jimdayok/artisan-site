"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TrendDatum = {
  label: string;
  purchases: number;
  rxOrders: number;
  rxOrdersPerDay: number;
};

type MixDatum = {
  label: string;
  value: number;
  color: string;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

function ChartFrame({
  title,
  eyebrow,
  children,
  contentClassName = "h-72",
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
  contentClassName?: string;
}) {
  return (
    <div className="relative overflow-hidden border border-[#d8c49b] bg-[#fffaf1] p-5 shadow-[0_14px_38px_rgba(23,42,40,0.07)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-[#b89a61]" />
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b7650]">
        {eyebrow}
      </p>
      <h3 className="mt-3 text-xl font-semibold tracking-[-0.025em] text-[#172a28]">
        {title}
      </h3>
      <div className={`mt-5 min-w-0 ${contentClassName}`}>{children}</div>
    </div>
  );
}

function MixDonut({ title, data }: { title: string; data: MixDatum[] }) {
  const active = data[0]?.value ?? 0;

  return (
    <div className="min-w-0 border border-[#e3d6bd] bg-white/52 p-3">
      <div className="h-44 sm:h-36 xl:h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="58%"
              outerRadius="82%"
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={`${title}-${entry.label}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                `${Math.round(Number(value))}%`,
                name,
              ]}
              contentStyle={{
                background: "#fffaf1",
                border: "1px solid #d8c49b",
                borderRadius: 0,
                color: "#172a28",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-center">
        <p className="text-2xl font-semibold tracking-[-0.035em] text-[#172a28]">
          {Math.round(active)}%
        </p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#706759]">
          {title}
        </p>
      </div>
    </div>
  );
}

export function PortalPerformanceCharts({
  trends,
  vspMix,
  nlMix,
  sqlMix,
}: {
  trends: TrendDatum[];
  vspMix: MixDatum[];
  nlMix: MixDatum[];
  sqlMix: MixDatum[];
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.35fr_0.9fr]">
      <ChartFrame eyebrow="Trend Comparison" title="Purchases and Rx Orders">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trends} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#e3d6bd" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#706759", fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "#706759", fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(23,42,40,0.06)" }}
              formatter={(value, name) => {
                if (name === "purchases") return [currencyFormatter.format(Number(value)), "Purchases"];
                if (name === "rxOrders") return [numberFormatter.format(Number(value)), "Rx Orders"];

                return [numberFormatter.format(Number(value)), "Rx Orders Per Day"];
              }}
              contentStyle={{
                background: "#fffaf1",
                border: "1px solid #d8c49b",
                borderRadius: 0,
                color: "#172a28",
              }}
            />
            <Bar dataKey="purchases" fill="#172a28" radius={[2, 2, 0, 0]} />
            <Bar dataKey="rxOrders" fill="#b89a61" radius={[2, 2, 0, 0]} />
            <Bar dataKey="rxOrdersPerDay" fill="#315f58" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame
        eyebrow="Order Mix"
        title="Current Month Mix"
        contentClassName="min-h-72"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { title: "VSP", data: vspMix },
            { title: "Neurolens", data: nlMix },
            { title: "Sequel", data: sqlMix },
          ].map((chart) => <MixDonut key={chart.title} {...chart} />)}
        </div>
      </ChartFrame>
    </div>
  );
}
