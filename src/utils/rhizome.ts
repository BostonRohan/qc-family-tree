import { sanityClient } from "sanity:client";

const defaultSignupUrl = "https://docs.google.com/forms/d/e/1FAIpQLSea5129FAq4Z_JIOhByXJFjGYem2_Y3kNDzDTx17BlMVK6TfA/viewform";

export async function getRhizomeSignupUrl(): Promise<string> {
  const membership = await sanityClient
    .fetch<{ signupUrl?: string } | null>(
      '*[_type == "rhizomeMembership" && _id == "rhizomeMembership"][0]{signupUrl}',
    )
    .catch(() => null);
  return membership?.signupUrl || defaultSignupUrl;
}
