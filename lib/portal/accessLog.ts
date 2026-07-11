import "server-only";

import {
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";

export type PortalAccessEvent = {
  timestamp: string;
  email: string;
  ipAddress: string;
  path: string;
  method: string;
  userAgent: string;
};

type CloudflarePortalEnv = { PRACTICE_FILES?: unknown };
type R2LogBucket = R2Bucket & {
  put: (key: string, value: string, options?: { httpMetadata?: { contentType?: string } }) => Promise<unknown>;
  list: (options?: { prefix?: string; limit?: number }) => Promise<{ objects: Array<{ key: string }> }>;
};

let cachedClient: S3Client | undefined;

function r2Bucket() {
  const candidate = (globalThis as unknown as CloudflarePortalEnv).PRACTICE_FILES;
  if (candidate && typeof (candidate as R2LogBucket).put === "function") {
    return candidate as R2LogBucket;
  }
  return undefined;
}

function r2Config() {
  const accountId = process.env.R2_ACCOUNT_ID?.trim() ?? "";
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim() ?? "";
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim() ?? "";
  const bucketName = process.env.R2_BUCKET_NAME?.trim() || "artisan-practice-files";
  if (!accountId || !accessKeyId || !secretAccessKey) return undefined;
  return { accountId, accessKeyId, secretAccessKey, bucketName };
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

function eventKey(event: PortalAccessEvent) {
  const day = event.timestamp.slice(0, 10);
  const reverseTime = String(9_999_999_999_999 - Date.parse(event.timestamp)).padStart(13, "0");
  return `portal-access-logs/${day}/${reverseTime}-${randomUUID()}.json`;
}

export function portalAccessLoggingConfigured() {
  return Boolean(r2Bucket() || r2Config());
}

export async function recordPortalAccess(event: PortalAccessEvent) {
  const body = JSON.stringify(event);
  const key = eventKey(event);
  try {
    const bucket = r2Bucket();
    if (bucket) {
      await bucket.put(key, body, { httpMetadata: { contentType: "application/json" } });
      return true;
    }
    const connection = client();
    if (!connection) return false;
    await connection.client.send(
      new PutObjectCommand({
        Bucket: connection.bucketName,
        Key: key,
        Body: body,
        ContentType: "application/json",
      })
    );
    return true;
  } catch (error) {
    console.error("[portal-access-log] Unable to record access event", error);
    return false;
  }
}

async function readEvent(key: string) {
  const bucket = r2Bucket();
  if (bucket) {
    const object = await bucket.get(key);
    if (!object) return undefined;
    return JSON.parse(await new Response(object.body).text()) as PortalAccessEvent;
  }
  const connection = client();
  if (!connection) return undefined;
  const object = await connection.client.send(
    new GetObjectCommand({ Bucket: connection.bucketName, Key: key })
  );
  const body = await object.Body?.transformToString();
  return body ? (JSON.parse(body) as PortalAccessEvent) : undefined;
}

export async function getRecentPortalAccessEvents(limit = 100) {
  try {
    const keys: string[] = [];
    for (let daysAgo = 0; daysAgo < 30 && keys.length < limit; daysAgo += 1) {
      const day = new Date();
      day.setUTCDate(day.getUTCDate() - daysAgo);
      const prefix = `portal-access-logs/${day.toISOString().slice(0, 10)}/`;
      const bucket = r2Bucket();
      if (bucket) {
        const result = await bucket.list({ prefix, limit: Math.min(limit, 1000) });
        keys.push(...result.objects.map((object) => object.key));
      } else {
        const connection = client();
        if (!connection) return [];
        const result = await connection.client.send(
          new ListObjectsV2Command({
            Bucket: connection.bucketName,
            Prefix: prefix,
            MaxKeys: Math.min(limit, 1000),
          })
        );
        keys.push(...(result.Contents ?? []).flatMap((object) => (object.Key ? [object.Key] : [])));
      }
    }
    const recentKeys = keys.slice(0, limit);
    const events = await Promise.all(recentKeys.map(readEvent));
    return events.filter((event): event is PortalAccessEvent => Boolean(event));
  } catch (error) {
    console.error("[portal-access-log] Unable to read access events", error);
    return [];
  }
}
