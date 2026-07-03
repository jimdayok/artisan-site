import type { Metadata } from "next";
import localFont from "next/font/local";
import CookieConsentProvider from "./components/CookieConsentProvider";
import CookieYesScript from "./components/CookieYesScript";
import TrainingHubReturnButton from "./components/TrainingHubReturnButton";
import "./globals.css";

const nunito = localFont({
  src: [
    {
      path: "../public/fonts/NunitoSans-Variable.ttf",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.artisanslabs.com"),
  applicationName: "Artisan Lab Network",
  title: {
    default: "Artisan Lab Network",
    template: "%s",
  },
  description:
    "Artisan Lab Network supports independent eye care practices with optical lab partnership, provider resources, programs, and lab access.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Artisan Lab Network",
    title: "Artisan Lab Network",
    description:
      "Independent optical lab partnership, provider resources, programs, and lab access for eye care practices.",
    url: "https://www.artisanslabs.com",
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
    card: "summary",
    title: "Artisan Lab Network",
    description:
      "Independent optical lab partnership, provider resources, programs, and lab access for eye care practices.",
    images: ["/aln-icon.png"],
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/aln-icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={nunito.variable}>
      <body className="min-h-screen antialiased">
        <CookieConsentProvider>
          <CookieYesScript />
          {children}
          <TrainingHubReturnButton />
        </CookieConsentProvider>
      </body>
    </html>
  );
}
