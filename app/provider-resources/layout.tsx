import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Provider Resources | Artisan Lab Network",
  description:
    "Access Artisan Lab Network provider resources, product guidance, troubleshooting tools, professional resources, and lab support links.",
  alternates: {
    canonical: "/provider-resources",
  },
};

export default function ProviderResourcesLayout({ children }: { children: ReactNode }) {
  return children;
}
