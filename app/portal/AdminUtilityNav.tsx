"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Main Website" },
  { href: "/portal/admin", label: "Admin Dashboard" },
  { href: "/portal/admin/price-lists", label: "Price Lists" },
  { href: "/portal/admin/rewards", label: "Rewards" },
  { href: "/portal", label: "Customer Portal" },
  { href: "/portal/employee-resources", label: "Employee Resources" },
] as const;

export default function AdminUtilityNav() {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/portal/admin");
  const isCustomerMode = pathname === "/portal";
  const showReturnLabel = !isAdminRoute || isCustomerMode;

  return (
    <aside className="sticky top-0 z-[60] border-b border-[#d8c49b] bg-[#172a28]/96 px-3 py-2 text-white shadow-[0_12px_35px_rgba(23,42,40,0.18)] backdrop-blur sm:px-5">
      <nav
        aria-label="Admin utility navigation"
        className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto"
      >
        {links.map((link) => {
          const label =
            link.href === "/portal/admin" && showReturnLabel
              ? "Return to Admin Dashboard"
              : link.label;
          const active =
            link.href === "/"
              ? pathname === "/"
              : link.href === "/portal/admin"
              ? pathname === "/portal/admin"
              : link.href === "/portal"
                ? isCustomerMode
                : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-9 shrink-0 items-center justify-center rounded-full border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                active
                  ? "border-[#d8c49b] bg-[#d8c49b] text-[#172a28]"
                  : "border-white/20 bg-white/5 text-white hover:border-white/45 hover:bg-white/12"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
