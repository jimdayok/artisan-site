#!/usr/bin/env node

const DEFAULT_BASE_URL = "http://127.0.0.1:3000";

const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/artisan-model",
  "/provider-resources",
  "/lab-policies",
  "/newsletters",
  "/new-lab-partner",
];

const REDIRECT_ROUTES = [
  { source: "/contact", destination: "/new-lab-partner" },
  { source: "/contactus", destination: "/new-lab-partner" },
  { source: "/practice-resources", destination: "/provider-resources" },
  { source: "/pressreleases", destination: "/about#press-releases" },
  { source: "/shipping", destination: "/lab-policies#shipping" },
  { source: "/Shipping", destination: "/lab-policies#shipping" },
  { source: "/ourcraft", destination: "/artisan-model" },
  { source: "/our-craft-1", destination: "/artisan-model" },
  { source: "/pacificartisanlabs", destination: "/pacific-artisan-labs" },
  { source: "/pikeartisanlabs", destination: "/pike-artisan-labs" },
  { source: "/practicematters", destination: "/newsletters/practice-matters" },
];

const VERSION_REDIRECT_ROUTES = [
  { source: "/home-original", destination: "/" },
  { source: "/home-v2", destination: "/" },
  { source: "/home-version-a", destination: "/" },
  { source: "/home-version-b", destination: "/" },
  { source: "/home-version-c", destination: "/" },
  { source: "/resources-version-a", destination: "/provider-resources" },
  { source: "/resources-version-b", destination: "/provider-resources" },
  { source: "/resources-version-c", destination: "/provider-resources" },
];

const METADATA_ROUTES = [
  "/",
  "/about",
  "/artisan-model",
  "/provider-resources",
  "/lab-policies",
  "/new-lab-partner",
  "/privacy-policy",
  "/terms-and-conditions",
];

const PRODUCTION_ORIGIN = "https://www.artisanslabs.com";

const PROTECTED_ROUTES = [
  "/portal",
  "/portal/price-list/g6",
  "/api/portal/download?code=G6",
  "/private/price-list/g6",
];

const HIDDEN_PRICE_LIST_ROUTES = [
  "/portal/price-list/g5",
  "/private/price-list/g5",
];

const REQUIRED_NOINDEX_HEADERS = {
  "x-robots-tag": ["noindex", "nofollow", "noarchive"],
};

const RECOMMENDED_PRIVATE_CACHE_HEADERS = {
  "cache-control": ["private", "no-store"],
};

function parseArgs(argv) {
  const args = { baseUrl: DEFAULT_BASE_URL, accessAware: false };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--base-url") {
      args.baseUrl = argv[i + 1];
      i += 1;
    } else if (token === "--access-aware") {
      args.accessAware = true;
    }
  }
  return args;
}

function normalizeBaseUrl(raw) {
  const url = new URL(raw);
  return url.toString().replace(/\/$/, "");
}

function safeLower(v) {
  return (v || "").toLowerCase();
}

function summarizeHeaders(headers, required) {
  const missing = [];
  for (const [headerName, mustInclude] of Object.entries(required)) {
    const actual = headers.get(headerName) || "";
    const lower = safeLower(actual);
    for (const fragment of mustInclude) {
      if (!lower.includes(fragment.toLowerCase())) {
        missing.push(`${headerName}: ${fragment}`);
      }
    }
  }
  return missing;
}

function parseLocation(baseUrl, locationHeader) {
  if (!locationHeader) return null;
  try {
    const parsed = new URL(locationHeader, baseUrl);
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return locationHeader;
  }
}

function canonicalPath(path) {
  return path === "/" ? "/" : path.replace(/\/$/, "");
}

function expectedCanonicalUrl(path) {
  return `${PRODUCTION_ORIGIN}${path === "/" ? "" : canonicalPath(path)}`;
}

function htmlDecode(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractTitle(html) {
  return htmlDecode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "");
}

function extractMetaDescription(html) {
  const match = html.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i)
    ?? html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i);
  return htmlDecode(match?.[1]?.trim() ?? "");
}

function extractCanonical(html) {
  const match = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)
    ?? html.match(/<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i);
  return htmlDecode(match?.[1]?.trim() ?? "");
}

