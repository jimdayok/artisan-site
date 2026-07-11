import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getPortalAdminEmailFromHeaders } from "@/lib/portal/admin";
import { normalizeEmail } from "@/lib/portal/userDataAccess";
import { getPortalInviteConfig, sendPortalInviteEmail } from "@/lib/portal/adminInvites";

export const dynamic = "force-dynamic";

function redirectToUsers(request: Request, status: string, email = "", detail = "") {
  const params = new URLSearchParams();
  params.set("invite", status);
  if (email) params.set("email", email);
  if (detail) params.set("detail", detail);
  return NextResponse.redirect(
    new URL(`/portal/admin/users?${params.toString()}`, request.url),
    303
  );
}

export async function POST(request: Request) {
  const adminEmail = getPortalAdminEmailFromHeaders(await headers());
  if (!adminEmail) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const formData = await request.formData();
  const recipientEmail = normalizeEmail(formData.get("email"));
  if (!recipientEmail) {
    return redirectToUsers(request, "invalid-email");
  }

  const config = getPortalInviteConfig();
  if (!config.enabled) {
    return redirectToUsers(request, "config-missing", recipientEmail, config.missing.join(", "));
  }

  try {
    await sendPortalInviteEmail({
      recipientEmail,
      sentBy: adminEmail,
    });
    return redirectToUsers(request, "sent", recipientEmail);
  } catch (error) {
    return redirectToUsers(
      request,
      "error",
      recipientEmail,
      error instanceof Error ? error.message : "Unknown invite error"
    );
  }
}
