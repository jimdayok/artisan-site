import { headers } from "next/headers";
import Link from "next/link";
import { getPortalAdminEmailFromHeaders } from "@/lib/portal/admin";
import {
  getPortalInviteConfig,
  getPortalInviteRecipientSummary,
} from "@/lib/portal/adminInvites";
import {
  getEffectivePortalAccessAccount,
  getEffectivePortalAccessAccounts,
  getPortalAccessOverrideConfig,
} from "@/lib/portal/portalAccessOverrides";
import { PORTAL_PROGRAM_OPTIONS } from "@/lib/portal/portalAccessOverridePolicy";
import { visiblePriceListCodes } from "@/lib/portal/priceLists";
import {
  AdminAccessRequired,
  AdminShell,
  adminButtonClass,
} from "../AdminShell";

export const dynamic = "force-dynamic";

type PageQuery = {
  invite?: string;
  email?: string;
  detail?: string;
  status?: string;
  account?: string;
};

function StatusMessage({ query }: { query: PageQuery }) {
  const state = query.status || query.invite;
  if (!state) return null;
  const success = state === "saved" || state === "sent";
  const message =
    query.detail ||
    (state === "sent"
      ? `Invitation email sent to ${query.email}.`
      : state === "invalid-email"
        ? "Enter a valid email address before sending an invitation."
        : "The requested change could not be completed.");

  return (
    <section
      className={`mt-8 border p-4 text-sm shadow-[0_12px_32px_rgba(23,42,40,0.06)] ${
        success
          ? "border-[#9fc8b8] bg-[#edf8f2] text-[#172a28]"
          : "border-[#d59c9c] bg-[#fff1f1] text-[#172a28]"
      }`}
      role="status"
    >
      {message}
    </section>
  );
}

