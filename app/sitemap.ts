import type { MetadataRoute } from "next";
import { PUBLIC_SITE_URL } from "@/lib/siteMetadata";

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
  return publicRoutes
    .filter((route) => !route.startsWith("/private"))
    .map((route) => ({
      url: `${PUBLIC_SITE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: route === "" ? 1 : 0.6,
    }));
}
