#!/usr/bin/env node

const apiUrl = (process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com").replace(/\/$/, "");
const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
const merchantEmail = process.env.PAYPAL_MERCHANT_EMAIL;
const merchantPayerId = process.env.PAYPAL_MERCHANT_PAYER_ID;
const productName = process.env.PAYPAL_PRODUCT_NAME || "QC Family Tree Monthly Giving";
const productDescription = process.env.PAYPAL_PRODUCT_DESCRIPTION || "Recurring monthly donations supporting QC Family Tree";
const homeUrl = process.env.PAYPAL_PRODUCT_HOME_URL || "https://www.qcfamilytree.org/donate";

function required(name, value) {
  if (!value) {
    throw new Error(`Missing ${name}. Set it in your shell before running this script.`);
  }
  return value;
}

function base64Url(value) {
  return Buffer.from(value).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function createAuthAssertion() {
  const merchantIdentity = merchantPayerId
    ? { payer_id: merchantPayerId }
    : merchantEmail
      ? { email: merchantEmail }
      : null;

  if (!merchantIdentity) return undefined;

  return `${base64Url(JSON.stringify({ alg: "none" }))}.${base64Url(JSON.stringify({ iss: clientId, ...merchantIdentity }))}.`;
}

async function getAccessToken() {
  const response = await fetch(`${apiUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) {
    throw new Error(`PayPal OAuth failed (${response.status}). Check the app credentials and API URL.`);
  }
  return data.access_token;
}

async function main() {
  required("PAYPAL_CLIENT_ID", clientId);
  required("PAYPAL_CLIENT_SECRET", clientSecret);

  const authAssertion = createAuthAssertion();
  if (!authAssertion) {
    console.warn("Warning: PAYPAL_MERCHANT_PAYER_ID or PAYPAL_MERCHANT_EMAIL is not set; continuing without PayPal-Auth-Assertion.");
  }

  const accessToken = await getAccessToken();
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "PayPal-Request-Id": `qcft-product-${Date.now()}`,
  };
  if (authAssertion) headers["PayPal-Auth-Assertion"] = authAssertion;

  const response = await fetch(`${apiUrl}/v1/catalogs/products`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: productName,
      description: productDescription,
      type: "SERVICE",
      category: "CHARITY",
      home_url: homeUrl,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const issue = data.details?.map((detail) => detail.description || detail.issue).filter(Boolean).join("; ");
    throw new Error(`PayPal product creation failed (${response.status})${issue ? `: ${issue}` : "."}${data.debug_id ? ` Debug ID: ${data.debug_id}` : ""}`);
  }

  console.log(`Created PayPal product: ${data.id}`);
  console.log(`PAYPAL_MONTHLY_PRODUCT_ID=${data.id}`);
  console.log(`Environment: ${apiUrl.includes("sandbox") ? "sandbox" : "production"}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "PayPal product creation failed.");
  process.exitCode = 1;
});
