import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import ts from "typescript";
import { describe, expect, it, vi } from "vitest";
import * as ui from "../src/lib/donation-checkout-ui";
import { setupDonationAmountMemory } from "../src/lib/donation-amount-memory";

const page = readFileSync(new URL("../src/pages/donate.astro", import.meta.url), "utf8");
const source = page.match(/<script>([\s\S]+?)<\/script>/)![1]
  .replace(/^[ \t]*import\s+[\s\S]+?from\s+"[^"]+";/gm, "");
const script = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
const bindings = {
  buildPayPalSdkUrl: ui.buildPayPalSdkUrl,
  setCardProcessingState: ui.setCardProcessingState,
  setPayPalClientToken: ui.setPayPalClientToken,
  showPaymentPending: ui.showPaymentPending,
  setupDonationAmountMemory,
  copySubscriptionIdState: ui.copySubscriptionId,
  showConfirmationState: ui.showConfirmation,
  showFallbackState: ui.showFallback,
  showPaymentErrorState: ui.showPaymentError,
};

async function checkout(options: { hash?: string; capture?: Response | Error | Promise<Response> | Array<Response | Error | Promise<Response>>; lookup?: Response | Error | Promise<Response>; blockedStorage?: boolean } = {}) {
  const markup = '<div data-paypal-client-id="test" data-giving-mode="one-time"></div>' +
    [...page.matchAll(/<(button|div|section|p) id="([^"]+)"([^>]*)>/g)]
      .map(([, tag, id, attrs]) => `<${tag} id="${id}" ${attrs.includes('class="hidden ') ? 'class="hidden"' : ''}></${tag}>`).join("") +
    '<input name="amount" type="radio" value="25" checked><input name="amount_other"><input id="remember-gift" type="checkbox">';
  const dom = new JSDOM(markup, { url: `https://example.test/donate${options.hash ?? ""}` });
  const { window } = dom;
  if (options.blockedStorage) Object.defineProperty(window, "localStorage", { get() { throw new Error("blocked"); } });
  let wallet: any;
  let card: any;
  let renders = 0;
  const field = () => ({ render() {} });
  Object.assign(window, { paypal: {
    Buttons(callbacks: unknown) { wallet = callbacks; renders++; return field(); },
    CardFields(callbacks: unknown) {
      card = callbacks;
      return { isEligible: () => true, NameField: field, NumberField: field, ExpiryField: field, CVVField: field,
        submit: () => card.onApprove({ orderID: "ORDER123" }) };
    },
  } });
  const fetchMock = vi.fn(async (url: string) => {
    if (url.endsWith("/client-token")) return Response.json({ clientToken: "token" });
    const result = url.includes("?orderID=") ? options.lookup : Array.isArray(options.capture) ? options.capture.shift() : options.capture;
    if (result instanceof Error) throw result;
    return result ?? Response.json({ status: "UNKNOWN" });
  });
  const logger = { error() {} };
  new Function("window", "document", "fetch", "console", ...Object.keys(bindings), script)(
    window, window.document, fetchMock, logger, ...Object.values(bindings),
  );
  await new Promise(resolve => setImmediate(resolve));
  const loadSdk = () => window.document.head.querySelector("script")?.onload?.(new window.Event("load"));
  loadSdk();
  const get = (id: string) => window.document.getElementById(id) as HTMLButtonElement;
  const visible = (id: string) => !get(id).classList.contains("hidden");
  return { dom, window, get, visible, fetchMock, loadSdk, renders: () => renders, wallet: () => wallet, card: () => card };
}

const flush = () => new Promise(resolve => setImmediate(resolve));

