import { parseArgs } from "util";
import axios from "axios";
import { GoogleCalendar, GoogleCalendarItem } from "./types";
import { mkdirSync, writeFileSync } from "fs";

const { values } = parseArgs({
  options: {
    "list-events": { type: "boolean" },
    "render-event": { type: "string" },
    "capture-url": { type: "string" },
  },
});

const apiKey = "AIzaSyAD6j9p5yfSNIyCZYDXDTorJils96CJvOQ";

if (values["list-events"]) {
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
  console.log(events);
} else if (values["render-event"]) {
  const eventId = values["render-event"];
  const { data: event } = await axios.get<GoogleCalendarItem>(
    `https://www.googleapis.com/calendar/v3/calendars/tech.cal.th%40gmail.com/events/${eventId}`,
    { params: { key: apiKey } }
  );
  const yearAndMonth = (
    "dateTime" in event.start ? event.start.dateTime : event.start.date
  ).slice(0, 7);
  const screenshotUrl = `https://th.techcal.dev/?${new URLSearchParams({
    month: yearAndMonth,
    capture: eventId,
  })}`;
  console.log(screenshotUrl);
} else if (values["capture-url"]) {
  const targetUrl = values["capture-url"];
  const options = { targetUrl };
  const code = `(${async (page, { targetUrl }) => {
    await page.setViewport({ width: 1200, height: 1200, deviceScaleFactor: 2 });

    await page.goto(targetUrl);
    await page.waitForSelector(".eventItem");
    await page.waitForSelector("#capture-title");
    await page.waitForSelector("#capture-stage");

    // Capture the portion of #capture-stage
    const element = await page.$("#capture-stage");
    return await element.screenshot({ type: "png" });
  }})(page, ${JSON.stringify(options)})`;
  const { data } = await axios.post(
    "http://localhost:20279/run",
    { code },
    { timeout: 60000, responseType: "arraybuffer" }
  );
  mkdirSync(".data", { recursive: true });
  writeFileSync(".data/capture.png", data);
}
