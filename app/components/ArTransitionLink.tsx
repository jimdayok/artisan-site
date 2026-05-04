"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type MouseEvent, type ReactNode } from "react";

type ArTransitionLinkProps = {
  href: string;
  logoSrc: string;
  label: string;
  children: ReactNode;
  className?: string;
};

export default function ArTransitionLink({
  href,
  logoSrc,
  label,
  children,
  className = "",
}: ArTransitionLinkProps) {
  const router = useRouter();
  const [transitioning, setTransitioning] = useState(false);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (transitioning) return;

    setTransitioning(true);
    window.setTimeout(() => router.push(href), 650);
  };

  return (
    <>
      <a href={href} onClick={handleClick} className={className}>
        {children}
      </a>
      {transitioning ? (
        <div className="fixed inset-0 z-[3000] grid place-items-center overflow-hidden bg-[#080706]/94">
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.16]"
            style={{ backgroundImage: "url('/graphics/rings2.jpg')" }}
            aria-hidden="true"
          />
          <div className="pointer-events-none absolute left-[-20%] top-1/2 h-24 w-[140%] -translate-y-1/2 rotate-[-14deg] animate-[ar-sweep_650ms_ease-in-out_forwards] bg-[linear-gradient(90deg,transparent,rgba(212,192,154,0.04),rgba(255,255,255,0.55),rgba(212,192,154,0.18),transparent)] blur-xl" />
          <div className="relative z-10 rounded-[30px] border border-white/12 bg-white/[0.08] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-md">
            <Image
              src={logoSrc}
              alt={label}
              width={460}
              height={180}
              className="max-h-[130px] w-auto max-w-[420px] object-contain"
              priority
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
