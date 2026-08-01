const VERCEL_DEPLOY_HOOK_URL = import.meta.env.VERCEL_DEPLOY_HOOK_URL;

/**
 * Ask Vercel to create a production deployment for the configured branch.
 * The deploy hook URL is intentionally kept server-side and is never exposed
 * to the webhook caller.
 */
export async function triggerRebuild(): Promise<void> {
  if (!VERCEL_DEPLOY_HOOK_URL) {
    throw new Error("VERCEL_DEPLOY_HOOK_URL is not configured");
  }

  const response = await fetch(VERCEL_DEPLOY_HOOK_URL, { method: "POST" });

  if (!response.ok) {
    throw new Error(`Vercel deploy hook returned ${response.status}`);
  }
}
