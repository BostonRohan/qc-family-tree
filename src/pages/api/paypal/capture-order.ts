import * as Sentry from "@sentry/astro";

export const prerender = false;

const paypalClientId = import.meta.env.PAYPAL_CLIENT_ID;
const paypalClientSecret = import.meta.env.PAYPAL_CLIENT_SECRET;
const paypalApiUrl = import.meta.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  if (!paypalClientId || !paypalClientSecret) throw new Error("PayPal sandbox credentials are not configured");

  const response = await fetch(`${paypalApiUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) throw new Error("Unable to authenticate with PayPal sandbox");
  const data = await response.json();
  return data.access_token as string;
}

export async function POST({ request }: { request: Request }) {
  try {
    const { orderID } = await request.json();
    if (typeof orderID !== "string" || !orderID) return new Response(JSON.stringify({ error: "Missing PayPal order ID." }), { status: 400 });

    const accessToken = await getAccessToken();
    const response = await fetch(`${paypalApiUrl}/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (!response.ok) return new Response(JSON.stringify({ error: "PayPal could not capture the order.", details: data }), { status: response.status });
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    Sentry.captureException(error, { tags: { payment_flow: "paypal", operation: "capture_order" } });
    console.error("PayPal capture order error", error);
    return new Response(JSON.stringify({ error: "PayPal sandbox is not configured yet." }), { status: 500 });
  }
}
