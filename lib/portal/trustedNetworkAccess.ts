import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { isIP } from "node:net";
import { TRUSTED_NETWORK_ADMIN_EMAIL } from "./adminAccess.ts";
import { isPortalHostRequest } from "./auth.ts";

export const TRUSTED_NETWORK_AUTH_METHOD_HEADER = "x-portal-auth-method";
export const TRUSTED_NETWORK_AUTH_METHOD = "trusted-network-master-password";
export const TRUSTED_NETWORK_SESSION_COOKIE = "artisan_trusted_network_admin";
export const TRUSTED_NETWORK_LOGIN_PATH = "/portal/network-access";
export const TRUSTED_NETWORK_SESSION_PATH =
  "/api/portal/network-access/session";
export const TRUSTED_NETWORK_SESSION_TTL_SECONDS = 60 * 60 * 8;
export const TRUSTED_NETWORK_EDGE_TIME_HEADER = "x-artisan-edge-time";
export const TRUSTED_NETWORK_EDGE_PROOF_HEADER = "x-artisan-edge-proof";

const PASSWORD_HASH_PREFIX = "scrypt-v1";
const PASSWORD_KEY_LENGTH = 32;
const MINIMUM_SESSION_SECRET_LENGTH = 32;
const MINIMUM_EDGE_SECRET_LENGTH = 32;
const EDGE_PROOF_MAX_AGE_SECONDS = 120;

type SessionPayload = {
  version: 1;
  clientIp: string;
  expiresAt: number;
  nonce: string;
};

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function safeEqual(left: Buffer, right: Buffer) {
  return left.length === right.length && timingSafeEqual(left, right);
}

export function normalizeTrustedNetworkIp(value: unknown) {
  let candidate = String(value ?? "").trim();
  if (!candidate) return "";

  if (candidate.startsWith("[") && candidate.includes("]")) {
    candidate = candidate.slice(1, candidate.indexOf("]"));
  }
  candidate = candidate.split("%")[0] ?? "";
  if (candidate.toLowerCase().startsWith("::ffff:")) {
    candidate = candidate.slice("::ffff:".length);
  }

  return isIP(candidate) ? candidate.toLowerCase() : "";
}

export function configuredTrustedNetworkIps(
  configuredValue = process.env.PORTAL_TRUSTED_NETWORK_IPS ?? ""
) {
  return new Set(
    configuredValue
      .split(/[\s,]+/)
      .map(normalizeTrustedNetworkIp)
      .filter(Boolean)
  );
}

export function getTrustedNetworkClientIp(headers: Headers) {
  return normalizeTrustedNetworkIp(headers.get("cf-connecting-ip"));
}

function trustedNetworkEdgeSecret() {
  return process.env.PORTAL_TRUSTED_NETWORK_EDGE_SECRET?.trim() ?? "";
}

function edgeProofSignature(clientIp: string, timestamp: string, secret: string) {
  return createHmac("sha256", secret)
    .update(`${clientIp}\n${timestamp}`)
    .digest();
}

export function createTrustedNetworkEdgeProof(
  clientIp: string,
  timestamp: number,
  secret: string
) {
  const normalizedIp = normalizeTrustedNetworkIp(clientIp);
  if (!normalizedIp || secret.length < MINIMUM_EDGE_SECRET_LENGTH) return "";

  return edgeProofSignature(normalizedIp, String(timestamp), secret).toString(
    "base64url"
  );
}

export function verifyTrustedNetworkEdgeProof(
  headers: Headers,
  now = Date.now(),
  secret = trustedNetworkEdgeSecret()
) {
  if (secret.length < MINIMUM_EDGE_SECRET_LENGTH) return false;

  const clientIp = getTrustedNetworkClientIp(headers);
  const timestampValue = headers.get(TRUSTED_NETWORK_EDGE_TIME_HEADER)?.trim() ?? "";
  const proofValue = headers.get(TRUSTED_NETWORK_EDGE_PROOF_HEADER)?.trim() ?? "";
  if (!clientIp || !/^\d{10}$/.test(timestampValue) || !proofValue) return false;

  const timestamp = Number(timestampValue);
  const nowSeconds = Math.floor(now / 1000);
  if (
    !Number.isSafeInteger(timestamp) ||
    Math.abs(nowSeconds - timestamp) > EDGE_PROOF_MAX_AGE_SECONDS
  ) {
    return false;
  }

  try {
    const receivedProof = Buffer.from(proofValue, "base64url");
    const expectedProof = edgeProofSignature(clientIp, timestampValue, secret);
    return safeEqual(receivedProof, expectedProof);
  } catch {
    return false;
  }
}

export function isTrustedNetworkRequest(
  headers: Headers,
  configuredValue = process.env.PORTAL_TRUSTED_NETWORK_IPS ?? "",
  nodeEnv = process.env.NODE_ENV
) {
  // Production traffic must have traversed Cloudflare and must be addressed to
  // an approved portal hostname. This prevents caller-supplied IP headers on a
  // direct *.vercel.app request from becoming an authentication signal.
  if (nodeEnv === "production") {
    if (
      !headers.get("cf-ray") ||
      !isPortalHostRequest(headers) ||
      !verifyTrustedNetworkEdgeProof(headers)
    ) {
      return false;
    }
  }

  const clientIp = getTrustedNetworkClientIp(headers);
  return Boolean(
    clientIp && configuredTrustedNetworkIps(configuredValue).has(clientIp)
  );
}

