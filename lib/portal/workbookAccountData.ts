import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";
import { getPortalCustomerTypeInfo } from "@/lib/portal/customerTypes";
import {
  calculateDerivedMetrics,
  getAccountsForUser,
  getUsersForAccount,
  groupAccountRows,
  normalizeAccountNumber,
  normalizeEmail,
} from "@/lib/portal/normalizeAccounts";

const PORTAL_SOURCE_DIR = path.join(
  process.cwd(),
  "private-source",
  "portal"
);

const USER_DATA_PATH = path.join(PORTAL_SOURCE_DIR, "User_Data.xlsx");
const ACCT_DATA_PATH = path.join(PORTAL_SOURCE_DIR, "Acct_Data.xlsx");

type WorkbookRow = Record<string, unknown>;

export type PortalWorkbookPerson = {
  name: string;
  organization: string;
  accountNumber: string;
  emails: string[];
  division: string;
  artisanLab: string;
  targetedPrograms: string;
  lastOrderShipped: string;
};

export type PortalWorkbookAccount = {
  accountName: string;
  accountNumber: string;
  division: string;
  salesRep: string;
  lastShippedDate: string;
  primaryPalPrivatePay: string;
  primaryPalVsp: string;
  lastLabName: string;
  fullAddress: string;
  phoneNumber: string;
  state: string;
  zipCode: string;
  modernPkgUsage: string;
  modernFrmUsage: string;
  chemClipUsage: string;
  specCheckUsage: string;
  tokaiUsage: string;
  tier: string;
  ppmJobs: number;
  pmJobs: number;
  cmJobs: number;
  ppmSales: number;
  pmSales: number;
  cmSales: number;
  ppmJpd: number;
  pmJpd: number;
  cmJpd: number;
  ppmNlJobs: number;
  pmNlJobs: number;
  cmNlJobs: number;
  pmNlSow: number;
  ppmNlSow: number;
  cmNlSow: number;
  cmSqlJobs: number;
  pmSqlJobs: number;
  ppmSqlJobs: number;
  ppmVspJobs: number;
  pmVspJobs: number;
  cmVspJobs: number;
  ppmVspSow: number;
  pmVspSow: number;
  cmVspSow: number;
  lastShippedDateGlobal: string;
  detectedCustomerTypeCodes?: string[];
  finalCustomerTypeCode?: string;
  mergedRowCount?: number;
  duplicateRowsMerged?: boolean;
  sameNameDifferentAccountWarning?: boolean;
  sameNameAccountNumbers?: string[];
};

export type PortalWorkbookProfile = {
  person: PortalWorkbookPerson;
  account?: PortalWorkbookAccount;
};

const SEQUEL_REBATE_PROGRAM = "sequel rebate";

function toText(value: unknown) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);

  return String(value).trim();
}

function toNumber(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const parsed = Number(toText(value).replace(/[$,%\s]/g, ""));

  return Number.isFinite(parsed) ? parsed : 0;
}

function toAccountNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(Math.trunc(value));
  }

  return toText(value).replace(/\.0$/, "");
}

export function normalizePortalAccountNumber(value: unknown) {
  return normalizeAccountNumber(toAccountNumber(value));
}

function emailList(value: unknown) {
  return toText(value)
    .split(",")
    .map(normalizeEmail)
    .filter((email) => email && email !== "20" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
}

function readSheet(filePath: string, sheetName: string) {
  if (!existsSync(filePath)) return [];

  const workbook = XLSX.read(readFileSync(filePath), {
    type: "buffer",
    cellDates: true,
  });
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) return [];

  return XLSX.utils.sheet_to_json<WorkbookRow>(sheet, {
    defval: "",
    raw: true,
  });
}

