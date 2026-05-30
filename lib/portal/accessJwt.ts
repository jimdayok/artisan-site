import { createRemoteJWKSet, jwtVerify, type JWTPayload, type JWTVerifyGetKey } from "jose";

type VerifiedPortalJwt = {
  email: string;
  payload: JWTPayload;
};

function teamDomain() {
  return (
    process.env.CLOUDFLARE_ACCESS_TEAM_DOMAIN?.trim() ||
    process.env.CF_ACCESS_TEAM_DOMAIN?.trim() ||
    ""
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

let cachedJwks: JWTVerifyGetKey | null = null;

function getJwks() {
  if (cachedJwks) return cachedJwks;
  cachedJwks = createRemoteJWKSet(new URL(`${issuer()}/cdn-cgi/access/certs`));
  return cachedJwks;
}

export async function verifyCloudflareAccessJwt(
  token: string
): Promise<VerifiedPortalJwt | null> {
  if (!token) return null;

  const verificationAudience = audience();
  const verificationTeamDomain = teamDomain();

  if (!verificationAudience || !verificationTeamDomain) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[portal-auth] Missing Cloudflare Access JWT verification env. Expected CLOUDFLARE_ACCESS_TEAM_DOMAIN (or CF_ACCESS_TEAM_DOMAIN) and CLOUDFLARE_ACCESS_AUD (or CF_ACCESS_AUD)."
      );
    }
    return null;
  }

  try {
    const options = { issuer: `https://${verificationTeamDomain}`, audience: verificationAudience };
    const { payload } = await jwtVerify(token, getJwks(), options);
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