async function request(baseUrl, path, redirect = "manual") {
  const url = new URL(path, baseUrl).toString();
  try {
    const response = await fetch(url, { redirect });
    return { ok: true, url, response };
  } catch (error) {
    return { ok: false, url, error };
  }
}

function isEdgeSelfRedirect(path, status, location) {
  return status >= 300 && status < 400 && Boolean(location) && location === path;
}

function isCloudflareAccessLoginRedirect(location) {
  return Boolean(location && location.startsWith("/cdn-cgi/access/login/"));
}

async function checkPublicRoutes(baseUrl, options) {
  const results = [];
  for (const path of PUBLIC_ROUTES) {
    const res = await request(baseUrl, path, "manual");
    if (!res.ok) {
      results.push({
        area: "public",
        path,
        pass: false,
        blocking: true,
        status: "ERR",
        note: `Request failed: ${res.error.message}`,
      });
      continue;
    }
    const status = res.response.status;
    const location = parseLocation(baseUrl, res.response.headers.get("location"));
    const edgeSelfRedirect = options.accessAware && isEdgeSelfRedirect(path, status, location);
    const pass = (status >= 200 && status < 400) || edgeSelfRedirect;
    results.push({
      area: "public",
      path,
      pass,
      blocking: !edgeSelfRedirect,
      status,
      destination: location || "",
      note: edgeSelfRedirect
        ? "Edge canonical/self-redirect observed. Verify canonical host directly."
        : pass
          ? "OK"
          : "Public route did not return 2xx/3xx.",
    });
  }
  return results;
}

async function checkRedirects(baseUrl, options) {
  const results = [];
  for (const entry of REDIRECT_ROUTES) {
    const res = await request(baseUrl, entry.source, "manual");
    if (!res.ok) {
      results.push({
        area: "redirect",
        path: entry.source,
        pass: false,
        blocking: true,
        status: "ERR",
        expected: entry.destination,
        note: `Request failed: ${res.error.message}`,
      });
      continue;
    }

    const status = res.response.status;
    const location = parseLocation(baseUrl, res.response.headers.get("location"));
    const redirectStatus = status >= 300 && status < 400;
    const destinationMatch = location === entry.destination;
    const edgeSelfRedirect = options.accessAware && isEdgeSelfRedirect(entry.source, status, location);
    const pass = (redirectStatus && destinationMatch) || edgeSelfRedirect;

    results.push({
      area: "redirect",
      path: entry.source,
      pass,
      blocking: !edgeSelfRedirect,
      status,
      destination: location || "",
      expected: entry.destination,
      note: edgeSelfRedirect
        ? "Edge canonical/self-redirect observed. Validate this redirect on canonical launch domain."
        : pass
        ? "OK"
        : !redirectStatus
          ? "Expected redirect status."
          : "Redirect destination mismatch.",
    });
  }
  return results;
}

async function checkVersionRedirects(baseUrl, options) {
  const results = [];
  for (const entry of VERSION_REDIRECT_ROUTES) {
    const res = await request(baseUrl, entry.source, "manual");
    if (!res.ok) {
      results.push({
        area: "version-redirect",
        path: entry.source,
        pass: false,
        blocking: true,
        status: "ERR",
        expected: entry.destination,
        note: `Request failed: ${res.error.message}`,
      });
      continue;
    }

    const status = res.response.status;
    const location = parseLocation(baseUrl, res.response.headers.get("location"));
    const redirectStatus = status >= 300 && status < 400;
    const destinationMatch = location === entry.destination;
    const edgeSelfRedirect = options.accessAware && isEdgeSelfRedirect(entry.source, status, location);
    const pass = (redirectStatus && destinationMatch) || edgeSelfRedirect;

    results.push({
      area: "version-redirect",
      path: entry.source,
      pass,
      blocking: !edgeSelfRedirect,
      status,
      destination: location || "",
      expected: entry.destination,
      note: edgeSelfRedirect
        ? "Edge canonical/self-redirect observed. Validate version redirect on canonical launch domain."
        : pass
          ? "OK"
          : !redirectStatus
            ? "Expected staging/version page to redirect."
            : "Version redirect destination mismatch.",
    });
  }
  return results;
}