function readPeople() {
  return readSheet(USER_DATA_PATH, "person list")
    .map((row) => {
      const emails = [
        ...emailList(row["Person - Email - Work"]),
        ...emailList(row["Person - Email - Home"]),
        ...emailList(row["Person - Email - Other"]),
      ];

      return {
        name: toText(row["Person - Name"]),
        organization: toText(row["Person - Organization"]),
        accountNumber: toAccountNumber(row["Organization - Account Number"]),
        emails: [...new Set(emails)],
        division: toText(row["Organization - Division"]),
        artisanLab: toText(row["Organization - Artisan Lab"]),
        targetedPrograms: toText(row["Organization - Targeted Programs"]),
        lastOrderShipped: toText(row["Organization - Last Order Shipped"]),
      } satisfies PortalWorkbookPerson;
    })
    .filter((person) => person.accountNumber && person.emails.length > 0);
}

function hasTargetedProgram(value: string, program: string) {
  return value
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .includes(program);
}

function readAccounts() {
  return readSheet(ACCT_DATA_PATH, "Export")
    .map((row) => ({
      accountName: toText(row["Account Name"]),
      accountNumber: toAccountNumber(row["Last Account Number"]),
      division: toText(row["Last Division"]),
      salesRep: toText(row["Last Sales Rep"]),
      lastShippedDate: toText(row["Last Shipped Date"]),
      primaryPalPrivatePay: toText(row["Primary PAL Brand (Private Pay)"]),
      primaryPalVsp: toText(row["Primary PAL Brand (VSP)"]),
      lastLabName: toText(row["Last Lab Name"]),
      fullAddress: toText(row["Full Address"]),
      phoneNumber: toText(row["Last Phone Number"]),
      state: toText(row["Last State"]),
      zipCode: toText(row["Last Zip Code"]),
      modernPkgUsage: toText(row["Modern Pkg Usage"]),
      modernFrmUsage: toText(row["Modern Frm Usage"]),
      chemClipUsage: toText(row["ChemClip Usage"]),
      specCheckUsage: toText(row["SpecCheck Usage"]),
      tokaiUsage: toText(row["Tokai Usage"]),
      tier: toText(row["CM/PM Tier"]),
      ppmJobs: toNumber(row["PPM Jobs"]),
      pmJobs: toNumber(row["PM Jobs"]),
      cmJobs: toNumber(row["CM Jobs"]),
      ppmSales: toNumber(row["PPM Sales"]),
      pmSales: toNumber(row["PM Sales"]),
      cmSales: toNumber(row["CM Sales"]),
      ppmJpd: toNumber(row["PPM JPD"]),
      pmJpd: toNumber(row["PM JPD"]),
      cmJpd: toNumber(row["CM JPD"]),
      ppmNlJobs: toNumber(row["PPM NL Jobs"]),
      pmNlJobs: toNumber(row["PM NL Jobs"]),
      cmNlJobs: toNumber(row["CM NL Jobs"]),
      pmNlSow: toNumber(row["PM NL SOW"]),
      ppmNlSow: toNumber(row["PPM NL SOW"]),
      cmNlSow: toNumber(row["CM NL SOW"]),
      cmSqlJobs: toNumber(row["CM SQL Jobs"]),
      pmSqlJobs: toNumber(row["PM SQL Jobs"]),
      ppmSqlJobs: toNumber(row["PPM SQL Jobs"]),
      ppmVspJobs: toNumber(row["PPM VSP Jobs"]),
      pmVspJobs: toNumber(row["PM VSP Jobs"]),
      cmVspJobs: toNumber(row["CM VSP Jobs"]),
      ppmVspSow: toNumber(row["PPM VSP SOW"]),
      pmVspSow: toNumber(row["PM VSP SOW"]),
      cmVspSow: toNumber(row["CM VSP SOW"]),
      lastShippedDateGlobal: toText(row["Last Shipped Date (Global)"]),
    }))
    .filter((account) => account.accountNumber);
}

const people = readPeople();
const accounts = calculateDerivedMetrics(groupAccountRows(readAccounts()));
const accountsByNumber = new Map(
  accounts.map((account) => [
    normalizePortalAccountNumber(account.accountNumber),
    account,
  ])
);

