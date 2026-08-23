#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const USER_AGENT =
  "D2DMarketingSEOAudit/1.0 (+https://www.d2dmktg.com; technical SEO audit)";
const DEFAULT_LIMIT = 250;
const SKIP_PREFIXES = ["/api/", "/portal", "/private", "/cdn-cgi/"];
const HTML_ENTITIES = new Map([
  ["amp", "&"],
  ["quot", '"'],
  ["apos", "'"],
  ["lt", "<"],
  ["gt", ">"],
  ["nbsp", " "],
]);

function parseArgs(argv) {
  const args = {};
  for (let index = 2; index < argv.length; index += 1) {
    const key = argv[index];
    if (!key.startsWith("--")) continue;
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      args[key.slice(2)] = true;
    } else {
      args[key.slice(2)] = value;
      index += 1;
    }
  }
  return args;
}

function decodeEntities(value = "") {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    const normalized = entity.toLowerCase();
    if (HTML_ENTITIES.has(normalized)) return HTML_ENTITIES.get(normalized);
    if (normalized.startsWith("#x")) {
      return String.fromCodePoint(Number.parseInt(normalized.slice(2), 16));
    }
    if (normalized.startsWith("#")) {
      return String.fromCodePoint(Number.parseInt(normalized.slice(1), 10));
    }
    return match;
  });
}

