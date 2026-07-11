"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { artisanControlClass } from "@/app/components/controlStyles";

const links = [
  { href: "/", label: "Main Website" },
  { href: "/portal/admin", label: "Admin Dashboard" },
  { href: "/portal/admin/price-lists", label: "Price Lists" },
  { href: "/portal/admin/users", label: "User Invites" },
  { href: "/portal/admin/access-log", label: "Access Log" },
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
        className="mobile-scroll-row mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto"
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
              className={artisanControlClass({
                tone: active ? "accent" : "inverse",
                size: "sm",
                className: "focus-visible:ring-white focus-visible:ring-offset-[#172a28]",
              })}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
