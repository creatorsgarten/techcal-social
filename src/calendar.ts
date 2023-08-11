import axios from "axios";
import { GoogleCalendar, GoogleCalendarItem } from "./types";

const apiKey = "AIzaSyAD6j9p5yfSNIyCZYDXDTorJils96CJvOQ";
export async function getEvents() {
  const { data: events } = await axios.get<GoogleCalendar>(
    "https://www.googleapis.com/calendar/v3/calendars/tech.cal.th%40gmail.com/events",
    {
      params: {
        maxResults: "200",
        orderBy: "updated",
        timeMin: new Date().toISOString(),
        key: apiKey,
      },
    }
  );
  return events;
}
export async function getEvent(eventId: string) {
  const { data: event } = await axios.get<GoogleCalendarItem>(
    `https://www.googleapis.com/calendar/v3/calendars/tech.cal.th%40gmail.com/events/${eventId}`,
    { params: { key: apiKey } }
  );
  return event;
}
