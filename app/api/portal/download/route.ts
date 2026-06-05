import { NextRequest } from "next/server";
import {
  GetObjectCommand,
  S3Client,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { getPortalAuthenticatedEmailFromHeaders } from "@/lib/portal/auth";
import { isPortalAdminEmail } from "@/lib/portal/admin";
import {
  getAuthorizedPortalCustomer,
  getAuthorizedPortalCustomers,
} from "@/lib/portal/portalAuthorization";
import { normalizeAccountNumber } from "@/lib/portal/normalizeAccounts";
import { getPriceListByCode } from "@/lib/portal/priceLists";
import { checkRateLimit } from "@/lib/portal/rateLimit";

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

type DownloadDiagnostics = {
  requestedCode: string;
  resolvedR2Key?: string;
  bucketName?: string;
  hasR2AccountId: boolean;
  hasR2AccessKeyId: boolean;
  hasR2SecretAccessKey: boolean;
  hasR2BucketName: boolean;
  hasAuthenticatedEmail: boolean;
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

function getR2Diagnostics(
  requestedCode: string,
  hasAuthenticatedEmail: boolean,
  resolvedR2Key?: string
): DownloadDiagnostics {
  return {
    requestedCode,
    resolvedR2Key,
    bucketName: process.env.R2_BUCKET_NAME?.trim() || "artisan-practice-files",
    hasR2AccountId: Boolean(process.env.R2_ACCOUNT_ID?.trim()),
    hasR2AccessKeyId: Boolean(process.env.R2_ACCESS_KEY_ID?.trim()),
    hasR2SecretAccessKey: Boolean(process.env.R2_SECRET_ACCESS_KEY?.trim()),
    hasR2BucketName: Boolean(
      process.env.R2_BUCKET_NAME?.trim() || "artisan-practice-files"
    ),
    hasAuthenticatedEmail,
  };
}

function logDownloadDiagnostic(
  message: string,
  diagnostics: DownloadDiagnostics,
  extra?: Record<string, unknown>
) {
  console.error("[portal-download]", message, {
    ...diagnostics,
    ...extra,
  });
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

function r2ErrorResponse(error: unknown, diagnostics: DownloadDiagnostics) {
  if (error instanceof S3ServiceException) {
    const statusCode = error.$metadata.httpStatusCode;
    const errorName = error.name;
    logDownloadDiagnostic("R2 S3 error", diagnostics, {
      errorName,
      statusCode,
    });

    if (errorName === "AccessDenied") {
      return textResponse("R2 AccessDenied.", 403);
    }

    if (errorName === "NoSuchBucket") {
      return textResponse("R2 NoSuchBucket.", 502);
    }

    if (errorName === "NoSuchKey" || statusCode === 404) {
      return textResponse("R2 NoSuchKey.", 404);
    }

    if (errorName === "SignatureDoesNotMatch") {
      return textResponse("R2 SignatureDoesNotMatch.", 502);
    }

    if (errorName === "InvalidAccessKeyId") {
      return textResponse("R2 InvalidAccessKeyId.", 502);
    }
  }

  logDownloadDiagnostic("Unhandled portal download error", diagnostics, {
    errorName: error instanceof Error ? error.name : "UnknownError",
    errorMessage: error instanceof Error ? error.message : "Unknown error",
  });

  return textResponse("Unable to retrieve file.", 502);
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
  const requestedCode =
    request.nextUrl.searchParams.get("code")?.trim().toUpperCase() ?? "";
  let diagnostics = getR2Diagnostics(requestedCode, false);

  try {
    const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown";
    const ipRate = checkRateLimit({
      key: `portal-download-ip:${ip}`,
      limit: 60,
      windowMs: 60_000,
    });
    if (!ipRate.allowed) return textResponse("Too many requests.", 429);

    const authenticatedEmail =
      getPortalAuthenticatedEmailFromHeaders(request.headers);
    diagnostics = getR2Diagnostics(requestedCode, Boolean(authenticatedEmail));

    if (!authenticatedEmail) {
      logDownloadDiagnostic("Missing authenticated email", diagnostics);

      return textResponse("Missing authenticated email.", 401);
    }

    const userRate = checkRateLimit({
      key: `portal-download-user:${authenticatedEmail}`,
      limit: 120,
      windowMs: 60_000,
    });
    if (!userRate.allowed) return textResponse("Too many requests.", 429);

    const requestedAccountNumber =
      request.nextUrl.searchParams.get("account")?.trim() ?? "";
    const customers = await getAuthorizedPortalCustomers(authenticatedEmail);
    const customer = requestedAccountNumber
      ? await getAuthorizedPortalCustomer(authenticatedEmail, requestedAccountNumber)
      : customers.length === 1
        ? customers[0]
        : undefined;

    const isAdmin = isPortalAdminEmail(authenticatedEmail);

    if (!customer && !isAdmin) {
      logDownloadDiagnostic("Unknown portal customer or missing account selection", diagnostics, {
        requestedAccountNumber: requestedAccountNumber
          ? normalizeAccountNumber(requestedAccountNumber)
          : "",
        accountCount: customers.length,
      });

      return textResponse(
        customers.length > 1
          ? "Missing account selection."
          : "You are not allowed to access this portal.",
        customers.length > 1 ? 400 : 403
      );
    }

    if (!requestedCode) {
      logDownloadDiagnostic("Missing price list code", diagnostics);

      return textResponse("Missing price list code.", 400);
    }

    const priceList = getPriceListByCode(requestedCode);

    if (!priceList) {
      logDownloadDiagnostic("Unknown price list code", diagnostics);

      return textResponse("Price sheet not found.", 404);
    }

    diagnostics = getR2Diagnostics(
      requestedCode,
      true,
      priceList.r2Key ?? undefined
    );

    if (!priceList.r2Key) {
      logDownloadDiagnostic("Missing R2 key for price list", diagnostics);

      return textResponse("PDF download is not available for this price sheet.", 404);
    }

    const assignedPriceListCodes = (customer?.priceLists ?? []).map((code) =>
      code.trim().toUpperCase()
    );

    if (!isAdmin && !assignedPriceListCodes.includes(priceList.code)) {
      logDownloadDiagnostic("Unauthorized price list", diagnostics, {
        accountNumber: customer?.accountNumber ?? "",
      });

      return textResponse("Unauthorized price list.", 403);
    }

    const bucket = getPracticeFilesBucket();

    if (bucket) {
      const file = await bucket.get(priceList.r2Key);

      if (!file) {
        logDownloadDiagnostic("R2 binding file not found", diagnostics);

        return textResponse("R2 NoSuchKey.", 404);
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
      logDownloadDiagnostic("Missing R2 environment variables", diagnostics);

      return textResponse("Missing R2 environment variables.", 500);
    }

    diagnostics = {
      ...diagnostics,
      bucketName: r2S3Config.bucketName,
    };
    const s3Client = getR2S3Client(r2S3Config);
    const file = await s3Client.send(
      new GetObjectCommand({
        Bucket: r2S3Config.bucketName,
        Key: priceList.r2Key,
      })
    );

    if (!file.Body) {
      logDownloadDiagnostic("R2 returned empty body", diagnostics);

      return textResponse("R2 NoSuchKey.", 404);
    }

    return new Response(await s3BodyToBodyInit(file.Body), {
      status: 200,
      headers: pdfHeaders(priceList.fileName),
    });
  } catch (error) {
    return r2ErrorResponse(error, diagnostics);
  }
}
