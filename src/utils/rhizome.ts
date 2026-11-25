import { sanityClient } from "sanity:client";

export async function getRhizomeMembership() {
  return sanityClient
    .fetch<{ signupUrl: string | null; season: number | null; annualFee: number | null } | null>(
      '*[_type == "rhizomeMembership" && _id == "rhizomeMembership"][0]{signupUrl, season, annualFee}',
    )
    .catch(() => null);
}
