import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

type VerifiedPortalJwt = {
  email: string;
  payload: JWTPayload;
};

const DEFAULT_TEAM_DOMAIN = "artisanslabs.cloudflareaccess.com";

function teamDomain() {
  return (
    process.env.CLOUDFLARE_ACCESS_TEAM_DOMAIN?.trim() ||
    process.env.CF_ACCESS_TEAM_DOMAIN?.trim() ||
    DEFAULT_TEAM_DOMAIN
  );
}

function audience() {
  return (
    process.env.CLOUDFLARE_ACCESS_AUD?.trim() ||
    process.env.CF_ACCESS_AUD?.trim() ||
    ""
  );
}

function issuer() {
  return `https://${teamDomain()}`;
}

function certsUrl() {
  return new URL(`${issuer()}/cdn-cgi/access/certs`);
}

const JWKS = createRemoteJWKSet(certsUrl());

export async function verifyCloudflareAccessJwt(
  token: string
): Promise<VerifiedPortalJwt | null> {
  if (!token) return null;

  try {
    const verificationAudience = audience();
    const options =
      verificationAudience.length > 0
        ? { issuer: issuer(), audience: verificationAudience }
        : { issuer: issuer() };
    const { payload } = await jwtVerify(token, JWKS, options);
    const email =
      String(payload.email ?? payload.sub ?? "")
        .trim()
        .toLowerCase();

    if (!email || !email.includes("@")) return null;

    return { email, payload };
  } catch {
    return null;
  }
}
