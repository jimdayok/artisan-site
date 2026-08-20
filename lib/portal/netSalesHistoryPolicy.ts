type AccountNetSalesRow = {
  account_id: string;
  rep_code: string;
};

function normalize(value: unknown) {
  return String(value ?? "").trim().toUpperCase();
}

export function scopeAccountNetSalesRows<T extends AccountNetSalesRow>(
  rows: T[],
  repCode: string,
  allowedAccountIds: Iterable<string>
) {
  const normalizedRepCode = normalize(repCode);
  const allowed = new Set(
    [...allowedAccountIds].map((value) => normalize(value)).filter(Boolean)
  );

  if (!normalizedRepCode || allowed.size === 0) return [];

  return rows.filter(
    (row) =>
      normalize(row.rep_code) === normalizedRepCode &&
      allowed.has(normalize(row.account_id))
  );
}
