import type { Metadata } from "next";
import { SwitchToArtisanPage } from "../components/ArtisanJourneyPages";

export const metadata: Metadata = {
  title: "Switch to Artisan | Artisan Lab Network",
  description:
    "Learn how independent practices can move to Artisan Lab Network with clearer lab partnership, support, and onboarding resources.",
  alternates: {
    canonical: "/switch-to-artisan",
  },
};

export default function SwitchToArtisanRoute() {
  return <SwitchToArtisanPage />;
}
