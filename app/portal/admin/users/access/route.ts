import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getPortalAdminEmailFromHeaders } from "@/lib/portal/admin";
import { sendPortalInviteEmail } from "@/lib/portal/adminInvites";
import { setCloudflareAccessEmail } from "@/lib/portal/cloudflareAccessPolicy";
import {
  appendPortalAccessAdminEvent,
  getEffectivePortalAccessAccount,
  getEffectivePortalAccessAccountsForEmail,
} from "@/lib/portal/portalAccessOverrides";
import {
  normalizePortalAccessAccountNumber,
  normalizePortalAccessEmail,
  normalizePortalAccessPrograms,
} from "@/lib/portal/portalAccessOverridePolicy";
import { canonicalPriceListCode, getPriceListByCode } from "@/lib/portal/priceLists";

export const dynamic = "force-dynamic";

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

function redirectToUsers(
  request: Request,
  status: string,
  detail: string,
  accountNumber = ""
) {
  const params = new URLSearchParams({ status, detail });
  if (accountNumber) params.set("account", accountNumber);
  return NextResponse.redirect(
    new URL(`/portal/admin/users?${params.toString()}`, request.url),
    303
  );
}

function selectedPriceLists(formData: FormData) {
  const raw = formData
    .getAll("priceLists")
    .flatMap((value) => clean(value).split(/[;,|]/));
  const codes = [...new Set(raw.map(canonicalPriceListCode).filter(Boolean))];
  const invalid = codes.filter((code) => !getPriceListByCode(code));
  if (invalid.length > 0) {
    throw new Error(`Unknown price list: ${invalid.join(", ")}.`);
  }
  return codes;
}

function selectedPrograms(formData: FormData) {
  return normalizePortalAccessPrograms([
    ...formData.getAll("programs"),
    clean(formData.get("additionalPrograms")),
  ]);
}

function pendingAccountNumber(practiceName: string) {
  const slug = normalizePortalAccessAccountNumber(practiceName)
    .split("-")
    .filter(Boolean)
    .slice(0, 3)
    .join("-")
    .slice(0, 28);
  return `PENDING-${slug || "ACCOUNT"}-${randomBytes(3)
    .toString("hex")
    .toUpperCase()}`;
}

async function sendInvites({
  emails,
  actorEmail,
  kind,
  practiceName,
}: {
  emails: string[];
  actorEmail: string;
  kind: "portal" | "onboarding";
  practiceName: string;
}) {
  const results = await Promise.allSettled(
    emails.map((recipientEmail) =>
      sendPortalInviteEmail({
        recipientEmail,
        sentBy: actorEmail,
        kind,
        practiceName,
      })
    )
  );
  const failures = results.filter((result) => result.status === "rejected");
  if (failures.length > 0) {
    throw new Error(
      `Access was saved, but ${failures.length} of ${emails.length} email${emails.length === 1 ? "" : "s"} could not be sent.`
    );
  }
}

async function saveAccessWithCloudflare({
  event,
  email,
  cloudflareOperation,
}: {
  event: Parameters<typeof appendPortalAccessAdminEvent>[0];
  email: string;
  cloudflareOperation: "add" | "remove";
}) {
  const cloudflare = await setCloudflareAccessEmail(email, cloudflareOperation);
  try {
    return await appendPortalAccessAdminEvent(event);
  } catch (error) {
    if (cloudflare.changed) {
      await setCloudflareAccessEmail(
        email,
        cloudflareOperation === "add" ? "remove" : "add"
      ).catch(() => undefined);
    }
    throw error;
  }
}

