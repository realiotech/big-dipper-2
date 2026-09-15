# Deploying the compromised-wallet monitor

The explorer itself is a stateless Next.js app. The `/monitor` route adds one
stateful piece: a local SQLite store written by a background worker and read by
the server-rendered page. Everything below is about that piece; the rest of the
explorer deploys as it always has.

```
  web    : npm start            ─┐
                                 ├─ share $MONITOR_DB on one persistent volume
  worker : npm run monitor:worker ┘
             │
             └─ Hasura ($MONITOR_HASURA_URL)
```

The browser never talks to Hasura for monitor data and never receives the
watchlist or the admin secret. The page only reads what the worker has already
written, so **without a running worker the page renders empty** with job status
`never-run`.

## Requirements

- Node 20+ (the image uses `node:23`), matching the `engine-strict` setting in
  `.npmrc`.
- `better-sqlite3` is a native module. It must be compiled on the platform that
  runs it — a `node_modules` tree copied from another OS fails at runtime with
  `invalid ELF header`. Always run `npm ci` on the target image/host.
  On Alpine (musl) add `apk add --no-cache python3 make g++` if no prebuilt
  binary is published for musl, or switch the base image to
  `node:23-bookworm-slim`.
- The worker scripts run through `tsx`, and both scripts read `.env` through
  `dotenv`. Both are **devDependencies**, so an install with `--omit=dev` cannot
  run the worker. Keep dev dependencies in whichever image runs it.

## Configuration

Server-only. Never prefix any of these with `NEXT_PUBLIC_`; secrets belong in a
Secret, not in the chart's ConfigMap.

| Variable | Default | Notes |
| --- | --- | --- |
| `MONITOR_BASIC_AUTH_USER` / `MONITOR_BASIC_AUTH_PASSWORD` | unset | Protects `/monitor` and `/api/monitor/export`. With `NODE_ENV=production` and neither value set, every request is rejected with 401 (fails closed). |
| `MONITOR_PUBLIC` | `false` | Set `true` only as a deliberate decision to publish the address-level view without auth. |
| `MONITOR_HASURA_URL` | `NEXT_PUBLIC_GRAPHQL_URL`, else the public endpoint | Indexer the worker reads from. |
| `HASURA_ADMIN_SECRET` | unset | Only needed when the indexer is not public. An obsolete secret is dropped automatically and the request retried without it. |
| `MONITOR_DB` | `.monitor-data/monitor.db` | Put this on the persistent volume, e.g. `/data/monitor.db`. |
| `MONITOR_WATCHLIST_FILE` | `src/configs/compromised_wallets.json` | Resolved against the working directory. Import fails loudly if the file is missing. |
| `MONITOR_ACTIVITY_START_HEIGHT` | `19565000` | First height the activity scan covers. |
| `MONITOR_CHAIN_RESTART_HEIGHT` | `19573267` | Boundary for "since restart" counts and the alert floor. |
| `MONITOR_TAIL_INTERVAL_MS` | `60000` | Worker loop interval; clamped to a 30s minimum. |
| `MONITOR_SWEEP_INTERVAL_MS` | `900000` | Staking snapshot interval; never shorter than the tail interval. |
| `MONITOR_SNAPSHOT_RETENTION` | `96` | Staking snapshots kept (96 × 15 min ≈ 24 h). Minimum 2. |
| `MONITOR_ALERT_RETENTION_DAYS` | `30` | Age after which delivered alerts are dropped. `0` keeps them forever. |
| `MONITOR_WEBHOOK_URL` | unset | Without it, alerts accumulate in the outbox and delivery is skipped. |

## First deploy

1. **Build on the target platform.**

   ```sh
   npm ci
   npm run build
   ```

2. **Mount a persistent volume** for the directory holding `MONITOR_DB`. It must
   be a local or block filesystem — **not NFS**, where SQLite's WAL locking is
   unreliable across processes. Web and worker must mount the *same* volume,
   which in Kubernetes means one pod with the worker as a sidecar and a
   `ReadWriteOnce` PVC.