async function checkMetadata(baseUrl, options) {
  const results = [];
  const seenTitles = new Map();

  for (const path of METADATA_ROUTES) {
    const res = await request(baseUrl, path, "follow");
    if (!res.ok) {
      results.push({
        area: "metadata",
        path,
        pass: false,
        blocking: true,
        status: "ERR",
        note: `Request failed: ${res.error.message}`,
      });
      continue;
    }

    const status = res.response.status;
    const contentType = res.response.headers.get("content-type") ?? "";
    const html = contentType.includes("text/html") ? await res.response.text() : "";
    const title = extractTitle(html);
    const description = extractMetaDescription(html);
    const canonical = extractCanonical(html);
    const expectedCanonical = expectedCanonicalUrl(path);
    const duplicateTitlePath = title ? seenTitles.get(title) : "";
    if (title) seenTitles.set(title, path);

    const missing = [];
    if (!(status >= 200 && status < 300)) missing.push("2xx status");
    if (!title) missing.push("title");
    if (!description) missing.push("meta description");
    if (duplicateTitlePath) missing.push(`unique title (duplicates ${duplicateTitlePath})`);
    if (canonical !== expectedCanonical) {
      missing.push(`canonical ${expectedCanonical}`);
    }

    const location = parseLocation(baseUrl, res.response.headers.get("location"));
    const edgeSelfRedirect = options.accessAware && isEdgeSelfRedirect(path, status, location);

    results.push({
      area: "metadata",
      path,
      pass: missing.length === 0 || edgeSelfRedirect,
      blocking: !edgeSelfRedirect,
      status,
      destination: location || "",
      note: missing.length === 0
        ? "OK"
        : edgeSelfRedirect
          ? "Edge canonical/self-redirect observed. Verify metadata on canonical host."
          : `Missing or invalid: ${missing.join(", ")}`,
    });
  }

  return results;
}

async function checkRobotsAndSitemap(baseUrl, options) {
  const checks = [];

  const robotsRes = await request(baseUrl, "/robots.txt", "manual");
  if (!robotsRes.ok) {
    checks.push({
      area: "robots",
      path: "/robots.txt",
      pass: false,
      blocking: true,
      status: "ERR",
      note: `Request failed: ${robotsRes.error.message}`,
    });
  } else {
    const robotsStatus = robotsRes.response.status;
    const robotsLocation = parseLocation(baseUrl, robotsRes.response.headers.get("location"));
    if (options.accessAware && isEdgeSelfRedirect("/robots.txt", robotsStatus, robotsLocation)) {
      checks.push({
        area: "robots",
        path: "/robots.txt",
        pass: true,
        blocking: false,
        status: robotsStatus,
        destination: robotsLocation || "",
        note: "Edge canonical/self-redirect observed. Verify robots on canonical host.",
      });
    } else {
      const text = await robotsRes.response.text();
      const requiredLines = [
        "Disallow: /portal",
        "Disallow: /portal/",
        "Disallow: /private",
        "Disallow: /private/",
        "Disallow: /api",
        "Disallow: /api/",
      ];
      const missingLines = requiredLines.filter((line) => !text.includes(line));
      checks.push({
        area: "robots",
        path: "/robots.txt",
        pass: robotsRes.response.status === 200 && missingLines.length === 0,
        blocking: true,
        status: robotsRes.response.status,
        note:
          missingLines.length === 0
            ? "OK"
            : `Missing disallow rules: ${missingLines.join(", ")}`,
      });
    }
  }

  const sitemapRes = await request(baseUrl, "/sitemap.xml", "manual");
  if (!sitemapRes.ok) {
    checks.push({
      area: "sitemap",
      path: "/sitemap.xml",
      pass: false,
      blocking: true,
      status: "ERR",
      note: `Request failed: ${sitemapRes.error.message}`,
    });
  } else {
    const sitemapStatus = sitemapRes.response.status;
    const sitemapLocation = parseLocation(baseUrl, sitemapRes.response.headers.get("location"));
    if (options.accessAware && isEdgeSelfRedirect("/sitemap.xml", sitemapStatus, sitemapLocation)) {
      checks.push({
        area: "sitemap",
        path: "/sitemap.xml",
        pass: true,
        blocking: false,
        status: sitemapStatus,
        destination: sitemapLocation || "",
        note: "Edge canonical/self-redirect observed. Verify sitemap on canonical host.",
      });
    } else {
      const xml = await sitemapRes.response.text();
      const missingPublicRoutes = PUBLIC_ROUTES.filter((route) => {
        const path = route === "/" ? "/" : route;
        return !xml.includes(`<loc>`) || !xml.includes(path);
      }).filter((route) => route !== "/");

      checks.push({
        area: "sitemap",
        path: "/sitemap.xml",
        pass: sitemapRes.response.status === 200 && missingPublicRoutes.length === 0,
        blocking: true,
        status: sitemapRes.response.status,
        note:
          missingPublicRoutes.length === 0
            ? "OK"
            : `Missing expected route references: ${missingPublicRoutes.join(", ")}`,
      });
    }
  }

  return checks;
}

