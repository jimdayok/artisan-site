import type { Metadata } from "next";
import LabLandingPage from "../components/LabLandingPage";
import { pacificLabConfig } from "../labConfigs";

export const metadata: Metadata = {
  title: "Pacific Artisan Labs | Portland Optical Lab | Artisan Lab Network",
  description:
    "Pacific Artisan Labs supports independent practices from Portland with premium lens production, thoughtful service, and Pacific Northwest craft.",
};

export default function PacificArtisanLabsPage() {
  return <LabLandingPage config={pacificLabConfig} />;
}
