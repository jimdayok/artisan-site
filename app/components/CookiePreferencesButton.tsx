"use client";

import { openCookiePreferences } from "./CookieConsentProvider";

export default function CookiePreferencesButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={openCookiePreferences}
    >
      Privacy Preferences
    </button>
  );
}
