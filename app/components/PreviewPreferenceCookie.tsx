"use client";

import { useEffect } from "react";

const PREVIEW_HOSTNAME = "preview.artisanlabnetwork.com";
const PREFERENCE_COOKIE_NAME = "aln_site_preference";
const PREFERENCE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

export default function PreviewPreferenceCookie() {
  useEffect(() => {
    if (window.location.hostname.toLowerCase() !== PREVIEW_HOSTNAME) return;

    document.cookie = [
      `${PREFERENCE_COOKIE_NAME}=preview`,
      `Max-Age=${PREFERENCE_MAX_AGE_SECONDS}`,
      "Path=/",
      "Domain=.artisanlabnetwork.com",
      "Secure",
      "SameSite=Lax",
    ].join("; ");
  }, []);

  return null;
}
