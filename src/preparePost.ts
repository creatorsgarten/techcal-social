import { getEvent } from "./calendar";
import { getExcerpt } from "./getExcerpt";

export async function preparePost(eventId: string) {
  const event = await getEvent(eventId);
  console.log("Raw description:\n" + JSON.stringify(event.description));
  const yearAndMonth = (
    "dateTime" in event.start ? event.start.dateTime : event.start.date
  ).slice(0, 7);
  const screenshotUrl = `https://th.techcal.dev/?${new URLSearchParams({
    month: yearAndMonth,
    capture: eventId,
  })}`;
  const lines = [`🗓️ ${event.summary}`];
  const excerpt = getExcerpt(event.description || "");
  if (excerpt) {
    lines.push("", `${excerpt}`);
  }
  lines.push("", `🔗 More info - https://th.techcal.dev/event/${eventId}`);
  const text = lines.join("\n");
  return {
    eventId,
    text,
    screenshotUrl,
  };
}
