import type { APIRoute } from "astro";
import { getRhizomeMembership } from "@/utils/rhizome";

export const prerender = false;

export const GET: APIRoute = async () => {
  const membership = await getRhizomeMembership();
  if (!membership?.signupUrl) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/rhizome", "Cache-Control": "no-store" },
    });
  }

  return Response.redirect(membership.signupUrl, 302);
};
