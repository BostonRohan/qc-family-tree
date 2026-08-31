import { JSDOM } from "jsdom";
import { describe, expect, it, vi } from "vitest";
import {
  buildPayPalSdkUrl,
  copySubscriptionId,
  setCardProcessingState,
  setPayPalClientToken,
  showConfirmation,
  showFallback,
  showPaymentError,
} from "../src/lib/donation-checkout-ui";

function setup() {
  const dom = new JSDOM(`
    <div id="supporting-info"></div>
    <section id="confirmation" class="hidden"><p id="confirmation-message"></p><p id="subscription-row" class="hidden"><strong id="subscription-id"></strong></p></section>
    <section id="payment-error" class="hidden"><p id="payment-error-message"></p></section>
    <div id="checkout"></div>
    <div id="monthly-checkout"></div>
    <div id="fallback" class="hidden"></div>
    <button id="card-submit">Pay by card</button>
    <button id="copy-button" aria-label="Copy subscription ID" title="Copy subscription ID"><span class="copy-icon"></span><span class="copied-icon hidden"></span></button>
  `);
  const element = <T extends HTMLElement>(id: string) => dom.window.document.getElementById(id) as T;
  const copyButton = element<HTMLButtonElement>("copy-button");
  const elements = {
    supportingInfo: element("supporting-info"),
    confirmation: element("confirmation"),
    confirmationMessage: element("confirmation-message"),
    subscriptionIdRow: element("subscription-row"),
    subscriptionId: element("subscription-id"),
    paymentError: element("payment-error"),
    paymentErrorMessage: element("payment-error-message"),
    donationCheckout: element("checkout"),
    monthlyCheckout: element("monthly-checkout"),
    paypalFallback: element("fallback"),
  };
  return {
    dom,
    elements,
    button: element<HTMLButtonElement>("card-submit"),
    copyButton,
    copyIcon: copyButton.querySelector(".copy-icon") as HTMLElement,
    copiedIcon: copyButton.querySelector(".copied-icon") as HTMLElement,
    subscriptionId: element("subscription-id"),
  };
}

describe("donation checkout UI", () => {
  it("shows the confirmation and subscription ID while hiding supporting content", () => {
    const { dom, elements } = setup();

    showConfirmation(elements, "Your monthly gift is active.", "I-SUBSCRIPTION-123");

    expect(elements.supportingInfo?.classList.contains("hidden")).toBe(true);
    expect(elements.confirmation?.classList.contains("hidden")).toBe(false);
    expect(elements.confirmationMessage?.textContent).toBe("Your monthly gift is active.");
    expect(elements.subscriptionId?.textContent).toBe("I-SUBSCRIPTION-123");
    expect(elements.subscriptionIdRow?.classList.contains("hidden")).toBe(false);
    dom.window.close();
  });

  it("shows the prominent payment error without showing the fallback", () => {
    const { dom, elements } = setup();

    showPaymentError(elements, "PayPal could not complete the payment.");

    expect(elements.supportingInfo?.classList.contains("hidden")).toBe(true);
    expect(elements.paymentError?.classList.contains("hidden")).toBe(false);
    expect(elements.paymentErrorMessage?.textContent).toBe("PayPal could not complete the payment.");
    expect(elements.paypalFallback?.classList.contains("hidden")).toBe(true);
    dom.window.close();
  });

  it("shows the fallback and hides the checkout", () => {
    const { dom, elements } = setup();

    showFallback(elements);

    expect(elements.donationCheckout?.classList.contains("hidden")).toBe(true);
    expect(elements.monthlyCheckout?.classList.contains("hidden")).toBe(true);
    expect(elements.paypalFallback?.classList.contains("hidden")).toBe(false);
    dom.window.close();
  });

  it("copies the subscription ID and swaps the icon state", async () => {
    const { dom, copyButton, copyIcon, copiedIcon, subscriptionId } = setup();
    subscriptionId.textContent = "I-SUBSCRIPTION-123";
    const clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };

    const copied = await copySubscriptionId(
      {
        button: copyButton,
        source: subscriptionId,
        copyIcon,
        copiedIcon,
      },
      clipboard,
    );

    expect(copied).toBe(true);
    expect(clipboard.writeText).toHaveBeenCalledWith("I-SUBSCRIPTION-123");
    expect(copyIcon.classList.contains("hidden")).toBe(true);
    expect(copiedIcon.classList.contains("hidden")).toBe(false);
    expect(copyButton.getAttribute("aria-label")).toBe("Subscription ID copied");
    expect(copyButton.getAttribute("title")).toBe("Subscription ID copied");
    dom.window.close();
  });

  it("marks the copy action as unavailable when the clipboard fails", async () => {
    const { dom, copyButton, copyIcon, copiedIcon, subscriptionId } = setup();
    subscriptionId.textContent = "I-SUBSCRIPTION-123";
    const clipboard = { writeText: vi.fn().mockRejectedValue(new Error("denied")) };

    const copied = await copySubscriptionId(
      {
        button: copyButton,
        source: subscriptionId,
        copyIcon,
        copiedIcon,
      },
      clipboard,
    );

    expect(copied).toBe(false);
    expect(copyIcon.classList.contains("hidden")).toBe(false);
    expect(copiedIcon.classList.contains("hidden")).toBe(true);
    expect(copyButton.getAttribute("aria-label")).toBe("Unable to copy subscription ID; select it manually");
    expect(copyButton.getAttribute("title")).toBe("Select the subscription ID manually");
    dom.window.close();
  });

  it("shows processing feedback while card payment is submitted and restores the button on failure", () => {
    const { dom, button } = setup();

    setCardProcessingState(button, true);
    expect(button.disabled).toBe(true);
    expect(button.textContent).toBe("Processing card payment…");
    expect(button.getAttribute("aria-busy")).toBe("true");

    setCardProcessingState(button, false);
    expect(button.disabled).toBe(false);
    expect(button.textContent).toBe("Pay by card");
    expect(button.getAttribute("aria-busy")).toBe("false");
    dom.window.close();
  });

  it("builds an environment-specific SDK URL and attaches the client token as a data attribute", () => {
    const { dom } = setup();
    const script = dom.window.document.createElement("script");
    const url = buildPayPalSdkUrl({
      host: "www.sandbox.paypal.com",
      clientId: "sandbox-client-id",
      intent: "capture",
      components: "buttons,card-fields",
    });

    setPayPalClientToken(script, "browser-token");

    expect(url).toContain("https://www.sandbox.paypal.com/sdk/js?");
    expect(url).toContain("client-id=sandbox-client-id");
    expect(url).toContain("intent=capture");
    expect(url).toContain("components=buttons%2Ccard-fields");
    expect(script.dataset.clientToken).toBe("browser-token");
    dom.window.close();
  });
});
