import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Lens Thickness Comparison | Artisan Lab Network",
  description: "Compare estimated finished lens thickness across 1.67, 1.74, Tokai 1.76, and other lens materials using your prescription and frame size.",
  alternates: { canonical: "/patient-resources/lens-thickness" },
};

export default function LensThicknessLayout({ children }: { children: ReactNode }) {
  return children;
}
