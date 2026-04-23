import type { Metadata } from "next";
import localFont from "next/font/local";
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
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
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
        {children}
      </body>
    </html>
  );
}