export async function POST(request: Request) {
  const actorEmail = getPortalAdminEmailFromHeaders(request.headers);
  if (!actorEmail) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const formData = await request.formData();
  const operation = clean(formData.get("operation"));

  try {
    if (operation === "create-account") {
      const practiceName = clean(formData.get("practiceName"));
      if (!practiceName) throw new Error("Enter an account name.");
      const requestedAccountNumber = normalizePortalAccessAccountNumber(
        clean(formData.get("accountNumber"))
      );
      const accountNumber =
        requestedAccountNumber || pendingAccountNumber(practiceName);
      if (await getEffectivePortalAccessAccount(accountNumber)) {
        throw new Error(`Account ${accountNumber} already exists.`);
      }
      const email = normalizePortalAccessEmail(formData.get("email"));
      const rawEmail = clean(formData.get("email"));
      if (rawEmail && !email) throw new Error("Enter a valid email address.");
      const priceLists = selectedPriceLists(formData);
      const programs = selectedPrograms(formData);
      const onboarding = formData.get("onboarding") === "on";

      const event = {
        type: "account-created" as const,
        actorEmail,
        accountNumber,
        practiceName,
        emails: email ? [email] : [],
        priceLists,
        programs,
        onboarding,
      };
      if (email) {
        await saveAccessWithCloudflare({
          event,
          email,
          cloudflareOperation: "add",
        });
      } else {
        await appendPortalAccessAdminEvent(event);
      }

      if (email && formData.get("sendInvite") === "on") {
        await sendInvites({
          emails: [email],
          actorEmail,
          kind: onboarding ? "onboarding" : "portal",
          practiceName,
        });
      }

      return redirectToUsers(
        request,
        "saved",
        `${practiceName} was added${email && formData.get("sendInvite") === "on" ? " and the invitation was sent" : ""}.`,
        accountNumber
      );
    }

    const accountNumber = normalizePortalAccessAccountNumber(
      clean(formData.get("accountNumber"))
    );
    const account = await getEffectivePortalAccessAccount(accountNumber);
    if (!account) throw new Error("Choose a valid account.");

    if (operation === "add-email") {
      const email = normalizePortalAccessEmail(formData.get("email"));
      if (!email) throw new Error("Enter a valid email address.");
      await saveAccessWithCloudflare({
        event: {
          type: "email-added",
          actorEmail,
          accountNumber: account.accountNumber,
          email,
        },
        email,
        cloudflareOperation: "add",
      });
      if (formData.get("sendInvite") === "on") {
        await sendInvites({
          emails: [email],
          actorEmail,
          kind: "portal",
          practiceName: account.practiceName,
        });
      }
      return redirectToUsers(
        request,
        "saved",
        `${email} was added${formData.get("sendInvite") === "on" ? " and invited" : ""}.`,
        account.accountNumber
      );
    }

    if (operation === "remove-email") {
      const email = normalizePortalAccessEmail(formData.get("email"));
      if (!email || !account.emails.includes(email)) {
        throw new Error("That email is not assigned to this account.");
      }
      const otherAssignments = (
        await getEffectivePortalAccessAccountsForEmail(email)
      ).filter(
        (assignedAccount) =>
          assignedAccount.accountNumber !== account.accountNumber
      );
      if (otherAssignments.length > 0) {
        await appendPortalAccessAdminEvent({
          type: "email-removed",
          actorEmail,
          accountNumber: account.accountNumber,
          email,
        });
      } else {
        await saveAccessWithCloudflare({
          event: {
            type: "email-removed",
            actorEmail,
            accountNumber: account.accountNumber,
            email,
          },
          email,
          cloudflareOperation: "remove",
        });
      }
      return redirectToUsers(
        request,
        "saved",
        `${email} was removed from ${account.practiceName}.`,
        account.accountNumber
      );
    }

    if (operation === "set-price-lists") {
      const priceLists = selectedPriceLists(formData);
      await appendPortalAccessAdminEvent({
        type: "price-lists-set",
        actorEmail,
        accountNumber: account.accountNumber,
        priceLists,
      });
      return redirectToUsers(
        request,
        "saved",
        `Price lists were updated for ${account.practiceName}.`,
        account.accountNumber
      );
    }

    if (operation === "set-programs") {
      const programs = selectedPrograms(formData);
      await appendPortalAccessAdminEvent({
        type: "programs-set",
        actorEmail,
        accountNumber: account.accountNumber,
        programs,
      });
      return redirectToUsers(
        request,
        "saved",
        `Programs were updated for ${account.practiceName}.`,
        account.accountNumber
      );
    }

    if (operation === "set-onboarding") {
      const onboarding = formData.get("onboarding") === "on";
      await appendPortalAccessAdminEvent({
        type: "onboarding-set",
        actorEmail,
        accountNumber: account.accountNumber,
        onboarding,
      });
      const recipients = formData
        .getAll("inviteRecipients")
        .map(normalizePortalAccessEmail)
        .filter((email) => email && account.emails.includes(email));
      if (onboarding && recipients.length > 0) {
        await sendInvites({
          emails: [...new Set(recipients)],
          actorEmail,
          kind: "onboarding",
          practiceName: account.practiceName,
        });
      }
      return redirectToUsers(
        request,
        "saved",
        `Customer onboarding was ${onboarding ? "enabled" : "removed"}${recipients.length > 0 ? ` and ${recipients.length} email${recipients.length === 1 ? " was" : "s were"} sent` : ""}.`,
        account.accountNumber
      );
    }

    throw new Error("Unknown account action.");
  } catch (error) {
    const accountNumber = normalizePortalAccessAccountNumber(
      clean(formData.get("accountNumber"))
    );
    return redirectToUsers(
      request,
      "error",
      error instanceof Error ? error.message : "The change could not be saved.",
      accountNumber
    );
  }
}
