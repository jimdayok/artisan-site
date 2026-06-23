import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Careers | Artisan Lab Network",
  description:
    "Explore Artisan Lab Network careers for people who care about optical lab craft, service, training, and independent practice support.",
  alternates: {
    canonical: "/careers",
  },
};

export default function CareersLayout({ children }: { children: ReactNode }) {
  return children;
}
