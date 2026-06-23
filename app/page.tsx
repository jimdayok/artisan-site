import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  title: "Artisan Lab Network | Independent Optical Lab Partnership",
  description:
    "Explore Artisan Lab Network, an independent optical lab network built for eye care practices that want better partnership, resources, and lab support.",
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
