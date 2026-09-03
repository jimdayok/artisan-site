import "server-only";

import {
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import { portalDashboardV1Bundle } from "@/lib/portal/dashboardV1Bundle";
import { getPortalCustomerTypeInfo } from "@/lib/portal/customerTypes";
import { normalizeAssignedPriceListCodes } from "@/lib/portal/assignedPriceLists";
import {
  applyPortalAccessOverrides,
  normalizePortalAccessAccountNumber,
  normalizePortalAccessEmail,
  normalizePortalAccessPrograms,
  type EffectivePortalAccessAccount,
  type PortalAccessAdminEvent,
  type PortalAccessAdminEventInput,
  type PortalAccessBaseAccount,
} from "@/lib/portal/portalAccessOverridePolicy";
import type { PortalCustomer } from "@/lib/portal/customers";

type CloudflarePortalEnv = { PRACTICE_FILES?: unknown };
type R2AdminBucket = R2Bucket & {
  get: (key: string) => Promise<{ body: BodyInit } | null>;
  put: (
    key: string,
    value: string,
    options?: { httpMetadata?: { contentType?: string } }
  ) => Promise<unknown>;
  list: (options?: {
    prefix?: string;
    limit?: number;
    cursor?: string;
  }) => Promise<{
    objects: Array<{ key: string }>;
    truncated?: boolean;
    cursor?: string;
  }>;
};

type AccountIndexRow = {
  account_id?: string;
  all_account_numbers?: string;
  business_name?: string;
  customer_type?: string;
  price_lists?: string[];
};

type UserAccessRow = {
  email?: string;
  account_ids?: string[];
};

const DEFAULT_PREFIX = "portal-admin-access/v1/events";
let cachedClient: S3Client | undefined;

function r2Bucket() {
  const candidate = (globalThis as unknown as CloudflarePortalEnv).PRACTICE_FILES;
  if (
    candidate &&
    typeof (candidate as R2AdminBucket).get === "function" &&
    typeof (candidate as R2AdminBucket).put === "function"
  ) {
    return candidate as R2AdminBucket;
  }
  return undefined;
}

function r2Config() {
  const accountId = process.env.R2_ACCOUNT_ID?.trim() ?? "";
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim() ?? "";
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim() ?? "";
  const bucketName =
    process.env.R2_BUCKET_NAME?.trim() || "artisan-practice-files";
  if (!accountId || !accessKeyId || !secretAccessKey) return undefined;
  return { accountId, accessKeyId, secretAccessKey, bucketName };
}

function eventPrefix() {
  return (
    process.env.PORTAL_ADMIN_ACCESS_PREFIX?.trim().replace(/^\/+|\/+$/g, "") ||
    DEFAULT_PREFIX
  );
}

function client() {
  const config = r2Config();
  if (!config) return undefined;
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }
  return { client: cachedClient, bucketName: config.bucketName };
}

export function getPortalAccessOverrideConfig() {
  const configured = Boolean(r2Bucket() || r2Config());
  return {
    configured,
    bucketName: r2Config()?.bucketName || "artisan-practice-files",
    prefix: eventPrefix(),
    missing: configured
      ? []
      : ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"],
  };
}

async function listEventKeys() {
  const prefix = `${eventPrefix()}/`;
  const bucket = r2Bucket();
  if (bucket) {
    const keys: string[] = [];
    let cursor: string | undefined;
    do {
      const result = await bucket.list({ prefix, limit: 1000, cursor });
      keys.push(...result.objects.map((object) => object.key));
      cursor = result.truncated ? result.cursor : undefined;
    } while (cursor);
    return keys.sort();
  }

  const connection = client();
  if (!connection) return [];
  const keys: string[] = [];
  let continuationToken: string | undefined;
  do {
    const result = await connection.client.send(
      new ListObjectsV2Command({
        Bucket: connection.bucketName,
        Prefix: prefix,
        MaxKeys: 1000,
        ContinuationToken: continuationToken,
      })
    );
    keys.push(
      ...(result.Contents ?? []).flatMap((object) =>
        object.Key ? [object.Key] : []
      )
    );
    continuationToken = result.IsTruncated
      ? result.NextContinuationToken
      : undefined;
  } while (continuationToken);
  return keys.sort();
}

async function readEvent(key: string) {
  const bucket = r2Bucket();
  if (bucket) {
    const object = await bucket.get(key);
    if (!object) return undefined;
    return JSON.parse(
      await new Response(object.body).text()
    ) as PortalAccessAdminEvent;
  }

  const connection = client();
  if (!connection) return undefined;
  const object = await connection.client.send(
    new GetObjectCommand({ Bucket: connection.bucketName, Key: key })
  );
  const body = await object.Body?.transformToString();
  return body ? (JSON.parse(body) as PortalAccessAdminEvent) : undefined;
}

export async function getPortalAccessAdminEvents() {
  const keys = await listEventKeys();
  const events = await Promise.all(keys.map(readEvent));
  return events.filter(
    (event): event is PortalAccessAdminEvent => Boolean(event)
  );
}

