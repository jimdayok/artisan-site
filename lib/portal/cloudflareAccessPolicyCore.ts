import { normalizePortalAccessEmail } from "./portalAccessOverridePolicy.ts";

type CloudflareAccessRule = Record<string, unknown> & {
  email?: { email?: unknown };
};

type CloudflareAccessPolicy = Record<string, unknown> & {
  name?: unknown;
  decision?: unknown;
  include?: unknown;
};

type CloudflareApiEnvelope<T> = {
  success?: boolean;
  result?: T;
  errors?: Array<{ message?: string }>;
};

type CloudflareAccessPolicyApiConfig = {
  apiToken: string;
  accountId: string;
  policyId: string;
  expectedPolicyName?: string;
};

type FetchLike = typeof fetch;

const POLICY_UPDATE_FIELDS = [
  "name",
  "decision",
  "include",
  "exclude",
  "require",
  "session_duration",
  "purpose_justification_prompt",
  "purpose_justification_required",
  "approval_required",
  "approval_groups",
  "isolation_required",
  "mfa_config",
  "connection_rules",
] as const;

function policyRules(value: unknown): CloudflareAccessRule[] {
  return Array.isArray(value)
    ? value.filter(
        (rule): rule is CloudflareAccessRule =>
          Boolean(rule) && typeof rule === "object" && !Array.isArray(rule)
      )
    : [];
}

function emailFromRule(rule: CloudflareAccessRule) {
  return normalizePortalAccessEmail(rule.email?.email);
}

export function updatePolicyEmailRules(
  include: unknown,
  rawEmail: string,
  operation: "add" | "remove"
) {
  const email = normalizePortalAccessEmail(rawEmail);
  if (!email) throw new Error("A valid Cloudflare access email is required.");

  const rules = policyRules(include);
  const alreadyIncluded = rules.some((rule) => emailFromRule(rule) === email);
  if (operation === "add") {
    return {
      changed: !alreadyIncluded,
      include: alreadyIncluded ? rules : [...rules, { email: { email } }],
    };
  }

  return {
    changed: alreadyIncluded,
    include: rules.filter((rule) => emailFromRule(rule) !== email),
  };
}

function cloudflareError(
  action: string,
  status: number,
  response?: CloudflareApiEnvelope<unknown>
) {
  const detail = (response?.errors ?? [])
    .map((error) => error.message?.trim())
    .filter(Boolean)
    .join(" ")
    .slice(0, 300);
  return new Error(
    `Cloudflare login access could not be ${action} (${status})${
      detail ? `: ${detail}` : "."
    }`
  );
}

async function readJson<T>(response: Response) {
  return response.json().catch(() => undefined) as
    | CloudflareApiEnvelope<T>
    | undefined;
}

function policyUpdateBody(
  policy: CloudflareAccessPolicy,
  include: CloudflareAccessRule[]
) {
  const body: Record<string, unknown> = {};
  for (const field of POLICY_UPDATE_FIELDS) {
    if (policy[field] !== undefined) body[field] = policy[field];
  }
  body.include = include;
  if (typeof body.name !== "string" || !body.name) {
    throw new Error("Cloudflare login access policy has no name.");
  }
  if (typeof body.decision !== "string" || !body.decision) {
    throw new Error("Cloudflare login access policy has no decision.");
  }
  return body;
}

function validatePolicy(
  policy: CloudflareAccessPolicy,
  expectedPolicyName?: string
) {
  if (!Array.isArray(policy.include)) {
    throw new Error("Cloudflare login access policy has no include rules.");
  }
  if (policy.decision !== "allow") {
    throw new Error("Cloudflare login access policy is not an allow policy.");
  }
  if (
    expectedPolicyName &&
    String(policy.name ?? "").trim() !== expectedPolicyName
  ) {
    throw new Error("Cloudflare login access policy does not match the configured policy.");
  }
}

export async function syncCloudflareAccessPolicy(
  config: CloudflareAccessPolicyApiConfig,
  rawEmail: string,
  operation: "add" | "remove",
  fetchImpl: FetchLike = fetch
) {
  const email = normalizePortalAccessEmail(rawEmail);
  if (!email) throw new Error("A valid Cloudflare access email is required.");
  const url = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(
    config.accountId
  )}/access/policies/${encodeURIComponent(config.policyId)}`;
  const getResponse = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${config.apiToken}` },
    cache: "no-store",
  });
  const getBody = await readJson<CloudflareAccessPolicy>(getResponse);
  if (!getResponse.ok || !getBody?.success || !getBody.result) {
    throw cloudflareError("read", getResponse.status, getBody);
  }
  validatePolicy(getBody.result, config.expectedPolicyName);

  const updated = updatePolicyEmailRules(
    getBody.result.include,
    email,
    operation
  );
  if (!updated.changed) return { changed: false, email };

  const putResponse = await fetchImpl(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(policyUpdateBody(getBody.result, updated.include)),
    cache: "no-store",
  });
  const putBody = await readJson<CloudflareAccessPolicy>(putResponse);
  if (!putResponse.ok || !putBody?.success || !putBody.result) {
    throw cloudflareError(
      operation === "add" ? "added" : "removed",
      putResponse.status,
      putBody
    );
  }
  validatePolicy(putBody.result, config.expectedPolicyName);

  const isIncluded = policyRules(putBody.result.include).some(
    (rule) => emailFromRule(rule) === email
  );
  if ((operation === "add") !== isIncluded) {
    throw new Error("Cloudflare returned an unexpected login access policy state.");
  }
  return { changed: true, email };
}
