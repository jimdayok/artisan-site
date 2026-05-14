import { NextRequest } from "next/server";
import {
  GetObjectCommand,
  S3Client,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { getCloudflareAccessEmailFromHeaders } from "@/lib/portal/auth";
import { getCustomerByEmail } from "@/lib/portal/customers";
import { getPriceListByCode } from "@/lib/portal/priceLists";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CloudflarePortalEnv = {
  PRACTICE_FILES?: unknown;
};

type R2S3Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
};

let cachedR2S3Client: S3Client | undefined;

function isR2Bucket(bucket: unknown): bucket is R2Bucket {
  return Boolean(bucket && typeof (bucket as R2Bucket).get === "function");
}

function getPracticeFilesBucket() {
  const globalBucket = (globalThis as unknown as CloudflarePortalEnv).PRACTICE_FILES;

  if (isR2Bucket(globalBucket)) return globalBucket;

  if (typeof process !== "undefined") {
    const processBucket = (process.env as unknown as CloudflarePortalEnv)
      .PRACTICE_FILES;

    if (isR2Bucket(processBucket)) return processBucket;
  }

  return undefined;
}

function getR2S3Config(): R2S3Config | undefined {
  const accountId = process.env.R2_ACCOUNT_ID?.trim() ?? "";
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim() ?? "";
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim() ?? "";
  const bucketName =
    process.env.R2_BUCKET_NAME?.trim() || "artisan-practice-files";

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    return undefined;
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
  };
}

function getR2S3Client(config: R2S3Config) {
  if (cachedR2S3Client) return cachedR2S3Client;

  cachedR2S3Client = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return cachedR2S3Client;
}

function textResponse(message: string, status: number) {
  return new Response(message, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}

function pdfHeaders(fileName: string) {
  return {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${fileName}"`,
    "Cache-Control": "private, no-store",
  };
}

function bytesToBlob(bytes: Uint8Array) {
  const arrayBuffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(arrayBuffer).set(bytes);

  return new Blob([arrayBuffer]);
}

async function s3BodyToBodyInit(body: unknown): Promise<BodyInit> {
  const transformableBody = body as {
    transformToByteArray?: () => Promise<Uint8Array>;
    transformToWebStream?: () => ReadableStream;
  };

  if (typeof transformableBody.transformToWebStream === "function") {
    return transformableBody.transformToWebStream();
  }

  if (typeof transformableBody.transformToByteArray === "function") {
    const bytes = await transformableBody.transformToByteArray();

    return bytesToBlob(bytes);
  }

  if (body instanceof Uint8Array) {
    return bytesToBlob(body);
  }

  if (body instanceof Blob) {
    return body;
  }

  throw new Error("Unsupported R2 response body.");
}

export async function GET(request: NextRequest) {
  const authenticatedEmail =
    getCloudflareAccessEmailFromHeaders(request.headers);
  const requestedCode =
    request.nextUrl.searchParams.get("code")?.trim().toUpperCase() ?? "";

  if (!authenticatedEmail) {
    return textResponse("Secure portal authentication is required.", 401);
  }

  const customer = getCustomerByEmail(authenticatedEmail);

  if (!customer) {
    return textResponse("You are not allowed to access this portal.", 403);
  }

  if (!requestedCode) {
    return textResponse("Missing price list code.", 400);
  }

  const priceList = getPriceListByCode(requestedCode);

  if (!priceList) {
    return textResponse("Price sheet not found.", 404);
  }

  if (!priceList.r2Key) {
    return textResponse("PDF download is not available for this price sheet.", 404);
  }

  const assignedPriceListCodes = customer.priceLists.map((code) =>
    code.trim().toUpperCase()
  );

  if (!assignedPriceListCodes.includes(priceList.code)) {
    return textResponse("You are not allowed to access this file.", 403);
  }

  const bucket = getPracticeFilesBucket();

  if (bucket) {
    const file = await bucket.get(priceList.r2Key);

    if (!file) {
      return textResponse("File not found.", 404);
    }

    const responseHeaders = new Headers();
    file.writeHttpMetadata(responseHeaders);
    responseHeaders.set(
      "Content-Type",
      responseHeaders.get("Content-Type") ?? "application/pdf"
    );
    responseHeaders.set(
      "Content-Disposition",
      `attachment; filename="${priceList.fileName}"`
    );
    responseHeaders.set("Cache-Control", "private, no-store");

    return new Response(file.body, {
      status: 200,
      headers: responseHeaders,
    });
  }

  const r2S3Config = getR2S3Config();

  if (!r2S3Config) {
    return textResponse("File storage is not configured.", 500);
  }

  try {
    const s3Client = getR2S3Client(r2S3Config);
    const file = await s3Client.send(
      new GetObjectCommand({
        Bucket: r2S3Config.bucketName,
        Key: priceList.r2Key,
      })
    );

    if (!file.Body) {
      return textResponse("File not found.", 404);
    }

    return new Response(await s3BodyToBodyInit(file.Body), {
      status: 200,
      headers: pdfHeaders(priceList.fileName),
    });
  } catch (error) {
    if (
      error instanceof S3ServiceException &&
      (error.name === "NoSuchKey" || error.$metadata.httpStatusCode === 404)
    ) {
      return textResponse("File not found.", 404);
    }

    return textResponse("Unable to retrieve file.", 502);
  }
}
