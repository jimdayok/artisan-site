"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { privatePriceListCookieName, privatePriceListPassword, privatePriceListToken } from "../../../src/lib/privatePriceAuth";

export async function unlockPrivatePriceList(formData: FormData) {
  const configuredPassword = privatePriceListPassword();
  const submittedPassword = String(formData.get("password") ?? "");
  const submittedNextPath = String(formData.get("nextPath") ?? "");
  const nextPath = submittedNextPath.startsWith("/private/price-list") && !submittedNextPath.startsWith("/private/price-list/access")
    ? submittedNextPath
    : "/private/price-list";

  if (submittedPassword !== configuredPassword) {
    redirect(`/private/price-list/access?error=1&next=${encodeURIComponent(nextPath)}`);
  }

  const cookieStore = await cookies();
  cookieStore.set(privatePriceListCookieName, privatePriceListToken(configuredPassword), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/private/price-list",
  });

  redirect(nextPath);
}
