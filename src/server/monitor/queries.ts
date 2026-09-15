import type Database from 'better-sqlite3';
import type { DenomAmount, MonitorActivity, MonitorAddress, MonitorOverview, PageResult } from '@/components/monitor/types';
import { CHAIN_RESTART_HEIGHT, EVM_TYPES, JOB_STALE_MS } from './config';
import { latestSnapshotId, monitorDb } from './db';

const compareAmount = (a: string, b: string) => BigInt(a) < BigInt(b) ? -1 : BigInt(a) > BigInt(b) ? 1 : 0;
const json = <T,>(value: string | null, fallback: T): T => { try { return value ? JSON.parse(value) as T : fallback; } catch { return fallback; } };

// Base-unit amounts are 18-decimal strings that overflow IEEE-754, so totals are
// folded with BigInt rather than SQL SUM().
const totalsByDenom = (rows: { denom: string; amount: string }[]): DenomAmount[] => {
  const totals = new Map<string, bigint>();
  rows.forEach((row) => totals.set(row.denom, (totals.get(row.denom) ?? BigInt(0)) + BigInt(row.amount || '0')));
  return [...totals]
    .map(([denom, amount]) => ({ denom, amount: amount.toString() }))
    .sort((a, b) => compareAmount(b.amount, a.amount) || a.denom.localeCompare(b.denom));
};

export function overview(database: Database.Database = monitorDb(), now = Date.now()): MonitorOverview {
  const snapshot = database.prepare("SELECT id,finished_at,captured_head_height FROM snapshot WHERE status='ok' ORDER BY id DESC LIMIT 1").get() as any;
  const previous = database.prepare("SELECT id FROM snapshot WHERE status='ok' ORDER BY id DESC LIMIT 1 OFFSET 1").get() as any;
  const cursor = database.prepare("SELECT * FROM cursor WHERE job='activity'").get() as any;
  const count = (sql: string, ...params: unknown[]) => (database.prepare(sql).get(...params) as { n: number }).n;
  const snapshotId = snapshot?.id ?? -1;
  const amountRows = (table: string) => database.prepare(`SELECT denom,amount FROM ${table} WHERE snapshot_id=?`).all(snapshotId) as {denom:string;amount:string}[];
  const observed = database.prepare(`SELECT type,COUNT(*) count FROM activity_message WHERE type IN (${EVM_TYPES.map(() => '?').join(',')}) GROUP BY type ORDER BY type`).all(...EVM_TYPES) as {type:string;count:number}[];
  const ranAt = cursor?.ran_at ?? null;
  return {
    snapshotAt: snapshot?.finished_at ?? null,
    snapshotHead: snapshot?.captured_head_height ?? null,
    watchlistSize: count("SELECT COUNT(*) n FROM watchlist_tag WHERE tag='compromised'"),
    stakers: count('SELECT COUNT(DISTINCT address) n FROM stake_snapshot WHERE snapshot_id=?', snapshotId),
    previousStakers: previous ? count('SELECT COUNT(DISTINCT address) n FROM stake_snapshot WHERE snapshot_id=?', previous.id) : null,
    lockRows: count('SELECT COUNT(*) n FROM stake_snapshot WHERE snapshot_id=?', snapshotId),
    validators: count('SELECT COUNT(DISTINCT validator) n FROM stake_snapshot WHERE snapshot_id=?', snapshotId),
    unbondingAddresses: count('SELECT COUNT(DISTINCT address) n FROM unbonding_snapshot WHERE snapshot_id=?', snapshotId),
    balanceAddresses: count('SELECT COUNT(DISTINCT address) n FROM balance_snapshot WHERE snapshot_id=?', snapshotId),
    stakeByDenom: totalsByDenom(amountRows('stake_snapshot')),
    balanceByDenom: totalsByDenom(amountRows('balance_snapshot')),
    activity: {
      total: count("SELECT COUNT(*) n FROM activity_match WHERE tag='compromised'"),
      sinceRestart: count("SELECT COUNT(*) n FROM activity_match WHERE tag='compromised' AND height>=?", CHAIN_RESTART_HEIGHT),
      last24h: count("SELECT COUNT(*) n FROM activity_match x JOIN activity_message m USING(height,tx_hash,msg_index) WHERE x.tag='compromised' AND m.block_time>=datetime('now','-1 day')"),
      distinctAddresses: count("SELECT COUNT(DISTINCT address) n FROM activity_match WHERE tag='compromised'"),
      ...(() => { const row = database.prepare("SELECT m.height,m.block_time FROM activity_match x JOIN activity_message m USING(height,tx_hash,msg_index) WHERE x.tag='compromised' ORDER BY m.height DESC,m.tx_hash DESC,m.msg_index DESC,x.address ASC LIMIT 1").get() as any; return {lastHeight:row?.height ?? null,lastAt:row?.block_time ?? null}; })(),
    },
    job: {
      status: cursor?.status ?? 'never-run', ranAt, capturedHead: cursor?.captured_head_height ?? null,
      verifiedThrough: cursor?.verified_through_height ?? null,
      lag: cursor ? Math.max(0,cursor.captured_head_height-cursor.verified_through_height) : null,
      stale: !ranAt || now-new Date(ranAt).getTime()>JOB_STALE_MS,
      error: cursor?.error ?? null,
    },
    evm: { supportedTypes:[...EVM_TYPES], observedTypes:observed, actualType:'/os.evm.v1.MsgEthereumTx', covered:EVM_TYPES.includes('/os.evm.v1.MsgEthereumTx') },
    classifications: database.prepare("SELECT address,tag,label FROM watchlist_tag WHERE tag IN ('suspected_sink','systemic_counterparty') ORDER BY tag,address").all() as {address:string;tag:string;label:string|null}[],
  };
}

