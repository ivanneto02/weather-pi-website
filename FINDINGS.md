# INFRA

- CDK stack in `infra/lib/data-stack.ts` provisions two DynamoDB v2 tables (humidity/temperature/pressure and air quality) keyed by `pk` + `timestamp`, four Node.js lambdas for batch upload/query, and two REST APIs (`.../samples` GET + PUT) with CORS open for GET and IAM required for PUT.
- Lambda sources under `infra/lib/functions/**` are plain JS with hard-coded table names and `us-west-1` region; upload functions chunk BatchWrite in 25-item batches with simple exponential retry, download functions query up to 600 recent items for `pk = sensor#default`.
- IAM user created for the Raspberry Pi with execute-api invoke permissions; access key id/secret are emitted as CloudFormation outputs, which is convenient but risky for long-lived credentials.
- No TTL/retention or lifecycle rules on the tables yet; no alarms, logs retention, or monitoring hooks defined. CDK tests remain commented placeholders in `infra/test/infra.test.ts`.
- `data-programs/` holds Raspberry Pi side collectors: Python scripts for PMS5003 air quality and BME280 temp/humidity/pressure, posting batches via signed PUT to the API Gateway endpoints; systemd service files and helper scripts are included to keep the collectors running.

# BACKEND (does not exist yet)

- There is no standalone backend service/repo; data is ingested directly from the Pi to API Gateway → Lambda → DynamoDB, and the frontend reads from the same GET lambdas. No pub/sub, WebSocket, or streaming layer exists yet for instant feedback.

# FRONTEND (SvelteKit with Tailwind)

- SvelteKit app (Vite) with layout wrapper (`src/routes/+layout.svelte`) that loads global styles, Fluent UI web components, and shared Header/Main/Footer components; routes for `/`, `/about`, `/data-gathering`, and `/building-this-website` serve mostly static content.
- Home page (`src/routes/+page.svelte`) fetches temp/humidity/pressure and air quality data from hard-coded API Gateway URLs on mount, averages the latest 10 samples for vitals, and schedules 5-minute polling plus a clock ticker; error handling is minimal (console logs only) and values are stored in local state.
- Visualization components in `src/lib/components/*` use Layerchart/D3 to draw line charts (`ThreeLinesChart`, `TmpHumPreAndReadingChart`, air quality particle charts) and small stat cards; mean calculators live in `src/lib/processing/*`.
- Styling via Tailwind (v4) and global `src/app.css`; Fluent UI icons/components registered through `src/lib/components/fluent.ts`. Tests are minimal: Vitest browser specs assert `<h1>` renders for main/info pages; Playwright config exists but no authored scenarios beyond defaults.
