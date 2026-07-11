import { headers } from "next/headers";
import Link from "next/link";
import { getPortalAdminEmailFromHeaders } from "@/lib/portal/admin";
import {
  getRecentPortalAccessEvents,
  portalAccessLoggingConfigured,
} from "@/lib/portal/accessLog";
import { AdminAccessRequired, AdminShell, adminButtonClass } from "../AdminShell";

export const dynamic = "force-dynamic";

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Chicago",
  }).format(new Date(value));
}

export default async function PortalAccessLogPage() {
  const adminEmail = getPortalAdminEmailFromHeaders(await headers());
  if (!adminEmail) return <AdminAccessRequired />;

  const configured = portalAccessLoggingConfigured();
  const events = configured ? await getRecentPortalAccessEvents(150) : [];

  return (
    <AdminShell title="Portal Access Log" adminEmail={adminEmail}>
      <section className="mt-8 rounded-md border border-[#d8c49b] bg-[#fffaf1]/88 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)]">
        <div className="flex flex-col gap-4 border-b border-[#d8c49b] pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">Security Audit Trail</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#172a28]">Recent authenticated portal visits</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#706759]">Each production portal page request is stored as an immutable JSON event in R2 with the authenticated email, IP address, timestamp, path, method, and browser user agent.</p>
          </div>
          <Link href="/portal/admin" className={adminButtonClass}>Back to Admin</Link>
        </div>

        {!configured ? (
          <div className="mt-6 rounded-md border border-[#d8c49b] bg-white p-5 text-sm leading-6 text-[#706759]">
            Access logging is ready but R2 is not connected in this environment. Configure the existing R2 credentials or the PRACTICE_FILES binding to begin recording production events.
          </div>
        ) : events.length ? (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-[920px] w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#172a28] text-white">
                  <th className="px-4 py-3 font-semibold">Date and Time (CT)</th>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">IP Address</th>
                  <th className="px-4 py-3 font-semibold">Portal Path</th>
                  <th className="px-4 py-3 font-semibold">Browser</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={`${event.timestamp}-${event.email}-${event.path}`} className="border-b border-[#eadfce] odd:bg-white/70">
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-[#172a28]">{formatTimestamp(event.timestamp)}</td>
                    <td className="px-4 py-3 text-[#172a28]">{event.email}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-[#59635f]">{event.ipAddress}</td>
                    <td className="max-w-[260px] break-all px-4 py-3 text-[#59635f]">{event.path}</td>
                    <td className="max-w-[320px] truncate px-4 py-3 text-xs text-[#706759]" title={event.userAgent}>{event.userAgent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-6 rounded-md border border-[#d8c49b] bg-white p-5 text-sm text-[#706759]">No recorded production portal visits were found yet.</p>
        )}
      </section>
    </AdminShell>
  );
}
