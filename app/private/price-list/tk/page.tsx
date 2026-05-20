import { redirect } from "next/navigation";

export default function LegacyPrivateTkPage() {
  redirect("/portal/price-list/tk");
}
