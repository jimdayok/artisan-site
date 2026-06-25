import type { Metadata } from "next";
import SirCliffardOpticalLandingPage from "./SirCliffardOpticalLandingPage";

export const metadata: Metadata = {
  title: "Sir Cliffard Optical | Caribbean Practice Support",
  description:
    "A Caribbean-focused landing page for Sir Cliffard Optical customers exploring Artisan Lab Network lenses, packages, relensing support, and SpecCheck ordering.",
  alternates: {
    canonical: "/sir-cliffard-optical",
  },
};

export default function SirCliffardOpticalPage() {
  return <SirCliffardOpticalLandingPage />;
}
