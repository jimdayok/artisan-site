import accessIndexJson from "@/lib/portal/generated/priceListAccessIndex.json";

export type PortalDashboardV1AccessIndexRow = {
  account_id?: string;
  all_account_numbers?: string;
  business_name?: string;
  customer_type?: string;
  price_lists?: string[];
};

export type PortalDashboardV1UserAccessRecord = {
  email?: string;
  account_ids?: string[];
};

type DashboardV1AccessIndex = {
  accountsIndex: PortalDashboardV1AccessIndexRow[];
  usersToAccounts: PortalDashboardV1UserAccessRecord[];
};

export const portalDashboardV1AccessIndex =
  accessIndexJson as DashboardV1AccessIndex;
