"use client";

import { openCookiePreferences } from "./CookieConsentProvider";

export default function CookiePreferencesButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      className={`cky-banner-element ${className}`}
      onClick={openCookiePreferences}
    >
      Cookie Preferences
    </button>
  );
}
