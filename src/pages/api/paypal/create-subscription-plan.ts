import * as Sentry from "@sentry/astro";
import { checkBotId } from "botid/server";
import { isValidDonationAmount } from "@/lib/donation";

export const prerender = false;

const paypalClientId = import.meta.env.PAYPAL_CLIENT_ID;
const paypalClientSecret = import.meta.env.PAYPAL_CLIENT_SECRET;
const paypalProductId = import.meta.env.PAYPAL_MONTHLY_PRODUCT_ID;
const paypalApiUrl = import.meta.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  if (!paypalClientId || !paypalClientSecret) throw new Error("PayPal credentials are not configured");

  const response = await fetch(`${paypalApiUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!response.ok) throw new Error("Unable to authenticate with PayPal");
  const data = await response.json();
  return data.access_token as string;
}

export async function POST({ request }: { request: Request }) {
  try {
    const botVerification = await checkBotId();
    if (botVerification.isBot) {
      return new Response(JSON.stringify({ error: "Access denied" }), { status: 403 });
    }

    if (!paypalProductId) throw new Error("PayPal monthly product is not configured");
    const { amount } = await request.json();
    const numericAmount = Number(amount);

    if (!isValidDonationAmount(numericAmount)) {
      return new Response(JSON.stringify({ error: "Enter a monthly amount between $1 and $10,000." }), { status: 400 });
    }

    const accessToken = await getAccessToken();
    const amountKey = numericAmount.toFixed(2).replace(".", "-");
    const response = await fetch(`${paypalApiUrl}/v1/billing/plans`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": `qcft-monthly-${amountKey}`,
      },
      body: JSON.stringify({
        product_id: paypalProductId,
        name: `QC Family Tree Monthly Giving $${numericAmount.toFixed(2)}`,
        description: "Monthly donation to QC Family Tree",
        status: "ACTIVE",
        billing_cycles: [{
          frequency: { interval_unit: "MONTH", interval_count: 1 },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: { currency_code: "USD", value: numericAmount.toFixed(2) },
          },
        }],
        payment_preferences: {
          auto_bill_outstanding: true,
          payment_failure_threshold: 3,
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return new Response(JSON.stringify({ error: "PayPal could not create the monthly plan." }), { status: response.status });
    }
    return new Response(JSON.stringify({ planId: data.id }), { status: 201 });
  } catch (error) {
    Sentry.captureException(error, { tags: { payment_flow: "paypal", operation: "create_subscription_plan" } });
    console.error("PayPal monthly plan error", error);
    return new Response(JSON.stringify({ error: "Monthly giving is not configured yet." }), { status: 500 });
  }
}
