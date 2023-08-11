import { parseArgs } from "util";
import axios from "axios";
import { mkdirSync, writeFileSync } from "fs";
import type { Page } from "puppeteer-core";
import { getEvents, getEvent } from "./calendar";
import { createHash } from "crypto";
import { GoogleCalendarItem } from "./types";

const { values } = parseArgs({
  options: {
    "list-events": { type: "boolean" },
    "render-event": { type: "string" },
    "capture-url": { type: "string" },
  },
});

const hash = (id: string) => createHash("sha1").update(id).digest("hex");

function shouldSkip(item: GoogleCalendarItem) {
  const lowercase = item.summary.toLowerCase();

  // skip if event is tentative or not finalized
  if (lowercase.includes("tba")) return "tba";
  if (lowercase.includes("tbc")) return "tbc";
  if (lowercase.includes("tbd")) return "tbd";
  if (lowercase.includes("tentative")) return "tentative";
  if (lowercase.includes("[duplicate]")) return "duplicate";

  // skip if too recent (updated within 16 hours)
  if (Date.now() - Date.parse(item.updated) < 16 * 60 * 60 * 1000) {
    return "too_recently_updated";
  }

  return false;
}

if (values["list-events"]) {
  const calendar = await getEvents();
  const out: {
    id: string;
    summary: string;
    startDate: string;
    skip: boolean | string;
  }[] = [];
  for (const event of calendar.items) {
    const { id, summary } = event;
    const startDate = (
      "dateTime" in event.start ? event.start.dateTime : event.start.date
    ).slice(0, 10);
    const skip = shouldSkip(event);
    out.push({ id, summary, startDate, skip });
  }
  out.sort((a, b) => {
    return a.startDate.localeCompare(b.startDate);
  });
  console.table(out.map(({ id, ...x }) => x));

  for (const [index, row] of out.entries()) {
    console.log(`[${index}]\n    pnpm cli --render-event ${row.id}`);
  }
} else if (values["render-event"]) {
  const eventId = values["render-event"];
  const event = await getEvent(eventId);
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
  const code = `(${async (page: Page, { targetUrl }: typeof options) => {
    await page.setViewport({ width: 1200, height: 1200, deviceScaleFactor: 2 });

    await page.goto(targetUrl);
    await page.waitForSelector(".eventItem");
    await page.waitForSelector("#capture-title");
    await page.waitForSelector("#capture-stage");

    // Capture the portion of #capture-stage
    const element = await page.$("#capture-stage");
    return await element!.screenshot({ type: "png" });
  }})(page, ${JSON.stringify(options)})`;
  const { data } = await axios.post(
    "http://localhost:20279/run",
    { code },
    { timeout: 60000, responseType: "arraybuffer" }
  );
  mkdirSync(".data", { recursive: true });
  writeFileSync(".data/capture.png", data);
}
