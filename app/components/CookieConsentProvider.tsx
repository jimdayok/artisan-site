"use client";

import { Analytics } from "@vercel/analytics/next";
import { track } from "@vercel/analytics";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type ConsentCategory = "functional" | "analytics";

type CookieConsentContextValue = {
  functional: boolean;
  analytics: boolean;
  openPreferences: () => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue>({
  functional: false,
  analytics: false,
  openPreferences: () => undefined,
});

function hasConsent(category: ConsentCategory) {
  if (typeof document === "undefined") return false;
  const consentCookie = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("cookieyes-consent="));

  if (!consentCookie) return false;

  const value = decodeURIComponent(consentCookie.slice(consentCookie.indexOf("=") + 1));
  return new RegExp(`(?:^|,)${category}:yes(?:,|$)`, "i").test(value);
}

export function openCookiePreferences() {
  if (typeof document === "undefined") return;

  const trigger = document.querySelector<HTMLElement>(
    ".cky-btn-revisit, [data-cky-tag='revisit-consent'], .cky-consent-bar .cky-btn-customize"
  );
  trigger?.click();
}

export function trackWithConsent(name: string, properties?: Record<string, string | number | boolean | null>) {
  if (!hasConsent("analytics")) return;
  track(name, properties);
}

export default function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [functional, setFunctional] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const updateConsent = () => {
      setFunctional(hasConsent("functional"));
      setAnalytics(hasConsent("analytics"));
    };

    updateConsent();
    document.addEventListener("cookieyes_consent_update", updateConsent);
    document.addEventListener("cookieyes_banner_load", updateConsent);
    window.addEventListener("focus", updateConsent);

    const polling = window.setInterval(updateConsent, 1_000);
    const stopPolling = window.setTimeout(() => window.clearInterval(polling), 15_000);

    return () => {
      document.removeEventListener("cookieyes_consent_update", updateConsent);
      document.removeEventListener("cookieyes_banner_load", updateConsent);
      window.removeEventListener("focus", updateConsent);
      window.clearInterval(polling);
      window.clearTimeout(stopPolling);
    };
  }, []);

  const value = useMemo(
    () => ({ functional, analytics, openPreferences: openCookiePreferences }),
    [analytics, functional]
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
      {analytics ? <Analytics /> : null}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  return useContext(CookieConsentContext);
}
