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

  it("restores a saved preset amount", () => {
    setup("50");

    expect(dom.window.document.querySelector<HTMLInputElement>('input[value="50"]')?.checked).toBe(true);
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
