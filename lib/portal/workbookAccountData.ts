import "server-only";

import { getPortalCustomerTypeInfo } from "@/lib/portal/customerTypes";
import { portalDashboardV1Bundle } from "@/lib/portal/dashboardV1Bundle";
import {
  calculateDerivedMetrics,
  groupAccountRows,
  normalizeAccountNumber,
  normalizeEmail,
} from "@/lib/portal/normalizeAccounts";

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
  acctId: string;
  allAccountNumbers: string[];
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
  sourceRows?: PortalWorkbookAccount[];
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

function readPeople() {
  const peopleByEmailAndAccount = new Map<string, PortalWorkbookPerson>();

  for (const account of Object.values(portalDashboardV1Bundle.accountsById)) {
    const accountNumber = account.account_id;

    for (const user of account.authorized_users ?? []) {
      const emails = emailList(user.email);
      if (emails.length === 0) continue;
      const person = {
        name: toText(user.name),
        organization: toText(user.organization) || account.business_name,
        accountNumber,
        emails,
        division: account.division,
        artisanLab: account.lab_name,
        targetedPrograms: toText(user.targeted_programs),
        lastOrderShipped: account.latest_ship_date,
      } satisfies PortalWorkbookPerson;

      for (const email of emails) {
        peopleByEmailAndAccount.set(`${email}:${accountNumber}`, person);
      }
    }
  }

  return [...peopleByEmailAndAccount.values()];
}

function hasTargetedProgram(value: string, program: string) {
  return value
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .includes(program);
}

function readAccounts() {
  return Object.values(portalDashboardV1Bundle.accountsById).map(
    (account) => {
      const jobs = account.purchase_summary.jobs;
      const netLensJobs = account.product_mix.net_lens_jobs;
      const vspJobs = account.vsp_private_pay_mix.vsp_jobs;

      return {
        acctId: account.account_id,
        allAccountNumbers: account.all_account_numbers
          .split(",")
          .map((value) => normalizePortalAccountNumber(value))
          .filter(Boolean),
        accountName: account.business_name,
        accountNumber: account.account_id,
        division: account.division,
        salesRep: account.sales_rep ?? "",
        lastShippedDate: account.latest_ship_date,
        primaryPalPrivatePay: account.primary_pal_brand_private_pay,
        primaryPalVsp: account.primary_pal_brand_vsp,
        lastLabName: account.lab_name,
        fullAddress: account.address,
        phoneNumber: account.phone,
        state: account.state,
        zipCode: "",
        modernPkgUsage: account.program_usage.modern_package_usage,
        modernFrmUsage: account.program_usage.modern_frame_usage,
        chemClipUsage: account.program_usage.chemclip_usage,
        specCheckUsage: account.program_usage.speccheck_usage,
        tokaiUsage: account.program_usage.tokai_usage,
        tier: account.tier_status.previous_month_tier_rank_by_acct_id,
        ppmJobs: jobs.ppm,
        pmJobs: jobs.pm,
        cmJobs: jobs.cm,
        ppmSales: account.purchase_summary.sales.ppm,
        pmSales: account.purchase_summary.sales.pm,
        cmSales: account.purchase_summary.sales.cm,
        ppmJpd: account.performance_rates?.jobs_per_day?.ppm ?? 0,
        pmJpd: account.performance_rates?.jobs_per_day?.pm ?? 0,
        cmJpd: account.performance_rates?.jobs_per_day?.cm ?? 0,
        ppmNlJobs: netLensJobs.ppm,
        pmNlJobs: netLensJobs.pm,
        cmNlJobs: netLensJobs.cm,
        pmNlSow: jobs.pm > 0 ? netLensJobs.pm / jobs.pm : 0,
        ppmNlSow: jobs.ppm > 0 ? netLensJobs.ppm / jobs.ppm : 0,
        cmNlSow: account.vsp_private_pay_mix.net_lens_share,
        cmSqlJobs: account.product_mix.sql_jobs.cm,
        pmSqlJobs: account.product_mix.sql_jobs.pm,
        ppmSqlJobs: account.product_mix.sql_jobs.ppm,
        ppmVspJobs: vspJobs.ppm,
        pmVspJobs: vspJobs.pm,
        cmVspJobs: vspJobs.cm,
        ppmVspSow: jobs.ppm > 0 ? vspJobs.ppm / jobs.ppm : 0,
        pmVspSow: jobs.pm > 0 ? vspJobs.pm / jobs.pm : 0,
        cmVspSow: account.vsp_private_pay_mix.vsp_share,
        lastShippedDateGlobal: account.data_refresh_date,
      } satisfies PortalWorkbookAccount;
    }
  );
}

