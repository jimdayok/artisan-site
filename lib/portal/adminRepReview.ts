import "server-only";

import {
  buildEmployeeDashboard,
  employeeRepOptions,
  type EmployeeDashboardModel,
} from "@/lib/portal/employeeDashboard";
import {
  loadNetSalesHistory,
  scopeNetSalesHistory,
} from "@/lib/portal/netSalesHistory";
import type { PortalStaffRole } from "@/lib/portal/portalRoles";

export type AdminRepMovement = {
  accountId: string;
  accountName: string;
  repCode: string;
  repName: string;
  previousMonthSales: number;
  previousPreviousMonthSales: number;
  change: number;
};

export type AdminNewCustomer = {
  accountId: string;
  accountName: string;
  repCode: string;
  repName: string;
  firstSalesMonth: string;
  firstSalesAmount: number;
};

export type AdminRepPerformance = {
  code: string;
  name: string;
  customerCount: number;
  currentMonthSales: number | null;
  previousMonthSales: number | null;
  previousPreviousMonthSales: number;
  currentVsPreviousGrowth: number | null;
  completedMonthGrowth: number | null;
  trailing13MonthSales: number | null;
  yearToDateSales: number | null;
  activeCustomers: number | null;
  decliningCustomers: number | null;
};

export type AdminRepReviewModel = {
  periodLabels: {
    current: string;
    previous: string;
    previousPrevious: string;
  };
  freshness: EmployeeDashboardModel["freshness"] | null;
  reps: AdminRepPerformance[];
  topUp: AdminRepMovement[];
  topDown: AdminRepMovement[];
  newCustomers: AdminNewCustomer[];
  sourceStatus: "ready" | "not-configured" | "error";
  sourceMessage: string;
};

function growth(current: number | null, previous: number | null) {
  if (current === null || previous === null || previous === 0) return null;
  return (current - previous) / Math.abs(previous);
}

function metricValue(model: EmployeeDashboardModel, key: keyof EmployeeDashboardModel["metrics"]) {
  const metric = model.metrics[key];
  return metric.state === "value" || metric.state === "confirmed-zero" ? metric.value : null;
}

export function buildAdminRepReview(adminRole: PortalStaffRole): AdminRepReviewModel {
  const options = employeeRepOptions();
  const models = options
    .map((option) => ({ option, model: buildEmployeeDashboard(adminRole, option.code) }))
    .filter(
      (entry): entry is { option: (typeof options)[number]; model: EmployeeDashboardModel } =>
        Boolean(entry.model)
    );
  const history = loadNetSalesHistory();
  const movements: AdminRepMovement[] = [];
  const newCustomers: AdminNewCustomer[] = [];

  for (const { option, model } of models) {
    for (const customer of model.customers) {
      movements.push({
        accountId: customer.acctId,
        accountName: customer.businessName,
        repCode: option.code,
        repName: option.label,
        previousMonthSales: customer.pmSales,
        previousPreviousMonthSales: customer.ppmSales,
        change: customer.pmSales - customer.ppmSales,
      });
    }

    const scopedHistory = scopeNetSalesHistory(
      history,
      option.code,
      model.customers.map((customer) => customer.acctId)
    );
    if (scopedHistory.status !== "ready") continue;

    const currentMonth = model.salesHistory.points.find((point) => point.currentMonth)?.month;
    const previousMonth = model.salesHistory.points.filter((point) => point.completedMonth).at(-1)?.month;
    const recentMonths = new Set([currentMonth, previousMonth].filter(Boolean));
    const rowsByAccount = new Map<string, typeof scopedHistory.rows>();

    for (const row of scopedHistory.rows) {
      const accountRows = rowsByAccount.get(row.account_id) ?? [];
      accountRows.push(row);
      rowsByAccount.set(row.account_id, accountRows);
    }

    for (const customer of model.customers) {
      const firstPositive = (rowsByAccount.get(customer.acctId.toUpperCase()) ?? [])
        .filter((row) => row.net_sales !== null && row.net_sales > 0)
        .sort((a, b) => a.month.localeCompare(b.month))[0];
      if (!firstPositive || !recentMonths.has(firstPositive.month)) continue;
      newCustomers.push({
        accountId: customer.acctId,
        accountName: customer.businessName,
        repCode: option.code,
        repName: option.label,
        firstSalesMonth: firstPositive.month,
        firstSalesAmount: firstPositive.net_sales ?? 0,
      });
    }
  }

  const periodSource = models[0]?.model;
  return {
    periodLabels: {
      current: periodSource?.periodDefinitions.cm ?? "Current month",
      previous: periodSource?.periodDefinitions.pm ?? "Previous month",
      previousPrevious: periodSource?.periodDefinitions.ppm ?? "Prior month",
    },
    freshness: periodSource?.freshness ?? null,
    reps: models.map(({ option, model }) => {
      const currentMonthSales = metricValue(model, "currentMonthNetSales");
      const previousMonthSales = metricValue(model, "previousMonthNetSales");
      const previousPreviousMonthSales = model.customers.reduce(
        (total, customer) => total + customer.ppmSales,
        0
      );
      return {
        code: option.code,
        name: option.label,
        customerCount: model.customers.length,
        currentMonthSales,
        previousMonthSales,
        previousPreviousMonthSales,
        currentVsPreviousGrowth: growth(currentMonthSales, previousMonthSales),
        completedMonthGrowth: growth(previousMonthSales, previousPreviousMonthSales),
        trailing13MonthSales: metricValue(model, "trailing13MonthNetSales"),
        yearToDateSales: metricValue(model, "yearToDateNetSales"),
        activeCustomers: metricValue(model, "activeCustomers"),
        decliningCustomers: metricValue(model, "decliningCustomers"),
      };
    }),
    topUp: movements
      .filter((item) => item.change > 0)
      .sort((a, b) => b.change - a.change)
      .slice(0, 5),
    topDown: movements
      .filter((item) => item.change < 0)
      .sort((a, b) => a.change - b.change)
      .slice(0, 5),
    newCustomers: newCustomers
      .sort(
        (a, b) =>
          b.firstSalesMonth.localeCompare(a.firstSalesMonth) ||
          b.firstSalesAmount - a.firstSalesAmount
      )
      .slice(0, 10),
    sourceStatus: history.status,
    sourceMessage:
      history.status === "ready"
        ? `Account-grain Net Sales history loaded through ${history.manifest.data_refresh_date}.`
        : history.message,
  };
}
