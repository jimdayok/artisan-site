import type { MetadataRoute } from "next";

const publicRoutes = [
  "",
  "/about",
  "/artisan-model",
  "/careers",
  "/lab-policies",
  "/meet-the-artisans",
  "/new-lab-partner",
  "/newsletter",
  "/newsletters",
  "/newsletters/practice-matters",
  "/newsletters/practice-matters/issue-001",
  "/pacific-artisan-labs",
  "/patient-resources",
  "/peak-artisan-labs",
  "/pike-artisan-labs",
  "/policies",
  "/practice-resources",
  "/programs",
  "/provider-resources",
  "/provider-resources/professional-resources",
  "/privacy-policy",
  "/terms-and-conditions",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.artisanlabnetwork.com";

  return publicRoutes
    .filter((route) => !route.startsWith("/private"))
    .map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: route === "" ? 1 : 0.6,
    }));
}