export function hashTrustedNetworkPassword(
  password: string,
  salt = randomBytes(16)
) {
  const derivedKey = scryptSync(password, salt, PASSWORD_KEY_LENGTH);
  return [
    PASSWORD_HASH_PREFIX,
    salt.toString("base64url"),
    derivedKey.toString("base64url"),
  ].join("$");
}

export function verifyTrustedNetworkPassword(
  password: string,
  encodedHash = process.env.PORTAL_TRUSTED_NETWORK_PASSWORD_HASH ?? ""
) {
  if (!password || password.length > 512) return false;

  const [prefix, encodedSalt, encodedExpected, ...extra] =
    encodedHash.split("$");
  if (
    prefix !== PASSWORD_HASH_PREFIX ||
    !encodedSalt ||
    !encodedExpected ||
    extra.length
  ) {
    return false;
  }

  try {
    const salt = Buffer.from(encodedSalt, "base64url");
    const expected = Buffer.from(encodedExpected, "base64url");
    if (salt.length < 16 || expected.length !== PASSWORD_KEY_LENGTH) return false;
    const actual = scryptSync(password, salt, expected.length);
    return safeEqual(actual, expected);
  } catch {
    return false;
  }
}

function trustedNetworkSessionSecret() {
  return process.env.PORTAL_TRUSTED_NETWORK_SESSION_SECRET?.trim() ?? "";
}

function sessionSignature(encodedPayload: string, secret: string) {
  return createHmac("sha256", secret).update(encodedPayload).digest();
}

export function createTrustedNetworkSession(
  clientIp: string,
  now = Date.now(),
  secret = trustedNetworkSessionSecret()
) {
  const normalizedIp = normalizeTrustedNetworkIp(clientIp);
  if (!normalizedIp || secret.length < MINIMUM_SESSION_SECRET_LENGTH) return "";

  const payload: SessionPayload = {
    version: 1,
    clientIp: normalizedIp,
    expiresAt: Math.floor(now / 1000) + TRUSTED_NETWORK_SESSION_TTL_SECONDS,
    nonce: randomBytes(16).toString("base64url"),
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = sessionSignature(encodedPayload, secret).toString("base64url");
  return `${encodedPayload}.${signature}`;
}

export function verifyTrustedNetworkSession(
  token: string,
  clientIp: string,
  now = Date.now(),
  secret = trustedNetworkSessionSecret()
) {
  const normalizedIp = normalizeTrustedNetworkIp(clientIp);
  if (!token || !normalizedIp || secret.length < MINIMUM_SESSION_SECRET_LENGTH) {
    return false;
  }

  const [encodedPayload, encodedSignature, ...extra] = token.split(".");
  if (!encodedPayload || !encodedSignature || extra.length) return false;

  try {
    const receivedSignature = Buffer.from(encodedSignature, "base64url");
    const expectedSignature = sessionSignature(encodedPayload, secret);
    if (!safeEqual(receivedSignature, expectedSignature)) return false;

    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as Partial<SessionPayload>;
    return (
      payload.version === 1 &&
      payload.clientIp === normalizedIp &&
      typeof payload.expiresAt === "number" &&
      payload.expiresAt > Math.floor(now / 1000) &&
      typeof payload.nonce === "string" &&
      payload.nonce.length >= 16
    );
  } catch {
    return false;
  }
}

export function trustedNetworkConfigurationIssues() {
  const issues: string[] = [];
  if (configuredTrustedNetworkIps().size === 0) issues.push("trusted IPs");
  if (!process.env.PORTAL_TRUSTED_NETWORK_PASSWORD_HASH?.trim()) {
    issues.push("master password hash");
  }
  if (trustedNetworkSessionSecret().length < MINIMUM_SESSION_SECRET_LENGTH) {
    issues.push("session secret");
  }
  if (
    process.env.NODE_ENV === "production" &&
    trustedNetworkEdgeSecret().length < MINIMUM_EDGE_SECRET_LENGTH
  ) {
    issues.push("Cloudflare edge proof secret");
  }
  return issues;
}

export function sanitizeTrustedNetworkReturnTo(value: unknown) {
  const candidate = String(value ?? "").trim();
  if (!candidate.startsWith("/") || candidate.startsWith("//")) {
    return "/portal/admin";
  }

  try {
    const target = new URL(candidate, "https://portal.invalid");
    if (
      target.origin !== "https://portal.invalid" ||
      !target.pathname.startsWith("/portal") ||
      target.pathname === TRUSTED_NETWORK_LOGIN_PATH
    ) {
      return "/portal/admin";
    }
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return "/portal/admin";
  }
}

export function trustedNetworkIdentityLabel(email: string) {
  return email.trim().toLowerCase() === TRUSTED_NETWORK_ADMIN_EMAIL
    ? "Artisan lab / VPN master access"
    : email;
}