async function checkProtectedRoutes(baseUrl) {
  const results = [];
  for (const path of PROTECTED_ROUTES) {
    const res = await request(baseUrl, path, "manual");
    if (!res.ok) {
      results.push({
        area: "protected",
        path,
        pass: false,
        blocking: true,
        status: "ERR",
        missingHeaders: Object.keys(REQUIRED_NOINDEX_HEADERS),
        note: `Request failed: ${res.error.message}`,
      });
      continue;
    }

    const status = res.response.status;
    const location = parseLocation(baseUrl, res.response.headers.get("location"));
    const accessLoginIntercept = isCloudflareAccessLoginRedirect(location);
    const missingNoindexHeaders = summarizeHeaders(res.response.headers, REQUIRED_NOINDEX_HEADERS);
    const missingCacheHeaders = summarizeHeaders(
      res.response.headers,
      RECOMMENDED_PRIVATE_CACHE_HEADERS,
    );

    // Allow a wide envelope because auth can yield login page, redirect, 401, or 403.
    const statusAcceptable = [200, 302, 303, 307, 308, 401, 403].includes(status);
    const pass =
      (statusAcceptable && missingNoindexHeaders.length === 0) || accessLoginIntercept;

    results.push({
      area: "protected",
      path,
      pass,
      blocking: true,
      status,
      destination: location || "",
      missingHeaders: missingNoindexHeaders,
      missingRecommendedCacheHeaders: missingCacheHeaders,
      note: pass
        ? accessLoginIntercept
          ? "Cloudflare Access login intercept observed (expected at edge)."
          : "OK"
        : !statusAcceptable
          ? "Unexpected status for protected route."
          : "Missing required noindex headers.",
    });
  }
  return results;
}

async function checkHiddenPriceLists(baseUrl) {
  const results = [];
  for (const path of HIDDEN_PRICE_LIST_ROUTES) {
    const res = await request(baseUrl, path, "manual");
    if (!res.ok) {
      results.push({
        area: "hidden-price-list",
        path,
        pass: false,
        blocking: true,
        status: "ERR",
        note: `Request failed: ${res.error.message}`,
      });
      continue;
    }

    const status = res.response.status;
    const missingNoindexHeaders = summarizeHeaders(res.response.headers, REQUIRED_NOINDEX_HEADERS);
    const pass = status === 404 && missingNoindexHeaders.length === 0;
    results.push({
      area: "hidden-price-list",
      path,
      pass,
      blocking: true,
      status,
      missingHeaders: missingNoindexHeaders,
      note: pass
        ? "OK"
        : status !== 404
          ? "Hidden price list direct URL must return 404."
          : "Hidden price list response is missing noindex headers.",
    });
  }
  return results;
}

