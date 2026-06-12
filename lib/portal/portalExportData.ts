import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const DEFAULT_PORTAL_EXPORT_PATH = "private-site/portal/portal_export.json";

type PowerBiRow = Record<string, unknown>;

export type PortalExportRecord = {
  acctId: string;
  pipedriveId: string;
  businessName: string;
  allAccountNumbers: string[];
  fullAddress: string;
  division: string;
  dateShipped: string;
  labName: string;
  phoneNumber: string;
  state: string;
  primaryPalBrandPrivatePay: string;
  primaryPalBrandVsp: string;
  modernPackageUsage: string;
  modernFrameUsage: string;
  chemclipUsage: string;
  specCheckUsage: string;
  tokaiUsage: string;
  previousMonthTierRank: string;
  usedPriceLists: string[];
  dataRefreshDate: string;
  jobs: PortalExportMonthlyValues;
  jobsPerDay: PortalExportMonthlyValues;
  sales: PortalExportMonthlyValues;
  averageTurnaroundTime: PortalExportMonthlyValues;
  netLensJobs: PortalExportMonthlyValues;
  netLensShare: PortalExportMonthlyValues;
  sqlJobs: PortalExportMonthlyValues;
  vspJobs: PortalExportMonthlyValues;
  vspShare: PortalExportMonthlyValues;
  labRedoPct: PortalExportMonthlyValues;
  officeRedoPct: PortalExportMonthlyValues;
  warrantyRedoPct: PortalExportMonthlyValues;
  nonAdaptPct: PortalExportMonthlyValues;
  isArsql26Customer: boolean;
  isEnrolledArpmp26: boolean;
  isEnrolledAruty26: boolean;
  raw: PowerBiRow;
};

export type PortalExportMonthlyValues = {
  ppm: number;
  pm: number;
  cm: number;
};

export type PortalExportDiagnostics = {
  configuredPath: string;
  resolvedPath: string;
  exists: boolean;
  loaded: boolean;
  recordCount: number;
  latestDataRefreshDate: string;
  error: string;
  samples: Array<{
    acctId: string;
    businessName: string;
  }>;
};

export type PortalExportData = {
  records: PortalExportRecord[];
  diagnostics: PortalExportDiagnostics;
  byAcctId: Map<string, PortalExportRecord[]>;
  byPipedriveId: Map<string, PortalExportRecord[]>;
  byBusinessName: Map<string, PortalExportRecord[]>;
  byAccountNumber: Map<string, PortalExportRecord[]>;
};

let cachedPortalExportData: PortalExportData | undefined;

function text(value: unknown) {
  return String(value ?? "").trim();
}

