import "server-only";

const eligibilityThresholds: Record<string, number> = {
  PDX: 3950,
  IND: 20050,
  DEN: 10050,
};

function clean(value: unknown) {
  return String(value ?? "").trim();
}

export function normalizeOnboardingAccount(value: unknown) {
  return clean(value).toUpperCase().replace(/\.0$/, "");
}

export function isEligibleOnboardingAccountNumber(value: unknown) {
  const normalized = normalizeOnboardingAccount(value);
  const match = normalized.match(/\b(PDX|IND|DEN)[-\s]?(\d+)\b/);
  if (!match) return false;

  const prefix = match[1] as keyof typeof eligibilityThresholds;
  const numeric = Number(match[2]);
  return Number.isFinite(numeric) && numeric >= eligibilityThresholds[prefix];
}

export function isEligibleOnboardingAccount(values: Array<unknown>) {
  const normalizedValues = values.map(normalizeOnboardingAccount).filter(Boolean);
  if (normalizedValues.some(isEligibleOnboardingAccountNumber)) return true;

  const labPrefix = normalizedValues
    .map((value) => value.match(/\b(PDX|IND|DEN)\b/)?.[1] as keyof typeof eligibilityThresholds | undefined)
    .find(Boolean);
  if (!labPrefix) return false;

  return normalizedValues.some((value) => {
    const numeric = Number(value.match(/^\d+$/)?.[0] ?? "");
    return Number.isFinite(numeric) && numeric >= eligibilityThresholds[labPrefix];
  });
}

export function buildPortalOnboardingHref(accountNumber?: string) {
  if (!accountNumber) return "/portal/onboarding";

  const params = new URLSearchParams({ account: normalizeOnboardingAccount(accountNumber) });
  return `/portal/onboarding?${params.toString()}`;
}
