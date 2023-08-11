import axios from "axios";
import { mkdirSync, writeFileSync } from "fs";
import type { Page } from "puppeteer-core";

export async function prepareImage(targetUrl: string, outPath: string) {
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
  writeFileSync(outPath, data);
}
