import type { APIRoute } from "astro";
import { triggerRebuild } from "@/lib/rebuild";

const EVENTBRITE_WEBHOOK_SECRET = import.meta.env.EVENTBRITE_WEBHOOK_SECRET;

function jsonResponse(body: Record<string, boolean | string>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: APIRoute = async ({ params, request }) => {
  if (!EVENTBRITE_WEBHOOK_SECRET || params.secret !== EVENTBRITE_WEBHOOK_SECRET) {
    return jsonResponse({ ok: false, error: "Unauthorized" }, 401);
  }

  const contentType = request.headers.get("content-type") ?? "";
  const mediaType = contentType.split(";", 1)[0]?.trim().toLowerCase();
  if (mediaType !== "application/json") {
    return jsonResponse({ ok: false, error: "Content-Type must be application/json" }, 415);
  }

  try {
    await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400);
  }

  try {
    await triggerRebuild();
    return jsonResponse({ ok: true });
  } catch (error) {
    console.error("[Eventbrite webhook] Failed to trigger rebuild", error);
    return jsonResponse({ ok: false, error: "Failed to trigger rebuild" }, 502);
  }
};
