import { addressRoles, counterpartiesFor, directionFor } from './activity';
import { acquireLease, compromisedAddresses, monitorDb } from './db';
import { chainHead, gql } from './hasura';
import { ACTIVITY_START_HEIGHT, ALERT_MIN_HEIGHT, OVERLAP_BLOCKS, ROW_CAP } from './config';

export type Message = {
  height: number; index: number; type: string; transaction_hash: string;
  involved_accounts_addresses: string[] | null; value: unknown;
  transaction: { success: boolean; block: { timestamp: string } } | null;
};
export const TAIL_QUERY = `query MonitorTail($head:bigint!,$h:bigint!,$tx:String!,$i:bigint!,$limit:Int!){
 message(where:{_and:[{height:{_lte:$head}},{_or:[{height:{_gt:$h}},{_and:[{height:{_eq:$h}},{transaction_hash:{_gt:$tx}}]},{_and:[{height:{_eq:$h}},{transaction_hash:{_eq:$tx}},{index:{_gt:$i}}]}]}]},order_by:[{height:asc},{transaction_hash:asc},{index:asc}],limit:$limit){height index type transaction_hash involved_accounts_addresses value transaction{success block{timestamp}}}}`;

type Identity = { height: number; transaction_hash: string; index: number };
function compare(a: Identity, b: Identity) {
  return a.height - b.height || a.transaction_hash.localeCompare(b.transaction_hash) || a.index - b.index;
}
export function assertOrdered(rows: Message[], after: Identity): void {
  rows.reduce((previous, row) => {
    if (!row.transaction_hash || compare(row, previous) <= 0) throw new Error('monitor indexer returned invalid message ordering');
    return row;
  }, after);
}

export async function tailActivity(maxPages = 400): Promise<{ scanned: number; matches: number; verifiedThrough: number; head: number }> {
  const database = monitorDb();
  const lease = acquireLease('activity', database);
  try {
    const watched = new Set(compromisedAddresses(database));
    if (!watched.size) throw new Error('monitor compromised watchlist is empty');
    const existing = database.prepare("SELECT * FROM cursor WHERE job='activity'").get() as any;
    const resuming = existing && existing.captured_head_height > existing.verified_through_height && existing.status !== 'ok';
    const verifiedBefore = existing?.verified_through_height ?? ACTIVITY_START_HEIGHT - 1;
    const scanFrom = resuming ? existing.scan_from_height : Math.max(ACTIVITY_START_HEIGHT, verifiedBefore - OVERLAP_BLOCKS + 1);
    const capturedHead = resuming ? existing.captured_head_height : (await chainHead()).height;
    let cursor: Identity = resuming
      ? { height: existing.last_height, transaction_hash: existing.last_tx_hash, index: existing.last_index }
      : { height: scanFrom - 1, transaction_hash: '', index: -1 };
    const now = new Date().toISOString();
    database.prepare(`INSERT INTO cursor(job,scan_from_height,captured_head_height,verified_through_height,last_height,last_tx_hash,last_index,ran_at,status)
      VALUES('activity',?,?,?,?,?,?,?,'running') ON CONFLICT(job) DO UPDATE SET scan_from_height=excluded.scan_from_height,captured_head_height=excluded.captured_head_height,last_height=excluded.last_height,last_tx_hash=excluded.last_tx_hash,last_index=excluded.last_index,ran_at=excluded.ran_at,status='running',error=NULL`)
      .run(scanFrom, capturedHead, verifiedBefore, cursor.height, cursor.transaction_hash, cursor.index, now);
    const putMessage = database.prepare(`INSERT INTO activity_message VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(height,tx_hash,msg_index) DO UPDATE SET type=excluded.type,involved_addresses=excluded.involved_addresses,sender_addresses=excluded.sender_addresses,recipient_addresses=excluded.recipient_addresses,success=excluded.success,value=excluded.value,block_time=excluded.block_time,seen_at=excluded.seen_at`);
    const putMatch = database.prepare(`INSERT INTO activity_match VALUES(?,?,?,?,?,?,?) ON CONFLICT(height,tx_hash,msg_index,address) DO UPDATE SET tag=excluded.tag,direction=excluded.direction,counterparties=excluded.counterparties`);
    const enqueue = database.prepare(`INSERT OR IGNORE INTO alert_outbox(dedupe_key,height,tx_hash,msg_index,address,payload,created_at) VALUES(?,?,?,?,?,?,?)`);
    let scanned = 0; let matches = 0; let complete = capturedHead < scanFrom;
    for (let page = 0; page < maxPages && !complete; page += 1) {
      const data = await gql<{ message: Message[] }>(TAIL_QUERY, { head: capturedHead, h: cursor.height, tx: cursor.transaction_hash, i: cursor.index, limit: ROW_CAP.message });
      assertOrdered(data.message, cursor);
      if (!data.message.length) { complete = true; break; }
      const seenAt = new Date().toISOString();
      // Fence stale workers before their page transaction can mutate state.
      lease.refresh();
      database.transaction(() => {
        data.message.forEach((message) => {
          const roles = addressRoles(message.value);
          const candidates = new Set([...roles.participants, ...(message.involved_accounts_addresses ?? [])]);
          const found = [...candidates].filter((address) => watched.has(address));
          if (!found.length) return;
          putMessage.run(message.height,message.transaction_hash,message.index,message.type,JSON.stringify(message.involved_accounts_addresses ?? []),JSON.stringify(roles.senders),JSON.stringify(roles.recipients),message.transaction == null ? null : Number(message.transaction.success),JSON.stringify(message.value ?? null),message.transaction?.block.timestamp ?? null,seenAt);
          found.forEach((address) => {
            const direction = directionFor(address, roles);
            const counterparties = counterpartiesFor(address, roles);
            const changes = putMatch.run(message.height,message.transaction_hash,message.index,address,'compromised',direction,JSON.stringify(counterparties)).changes;
            matches += changes;
            if (changes && message.height >= ALERT_MIN_HEIGHT) enqueue.run(
              `${message.height}:${message.transaction_hash}:${message.index}:${address}`,
              message.height,message.transaction_hash,message.index,address,
              JSON.stringify({ event:'compromised_wallet_activity',address,direction,counterparties,type:message.type,success:message.transaction?.success ?? null,height:message.height,transactionHash:message.transaction_hash,blockTime:message.transaction?.block.timestamp ?? null }),seenAt
            );
          });
        });
        const last = data.message[data.message.length - 1];
        cursor = { height:last.height, transaction_hash:last.transaction_hash, index:last.index };
        database.prepare("UPDATE cursor SET last_height=?,last_tx_hash=?,last_index=?,ran_at=? WHERE job='activity'").run(cursor.height,cursor.transaction_hash,cursor.index,seenAt);
      })();
      scanned += data.message.length;
      if (data.message.length < ROW_CAP.message) complete = true;
    }
    database.prepare(`UPDATE cursor SET status=?,ran_at=?,verified_through_height=?,messages_scanned=messages_scanned+?,matches=matches+? WHERE job='activity'`)
      .run(complete ? 'ok' : 'partial',new Date().toISOString(),complete ? Math.max(verifiedBefore,capturedHead) : verifiedBefore,scanned,matches);
    return { scanned,matches,verifiedThrough:complete ? Math.max(verifiedBefore,capturedHead) : verifiedBefore,head:capturedHead };
  } catch (error) {
    database.prepare("UPDATE cursor SET status='error',error=?,ran_at=? WHERE job='activity'").run((error as Error).message,new Date().toISOString());
    throw error;
  } finally { lease.release(); }
}
