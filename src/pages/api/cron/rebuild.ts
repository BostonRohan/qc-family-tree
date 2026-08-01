import type { APIRoute } from "astro";
import { triggerRebuild } from "@/lib/rebuild";

const CRON_SECRET = import.meta.env.CRON_SECRET;

function jsonResponse(
  body: Record<string, boolean | string>,
  status = 200,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ request }) => {
  const authorization = request.headers.get("authorization");
  if (!CRON_SECRET || authorization !== `Bearer ${CRON_SECRET}`) {
    return jsonResponse({ ok: false, error: "Unauthorized" }, 401);
  }

  try {
    await triggerRebuild();
    return jsonResponse({ ok: true, message: "Rebuild triggered" });
  } catch (error) {
    console.error("[rebuild cron] Failed to trigger rebuild", error);
    return jsonResponse({ ok: false, error: "Failed to trigger rebuild" }, 502);
  }
};
