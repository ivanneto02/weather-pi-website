# Plan: Faster Sample Fetch + Immediate Feedback

- Goal: accelerate retrieval of the latest N sensor samples and let users know the system is working while data is being fetched.

## Faster fetch of latest samples
- Add a time-window latest endpoint (`GET /samples/latest?window=1h|10h|1d|10d|3m|12m&samples=20` etc) that maps to pre-rendered S3 objects (`latest_1_hour.json`, `latest_10_hours.json`, …) for instant reads; keep a small allowlist of windows to avoid unbounded fan-out.
- Switch DynamoDB sort key for timestamps to `NUMBER` (epoch ms) to guarantee correct ordering and enable range queries without string parsing; consider on-demand billing for predictable latency.
- Introduce a lightweight cache path: a scheduled Lambda writes windowed payloads to S3 (e.g., `latest_1_hour.json`, `latest_10_hours.json`, `latest_1_day.json`, `latest_10_days.json`, `latest_3_months.json`, `latest_12_months.json`) with ~500 raw samples each; front with CloudFront (TTL 30–60s). The API serves from S3 first and can fall back to DynamoDB when `?fresh=true` is set.
- For repeated reads and spiky traffic, enable API Gateway response caching or DynamoDB DAX in front of the table (small node, TTL aligned with data update frequency) to cut p99 latency.
- Keep Lambda warm for the hot path (`/samples/latest`) via provisioned concurrency or an EventBridge ping to reduce cold starts.

## Immediate user feedback while fetching
- Add a request-tracking flow: a `POST /samples/refresh` enqueues a fetch job (SQS), immediately returns `requestId` and an ETA; `GET /samples/refresh/{id}` (or SSE) reports status and provides data when ready.
- Provide push-based updates: use API Gateway WebSockets or SSE from Lambda so the backend can push “refresh started/complete” events tied to the `requestId`; the UI can show progress instead of silent waiting.
- Serve the cached S3/CloudFront payload instantly with a `Last-Updated` timestamp so the UI can show stale-but-fast data immediately, then replace it when the async job signals completion.
- Expose small health/latency metrics (CloudWatch dashboards + alarms on DynamoDB and Lambda p95) to catch regressions early and validate that the fetch-path changes are delivering the desired speedup.

## Time-based windows + granulation choices
- Lock the fixed set of windows to 1h, 10h, 1d, 10d, 3m, 12m, with S3 keys aligned to that set; avoid creating files dynamically per request.
- Precompute and store both raw (~500 samples) and down-sampled variants per window in S3 (e.g., `latest_1_hour_raw.json`, `latest_1_hour_20.json`, `latest_1_hour_100.json`) during the scheduled job to keep runtime latencies <5s and avoid per-request down-sampling.
- Down-sampling strategy: bucket by time (equal segments) and compute avg/min/max per segment to preserve extremes; store metadata (`window`, `granularity`, `generatedAt`) for UI freshness messaging.
- API behavior: if `samples` matches a prebuilt granularity, serve directly; if not, return the nearest-lower prebuilt granularity or fall back to raw plus server-side down-sampling with a short timeout (and return 202 + requestId if it will exceed ~3s, allowing a loading state).
- Retention: keep small windows (≤1h) warm in S3 with short TTL (30–60s). Larger windows can refresh less often (5–15 min) to reduce compute.

## Safe builds and consistency during refresh
- Use staged writes: build to `latest_{window}_{variant}.tmp-<ts>.json`, validate (count/checksum), then copy/overwrite the canonical key atomically. Clients always read the last good snapshot.
- Ship a tiny metadata file per window/variant (`latest_{window}_{variant}.meta.json`) with `generatedAt`, `expiresAt`, `versionId` (from S3 versioning), and `stagedKey` to expose freshness in the UI.
- Enable S3 versioning; CloudFront serves the previous version until the overwrite completes. Clients can request `?versionId=<meta.versionId>` for consistency if needed.
- On `fresh=true` while a rebuild is running, return 202 + `requestId` and let the UI poll/SSE/WebSocket for completion; otherwise serve the last stable snapshot immediately.
- Failure path: if a build fails, leave the canonical key untouched and set a “stale” flag in meta so the UI shows “last updated Xm ago” instead of hard errors.

## Where to build the cache files (Pi vs Lambda)
- Default to scheduled Lambda builders reading DynamoDB: avoids Raspberry Pi storage/uptime constraints, centralizes logic, and keeps write-path on Pi simple (just upload raw samples). Use incremental queries keyed on timestamp to avoid rescanning a year each run.
- If cost of rereading historical data is a concern, keep the Lambda incremental: remember the last aggregated timestamp in a meta record (DynamoDB or S3), read only new items since that point, and append/recompute aggregates per window. This minimizes RCU spend and keeps <5s runtime.
- Pi-side builds are only viable if you have disk for ~1y of raw data and reliable uplink; otherwise risk missing windows during outages. If you do Pi builds, still stage to S3 the same way, but treat it as a fallback, not primary.
- Consider a hybrid: Pi continuously writes raw to DynamoDB; a scheduled Lambda builds window caches; if Lambda fails repeatedly, Pi can push a “last resort” cache file to a `fallback/` prefix so the API can serve something.
- Compression: store cache files gzip-encoded in S3 with correct `Content-Encoding` to cut transfer time; small files keep CloudFront/TLS overhead low.

## Actionable plan
### step 1: define window + granularity matrix
- Lock the supported windows: allowlist 1h, 10h, 1d, 10d, 3m, 12m. Keep this list shared between backend (validation + builder) and frontend (options).
- Lock the granularities: allowlist 20, 100, 250, 500 (raw). Precompute these four per window; anything else is served by downsampling from the nearest higher fidelity (e.g., 500 or 250).
- Naming conventions: map window + granularity to predictable keys `latest_{window}_{granularity}.json` and `latest_{window}_{granularity}.meta.json` (e.g., `latest_1h_20.json`, `latest_10d_500.json`).
- Count expectations: 6 windows × 4 granularities = 24 payload files; 24 meta files. Staged temp keys also exist during builds but don’t change the canonical count.
- Store these constants in infra/runtime code (Lambda builder + API handler) and UI config to ensure input validation and UX choices match what is built.
### step 2: add S3/CloudFront cache structure
- Create S3 prefixes and key naming (`latest_{window}_{variant}.json`, `.meta.json`) and enable versioning; configure CloudFront TTLs (30–60s for short windows, longer for big windows) and `Content-Encoding: gzip`.
### step 3: build scheduled Lambda for window caches
- Implement a Lambda (EventBridge rate) that reads DynamoDB incrementally, produces raw + down-sampled payloads per window, writes to staging keys, validates, then atomically copies to canonical keys and meta. Persist last-processed timestamp to DynamoDB/S3.
### step 4: expose API for latest windows
- Add `GET /samples/latest` with query params `minutes|hours|days|months` and optional `samples`. Route to S3 objects for matching window/granularity; support `fresh=true` to bypass cache and `versionId` for consistency. Return 202 + `requestId` if a fresh build is running.
### step 5: UI feedback and stale handling
- Update frontend to read meta (`generatedAt`, `expiresAt`, `versionId`) to show “last updated” and stale warnings; add loading throbber for 202 responses and hook into SSE/WebSocket/polling for completion signals.
### step 6: warm paths and resilience
- Add provisioned concurrency or keep-alive ping for hot Lambda(s); add alarms on Lambda errors and DynamoDB p95; implement fallback to last good snapshot and optional Pi-produced `fallback/` cache if scheduled builds fail repeatedly.
