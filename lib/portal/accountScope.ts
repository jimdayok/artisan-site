export function parseLinkedAccountNumbers(value?: string) {
  return [
    ...new Set(
      String(value || "")
        .split(/[,;|]/)
        .map((accountNumber) => accountNumber.trim())
        .filter(Boolean)
    ),
  ];
}

export function isGroupAcctId(value?: string) {
  const acctId = String(value || "").trim().toUpperCase();
  if (!acctId) return false;
  if (acctId.endsWith("-ALN") || acctId === "ALN") return true;

  return !acctId.split(/[-_]/).some((segment) => /^\d{4,}$/.test(segment));
}

export function shouldShowAccountDrillDown({
  acctId,
  allAccountNumbers,
}: {
  acctId?: string;
  allAccountNumbers?: string;
}) {
  return (
    isGroupAcctId(acctId) && parseLinkedAccountNumbers(allAccountNumbers).length > 1
  );
}
