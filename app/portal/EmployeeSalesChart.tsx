"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EmployeeMonthlySalesPoint } from "@/lib/portal/employeeDashboard";

function money(value: number | null) {
  if (value === null) return "Unavailable";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function compactMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export default function EmployeeSalesChart({
  points,
  status,
  message,
}: {
  points: EmployeeMonthlySalesPoint[];
  status: "ready" | "not-configured" | "error";
  message: string;
}) {
  const [mode, setMode] = useState<"monthly" | "cumulative">("monthly");
  const [showComparison, setShowComparison] = useState(false);

  const chartData = useMemo(() => {
    return points.map((point, index) => {
      const currentPoints = points.slice(0, index + 1);
      const cumulative = currentPoints.reduce(
        (total, entry) => total + (entry.netSales ?? 0),
        0
      );
      const comparisonCumulative = currentPoints.reduce(
        (total, entry) => total + (entry.previousPeriodNetSales ?? 0),
        0
      );
      return {
        ...point,
        currentValue: mode === "cumulative" && point.netSales !== null ? cumulative : point.netSales,
        comparisonValue:
          mode === "cumulative" && point.previousPeriodNetSales !== null
            ? comparisonCumulative
            : point.previousPeriodNetSales,
      };
    });
  }, [mode, points]);

  if (status !== "ready" || !points.some((point) => point.netSales !== null)) {
    return (
      <div className="rounded-md border border-dashed border-[#c9af79] bg-[#fffaf1] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b7650]">
          Power BI configuration state
        </p>
        <h3 className="mt-2 text-xl font-semibold text-[#172a28]">
          Thirteen-month Net Sales history is not available yet
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#706759]">{message}</p>
        <p className="mt-3 text-sm leading-6 text-[#706759]">
          The dashboard will populate this chart only after the verified production model supplies
          account-grain monthly rows. No placeholder or inferred sales values are shown.
        </p>
      </div>
    );
  }

  const currentMonth = chartData.find((point) => point.currentMonth)?.label;
  const summary = chartData
    .map(
      (point) =>
        `${point.label}${point.currentMonth ? " current partial month" : " completed month"}: ${money(point.netSales)}`
    )
    .join("; ");

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" aria-label="Sales chart controls">
        <button
          type="button"
          onClick={() => setMode("monthly")}
          aria-pressed={mode === "monthly"}
          className={`min-h-10 rounded-full px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#172a28] ${
            mode === "monthly"
              ? "bg-[#172a28] text-white"
              : "border border-[#d8c49b] bg-white text-[#172a28]"
          }`}
        >
          Monthly sales
        </button>
        <button
          type="button"
          onClick={() => setMode("cumulative")}
          aria-pressed={mode === "cumulative"}
          className={`min-h-10 rounded-full px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#172a28] ${
            mode === "cumulative"
              ? "bg-[#172a28] text-white"
              : "border border-[#d8c49b] bg-white text-[#172a28]"
          }`}
        >
          Cumulative sales
        </button>
        <label className="ml-auto inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d8c49b] bg-white px-4 text-sm font-semibold text-[#172a28]">
          <input
            type="checkbox"
            checked={showComparison}
            onChange={(event) => setShowComparison(event.target.checked)}
            className="h-4 w-4 accent-[#172a28]"
          />
          Previous 13-month period
        </label>
      </div>

      <p className="sr-only" aria-live="polite">
        {summary}
      </p>

      <div className="mt-5 h-[320px] w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 12, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid stroke="#e8ddca" strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fill: "#706759", fontSize: 11 }} tickLine={false} />
            <YAxis
              tickFormatter={compactMoney}
              tick={{ fill: "#706759", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value) => money(typeof value === "number" ? value : null)}
              labelFormatter={(label) => `${label}${label === currentMonth ? " · Current month to date" : " · Completed month"}`}
              contentStyle={{
                border: "1px solid #d8c49b",
                borderRadius: 8,
                background: "#fffaf1",
                color: "#172a28",
              }}
            />
            <Legend />
            {currentMonth ? (
              <ReferenceArea
                x1={currentMonth}
                x2={currentMonth}
                fill="#c9a24f"
                fillOpacity={0.16}
                label={{ value: "MTD", fill: "#8b7650", fontSize: 11 }}
              />
            ) : null}
            <Line
              type="monotone"
              dataKey="currentValue"
              name={mode === "monthly" ? "Net Sales" : "Cumulative Net Sales"}
              stroke="#1f6b5c"
              strokeWidth={3}
              dot={{ r: 3, fill: "#1f6b5c" }}
              connectNulls={false}
            />
            {showComparison ? (
              <Line
                type="monotone"
                dataKey="comparisonValue"
                name="Previous period"
                stroke="#b58a45"
                strokeWidth={2}
                strokeDasharray="6 5"
                dot={false}
                connectNulls={false}
              />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mobile-scroll-row mt-5 overflow-x-auto rounded-md border border-[#e2d5bf] bg-white">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <caption className="sr-only">Exact monthly Net Sales values</caption>
          <thead>
            <tr className="border-b border-[#e2d5bf] bg-[#f8f1e6] text-[#172a28]">
              <th className="px-4 py-3">Month</th>
              <th className="px-4 py-3">Period status</th>
              <th className="px-4 py-3 text-right">Net Sales</th>
              {showComparison ? (
                <th className="px-4 py-3 text-right">Previous-period comparison</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.month} className="border-b border-[#eee5d7] last:border-0">
                <td className="px-4 py-3 font-semibold text-[#172a28]">{point.label}</td>
                <td className="px-4 py-3 text-[#706759]">
                  {point.currentMonth ? "Current month to date" : "Completed month"}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-[#172a28]">
                  {money(point.netSales)}
                </td>
                {showComparison ? (
                  <td className="px-4 py-3 text-right text-[#706759]">
                    {money(point.previousPeriodNetSales)}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
