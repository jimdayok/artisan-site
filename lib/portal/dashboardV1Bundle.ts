import "server-only";

import dashboardV1Bundle from "@/lib/portal/generated/dashboardV1Bundle.json";
import type {
  PortalDashboardV1Account,
  PortalDashboardV1Manifest,
} from "@/lib/portal/dashboardV1";

export type PortalDashboardV1IndexRow = {
  account_id?: string;
  all_account_numbers?: string;
  business_name?: string;
  customer_type?: string;
  price_lists?: string[];
  [key: string]: unknown;
};

type DashboardV1Bundle = {
  manifest: PortalDashboardV1Manifest | null;
  accountsIndex: PortalDashboardV1IndexRow[];
  usersToAccounts: unknown[];
  accountsById: Record<string, PortalDashboardV1Account>;
};

export const portalDashboardV1Bundle =
  dashboardV1Bundle as DashboardV1Bundle;
