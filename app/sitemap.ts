import type { MetadataRoute } from "next";

const publicRoutes = [
  "",
  "/about",
  "/acquios",
  "/acquios-partners",
  "/advocacy",
  "/artisan-ar",
  "/artisan-model",
  "/careers",
  "/cookie-policy",
  "/lab-policies",
  "/meet-the-artisans",
  "/new-lab-partner",
  "/newsletter",
  "/newsletters",
  "/newsletters/practice-matters",
  "/newsletters/practice-matters/issue-001",
  "/optical-engineering",
  "/pacific-artisan-labs",
  "/patient-resources",
  "/peak-artisan-labs",
  "/pike-artisan-labs",
  "/policies",
  "/programs",
  "/provider-resources",
  "/privacy-policy",
  "/sir-clifford-optical",
  "/switch-to-artisan",
  "/terms-and-conditions",
  "/uoa",
  "/welcome-to-artisan",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.artisanslabs.com";

  return publicRoutes
    .filter((route) => !route.startsWith("/private"))
    .map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: route === "" ? 1 : 0.6,
    }));
}
