import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "About Us | Artisan Lab Network",
  description:
    "Meet Artisan Lab Network, its independent labs, leadership, timeline, advocacy work, and commitment to independent eye care.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children;
}
