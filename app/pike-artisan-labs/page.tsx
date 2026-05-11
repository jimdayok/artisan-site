import type { Metadata } from "next";
import LabLandingPage from "../components/LabLandingPage";
import { pikeLabConfig } from "../labConfigs";

export const metadata: Metadata = {
  title: "Pike Artisan Labs | Indianapolis Optical Lab | Artisan Lab Network",
  description:
    "Pike Artisan Labs brings Midwestern reliability, modern production, and independent lab partnership together in Indianapolis.",
};

export default function PikeArtisanLabsPage() {
  return <LabLandingPage config={pikeLabConfig} />;
}
