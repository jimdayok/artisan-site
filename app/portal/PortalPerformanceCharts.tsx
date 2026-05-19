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
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[#d8c49b] bg-[#fffaf1] p-5 shadow-[0_14px_38px_rgba(23,42,40,0.07)]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b7650]">
        {eyebrow}
      </p>
      <h3 className="mt-3 text-xl font-semibold tracking-[-0.025em] text-[#172a28]">
        {title}
      </h3>
      <div className="mt-5 h-72 min-w-0">{children}</div>
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

      <ChartFrame eyebrow="Order Mix" title="Current Month Mix">
        <div className="grid h-full grid-cols-3 gap-3">
          {[
            { title: "VSP", data: vspMix },
            { title: "Neurolens", data: nlMix },
            { title: "Sequel", data: sqlMix },
          ].map((chart) => (
            <div key={chart.title} className="min-w-0">
              <ResponsiveContainer width="100%" height="78%">
                <PieChart>
                  <Pie
                    data={chart.data}
                    dataKey="value"
                    nameKey="label"
                    innerRadius="58%"
                    outerRadius="82%"
                    stroke="none"
                  >
                    {chart.data.map((entry) => (
                      <Cell key={`${chart.title}-${entry.label}`} fill={entry.color} />
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
              <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#706759]">
                {chart.title}
              </p>
            </div>
          ))}
        </div>
      </ChartFrame>
    </div>
  );
}
