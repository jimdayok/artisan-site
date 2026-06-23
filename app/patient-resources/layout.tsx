import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Patient Resources | Artisan Lab Network",
  description:
    "Find patient resources from Artisan Lab Network, including practice locator support and independent eye care education.",
  alternates: {
    canonical: "/patient-resources",
  },
};

export default function PatientResourcesLayout({ children }: { children: ReactNode }) {
  return children;
}
