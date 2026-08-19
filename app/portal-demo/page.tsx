import type { Metadata } from "next";
import PortalDemo from "./PortalDemo";

export const metadata: Metadata = {
  title: "Customer Portal Demo | Artisan Lab Network",
  description:
    "A fictional, interactive demonstration of the Artisan Lab Network customer portal.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  },
};

export default function PortalDemoPage() {
  return <PortalDemo />;
}
