import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import NewLabPartnerHub from "./NewLabPartnerHub";

const FORM_URL = "https://newaccount.artisanlabnetwork.com/";

export const metadata: Metadata = {
  title: "New Lab Partner Onboarding | Artisan Lab Network",
  description:
    "A guided launch center for new Artisan Lab Network customers to set up ordering, learn their lab, access pricing and reports, and train their team.",
  alternates: {
    canonical: "/new-lab-partner",
  },
};

export default function NewLabPartnerPage() {
  return (
    <main className="min-h-screen bg-[#f5f1eb] text-[#1f1a17]">
      <Header signUpHref={FORM_URL} />
      <NewLabPartnerHub />
      <Footer signUpHref={FORM_URL} />
    </main>
  );
}
