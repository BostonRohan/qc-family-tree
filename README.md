# QC Family Tree

QC Family Tree (QCFT) is a neighborhood based community organization, rooted in the Enderly Park neighborhood of West Charlotte, NC, working at the intersection of faith, culture, and social change. QCFT intentionally and actively cultivates/tends/nurtures people and places so that they might create thriving communities of abundance, justice, imagination, and mutual care for all.  Through practices of cultural organizing, we strengthen social infrastructure, expand on interdependence, mutual aid, and solidarity where it already exists.

## PostHog analytics

The site includes optional PostHog analytics for production traffic. Add these public environment variables in Vercel:

- `PUBLIC_POSTHOG_KEY`: the PostHog project API key
- `PUBLIC_POSTHOG_HOST`: the project host, normally `https://us.i.posthog.com` or `https://eu.i.posthog.com`

When configured, PostHog captures pageviews, clicks, scrolls, and session replays. The site also sends two named events:

- `site_element_clicked`: link or button text, destination, element type, and whether it is external
- `site_form_submitted`: form ID/name and action only; form values are never sent

Session recordings mask form inputs. If the site needs consent-based tracking for its audience or jurisdiction, add a consent banner and call PostHog's opt-in/opt-out methods before enabling capture.

## Sentry error monitoring

The Astro Sentry integration captures browser errors, SSR request errors, and PayPal server-route exceptions when configured. Add `PUBLIC_SENTRY_DSN` to the deployment environment. Keep any Sentry source-map auth token in the deployment environment only; never commit it.

## PayPal monthly giving

Monthly gifts use PayPal subscriptions. Configure `PAYPAL_MONTHLY_PRODUCT_ID` in Vercel with the PayPal product ID used for monthly donation plans. The site creates an active monthly plan for the selected amount, including custom amounts from $1 to $10,000, and donors manage cancellation through PayPal.

To create the product for a new PayPal environment, export the credentials in your shell and run:

```sh
PAYPAL_API_URL=https://api-m.sandbox.paypal.com pnpm paypal:create-product
```

The script uses `https://api-m.sandbox.paypal.com` by default. For production, use `PAYPAL_API_URL=https://api-m.paypal.com`. It requires `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`; set `PAYPAL_MERCHANT_PAYER_ID` (preferred) or `PAYPAL_MERCHANT_EMAIL` when PayPal requires the merchant auth assertion. Optional overrides are `PAYPAL_PRODUCT_NAME`, `PAYPAL_PRODUCT_DESCRIPTION`, and `PAYPAL_PRODUCT_HOME_URL`. The script prints the resulting `PAYPAL_MONTHLY_PRODUCT_ID` without printing credentials.

## Eventbrite-triggered rebuilds

The homepage is statically prerendered during production builds. Configure a Vercel Deploy Hook for the production branch and add these Vercel environment variables:

- `VERCEL_DEPLOY_HOOK_URL`
- `EVENTBRITE_WEBHOOK_SECRET`
- `CRON_SECRET`

In Eventbrite, configure one webhook for event create, update, publish, and unpublish notifications. Set its URL to `/api/eventbrite/<EVENTBRITE_WEBHOOK_SECRET>` on the production site. The endpoint accepts only JSON `POST` requests and triggers a new deployment after the deploy hook accepts the request.

Vercel Cron calls `/api/cron/rebuild` daily. Vercel supplies the configured `CRON_SECRET` as a bearer token; the endpoint triggers the same deploy hook and rejects requests without the correct token.
