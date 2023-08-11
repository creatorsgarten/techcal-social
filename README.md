# techcal-social

This repository hosts an automation workflow that posts [upcoming tech events in Thailand](https://th.techcal.dev/) to [the Thai Tech Calendar Facebook Page](https://www.facebook.com/th.techcal.dev).

## How it works

- At most five times per day, GitHub Actions will run a scheduled job.
- It will find the next event to post. The event:
  - Must be in the future.
  - Must have not been posted before.
  - Must not contain the words `tentative` or `TBC`.
  - Must have not been edited for at least 16 hours.
- It captures the screenshot of the calendar website using Puppeteer, with the event’s info at the top via [capture mode](https://github.com/creatorsgarten/techcal.dev/pull/122).
- It then posts it to Facebook and updates the state file.

## How to contribute

**Pre-requisites:**

- [Node.js 18](https://nodejs.org/en/) and [pnpm](https://pnpm.io/) (you can also use our [Devbox](https://www.jetpack.io/devbox) configuration)
- [Docker](https://www.docker.com/)

**Setting up:**

1. Run the [pptraas](https://github.com/dtinth/pptraas) server in Docker. This server is used to capture screenshots of the calendar website.

   ```sh
   docker compose up -d
   ```

2. Install dependencies.

   ```sh
   pnpm install
   ```

3. Run the script to list the events.

   ```sh
   pnpm cli --list-events
   ```

   This will show you the list of events. It will also select the next event to post. The ID of the next event will be stored in `.data/next.id.txt`.

4. Run the script to prepare the post.

   ```sh
   pnpm cli --prepare-post
   ```

   This will prepare the image caption (and other metadata) that will be posted to Facebook. The caption will be printed to the console, while the rest of the metadata will be stored in `.data/post.json`.

   **If you want to tweak how the caption is generated**, you can edit `src/preparePost.ts` and run the script again.

5. Run the script to generate an image.

   ```sh
   pnpm cli --prepare-image
   ```

   This will generate an image. It looks at `.data/post.json` and reads the URL specified in `screenshotUrl`. Then the script will take a screenshot of that URL, save it to a file, and print the path to that file.

   **If you want to tweak how the image is generated**, you can edit `src/prepareImage.ts` and run the script again. Note that the appearance of the image is programmed in [techcal.dev](https://github.com/creatorsgarten/techcal.dev) website repository; this script only takes a screenshot of the website.
