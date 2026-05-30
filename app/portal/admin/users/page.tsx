import Link from "next/link";
import { headers } from "next/headers";
import { getPortalAdminEmailFromHeaders } from "@/lib/portal/admin";
import { AdminAccessRequired, AdminShell, adminButtonClass } from "../AdminShell";

export const dynamic = "force-dynamic";

export default async function PortalAdminUsersPage() {
  const adminEmail = getPortalAdminEmailFromHeaders(await headers());

  if (!adminEmail) return <AdminAccessRequired />;

  return (
    <AdminShell title="Portal Users (Advanced)" adminEmail={adminEmail}>
      <section className="mt-8 border border-[#d8c49b] bg-[#fffaf1]/84 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)] sm:p-8">
        <h2 className="text-3xl font-semibold tracking-[-0.035em]">Advanced Admin Tools</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#706759]">User management and legacy workbook views are advanced tools and are hidden for launch. These screens remain accessible directly but are not part of the primary admin workflow.</p>
        <div className="mt-6">
          <Link href="/portal/admin" className={adminButtonClass}>
            Back to Admin Dashboard
          </Link>
        </div>
      </section>
    </AdminShell>
  );
}