export function getPortalWorkbookProfileByEmail(
  email: string,
  accountNumber?: string
) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) return undefined;

  const matchingPeople = people.filter((entry) =>
    entry.emails.includes(normalizedEmail)
  );
  const person =
    accountNumber && matchingPeople.length > 0
      ? matchingPeople.find(
          (entry) =>
            normalizePortalAccountNumber(entry.accountNumber) ===
            normalizePortalAccountNumber(accountNumber)
        )
      : matchingPeople[0];

  if (!person) return undefined;

  return {
    person,
    account: accountsByNumber.get(normalizePortalAccountNumber(person.accountNumber)),
  } satisfies PortalWorkbookProfile;
}

export function getPortalWorkbookProfilesByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) return [];

  const accountNumbers = [
    ...new Set(
      people
        .filter((entry) => entry.emails.includes(normalizedEmail))
        .map((entry) => normalizePortalAccountNumber(entry.accountNumber))
    ),
  ];

  return accountNumbers
    .map((accountNumber) =>
      getPortalWorkbookProfileByEmail(normalizedEmail, accountNumber)
    )
    .filter((profile): profile is PortalWorkbookProfile => Boolean(profile));
}

export function getPortalWorkbookAccountsForEmail(email: string) {
  return getAccountsForUser({ email, people, accounts });
}

export function getPortalWorkbookAccountByAccountNumber(accountNumber: string) {
  return accountsByNumber.get(normalizePortalAccountNumber(accountNumber));
}

export function getPortalWorkbookProfileByAccountNumber(accountNumber: string) {
  const person = people.find(
    (entry) =>
      normalizePortalAccountNumber(entry.accountNumber) ===
      normalizePortalAccountNumber(accountNumber)
  );
  const account = getPortalWorkbookAccountByAccountNumber(accountNumber);

  if (!person && !account) return undefined;

  return {
    person: person ?? {
      name: "",
      organization: account?.accountName ?? "",
      accountNumber,
      emails: [],
      division: account?.division ?? "",
      artisanLab: account?.lastLabName ?? "",
      targetedPrograms: "",
      lastOrderShipped: account?.lastShippedDate ?? "",
    },
    account,
  } satisfies PortalWorkbookProfile;
}

export function getPortalWorkbookPeople() {
  return people;
}

export function getPortalWorkbookAccounts() {
  return accounts;
}

export function getPortalWorkbookPeopleByAccountNumber(accountNumber: string) {
  return getUsersForAccount({ accountNumber, people });
}

export function getCustomerTypeCodeForWorkbookProfile(
  profile?: PortalWorkbookProfile
) {
  return (
    profile?.account?.finalCustomerTypeCode ||
    profile?.account?.division ||
    profile?.person.division ||
    ""
  )
    .trim()
    .toUpperCase();
}

export function getCustomerTypeInfoForWorkbookProfile(
  profile?: PortalWorkbookProfile
) {
  return getPortalCustomerTypeInfo(getCustomerTypeCodeForWorkbookProfile(profile));
}

export function personHasSequelRebateInvitation(person?: PortalWorkbookPerson) {
  return Boolean(
    person?.targetedPrograms &&
      hasTargetedProgram(person.targetedPrograms, SEQUEL_REBATE_PROGRAM)
  );
}

export function accountHasSequelRebateInvitation(accountNumber: string) {
  return getPortalWorkbookPeopleByAccountNumber(accountNumber).some(
    personHasSequelRebateInvitation
  );
}

export function profileHasSequelRebateInvitation(
  profile?: PortalWorkbookProfile
) {
  if (!profile) return false;

  if (personHasSequelRebateInvitation(profile.person)) return true;

  return accountHasSequelRebateInvitation(
    profile.account?.accountNumber || profile.person.accountNumber
  );
}
