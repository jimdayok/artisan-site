import {
  buildTypeformLeadEvent,
  verifyTypeformSignature,
} from "@/lib/analytics/typeform-webhook.server";
import { syncPipedriveAttribution } from "@/lib/integrations/pipedrive-attribution.server";

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

  // The signed sync reuses an exact-email person or creates the minimum contact
  // records needed for a new email, then updates or creates a neutral Leads
  // Inbox record. Sensitive application answers remain in Typeform. Pipedrive
  // failure cannot block the Typeform response or GA4 delivery paths.
  const pipedriveAttribution = syncPipedriveAttribution(parsed);

  const { event, reason } = buildTypeformLeadEvent(parsed, webhookSecret);
  if (!event) {
    const pipedrive = await pipedriveAttribution;
    return Response.json({
      received: true,
      tracked: false,
      reason,
      pipedrive_attribution: pipedrive.status,
      ...(pipedrive.errorStage
        ? {
            pipedrive_error_stage: pipedrive.errorStage,
            pipedrive_http_status: pipedrive.httpStatus,
          }
        : {}),
    });
  }

  const endpoint = new URL("https://www.google-analytics.com/mp/collect");
  endpoint.searchParams.set("measurement_id", measurementId);
  endpoint.searchParams.set("api_secret", apiSecret);
  const [response, pipedrive] = await Promise.all([
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      cache: "no-store",
    }),
    pipedriveAttribution,
  ]);

  if (!response.ok) {
    return Response.json({ received: false }, { status: 502 });
  }

  return Response.json({
    received: true,
    tracked: true,
    pipedrive_attribution: pipedrive.status,
    ...(pipedrive.errorStage
      ? {
          pipedrive_error_stage: pipedrive.errorStage,
          pipedrive_http_status: pipedrive.httpStatus,
        }
      : {}),
  });
}
