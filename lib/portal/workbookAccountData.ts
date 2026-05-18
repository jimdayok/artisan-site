import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";

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
};

export type PortalWorkbookProfile = {
  person: PortalWorkbookPerson;
  account?: PortalWorkbookAccount;
};

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

function accountKey(value: unknown) {
  const accountNumber = toAccountNumber(value);

  return accountNumber.replace(/^0+(?=\d)/, "");
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
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
const accounts = readAccounts();
const accountsByNumber = new Map(
  accounts.map((account) => [accountKey(account.accountNumber), account])
);

export function getPortalWorkbookProfileByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) return undefined;

  const person = people.find((entry) => entry.emails.includes(normalizedEmail));

  if (!person) return undefined;

  return {
    person,
    account: accountsByNumber.get(accountKey(person.accountNumber)),
  } satisfies PortalWorkbookProfile;
}

export function getPortalWorkbookAccountByAccountNumber(accountNumber: string) {
  return accountsByNumber.get(accountKey(accountNumber));
}
