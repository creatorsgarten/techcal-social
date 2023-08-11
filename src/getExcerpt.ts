import { toText } from "hast-util-to-text";
import { fromHtml } from "hast-util-from-html";

// https://stackoverflow.com/a/3809435/559913
const urlRegex =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;

export function getExcerpt(text: string) {
  text = toText(fromHtml(text, { fragment: true }), {
    whitespace: "pre",
  }).replace(urlRegex, "");

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    // Check if the line has at least 10 meaningful characters, such as characters.
    // Use unicode class \p{L} to match any kind of letter from any language.
    let letters = line.replace(/\p{Emoji}/gu, "").replace(/[^\p{L}]/gu, "");
    if (letters.length >= 10) {
      return line;
    }
  }
}