export function addressPage(options: {page:number;pageSize:number;q:string;sort:string;denom:string;stakingOnly:boolean}, database: Database.Database=monitorDb()): PageResult<MonitorAddress> {
  const snapshotId = latestSnapshotId(database);
  if (!snapshotId) return {rows:[],total:0,page:1,pageSize:options.pageSize,pages:0};
  const q = options.q.trim().toLowerCase();
  const rows = database.prepare(`SELECT w.address,
    (SELECT GROUP_CONCAT(tag) FROM watchlist_tag t WHERE t.address=w.address) tags,
    (SELECT COUNT(DISTINCT validator) FROM stake_snapshot s WHERE s.snapshot_id=? AND s.address=w.address) validators,
    (SELECT COUNT(*) FROM unbonding_snapshot u WHERE u.snapshot_id=? AND u.address=w.address) unbonding,
    (SELECT MAX(height) FROM activity_match a WHERE a.address=w.address AND a.tag='compromised') last_height,
    (SELECT COUNT(*) FROM activity_match a WHERE a.address=w.address AND a.tag='compromised') activity_count
    FROM watchlist w JOIN watchlist_tag scope ON scope.address=w.address AND scope.tag='compromised'
    WHERE (?='' OR lower(w.address) LIKE ?)
      ${options.stakingOnly ? 'AND EXISTS(SELECT 1 FROM stake_snapshot active WHERE active.snapshot_id=? AND active.address=w.address)' : ''}`)
    .all(...(options.stakingOnly ? [snapshotId,snapshotId,q,`%${q}%`,snapshotId] : [snapshotId,snapshotId,q,`%${q}%`])) as any[];
  const amountsFor = (table:string,address:string) => database.prepare(`SELECT denom,amount FROM ${table} WHERE snapshot_id=? AND address=?`).all(snapshotId,address) as {denom:string;amount:string}[];
  const fold = (items:{denom:string;amount:string}[]) => [...items.reduce((map,row) => { map.set(row.denom,(map.get(row.denom) ?? BigInt(0))+BigInt(row.amount||'0')); return map; },new Map<string,bigint>())].map(([denom,amount])=>({denom,amount:amount.toString()}));
  let mapped = rows.map((row):MonitorAddress => {
    const stake=fold(amountsFor('stake_snapshot',row.address));
    const balances=fold(amountsFor('balance_snapshot',row.address));
    const last = row.last_height == null ? null : database.prepare('SELECT block_time FROM activity_message WHERE height=? ORDER BY tx_hash DESC,msg_index DESC LIMIT 1').get(row.last_height) as any;
    return {address:row.address,tags:(row.tags??'compromised').split(','),validators:row.validators,stake,balances,unbonding:row.unbonding,lastActivityHeight:row.last_height,lastActivityAt:last?.block_time??null,activityCount:row.activity_count,primaryAmount:stake.find((item)=>item.denom===options.denom)?.amount??'0'};
  });
  mapped.sort((a,b)=> {
    if(options.sort==='address') return a.address.localeCompare(b.address);
    if(options.sort==='validators') return b.validators-a.validators || compareAmount(b.primaryAmount,a.primaryAmount) || a.address.localeCompare(b.address);
    if(options.sort==='activity') return (b.lastActivityHeight??-1)-(a.lastActivityHeight??-1) || a.address.localeCompare(b.address);
    return compareAmount(options.sort==='stake_asc'?a.primaryAmount:b.primaryAmount,options.sort==='stake_asc'?b.primaryAmount:a.primaryAmount) || a.address.localeCompare(b.address);
  });
  const total=mapped.length; const page=Math.max(1,options.page); const start=(page-1)*options.pageSize;
  return {rows:mapped.slice(start,start+options.pageSize),total,page,pageSize:options.pageSize,pages:Math.ceil(total/options.pageSize)};
}

