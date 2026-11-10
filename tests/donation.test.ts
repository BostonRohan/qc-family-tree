import { describe, expect, it } from "vitest";
import {
  defaultDonationAmount,
  getStoredDonationAmount,
  isPresetDonationAmount,
  isValidDonationAmount,
  shouldRememberCustomDonation,
} from "../src/lib/donation";

describe("donation amount behavior", () => {
  it("starts at $25 when there is no usable saved amount", () => {
    expect(getStoredDonationAmount(null)).toBe(defaultDonationAmount);
    expect(getStoredDonationAmount("not-an-amount")).toBe(25);
    expect(getStoredDonationAmount("0")).toBe(25);
  });

  it("accepts preset and custom amounts within the safe range", () => {
    expect(isValidDonationAmount("25")).toBe(true);
    expect(isValidDonationAmount("12.50")).toBe(true);
    expect(isValidDonationAmount("35.5")).toBe(true);
    expect(isValidDonationAmount("10000")).toBe(true);
    expect(isValidDonationAmount("10000.01")).toBe(false);
    expect(isValidDonationAmount("1.005")).toBe(false);
  });

  it("identifies preset amounts", () => {
    expect(isPresetDonationAmount("25")).toBe(true);
    expect(isPresetDonationAmount("35")).toBe(false);
  });

  it("only remembers a custom amount when the donor opts in", () => {
    expect(shouldRememberCustomDonation(false, "35")).toBe(false);
    expect(shouldRememberCustomDonation(true, "35")).toBe(true);
    expect(shouldRememberCustomDonation(true, "25")).toBe(false);
  });
});