function stripTags(value = "") {
  return decodeEntities(
    value
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

function getAttribute(tag, name) {
  const pattern = new RegExp(
    `\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
    "i"
  );
  const match = tag.match(pattern);
  return decodeEntities(match?.[1] ?? match?.[2] ?? match?.[3] ?? "").trim();
}

function firstMatch(html, pattern) {
  const match = html.match(pattern);
  return stripTags(match?.[1] ?? "");
}

function metaContent(html, selectorName, selectorValue) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    if (getAttribute(tag, selectorName).toLowerCase() === selectorValue.toLowerCase()) {
      return getAttribute(tag, "content");
    }
  }
  return "";
}

function linkHref(html, relValue) {
  const tags = html.match(/<link\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const rel = getAttribute(tag, "rel")
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    if (rel.includes(relValue.toLowerCase())) return getAttribute(tag, "href");
  }
  return "";
}

function jsonLdTypes(html) {
  const types = new Set();
  const scripts = html.match(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi
  ) ?? [];
  for (const script of scripts) {
    const raw = script
      .replace(/^<script\b[^>]*>/i, "")
      .replace(/<\/script>$/i, "")
      .trim();
    try {
      const value = JSON.parse(raw);
      const visit = (item) => {
        if (!item || typeof item !== "object") return;
        const type = item["@type"];
        if (Array.isArray(type)) type.forEach((entry) => types.add(String(entry)));
        else if (type) types.add(String(type));
        if (Array.isArray(item["@graph"])) item["@graph"].forEach(visit);
      };
      if (Array.isArray(value)) value.forEach(visit);
      else visit(value);
    } catch {
      types.add("INVALID_JSON_LD");
    }
  }
  return [...types].sort();
}

function normalizeUrl(raw, baseUrl, auditedHost) {
  try {
    const url = new URL(raw, baseUrl);
    if (!/^https?:$/.test(url.protocol)) return null;
    if (url.hostname !== auditedHost) return null;
    url.hash = "";
    url.search = "";
    url.pathname = url.pathname.replace(/\/{2,}/g, "/");
    if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/$/, "");
    if (SKIP_PREFIXES.some((prefix) => url.pathname.toLowerCase().startsWith(prefix))) {
      return null;
    }
    return url.href;
  } catch {
    return null;
  }
}

function extractInternalLinks(html, pageUrl, auditedHost) {
  const links = new Set();
  const tags = html.match(/<a\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const href = getAttribute(tag, "href");
    const normalized = normalizeUrl(href, pageUrl, auditedHost);
    if (normalized) links.add(normalized);
  }
  return [...links].sort();
}

function extractSitemapEntries(xml, baseUrl, auditedHost) {
  const entries = [];
  for (const match of xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)) {
    const rawUrl = decodeEntities(match[1].trim());
    try {
      const parsed = new URL(rawUrl, baseUrl);
      const localUrl = new URL(`${parsed.pathname}${parsed.search}${parsed.hash}`, `${baseUrl}/`);
      localUrl.search = "";
      localUrl.hash = "";
      if (localUrl.pathname !== "/") localUrl.pathname = localUrl.pathname.replace(/\/$/, "");
      if (SKIP_PREFIXES.some((prefix) => localUrl.pathname.toLowerCase().startsWith(prefix))) {
        continue;
      }
      entries.push({ rawUrl: parsed.href, localUrl: localUrl.href, offHost: parsed.hostname !== auditedHost });
    } catch {
      entries.push({ rawUrl, localUrl: "", offHost: true });
    }
  }
  return entries.sort((a, b) => a.rawUrl.localeCompare(b.rawUrl));
}

function csvEscape(value) {
  const serialized = Array.isArray(value) ? value.join("|") : String(value ?? "");
  return `"${serialized.replaceAll('"', '""')}"`;
}

async function fetchWithRedirects(url, maxRedirects = 8) {
  const chain = [];
  let current = url;
  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
    const response = await fetch(current, {
      redirect: "manual",
      headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml" },
      signal: AbortSignal.timeout(20_000),
    });
    chain.push({ url: current, status: response.status, location: response.headers.get("location") });
    if (response.status < 300 || response.status >= 400 || !response.headers.get("location")) {
      return { response, finalUrl: current, chain };
    }
    current = new URL(response.headers.get("location"), current).href;
  }
  throw new Error(`Too many redirects for ${url}`);
}

async function crawlPage(url, sitemapUrls, auditedHost) {
  const startedAt = Date.now();
  try {
    const { response, finalUrl, chain } = await fetchWithRedirects(url);
    const contentType = response.headers.get("content-type") ?? "";
    const html = contentType.includes("text/html") ? await response.text() : "";
    const title = firstMatch(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i);
    const h1Values = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)]
      .map((match) => stripTags(match[1]))
      .filter(Boolean);
    const h2Values = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)]
      .map((match) => stripTags(match[1]))
      .filter(Boolean);
    const internalLinks = extractInternalLinks(html, finalUrl, auditedHost);
    const bodyText = stripTags(html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html);
    return {
      requestedUrl: url,
      finalUrl,
      path: new URL(finalUrl).pathname,
      status: response.status,
      redirectCount: Math.max(0, chain.length - 1),
      redirectChain: chain.map((entry) => `${entry.status}:${entry.url}`),
      contentType,
      responseRobots: response.headers.get("x-robots-tag") ?? "",
      metaRobots: metaContent(html, "name", "robots"),
      title,
      titleLength: title.length,
      metaDescription: metaContent(html, "name", "description"),
      metaDescriptionLength: metaContent(html, "name", "description").length,
      canonical: linkHref(html, "canonical"),
      ogUrl: metaContent(html, "property", "og:url"),
      htmlLang: getAttribute(html.match(/<html\b[^>]*>/i)?.[0] ?? "", "lang"),
      h1Count: h1Values.length,
      h1: h1Values,
      h2Count: h2Values.length,
      wordCount: bodyText ? bodyText.split(/\s+/).length : 0,
      jsonLdTypes: jsonLdTypes(html),
      internalLinkCount: internalLinks.length,
      internalLinks,
      inSitemap: sitemapUrls.has(url),
      elapsedMs: Date.now() - startedAt,
      error: "",
    };
  } catch (error) {
    return {
      requestedUrl: url,
      finalUrl: url,
      path: new URL(url).pathname,
      status: 0,
      redirectCount: 0,
      redirectChain: [],
      contentType: "",
      responseRobots: "",
      metaRobots: "",
      title: "",
      titleLength: 0,
      metaDescription: "",
      metaDescriptionLength: 0,
      canonical: "",
      ogUrl: "",
      htmlLang: "",
      h1Count: 0,
      h1: [],
      h2Count: 0,
      wordCount: 0,
      jsonLdTypes: [],
      internalLinkCount: 0,
      internalLinks: [],
      inSitemap: sitemapUrls.has(url),
      elapsedMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function buildIssues(pages, baseUrl) {
  const issues = [];
  const add = (severity, category, page, issue, evidence, recommendation) => {
    issues.push({ severity, category, url: page.finalUrl, path: page.path, issue, evidence, recommendation });
  };

  const titleGroups = new Map();
  const descriptionGroups = new Map();
  for (const page of pages) {
    if (page.title) titleGroups.set(page.title, [...(titleGroups.get(page.title) ?? []), page]);
    if (page.metaDescription) {
      descriptionGroups.set(page.metaDescription, [
        ...(descriptionGroups.get(page.metaDescription) ?? []),
        page,
      ]);
    }
    if (page.error) add("critical", "crawl", page, "Fetch failed", page.error, "Restore a 200 response or intentionally redirect/remove the URL.");
    else if (page.status >= 500) add("critical", "status", page, `HTTP ${page.status}`, "Server error", "Restore the page and monitor hosting logs.");
    else if (page.status >= 400) add("high", "status", page, `HTTP ${page.status}`, "Broken or unavailable URL", "Restore, redirect, or remove internal references and sitemap entries.");
    else if (page.redirectCount > 1) add("medium", "redirect", page, "Redirect chain", page.redirectChain.join(" -> "), "Link directly to the final canonical URL.");
    if (!page.contentType.includes("text/html")) continue;
    if (!page.title) add("high", "metadata", page, "Missing title", "No HTML title found", "Add a unique, intent-aligned title.");
    else if (page.titleLength < 20 || page.titleLength > 65) add("medium", "metadata", page, "Title length outside working range", `${page.titleLength} characters`, "Rewrite to approximately 30–60 characters without truncating the brand or intent.");
    if (!page.metaDescription) add("medium", "metadata", page, "Missing meta description", "No description found", "Add a unique description that explains the page and next step.");
    else if (page.metaDescriptionLength < 70 || page.metaDescriptionLength > 170) add("low", "metadata", page, "Meta description length outside working range", `${page.metaDescriptionLength} characters`, "Rewrite to approximately 120–160 useful characters.");
    if (page.h1Count === 0) add("high", "content", page, "Missing H1", "No H1 found", "Add one visible descriptive H1.");
    else if (page.h1Count > 1) add("medium", "content", page, "Multiple H1 headings", `${page.h1Count} H1 elements`, "Use one clear primary H1 and demote subordinate headings.");
    if (!page.canonical) add("high", "canonical", page, "Missing canonical", "No rel=canonical found", "Add an absolute self-referencing canonical for indexable public pages.");
    else {
      try {
        const canonical = new URL(page.canonical, page.finalUrl);
        if (canonical.pathname !== page.path) add("high", "canonical", page, "Canonical points to another path", canonical.href, "Use a self-canonical unless this page is intentionally consolidated.");
      } catch {
        add("high", "canonical", page, "Invalid canonical", page.canonical, "Use a valid absolute canonical URL.");
      }
    }
    if (page.ogUrl) {
      try {
        const og = new URL(page.ogUrl, page.finalUrl);
        if (og.pathname !== page.path) add("medium", "social", page, "og:url points to another path", og.href, "Match og:url to the public page URL.");
      } catch {
        add("medium", "social", page, "Invalid og:url", page.ogUrl, "Use a valid absolute public page URL.");
      }
    }
    const robots = `${page.responseRobots} ${page.metaRobots}`.toLowerCase();
    if (page.inSitemap && robots.includes("noindex")) add("high", "indexation", page, "Noindex URL listed in sitemap", robots.trim(), "Remove it from the sitemap or make it indexable when publication is intended.");
    if (page.wordCount < 120 && page.status === 200) add("medium", "content", page, "Thin rendered copy", `${page.wordCount} words`, "Confirm the page serves a distinct search purpose and add substantive public copy if it should rank.");
  }

  const html200Pages = pages.filter(
    (page) => page.status === 200 && page.contentType.includes("text/html")
  );
  const noindexPages = html200Pages.filter((page) =>
    `${page.responseRobots} ${page.metaRobots}`.toLowerCase().includes("noindex")
  );
  if (html200Pages.length > 0 && noindexPages.length / html200Pages.length >= 0.9) {
    for (let index = issues.length - 1; index >= 0; index -= 1) {
      if (issues[index].issue === "Noindex URL listed in sitemap") issues.splice(index, 1);
    }
  }

  for (const [title, group] of titleGroups) {
    if (group.length < 2) continue;
    for (const page of group) add("medium", "duplication", page, "Duplicate title", `${group.length} pages use: ${title}`, "Give each indexable page a unique search purpose and title.");
  }
  for (const [description, group] of descriptionGroups) {
    if (group.length < 2) continue;
    for (const page of group) add("low", "duplication", page, "Duplicate meta description", `${group.length} pages share the same description`, "Write a page-specific description or intentionally consolidate overlapping pages.");
  }

  const pageByUrl = new Map(pages.map((page) => [page.requestedUrl, page]));
  for (const source of pages) {
    for (const target of source.internalLinks) {
      const targetPage = pageByUrl.get(target);
      if (targetPage && (targetPage.status === 0 || targetPage.status >= 400)) {
        add("high", "links", source, "Broken internal link", `${target} returned ${targetPage.status || "an error"}`, "Update or remove the link.");
      }
    }
  }

  const severityRank = { critical: 0, high: 1, medium: 2, low: 3 };
  issues.sort((a, b) => severityRank[a.severity] - severityRank[b.severity] || a.url.localeCompare(b.url));
  return {
    baseUrl,
    generatedAt: new Date().toISOString(),
    totals: {
      pages: pages.length,
      indexable200: pages.filter((page) => page.status === 200 && !`${page.responseRobots} ${page.metaRobots}`.toLowerCase().includes("noindex")).length,
      noindex200: pages.filter((page) => page.status === 200 && `${page.responseRobots} ${page.metaRobots}`.toLowerCase().includes("noindex")).length,
      errors: pages.filter((page) => page.status === 0 || page.status >= 400).length,
      redirects: pages.filter((page) => page.redirectCount > 0).length,
      issues: issues.length,
      critical: issues.filter((issue) => issue.severity === "critical").length,
      high: issues.filter((issue) => issue.severity === "high").length,
      medium: issues.filter((issue) => issue.severity === "medium").length,
      low: issues.filter((issue) => issue.severity === "low").length,
    },
    pages,
    issues,
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const usage = "Usage: node scripts/seo-crawl.mjs --base-url https://example.com --output output/crawl.json [--limit 250]";
  if (args.help || args.h) {
    console.log(usage);
    return;
  }
  if (!args["base-url"] || !args.output) {
    throw new Error(usage);
  }

  const base = new URL(args["base-url"]);
  base.hash = "";
  base.search = "";
  base.pathname = "/";
  const baseUrl = base.href.replace(/\/$/, "");
  const auditedHost = base.hostname;
  const limit = Number.parseInt(args.limit ?? String(DEFAULT_LIMIT), 10);
  const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`, {
    headers: { "user-agent": USER_AGENT },
    signal: AbortSignal.timeout(20_000),
  });
  const sitemapXml = sitemapResponse.ok ? await sitemapResponse.text() : "";
  const sitemapEntries = extractSitemapEntries(sitemapXml, baseUrl, auditedHost);
  const sitemapList = [...new Set(sitemapEntries.map((entry) => entry.localUrl).filter(Boolean))];
  const sitemapUrls = new Set(sitemapList);
  const queued = new Set([`${baseUrl}/`, ...sitemapList]);
  const completed = new Map();

  while (completed.size < limit) {
    const batch = [...queued].filter((url) => !completed.has(url)).slice(0, 6);
    if (batch.length === 0) break;
    const results = await Promise.all(batch.map((url) => crawlPage(url, sitemapUrls, auditedHost)));
    for (const result of results) {
      completed.set(result.requestedUrl, result);
      for (const link of result.internalLinks) {
        if (queued.size < limit) queued.add(link);
      }
    }
  }

  const pages = [...completed.values()].sort((a, b) => a.path.localeCompare(b.path));
  const report = buildIssues(pages, baseUrl);
  report.sitemap = {
    status: sitemapResponse.status,
    urlCount: sitemapEntries.length,
    localUrlCount: sitemapList.length,
    offHostCount: sitemapEntries.filter((entry) => entry.offHost).length,
    entries: sitemapEntries,
  };
  if (report.sitemap.offHostCount > 0) {
    report.issues.unshift({
      severity: "high",
      category: "sitemap",
      url: `${baseUrl}/sitemap.xml`,
      path: "/sitemap.xml",
      issue: "Sitemap advertises another hostname",
      evidence: `${report.sitemap.offHostCount} of ${report.sitemap.urlCount} sitemap URLs use a different hostname`,
      recommendation: "Generate sitemap URLs from the intended public canonical host for each environment and cutover state.",
    });
    report.totals.issues += 1;
    report.totals.high += 1;
  }
  report.limitReached = completed.size >= limit && [...queued].some((url) => !completed.has(url));

  const outputPath = resolve(args.output);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const csvPath = outputPath.replace(/\.json$/i, ".csv");
  const columns = [
    "requestedUrl", "finalUrl", "path", "status", "redirectCount", "contentType",
    "responseRobots", "metaRobots", "title", "titleLength", "metaDescription",
    "metaDescriptionLength", "canonical", "ogUrl", "htmlLang", "h1Count", "h1",
    "h2Count", "wordCount", "jsonLdTypes", "internalLinkCount", "inSitemap", "error",
  ];
  const csv = [
    columns.map(csvEscape).join(","),
    ...pages.map((page) => columns.map((column) => csvEscape(page[column])).join(",")),
  ].join("\n");
  await writeFile(csvPath, `${csv}\n`, "utf8");

  console.log(JSON.stringify({ outputPath, csvPath, totals: report.totals, limitReached: report.limitReached }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
