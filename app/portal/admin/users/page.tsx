import { headers } from "next/headers";
import Link from "next/link";
import { getPortalAdminEmailFromHeaders } from "@/lib/portal/admin";
import { getPortalInviteConfig, getPortalInviteRecipientSummary } from "@/lib/portal/adminInvites";
import { AdminAccessRequired, AdminShell, adminButtonClass } from "../AdminShell";

export const dynamic = "force-dynamic";

function InviteStatusMessage({
  invite,
  email,
  detail,
}: {
  invite?: string;
  email?: string;
  detail?: string;
}) {
  if (!invite) return null;

  const styles =
    invite === "sent"
      ? "border-[#9fc8b8] bg-[#edf8f2] text-[#172a28]"
      : invite === "config-missing"
        ? "border-[#d8a15e] bg-[#fff4dd] text-[#172a28]"
        : "border-[#d59c9c] bg-[#fff1f1] text-[#172a28]";

  const message =
    invite === "sent"
      ? `Invitation email sent to ${email}.`
      : invite === "invalid-email"
        ? "Enter a valid email address before sending an invitation."
        : invite === "config-missing"
          ? `Portal invite email is not configured yet. Missing: ${detail || "required environment variables"}.`
          : `Portal invite could not be sent${detail ? `: ${detail}` : "."}`;

  return (
    <section className={`mt-8 border p-4 text-sm shadow-[0_12px_32px_rgba(23,42,40,0.06)] ${styles}`}>
      {message}
    </section>
  );
}

export default async function PortalAdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<{ invite?: string; email?: string; detail?: string }>;
}) {
  const adminEmail = getPortalAdminEmailFromHeaders(await headers());

  if (!adminEmail) return <AdminAccessRequired />;

  const query = (await searchParams) ?? {};
  const inviteConfig = getPortalInviteConfig();
  const recipientSummary = query.email
    ? await getPortalInviteRecipientSummary(query.email)
    : undefined;

  return (
    <AdminShell title="Portal Users" adminEmail={adminEmail} showHeroNav>
      <InviteStatusMessage
        invite={query.invite}
        email={query.email}
        detail={query.detail}
      />

      <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
        <article className="border border-[#d8c49b] bg-[#fffaf1]/84 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">
            Portal Invite
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
            Send a login invitation
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#706759]">
            Send an outbound email that explains the customer portal and tells
            the recipient to log in with the invited email address.
          </p>

          <form
            action="/portal/admin/users/invite"
            method="POST"
            className="mt-6 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]"
          >
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b7650]">
                Recipient email
              </span>
              <input
                type="email"
                name="email"
                required
                defaultValue={query.email ?? ""}
                placeholder="name@practice.com"
                className="min-h-12 border border-[#d8c49b] bg-white px-4 text-sm text-[#172a28] outline-none transition focus:border-[#172a28]"
              />
            </label>
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#172a28] px-6 text-sm font-semibold text-white transition hover:bg-[#27433f]"
            >
              Send invite
            </button>
          </form>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="border border-[#d8c49b] bg-white/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b7650]">
                Delivery service
              </p>
              <p className="mt-2 text-sm leading-6 text-[#172a28]">
                {inviteConfig.enabled
                  ? `Configured through Resend using ${inviteConfig.fromEmail}.`
                  : "Not configured yet."}
              </p>
              {!inviteConfig.enabled ? (
                <p className="mt-2 text-sm leading-6 text-[#706759]">
                  Add {inviteConfig.missing.join(", ")} to enable live email
                  sending from this screen.
                </p>
              ) : null}
            </div>
            <div className="border border-[#d8c49b] bg-white/90 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b7650]">
                Portal link
              </p>
              <p className="mt-2 break-all text-sm leading-6 text-[#172a28]">
                {inviteConfig.portalLoginUrl}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#706759]">
                The email tells recipients to sign in with the same email
                address that received the invitation.
              </p>
            </div>
          </div>
        </article>

        <aside className="border border-[#d8c49b] bg-[#fffaf1]/84 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">
            Recipient Lookup
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
            Current portal matching
          </h2>
          {recipientSummary ? (
            <div className="mt-5 grid gap-3 text-sm leading-6 text-[#172a28]">
              <div>
                <span className="font-semibold">Email:</span> {recipientSummary.email}
              </div>
              <div>
                <span className="font-semibold">Workbook user:</span>{" "}
                {recipientSummary.hasPortalWorkbookUser ? "Yes" : "No"}
              </div>
              <div>
                <span className="font-semibold">Assigned portal accounts:</span>{" "}
                {recipientSummary.hasPortalAssignments ? "Yes" : "No"}
              </div>
              <div>
                <span className="font-semibold">Name:</span>{" "}
                {recipientSummary.personName || "Not found"}
              </div>
              <div>
                <span className="font-semibold">Practices:</span>{" "}
                {recipientSummary.organizations.join(", ") || "None found"}
              </div>
              <div>
                <span className="font-semibold">Accounts:</span>{" "}
                {recipientSummary.accountNumbers.join(", ") || "None found"}
              </div>
              {!recipientSummary.hasPortalWorkbookUser ? (
                <p className="mt-2 border border-[#d8a15e] bg-[#fff4dd] p-3 text-sm text-[#172a28]">
                  This email is not currently in the portal workbook. The invite
                  can still be sent, but the recipient may not see account access
                  until the workbook or access rules are updated.
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-5 text-sm leading-6 text-[#706759]">
              After you enter an email or send an invite, this panel shows
              whether that recipient already maps to workbook and portal access.
            </p>
          )}

          <div className="mt-6">
            <Link href="/portal/admin" className={adminButtonClass}>
              Back to Admin Dashboard
            </Link>
          </div>
        </aside>
      </section>
    </AdminShell>
  );
}
