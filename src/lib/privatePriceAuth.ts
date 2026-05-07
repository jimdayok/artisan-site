import { createHash } from "crypto";

export const privatePriceListCookieName = "artisan_private_price_list";
export const privatePriceListDefaultPassword = "Artisan2026";

export function privatePriceListPassword() {
  return process.env.PRIVATE_PRICE_LIST_PASSWORD ?? privatePriceListDefaultPassword;
}

export function privatePriceListToken(password: string) {
  return createHash("sha256").update(`artisan-private-price-list:${password}`).digest("hex");
}
