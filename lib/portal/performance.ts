import "server-only";

import {
  getPortalExportByAccountNumber,
  getPortalExportByAcctId,
  type PortalExportMonthlyValues,
  type PortalExportRecord,
} from "@/lib/portal/portalExportData";

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

type Period = keyof PortalExportMonthlyValues;

function addMonths(date: Date, months: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
}

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function resolveRecords(accountNumber: string) {
  const byAcctId = getPortalExportByAcctId(accountNumber);
  return byAcctId.length > 0
    ? byAcctId
    : getPortalExportByAccountNumber(accountNumber);
}

function sum(
  records: PortalExportRecord[],
  getValue: (record: PortalExportRecord) => number
) {
  return records.reduce((total, record) => total + getValue(record), 0);
}

function weightedRate(
  records: PortalExportRecord[],
  period: Period,
  getRate: (record: PortalExportRecord) => PortalExportMonthlyValues
) {
  const jobs = sum(records, (record) => record.jobs[period]);
  if (jobs <= 0) return 0;
  const weightedTotal = sum(
    records,
    (record) => getRate(record)[period] * record.jobs[period]
  );
  return weightedTotal / jobs;
}

function recordForPeriod(
  records: PortalExportRecord[],
  accountNumber: string,
  period: Period,
  month: string
): MonthlyPerformanceRecord {
  const lensPairs = sum(records, (record) => record.jobs[period]);
  const totalSales = sum(records, (record) => record.sales[period]);
  const vspShare = weightedRate(records, period, (record) => record.vspShare);
  const labRedoRate = weightedRate(
    records,
    period,
    (record) => record.labRedoPct
  );

  return {
    accountNumber,
    month,
    lensPairs,
    totalSales,
    privatePaySales: totalSales * Math.max(0, 1 - vspShare),
    arSales: 0,
    premiumPairs: sum(records, (record) => record.sqlJobs[period]),
    remakes: Math.round(lensPairs * labRedoRate),
  };
}

export function getPerformanceByAccountNumber(accountNumber: string) {
  const records = resolveRecords(accountNumber);
  if (records.length === 0) return [];

  const latestRefreshDate = records
    .map((record) => record.dataRefreshDate)
    .filter(Boolean)
    .sort()
    .at(-1);
  const refreshDate = latestRefreshDate
    ? new Date(`${latestRefreshDate}T00:00:00Z`)
    : new Date();
  const currentMonth = new Date(
    Date.UTC(refreshDate.getUTCFullYear(), refreshDate.getUTCMonth(), 1)
  );

  return [
    recordForPeriod(
      records,
      accountNumber,
      "ppm",
      monthKey(addMonths(currentMonth, -2))
    ),
    recordForPeriod(
      records,
      accountNumber,
      "pm",
      monthKey(addMonths(currentMonth, -1))
    ),
    recordForPeriod(records, accountNumber, "cm", monthKey(currentMonth)),
  ];
}

export function getLatestPerformanceByAccountNumber(accountNumber: string) {
  return getPerformanceByAccountNumber(accountNumber).at(-1);
}
