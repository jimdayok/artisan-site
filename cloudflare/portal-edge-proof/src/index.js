const EDGE_TIME_HEADER = "x-artisan-edge-time";
const EDGE_PROOF_HEADER = "x-artisan-edge-proof";

function toBase64Url(bytes) {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function signClientIp(secret, clientIp, timestamp) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${clientIp}\n${timestamp}`)
  );
  return toBase64Url(signature);
}

const portalEdgeProofWorker = {
  async fetch(request, env) {
    const clientIp = request.headers.get("cf-connecting-ip")?.trim();
    if (!clientIp || !env.PORTAL_EDGE_SECRET) {
      return new Response("Portal edge verification unavailable", {
        status: 503,
      });
    }

    const timestamp = String(Math.floor(Date.now() / 1000));
    const headers = new Headers(request.headers);
    headers.set("x-real-ip", clientIp);
    headers.set(EDGE_TIME_HEADER, timestamp);
    headers.set(
      EDGE_PROOF_HEADER,
      await signClientIp(env.PORTAL_EDGE_SECRET, clientIp, timestamp)
    );

    return fetch(new Request(request, { headers }));
  },
};

export default portalEdgeProofWorker;
