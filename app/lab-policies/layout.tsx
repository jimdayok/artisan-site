import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Lab Policies | Artisan Lab Network",
  description:
    "Review Artisan Lab Network lab policies, remake guidance, ordering expectations, and service details for provider teams.",
  alternates: {
    canonical: "/lab-policies",
  },
};

export default function LabPoliciesLayout({ children }: { children: ReactNode }) {
  return children;
}
