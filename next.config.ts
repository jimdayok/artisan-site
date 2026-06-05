import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
  },
  outputFileTracingIncludes: {
    "/portal": [
      "private-source/portal/user_data.xlsx",
      "private-source/portal/User_Data.xlsx",
    ],
    "/portal/*": [
      "private-source/portal/user_data.xlsx",
      "private-source/portal/User_Data.xlsx",
    ],
    "/api/portal/*": [
      "private-source/portal/user_data.xlsx",
      "private-source/portal/User_Data.xlsx",
    ],
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: "/ourcraft", destination: "/artisan-model", permanent: true },
      { source: "/our-craft-1", destination: "/artisan-model", permanent: true },
      { source: "/artisanlabnetwork-about", destination: "/about", permanent: true },
      { source: "/contact", destination: "/new-lab-partner", permanent: true },
      { source: "/contactus", destination: "/new-lab-partner", permanent: true },
      { source: "/practice-resources", destination: "/provider-resources", permanent: true },
      { source: "/pacificartisanlabs", destination: "/pacific-artisan-labs", permanent: true },
      { source: "/pikeartisanlabs", destination: "/pike-artisan-labs", permanent: true },
      { source: "/practicematters", destination: "/newsletters/practice-matters", permanent: true },
      { source: "/pressreleases", destination: "/about#press-releases", permanent: true },
      { source: "/blog", destination: "/newsletters", permanent: true },
      { source: "/tokai", destination: "/provider-resources#tokai", permanent: true },
      { source: "/safetysystems", destination: "/provider-resources#safety-systems", permanent: true },
      { source: "/Shipping", destination: "/lab-policies#shipping", permanent: true },
      { source: "/shipping", destination: "/lab-policies#shipping", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/portal",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive, nosnippet",
          },
          {
            key: "Cache-Control",
            value: "private, no-store",
          },
        ],
      },
      {
        source: "/portal/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive, nosnippet",
          },
          {
            key: "Cache-Control",
            value: "private, no-store",
          },
        ],
      },
      {
        source: "/private",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive, nosnippet",
          },
          {
            key: "Cache-Control",
            value: "private, no-store",
          },
        ],
      },
      {
        source: "/private/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive, nosnippet",
          },
          {
            key: "Cache-Control",
            value: "private, no-store",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive, nosnippet",
          },
          {
            key: "Cache-Control",
            value: "private, no-store",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
