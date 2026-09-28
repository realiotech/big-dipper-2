import path from 'node:path';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: path.resolve(process.cwd(), '.env.local') });
loadEnv({ path: path.resolve(process.cwd(), '.env') });

const numeric = (flag: string) => {
  const match = process.argv.find((item) => item.startsWith(`--${flag}=`));
  return match ? Number(match.split('=')[1]) : undefined;
};

Promise.all([import('../src/server/monitor/retention'), import('../src/server/monitor/db')])
  .then(([{ pruneSnapshots, compactDatabase }, { monitorDb }]) => {
    const database = monitorDb();
    const result = pruneSnapshots({ keep: numeric('keep'), alertDays: numeric('alert-days'), database });
    console.log(
      `monitor prune: ${result.removedSnapshots} snapshots, ${result.removedRows} rows, `
      + `${result.removedAlerts} delivered alerts removed`
      + `${result.keptFrom == null ? ' (nothing old enough)' : `; kept from snapshot ${result.keptFrom}`}`
    );
    if (process.argv.includes('--vacuum')) {
      compactDatabase(database);
      console.log('monitor prune: database compacted');
    }
    database.close();
  })
  .catch((error) => { console.error(error); process.exitCode = 1; });
