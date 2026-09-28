import { acquireLease, compromisedAddresses, monitorDb } from './db';
import { chainHead, gql, paginate, requestStats } from './hasura';
import { ROW_CAP, STAKE_CHUNK } from './config';

type Lock = { staker_addr: string; val_addr: string; denom: string; amount: string | null; height: number };
type Unlock = Lock & { creation_height: number };
type Balance = { address: string; denom: string; amount: string | null; height: number };
const LOCK_FIELDS = 'staker_addr val_addr denom amount height';
const SWEEP = `query MonitorSweep($a:[String!],$ll:Int!,$bl:Int!){
 ms_locks(where:{staker_addr:{_in:$a}},order_by:[{staker_addr:asc},{val_addr:asc},{denom:asc}],limit:$ll){${LOCK_FIELDS}}
 ms_unlocks(where:{staker_addr:{_in:$a}},order_by:[{staker_addr:asc},{val_addr:asc},{denom:asc},{creation_height:asc}],limit:$ll){${LOCK_FIELDS} creation_height}
 balance(where:{address:{_in:$a}},order_by:[{address:asc},{denom:asc}],limit:$bl){address denom amount height}}
`;
const LOCK_PAGE = `query MonitorLocks($a:[String!],$limit:Int!,$offset:Int!){ms_locks(where:{staker_addr:{_in:$a}},order_by:[{staker_addr:asc},{val_addr:asc},{denom:asc}],limit:$limit,offset:$offset){${LOCK_FIELDS}}}`;
const UNLOCK_PAGE = `query MonitorUnlocks($a:[String!],$limit:Int!,$offset:Int!){ms_unlocks(where:{staker_addr:{_in:$a}},order_by:[{staker_addr:asc},{val_addr:asc},{denom:asc},{creation_height:asc}],limit:$limit,offset:$offset){${LOCK_FIELDS} creation_height}}`;
const BAL_PAGE = `query MonitorBalances($a:[String!],$limit:Int!,$offset:Int!){balance(where:{address:{_in:$a}},order_by:[{address:asc},{denom:asc}],limit:$limit,offset:$offset){address denom amount height}}`;

const chunks = <T,>(items: T[], size: number) => Array.from(
  { length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size)
);

export async function sweepStake(): Promise<{ snapshotId: number; addresses: number; headHeight: number }> {
  const database = monitorDb();
  const lease = acquireLease('stake', database);
  const requestsBefore = requestStats.requests;
  const started = new Date().toISOString();
  let snapshotId: number | null = null;
  try {
    const addresses = compromisedAddresses(database);
    if (!addresses.length) throw new Error('monitor compromised watchlist is empty');
    const head = await chainHead();
    snapshotId = Number(database.prepare(
      "INSERT INTO snapshot(started_at,captured_head_height,status) VALUES(?,?,'running')"
    ).run(started, head.height).lastInsertRowid);
    const lockInsert = database.prepare('INSERT OR REPLACE INTO stake_snapshot VALUES(?,?,?,?,?,?)');
    const unlockInsert = database.prepare('INSERT OR REPLACE INTO unbonding_snapshot VALUES(?,?,?,?,?,?,?)');
    const balanceInsert = database.prepare('INSERT OR REPLACE INTO balance_snapshot VALUES(?,?,?,?,?)');
    const write = database.transaction((locks: Lock[], unlocks: Unlock[], balances: Balance[]) => {
      locks.forEach((row) => lockInsert.run(snapshotId, row.staker_addr, row.val_addr, row.denom, row.amount ?? '0', row.height));
      unlocks.forEach((row) => unlockInsert.run(snapshotId, row.staker_addr, row.val_addr, row.denom, row.creation_height, row.amount ?? '0', row.height));
      balances.forEach((row) => balanceInsert.run(snapshotId, row.address, row.denom, row.amount ?? '0', row.height));
    });
    for (const batch of chunks(addresses, STAKE_CHUNK)) {
      const first = await gql<{ ms_locks: Lock[]; ms_unlocks: Unlock[]; balance: Balance[] }>(SWEEP, {
        a: batch, ll: ROW_CAP.ms_locks, bl: ROW_CAP.balance,
      });
      const append = async <T,>(rows: T[], cap: number, query: string, field: string) => rows.length === cap
        ? rows.concat(await paginate<T>(cap, async (limit, offset) => {
          const data = await gql<Record<string, T[]>>(query, { a: batch, limit, offset: offset + cap });
          return data[field];
        })) : rows;
      const locks = await append(first.ms_locks, ROW_CAP.ms_locks, LOCK_PAGE, 'ms_locks');
      const unlocks = await append(first.ms_unlocks, ROW_CAP.ms_unlocks, UNLOCK_PAGE, 'ms_unlocks');
      const balances = await append(first.balance, ROW_CAP.balance, BAL_PAGE, 'balance');
      // Renew before mutating so a worker whose lease expired during the
      // network request cannot write after another worker took ownership.
      lease.refresh();
      write(locks, unlocks, balances);
    }
    database.prepare("UPDATE snapshot SET status='ok',finished_at=?,requests=? WHERE id=?")
      .run(new Date().toISOString(), requestStats.requests - requestsBefore, snapshotId);
    return { snapshotId, addresses: addresses.length, headHeight: head.height };
  } catch (error) {
    if (snapshotId) database.prepare("UPDATE snapshot SET status='error',finished_at=?,error=?,requests=? WHERE id=?")
      .run(new Date().toISOString(), (error as Error).message, requestStats.requests - requestsBefore, snapshotId);
    throw error;
  } finally { lease.release(); }
}
