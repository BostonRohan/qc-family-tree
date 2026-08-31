import * as Sentry from "@sentry/astro";

Sentry.init({
  dsn: import.meta.env.PUBLIC_SENTRY_DSN,
  enabled: Boolean(import.meta.env.PUBLIC_SENTRY_DSN),
  environment: import.meta.env.MODE,
  sendDefaultPii: false,
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 0,
});
