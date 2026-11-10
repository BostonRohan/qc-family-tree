import {
  defaultDonationAmount,
  isPresetDonationAmount,
  isValidDonationAmount,
} from "./donation";

export const donationAmountStorageKey = "qcft-donation-amount";

export function setupDonationAmountMemory(
  document: Document,
  storage: Storage | null,
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
    show = show && storage !== null;
    rememberGiftContainer.classList.toggle("hidden", !show);
    rememberGiftContainer.classList.toggle("flex", show);
    if (!show) rememberGift.checked = false;
  };

  let savedAmount: string | null = null;
  try {
    savedAmount = storage?.getItem(donationAmountStorageKey) ?? null;
  } catch {
    storage = null;
  }
  if (savedAmount && isValidDonationAmount(savedAmount)) {
    const savedPreset = [...presetAmounts].find(
      (input) => input.value === savedAmount,
    );
    if (savedPreset) savedPreset.checked = true;
    else {
      customAmount.value = savedAmount;
      presetAmounts.forEach((input) => { input.checked = false; });
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
      try { storage?.setItem(donationAmountStorageKey, input.value); } catch { storage = null; }
    }),
  );

  customAmount.addEventListener("input", () => {
    if (customAmount.value) presetAmounts.forEach((input) => { input.checked = false; });
    if (rememberGift.checked) {
      try {
        if (isValidDonationAmount(customAmount.value)) {
          storage?.setItem(donationAmountStorageKey, customAmount.value);
        } else {
          storage?.removeItem(donationAmountStorageKey);
        }
      } catch {
        storage = null;
      }
    }
    showCustomAmountOption(Boolean(customAmount.value));
  });

  rememberGift.addEventListener("change", () => {
    if (
      rememberGift.checked &&
      isValidDonationAmount(customAmount.value) &&
      !isPresetDonationAmount(customAmount.value)
    ) {
      try { storage?.setItem(donationAmountStorageKey, customAmount.value); } catch { storage = null; showCustomAmountOption(false); }
    } else if (!rememberGift.checked) {
      try { storage?.removeItem(donationAmountStorageKey); } catch { storage = null; }
    }
  });
}
