import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { DB_FILE, LOCK_TTL_MS, WATCHLIST_FILE } from './config';

export const SUSPECTED_SINK = 'realio1uzkdrfnjv53rt0cf4ltszffpd7mvkpd2cv794j';
/** Retired classification: kept only so v3 can remove it from existing stores. */
const RETIRED_SYSTEMIC_COUNTERPARTY = 'realio17xpfvakm2amg962yls6f84z3kell8c5lev82h8';
const SCHEMA_VERSION = 3;
let singleton: Database.Database | null = null;

const SCHEMA = `
CREATE TABLE watchlist (
  address TEXT PRIMARY KEY, added_at TEXT NOT NULL, source TEXT
);
CREATE TABLE watchlist_tag (
  address TEXT NOT NULL, tag TEXT NOT NULL, label TEXT, notes TEXT,
  PRIMARY KEY(address, tag), FOREIGN KEY(address) REFERENCES watchlist(address) ON DELETE CASCADE
) WITHOUT ROWID;
CREATE INDEX watchlist_tag_tag ON watchlist_tag(tag, address);
CREATE TABLE snapshot (
  id INTEGER PRIMARY KEY AUTOINCREMENT, started_at TEXT NOT NULL, finished_at TEXT,
  captured_head_height INTEGER, status TEXT NOT NULL, error TEXT, requests INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE stake_snapshot (
  snapshot_id INTEGER NOT NULL, address TEXT NOT NULL, validator TEXT NOT NULL,
  denom TEXT NOT NULL, amount TEXT NOT NULL, source_height INTEGER,
  PRIMARY KEY(snapshot_id,address,validator,denom)
) WITHOUT ROWID;
CREATE INDEX stake_snapshot_address ON stake_snapshot(snapshot_id,address);
CREATE TABLE unbonding_snapshot (
  snapshot_id INTEGER NOT NULL, address TEXT NOT NULL, validator TEXT NOT NULL,
  denom TEXT NOT NULL, creation_height INTEGER NOT NULL, amount TEXT NOT NULL,
  source_height INTEGER,
  PRIMARY KEY(snapshot_id,address,validator,denom,creation_height)
) WITHOUT ROWID;
CREATE TABLE balance_snapshot (
  snapshot_id INTEGER NOT NULL, address TEXT NOT NULL, denom TEXT NOT NULL,
  amount TEXT NOT NULL, source_height INTEGER,
  PRIMARY KEY(snapshot_id,address,denom)
) WITHOUT ROWID;
CREATE TABLE activity_message (
  height INTEGER NOT NULL, tx_hash TEXT NOT NULL, msg_index INTEGER NOT NULL,
  type TEXT NOT NULL, involved_addresses TEXT NOT NULL, sender_addresses TEXT NOT NULL,
  recipient_addresses TEXT NOT NULL, success INTEGER, value TEXT, block_time TEXT,
  seen_at TEXT NOT NULL, PRIMARY KEY(height,tx_hash,msg_index)
) WITHOUT ROWID;
CREATE INDEX activity_message_order ON activity_message(height DESC,tx_hash DESC,msg_index DESC);
CREATE INDEX activity_message_type ON activity_message(type);
CREATE TABLE activity_match (
  height INTEGER NOT NULL, tx_hash TEXT NOT NULL, msg_index INTEGER NOT NULL,
  address TEXT NOT NULL, tag TEXT NOT NULL,
  direction TEXT NOT NULL CHECK(direction IN ('incoming','outgoing','self','involved')),
  counterparties TEXT NOT NULL,
  PRIMARY KEY(height,tx_hash,msg_index,address),
  FOREIGN KEY(height,tx_hash,msg_index) REFERENCES activity_message(height,tx_hash,msg_index) ON DELETE CASCADE
) WITHOUT ROWID;
CREATE INDEX activity_match_address ON activity_match(address,height DESC);
CREATE INDEX activity_match_tag ON activity_match(tag,height DESC);
CREATE TABLE cursor (
  job TEXT PRIMARY KEY, scan_from_height INTEGER NOT NULL, captured_head_height INTEGER NOT NULL,
  verified_through_height INTEGER NOT NULL, last_height INTEGER NOT NULL,
  last_tx_hash TEXT NOT NULL, last_index INTEGER NOT NULL, ran_at TEXT,
  status TEXT NOT NULL, error TEXT, messages_scanned INTEGER NOT NULL DEFAULT 0,
  matches INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE job_lock (
  job TEXT PRIMARY KEY, owner TEXT NOT NULL, acquired_at INTEGER NOT NULL, expires_at INTEGER NOT NULL
);
CREATE TABLE alert_outbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT, dedupe_key TEXT NOT NULL UNIQUE,
  height INTEGER NOT NULL, tx_hash TEXT NOT NULL, msg_index INTEGER NOT NULL,
  address TEXT NOT NULL, payload TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0, next_attempt_at INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL, delivered_at TEXT, last_error TEXT
);
CREATE INDEX alert_outbox_due ON alert_outbox(state,next_attempt_at,id);
`;

