export const presetDonationAmounts = [25, 50, 100, 250] as const;
export const defaultDonationAmount = 25;

export function isValidDonationAmount(value: unknown): boolean {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return false;

  const isWholeCent = Number(amount.toFixed(2)) === amount;

  return isWholeCent && amount >= 1 && amount <= 10000;
}

export function isPresetDonationAmount(value: unknown): boolean {
  return presetDonationAmounts.includes(Number(value) as (typeof presetDonationAmounts)[number]);
}

export function getStoredDonationAmount(value: string | null): number {
  return isValidDonationAmount(value) ? Number(value) : defaultDonationAmount;
}

export function shouldRememberCustomDonation(checked: boolean, value: unknown): boolean {
  return checked && isValidDonationAmount(value) && !isPresetDonationAmount(value);
}
