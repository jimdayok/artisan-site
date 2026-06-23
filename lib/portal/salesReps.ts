export const SALES_REP_LABELS: Record<string, string> = {
  HB: "Heather Branderhorst",
  OP: "Josh Opiol",
};

export function normalizeSalesRepCode(value: unknown) {
  return String(value ?? "").trim().toUpperCase();
}

export function salesRepLabel(value: unknown) {
  const code = normalizeSalesRepCode(value);
  return SALES_REP_LABELS[code] ?? "";
}

export function isAssignedSalesRepCode(value: unknown) {
  return Boolean(salesRepLabel(value));
}
