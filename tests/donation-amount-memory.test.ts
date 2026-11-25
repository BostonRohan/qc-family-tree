import { JSDOM } from "jsdom";
import { afterEach, describe, expect, it } from "vitest";
import {
  donationAmountStorageKey,
  setupDonationAmountMemory,
} from "../src/lib/donation-amount-memory";

const markup = `
  <label><input type="radio" name="amount" value="25" checked></label>
  <label><input type="radio" name="amount" value="50"></label>
  <input name="amount_other" type="number">
  <div id="remember-gift-container" class="hidden"></div>
  <input id="remember-gift" type="checkbox">
`;

describe("donation amount memory integration", () => {
  let dom: JSDOM;

  afterEach(() => dom.window.close());

  function setup(savedAmount?: string) {
    dom = new JSDOM(markup, { url: "http://localhost/donate" });
    if (savedAmount) {
      dom.window.localStorage.setItem(donationAmountStorageKey, savedAmount);
    }
    setupDonationAmountMemory(dom.window.document, dom.window.localStorage);
  }

  it("starts with the $25 preset and keeps the custom reminder hidden", () => {
    setup();

    expect(dom.window.document.querySelector<HTMLInputElement>('input[value="25"]')?.checked).toBe(true);
    expect(dom.window.document.getElementById("remember-gift-container")?.classList.contains("hidden")).toBe(true);
  });

  it("keeps amount selection usable when storage access throws", () => {
    dom = new JSDOM(markup, { url: "http://localhost/donate" });
    const storage = {
      getItem() { throw new DOMException("Blocked", "SecurityError"); },
      setItem() { throw new DOMException("Blocked", "SecurityError"); },
      removeItem() { throw new DOMException("Blocked", "SecurityError"); },
    } as unknown as Storage;
    setupDonationAmountMemory(dom.window.document, storage);
    const custom = dom.window.document.querySelector<HTMLInputElement>('input[name="amount_other"]')!;
    custom.value = "35";
    custom.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    expect(dom.window.document.getElementById("remember-gift-container")?.classList.contains("hidden")).toBe(true);
    const preset = dom.window.document.querySelector<HTMLInputElement>('input[value="50"]')!;
    preset.click();
    expect(custom.value).toBe("");
  });

  it("hides the remember option when writing to storage fails", () => {
    dom = new JSDOM(markup, { url: "http://localhost/donate" });
    const storage = {
      getItem() { return null; },
      setItem() { throw new DOMException("Blocked", "SecurityError"); },
      removeItem() { throw new DOMException("Blocked", "SecurityError"); },
    } as unknown as Storage;
    setupDonationAmountMemory(dom.window.document, storage);
    const custom = dom.window.document.querySelector<HTMLInputElement>('input[name="amount_other"]')!;
    const remember = dom.window.document.querySelector<HTMLInputElement>("#remember-gift")!;
    const container = dom.window.document.getElementById("remember-gift-container")!;
    custom.value = "35";
    custom.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    remember.checked = true;
    remember.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
    expect(container.classList.contains("hidden")).toBe(true);
    expect(remember.checked).toBe(false);
  });

  it("restores a saved preset amount", () => {
    setup("50");

    expect(dom.window.document.querySelector<HTMLInputElement>('input[value="50"]')?.checked).toBe(true);
    expect(dom.window.document.querySelector<HTMLInputElement>('input[name="amount_other"]')?.value).toBe("");
  });

  it("switches from a custom amount back to the originally selected preset", () => {
    setup();
    const custom = dom.window.document.querySelector<HTMLInputElement>('input[name="amount_other"]')!;
    const preset = dom.window.document.querySelector<HTMLInputElement>('input[value="25"]')!;
    custom.value = "100";
    custom.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    expect(preset.checked).toBe(false);
    preset.click();
    expect(preset.checked).toBe(true);
    expect(custom.value).toBe("");
  });

  it("leaves presets unselected when restoring a saved custom amount", () => {
    setup("35");
    expect(dom.window.document.querySelector<HTMLInputElement>('input[name="amount"]:checked')).toBeNull();
    const preset = dom.window.document.querySelector<HTMLInputElement>('input[value="25"]')!;
    preset.click();
    expect(dom.window.document.querySelector<HTMLInputElement>('input[name="amount_other"]')?.value).toBe("");
  });

  it("shows the reminder only after entering a custom amount and remembers it when opted in", () => {
    setup();
    const custom = dom.window.document.querySelector<HTMLInputElement>('input[name="amount_other"]')!;
    const reminder = dom.window.document.querySelector<HTMLInputElement>("#remember-gift")!;
    const container = dom.window.document.getElementById("remember-gift-container")!;

    custom.value = "35";
    custom.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    expect(container.classList.contains("flex")).toBe(true);

    reminder.checked = true;
    reminder.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
    expect(dom.window.localStorage.getItem(donationAmountStorageKey)).toBe("35");
  });

  it("clears a custom remembered amount when the donor opts out", () => {
    setup("35");
    const reminder = dom.window.document.querySelector<HTMLInputElement>("#remember-gift")!;

    reminder.checked = false;
    reminder.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
    expect(dom.window.localStorage.getItem(donationAmountStorageKey)).toBeNull();
  });

  it("updates a remembered custom amount when the donor edits it", () => {
    setup("35");
    const custom = dom.window.document.querySelector<HTMLInputElement>('input[name="amount_other"]')!;
    const reminder = dom.window.document.querySelector<HTMLInputElement>("#remember-gift")!;
    custom.value = "75";
    custom.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    expect(reminder.checked).toBe(true);
    expect(dom.window.localStorage.getItem(donationAmountStorageKey)).toBe("75");
    const saved = dom.window.localStorage.getItem(donationAmountStorageKey)!;
    dom.window.close();
    setup(saved);
    expect(dom.window.document.querySelector<HTMLInputElement>('input[name="amount_other"]')?.value).toBe("75");
  });

  it("updates the amount after opting in during the same visit", () => {
    setup();
    const custom = dom.window.document.querySelector<HTMLInputElement>('input[name="amount_other"]')!;
    const reminder = dom.window.document.querySelector<HTMLInputElement>("#remember-gift")!;
    custom.value = "35";
    custom.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    reminder.checked = true;
    reminder.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
    custom.value = "75";
    custom.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    expect(dom.window.localStorage.getItem(donationAmountStorageKey)).toBe("75");
  });

  it("does not retain a stale remembered amount when the new input is invalid or cleared", () => {
    setup("35");
    const custom = dom.window.document.querySelector<HTMLInputElement>('input[name="amount_other"]')!;
    const reminder = dom.window.document.querySelector<HTMLInputElement>("#remember-gift")!;
    custom.value = "0";
    custom.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    expect(dom.window.localStorage.getItem(donationAmountStorageKey)).toBeNull();
    expect(reminder.checked).toBe(true);
    custom.value = "75";
    custom.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    expect(dom.window.localStorage.getItem(donationAmountStorageKey)).toBe("75");
    custom.value = "";
    custom.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    expect(dom.window.localStorage.getItem(donationAmountStorageKey)).toBeNull();
    expect(reminder.checked).toBe(false);
  });

  it("clears custom entry and hides the reminder after selecting a preset", () => {
    setup("35");
    const preset = dom.window.document.querySelector<HTMLInputElement>('input[value="50"]')!;
    const custom = dom.window.document.querySelector<HTMLInputElement>('input[name="amount_other"]')!;
    const container = dom.window.document.getElementById("remember-gift-container")!;

    preset.checked = true;
    preset.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
    expect(custom.value).toBe("");
    expect(container.classList.contains("hidden")).toBe(true);
    expect(dom.window.localStorage.getItem(donationAmountStorageKey)).toBe("50");
  });
});
