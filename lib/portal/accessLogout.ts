export function portalAccessLogoutUrl(requestUrl: string | URL) {
  const requestOrigin = new URL(requestUrl).origin;
  const logoutUrl = new URL("/cdn-cgi/access/logout", requestOrigin);

  logoutUrl.searchParams.set("returnTo", new URL("/", requestOrigin).toString());

  return logoutUrl.toString();
}
