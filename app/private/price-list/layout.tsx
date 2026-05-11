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
  // This page is hidden from indexing and protected by password, but true long term privacy should be handled through the future customer portal authentication system.
  return <>{children}</>;
}
