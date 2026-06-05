import "server-only";

import { existsSync } from "node:fs";
import path from "node:path";
import ExcelJS from "exceljs";
import {
  isPortalAdminEmailAddress,
  normalizePortalEmail,
} from "@/lib/portal/adminAccess";

export type PortalUserAccount = {
  acctId: string;
  accountNumbers: string[];
  organizationAccountNumber: string;
  organizationName: string;
};

export type PortalUserAccess = {
  email: string;
  personName: string;
  organizationName: string;
  marketingStatus: string;
  accounts: PortalUserAccount[];
};

export type PortalUserAccessData = {
  usersByEmail: Map<string, PortalUserAccess>;
  accountsByCanonicalId: Map<string, PortalUserAccount>;
  accountAliasToCanonicalId: Map<string, string>;
};

export class PortalAccountAccessError extends Error {
  constructor() {
    super("Portal account access denied.");
    this.name = "PortalAccountAccessError";
  }
}

const PERSON_LIST_SHEET = "person list";
const EMAIL_COLUMNS = [
  "Person - Email - Work",
  "Person - Email - Home",
  "Person - Email - Other",
] as const;

let portalUserAccessPromise: Promise<PortalUserAccessData> | undefined;

export function normalizeEmail(email: unknown) {
  return normalizePortalEmail(email);
}

function normalizeAccountAlias(value: unknown) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\.0$/, "")
    .replace(/^0+(?=\d)/, "");
}

function textValue(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object" && "text" in value) {
    return String((value as { text?: unknown }).text ?? "").trim();
  }
  return String(value).trim();
}

function parseAccountNumbers(value: unknown) {
  return [...new Set(
    textValue(value)
      .split(",")
      .map(normalizeAccountAlias)
      .filter(Boolean)
  )];
}

function parseEmails(value: unknown) {
  return textValue(value)
    .split(/[;,]/)
    .map(normalizeEmail)
    .filter(Boolean);
}

function workbookPath() {
  const configuredPath =
    process.env.PORTAL_USER_DATA_PATH?.trim() ||
    "private-source/portal/user_data.xlsx";

  const resolvedPath = path.isAbsolute(configuredPath)
    ? configuredPath
    : path.join(/* turbopackIgnore: true */ process.cwd(), configuredPath);

  if (existsSync(resolvedPath)) return resolvedPath;

  const trackedCaseVariant = path.join(
    path.dirname(resolvedPath),
    "User_Data.xlsx"
  );
  return existsSync(trackedCaseVariant) ? trackedCaseVariant : resolvedPath;
}

function mergeUser(
  usersByEmail: Map<string, PortalUserAccess>,
  email: string,
  personName: string,
  organizationName: string,
  marketingStatus: string,
  account: PortalUserAccount
) {
  const existing = usersByEmail.get(email);
  if (!existing) {
    usersByEmail.set(email, {
      email,
      personName,
      organizationName,
      marketingStatus,
      accounts: [account],
    });
    return;
  }

  const accountKey = normalizeAccountAlias(account.acctId);
  if (
    !existing.accounts.some(
      (entry) => normalizeAccountAlias(entry.acctId) === accountKey
    )
  ) {
    existing.accounts.push(account);
  }
}

async function readPortalUserAccess(): Promise<PortalUserAccessData> {
  const filePath = workbookPath();
  if (!existsSync(filePath)) {
    throw new Error(`Portal user workbook not found at ${filePath}.`);
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet(PERSON_LIST_SHEET);
  if (!worksheet) {
    throw new Error(`Portal user workbook is missing sheet "${PERSON_LIST_SHEET}".`);
  }

  const headers = new Map<string, number>();
  worksheet.getRow(1).eachCell((cell, columnNumber) => {
    const header = textValue(cell.value);
    if (header) headers.set(header, columnNumber);
  });

  const valueAt = (row: ExcelJS.Row, header: string) => {
    const columnNumber = headers.get(header);
    return columnNumber ? textValue(row.getCell(columnNumber).value) : "";
  };

  const usersByEmail = new Map<string, PortalUserAccess>();
  const accountsByCanonicalId = new Map<string, PortalUserAccount>();
  const accountAliasToCanonicalId = new Map<string, string>();

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const emails = [...new Set(
      EMAIL_COLUMNS.flatMap((column) => parseEmails(valueAt(row, column)))
    )];
    if (emails.length === 0) continue;

    const acctId = normalizeAccountAlias(valueAt(row, "Organization - Acct ID"));
    const accountNumbers = parseAccountNumbers(
      valueAt(row, "Organization - All Account Numbers")
    );
    const organizationAccountNumber = normalizeAccountAlias(
      valueAt(row, "Organization - Account Number")
    );
    const organizationName = valueAt(row, "Person - Organization");
    const canonicalId = acctId || accountNumbers[0] || organizationAccountNumber;
    if (!canonicalId) continue;

    const account: PortalUserAccount = {
      acctId: canonicalId,
      accountNumbers,
      organizationAccountNumber,
      organizationName,
    };

    const existingAccount = accountsByCanonicalId.get(canonicalId);
    if (existingAccount) {
      existingAccount.accountNumbers = [...new Set([
        ...existingAccount.accountNumbers,
        ...accountNumbers,
      ])];
      if (!existingAccount.organizationAccountNumber) {
        existingAccount.organizationAccountNumber = organizationAccountNumber;
      }
    } else {
      accountsByCanonicalId.set(canonicalId, account);
    }

    for (const alias of [canonicalId, ...accountNumbers, organizationAccountNumber]) {
      const normalizedAlias = normalizeAccountAlias(alias);
      if (normalizedAlias) accountAliasToCanonicalId.set(normalizedAlias, canonicalId);
    }

    for (const email of emails) {
      mergeUser(
        usersByEmail,
        email,
        valueAt(row, "Person - Name"),
        organizationName,
        valueAt(row, "Person - Marketing status"),
        accountsByCanonicalId.get(canonicalId) ?? account
      );
    }
  }

  return {
    usersByEmail,
    accountsByCanonicalId,
    accountAliasToCanonicalId,
  };
}

export function loadPortalUserAccess() {
  portalUserAccessPromise ??= readPortalUserAccess();
  return portalUserAccessPromise;
}

export async function getPortalUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return undefined;
  return (await loadPortalUserAccess()).usersByEmail.get(normalizedEmail);
}

export function isPortalAdmin(email: string) {
  return isPortalAdminEmailAddress(email);
}

export async function getAllowedAccountsForEmail(email: string) {
  if (isPortalAdmin(email)) return getAllPortalAccountsForAdmin();
  return (await getPortalUserByEmail(email))?.accounts ?? [];
}

export async function assertAccountAccess(email: string, accountId: string) {
  const access = await loadPortalUserAccess();
  const normalizedAccount = normalizeAccountAlias(accountId);
  const canonicalId =
    access.accountAliasToCanonicalId.get(normalizedAccount) || normalizedAccount;

  if (isPortalAdmin(email)) {
    const account = access.accountsByCanonicalId.get(canonicalId);
    if (!account) throw new PortalAccountAccessError();
    return account;
  }

  const user = access.usersByEmail.get(normalizeEmail(email));
  const account = user?.accounts.find(
    (entry) => normalizeAccountAlias(entry.acctId) === canonicalId
  );
  if (!account) throw new PortalAccountAccessError();
  return account;
}

export async function getAllPortalAccountsForAdmin() {
  return [...(await loadPortalUserAccess()).accountsByCanonicalId.values()].sort(
    (a, b) =>
      a.organizationName.localeCompare(b.organizationName) ||
      a.acctId.localeCompare(b.acctId)
  );
}
