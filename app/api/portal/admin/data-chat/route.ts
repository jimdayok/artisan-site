import { NextRequest } from "next/server";
import { getPortalAdminEmailFromHeaders } from "@/lib/portal/admin";
import { askArtisanData, type DataChatMessage } from "@/lib/portal/dataChatAgent";
import { checkRateLimit } from "@/lib/portal/rateLimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_MESSAGE_LENGTH = 1_000;
const MAX_TOTAL_LENGTH = 5_000;

function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return request.headers.get("sec-fetch-site") !== "cross-site";
  try {
    return new URL(origin).origin === request.nextUrl.origin;
  } catch {
    return false;
  }
}

function validMessages(value: unknown): value is DataChatMessage[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 8) return false;
  let totalLength = 0;
  for (const message of value) {
    if (!message || typeof message !== "object") return false;
    const candidate = message as Partial<DataChatMessage>;
    if (candidate.role !== "user" && candidate.role !== "assistant") return false;
    if (typeof candidate.content !== "string") return false;
    const length = candidate.content.trim().length;
    if (length < 1 || length > MAX_MESSAGE_LENGTH) return false;
    totalLength += length;
  }
  return totalLength <= MAX_TOTAL_LENGTH && value.at(-1)?.role === "user";
}

export async function POST(request: NextRequest) {
  const adminEmail = getPortalAdminEmailFromHeaders(request.headers);
  if (!adminEmail) return json({ error: "Admin access required." }, 403);
  if (!isSameOrigin(request)) return json({ error: "Invalid request origin." }, 403);

  const rateLimit = checkRateLimit({
    key: `artisan-data-chat:${adminEmail.toLowerCase()}`,
    limit: 20,
    windowMs: 5 * 60 * 1_000,
  });
  if (!rateLimit.allowed) {
    return json({ error: "Too many questions. Please wait a few minutes and try again." }, 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const messages = (body as { messages?: unknown } | null)?.messages;
  if (!validMessages(messages)) {
    return json({ error: "Enter a shorter question and try again." }, 400);
  }

  try {
    return json(await askArtisanData(messages));
  } catch (error) {
    console.error("[ARTISAN DATA CHAT] Request failed", {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return json(
      { error: "The data assistant is temporarily unavailable. Please try again." },
      503
    );
  }
}
