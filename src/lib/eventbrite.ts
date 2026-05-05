const EVENTBRITE_API_TOKEN = import.meta.env.EVENTBRITE_API_TOKEN;
const EVENTBRITE_ORGANIZATION_ID = import.meta.env.EVENTBRITE_ORGANIZATION_ID;
const EVENTBRITE_API_BASE = "https://www.eventbriteapi.com/v3";
const EVENTBRITE_CACHE_TTL_MS = 15 * 60 * 1000;

const eventbriteCache = new Map<
  string,
  {
    expiresAt: number;
    events: EventbriteEvent[];
  }
>();

export interface EventbriteEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location: string;
  description: string;
  category: "Workshop" | "Meeting" | "Community" | "Social";
  url: string;
  imageUrl?: string;
}

interface EventbriteApiResponse {
  events: EventbriteApiEvent[];
  pagination?: {
    has_more_items?: boolean;
    page_number?: number;
    page_count?: number;
  };
}

interface EventbriteApiEvent {
  id: string;
  name: { text: string; html: string };
  start: { utc: string; local: string };
  end: { utc: string; local: string };
  description: { text: string; html: string };
  url: string;
  logo?: {
    original?: {
      url?: string;
    };
    url?: string;
  } | null;
  venue_id: string | null;
  venue?: {
    name: string;
    address: {
      localized_address_display: string;
    };
  };
}

interface EventbriteOrganizationResponse {
  organizations: Array<{
    id: string;
    name?: string;
  }>;
}

interface GetEventsOptions {
  maxDays?: number;
  maxResults?: number;
}

export async function getUpcomingEvents(
  options: GetEventsOptions = {},
): Promise<EventbriteEvent[]> {
  const { maxDays, maxResults = 50 } = options;
  const cacheKey = JSON.stringify({ maxDays: maxDays ?? null, maxResults });

  if (!EVENTBRITE_API_TOKEN) {
    console.warn("Eventbrite token not configured");
    return [];
  }

  const cached = eventbriteCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    console.log("Eventbrite cache hit", {
      cacheKey,
      eventCount: cached.events.length,
      expiresAt: new Date(cached.expiresAt).toISOString(),
    });
    return cached.events;
  }

  try {
    const organizationId =
      EVENTBRITE_ORGANIZATION_ID || (await getDefaultOrganizationId());

    console.log("Eventbrite config", {
      hasToken: Boolean(EVENTBRITE_API_TOKEN),
      hasExplicitOrganizationId: Boolean(EVENTBRITE_ORGANIZATION_ID),
      resolvedOrganizationId: organizationId,
      maxDays,
      maxResults,
    });

    if (!organizationId) {
      console.warn("Eventbrite organization ID not configured or discoverable");
      return [];
    }

    const now = new Date();

    let timeMax: string | undefined;
    if (maxDays) {
      const maxDate = new Date(now.getTime() + maxDays * 24 * 60 * 60 * 1000);
      timeMax = maxDate.toISOString();
    }

    const params = new URLSearchParams({
      expand: "venue",
      status: "live,started",
      order_by: "start_asc",
      time_filter: "current_future",
    });

    if (maxResults) {
      params.append("page_size", maxResults.toString());
    }

    let page = 1;
    const allEvents: EventbriteApiEvent[] = [];

    while (allEvents.length < (maxResults || 50)) {
      const url = `${EVENTBRITE_API_BASE}/organizations/${organizationId}/events/?${params}&page=${page}`;
      console.log("Eventbrite request", { url, page });
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${EVENTBRITE_API_TOKEN}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Eventbrite API error:", error);
        throw new Error(`Eventbrite API error: ${response.status}`);
      }

      const data: EventbriteApiResponse = await response.json();
      allEvents.push(...data.events);

      if (
        !data.pagination?.has_more_items ||
        allEvents.length >= (maxResults || 50)
      ) {
        break;
      }

      page += 1;
      if (data.pagination.page_count && page > data.pagination.page_count) {
        break;
      }
    }

    const events = allEvents
      .filter((event) => {
        if (!maxDays) return true;
        const eventStart = new Date(event.start.utc);
        const maxDate = new Date(Date.now() + maxDays * 24 * 60 * 60 * 1000);
        return eventStart <= maxDate;
      })
      .slice(0, maxResults || 50)
      .map(mapEventbriteEvent);

    eventbriteCache.set(cacheKey, {
      expiresAt: Date.now() + EVENTBRITE_CACHE_TTL_MS,
      events,
    });

    console.log("Eventbrite cache set", {
      cacheKey,
      eventCount: events.length,
      ttlMs: EVENTBRITE_CACHE_TTL_MS,
    });

    return events;
  } catch (error) {
    console.error("Error fetching Eventbrite events:", error);
    return [];
  }
}

async function getDefaultOrganizationId(): Promise<string | null> {
  const url = `${EVENTBRITE_API_BASE}/users/me/organizations/`;
  console.log("Eventbrite organization lookup", { url });
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${EVENTBRITE_API_TOKEN}`,
    },
  });

  console.log("Eventbrite organization lookup response", {
    status: response.status,
    ok: response.ok,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    console.error("Eventbrite organization lookup error:", error);
    return null;
  }

  const data: EventbriteOrganizationResponse = await response.json();
  console.log("Eventbrite organization lookup payload", {
    organizationCount: data.organizations.length,
    organizationIds: data.organizations.map((organization) => organization.id),
  });
  return data.organizations[0]?.id ?? null;
}

function mapEventbriteEvent(event: EventbriteApiEvent): EventbriteEvent {
  const start = new Date(event.start.local);
  const end = new Date(event.end.local);

  return {
    id: event.id,
    title: event.name.text,
    start,
    end,
    location: event.venue?.address.localized_address_display || "TBD",
    description: event.description.text || "",
    category: extractCategory(event.name.text, event.description.text),
    url: event.url,
    imageUrl: event.logo?.original?.url || event.logo?.url,
  };
}

function extractCategory(
  title: string,
  description: string,
): "Workshop" | "Meeting" | "Community" | "Social" {
  const text = (title + " " + description).toLowerCase();

  if (text.includes("workshop")) {
    return "Workshop";
  }
  if (text.includes("meeting")) {
    return "Meeting";
  }
  if (
    text.includes("social") ||
    text.includes("networking") ||
    text.includes("night")
  ) {
    return "Social";
  }
  return "Community";
}
