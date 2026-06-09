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
  title: "Artisan Lab Network",
  description: "Artisan Quality for Every Lens",
  icons: {
    icon: "/aln-icon.png",
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