function FormButton({
  children,
  disabled,
  danger = false,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${
        danger
          ? "border border-[#9e4f4f] bg-white text-[#8b3030] hover:bg-[#fff1f1]"
          : "bg-[#172a28] text-white hover:bg-[#27433f]"
      }`}
    >
      {children}
    </button>
  );
}

const inputClass =
  "min-h-12 border border-[#d8c49b] bg-white px-4 text-sm text-[#172a28] outline-none transition focus:border-[#172a28]";

export default async function PortalAdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<PageQuery>;
}) {
  const adminEmail = getPortalAdminEmailFromHeaders(await headers());
  if (!adminEmail) return <AdminAccessRequired />;

  const query = (await searchParams) ?? {};
  const inviteConfig = getPortalInviteConfig();
  const storageConfig = getPortalAccessOverrideConfig();
  const accounts = await getEffectivePortalAccessAccounts();
  const selectedAccount = query.account
    ? await getEffectivePortalAccessAccount(query.account)
    : undefined;
  const recipientSummary = query.email
    ? await getPortalInviteRecipientSummary(query.email)
    : undefined;
  const changesDisabled = !storageConfig.configured;

  return (
    <AdminShell title="Portal Access" adminEmail={adminEmail} showHeroNav>
      <StatusMessage query={query} />

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="border border-[#d8c49b] bg-[#fffaf1]/84 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b7650]">
            Account storage
          </p>
          <p className="mt-2 text-sm leading-6">
            {storageConfig.configured
              ? "Ready. Portal changes are saved privately and remain in place across report refreshes."
              : `Not configured. Missing ${storageConfig.missing.join(", ")}.`}
          </p>
        </div>
        <div className="border border-[#d8c49b] bg-[#fffaf1]/84 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b7650]">
            Email delivery
          </p>
          <p className="mt-2 text-sm leading-6">
            {inviteConfig.enabled
              ? `Ready through Resend using ${inviteConfig.fromEmail}.`
              : `Not configured. Missing ${inviteConfig.missing.join(", ")}.`}
          </p>
        </div>
      </section>

      <section className="mt-6 border border-[#d8c49b] bg-[#fffaf1]/84 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">
          Manage an existing account
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
          Choose the customer
        </h2>
        <form method="GET" className="mt-5 flex flex-col gap-3 sm:flex-row">
          <select
            name="account"
            defaultValue={selectedAccount?.accountNumber ?? ""}
            required
            className={`${inputClass} min-w-0 flex-1`}
          >
            <option value="">Select an account</option>
            {accounts.map((account) => (
              <option key={account.accountNumber} value={account.accountNumber}>
                {account.practiceName} · {account.accountNumber}
                {account.createdInPortal && !account.hasReports
                  ? " · pending reports"
                  : ""}
              </option>
            ))}
          </select>
          <FormButton>Open account</FormButton>
        </form>
      </section>

      {selectedAccount ? (
        <section className="mt-6 border border-[#d8c49b] bg-white/88 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)] sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">
                Customer access record
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">
                {selectedAccount.practiceName}
              </h2>
              <p className="mt-2 text-sm text-[#706759]">
                {selectedAccount.accountNumber} ·{" "}
                {selectedAccount.hasReports
                  ? "Report data connected"
                  : "Pending report setup"}
              </p>
            </div>
            <Link
              href={`/portal/admin/preview/${encodeURIComponent(selectedAccount.accountNumber)}?returnTo=${encodeURIComponent(`/portal/admin/users?account=${selectedAccount.accountNumber}`)}`}
              className={adminButtonClass}
            >
              Preview customer portal
            </Link>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <article className="border border-[#d8c49b] bg-[#fffaf1] p-5">
              <h3 className="text-xl font-semibold">Email access</h3>
              <div className="mt-4 grid gap-3">
                {selectedAccount.emails.length > 0 ? (
                  selectedAccount.emails.map((email) => (
                    <div
                      key={email}
                      className="flex flex-col gap-3 border border-[#e2d5ba] bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="break-all text-sm">{email}</span>
                      <form action="/portal/admin/users/access" method="POST">
                        <input type="hidden" name="operation" value="remove-email" />
                        <input type="hidden" name="accountNumber" value={selectedAccount.accountNumber} />
                        <input type="hidden" name="email" value={email} />
                        <FormButton disabled={changesDisabled} danger>
                          Remove access
                        </FormButton>
                      </form>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#706759]">
                    No email addresses are assigned.
                  </p>
                )}
              </div>
              <form action="/portal/admin/users/access" method="POST" className="mt-5 grid gap-3">
                <input type="hidden" name="operation" value="add-email" />
                <input type="hidden" name="accountNumber" value={selectedAccount.accountNumber} />
                <input className={inputClass} type="email" name="email" required placeholder="name@practice.com" />
                <label className="flex items-start gap-3 text-sm leading-6 text-[#706759]">
                  <input className="mt-1 h-4 w-4" type="checkbox" name="sendInvite" disabled={!inviteConfig.enabled} />
                  Send the login invitation now
                </label>
                <FormButton disabled={changesDisabled}>Add email address</FormButton>
              </form>
            </article>

            <article className="border border-[#d8c49b] bg-[#fffaf1] p-5">
              <h3 className="text-xl font-semibold">Price lists</h3>
              <p className="mt-2 text-sm leading-6 text-[#706759]">
                Enter one or more price-list codes separated by commas. Leave blank to remove all assignments.
              </p>
              <form action="/portal/admin/users/access" method="POST" className="mt-4 grid gap-3">
                <input type="hidden" name="operation" value="set-price-lists" />
                <input type="hidden" name="accountNumber" value={selectedAccount.accountNumber} />
                <input className={inputClass} name="priceLists" defaultValue={selectedAccount.priceLists.join(", ")} placeholder="G6, NL" list="price-list-codes" />
                <datalist id="price-list-codes">
                  {visiblePriceListCodes.map((code) => (
                    <option key={code} value={code} />
                  ))}
                </datalist>
                <FormButton disabled={changesDisabled}>Save price lists</FormButton>
              </form>
            </article>

            <article className="border border-[#d8c49b] bg-[#fffaf1] p-5">
              <h3 className="text-xl font-semibold">Programs</h3>
              <form action="/portal/admin/users/access" method="POST" className="mt-4 grid gap-3">
                <input type="hidden" name="operation" value="set-programs" />
                <input type="hidden" name="accountNumber" value={selectedAccount.accountNumber} />
                <div className="grid gap-2 sm:grid-cols-2">
                  {PORTAL_PROGRAM_OPTIONS.map((program) => (
                    <label key={program.code} className="flex items-start gap-3 border border-[#e2d5ba] bg-white p-3 text-sm">
                      <input className="mt-0.5 h-4 w-4" type="checkbox" name="programs" value={program.code} defaultChecked={selectedAccount.programs.includes(program.code)} />
                      <span>
                        <strong>{program.label}</strong><br />
                        <span className="text-[#706759]">{program.code}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <label className="grid gap-2 text-sm font-semibold">
                  Other program codes
                  <input
                    className={inputClass}
                    name="additionalPrograms"
                    defaultValue={selectedAccount.programs
                      .filter(
                        (code) =>
                          !PORTAL_PROGRAM_OPTIONS.some(
                            (program) => program.code === code
                          )
                      )
                      .join(", ")}
                    placeholder="Optional"
                  />
                </label>
                <FormButton disabled={changesDisabled}>Save programs</FormButton>
              </form>
            </article>

            <article className="border border-[#d8c49b] bg-[#fffaf1] p-5">
              <h3 className="text-xl font-semibold">Customer onboarding</h3>
              <p className="mt-2 text-sm leading-6 text-[#706759]">
                Enabling this adds the Onboarding Center button for this customer.
              </p>
              <form action="/portal/admin/users/access" method="POST" className="mt-4 grid gap-3">
                <input type="hidden" name="operation" value="set-onboarding" />
                <input type="hidden" name="accountNumber" value={selectedAccount.accountNumber} />
                <label className="flex items-start gap-3 border border-[#e2d5ba] bg-white p-3 text-sm font-semibold">
                  <input className="mt-0.5 h-4 w-4" type="checkbox" name="onboarding" defaultChecked={selectedAccount.onboarding} />
                  Show Customer Onboarding Center
                </label>
                {selectedAccount.emails.length > 0 ? (
                  <fieldset className="grid gap-2" disabled={!inviteConfig.enabled}>
                    <legend className="mb-2 text-sm font-semibold">
                      Optional: email these users when onboarding is enabled
                    </legend>
                    {selectedAccount.emails.map((email) => (
                      <label key={email} className="flex gap-3 text-sm text-[#706759]">
                        <input className="mt-0.5 h-4 w-4" type="checkbox" name="inviteRecipients" value={email} />
                        {email}
                      </label>
                    ))}
                  </fieldset>
                ) : null}
                <FormButton disabled={changesDisabled}>Save onboarding</FormButton>
              </form>
            </article>
          </div>
        </section>
      ) : null}

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <article className="border border-[#d8c49b] bg-[#fffaf1]/84 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">New customer</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">Add an account before reports are ready</h2>
          <form action="/portal/admin/users/access" method="POST" className="mt-5 grid gap-3">
            <input type="hidden" name="operation" value="create-account" />
            <input className={inputClass} name="practiceName" required placeholder="Customer account name" />
            <input className={inputClass} name="accountNumber" placeholder="Future Acct ID, or leave blank for a temporary ID" />
            <input className={inputClass} type="email" name="email" placeholder="Customer email (optional)" />
            <input className={inputClass} name="priceLists" placeholder="Price list codes, for example G6" list="price-list-codes" />
            <label className="flex gap-3 text-sm"><input className="mt-0.5 h-4 w-4" type="checkbox" name="onboarding" />Show Customer Onboarding Center</label>
            <label className="flex gap-3 text-sm"><input className="mt-0.5 h-4 w-4" type="checkbox" name="sendInvite" disabled={!inviteConfig.enabled} />Send a login email to the customer</label>
            <FormButton disabled={changesDisabled}>Create customer account</FormButton>
          </form>
        </article>

        <article className="border border-[#d8c49b] bg-[#fffaf1]/84 p-6 shadow-[0_18px_55px_rgba(23,42,40,0.08)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7650]">One-time invitation</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">Send a login invitation</h2>
          <p className="mt-3 text-sm leading-6 text-[#706759]">Use this for an email that is already assigned to an account.</p>
          <form action="/portal/admin/users/invite" method="POST" className="mt-5 grid gap-3">
            <input className={inputClass} type="email" name="email" required defaultValue={query.email ?? ""} placeholder="name@practice.com" />
            <FormButton disabled={!inviteConfig.enabled}>Send invite</FormButton>
          </form>
          {recipientSummary ? (
            <div className="mt-5 border border-[#d8c49b] bg-white p-4 text-sm leading-6">
              <p><strong>Account access:</strong> {recipientSummary.accountNumbers.join(", ") || "None"}</p>
              <p><strong>Practices:</strong> {recipientSummary.organizations.join(", ") || "None"}</p>
              <p><strong>Ready to log in:</strong> {recipientSummary.hasPortalAssignments ? "Yes" : "No — assign the email first"}</p>
            </div>
          ) : null}
        </article>
      </section>
    </AdminShell>
  );
}