describe("donation capture recovery", () => {
  it("shows the appropriate outcome for completed, pending, and declined captures", async () => {
    for (const status of ["COMPLETED", "PENDING", "DECLINED"]) {
      const view = await checkout({ capture: Response.json({ purchase_units: [{ payments: { captures: [{ status }] } }] }) });
      await view.wallet().onApprove({ orderID: "ORDER123" });
      expect(view.visible("donation-confirmation")).toBe(status === "COMPLETED");
      expect(view.visible("donation-payment-pending")).toBe(status === "PENDING");
      expect(view.visible("donation-payment-error")).toBe(status === "DECLINED");
      expect(view.visible("donation-checkout")).toBe(status === "DECLINED");
      expect(view.window.location.hash).toBe(status === "PENDING" ? "#payment-order=ORDER123" : "");
      view.dom.window.close();
    }
  });

  it("initializes checkout when localStorage access is blocked", async () => {
    const view = await checkout({ blockedStorage: true });
    expect(view.renders()).toBe(1);
    expect(view.wallet()).toBeDefined();
    view.dom.window.close();
  });

  it("keeps an uncertain capture blocked across refresh and confirms the original order", async () => {
    const first = await checkout({ capture: new Error("response lost") });
    await first.wallet().onApprove({ orderID: "ORDER123" });
    expect(first.visible("donation-payment-pending")).toBe(true);
    expect(first.visible("donation-checkout")).toBe(false);
    expect(first.window.location.hash).toBe("#payment-order=ORDER123");
    const reloaded = await checkout({ hash: first.window.location.hash, lookup: Response.json({ status: "COMPLETED" }), blockedStorage: true });
    expect(reloaded.renders()).toBe(0);
    expect(reloaded.visible("donation-checkout")).toBe(false);
    reloaded.get("check-payment-status").click();
    await flush();
    expect(reloaded.fetchMock).toHaveBeenCalledWith("/api/paypal/capture-order?orderID=ORDER123");
    expect(reloaded.visible("donation-confirmation")).toBe(true);
    expect(reloaded.visible("donation-checkout")).toBe(false);
    expect(reloaded.window.location.hash).toBe("");
    first.dom.window.close();
    reloaded.dom.window.close();
  });

  it("keeps checkout blocked for pending, unknown and unavailable status", async () => {
    for (const lookup of [Response.json({ status: "PENDING" }), Response.json({ status: "UNKNOWN" }), new Error("offline")]) {
      const view = await checkout({ hash: "#payment-order=ORDER123", lookup });
      view.get("check-payment-status").click();
      await flush();
      expect(view.visible("donation-payment-pending")).toBe(true);
      expect(view.visible("donation-checkout")).toBe(false);
      expect(view.window.location.hash).toBe("#payment-order=ORDER123");
      view.dom.window.close();
    }
  });

  it("treats server errors and invalid capture responses as uncertain", async () => {
    for (const capture of [Response.json({ error: "unavailable" }, { status: 500 }), new Response("not json")]) {
      const view = await checkout({ capture });
      await view.wallet().onApprove({ orderID: "ORDER123" });
      expect(view.visible("donation-payment-pending")).toBe(true);
      expect(view.visible("donation-payment-error")).toBe(false);
      expect(view.visible("donation-checkout")).toBe(false);
      expect(view.window.location.hash).toBe("#payment-order=ORDER123");
      view.dom.window.close();
    }
  });

  it("initializes checkout after a confirmed failure found on refresh", async () => {
    const view = await checkout({ hash: "#payment-order=ORDER123", lookup: Response.json({ status: "FAILED" }) });
    view.get("check-payment-status").click();
    await flush();
    view.loadSdk();
    expect(view.renders()).toBe(1);
    expect(view.visible("donation-checkout")).toBe(true);
    expect(view.visible("donation-payment-error")).toBe(true);
    view.dom.window.close();
  });

  it("recaptures the original approved order after refresh", async () => {
    const view = await checkout({
      hash: "#payment-order=ORDER123",
      lookup: Response.json({ status: "APPROVED" }),
      capture: Response.json({ purchase_units: [{ payments: { captures: [{ status: "COMPLETED" }] } }] }),
    });
    view.get("check-payment-status").click();
    await flush();
    expect(view.fetchMock).toHaveBeenCalledWith("/api/paypal/capture-order", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ orderID: "ORDER123", attempt: 0 }),
    }));
    expect(view.visible("donation-confirmation")).toBe(true);
    expect(view.window.location.hash).toBe("");
    view.dom.window.close();
  });

  it("restarts wallet checkout after an explicit funding decline and captures the new approval", async () => {
    const decline = Response.json({ details: { name: "UNPROCESSABLE_ENTITY", details: [{ issue: "INSTRUMENT_DECLINED" }] } }, { status: 422 });
    const completed = Response.json({ purchase_units: [{ payments: { captures: [{ status: "COMPLETED" }] } }] });
    const view = await checkout({ capture: [decline, completed] });
    const restart = vi.fn().mockResolvedValue(undefined);
    await view.wallet().onApprove({ orderID: "ORDER123" }, { restart });
    expect(restart).toHaveBeenCalledOnce();
    expect(view.visible("donation-payment-error")).toBe(true);
    expect(view.window.location.hash).toBe("");
    await view.wallet().onApprove({ orderID: "ORDER123" }, { restart });
    expect(view.fetchMock).toHaveBeenLastCalledWith("/api/paypal/capture-order", expect.objectContaining({
      body: JSON.stringify({ orderID: "ORDER123", attempt: 1 }),
    }));
    expect(view.visible("donation-confirmation")).toBe(true);
    view.dom.window.close();
  });

  it("retains a restarted capture attempt across a lost response and refresh", async () => {
    const decline = Response.json({ details: { name: "UNPROCESSABLE_ENTITY", details: [{ issue: "INSTRUMENT_DECLINED" }] } }, { status: 422 });
    const view = await checkout({ capture: [decline, new Error("response lost")] });
    const restart = vi.fn().mockResolvedValue(undefined);
    await view.wallet().onApprove({ orderID: "ORDER123" }, { restart });
    await view.wallet().onApprove({ orderID: "ORDER123" }, { restart });
    expect(view.window.location.hash).toBe("#payment-order=ORDER123&attempt=1");
    expect(view.visible("donation-payment-pending")).toBe(true);
    const reloaded = await checkout({ hash: view.window.location.hash, lookup: Response.json({ status: "APPROVED" }), capture: new Error("still offline") });
    reloaded.get("check-payment-status").click();
    await flush();
    expect(reloaded.fetchMock).toHaveBeenCalledWith("/api/paypal/capture-order", expect.objectContaining({
      body: JSON.stringify({ orderID: "ORDER123", attempt: 1 }),
    }));
    expect(reloaded.window.location.hash).toBe("#payment-order=ORDER123&attempt=1");
    view.dom.window.close();
    reloaded.dom.window.close();
  });

  it("treats a 500 response as uncertain even if its body mentions a decline", async () => {
    const capture = Response.json({ details: { name: "UNPROCESSABLE_ENTITY", details: [{ issue: "INSTRUMENT_DECLINED" }] } }, { status: 500 });
    const view = await checkout({ capture });
    const restart = vi.fn();
    await view.wallet().onApprove({ orderID: "ORDER123" }, { restart });
    expect(restart).not.toHaveBeenCalled();
    expect(view.visible("donation-payment-pending")).toBe(true);
    expect(view.window.location.hash).toBe("#payment-order=ORDER123");
    view.dom.window.close();
  });

  it("keeps checkout usable if PayPal cannot restart the declined wallet payment", async () => {
    const capture = Response.json({ details: { name: "UNPROCESSABLE_ENTITY", details: [{ issue: "INSTRUMENT_DECLINED" }] } }, { status: 422 });
    const view = await checkout({ capture });
    const restart = vi.fn().mockRejectedValue(new Error("restart failed"));
    await view.wallet().onApprove({ orderID: "ORDER123" }, { restart });
    expect(view.visible("donation-payment-error")).toBe(true);
    expect(view.visible("donation-checkout")).toBe(true);
    expect(view.window.location.hash).toBe("");
    view.dom.window.close();
  });

  it("keeps status checks disabled when a restarted capture begins before the first callback returns", async () => {
    let finishCapture!: (response: Response) => void;
    const secondCapture = new Promise<Response>((resolve) => { finishCapture = resolve; });
    const decline = Response.json({ details: { name: "UNPROCESSABLE_ENTITY", details: [{ issue: "INSTRUMENT_DECLINED" }] } }, { status: 422 });
    const view = await checkout({ capture: [decline, secondCapture] });
    let restartedApproval: Promise<void>;
    const actions = { restart: vi.fn(() => {
      restartedApproval = view.wallet().onApprove({ orderID: "ORDER123" }, actions);
      return Promise.resolve();
    }) };
    await view.wallet().onApprove({ orderID: "ORDER123" }, actions);
    expect(view.get("check-payment-status").disabled).toBe(true);
    finishCapture(Response.json({ purchase_units: [{ payments: { captures: [{ status: "COMPLETED" }] } }] }));
    await restartedApproval!;
    expect(view.visible("donation-confirmation")).toBe(true);
    expect(view.get("check-payment-status").disabled).toBe(false);
    view.dom.window.close();
  });

  it("restores card checkout after an explicit funding decline without restarting the wallet", async () => {
    const capture = Response.json({ details: { name: "UNPROCESSABLE_ENTITY", details: [{ issue: "INSTRUMENT_DECLINED" }] } }, { status: 422 });
    const view = await checkout({ capture });
    view.get("card-method-button").click();
    view.get("card-field-submit-button").click();
    await flush();
    expect(view.get("card-field-submit-button").disabled).toBe(false);
    expect(view.visible("donation-payment-error")).toBe(true);
    expect(view.visible("donation-checkout")).toBe(true);
    expect(view.window.location.hash).toBe("");
    view.dom.window.close();
  });

  it("allows a new checkout when an explicit decline is found during recovery after refresh", async () => {
    const capture = Response.json({ details: { name: "UNPROCESSABLE_ENTITY", details: [{ issue: "INSTRUMENT_DECLINED" }] } }, { status: 422 });
    const view = await checkout({ hash: "#payment-order=ORDER123&attempt=1", lookup: Response.json({ status: "APPROVED" }), capture });
    view.get("check-payment-status").click();
    await flush();
    view.loadSdk();
    expect(view.visible("donation-payment-error")).toBe(true);
    expect(view.visible("donation-checkout")).toBe(true);
    expect(view.window.location.hash).toBe("");
    expect(view.renders()).toBe(1);
    view.dom.window.close();
  });

  it("restores usable checkout when a recovery capture is declined", async () => {
    const view = await checkout({
      hash: "#payment-order=ORDER123",
      lookup: Response.json({ status: "APPROVED" }),
      capture: Response.json({ purchase_units: [{ payments: { captures: [{ status: "DECLINED" }] } }] }),
    });
    view.get("check-payment-status").click();
    await flush();
    view.loadSdk();
    expect(view.visible("donation-payment-error")).toBe(true);
    expect(view.visible("donation-checkout")).toBe(true);
    expect(view.renders()).toBe(1);
    view.get("card-method-button").click();
    expect(view.get("card-field-submit-button").disabled).toBe(false);
    view.dom.window.close();
  });

  it("prevents a status check while a capture is in flight", async () => {
    let finishCapture!: (response: Response) => void;
    const capture = new Promise<Response>((resolve) => { finishCapture = resolve; });
    const view = await checkout({ capture });
    const approval = view.wallet().onApprove({ orderID: "ORDER123" });
    expect(view.get("check-payment-status").disabled).toBe(true);
    view.get("check-payment-status").click();
    expect(view.fetchMock).not.toHaveBeenCalledWith(expect.stringContaining("?orderID="));
    finishCapture(Response.json({ purchase_units: [{ payments: { captures: [{ status: "COMPLETED" }] } }] }));
    await approval;
    expect(view.visible("donation-confirmation")).toBe(true);
    expect(view.get("check-payment-status").disabled).toBe(false);
    view.dom.window.close();
  });

  it("ignores a delayed status response after capture has completed", async () => {
    let finishCapture!: (response: Response) => void;
    let finishLookup!: (response: Response) => void;
    const capture = new Promise<Response>((resolve) => { finishCapture = resolve; });
    const lookup = new Promise<Response>((resolve) => { finishLookup = resolve; });
    const view = await checkout({ capture, lookup });
    const approval = view.wallet().onApprove({ orderID: "ORDER123" });
    view.get("check-payment-status").dispatchEvent(new view.window.Event("click"));
    finishCapture(Response.json({ purchase_units: [{ payments: { captures: [{ status: "COMPLETED" }] } }] }));
    await approval;
    finishLookup(Response.json({ status: "PENDING" }));
    await flush();
    expect(view.visible("donation-confirmation")).toBe(true);
    expect(view.visible("donation-payment-pending")).toBe(false);
    view.dom.window.close();
  });

  it("keeps the original order recoverable if the retry response is lost", async () => {
    const view = await checkout({ hash: "#payment-order=ORDER123", lookup: Response.json({ status: "APPROVED" }), capture: new Error("offline") });
    view.get("check-payment-status").click();
    await flush();
    expect(view.visible("donation-payment-pending")).toBe(true);
    expect(view.visible("donation-checkout")).toBe(false);
    expect(view.window.location.hash).toBe("#payment-order=ORDER123");
    view.dom.window.close();
  });

  it("enables a new attempt after a confirmed failure without rendering checkout twice", async () => {
    const view = await checkout({ capture: new Error("lost"), lookup: Response.json({ status: "DECLINED" }) });
    view.get("card-method-button").click();
    view.get("card-field-submit-button").click();
    await flush();
    view.get("check-payment-status").click();
    await flush();
    expect(view.visible("donation-payment-error")).toBe(true);
    expect(view.visible("donation-checkout")).toBe(true);
    expect(view.get("card-field-submit-button").disabled).toBe(false);
    expect(view.renders()).toBe(1);
    expect(view.window.location.hash).toBe("");
    view.dom.window.close();
  });
});
