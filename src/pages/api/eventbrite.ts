import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const contentType = request.headers.get("content-type") ?? "";

  try {
    const body =
      contentType.includes("application/json") ? await request.json() : await request.text();

    console.log("[Eventbrite webhook] Request received", {
      contentType,
      body,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[Eventbrite webhook] Failed to read request", error);

    return new Response(JSON.stringify({ ok: false }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
