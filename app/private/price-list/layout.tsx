import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Private Price List | Artisan Lab Network",
  robots: {
    index: false,
    follow: false,
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
  // This page is hidden and discouraged from indexing, but real privacy requires authentication. This route should be moved behind the future customer portal login.
  return <>{children}</>;
}
