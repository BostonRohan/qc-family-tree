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

## Eventbrite-triggered rebuilds

The homepage is statically prerendered during production builds. Configure a Vercel Deploy Hook for the production branch and add these Vercel environment variables:

- `VERCEL_DEPLOY_HOOK_URL`
- `EVENTBRITE_WEBHOOK_SECRET`
- `CRON_SECRET`

In Eventbrite, configure one webhook for event create, update, publish, and unpublish notifications. Set its URL to `/api/eventbrite/<EVENTBRITE_WEBHOOK_SECRET>` on the production site. The endpoint accepts only JSON `POST` requests and triggers a new deployment after the deploy hook accepts the request.

Vercel Cron calls `/api/cron/rebuild` daily. Vercel supplies the configured `CRON_SECRET` as a bearer token; the endpoint triggers the same deploy hook and rejects requests without the correct token.
