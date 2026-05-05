// src/lib/calendar.ts
// src/lib/calendar.ts
import { google } from "googleapis";
import type { calendar_v3 } from "googleapis";

const CALENDAR_ID = import.meta.env.GOOGLE_CALENDAR_ID;

// Parse service account credentials from environment
const credentials = JSON.parse(
  Buffer.from(
    import.meta.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64,
    "base64",
  ).toString(),
);

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location: string;
  description: string;
  category: "Workshop" | "Meeting" | "Community" | "Social";
}

interface GetEventsOptions {
  maxDays?: number; // Limit events to next X days
  maxResults?: number; // Max number of events to return
}

export async function getUpcomingEvents(
  options: GetEventsOptions = {},
): Promise<CalendarEvent[]> {
  const { maxDays, maxResults = 50 } = options;

  try {
    // Create auth client with service account
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
    });

    const calendarClient = google.calendar({ version: "v3", auth });

    // Calculate timeMax if maxDays is provided
    const timeMin = new Date();
    const timeMax = maxDays
      ? new Date(timeMin.getTime() + maxDays * 24 * 60 * 60 * 1000)
      : undefined;

    const response = await calendarClient.events.list({
      calendarId: CALENDAR_ID,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax?.toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];

    return events.map((event: calendar_v3.Schema$Event) => {
      const category = extractCategory(event);

      return {
        id: event.id || "",
        title: event.summary || "Untitled Event",
        start: new Date(event.start?.dateTime || event.start?.date || ""),
        end: new Date(event.end?.dateTime || event.end?.date || ""),
        location: event.location || "TBD",
        description: event.description || "",
        category,
      };
    });
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return [];
  }
}

function extractCategory(
  event: calendar_v3.Schema$Event,
): "Workshop" | "Meeting" | "Community" | "Social" {
  const title = (event.summary || "").toLowerCase();
  const description = (event.description || "").toLowerCase();

  if (title.includes("workshop") || description.includes("workshop")) {
    return "Workshop";
  }
  if (title.includes("meeting") || description.includes("meeting")) {
    return "Meeting";
  }
  if (
    title.includes("social") ||
    title.includes("networking") ||
    title.includes("night")
  ) {
    return "Social";
  }
  return "Community";
}
