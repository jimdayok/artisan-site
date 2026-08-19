import type { Metadata } from "next";
import { PortalDashboardContent } from "@/app/portal/PortalDashboard";
import PortalDemoPricingGuard from "./PortalDemoPricingGuard";
import {
  demoCustomer,
  demoDashboardState,
  demoPeerBenchmarks,
  demoWorkbookProfile,
} from "./demoData";

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
  return (
    <>
      <PortalDashboardContent
        authenticatedEmail="alex.morgan@example.com"
        customer={demoCustomer}
        workbookProfile={demoWorkbookProfile}
        dashboardState={demoDashboardState}
        experience="demo"
        peerBenchmarks={demoPeerBenchmarks}
      />
      <PortalDemoPricingGuard />
    </>
  );
}
