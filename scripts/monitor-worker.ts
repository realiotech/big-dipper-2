import path from 'node:path';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: path.resolve(process.cwd(), '.env.local') });
loadEnv({ path: path.resolve(process.cwd(), '.env') });

const once = process.argv.includes('--once');
const tailEvery = Math.max(30_000, Number(process.env.MONITOR_TAIL_INTERVAL_MS ?? 60_000));
const sweepEvery = Math.max(tailEvery, Number(process.env.MONITOR_SWEEP_INTERVAL_MS ?? 15 * 60_000));
let stopped = false;
process.on('SIGINT', () => { stopped = true; });
process.on('SIGTERM', () => { stopped = true; });

async function run() {
  const [{ importWatchlist }, { tailActivity }, { sweepStake }, { deliverAlerts }, { pruneSnapshots }] = await Promise.all([
    import('../src/server/monitor/db'), import('../src/server/monitor/tail'),
    import('../src/server/monitor/sweep'), import('../src/server/monitor/alerts'),
    import('../src/server/monitor/retention'),
  ]);
  const count = importWatchlist();
  console.log(`monitor watchlist: ${count} compromised addresses`);
  let lastSweep = 0;
  do {
    try {
      if (Date.now() - lastSweep >= sweepEvery || once) {
        const sweep = await sweepStake(); lastSweep = Date.now();
        console.log(`monitor stake: snapshot ${sweep.snapshotId}, ${sweep.addresses} addresses, head ${sweep.headHeight}`);
        // Each sweep rewrites every staking row, so retire superseded ones
        // before the next one lands. Activity evidence is never pruned.
        const pruned = pruneSnapshots();
        if (pruned.removedSnapshots || pruned.removedAlerts) console.log(`monitor prune: ${pruned.removedSnapshots} snapshots, ${pruned.removedRows} rows, ${pruned.removedAlerts} alerts removed`);
      }
      const tail = await tailActivity();
      console.log(`monitor activity: ${tail.scanned} scanned, ${tail.matches} matches, verified ${tail.verifiedThrough}`);
      const alerts = await deliverAlerts();
      if (!alerts.skipped) console.log(`monitor alerts: ${alerts.delivered} delivered, ${alerts.failed} failed`);
    } catch (error) { console.error(`monitor worker: ${(error as Error).message}`); }
    if (!once && !stopped) await new Promise((resolve) => setTimeout(resolve, tailEvery));
  } while (!once && !stopped);
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
