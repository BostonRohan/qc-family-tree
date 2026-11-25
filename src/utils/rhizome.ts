import { sanityClient } from "sanity:client";

const defaultSignupUrl = "https://docs.google.com/forms/d/e/1FAIpQLSea5129FAq4Z_JIOhByXJFjGYem2_Y3kNDzDTx17BlMVK6TfA/viewform";

export async function getRhizomeMembership() {
  const membership = await sanityClient
    .fetch<{ signupUrl?: string; season?: number; annualFee?: number } | null>(
      '*[_type == "rhizomeMembership" && _id == "rhizomeMembership"][0]{signupUrl, season, annualFee}',
    )
    .catch(() => null);
  return {
    signupUrl: membership?.signupUrl || defaultSignupUrl,
    season: membership?.season ?? 2027,
    annualFee: membership?.annualFee ?? 45,
  };
}

export async function getRhizomeSignupUrl(): Promise<string> {
  const { signupUrl } = await getRhizomeMembership();
  return signupUrl;
}
