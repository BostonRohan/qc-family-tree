import type { APIRoute } from "astro";
import { getRhizomeSignupUrl } from "@/utils/rhizome";

export const prerender = false;

export const GET: APIRoute = async () =>
  Response.redirect(await getRhizomeSignupUrl(), 302);
