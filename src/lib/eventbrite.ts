const EVENTBRITE_API_TOKEN = import.meta.env.EVENTBRITE_API_TOKEN;
const EVENTBRITE_ORGANIZATION_ID = import.meta.env.EVENTBRITE_ORGANIZATION_ID;
const EVENTBRITE_API_BASE = "https://www.eventbriteapi.com/v3";

export interface EventbriteEvent {
  id: string;
  title: string;
  startUtc: string;
  endUtc: string;
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

  if (!EVENTBRITE_API_TOKEN) {
    console.warn("Eventbrite token not configured");
    return [];
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

    const maxDate = maxDays
      ? new Date(now.getTime() + maxDays * 24 * 60 * 60 * 1000)
      : null;

    const events = allEvents
      .filter((event) => {
        const eventStart = new Date(event.start.utc || event.start.local);
        if (!eventStart) return false;
        if (eventStart < now) return false;
        if (!maxDate) return true;
        return eventStart <= maxDate;
      })
      .slice(0, maxResults || 50)
      .map(mapEventbriteEvent);

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
  return {
    id: event.id,
    title: event.name.text,
    startUtc: event.start.utc,
    endUtc: event.end.utc,
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
