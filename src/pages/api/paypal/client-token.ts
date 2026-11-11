import * as Sentry from "@sentry/astro";

export const prerender = false;

const paypalClientId = import.meta.env.PAYPAL_CLIENT_ID;
const paypalClientSecret = import.meta.env.PAYPAL_CLIENT_SECRET;
const paypalApiUrl = import.meta.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";

export async function GET() {
  try {
    if (!paypalClientId || !paypalClientSecret) throw new Error("PayPal sandbox credentials are not configured");

    const tokenResponse = await fetch(`${paypalApiUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) throw new Error("Unable to authenticate with PayPal sandbox");

    const clientTokenResponse = await fetch(`${paypalApiUrl}/v1/identity/generate-token`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenData.access_token}`, "Content-Type": "application/json" },
    });
    const clientTokenData = await clientTokenResponse.json();
    if (!clientTokenResponse.ok) throw new Error("Unable to generate a PayPal client token");

    return new Response(JSON.stringify({ clientToken: clientTokenData.client_token }), { status: 200 });
  } catch (error) {
    Sentry.captureException(error, { tags: { payment_flow: "paypal", operation: "client_token" } });
    console.error("PayPal client token error", error);
    return new Response(JSON.stringify({ error: "PayPal sandbox is not configured yet." }), { status: 500 });
  }
}
