import path from 'node:path';

export const HASURA_URL =
  process.env.MONITOR_HASURA_URL ??
  process.env.NEXT_PUBLIC_GRAPHQL_URL ??
  'https://hasura.realio.network/v1/graphql';
export const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET ?? '';
export const DB_FILE = path.resolve(
  process.cwd(),
  process.env.MONITOR_DB ?? '.monitor-data/monitor.db'
);
export const WATCHLIST_FILE = path.resolve(
  process.cwd(),
  process.env.MONITOR_WATCHLIST_FILE ?? 'src/configs/compromised_wallets.json'
);
export const ACTIVITY_START_HEIGHT = Number(
  process.env.MONITOR_ACTIVITY_START_HEIGHT ?? 19565000
);
export const CHAIN_RESTART_HEIGHT = Number(
  process.env.MONITOR_CHAIN_RESTART_HEIGHT ?? 19573267
);
export const OVERLAP_BLOCKS = Math.max(1, Number(process.env.MONITOR_OVERLAP_BLOCKS ?? 100));
export const JOB_STALE_MS = Math.max(60_000, Number(process.env.MONITOR_JOB_STALE_MS ?? 15 * 60_000));
export const LOCK_TTL_MS = Math.max(60_000, Number(process.env.MONITOR_LOCK_TTL_MS ?? 30 * 60_000));
export const SNAPSHOT_RETENTION = Math.max(2, Number(process.env.MONITOR_SNAPSHOT_RETENTION ?? 96));
export const ALERT_RETENTION_DAYS = Math.max(0, Number(process.env.MONITOR_ALERT_RETENTION_DAYS ?? 30));
export const ROW_CAP = { ms_locks: 100, ms_unlocks: 100, balance: 200, message: 100 } as const;
export const STAKE_CHUNK = 500;
export const WEBHOOK_URL = process.env.MONITOR_WEBHOOK_URL ?? '';
export const ALERT_MIN_HEIGHT = Number(
  process.env.MONITOR_ALERT_MIN_HEIGHT ?? CHAIN_RESTART_HEIGHT
);
export const EVM_TYPES = [
  '/os.evm.v1.MsgEthereumTx',
  '/cosmos.evm.vm.v1.MsgEthereumTx',
  '/ethermint.evm.v1.MsgEthereumTx',
] as const;
export const DENOMS: Record<string, { symbol: string; exponent: number }> = {
  ario: { symbol: 'RIO', exponent: 18 },
  arst: { symbol: 'RST', exponent: 18 },
  almx: { symbol: 'LMX', exponent: 18 },
  'erc20:0xb841F365D5221Bed66d60E69094418D8C2aa5A44': { symbol: 'DSTRX', exponent: 18 },
};
export const ACCOUNT_URL = (address: string) => `/accounts/${address}`;
export const TX_URL = (hash: string) => `/transactions/${hash}`;
