"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

export default function BetaThicknessNotice() {
  const [open, setOpen] = useState(true);
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleDialogKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleDialogKeys);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleDialogKeys);
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 grid place-items-center p-4 backdrop-blur-sm"
      style={{ zIndex: 100, backgroundColor: "rgba(16, 24, 32, 0.72)" }}
      role="presentation"
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="thickness-beta-title"
        aria-describedby="thickness-beta-description"
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#d8c6a8] bg-[#fbf8f3] shadow-[0_28px_90px_rgba(0,0,0,0.38)]"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close beta notice"
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-[#d8c6a8] bg-white text-[#172a28] transition hover:bg-[#f3e8d2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a7654]"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="border-b border-[#d8c6a8] bg-[#f3e8d2] px-6 py-5 pr-16">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#172a28] text-[#d4c09a]">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8a7654]">Beta notice</p>
              <h2 id="thickness-beta-title" className="mt-1 text-2xl font-semibold text-[#172a28]">Thickness evaluator in testing</h2>
            </div>
          </div>
        </div>
        <div className="px-6 py-6">
          <p id="thickness-beta-description" className="text-base leading-7 text-[#625b53]">
            This thickness evaluator is a beta tool and is subject to errors or misrepresentation. Results are educational estimates only and may not reflect the final manufactured lens.
          </p>
          <p className="mt-4 font-semibold text-[#172a28]">Be advised: confirm all measurements, specifications, and finished-lens requirements with a qualified eye care professional or laboratory.</p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-6 min-h-12 w-full rounded-lg bg-[#172a28] px-5 text-sm font-semibold text-white transition hover:bg-[#243d39] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a7654] focus-visible:ring-offset-2"
          >
            I understand — continue
          </button>
        </div>
      </section>
    </div>
  );
}