function numberValue(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(text(value).replace(/[$,%\s,]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function dateValue(value: unknown) {
  const raw = text(value);
  if (!raw) return "";
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? raw : parsed.toISOString().slice(0, 10);
}

function booleanValue(value: unknown) {
  const normalized = text(value).toLowerCase();
  return Boolean(
    normalized &&
      !["no", "none", "0", "0%", "false", "n/a", "na"].includes(normalized)
  );
}

function listValue(value: unknown) {
  return [...new Set(
    text(value)
      .split(/[;,|/]/)
      .map((entry) => entry.trim())
      .filter(Boolean)
  )];
}

function normalizeAccountAlias(value: unknown) {
  return text(value)
    .toUpperCase()
    .replace(/\.0$/, "")
    .replace(/^0+(?=\d)/, "");
}

function field(row: PowerBiRow, key: string) {
  return row[key];
}

function monthly(row: PowerBiRow, fieldName: string): PortalExportMonthlyValues {
  return {
    ppm: numberValue(field(row, `[ppm_${fieldName}]`)),
    pm: numberValue(field(row, `[pm_${fieldName}]`)),
    cm: numberValue(field(row, `[cm_${fieldName}]`)),
  };
}

function normalizeRecord(row: PowerBiRow): PortalExportRecord {
  return {
    acctId: normalizeAccountAlias(field(row, "Intel[Acct ID]")),
    pipedriveId: text(field(row, "Intel[Pipedrive ID]")),
    businessName: text(field(row, "Intel[Business Name]")),
    allAccountNumbers: listValue(field(row, "[all_account_numbers]")).map(
      normalizeAccountAlias
    ),
    fullAddress: text(field(row, "[full_address]")),
    division: text(field(row, "[division]")).toUpperCase(),
    dateShipped: dateValue(field(row, "[date_shipped]")),
    labName: text(field(row, "[lab_name]")),
    phoneNumber: text(field(row, "[phone_number]")),
    state: text(field(row, "[state]")).toUpperCase(),
    primaryPalBrandPrivatePay: text(
      field(row, "[primary_pal_brand_private_pay]")
    ),
    primaryPalBrandVsp: text(field(row, "[primary_pal_brand_vsp]")),
    modernPackageUsage: text(field(row, "[modern_pkg_usage]")),
    modernFrameUsage: text(field(row, "[modern_frm_usage]")),
    chemclipUsage: text(field(row, "[chemclip_usage]")),
    specCheckUsage: text(field(row, "[speccheck_usage]")),
    tokaiUsage: text(field(row, "[tokai_usage]")),
    previousMonthTierRank: text(field(row, "[previous_month_tier_rank]")),
    usedPriceLists: listValue(field(row, "[used_price_lists]")).map((value) =>
      value.toUpperCase()
    ),
    dataRefreshDate: dateValue(field(row, "[data_refresh_date]")),
    jobs: monthly(row, "jobs"),
    jobsPerDay: monthly(row, "jpd"),
    sales: monthly(row, "sales"),
    averageTurnaroundTime: monthly(row, "average_turnaround_time"),
    netLensJobs: monthly(row, "nl_jobs"),
    netLensShare: monthly(row, "nl_sow"),
    sqlJobs: monthly(row, "sql_jobs"),
    vspJobs: monthly(row, "vsp_jobs"),
    vspShare: monthly(row, "vsp_sow"),
    labRedoPct: monthly(row, "lab_redo_pct"),
    officeRedoPct: monthly(row, "office_redo_pct"),
    warrantyRedoPct: monthly(row, "warranty_redo_pct"),
    nonAdaptPct: monthly(row, "non_adapt_pct"),
    isArsql26Customer: booleanValue(field(row, "[is_arsql26_customer]")),
    isEnrolledArpmp26: booleanValue(field(row, "[is_enrolled_arpmp26]")),
    isEnrolledAruty26: booleanValue(field(row, "[is_enrolled_aruty26]")),
    raw: row,
  };
}

function addToIndex(
  index: Map<string, PortalExportRecord[]>,
  key: string,
  record: PortalExportRecord
) {
  if (!key) return;
  index.set(key, [...(index.get(key) ?? []), record]);
}

function emptyData(
  configuredPath: string,
  resolvedPath: string,
  error: string
): PortalExportData {
  return {
    records: [],
    diagnostics: {
      configuredPath,
      resolvedPath,
      exists: existsSync(resolvedPath),
      loaded: false,
      recordCount: 0,
      latestDataRefreshDate: "",
      error,
      samples: [],
    },
    byAcctId: new Map(),
    byPipedriveId: new Map(),
    byBusinessName: new Map(),
    byAccountNumber: new Map(),
  };
}

export function getPortalExportDiagnostics() {
  return loadPortalExportData().diagnostics;
}

export function loadPortalExportData(): PortalExportData {
  if (cachedPortalExportData) return cachedPortalExportData;

  const configuredPath =
    process.env.PORTAL_EXPORT_DATA_PATH?.trim() || DEFAULT_PORTAL_EXPORT_PATH;
  const resolvedPath = path.isAbsolute(configuredPath)
    ? configuredPath
    : path.join(/* turbopackIgnore: true */ process.cwd(), configuredPath);

  if (!existsSync(resolvedPath)) {
    const error = `Portal export JSON not found at ${resolvedPath}.`;
    console.error("[PORTAL EXPORT]", error);
    cachedPortalExportData = emptyData(configuredPath, resolvedPath, error);
    return cachedPortalExportData;
  }

  try {
    const parsed = JSON.parse(readFileSync(resolvedPath, "utf8")) as unknown;
    if (!Array.isArray(parsed)) {
      throw new Error("Expected the portal export root value to be an array.");
    }

    const records = parsed
      .filter(
        (row): row is PowerBiRow =>
          Boolean(row) && typeof row === "object" && !Array.isArray(row)
      )
      .map(normalizeRecord)
      .filter((record) => record.acctId);
    const byAcctId = new Map<string, PortalExportRecord[]>();
    const byPipedriveId = new Map<string, PortalExportRecord[]>();
    const byBusinessName = new Map<string, PortalExportRecord[]>();
    const byAccountNumber = new Map<string, PortalExportRecord[]>();

    for (const record of records) {
      addToIndex(byAcctId, record.acctId, record);
      addToIndex(byPipedriveId, record.pipedriveId, record);
      addToIndex(
        byBusinessName,
        record.businessName.toLowerCase(),
        record
      );
      for (const accountNumber of record.allAccountNumbers) {
        addToIndex(byAccountNumber, accountNumber, record);
      }
    }

    const latestDataRefreshDate =
      records
        .map((record) => record.dataRefreshDate)
        .filter(Boolean)
        .sort()
        .at(-1) ?? "";

    cachedPortalExportData = {
      records,
      diagnostics: {
        configuredPath,
        resolvedPath,
        exists: true,
        loaded: true,
        recordCount: records.length,
        latestDataRefreshDate,
        error: "",
        samples: records.slice(0, 5).map((record) => ({
          acctId: record.acctId,
          businessName: record.businessName,
        })),
      },
      byAcctId,
      byPipedriveId,
      byBusinessName,
      byAccountNumber,
    };
    console.log("[PORTAL EXPORT]", cachedPortalExportData.diagnostics);
    return cachedPortalExportData;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[PORTAL EXPORT]", {
      configuredPath,
      resolvedPath,
      loaded: false,
      error: message,
    });
    cachedPortalExportData = emptyData(configuredPath, resolvedPath, message);
    return cachedPortalExportData;
  }
}

export function getPortalExportByAcctId(acctId: string) {
  return (
    loadPortalExportData().byAcctId.get(normalizeAccountAlias(acctId)) ?? []
  );
}

export function getPortalExportByPipedriveId(pipedriveId: string) {
  return loadPortalExportData().byPipedriveId.get(text(pipedriveId)) ?? [];
}

export function getPortalExportByBusinessName(businessName: string) {
  return (
    loadPortalExportData().byBusinessName.get(
      text(businessName).toLowerCase()
    ) ?? []
  );
}

export function getPortalExportByAccountNumber(accountNumber: string) {
  return (
    loadPortalExportData().byAccountNumber.get(
      normalizeAccountAlias(accountNumber)
    ) ?? []
  );
}
