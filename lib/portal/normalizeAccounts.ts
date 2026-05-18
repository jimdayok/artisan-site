import "server-only";

import {
  getPortalCustomerTypeInfo,
  type PortalCustomerTypeCode,
} from "@/lib/portal/customerTypes";
import type {
  PortalWorkbookAccount,
  PortalWorkbookPerson,
} from "@/lib/portal/workbookAccountData";

const TYPE_PRIORITY: PortalCustomerTypeCode[] = [
  "PART",
  "PMP",
  "ACQU",
  "NL",
  "GENL",
];

const SUM_FIELDS = [
  "cmSales",
  "pmSales",
  "ppmSales",
  "cmJobs",
  "pmJobs",
  "ppmJobs",
  "cmNlJobs",
  "pmNlJobs",
  "ppmNlJobs",
  "cmSqlJobs",
  "pmSqlJobs",
  "ppmSqlJobs",
  "cmVspJobs",
  "pmVspJobs",
  "ppmVspJobs",
] as const;

const DESCRIPTIVE_FIELDS = [
  "accountName",
  "division",
  "salesRep",
  "primaryPalPrivatePay",
  "primaryPalVsp",
  "lastLabName",
  "fullAddress",
  "phoneNumber",
  "state",
  "zipCode",
  "modernPkgUsage",
  "modernFrmUsage",
  "chemClipUsage",
  "specCheckUsage",
  "tokaiUsage",
  "tier",
] as const;

function uniqueList<T extends string>(values: T[]) {
  return [...new Set(values.filter(Boolean))];
}

export function normalizeAccountNumber(value: unknown) {
  if (value === null || value === undefined) return "";

  const raw =
    typeof value === "number" && Number.isFinite(value)
      ? String(Math.trunc(value))
      : String(value).trim().replace(/\.0$/, "");

  return raw.replace(/^0+(?=\d)/, "");
}

export function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizedName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function isNonEmpty(value: string) {
  return Boolean(value.trim());
}

function hasProgramUsage(value: string) {
  const normalizedValue = value.trim().toLowerCase();

  return Boolean(
    normalizedValue &&
      !["no", "none", "0", "0%", "false", "n/a", "na"].includes(
        normalizedValue
      )
  );
}

function chooseText(current: string, candidate: string) {
  if (!isNonEmpty(current)) return candidate;
  if (!isNonEmpty(candidate)) return current;

  return candidate.length > current.length ? candidate : current;
}

function chooseUsage(current: string, candidate: string) {
  if (!isNonEmpty(current)) return candidate;
  if (!isNonEmpty(candidate)) return current;
  if (!hasProgramUsage(current) && hasProgramUsage(candidate)) return candidate;

  return chooseText(current, candidate);
}

