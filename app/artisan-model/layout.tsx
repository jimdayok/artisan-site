import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "The Artisan Model | Artisan Lab Network",
  description:
    "See how Artisan Lab Network gives independent practices more product flexibility, lab accountability, and partnership support.",
  alternates: {
    canonical: "/artisan-model",
  },
};

export default function ArtisanModelLayout({ children }: { children: ReactNode }) {
  return children;
}
