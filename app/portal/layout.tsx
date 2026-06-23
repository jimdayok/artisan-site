import { headers } from "next/headers";
import { forbidden, unauthorized } from "next/navigation";
import AdminUtilityNav from "@/app/portal/AdminUtilityNav";
import { isPortalAdminEmail } from "@/lib/portal/admin";
import { verifyCloudflareAccessJwt } from "@/lib/portal/accessJwt";
import {
  CLOUDFLARE_ACCESS_JWT_COOKIE,
  getPortalAuthenticatedEmailFromHeaders,
  isLocalhostDevelopmentRequest,
} from "@/lib/portal/auth";

const ACCESS_JWT_HEADER = "cf-access-jwt-assertion";

function cookieValue(headerList: Headers, cookieName: string) {
  const cookieHeader = headerList.get("cookie") ?? "";

  return (
    cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(`${cookieName}=`))
      ?.slice(cookieName.length + 1) ?? ""
  );
}

async function getLayoutAuthenticatedEmail(headerList: Headers) {
  const authenticatedEmail = getPortalAuthenticatedEmailFromHeaders(headerList);

  if (isLocalhostDevelopmentRequest(headerList)) {
    return authenticatedEmail;
  }

  const authStatus = headerList.get("x-portal-auth-status") ?? "";
  if (authStatus === "403") forbidden();

  const token =
    headerList.get(ACCESS_JWT_HEADER)?.trim() ||
    cookieValue(headerList, CLOUDFLARE_ACCESS_JWT_COOKIE).trim();
  const verified = await verifyCloudflareAccessJwt(token);

  if (!verified) unauthorized();
  if (authenticatedEmail && authenticatedEmail !== verified.email) forbidden();

  return authenticatedEmail || verified.email;
}

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const authenticatedEmail = await getLayoutAuthenticatedEmail(headerList);
  const isAdmin = Boolean(
    authenticatedEmail && isPortalAdminEmail(authenticatedEmail)
  );

  return (
    <>
      {isAdmin ? <AdminUtilityNav /> : null}
      {children}
    </>
  );
}
