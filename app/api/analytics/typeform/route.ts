import {
  buildTypeformLeadEvent,
  verifyTypeformSignature,
} from "@/lib/analytics/typeform-webhook.server";

const MAX_WEBHOOK_BYTES = 1_000_000;

export async function POST(request: Request) {
  const webhookSecret = process.env.TYPEFORM_ANALYTICS_WEBHOOK_SECRET?.trim();
  const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim();
  const apiSecret =
    process.env.GA4_MEASUREMENT_PROTOCOL_API_SECRET?.trim();

  if (!webhookSecret || !measurementId || !apiSecret) {
    return Response.json({ received: false }, { status: 503 });
  }

  const rawPayload = await request.text();
  if (Buffer.byteLength(rawPayload, "utf8") > MAX_WEBHOOK_BYTES) {
    return Response.json({ received: false }, { status: 413 });
  }

  if (
    !verifyTypeformSignature(
      request.headers.get("typeform-signature"),
      rawPayload,
      webhookSecret,
    )
  ) {
    return Response.json({ received: false }, { status: 403 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawPayload);
  } catch {
    return Response.json({ received: false }, { status: 400 });
  }

  const { event, reason } = buildTypeformLeadEvent(parsed, webhookSecret);
  if (!event) {
    return Response.json({ received: true, tracked: false, reason });
  }

  const endpoint = new URL("https://www.google-analytics.com/mp/collect");
  endpoint.searchParams.set("measurement_id", measurementId);
  endpoint.searchParams.set("api_secret", apiSecret);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
    cache: "no-store",
  });

  if (!response.ok) {
    return Response.json({ received: false }, { status: 502 });
  }

  return Response.json({ received: true, tracked: true });
}
