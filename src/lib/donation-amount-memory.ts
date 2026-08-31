import {
  defaultDonationAmount,
  isPresetDonationAmount,
  isValidDonationAmount,
} from "./donation";

export const donationAmountStorageKey = "qcft-donation-amount";

export function setupDonationAmountMemory(
  document: Document,
  storage: Storage,
): void {
  const customAmount = document.querySelector<HTMLInputElement>(
    'input[name="amount_other"]',
  );
  const rememberGiftContainer = document.getElementById(
    "remember-gift-container",
  );
  const rememberGift = document.querySelector<HTMLInputElement>("#remember-gift");
  const presetAmounts = document.querySelectorAll<HTMLInputElement>(
    'input[name="amount"]',
  );

  if (!customAmount || !rememberGiftContainer || !rememberGift) return;

  const showCustomAmountOption = (show: boolean) => {
    rememberGiftContainer.classList.toggle("hidden", !show);
    rememberGiftContainer.classList.toggle("flex", show);
    if (!show) rememberGift.checked = false;
  };

  const savedAmount = storage.getItem(donationAmountStorageKey);
  if (savedAmount && isValidDonationAmount(savedAmount)) {
    const savedPreset = [...presetAmounts].find(
      (input) => input.value === savedAmount,
    );
    if (savedPreset) savedPreset.checked = true;
    else {
      customAmount.value = savedAmount;
      rememberGift.checked = true;
      showCustomAmountOption(true);
    }
  } else if (!savedAmount) {
    const defaultPreset = [...presetAmounts].find(
      (input) => Number(input.value) === defaultDonationAmount,
    );
    if (defaultPreset) defaultPreset.checked = true;
  }

  presetAmounts.forEach((input) =>
    input.addEventListener("change", () => {
      customAmount.value = "";
      showCustomAmountOption(false);
      storage.setItem(donationAmountStorageKey, input.value);
    }),
  );

  customAmount.addEventListener("input", () => {
    showCustomAmountOption(Boolean(customAmount.value));
  });

  rememberGift.addEventListener("change", () => {
    if (
      rememberGift.checked &&
      isValidDonationAmount(customAmount.value) &&
      !isPresetDonationAmount(customAmount.value)
    ) {
      storage.setItem(donationAmountStorageKey, customAmount.value);
    } else if (!rememberGift.checked) {
      storage.removeItem(donationAmountStorageKey);
    }
  });
}
