import "server-only";

import { getEffectivePortalAccessAccountsForEmail } from "@/lib/portal/portalAccessOverrides";
import { getPortalUserByEmail, normalizeEmail } from "@/lib/portal/userDataAccess";

export type PortalInviteRecipientSummary = {
  email: string;
  personName: string;
  organizations: string[];
  accountNumbers: string[];
  practiceNames: string[];
  hasPortalWorkbookUser: boolean;
  hasPortalAssignments: boolean;
};

export function getPortalInviteConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim() ?? "";
  const fromEmail =
    process.env.PORTAL_INVITE_FROM_EMAIL?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "";
  const replyToEmail =
    process.env.PORTAL_INVITE_REPLY_TO_EMAIL?.trim() ||
    process.env.RESEND_REPLY_TO_EMAIL?.trim() ||
    "";
  const configuredSiteDomain = process.env.NEXT_PUBLIC_SITE_DOMAIN?.trim() || "";
  const portalBaseUrl =
    process.env.PORTAL_INVITE_URL?.trim() ||
    process.env.PORTAL_URL?.trim() ||
    process.env.NEXT_PUBLIC_PORTAL_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (configuredSiteDomain
      ? `https://${configuredSiteDomain}`
      : "https://www.artisanlabnetwork.com");
  const portalLoginUrl = `${portalBaseUrl.replace(/\/$/, "")}/portal`;

  const missing: string[] = [];
  if (!apiKey) missing.push("RESEND_API_KEY");
  if (!fromEmail) missing.push("PORTAL_INVITE_FROM_EMAIL");

  return {
    enabled: missing.length === 0,
    missing,
    apiKey,
    fromEmail,
    replyToEmail,
    portalLoginUrl,
    supportEmail:
      process.env.PORTAL_INVITE_SUPPORT_EMAIL?.trim() ||
      process.env.PORTAL_SUPPORT_EMAIL?.trim() ||
      "info@artisanlabnetwork.com",
  };
}

export async function getPortalInviteRecipientSummary(
  rawEmail: string
): Promise<PortalInviteRecipientSummary> {
  const email = normalizeEmail(rawEmail);
  const workbookUser = email ? await getPortalUserByEmail(email) : undefined;
  const portalCustomers = email
    ? await getEffectivePortalAccessAccountsForEmail(email)
    : [];

  return {
    email,
    personName: workbookUser?.personName || "",
    organizations: [
      ...new Set(
        portalCustomers.map((customer) => customer.practiceName).filter(Boolean)
      ),
    ],
    accountNumbers: [
      ...new Set(
        portalCustomers.map((customer) => customer.accountNumber).filter(Boolean)
      ),
    ],
    practiceNames: [...new Set(portalCustomers.map((customer) => customer.practiceName).filter(Boolean))],
    hasPortalWorkbookUser: Boolean(workbookUser),
    hasPortalAssignments: portalCustomers.length > 0,
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildInviteEmail({
  recipient,
  sentBy,
  portalLoginUrl,
  supportEmail,
  kind,
  practiceName,
}: {
  recipient: PortalInviteRecipientSummary;
  sentBy: string;
  portalLoginUrl: string;
  supportEmail: string;
  kind: "portal" | "onboarding";
  practiceName?: string;
}) {
  const greetingName = recipient.personName || recipient.email;
  const accountLine =
    recipient.accountNumbers.length > 0
      ? `Account access on file: ${recipient.accountNumbers.join(", ")}`
      : "Account access will be confirmed by the Artisan team if you do not see your portal access immediately after login.";
  const practiceLine =
    recipient.organizations.length > 0
      ? `Practice(s) on file: ${recipient.organizations.join(", ")}`
      : "Practice assignment will be confirmed by the Artisan team if needed.";

  const isOnboarding = kind === "onboarding";
  const intro = isOnboarding
    ? `Customer onboarding is now available${practiceName ? ` for ${practiceName}` : ""} in the Artisan Lab Network portal.`
    : "You have been invited to the Artisan Lab Network customer portal.";
  const destination = isOnboarding
    ? "After signing in, choose Onboarding Center to begin."
    : "Inside the portal you can access pricing, provider resources, account details, onboarding, and support tools based on your account permissions.";
  const text = [
    `Hello ${greetingName},`,
    "",
    intro,
    "",
    `Portal login: ${portalLoginUrl}`,
    "",
    "Please sign in with this exact email address.",
    accountLine,
    practiceLine,
    "",
    destination,
    "",
    `If you have trouble signing in or do not see the expected account access, contact ${supportEmail}.`,
    "",
    `Invitation sent by: ${sentBy}`,
    "Artisan Lab Network",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #172a28; line-height: 1.6;">
      <p>Hello ${escapeHtml(greetingName)},</p>
      <p>${escapeHtml(intro)}</p>
      <p><strong>Portal login:</strong> <a href="${escapeHtml(portalLoginUrl)}">${escapeHtml(portalLoginUrl)}</a></p>
      <p>Please sign in with this exact email address.</p>
      <p><strong>${escapeHtml(accountLine)}</strong><br />${escapeHtml(practiceLine)}</p>
      <p>${escapeHtml(destination)}</p>
      <p>If you have trouble signing in or do not see the expected account access, contact <a href="mailto:${escapeHtml(supportEmail)}">${escapeHtml(supportEmail)}</a>.</p>
      <p style="margin-top: 24px;">Invitation sent by: ${escapeHtml(sentBy)}<br />Artisan Lab Network</p>
    </div>
  `;

  return {
    subject: isOnboarding
      ? "Your Artisan customer onboarding center is ready"
      : "You're invited to the Artisan Lab Network customer portal",
    text,
    html,
  };
}

export async function sendPortalInviteEmail({
  recipientEmail,
  sentBy,
  kind = "portal",
  practiceName,
}: {
  recipientEmail: string;
  sentBy: string;
  kind?: "portal" | "onboarding";
  practiceName?: string;
}) {
  const config = getPortalInviteConfig();
  if (!config.enabled) {
    throw new Error(`Portal invite email is not configured. Missing: ${config.missing.join(", ")}`);
  }

  const recipient = await getPortalInviteRecipientSummary(recipientEmail);
  const message = buildInviteEmail({
    recipient,
    sentBy,
    portalLoginUrl: config.portalLoginUrl,
    supportEmail: config.supportEmail,
    kind,
    practiceName,
  });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.fromEmail,
      to: [recipient.email],
      subject: message.subject,
      html: message.html,
      text: message.text,
      reply_to: config.replyToEmail || undefined,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend request failed (${response.status}): ${detail}`);
  }

  return recipient;
}