3. **Initialize the database** (idempotent, safe to run on every rollout — a
   good fit for an initContainer):

   ```sh
   npm run monitor:migrate
   ```

4. **Start exactly one worker**, with a restart policy:

   ```sh
   npm run monitor:worker
   ```

   Each cycle sweeps staking state (on the sweep interval), prunes superseded
   snapshots, tails new messages, and flushes the alert outbox.

5. **Start the web process** with `replicaCount: 1` and autoscaling disabled.

   ```sh
   npm start
   ```

SQLite has a single writer and both processes open the same file. More than one
replica means divergent databases and lock contention; see *Scaling out* below.

## What the first hours look like

The activity scan backfills from `MONITOR_ACTIVITY_START_HEIGHT` to the chain
head. One pass covers at most 400 pages × 100 messages = 40,000 messages, then
the worker sleeps for the tail interval. Until the backfill completes:

- job status stays `partial`, `verified` trails `captured`, and the page shows
  **"Coverage needs attention"** — expected, not a failure;
- progress lives in the `cursor` table, so a restarted worker resumes at the
  exact `(height, transaction_hash, index)` it left off;
- lowering `MONITOR_TAIL_INTERVAL_MS` to `30000` during the backfill shortens it;
  restore `60000` once status reaches `ok`.

The staking sweep finishes inside the first cycle, so **Blacklist totals** are
populated long before the activity table is complete.

## Verification

```sh
curl -u "$USER:$PASS" -I https://<host>/monitor        # 200, and 401 without credentials
curl -u "$USER:$PASS" https://<host>/api/monitor/export | head
```

Worker logs should show all three lines:

```
monitor watchlist: 33606 compromised addresses
monitor stake: snapshot 12, 33606 addresses, head 19...
monitor activity: 40000 scanned, 0 matches, verified 19...
```

On the page: status `ok`, `lag` at 0, and non-zero Blacklist totals.

## Routine operations

**Retention.** The worker prunes automatically after each sweep. To run it by
hand or from a cron job:

```sh
npm run monitor:prune -- --keep=96 --alert-days=30 --vacuum
```

Only staking snapshots and already-delivered alerts are removed. Activity
messages and matches — the incident evidence — are never pruned, so the database
grows slowly and deliberately over time.

`--vacuum` reclaims file space (deletes alone do not shrink a SQLite file) and
truncates the WAL. It rewrites the whole file, so run it off-peak, not on every
cycle.

**Backups.** Never copy the `.db` file while WAL is active. Use:

```sh
sqlite3 "$MONITOR_DB" "VACUUM INTO '/backup/monitor-$(date +%F).db'"
```

**Alerting on the monitor itself.** Page someone when job status is not `ok` or
`lag` stays above zero for more than a few cycles — a quiet feed is not evidence
of quiet wallets until the worker has caught up.

## Scaling out

SQLite is the right size for one host and 33,606 addresses, but it is what
forces the single replica, the shared volume and the file-level backups. Before
running multiple replicas, move the store to Postgres: the SQL in
`src/server/monitor/` is portable and the change is contained to `db.ts`,
`queries.ts` and `retention.ts`.

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| Every request returns 401 | Production with no Basic Auth credentials set — the fail-closed default. |
| `invalid ELF header` on start | `node_modules` built for another platform; re-run `npm ci` on the target. |
| `monitor watchlist must be a JSON array` / ENOENT | `MONITOR_WATCHLIST_FILE` missing from the image or pointing outside the working directory. |
| `monitor job stake is already running` | A second worker, or a crashed one whose lease has not expired (30 min TTL). Run exactly one. |
| Page is empty, status `never-run` | No worker has run against this database — often a fresh volume after a restart. |
| Totals present but Activity empty | Backfill still in progress; check that `verified` is advancing between cycles. |
| Database file grows steadily | Expected for activity evidence. If staking rows grow too, the prune is not running — check worker logs for `monitor prune`. |
