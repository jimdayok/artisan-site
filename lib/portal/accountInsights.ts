import {
  getPortalCustomerTypeInfo,
  type PortalCustomerTypeInfo,
} from "@/lib/portal/customerTypes";
import type {
  PortalWorkbookAccount,
  PortalWorkbookPerson,
  PortalWorkbookProfile,
} from "@/lib/portal/workbookAccountData";

export function hasProgramUsage(value: string) {
  const normalizedValue = value.trim().toLowerCase();

  return Boolean(
    normalizedValue &&
      !["no", "none", "0", "0%", "false", "n/a", "na"].includes(
        normalizedValue
      )
  );
}

export function getCustomerTypeInfoFromAccountData({
  account,
  person,
}: {
  account?: PortalWorkbookAccount;
  person?: PortalWorkbookPerson;
}): PortalCustomerTypeInfo | undefined {
  return getPortalCustomerTypeInfo(
    account?.finalCustomerTypeCode || account?.division || person?.division || ""
  );
}

export function getCustomerTypeInfoFromProfile(profile?: PortalWorkbookProfile) {
  if (!profile) return undefined;

  return getCustomerTypeInfoFromAccountData({
    account: profile.account,
    person: profile.person,
  });
}

export function hasModernPackageSavingsWarning(account?: PortalWorkbookAccount) {
  if (!account) return false;

  return (
    hasProgramUsage(account.modernFrmUsage) &&
    !hasProgramUsage(account.modernPkgUsage)
  );
}
