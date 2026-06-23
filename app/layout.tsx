import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import CookieConsentProvider from "./components/CookieConsentProvider";
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
  title: "Artisan Lab Network",
  description:
    "Artisan Lab Network supports independent eye care practices with optical lab partnership, provider resources, programs, and lab access.",
  alternates: {
    canonical: "/",
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
      <head>
        <Script
          id="cookieyes"
          src="https://cdn-cookieyes.com/client_data/e83ecccf3618d9b417487e7baad2c2f1/script.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-screen antialiased">
        <CookieConsentProvider>
          {children}
          <TrainingHubReturnButton />
        </CookieConsentProvider>
      </body>
    </html>
  );
}
