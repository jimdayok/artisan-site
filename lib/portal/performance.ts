import "server-only";

import {
  getPortalDashboardV1ByAccount,
  type PortalDashboardV1Account,
  type PortalDashboardV1MonthlyNumber,
} from "@/lib/portal/dashboardV1";

export type MonthlyPerformanceRecord = {
  accountNumber: string;
  month: string;
  lensPairs: number;
  totalSales: number;
  privatePaySales: number;
  arSales: number;
  premiumPairs: number;
  remakes: number;
};

type Period = keyof PortalDashboardV1MonthlyNumber;

function addMonths(date: Date, months: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
}

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function recordForPeriod(
  account: PortalDashboardV1Account,
  accountNumber: string,
  period: Period,
  month: string
): MonthlyPerformanceRecord {
  const lensPairs = account.purchase_summary.jobs[period];
  const totalSales = account.purchase_summary.sales[period];
  const vspJobs = account.vsp_private_pay_mix.vsp_jobs[period];
  const vspShare = lensPairs > 0 ? vspJobs / lensPairs : 0;
  const labRedoRate = account.quality_metrics?.lab_redo_pct[period] ?? 0;

  return {
    accountNumber,
    month,
    lensPairs,
    totalSales,
    privatePaySales: totalSales * Math.max(0, 1 - vspShare),
    arSales: 0,
    premiumPairs: account.product_mix.sql_jobs[period],
    remakes: Math.round(lensPairs * labRedoRate),
  };
}

export function getPerformanceByAccountNumber(accountNumber: string) {
  const dashboard = getPortalDashboardV1ByAccount(accountNumber);
  if (dashboard.status !== "ok" || !dashboard.account) return [];

  const refreshDateValue =
    dashboard.manifest?.data_refresh_date || dashboard.account.data_refresh_date;
  const refreshDate = refreshDateValue
    ? new Date(`${refreshDateValue}T00:00:00Z`)
    : new Date();
  const currentMonth = new Date(
    Date.UTC(refreshDate.getUTCFullYear(), refreshDate.getUTCMonth(), 1)
  );

  return [
    recordForPeriod(
      dashboard.account,
      accountNumber,
      "ppm",
      monthKey(addMonths(currentMonth, -2))
    ),
    recordForPeriod(
      dashboard.account,
      accountNumber,
      "pm",
      monthKey(addMonths(currentMonth, -1))
    ),
    recordForPeriod(
      dashboard.account,
      accountNumber,
      "cm",
      monthKey(currentMonth)
    ),
  ];
}

export function getLatestPerformanceByAccountNumber(accountNumber: string) {
  return getPerformanceByAccountNumber(accountNumber).at(-1);
}
