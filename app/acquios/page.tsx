import type { Metadata } from "next";
import AcquiosLandingPage from "./AcquiosLandingPage";

const title = "Acquios Alliance 90 Day Trial | Artisan Lab Network";
const description =
  "Acquios Alliance members can try Artisan Lab Network for 90 days and earn 30% back on qualifying private pay lab orders. Program Code AQU2630.";

export const metadata: Metadata = {
  metadataBase: new URL("https://artisanslabs.com"),
  title,
  description,
  openGraph: {
    title,
    description,
    images: [
      {
        url: "/aln-white-logo.png",
        width: 1000,
        height: 471,
        alt: "Artisan Lab Network",
      },
    ],
  },
};

export default function AcquiosPage() {
  return <AcquiosLandingPage />;
}
