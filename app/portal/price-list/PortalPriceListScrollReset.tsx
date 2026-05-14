"use client";

import { useEffect } from "react";

export default function PortalPriceListScrollReset() {
  useEffect(() => {
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";

    return () => {
      document.body.style.removeProperty("overflow");
      document.documentElement.style.removeProperty("overflow");
    };
  }, []);

  return null;
}
