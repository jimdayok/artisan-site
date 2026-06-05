import { headers } from "next/headers";
import { getPortalAdminEmailFromHeaders } from "@/lib/portal/admin";
import { AdminAccessRequired } from "../admin/AdminShell";
import { employeeResourceCategories, employeeResources } from "@/lib/portal/employeeResources";
import EmployeeResourceCenter from "./EmployeeResourceCenter";

export const dynamic = "force-dynamic";

export default async function EmployeeResourcesPage() {
  const employeeEmail = getPortalAdminEmailFromHeaders(await headers());

  if (!employeeEmail) return <AdminAccessRequired />;

  return (
    <main className="min-h-screen bg-[#f4efe6] px-5 py-10 text-[#172a28] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <EmployeeResourceCenter resources={employeeResources} categories={employeeResourceCategories} />
      </div>
    </main>
  );
}
