import type { Metadata } from "next";
import AdvocacyClient from "./AdvocacyClient";

const title = "Protect Lab Choice | Artisan Lab Network Advocacy";
const description = "Find elected officials, learn about VBM reform, generate advocacy letters, and support laboratory choice legislation for independent doctors and patients.";
const url = "https://www.artisanslabs.com/advocacy";

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL("https://www.artisanslabs.com"),
  alternates: {
    canonical: "/advocacy",
  },
  openGraph: {
    title,
    description,
    url,
    siteName: "Artisan Lab Network",
    type: "website",
    images: [
      {
        url: "/aln-icon.png",
        width: 512,
        height: 512,
        alt: "Artisan Lab Network",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/aln-icon.png"],
  },
};

export default function AdvocacyPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url,
    publisher: {
      "@type": "Organization",
      name: "Artisan Lab Network",
      url: "https://www.artisanslabs.com",
      logo: "https://www.artisanslabs.com/aln-icon.png",
    },
    about: [
      { "@type": "Thing", name: "Laboratory choice" },
      { "@type": "Thing", name: "Vision Benefit Manager reform" },
      { "@type": "Thing", name: "Independent optometry advocacy" },
    ],
    potentialAction: {
      "@type": "CommunicateAction",
      name: "Contact elected officials about laboratory choice",
      target: url,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <AdvocacyClient />
    </>
  );
}
