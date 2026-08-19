"use client";

import {
  ConsentBanner,
  ConsentDialog,
  ConsentManagerProvider,
  useConsentDialogTrigger,
  useConsentManager,
  type Theme,
} from "@c15t/react";
import { Analytics } from "@vercel/analytics/next";
import { track } from "@vercel/analytics";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useMemo } from "react";

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

function PrivacyShieldIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="20" height="20">
      <path fill="#142724" d="M12 2.75 19.5 6v5.3c0 4.45-2.94 8.23-7.5 10.1-4.56-1.87-7.5-5.65-7.5-10.1V6L12 2.75Z" />
      <path fill="none" stroke="#c9b28b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.35" d="m8.4 12.2 2.25 2.25 4.95-5" />
    </svg>
  );
}

let measurementConsentGranted = false;
let openPreferencesDialog: () => void = () => undefined;

export function openCookiePreferences() {
  openPreferencesDialog();
}

export function trackWithConsent(name: string, properties?: Record<string, string | number | boolean | null>) {
  if (!measurementConsentGranted) return;
  track(name, properties);
}

const theme = {
  colors: {
    primary: "#142724",
    primaryHover: "#29453f",
    surface: "#ffffff",
    surfaceHover: "#eef4f1",
    text: "#142724",
    textMuted: "#596761",
    textOnPrimary: "#ffffff",
  },
  radius: {
    md: "0.75rem",
    lg: "1rem",
  },
  slots: {
    consentBannerCard: {
      className: "artisan-consent-banner",
      style: { maxWidth: "760px" },
    },
    consentDialogCard: "artisan-consent-dialog",
  },
} satisfies Theme;

function ConsentStateBridge({ children }: { children: React.ReactNode }) {
  const { has } = useConsentManager();
  const { openDialog } = useConsentDialogTrigger({ showWhen: "always" });
  const functional = has("functionality");
  const analytics = has("measurement");

  useEffect(() => {
    measurementConsentGranted = analytics;
    openPreferencesDialog = openDialog;
    return () => {
      measurementConsentGranted = false;
      openPreferencesDialog = () => undefined;
    };
  }, [analytics, openDialog]);

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

export default function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const suppressPrompts = pathname.startsWith("/portal-demo");

  return (
    <ConsentManagerProvider
      options={{
        mode: "hosted",
        backendURL: "/api/c15t",
        consentCategories: ["necessary", "functionality", "measurement"],
        legalLinks: {
          privacyPolicy: { href: "/privacy-policy", target: "_self" },
          cookiePolicy: { href: "/cookie-policy", target: "_self" },
          termsOfService: { href: "/terms-of-use", target: "_self" },
        },
        i18n: {
          locale: "en",
          detectBrowserLanguage: false,
          messages: {
            en: {
              cookieBanner: {
                title: "Your privacy choices",
                description:
                  "We use optional functionality and measurement technologies for maps, location tools, and site analytics. You can accept, reject, or choose by category.",
              },
              consentManagerDialog: {
                title: "Privacy preferences",
                description:
                  "Choose which optional technologies Artisan Lab Network may use. Necessary storage remains active for security, sign-in, and remembering your choice.",
              },
              common: {
                acceptAll: "Accept all",
                rejectAll: "Reject optional",
                customize: "Choose preferences",
                save: "Save preferences",
              },
              consentTypes: {
                necessary: {
                  title: "Necessary",
                  description:
                    "Required for site security, portal sign-in, core operation, and remembering your privacy choice.",
                },
                functionality: {
                  title: "Functionality",
                  description:
                    "Enables optional maps, browser location, and related patient-locator features.",
                },
                measurement: {
                  title: "Measurement",
                  description:
                    "Helps us understand site usage and performance through privacy-controlled analytics.",
                },
              },
            },
          },
        },
        theme,
      }}
    >
      <ConsentStateBridge>{children}</ConsentStateBridge>
      {suppressPrompts ? null : (
        <>
          <ConsentBanner
            hideBranding
            layout={[["reject", "accept"], "customize"]}
            primaryButton={["reject", "accept"]}
            legalLinks={["privacyPolicy", "cookiePolicy"]}
          />
          <ConsentDialog
            hideBranding
            legalLinks={["privacyPolicy", "cookiePolicy", "termsOfService"]}
            showTrigger={{
              icon: <PrivacyShieldIcon />,
              ariaLabel: "Open privacy preferences",
              showWhen: "after-consent",
              size: "sm",
            }}
          />
        </>
      )}
    </ConsentManagerProvider>
  );
}

export function useCookieConsent() {
  return useContext(CookieConsentContext);
}