const people = readPeople();
const accounts = calculateDerivedMetrics(groupAccountRows(readAccounts()));
const accountsByNumber = new Map<string, PortalWorkbookAccount>();

for (const account of accounts) {
  const aliases = [
    account.acctId,
    account.accountNumber,
    ...account.allAccountNumbers,
  ];

  for (const alias of aliases) {
    const normalizedAlias = normalizePortalAccountNumber(alias);
    if (normalizedAlias) accountsByNumber.set(normalizedAlias, account);
  }
}

function resolveAccountNumber(value: string) {
  return accountsByNumber.get(normalizePortalAccountNumber(value))?.accountNumber;
}

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
          (entry) => {
            const requestedAccountNumber = resolveAccountNumber(accountNumber);

            return (
              normalizePortalAccountNumber(entry.accountNumber) ===
              normalizePortalAccountNumber(
                requestedAccountNumber || accountNumber
              )
            );
          }
        )
      : matchingPeople[0];

  if (!person) return undefined;

  return {
    person,
    account: accountsByNumber.get(normalizePortalAccountNumber(person.accountNumber)),
  } satisfies PortalWorkbookProfile;
}

export function getPortalWorkbookProfilesByEmail(
  email: string
): PortalWorkbookProfile[] {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) return [];

  const accountNumbers = [
    ...new Set(
      people
        .filter((entry) => entry.emails.includes(normalizedEmail))
        .map((entry) => normalizePortalAccountNumber(entry.accountNumber))
    ),
  ];

  const profiles: PortalWorkbookProfile[] = [];

  for (const accountNumber of accountNumbers) {
    const profile = getPortalWorkbookProfileByEmail(
      normalizedEmail,
      accountNumber
    );

    if (profile) profiles.push(profile);
  }

  return profiles;
}

export function getPortalWorkbookAccountsForEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const accountNumbers = new Set(
    people
      .filter((person) => person.emails.includes(normalizedEmail))
      .map((person) => normalizePortalAccountNumber(person.accountNumber))
  );

  return accounts.filter((account) =>
    accountNumbers.has(normalizePortalAccountNumber(account.accountNumber))
  );
}

export function getPortalWorkbookAccountByAccountNumber(accountNumber: string) {
  return accountsByNumber.get(normalizePortalAccountNumber(accountNumber));
}

export function getPortalWorkbookProfileByAccountNumber(accountNumber: string) {
  const resolvedAccountNumber = resolveAccountNumber(accountNumber);
  const person = people.find(
    (entry) =>
      normalizePortalAccountNumber(entry.accountNumber) ===
      normalizePortalAccountNumber(resolvedAccountNumber || accountNumber)
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

export function getPortalWorkbookEmails() {
  return [...new Set(people.flatMap((person) => person.emails))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

export function getPortalWorkbookAccounts() {
  return accounts;
}

export function getPortalWorkbookPeopleByAccountNumber(accountNumber: string) {
  const resolvedAccountNumber = resolveAccountNumber(accountNumber);
  const normalizedAccountNumber = normalizePortalAccountNumber(
    resolvedAccountNumber || accountNumber
  );
  const peopleByEmail = new Map<string, PortalWorkbookPerson>();

  for (const person of people) {
    if (
      normalizePortalAccountNumber(person.accountNumber) !==
      normalizedAccountNumber
    ) {
      continue;
    }

    const primaryEmail =
      person.emails[0] ?? `${person.name}-${person.accountNumber}`;
    if (!peopleByEmail.has(primaryEmail)) peopleByEmail.set(primaryEmail, person);
  }

  return [...peopleByEmail.values()];
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
