import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Meet the Artisans | Artisan Lab Network",
  description:
    "Meet the Artisan Lab Network team and lab partners supporting independent practices across Pacific, Peak, and Pike Artisan Labs.",
  alternates: {
    canonical: "/meet-the-artisans",
  },
};

export default function MeetTheArtisansLayout({ children }: { children: ReactNode }) {
  return children;
}
