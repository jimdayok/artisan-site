"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";
import { artisanControlClass } from "./controlStyles";

const TRAINING_HUB_PATH = "/portal/onboarding";
const RETURN_URL_KEY = "artisan-training-hub-return-url";
const DISMISSED_KEY = "artisan-training-hub-return-dismissed";
const STORE_EVENT = "artisan-training-hub-return-change";

function currentRelativeUrl() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function notifyStoreChanged() {
  window.dispatchEvent(new Event(STORE_EVENT));
}

function getSnapshot() {
  if (typeof window === "undefined") {
    return getServerSnapshot();
  }

  return JSON.stringify({
    returnUrl: window.sessionStorage.getItem(RETURN_URL_KEY) || "",
    dismissed: window.sessionStorage.getItem(DISMISSED_KEY) === "true",
  });
}

function getServerSnapshot() {
  return JSON.stringify({ returnUrl: "", dismissed: true });
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(STORE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(STORE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export default function TrainingHubReturnButton() {
  const pathname = usePathname();
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { returnUrl, dismissed } = JSON.parse(snapshot) as {
    returnUrl: string;
    dismissed: boolean;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (pathname === TRAINING_HUB_PATH) {
      window.sessionStorage.setItem(RETURN_URL_KEY, currentRelativeUrl());
      window.sessionStorage.removeItem(DISMISSED_KEY);
      notifyStoreChanged();
    }
  }, [pathname]);

  if (!returnUrl || dismissed || pathname === TRAINING_HUB_PATH) return null;

  return (
    <div className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] z-[80] flex max-w-[calc(100vw-2.5rem)] items-center gap-2 rounded-full border border-[#d8c49b] bg-[#172a28] p-1.5 pl-2 shadow-[0_18px_55px_rgba(23,42,40,0.24)]">
      <Link
        href={returnUrl}
        className={artisanControlClass({ tone: "accent", size: "sm" })}
      >
        <ArrowLeft className="h-4 w-4" />
        Return to Setup Hub
      </Link>
      <button
        type="button"
        aria-label="Hide setup hub return button"
        onClick={() => {
          window.sessionStorage.setItem(DISMISSED_KEY, "true");
          notifyStoreChanged();
        }}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/72 transition hover:bg-white/10 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
