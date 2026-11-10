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

async function checkout(options: { hash?: string; capture?: Response | Error; lookup?: Response | Error; blockedStorage?: boolean } = {}) {
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
    const result = url.includes("?orderID=") ? options.lookup : options.capture;
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
      body: JSON.stringify({ orderID: "ORDER123" }),
    }));
    expect(view.visible("donation-confirmation")).toBe(true);
    expect(view.window.location.hash).toBe("");
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
