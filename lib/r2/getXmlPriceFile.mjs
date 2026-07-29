import { createHash } from "node:crypto";
import { GetObjectCommand, S3Client, S3ServiceException } from "@aws-sdk/client-s3";
import { XMLParser, XMLValidator } from "fast-xml-parser";

export const DEFAULT_R2_BUCKET_NAME = "artisan-practice-files";
export const DEFAULT_R2_XML_PRICE_PREFIX = "xml_price_data";
export const DEFAULT_R2_REQUEST_TIMEOUT_MS = 60_000;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  trimValues: true,
});

let cachedR2S3Client;

function trimOrEmpty(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getR2S3Config() {
  const accountId = trimOrEmpty(process.env.R2_ACCOUNT_ID);
  const accessKeyId = trimOrEmpty(process.env.R2_ACCESS_KEY_ID);
  const secretAccessKey = trimOrEmpty(process.env.R2_SECRET_ACCESS_KEY);
  const bucketName = trimOrEmpty(process.env.R2_BUCKET_NAME) || DEFAULT_R2_BUCKET_NAME;
  const xmlPricePrefix = trimOrEmpty(process.env.R2_XML_PRICE_PREFIX) || DEFAULT_R2_XML_PRICE_PREFIX;

  const missing = [];

  if (!accountId) missing.push("R2_ACCOUNT_ID");
  if (!accessKeyId) missing.push("R2_ACCESS_KEY_ID");
  if (!secretAccessKey) missing.push("R2_SECRET_ACCESS_KEY");
  if (!bucketName) missing.push("R2_BUCKET_NAME");
  if (!xmlPricePrefix) missing.push("R2_XML_PRICE_PREFIX");

  if (missing.length > 0) {
    throw new Error(`Missing R2 environment variables: ${missing.join(", ")}`);
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    xmlPricePrefix,
  };
}

function getR2S3Client(config) {
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

function hashContent(content) {
  return createHash("sha256").update(content).digest("hex");
}

function resolveXmlPriceKey(fileName, xmlPricePrefix) {
  const normalizedPrefix = xmlPricePrefix.replace(/\/+$/u, "");
  return `${normalizedPrefix}/${fileName}`;
}

async function bodyToText(body) {
  const transformableBody = body;

  if (typeof transformableBody?.transformToByteArray === "function") {
    const bytes = await transformableBody.transformToByteArray();
    return Buffer.from(bytes).toString("utf8");
  }

  if (body instanceof Uint8Array) {
    return Buffer.from(body).toString("utf8");
  }

  if (body instanceof Blob) {
    return Buffer.from(await body.arrayBuffer()).toString("utf8");
  }

  if (typeof ReadableStream !== "undefined" && body instanceof ReadableStream) {
    const response = new Response(body);
    return await response.text();
  }

  throw new Error("Unsupported R2 XML response body.");
}

export function parseXmlPriceText(xml, fileName, key) {
  const validation = XMLValidator.validate(xml);
  if (validation !== true) {
    const detail = validation?.err
      ? `${validation.err.msg} at line ${validation.err.line}, column ${validation.err.col}`
      : "XML validation failed";
    throw new Error(`Malformed XML in R2 object ${key}: ${detail}`);
  }

  let parsed;

  try {
    parsed = parser.parse(xml);
  } catch (error) {
    throw new Error(
      `Malformed XML in R2 object ${key}: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  const rootName = Object.keys(parsed || {}).find((name) => !name.startsWith("?"));

  if (!rootName) {
    throw new Error(`Unable to find XML root in R2 object ${key}`);
  }

  return {
    fileName,
    key,
    rootName,
    parsedRoot: parsed[rootName],
  };
}

function s3ErrorMessage(error, key, bucketName) {
  if (
    !(error instanceof S3ServiceException) &&
    !(error && typeof error === "object" && typeof error.name === "string")
  ) {
    return null;
  }

  const httpStatusCode = error.$metadata?.httpStatusCode;

  if (error.name === "AccessDenied") {
    return `R2 access denied for ${bucketName}/${key}.`;
  }

  if (error.name === "NoSuchBucket") {
    return `R2 bucket not found: ${bucketName}.`;
  }

  if (error.name === "NoSuchKey" || httpStatusCode === 404) {
    return `R2 object not found: ${bucketName}/${key}.`;
  }

  if (error.name === "SignatureDoesNotMatch") {
    return `R2 signature mismatch for ${bucketName}/${key}.`;
  }

  if (error.name === "InvalidAccessKeyId") {
    return "R2 access key is invalid.";
  }

  return null;
}

export function getXmlPriceObjectKey(fileName, xmlPricePrefix = DEFAULT_R2_XML_PRICE_PREFIX) {
  return resolveXmlPriceKey(fileName, xmlPricePrefix);
}

function timeoutMessage(bucketName, key, timeoutMs) {
  return `R2 request timed out for bucket=${bucketName} key=${key} after ${timeoutMs}ms.`;
}

export async function downloadXmlPriceFile(
  fileName,
  {
    client,
    config: configOverride,
    timeoutMs = DEFAULT_R2_REQUEST_TIMEOUT_MS,
  } = {}
) {
  const config = configOverride ?? getR2S3Config();
  const key = resolveXmlPriceKey(fileName, config.xmlPricePrefix);
  const s3Client = client ?? getR2S3Client(config);
  const abortController = new AbortController();
  let timedOut = false;
  let response;
  let timeoutHandle;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutHandle = setTimeout(() => {
      timedOut = true;
      abortController.abort();
      reject(new Error(timeoutMessage(config.bucketName, key, timeoutMs)));
    }, timeoutMs);
  });

  try {
    response = await Promise.race([
      s3Client.send(
        new GetObjectCommand({
          Bucket: config.bucketName,
          Key: key,
        }),
        { abortSignal: abortController.signal }
      ),
      timeoutPromise,
    ]);

    if (!response.Body) {
      throw new Error(`R2 object returned an empty body: ${config.bucketName}/${key}`);
    }

    const xml = await Promise.race([
      bodyToText(response.Body),
      timeoutPromise,
    ]);

    return {
      fileName,
      key,
      xml,
      bucketName: config.bucketName,
      prefix: config.xmlPricePrefix,
      source: `r2://${config.bucketName}/${key}`,
      fileSizeBytes:
        typeof response.ContentLength === "number"
          ? response.ContentLength
          : Buffer.byteLength(xml),
      modifiedAt: response.LastModified?.toISOString() ?? new Date().toISOString(),
      sha256: hashContent(xml),
    };
  } catch (error) {
    if (timedOut || error?.name === "AbortError") {
      throw new Error(timeoutMessage(config.bucketName, key, timeoutMs));
    }
    const message = s3ErrorMessage(error, key, config.bucketName);
    if (message) {
      throw new Error(message);
    }
    if (error instanceof Error && error.message.startsWith("R2 object returned")) {
      throw error;
    }
    throw new Error(
      `Unable to fetch R2 object ${config.bucketName}/${key}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  } finally {
    clearTimeout(timeoutHandle);
  }
}

export function parseDownloadedXmlPriceFile(downloaded) {
  const parsed = parseXmlPriceText(downloaded.xml, downloaded.fileName, downloaded.key);

  return {
    ...downloaded,
    ...parsed,
  };
}

export async function getXmlPriceFile(fileName, options) {
  const downloaded = await downloadXmlPriceFile(fileName, options);
  return parseDownloadedXmlPriceFile(downloaded);
}
