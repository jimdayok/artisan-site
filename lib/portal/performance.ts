import "server-only";

import { readPrivatePortalCsv } from "@/lib/portal/privateCsv";

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

function toNumber(value: string) {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

export const monthlyPerformanceRecords: MonthlyPerformanceRecord[] =
  readPrivatePortalCsv("monthly-performance.csv")
    .map((row) => ({
      accountNumber: row.account_number?.trim() ?? "",
      month: row.month?.trim() ?? "",
      lensPairs: toNumber(row.lens_pairs ?? ""),
      totalSales: toNumber(row.total_sales ?? ""),
      privatePaySales: toNumber(row.private_pay_sales ?? ""),
      arSales: toNumber(row.ar_sales ?? ""),
      premiumPairs: toNumber(row.premium_pairs ?? ""),
      remakes: toNumber(row.remakes ?? ""),
    }))
    .filter((record) => record.accountNumber && record.month)
    .sort((a, b) => a.month.localeCompare(b.month));

export function getPerformanceByAccountNumber(accountNumber: string) {
  const normalizedAccountNumber = accountNumber.trim();

  return monthlyPerformanceRecords.filter(
    (record) => record.accountNumber === normalizedAccountNumber
  );
}

export function getLatestPerformanceByAccountNumber(accountNumber: string) {
  const records = getPerformanceByAccountNumber(accountNumber);

  return records.at(-1);
}