export function activityPage(options:{page:number;pageSize:number;type:string;direction:string;success:string;address:string;sinceRestart:boolean},database:Database.Database=monitorDb()):PageResult<MonitorActivity>&{types:string[]}{
  const where=["x.tag='compromised'"];const params:any[]=[];
  if(options.type){where.push('m.type=?');params.push(options.type);} if(options.direction){where.push('x.direction=?');params.push(options.direction);} if(options.address){where.push('x.address=?');params.push(options.address);} if(options.success==='success'){where.push('m.success=1');} if(options.success==='failed'){where.push('m.success=0');} if(options.success==='unknown'){where.push('m.success IS NULL');} if(options.sinceRestart){where.push('m.height>=?');params.push(CHAIN_RESTART_HEIGHT);}
  const from=`FROM activity_match x JOIN activity_message m USING(height,tx_hash,msg_index) WHERE ${where.join(' AND ')}`;
  const total=(database.prepare(`SELECT COUNT(*) n ${from}`).get(...params) as any).n; const page=Math.max(1,options.page);const offset=(page-1)*options.pageSize;
  const rows=database.prepare(`SELECT m.height,m.tx_hash,m.msg_index,m.type,m.success,m.block_time,x.address,x.direction,x.counterparties ${from} ORDER BY m.height DESC,m.tx_hash DESC,m.msg_index DESC,x.address ASC LIMIT ? OFFSET ?`).all(...params,options.pageSize,offset) as any[];
  const types=(database.prepare("SELECT DISTINCT m.type FROM activity_match x JOIN activity_message m USING(height,tx_hash,msg_index) WHERE x.tag='compromised' ORDER BY m.type").all() as any[]).map((row)=>row.type);
  return {rows:rows.map((row)=>({height:row.height,txHash:row.tx_hash,msgIndex:row.msg_index,address:row.address,type:row.type,direction:row.direction,counterparties:json(row.counterparties,[]),success:row.success==null?null:Boolean(row.success),blockTime:row.block_time})),total,page,pageSize:options.pageSize,pages:Math.ceil(total/options.pageSize),types};
}
