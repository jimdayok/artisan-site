import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { artisanControlClass } from "@/app/components/controlStyles";
import { getPortalAuthenticatedEmailFromHeaders } from "@/lib/portal/auth";
import {
  canAccessPortalAdmin,
  getPortalStaffRole,
} from "@/lib/portal/portalRoles";
import {
  sanitizeTrustedNetworkReturnTo,
  trustedNetworkConfigurationIssues,
} from "@/lib/portal/trustedNetworkAccess";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lab & VPN Admin Access | Artisan Lab Network",
  robots: { index: false, follow: false },
};

export default async function TrustedNetworkAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; returnTo?: string }>;
}) {
  const authenticatedEmail = getPortalAuthenticatedEmailFromHeaders(
    await headers()
  );
  if (authenticatedEmail) {
    redirect(
      canAccessPortalAdmin(getPortalStaffRole(authenticatedEmail))
        ? "/portal/admin"
        : "/portal"
    );
  }

  const query = await searchParams;
  const returnTo = sanitizeTrustedNetworkReturnTo(query.returnTo);
  const configurationIssues = trustedNetworkConfigurationIssues();
  const isReady = configurationIssues.length === 0;
  const hasIncorrectPassword = query.error === "incorrect-password";

  return (
    <main className="flex min-h-screen items-center bg-[#f4efe6] px-5 py-12 text-[#172a28] sm:px-8">
      <section className="mx-auto w-full max-w-xl border border-[#d8c49b] bg-[#fffaf1] p-7 shadow-[0_24px_80px_rgba(23,42,40,0.14)] sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b7650]">
          Trusted Artisan Network
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
          Admin master access
        </h1>
        <p className="mt-4 text-base leading-7 text-[#706759]">
          This device is connecting through an approved Artisan lab or the
          Artisan VPN. No email sign-in is required. Enter the admin master
          password to continue.
        </p>

        {!isReady ? (
          <div className="mt-7 border border-[#c98b63] bg-[#fff3e8] p-4 text-sm leading-6 text-[#6f3d22]">
            Trusted-network admin access has not been fully configured. Contact
            the portal administrator.
          </div>
        ) : null}

        {hasIncorrectPassword ? (
          <div
            className="mt-7 border border-[#b76464] bg-[#fff0ef] p-4 text-sm font-semibold text-[#7b2f2f]"
            role="alert"
          >
            That master password was not accepted. Please try again.
          </div>
        ) : null}

        <form
          action="/api/portal/network-access/session"
          method="post"
          className="mt-7"
        >
          <input type="hidden" name="returnTo" value={returnTo} />
          <label
            htmlFor="master-password"
            className="text-sm font-semibold text-[#172a28]"
          >
            Admin master password
          </label>
          <input
            id="master-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={!isReady}
            autoFocus={isReady}
            className="mt-2 min-h-12 w-full border border-[#cbb891] bg-white px-4 text-base outline-none transition focus:border-[#172a28] focus:ring-2 focus:ring-[#172a28]/15 disabled:cursor-not-allowed disabled:bg-[#eee8de]"
          />
          <button
            type="submit"
            disabled={!isReady}
            className={artisanControlClass({
              tone: "primary",
              size: "lg",
              className:
                "mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50",
            })}
          >
            Unlock Admin Portal
          </button>
        </form>

        <p className="mt-6 text-xs leading-5 text-[#8a8174]">
          Access automatically locks after eight hours and remains valid only
          while this device is using an approved network.
        </p>
      </section>
    </main>
  );
}
