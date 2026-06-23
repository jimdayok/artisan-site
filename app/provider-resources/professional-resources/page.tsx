import type { Metadata } from "next";
import ProviderResourcesPage from "../page";

export const metadata: Metadata = {
  title: "Professional Resources | Artisan Lab Network",
  description:
    "Browse professional provider resources from Artisan Lab Network for practice teams, product education, and optical lab workflows.",
  alternates: {
    canonical: "/provider-resources/professional-resources",
  },
};

export default function ProfessionalResourcesPage() {
  return <ProviderResourcesPage showProfessionalEnhancements />;
}
