# techcal-social

Post newly-announced events to facebook - under construction!

## How it works

- At most five times per day, GitHub Actions will run a scheduled job.
- It will find the next event to post. The event:
  - Must be in the future.
  - Must have not been posted before.
  - Must not contain the words `tentative` or `TBC`.
  - Must have not been edited for at least 16 hours.
- It captures the screenshot of the calendar website using Puppeteer, with the event’s info at the top via [capture mode](https://github.com/creatorsgarten/techcal.dev/pull/122).
- It then posts it to Facebook and updates the state file.

## Set up
