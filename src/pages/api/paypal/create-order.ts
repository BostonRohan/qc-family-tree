import * as Sentry from "@sentry/astro";
import { isValidDonationAmount } from "@/lib/donation";

export const prerender = false;

const paypalClientId = import.meta.env.PAYPAL_CLIENT_ID;
const paypalClientSecret = import.meta.env.PAYPAL_CLIENT_SECRET;
const paypalApiUrl = import.meta.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  if (!paypalClientId || !paypalClientSecret) {
    throw new Error("PayPal sandbox credentials are not configured");
  }

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
    const { amount } = await request.json();
    const numericAmount = Number(amount);

    if (!isValidDonationAmount(numericAmount)) {
      return new Response(JSON.stringify({ error: "Enter an amount between $1 and $10,000." }), { status: 400 });
    }

    const accessToken = await getAccessToken();
    const response = await fetch(`${paypalApiUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          description: "Donation to QC Family Tree",
          amount: { currency_code: "USD", value: numericAmount.toFixed(2) },
        }],
      }),
    });

    const data = await response.json();
    if (!response.ok) return new Response(JSON.stringify({ error: "PayPal could not create the order.", details: data }), { status: response.status });
    return new Response(JSON.stringify({ id: data.id }), { status: 201 });
  } catch (error) {
    Sentry.captureException(error, { tags: { payment_flow: "paypal", operation: "create_order" } });
    console.error("PayPal create order error", error);
    return new Response(JSON.stringify({ error: "PayPal sandbox is not configured yet." }), { status: 500 });
  }
}
