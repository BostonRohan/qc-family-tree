type CheckoutElements = {
  supportingInfo: HTMLElement | null;
  confirmation: HTMLElement | null;
  confirmationMessage: HTMLElement | null;
  subscriptionIdRow: HTMLElement | null;
  subscriptionId: HTMLElement | null;
  paymentError: HTMLElement | null;
  paymentErrorMessage: HTMLElement | null;
  donationCheckout: HTMLElement | null;
  monthlyCheckout: HTMLElement | null;
  paypalFallback: HTMLElement | null;
};

export function showConfirmation(
  elements: CheckoutElements,
  message: string,
  subscriptionID?: string,
): void {
  elements.supportingInfo?.classList.add("hidden");
  elements.confirmation?.classList.remove("hidden");
  if (elements.confirmationMessage) elements.confirmationMessage.textContent = message;
  if (subscriptionID && elements.subscriptionId && elements.subscriptionIdRow) {
    elements.subscriptionId.textContent = subscriptionID;
    elements.subscriptionIdRow.classList.remove("hidden");
  }
}

export function showPaymentError(elements: CheckoutElements, message: string): void {
  elements.supportingInfo?.classList.add("hidden");
  elements.paymentError?.classList.remove("hidden");
  if (elements.paymentErrorMessage) elements.paymentErrorMessage.textContent = message;
}

export function showFallback(elements: CheckoutElements): void {
  elements.donationCheckout?.classList.add("hidden");
  elements.monthlyCheckout?.classList.add("hidden");
  elements.paypalFallback?.classList.remove("hidden");
}

export function setCardProcessingState(button: HTMLButtonElement, processing: boolean): void {
  button.disabled = processing;
  button.setAttribute("aria-busy", String(processing));
  button.textContent = processing ? "Processing card payment…" : "Pay by card";
}

export function buildPayPalSdkUrl({
  host,
  clientId,
  intent,
  components,
}: {
  host: string;
  clientId: string;
  intent: "capture" | "subscription";
  components: string;
}): string {
  const params = new URLSearchParams({
    "client-id": clientId,
    currency: "USD",
    intent,
    components,
  });
  return `https://${host}/sdk/js?${params.toString()}`;
}

export function setPayPalClientToken(script: HTMLScriptElement, clientToken: string): void {
  script.dataset.clientToken = clientToken;
}

type CopySubscriptionIdElements = {
  button: HTMLButtonElement | null;
  source: HTMLElement | null;
  copyIcon: HTMLElement | null;
  copiedIcon: HTMLElement | null;
};

type ClipboardLike = Pick<Clipboard, "writeText">;

export async function copySubscriptionId(
  elements: CopySubscriptionIdElements,
  clipboard: ClipboardLike,
): Promise<boolean> {
  if (!elements.source?.textContent || !elements.button) return false;

  try {
    await clipboard.writeText(elements.source.textContent);
    elements.copyIcon?.classList.add("hidden");
    elements.copiedIcon?.classList.remove("hidden");
    elements.button.setAttribute("aria-label", "Subscription ID copied");
    elements.button.setAttribute("title", "Subscription ID copied");
    return true;
  } catch {
    elements.button.setAttribute(
      "aria-label",
      "Unable to copy subscription ID; select it manually",
    );
    elements.button.setAttribute("title", "Select the subscription ID manually");
    return false;
  }
}
