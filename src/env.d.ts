/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />

interface ImportMetaEnv {
  readonly PUBLIC_POSTHOG_KEY?: string;
  readonly PUBLIC_POSTHOG_HOST?: string;
  readonly PAYPAL_CLIENT_ID?: string;
  readonly PAYPAL_CLIENT_SECRET?: string;
  readonly PAYPAL_API_URL?: string;
  readonly PAYPAL_MONTHLY_PRODUCT_ID?: string;
  readonly PUBLIC_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
