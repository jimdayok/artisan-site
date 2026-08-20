import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import packagedNetSalesHistory from "@/lib/portal/generated/repNetSalesHistory.json";
import { scopeAccountNetSalesRows } from "@/lib/portal/netSalesHistoryPolicy";

export const POWER_BI_PRODUCTION_SOURCE = {
  workspaceName: "ALN Premium Workspace",
  workspaceId: "a63e0f35-1088-4bb4-bb1c-61f242c18dbc",
  semanticModelName: "Master_Reports",
  semanticModelId: "a946695b-5a56-467e-b4fa-c66c3d113c54",
  measure: "Intel[Net Sales]",
  accountField: "Intel[Acct ID]",
  repField: "Intel[Sales Rep]",
  labField: "Intel[Lab Name]",
  territoryField: "Intel[Account or Group Territory]",
  timezone: "America/Chicago",
  mode: "synchronized account-grain export",
} as const;

export type NetSalesHistoryManifest = {
  workspace_id: string;
  semantic_model_id: string;
  source_table: string;
  measure: string;
  account_field: string;
  rep_field: string;
  lab_field?: string;
  territory_field?: string;
  date_field: string;
  timezone: string;
  generated_at: string;
  data_refresh_date: string;
  mode: "synchronized" | "imported" | "live";
};

export type NetSalesHistoryRow = {
  month: string;
  account_id: string;
  rep_code: string;
  lab?: string;
  territory?: string;
  net_sales: number | null;
};

type NetSalesHistoryFile = {
  manifest: NetSalesHistoryManifest;
  rows: NetSalesHistoryRow[];
};

export type NetSalesHistoryState =
  | {
      status: "ready";
      manifest: NetSalesHistoryManifest;
      rows: NetSalesHistoryRow[];
      sourcePath: string;
    }
  | {
      status: "not-configured" | "error";
      message: string;
      sourcePath?: string;
    };

const DEFAULT_HISTORY_PATH = "lib/portal/generated/repNetSalesHistory.json";

function text(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeMonth(value: unknown) {
  const month = text(value);
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(month) ? month : "";
}

function finiteNumber(value: unknown) {
  if (value === null) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function resolveHistoryPath() {
  const configured = text(process.env.PORTAL_REP_NET_SALES_HISTORY_PATH);
  const candidate = configured || DEFAULT_HISTORY_PATH;
  return {
    configured: Boolean(configured),
    absolutePath: path.isAbsolute(candidate)
      ? candidate
      : path.join(process.cwd(), candidate),
  };
}

function validateManifest(value: unknown): NetSalesHistoryManifest | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Record<string, unknown>;
  const mode = text(raw.mode);
  if (!new Set(["synchronized", "imported", "live"]).has(mode)) return undefined;

  const manifest: NetSalesHistoryManifest = {
    workspace_id: text(raw.workspace_id),
    semantic_model_id: text(raw.semantic_model_id),
    source_table: text(raw.source_table),
    measure: text(raw.measure),
    account_field: text(raw.account_field),
    rep_field: text(raw.rep_field),
    lab_field: text(raw.lab_field) || undefined,
    territory_field: text(raw.territory_field) || undefined,
    date_field: text(raw.date_field),
    timezone: text(raw.timezone),
    generated_at: text(raw.generated_at),
    data_refresh_date: text(raw.data_refresh_date),
    mode: mode as NetSalesHistoryManifest["mode"],
  };

  if (
    !manifest.workspace_id ||
    !manifest.semantic_model_id ||
    !manifest.source_table ||
    !manifest.measure ||
    !manifest.account_field ||
    !manifest.rep_field ||
    !manifest.date_field ||
    !manifest.timezone ||
    !manifest.generated_at ||
    !manifest.data_refresh_date
  ) {
    return undefined;
  }

  return manifest;
}

function validateRows(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  const rows: NetSalesHistoryRow[] = [];

  for (const entry of value) {
    if (!entry || typeof entry !== "object") return undefined;
    const raw = entry as Record<string, unknown>;
    const month = normalizeMonth(raw.month);
    const accountId = text(raw.account_id).toUpperCase();
    const repCode = text(raw.rep_code).toUpperCase();
    const netSales = finiteNumber(raw.net_sales);

    if (!month || !accountId || !repCode || netSales === undefined) {
      return undefined;
    }

    rows.push({
      month,
      account_id: accountId,
      rep_code: repCode,
      lab: text(raw.lab),
      territory: text(raw.territory),
      net_sales: netSales,
    });
  }

  return rows;
}

export function loadNetSalesHistory(): NetSalesHistoryState {
  const source = resolveHistoryPath();

  if (source.configured && !existsSync(source.absolutePath)) {
    return {
      status: source.configured ? "error" : "not-configured",
      message: source.configured
        ? "The configured Power BI net-sales history export was not found."
        : "The 13-month Power BI net-sales history export is not connected yet.",
      sourcePath: source.absolutePath,
    };
  }

  try {
    const parsed = source.configured
      ? (JSON.parse(readFileSync(source.absolutePath, "utf8")) as NetSalesHistoryFile)
      : (packagedNetSalesHistory as NetSalesHistoryFile);
    const manifest = validateManifest(parsed.manifest);
    const rows = validateRows(parsed.rows);

    if (!manifest || !rows) {
      return {
        status: "error",
        message: "The Power BI net-sales history export does not match the required contract.",
        sourcePath: source.absolutePath,
      };
    }

    if (
      manifest.workspace_id !== POWER_BI_PRODUCTION_SOURCE.workspaceId ||
      manifest.semantic_model_id !== POWER_BI_PRODUCTION_SOURCE.semanticModelId
    ) {
      return {
        status: "error",
        message: "The net-sales history export references a different Power BI workspace or semantic model.",
        sourcePath: source.absolutePath,
      };
    }

    if (manifest.measure !== POWER_BI_PRODUCTION_SOURCE.measure) {
      return {
        status: "error",
        message: `The export measure is ${manifest.measure}; expected ${POWER_BI_PRODUCTION_SOURCE.measure}.`,
        sourcePath: source.absolutePath,
      };
    }

    if (
      manifest.account_field !== POWER_BI_PRODUCTION_SOURCE.accountField ||
      manifest.rep_field !== POWER_BI_PRODUCTION_SOURCE.repField
    ) {
      return {
        status: "error",
        message: `The export identity fields must be ${POWER_BI_PRODUCTION_SOURCE.accountField} and ${POWER_BI_PRODUCTION_SOURCE.repField}.`,
        sourcePath: source.absolutePath,
      };
    }

    return { status: "ready", manifest, rows, sourcePath: source.absolutePath };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? `Unable to read the Power BI net-sales history export: ${error.message}`
          : "Unable to read the Power BI net-sales history export.",
      sourcePath: source.absolutePath,
    };
  }
}

export function scopeNetSalesHistory(
  state: NetSalesHistoryState,
  repCode: string,
  allowedAccountIds: Iterable<string>
) {
  if (state.status !== "ready") return state;

  return {
    ...state,
    rows: scopeAccountNetSalesRows(state.rows, repCode, allowedAccountIds),
  };
}