function basePortalAccessAccounts(): PortalAccessBaseAccount[] {
  const indexRows =
    portalDashboardV1Bundle.accountsIndex as AccountIndexRow[];
  const userRows =
    portalDashboardV1Bundle.usersToAccounts as UserAccessRow[];
  const emailsByAccount = new Map<string, string[]>();

  for (const user of userRows) {
    const email = normalizePortalAccessEmail(user.email);
    if (!email) continue;
    for (const rawAccount of user.account_ids ?? []) {
      const accountNumber = normalizePortalAccessAccountNumber(rawAccount);
      if (!accountNumber) continue;
      emailsByAccount.set(accountNumber, [
        ...(emailsByAccount.get(accountNumber) ?? []),
        email,
      ]);
    }
  }

  return indexRows.flatMap((row) => {
    const accountNumber = normalizePortalAccessAccountNumber(row.account_id);
    if (!accountNumber) return [];
    const aliases = [
      accountNumber,
      ...String(row.all_account_numbers ?? "").split(","),
    ]
      .map(normalizePortalAccessAccountNumber)
      .filter(Boolean);
    const customerType = getPortalCustomerTypeInfo(row.customer_type ?? "");
    const dashboard = portalDashboardV1Bundle.accountsById[accountNumber];
    const programs = normalizePortalAccessPrograms(
      dashboard?.authorized_users?.map((user) => user.targeted_programs ?? "") ??
        []
    );

    return [
      {
        accountNumber,
        aliases: [...new Set(aliases)],
        practiceName: row.business_name?.trim() || accountNumber,
        emails: [...new Set(emailsByAccount.get(accountNumber) ?? [])],
        priceLists: normalizeAssignedPriceListCodes(row.price_lists ?? []),
        programs,
        // Onboarding is deliberately opt-in. It is enabled only by an
        // administrator's stored onboarding assignment.
        onboarding: false,
        customerTypeCode: customerType?.code ?? "",
        customerTypeLabel: customerType?.label ?? "",
        hasReports: Boolean(dashboard),
      } satisfies PortalAccessBaseAccount,
    ];
  });
}

export async function getEffectivePortalAccessAccounts() {
  const events = await getPortalAccessAdminEvents();
  return applyPortalAccessOverrides(basePortalAccessAccounts(), events);
}

export async function getEffectivePortalAccessAccount(identifier: string) {
  const normalized = normalizePortalAccessAccountNumber(identifier);
  if (!normalized) return undefined;
  return (await getEffectivePortalAccessAccounts()).find(
    (account) =>
      account.accountNumber === normalized || account.aliases.includes(normalized)
  );
}

export async function getEffectivePortalAccessAccountsForEmail(email: string) {
  const normalized = normalizePortalAccessEmail(email);
  if (!normalized) return [];
  return (await getEffectivePortalAccessAccounts()).filter((account) =>
    account.emails.includes(normalized)
  );
}

export async function appendPortalAccessAdminEvent(
  event: PortalAccessAdminEventInput
) {
  if (!getPortalAccessOverrideConfig().configured) {
    throw new Error(
      "Portal account storage is not configured. Add the R2 credentials first."
    );
  }

  const storedEvent = {
    ...event,
    id: event.id || randomUUID(),
    timestamp: event.timestamp || new Date().toISOString(),
    accountNumber: normalizePortalAccessAccountNumber(event.accountNumber),
    actorEmail: normalizePortalAccessEmail(event.actorEmail),
  } as PortalAccessAdminEvent;
  const safeTimestamp = storedEvent.timestamp.replace(/[:.]/g, "-");
  const key = `${eventPrefix()}/${safeTimestamp}-${storedEvent.id}.json`;
  const body = `${JSON.stringify(storedEvent, null, 2)}\n`;
  const bucket = r2Bucket();

  if (bucket) {
    await bucket.put(key, body, {
      httpMetadata: { contentType: "application/json" },
    });
    return storedEvent;
  }

  const connection = client();
  if (!connection) throw new Error("Portal account storage is unavailable.");
  await connection.client.send(
    new PutObjectCommand({
      Bucket: connection.bucketName,
      Key: key,
      Body: body,
      ContentType: "application/json",
    })
  );
  return storedEvent;
}

export function portalCustomerFromEffectiveAccount(
  account: EffectivePortalAccessAccount
): PortalCustomer {
  const portalSections: PortalCustomer["portalSections"] = [
    "pricing",
    "packages",
    "calculator",
    "catalog",
    "policies",
    "exports",
  ];
  if (account.hasReports) portalSections.push("performance");
  if (account.onboarding) portalSections.push("onboarding");

  return {
    accountNumber: account.accountNumber,
    practiceName: account.practiceName,
    emails: account.emails,
    priceLists: account.priceLists,
    allowedPriceLists: account.priceLists,
    portalSections,
    programs: account.programs,
    customerTypeCode: (account.customerTypeCode ?? "") as PortalCustomer["customerTypeCode"],
    customerTypeLabel: account.customerTypeLabel ?? "",
  };
}
