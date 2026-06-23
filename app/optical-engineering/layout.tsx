import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Optical Engineering | Artisan Lab Network",
  description:
    "Learn how Artisan Lab Network approaches optical engineering, lens performance, lab systems, and manufacturing support.",
  alternates: {
    canonical: "/optical-engineering",
  },
};

export default function OpticalEngineeringLayout({ children }: { children: ReactNode }) {
  return children;
}
