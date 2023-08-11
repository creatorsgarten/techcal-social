import { getEvent } from "./calendar";

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
  const text = lines.join("\n");
  return {
    eventId,
    text,
    screenshotUrl,
  };
}
