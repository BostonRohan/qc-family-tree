import { beforeEach, describe, expect, it, vi } from "vitest";

const paypalFetch = vi.fn();
const checkBotId = vi.fn();

vi.mock("botid/server", () => ({ checkBotId }));

async function loadRoute(route: string) {
  vi.resetModules();
  vi.stubEnv("PAYPAL_CLIENT_ID", "sandbox-client-id");
  vi.stubEnv("PAYPAL_CLIENT_SECRET", "sandbox-client-secret");
  vi.stubEnv("PAYPAL_API_URL", "https://api-m.sandbox.paypal.com");
  vi.stubEnv("PAYPAL_MONTHLY_PRODUCT_ID", "PROD-MONTHLY-GIVING");
  vi.stubGlobal("fetch", paypalFetch);
  return import(route);
}

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/paypal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function responseJson(response: Response) {
  return response.json();
}

describe("PayPal API routes", () => {
  beforeEach(() => {
    paypalFetch.mockReset();
    checkBotId.mockReset();
    checkBotId.mockResolvedValue({ isBot: false });
  });

  it("rejects invalid donation amounts before contacting PayPal", async () => {
    const { POST } = await loadRoute("../src/pages/api/paypal/create-order");

    const response = await POST({ request: jsonRequest({ amount: 0 }) });

    expect(response.status).toBe(400);
    expect(await responseJson(response)).toEqual({ error: "Enter an amount between $1 and $10,000." });
    expect(paypalFetch).not.toHaveBeenCalled();
  });

  it("rejects donation amounts that cannot be charged in whole cents", async () => {
    const { POST } = await loadRoute("../src/pages/api/paypal/create-order");

    const response = await POST({ request: jsonRequest({ amount: "1.005" }) });

    expect(response.status).toBe(400);
    expect(await responseJson(response)).toEqual({ error: "Enter an amount between $1 and $10,000." });
    expect(paypalFetch).not.toHaveBeenCalled();
  });

  it("rejects fractional-cent monthly amounts before creating a PayPal plan", async () => {
    const { POST } = await loadRoute("../src/pages/api/paypal/create-subscription-plan");

    const response = await POST({ request: jsonRequest({ amount: "1.005" }) });

    expect(response.status).toBe(400);
    expect(await responseJson(response)).toEqual({ error: "Enter a monthly amount between $1 and $10,000." });
    expect(paypalFetch).not.toHaveBeenCalled();
  });

  it("blocks bots before they can create a monthly PayPal plan", async () => {
    const { POST } = await loadRoute("../src/pages/api/paypal/create-subscription-plan");
    checkBotId.mockResolvedValueOnce({ isBot: true });

    const response = await POST({ request: jsonRequest({ amount: "25" }) });

    expect(response.status).toBe(403);
    expect(await responseJson(response)).toEqual({ error: "Access denied" });
    expect(paypalFetch).not.toHaveBeenCalled();
  });

  it("creates a sandbox order with a normalized USD amount", async () => {
    const { POST } = await loadRoute("../src/pages/api/paypal/create-order");
    paypalFetch
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "access-token" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "ORDER-123" }), { status: 201 }));

    const response = await POST({ request: jsonRequest({ amount: "35.5" }) });

    expect(response.status).toBe(201);
    expect(await responseJson(response)).toEqual({ id: "ORDER-123" });
    expect(paypalFetch).toHaveBeenNthCalledWith(2, "https://api-m.sandbox.paypal.com/v2/checkout/orders", expect.objectContaining({
      method: "POST",
      body: expect.stringContaining('"value":"35.50"'),
    }));
  });

  it("returns PayPal's order error without leaking credentials", async () => {
    const { POST } = await loadRoute("../src/pages/api/paypal/create-order");
    paypalFetch
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "access-token" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ name: "INVALID_REQUEST" }), { status: 422 }));

    const response = await POST({ request: jsonRequest({ amount: 35 }) });

    expect(response.status).toBe(422);
    const errorBody = await responseJson(response);
    expect(errorBody).toEqual({
      error: "PayPal could not create the order.",
      details: { name: "INVALID_REQUEST" },
    });
    expect(JSON.stringify(errorBody)).not.toContain("sandbox-secret");
  });

  it("creates an active monthly plan for a custom amount", async () => {
    const { POST } = await loadRoute("../src/pages/api/paypal/create-subscription-plan");
    paypalFetch
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "access-token" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "P-MONTHLY-35" }), { status: 201 }));

    const response = await POST({ request: jsonRequest({ amount: "35.5" }) });

    expect(response.status).toBe(201);
    expect(await responseJson(response)).toEqual({ planId: "P-MONTHLY-35" });
    expect(paypalFetch).toHaveBeenNthCalledWith(2, "https://api-m.sandbox.paypal.com/v1/billing/plans", expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({ "PayPal-Request-Id": "qcft-monthly-35-50" }),
      body: expect.stringContaining('"interval_unit":"MONTH"'),
    }));
  });

  it("rejects a capture request without an order ID", async () => {
    const { POST } = await loadRoute("../src/pages/api/paypal/capture-order");

    const response = await POST({ request: jsonRequest({}) });

    expect(response.status).toBe(400);
    expect(await responseJson(response)).toEqual({ error: "Missing PayPal order ID." });
    expect(paypalFetch).not.toHaveBeenCalled();
  });

  it("reuses the capture attempt key for retries and changes it for a new funding approval", async () => {
    const { POST } = await loadRoute("../src/pages/api/paypal/capture-order");
    for (const attempt of [0, 1, 1]) {
      paypalFetch.mockResolvedValueOnce(Response.json({ access_token: "access-token" })).mockResolvedValueOnce(Response.json({ status: "COMPLETED" }));
      expect((await POST({ request: jsonRequest({ orderID: "ORDER123", attempt }) })).status).toBe(200);
    }
    const captureCalls = paypalFetch.mock.calls.filter(([url]) => String(url).endsWith("/capture"));
    expect(captureCalls.map(([, options]) => options.headers["PayPal-Request-Id"])).toEqual([
      "capture-ORDER123", "capture-ORDER123-1", "capture-ORDER123-1",
    ]);
  });

  it("rejects an invalid capture attempt without contacting PayPal", async () => {
    const { POST } = await loadRoute("../src/pages/api/paypal/capture-order");
    const response = await POST({ request: jsonRequest({ orderID: "ORDER123", attempt: -1 }) });
    expect(response.status).toBe(400);
    expect(paypalFetch).not.toHaveBeenCalled();
  });

  it("checks the original order without exposing PayPal customer details", async () => {
    const { GET } = await loadRoute("../src/pages/api/paypal/capture-order");
    paypalFetch
      .mockResolvedValueOnce(Response.json({ access_token: "access-token" }))
      .mockResolvedValueOnce(Response.json({ payer: { email_address: "private@example.test" }, purchase_units: [{ payments: { captures: [{ status: "COMPLETED" }] } }] }));
    const response = await GET({ request: new Request("http://localhost/api/paypal/capture-order?orderID=ORDER123") });
    expect(await response.json()).toEqual({ status: "COMPLETED" });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("distinguishes an approved order with no capture from an unknown capture status", async () => {
    const { GET } = await loadRoute("../src/pages/api/paypal/capture-order");
    for (const [order, expected] of [
      [{ status: "APPROVED", purchase_units: [{}] }, "APPROVED"],
      [{ status: "APPROVED", purchase_units: [{ payments: { captures: [{ status: "REFUNDED" }] } }] }, "UNKNOWN"],
      [{ status: "COMPLETED", purchase_units: [{}] }, "UNKNOWN"],
    ] as const) {
      paypalFetch.mockResolvedValueOnce(Response.json({ access_token: "access-token" })).mockResolvedValueOnce(Response.json(order));
      const response = await GET({ request: new Request("http://localhost/api/paypal/capture-order?orderID=ORDER123") });
      expect(await response.json()).toEqual({ status: expected });
    }
  });

  it("returns an unknown outcome when order lookup fails", async () => {
    const { GET } = await loadRoute("../src/pages/api/paypal/capture-order");
    paypalFetch.mockResolvedValueOnce(Response.json({ access_token: "access-token" })).mockRejectedValueOnce(new Error("offline"));
    const response = await GET({ request: new Request("http://localhost/api/paypal/capture-order?orderID=ORDER123") });
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: "UNKNOWN" });
  });

  it("captures an approved order", async () => {
    const { POST } = await loadRoute("../src/pages/api/paypal/capture-order");
    const order = {
      status: "COMPLETED",
      purchase_units: [{ payments: { captures: [{ status: "PENDING" }] } }],
    };
    paypalFetch
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "access-token" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(order), { status: 200 }));

    const response = await POST({ request: jsonRequest({ orderID: "ORDER-123" }) });

    expect(response.status).toBe(200);
    expect(await responseJson(response)).toEqual(order);
    expect(paypalFetch).toHaveBeenNthCalledWith(2, "https://api-m.sandbox.paypal.com/v2/checkout/orders/ORDER-123/capture", expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({ Prefer: "return=representation", "PayPal-Request-Id": "capture-ORDER-123" }),
    }));
  });

  it("returns PayPal's capture error for a declined order", async () => {
    const { POST } = await loadRoute("../src/pages/api/paypal/capture-order");
    paypalFetch
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "access-token" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ name: "ORDER_NOT_APPROVED" }), { status: 422 }));

    const response = await POST({ request: jsonRequest({ orderID: "ORDER-123" }) });

    expect(response.status).toBe(422);
    expect(await responseJson(response)).toEqual({
      error: "PayPal could not capture the order.",
      details: { name: "ORDER_NOT_APPROVED" },
    });
  });

  it("exchanges a PayPal access token for a browser-safe client token", async () => {
    const { GET } = await loadRoute("../src/pages/api/paypal/client-token");
    paypalFetch
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "access-token" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ client_token: "browser-token" }), { status: 200 }));

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await responseJson(response)).toEqual({ clientToken: "browser-token" });
    expect(paypalFetch).toHaveBeenNthCalledWith(2, "https://api-m.sandbox.paypal.com/v1/identity/generate-token", expect.objectContaining({ method: "POST" }));
  });

  it("returns a safe error when PayPal is unavailable", async () => {
    const { GET } = await loadRoute("../src/pages/api/paypal/client-token");
    paypalFetch.mockRejectedValueOnce(new Error("network down"));

    const response = await GET();

    expect(response.status).toBe(500);
    expect(await responseJson(response)).toEqual({ error: "PayPal sandbox is not configured yet." });
  });
});
