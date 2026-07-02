import type { Metadata } from "next";
import SirCliffordOpticalLandingPage from "./SirCliffordOpticalLandingPage";

export const metadata: Metadata = {
  title: "Sir Clifford Optical | Caribbean Practice Support",
  description:
    "A Caribbean-focused landing page for Sir Clifford Optical customers exploring Artisan Lab Network lenses, packages, relensing support, and SpecCheck ordering.",
  alternates: {
    canonical: "/sir-clifford-optical",
  },
};

export default function SirCliffordOpticalPage() {
  return <SirCliffordOpticalLandingPage />;
}
