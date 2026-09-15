# Big Dipper 2.0 ✨ (Cosmos Based Chains)
Big Dipper is an open-source block explorer and token management tool serving over 10 proof-of-stake blockchains. It has been forked more than 100 times on GitHub and has served audiences from 140 countries and regions.

**This repo contains the UI of big dipper 2.0 only**

## Documentation
Read our official documentation at [http://docs.bigdipper.live/](http://docs.bigdipper.live/)

## Issue Reporting
For UI related issues please report it here [https://github.com/forbole/big-dipper-2.0-cosmos/issues](https://github.com/forbole/big-dipper-2.0-cosmos/issues).

For Hasura and BdJuno issues please report it here [https://github.com/forbole/bdjuno/issues](https://github.com/forbole/bdjuno/issues)

## License
Read our license at [https://raw.githubusercontent.com/forbole/big-dipper-2.0-cosmos/master/LICENSE](https://raw.githubusercontent.com/forbole/big-dipper-2.0-cosmos/master/LICENSE)

## Ledger and Transaction Support
While Big Dipper 2.0 no longer supports ledger or any kind of transactions in favor of [Forbole X](https://github.com/forbole/forbole-x), the original [Big Dipper](https://github.com/forbole/big-dipper) will continue have this feature.

## Branching Policy

All new feature and bugfix branches must be created off the main branch `(chains/realio)`

Do not create branches from stage or other branches.

Pull requests should target the integration branch for testing `(chains/realio-testnet)`.

The `chains/realio` branch is the default and canonical branch of this repository.

## Compromised-wallet monitor

The internal monitor is available at `/monitor`. It is server-rendered and reads
from a local SQLite database; the 33,606-address source file and Hasura admin
secret are never bundled into the browser. Set both `MONITOR_BASIC_AUTH_USER`
and `MONITOR_BASIC_AUTH_PASSWORD` to protect the page and CSV endpoint with
HTTP Basic Auth. Production fails closed when neither value is set; set
`MONITOR_PUBLIC=true` only when publishing the address-level monitor is an
explicit decision. Authentication remains disabled by default in local development.

Initialize and run one full cycle:

```sh
npm run monitor:migrate
npm run monitor:once
```

For a long-running single-host worker use `npm run monitor:worker`. It takes a
SQLite lease before each job, snapshots staking state, tails messages with the
total-order cursor `(height, transaction_hash, index)`, records a captured head
and verified-through watermark, and overlaps completed activity scans by 100
blocks. Run only one worker against a persistent volume. SQLite is not suitable
for multiple stateless replicas; migrate the store to Postgres before scaling
the worker horizontally.

Every sweep rewrites the full staking picture, so the worker retires superseded
snapshots after each one; `MONITOR_SNAPSHOT_RETENTION` (default 96, about a day
at the standard interval) sets how many are kept. Run it by hand with
`npm run monitor:prune -- --keep=96 --vacuum`. Activity messages and matches are
never pruned. See `DEPLOY.md` for the full deployment runbook.

The staking tables exposed by the indexer are mutable current-state views, so
the captured head is an operational freshness marker rather than a historical
`as-of` guarantee across the whole multi-request sweep.

Set `MONITOR_WEBHOOK_URL` to deliver deduplicated post-restart compromised-wallet
activity. Failed deliveries remain in the outbox and retry with exponential
backoff. The export endpoint is the narrow, authenticated
`/api/monitor/export`; there is deliberately no general Hasura proxy.

Address classifications are independent tags. The original 33,606 entries
remain `compromised`; the payload-derived dominant receiver is additionally
`suspected_sink`, while the previously misidentified address is
`systemic_counterparty`. Neither behavioral label claims ownership or intent.
