import type { Metadata } from "next";
import LabPoliciesPage from "../lab-policies/page";

export const metadata: Metadata = {
  title: "Lab Policies | Artisan Lab Network",
  description:
    "Review Artisan Lab Network lab policies, remake guidance, ordering expectations, and service details for provider teams.",
  alternates: {
    canonical: "/policies",
  },
};

export default function PoliciesPage() {
  return <LabPoliciesPage />;
}
