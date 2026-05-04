import type { Metadata } from "next";
import { Suspense } from "react";
import ProgramsHubClient from "./ProgramsHubClient";

export const metadata: Metadata = {
  title: "Special Programs | Artisan Lab Network",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProgramsPage() {
  return (
    <Suspense fallback={null}>
      <ProgramsHubClient />
    </Suspense>
  );
}
