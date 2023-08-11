import { parseArgs } from "util";
import axios from "axios";
import { mkdirSync, writeFileSync } from "fs";
import type { Page } from "puppeteer-core";
import { getEvents, getEvent } from "./calendar";

const { values } = parseArgs({
  options: {
    "list-events": { type: "boolean" },
    "render-event": { type: "string" },
    "capture-url": { type: "string" },
  },
});

if (values["list-events"]) {
  const events = await getEvents();
  console.log(events);
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
