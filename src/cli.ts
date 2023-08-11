import { parseArgs } from "util";
import axios from "axios";

const { values } = parseArgs({
  options: {
    "list-events": { type: "boolean" },
  },
});

const apiKey = "AIzaSyAD6j9p5yfSNIyCZYDXDTorJils96CJvOQ";

if (values["list-events"]) {
  const events = await axios.get(
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
  console.log(events.data);
}
