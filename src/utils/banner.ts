import type { ConfigContext } from "sanity";
import { defineQuery } from "groq";

// Keep editing the same record when Show Banner is turned off.
export const BANNER_QUERY = defineQuery(`
  *[_type == "banner"] | order((_id == "banner") desc, _createdAt asc, _id asc)[0]
`);

export async function getBannerDocumentId(
  client: ReturnType<ConfigContext["getClient"]>,
): Promise<string> {
  const banner = await client.fetch<{ _id: string } | null>(
    BANNER_QUERY,
    {},
    { perspective: "published" },
  );
  return banner?._id ?? "banner";
}
