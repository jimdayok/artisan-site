import type { Metadata } from "next";
import LabLandingPage from "../components/LabLandingPage";
import { peakLabConfig } from "../labConfigs";

export const metadata: Metadata = {
  title: "Peak Artisan Labs | Denver Optical Lab | Artisan Lab Network",
  description:
    "Peak Artisan Labs delivers premium lens technology, sharp service, and independent lab partnership from Denver, Colorado.",
};

export default function PeakArtisanLabsPage() {
  return <LabLandingPage config={peakLabConfig} />;
}