async function checkPortalAuth(baseUrl, options) {
  const res = await request(baseUrl, "/portal", "manual");
  if (!res.ok) {
    return [{
      area: "portal-auth",
      path: "/portal",
      pass: false,
      blocking: true,
      status: "ERR",
      note: `Request failed: ${res.error.message}`,
    }];
  }

  const status = res.response.status;
  const location = parseLocation(baseUrl, res.response.headers.get("location"));
  const accessLoginIntercept = isCloudflareAccessLoginRedirect(location);
  const missingNoindexHeaders = summarizeHeaders(res.response.headers, REQUIRED_NOINDEX_HEADERS);

  let body = "";
  const contentType = res.response.headers.get("content-type") ?? "";
  if (contentType.includes("text/html")) {
    body = await res.response.text();
  }

  const explicitAuthBlock =
    [401, 403].includes(status) ||
    accessLoginIntercept ||
    body.includes("Unable to verify your secure login") ||
    body.includes("Your login was verified, but your account has not yet been assigned portal access") ||
    body.includes("Portal access unavailable") ||
    body.includes("Local Test Login") ||
    body.includes("Local Portal Test Login");
  const pass =
    (explicitAuthBlock && missingNoindexHeaders.length === 0) ||
    (options.accessAware && accessLoginIntercept);

  return [{
    area: "portal-auth",
    path: "/portal",
    pass,
    blocking: true,
    status,
    destination: location || "",
    missingHeaders: missingNoindexHeaders,
    note: pass
      ? accessLoginIntercept
        ? "Cloudflare Access login intercept observed."
        : "Unauthenticated portal request did not expose portal data."
      : !explicitAuthBlock
        ? "Unauthenticated portal request did not show an auth block."
        : "Portal auth response is missing noindex headers.",
  }];
}

function printSection(title, rows) {
  console.log(`\n=== ${title} ===`);
  for (const row of rows) {
    const statusStr = `${row.pass ? "PASS" : "FAIL"} | ${row.status}`;
    const extra = [];
    if (row.destination) extra.push(`dest=${row.destination}`);
    if (row.expected) extra.push(`expected=${row.expected}`);
    if (row.missingHeaders?.length) extra.push(`missingHeaders=${row.missingHeaders.join("; ")}`);
    if (row.missingRecommendedCacheHeaders?.length) {
      extra.push(
        `missingRecommendedCacheHeaders=${row.missingRecommendedCacheHeaders.join("; ")}`,
      );
    }
    extra.push(`note=${row.note}`);
    console.log(`${statusStr} | ${row.path} | ${extra.join(" | ")}`);
  }
}

function printSummary(allRows) {
  const failed = allRows.filter((r) => !r.pass);
  const blockers = failed.filter((r) => r.blocking);

  console.log("\n=== Launch Blocker Summary ===");
  console.log(`Total checks: ${allRows.length}`);
  console.log(`Passed: ${allRows.length - failed.length}`);
  console.log(`Failed: ${failed.length}`);
  console.log(`Blocking failures: ${blockers.length}`);

  if (blockers.length > 0) {
    for (const item of blockers) {
      console.log(`- ${item.area}:${item.path} -> ${item.note}`);
    }
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const baseUrl = normalizeBaseUrl(args.baseUrl);
  console.log(
    `ALN launch verification starting for ${baseUrl}${
      args.accessAware ? " (Cloudflare Access aware mode)" : ""
    }`
  );

  const [
    publicChecks,
    redirectChecks,
    versionRedirectChecks,
    metadataChecks,
    robotsSitemapChecks,
    protectedChecks,
    hiddenPriceListChecks,
    portalAuthChecks,
  ] = await Promise.all([
    checkPublicRoutes(baseUrl, args),
    checkRedirects(baseUrl, args),
    checkVersionRedirects(baseUrl, args),
    checkMetadata(baseUrl, args),
    checkRobotsAndSitemap(baseUrl, args),
    checkProtectedRoutes(baseUrl),
    checkHiddenPriceLists(baseUrl),
    checkPortalAuth(baseUrl, args),
  ]);

  printSection("Public Route Status", publicChecks);
  printSection("Redirect Status", redirectChecks);
  printSection("Staging/Version Redirect Status", versionRedirectChecks);
  printSection("Metadata Status", metadataChecks);
  printSection("Sitemap and Robots", robotsSitemapChecks);
  printSection("Protected Routes + Headers", protectedChecks);
  printSection("Hidden Price List Direct URL Status", hiddenPriceListChecks);
  printSection("Portal Auth Status", portalAuthChecks);

  const allRows = [
    ...publicChecks,
    ...redirectChecks,
    ...versionRedirectChecks,
    ...metadataChecks,
    ...robotsSitemapChecks,
    ...protectedChecks,
    ...hiddenPriceListChecks,
    ...portalAuthChecks,
  ];
  printSummary(allRows);

  if (allRows.some((row) => !row.pass && row.blocking)) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Launch verification script failed:", error);
  process.exitCode = 1;
});
