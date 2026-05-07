"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function PracticeResourcesAliasPage() {
  useEffect(() => {
    window.location.replace(`/provider-resources${window.location.hash}`);
  }, []);

  return (
    <main className="min-h-screen bg-[#f4eee4] px-6 py-16 text-[#122033]">
      <div className="mx-auto max-w-xl rounded-[28px] border border-[#dfd2bf] bg-white/80 p-8 shadow-[0_22px_60px_rgba(18,32,51,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7654]">
          Practice Resources
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Taking you to Provider Resources.
        </h1>
        <p className="mt-4 text-sm leading-7 text-[#4d5664]">
          Practice resources now live inside the Provider Resources area.
        </p>
        <Link
          href="/provider-resources#tokai"
          className="mt-6 inline-flex rounded-full bg-[#122033] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Open Provider Resources
        </Link>
      </div>
    </main>
  );
}
