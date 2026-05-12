import type { Metadata } from "next";
import UoaLandingPage from "./UoaLandingPage";

export const metadata: Metadata = {
  title: "Built for Independent Opticians | Artisan Lab Network",
  description:
    "Artisan Lab Network helps independent opticians protect product choice, clinical freedom, and a better lab partnership.",
};

export default function UnitedOpticiansAssociationPage() {
  return <UoaLandingPage />;
}
