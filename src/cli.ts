import { parseArgs } from "util";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { getEvents } from "./calendar";
import { GoogleCalendarItem } from "./types";
import { preparePost } from "./preparePost";
import { prepareImage } from "./prepareImage";
import { dirname } from "path";
import { hash } from "./hash";
import { Env } from "@(-.-)/env";
import { z } from "zod";
import axios from "axios";

const env = Env(
  z.object({
    FACEBOOK_PAGE_ACCESS_TOKEN: z.string(),
  })
);

const { values } = parseArgs({
  options: {
    // Actions
    "list-events": { type: "boolean" },
    "prepare-post": { type: "boolean" },
    "prepare-image": { type: "boolean" },
    post: { type: "boolean" },
    comment: { type: "boolean" },

    // Dev actions
    "capture-url": { type: "string" },

    // Options
    "event-id": { type: "string" },
  },
});

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

  // skip if there is already an attempt to post this event
  const stateFilePath = getStateFilePath(item.id);
  if (existsSync(stateFilePath)) return "already_attempted";

  return false;
}

function getStateFilePath(id: string) {
  const idHash = hash(id);
  const idHashFirstTwo = idHash.slice(0, 2);
  const idHashRest = idHash.slice(2);
  return `state/${idHashFirstTwo}/${idHashRest}.txt`;
}

function writeState(id: string, state: string) {
  const stateFilePath = getStateFilePath(id);
  mkdirSync(dirname(stateFilePath), { recursive: true });
  appendFileSync(stateFilePath, state + "\n");
}

async function updateState(
  id: string,
  title: string,
  f: () => Promise<string | void>
) {
  writeState(id, `${new Date().toISOString()} - started ${title}`);
  try {
    const result = await f();
    writeState(
      id,
      `${new Date().toISOString()} - ${result || `finished ${title}`}`
    );
  } catch (e: any) {
    writeState(id, `${new Date().toISOString()} - error:\n${e?.stack || e}`);
    throw e;
  }
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

  console.log();
  for (const [index, row] of out.entries()) {
    console.log(`[${index}]\n    pnpm cli --prepare-post --event-id ${row.id}`);
  }

  console.log();
  mkdirSync(".data", { recursive: true });
  for (const [index, row] of out.entries()) {
    if (row.skip) continue;
    console.log("Next event id:", row.id);
    writeFileSync(".data/next.id.txt", row.id);
    console.log("You can run the following command to prepare the post:");
    console.log(`    pnpm cli --prepare-post`);
    break;
  }
} else if (values["prepare-post"]) {
  const eventId =
    values["event-id"] || readFileSync(".data/next.id.txt", "utf8").trim();
  writeState(eventId, `event ${eventId}`);
  await updateState(eventId, "prepare-post", async () => {
    const post = await preparePost(eventId);
    console.log("-".repeat(80));
    console.log(post.text);
    console.log("-".repeat(80));

    mkdirSync(".data", { recursive: true });
    writeFileSync(".data/post.json", JSON.stringify(post, null, 2));
    console.log(
      "Post has been prepared. To prepare the post image run:\n    pnpm cli --prepare-image"
    );
  });
} else if (values["prepare-image"]) {
  const post = getUpcomingPost();
  const eventId = post.eventId;
  await updateState(eventId, "prepare-image", async () => {
    const outPath = getImageFilePath(eventId);
    await prepareImage(post.screenshotUrl, outPath);
    console.log("Image written to", outPath);
    console.log();
    console.log("Your post is now ready. To post it, run:");
    console.log(`    pnpm cli --post`);
  });
} else if (values["post"]) {
  const post = getUpcomingPost();
  await updateState(post.eventId, "post", async () => {
    const accessToken = env.FACEBOOK_PAGE_ACCESS_TOKEN;
    const image = readFileSync(getImageFilePath(post.eventId));
    const formData = new FormData();
    formData.append("access_token", accessToken);
    formData.append("caption", post.text);
    formData.append("published", "true");
    const blob = new Blob([image], { type: "image/png" });
    formData.append("source", blob, "image.png");
    const response = await axios.post(
      `https://graph.facebook.com/v17.0/me/photos`,
      formData
    );
    writeFileSync(
      getFacebookPostFilePath(post.eventId),
      JSON.stringify(response.data, null, 2)
    );
    const { id } = response.data;
    console.log("Posted to Facebook:", id);
    console.log("To comment on the post, run:");
    console.log(`    pnpm cli --comment`);
    return id;
  });
} else if (values["comment"]) {
  const post = getUpcomingPost();
  await updateState(post.eventId, "comment", async () => {
    const accessToken = env.FACEBOOK_PAGE_ACCESS_TOKEN;
    const comment = post.commentText;
    const postId = JSON.parse(
      readFileSync(getFacebookPostFilePath(post.eventId), "utf8")
    ).id;
    const response = await axios.post(
      `https://graph.facebook.com/v17.0/${postId}/comments`,
      {
        access_token: accessToken,
        message: comment,
      }
    );
    writeFileSync(
      getFacebookCommentFilePath(post.eventId),
      JSON.stringify(response.data, null, 2)
    );
    const { id } = response.data;
    console.log("Commented on Facebook:", id);
    return id;
  });
} else if (values["capture-url"]) {
  const targetUrl = values["capture-url"];
  await prepareImage(targetUrl, ".data/post.png");
  console.log("Written to .data/post.png");
}

function getUpcomingPost() {
  return JSON.parse(readFileSync(".data/post.json", "utf8")) as Awaited<
    ReturnType<typeof preparePost>
  >;
}

function getFacebookPostFilePath(id: string) {
  return `.data/${hash(id)}.facebook-post.json`;
}
function getFacebookCommentFilePath(id: string) {
  return `.data/${hash(id)}.facebook-comment.json`;
}
function getImageFilePath(id: string) {
  return `.data/${hash(id)}.png`;
}