function parseDate(value: string) {
  if (!value) return undefined;

  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

function chooseMostRecentDate(current: string, candidate: string) {
  const currentDate = parseDate(current);
  const candidateDate = parseDate(candidate);

  if (!currentDate) return candidate;
  if (!candidateDate) return current;

  return candidateDate > currentDate ? candidate : current;
}

function getDetectedTypeCodes(rows: PortalWorkbookAccount[]) {
  return uniqueList(
    rows
      .map((row) => row.division.trim().toUpperCase())
      .filter((code): code is PortalCustomerTypeCode =>
        Boolean(getPortalCustomerTypeInfo(code))
      )
  );
}

export function getHighestPriorityCustomerTypeCode(codes: string[]) {
  const normalizedCodes = uniqueList(
    codes
      .map((code) => code.trim().toUpperCase())
      .filter((code): code is PortalCustomerTypeCode =>
        Boolean(getPortalCustomerTypeInfo(code))
      )
  );

  return TYPE_PRIORITY.find((code) => normalizedCodes.includes(code)) ?? "";
}

function chooseRateByJobs(
  rows: PortalWorkbookAccount[],
  rateField: "cmJpd" | "pmJpd" | "ppmJpd",
  jobField: "cmJobs" | "pmJobs" | "ppmJobs"
) {
  const bestRow = [...rows]
    .filter((row) => row[rateField] > 0)
    .sort((a, b) => b[jobField] - a[jobField])[0];

  return bestRow?.[rateField] ?? 0;
}

function deriveShare(numerator: number, denominator: number, fallback: number) {
  if (denominator > 0) return numerator / denominator;

  return fallback;
}

function chooseFallbackRate(
  rows: PortalWorkbookAccount[],
  rateField: "cmVspSow" | "pmVspSow" | "ppmVspSow" | "cmNlSow" | "pmNlSow" | "ppmNlSow",
  jobField: "cmJobs" | "pmJobs" | "ppmJobs"
) {
  const bestRow = [...rows]
    .filter((row) => row[rateField] > 0)
    .sort((a, b) => b[jobField] - a[jobField])[0];

  return bestRow?.[rateField] ?? 0;
}

export function mergeAccountRows(rows: PortalWorkbookAccount[]) {
  const first = rows[0];

  if (!first) return undefined;

  const merged: PortalWorkbookAccount = {
    ...first,
    accountNumber: normalizeAccountNumber(first.accountNumber) || first.accountNumber,
  };

  for (const field of SUM_FIELDS) {
    merged[field] = rows.reduce((total, row) => total + (row[field] || 0), 0);
  }

  for (const field of DESCRIPTIVE_FIELDS) {
    merged[field] = rows.reduce((value, row) => {
      const candidate = row[field] ?? "";

      return field.endsWith("Usage")
        ? chooseUsage(value, candidate)
        : chooseText(value, candidate);
    }, "");
  }

  merged.lastShippedDate = rows.reduce(
    (value, row) => chooseMostRecentDate(value, row.lastShippedDate),
    ""
  );
  merged.lastShippedDateGlobal = rows.reduce(
    (value, row) => chooseMostRecentDate(value, row.lastShippedDateGlobal),
    ""
  );

  merged.cmJpd = chooseRateByJobs(rows, "cmJpd", "cmJobs");
  merged.pmJpd = chooseRateByJobs(rows, "pmJpd", "pmJobs");
  merged.ppmJpd = chooseRateByJobs(rows, "ppmJpd", "ppmJobs");

  merged.cmVspSow = deriveShare(
    merged.cmVspJobs,
    merged.cmJobs,
    chooseFallbackRate(rows, "cmVspSow", "cmJobs")
  );
  merged.pmVspSow = deriveShare(
    merged.pmVspJobs,
    merged.pmJobs,
    chooseFallbackRate(rows, "pmVspSow", "pmJobs")
  );
  merged.ppmVspSow = deriveShare(
    merged.ppmVspJobs,
    merged.ppmJobs,
    chooseFallbackRate(rows, "ppmVspSow", "ppmJobs")
  );
  merged.cmNlSow = deriveShare(
    merged.cmNlJobs,
    merged.cmJobs,
    chooseFallbackRate(rows, "cmNlSow", "cmJobs")
  );
  merged.pmNlSow = deriveShare(
    merged.pmNlJobs,
    merged.pmJobs,
    chooseFallbackRate(rows, "pmNlSow", "pmJobs")
  );
  merged.ppmNlSow = deriveShare(
    merged.ppmNlJobs,
    merged.ppmJobs,
    chooseFallbackRate(rows, "ppmNlSow", "ppmJobs")
  );

  const detectedCustomerTypeCodes = getDetectedTypeCodes(rows);
  const finalCustomerTypeCode =
    getHighestPriorityCustomerTypeCode(detectedCustomerTypeCodes);

  merged.detectedCustomerTypeCodes = detectedCustomerTypeCodes;
  merged.finalCustomerTypeCode = finalCustomerTypeCode;
  merged.division = finalCustomerTypeCode || merged.division;
  merged.mergedRowCount = rows.length;
  merged.duplicateRowsMerged = rows.length > 1;

  return merged;
}

export function groupAccountRows(rows: PortalWorkbookAccount[]) {
  const groups = new Map<string, PortalWorkbookAccount[]>();

  for (const row of rows) {
    const key = normalizeAccountNumber(row.accountNumber);

    if (!key) continue;

    groups.set(key, [...(groups.get(key) ?? []), row]);
  }

  const accounts = [...groups.values()]
    .map((group) => mergeAccountRows(group))
    .filter((account): account is PortalWorkbookAccount => Boolean(account));

  const nameGroups = new Map<string, Set<string>>();

  for (const account of accounts) {
    const nameKey = normalizedName(account.accountName);

    if (!nameKey) continue;

    nameGroups.set(nameKey, nameGroups.get(nameKey) ?? new Set());
    nameGroups.get(nameKey)?.add(normalizeAccountNumber(account.accountNumber));
  }

  return accounts.map((account) => {
    const nameKey = normalizedName(account.accountName);
    const sameNameAccountNumbers = nameKey
      ? [...(nameGroups.get(nameKey) ?? [])]
      : [];

    return {
      ...account,
      sameNameDifferentAccountWarning: sameNameAccountNumbers.length > 1,
      sameNameAccountNumbers: sameNameAccountNumbers.filter(
        (accountNumber) =>
          accountNumber !== normalizeAccountNumber(account.accountNumber)
      ),
    } satisfies PortalWorkbookAccount;
  });
}

export function calculateDerivedMetrics(accounts: PortalWorkbookAccount[]) {
  return accounts.map((account) => ({
    ...account,
    cmVspSow: deriveShare(account.cmVspJobs, account.cmJobs, account.cmVspSow),
    pmVspSow: deriveShare(account.pmVspJobs, account.pmJobs, account.pmVspSow),
    ppmVspSow: deriveShare(
      account.ppmVspJobs,
      account.ppmJobs,
      account.ppmVspSow
    ),
    cmNlSow: deriveShare(account.cmNlJobs, account.cmJobs, account.cmNlSow),
    pmNlSow: deriveShare(account.pmNlJobs, account.pmJobs, account.pmNlSow),
    ppmNlSow: deriveShare(account.ppmNlJobs, account.ppmJobs, account.ppmNlSow),
  }));
}

export function getAccountsForUser({
  email,
  people,
  accounts,
}: {
  email: string;
  people: PortalWorkbookPerson[];
  accounts: PortalWorkbookAccount[];
}) {
  const normalizedEmail = normalizeEmail(email);
  const accountNumbers = uniqueList(
    people
      .filter((person) => person.emails.includes(normalizedEmail))
      .map((person) => normalizeAccountNumber(person.accountNumber))
  );

  return accountNumbers
    .map((accountNumber) =>
      accounts.find(
        (account) => normalizeAccountNumber(account.accountNumber) === accountNumber
      )
    )
    .filter((account): account is PortalWorkbookAccount => Boolean(account));
}

export function getUsersForAccount({
  accountNumber,
  people,
}: {
  accountNumber: string;
  people: PortalWorkbookPerson[];
}) {
  const normalizedAccountNumber = normalizeAccountNumber(accountNumber);
  const byEmail = new Map<string, PortalWorkbookPerson>();

  for (const person of people) {
    if (normalizeAccountNumber(person.accountNumber) !== normalizedAccountNumber) {
      continue;
    }

    const primaryEmail = person.emails[0] ?? `${person.name}-${person.accountNumber}`;

    if (!byEmail.has(primaryEmail)) byEmail.set(primaryEmail, person);
  }

  return [...byEmail.values()];
}
