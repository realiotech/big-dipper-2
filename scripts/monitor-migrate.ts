import path from 'node:path';
import { config as loadEnv } from 'dotenv';
loadEnv({ path: path.resolve(process.cwd(), '.env.local') });
loadEnv({ path: path.resolve(process.cwd(), '.env') });
import('../src/server/monitor/db').then(({ importWatchlist, monitorDb }) => {
  const count = importWatchlist(); monitorDb().close();
  console.log(`monitor database ready; ${count} compromised addresses imported`);
});
