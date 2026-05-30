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

const PROTECTED_ROUTES = [
  "/portal",
  "/portal/price-list/g6",
  "/api/portal/download?code=G6",
  "/private/price-list/g6",
];

const REQUIRED_NOINDEX_HEADERS = {
  "x-robots-tag": ["noindex", "nofollow", "noarchive"],
};

const RECOMMENDED_PRIVATE_CACHE_HEADERS = {
  "cache-control": ["private", "no-store"],
};

function parseArgs(argv) {
  const args = { baseUrl: DEFAULT_BASE_URL };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--base-url") {
      args.baseUrl = argv[i + 1];
      i += 1;
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

async function request(baseUrl, path, redirect = "manual") {
  const url = new URL(path, baseUrl).toString();
  try {
    const response = await fetch(url, { redirect });
    return { ok: true, url, response };
  } catch (error) {
    return { ok: false, url, error };
  }
}

async function checkPublicRoutes(baseUrl) {
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
    const pass = status >= 200 && status < 400;
    results.push({
      area: "public",
      path,
      pass,
      blocking: true,
      status,
      destination: location || "",
      note: pass ? "OK" : "Public route did not return 2xx/3xx.",
    });
  }
  return results;
}

async function checkRedirects(baseUrl) {
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
    const pass = redirectStatus && destinationMatch;

    results.push({
      area: "redirect",
      path: entry.source,
      pass,
      blocking: true,
      status,
      destination: location || "",
      expected: entry.destination,
      note: pass
        ? "OK"
        : !redirectStatus
          ? "Expected redirect status."
          : "Redirect destination mismatch.",
    });
  }
  return results;
}

async function checkRobotsAndSitemap(baseUrl) {
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
        missingHeaders: Object.keys(REQUIRED_PRIVATE_HEADERS),
        note: `Request failed: ${res.error.message}`,
      });
      continue;
    }

    const status = res.response.status;
    const location = parseLocation(baseUrl, res.response.headers.get("location"));
    const missingNoindexHeaders = summarizeHeaders(res.response.headers, REQUIRED_NOINDEX_HEADERS);
    const missingCacheHeaders = summarizeHeaders(
      res.response.headers,
      RECOMMENDED_PRIVATE_CACHE_HEADERS,
    );

    // Allow a wide envelope because auth can yield login page, redirect, 401, or 403.
    const statusAcceptable = [200, 302, 303, 307, 308, 401, 403].includes(status);
    const pass = statusAcceptable && missingNoindexHeaders.length === 0;

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
        ? "OK"
        : !statusAcceptable
          ? "Unexpected status for protected route."
          : "Missing required noindex headers.",
    });
  }
  return results;
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
  console.log(`ALN launch verification starting for ${baseUrl}`);

  const [publicChecks, redirectChecks, robotsSitemapChecks, protectedChecks] = await Promise.all([
    checkPublicRoutes(baseUrl),
    checkRedirects(baseUrl),
    checkRobotsAndSitemap(baseUrl),
    checkProtectedRoutes(baseUrl),
  ]);

  printSection("Public Route Status", publicChecks);
  printSection("Redirect Status", redirectChecks);
  printSection("Sitemap and Robots", robotsSitemapChecks);
  printSection("Protected Routes + Headers", protectedChecks);

  const allRows = [
    ...publicChecks,
    ...redirectChecks,
    ...robotsSitemapChecks,
    ...protectedChecks,
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
