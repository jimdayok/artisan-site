import type { Metadata } from "next";
import { WelcomeToArtisanPage } from "../components/ArtisanJourneyPages";

export const metadata: Metadata = {
  title: "Welcome to Artisan | Artisan Lab Network",
  description:
    "Start with Artisan Lab Network resources for new and returning practices, including support paths and provider onboarding guidance.",
  alternates: {
    canonical: "/welcome-to-artisan",
  },
};

export default function WelcomeToArtisanRoute() {
  return <WelcomeToArtisanPage />;
}
