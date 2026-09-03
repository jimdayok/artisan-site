import "server-only";

import { syncCloudflareAccessPolicy } from "@/lib/portal/cloudflareAccessPolicyCore";

const DEFAULT_POLICY_NAME = "Allow Artisan Lab Network users";

export function getCloudflareAccessPolicyConfig() {
  const apiToken = process.env.CLOUDFLARE_ACCESS_API_TOKEN?.trim() ?? "";
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim() ?? "";
  const policyId = process.env.CLOUDFLARE_ACCESS_POLICY_ID?.trim() ?? "";
  const missing: string[] = [];
  if (!apiToken) missing.push("CLOUDFLARE_ACCESS_API_TOKEN");
  if (!accountId) missing.push("CLOUDFLARE_ACCOUNT_ID");
  if (!policyId) missing.push("CLOUDFLARE_ACCESS_POLICY_ID");
  return {
    enabled: missing.length === 0,
    missing,
    apiToken,
    accountId,
    policyId,
    expectedPolicyName:
      process.env.CLOUDFLARE_ACCESS_POLICY_NAME?.trim() || DEFAULT_POLICY_NAME,
  };
}

export async function setCloudflareAccessEmail(
  rawEmail: string,
  operation: "add" | "remove"
) {
  const config = getCloudflareAccessPolicyConfig();
  if (!config.enabled) {
    throw new Error(
      `Cloudflare login access is not configured. Missing: ${config.missing.join(", ")}.`
    );
  }
  return syncCloudflareAccessPolicy(config, rawEmail, operation);
}
