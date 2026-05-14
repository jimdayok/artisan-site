import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Private Price List | Artisan Lab Network",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
      noimageindex: true,
    },
  },
};

export default async function PrivatePriceListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Legacy private URLs redirect into the secure portal namespace.
  return <>{children}</>;
}