export function migrate(database: Database.Database): void {
  database.pragma('foreign_keys = ON');
  const version = database.pragma('user_version', { simple: true }) as number;
  if (version > SCHEMA_VERSION) throw new Error(`monitor database version ${version} is newer than supported ${SCHEMA_VERSION}`);
  if (version === 0) {
    database.transaction(() => {
      database.exec(SCHEMA);
      database.pragma(`user_version = ${SCHEMA_VERSION}`);
    })();
    return;
  }
  if (version < 2) database.transaction(() => {
    database.exec('DROP INDEX IF EXISTS stake_snapshot_validator');
    database.pragma('user_version = 2');
  })();
  if (version < 3) database.transaction(() => {
    // The systemic-counterparty classification was never a drain receiver and
    // only invited misreading; its tag cascades with the watchlist row.
    database.prepare('DELETE FROM watchlist WHERE address=?').run(RETIRED_SYSTEMIC_COUNTERPARTY);
    database.pragma('user_version = 3');
  })();
}

export function openMonitorDatabase(file = DB_FILE): Database.Database {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const database = new Database(file);
  database.pragma('journal_mode = WAL');
  database.pragma('synchronous = NORMAL');
  migrate(database);
  return database;
}

export function monitorDb(): Database.Database {
  if (!singleton) singleton = openMonitorDatabase();
  return singleton;
}

export function importWatchlist(database = monitorDb()): number {
  const parsed = JSON.parse(fs.readFileSync(WATCHLIST_FILE, 'utf8')) as unknown;
  if (!Array.isArray(parsed)) throw new Error('monitor watchlist must be a JSON array');
  const addresses = [...new Set(parsed.filter((value): value is string =>
    typeof value === 'string' && /^realio1[a-z0-9]{38,58}$/.test(value)
  ))];
  const existing = database.prepare(
    "SELECT COUNT(*) count FROM watchlist_tag WHERE tag='compromised'"
  ).get() as { count: number };
  const hasLabels = database.prepare(
    "SELECT COUNT(*) count FROM watchlist_tag WHERE address=? AND tag='suspected_sink'"
  ).get(SUSPECTED_SINK) as { count: number };
  if (existing.count === addresses.length && hasLabels.count === 1) return addresses.length;
  const now = new Date().toISOString();
  const addAddress = database.prepare('INSERT OR IGNORE INTO watchlist(address,added_at,source) VALUES(?,?,?)');
  const addTag = database.prepare('INSERT OR IGNORE INTO watchlist_tag(address,tag,label,notes) VALUES(?,?,?,?)');
  database.transaction(() => {
    addresses.forEach((address) => {
      addAddress.run(address, now, path.basename(WATCHLIST_FILE));
      addTag.run(address, 'compromised', 'Compromised source list', null);
    });
    addAddress.run(SUSPECTED_SINK, now, 'incident-analysis-v2');
    addTag.run(SUSPECTED_SINK, 'suspected_sink', 'Dominant incident receiver', 'Payload-derived label; attribution is unconfirmed.');
  })();
  return addresses.length;
}

export type Lease = { owner: string; refresh(): void; release(): void };
export function acquireLease(job: string, database = monitorDb(), now = Date.now): Lease {
  const owner = randomUUID();
  const claimed = database.prepare(
    `INSERT INTO job_lock(job,owner,acquired_at,expires_at) VALUES(?,?,?,?)
     ON CONFLICT(job) DO UPDATE SET owner=excluded.owner, acquired_at=excluded.acquired_at,
       expires_at=excluded.expires_at WHERE job_lock.expires_at <= excluded.acquired_at`
  ).run(job, owner, now(), now() + LOCK_TTL_MS).changes;
  if (!claimed) throw new Error(`monitor job ${job} is already running`);
  return {
    owner,
    refresh() {
      const changed = database.prepare('UPDATE job_lock SET expires_at=? WHERE job=? AND owner=?')
        .run(now() + LOCK_TTL_MS, job, owner).changes;
      if (!changed) throw new Error(`monitor job ${job} lost its lease`);
    },
    release() { database.prepare('DELETE FROM job_lock WHERE job=? AND owner=?').run(job, owner); },
  };
}

export function compromisedAddresses(database = monitorDb()): string[] {
  return (database.prepare("SELECT address FROM watchlist_tag WHERE tag='compromised' ORDER BY address").all() as { address: string }[])
    .map((row) => row.address);
}

export function latestSnapshotId(database = monitorDb()): number | null {
  const row = database.prepare("SELECT id FROM snapshot WHERE status='ok' ORDER BY id DESC LIMIT 1").get() as { id: number } | undefined;
  return row?.id ?? null;
}
