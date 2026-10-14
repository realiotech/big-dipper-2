import type Database from 'better-sqlite3';
import { ALERT_RETENTION_DAYS, SNAPSHOT_RETENTION } from './config';
import { acquireLease, monitorDb } from './db';

export type PruneResult = {
  removedSnapshots: number;
  removedRows: number;
  removedAlerts: number;
  /** Oldest snapshot id kept, or null when nothing was old enough to remove. */
  keptFrom: number | null;
};

const SNAPSHOT_TABLES = ['stake_snapshot', 'unbonding_snapshot', 'balance_snapshot'] as const;

/**
 * Drops superseded staking snapshots. Activity evidence is never touched: only
 * the periodic stake/unbonding/balance captures and alerts already delivered.
 */
export function pruneSnapshots(options: {
  keep?: number;
  alertDays?: number;
  database?: Database.Database;
  /** Set false only when the caller already owns the stake lease. */
  lease?: boolean;
} = {}): PruneResult {
  const keep = Math.max(2, options.keep ?? SNAPSHOT_RETENTION);
  const alertDays = Math.max(0, options.alertDays ?? ALERT_RETENTION_DAYS);
  const database = options.database ?? monitorDb();
  const empty: PruneResult = { removedSnapshots: 0, removedRows: 0, removedAlerts: 0, keptFrom: null };
  // A sweep in flight is still writing into its own snapshot id, so take the
  // same lease it uses rather than racing it.
  const lease = options.lease === false ? null : acquireLease('stake', database);
  try {
    const oldestKept = database
      .prepare("SELECT id FROM snapshot WHERE status='ok' ORDER BY id DESC LIMIT 1 OFFSET ?")
      .get(keep - 1) as { id: number } | undefined;
    const alertCutoff = alertDays > 0
      ? database.prepare("DELETE FROM alert_outbox WHERE state='delivered' AND delivered_at IS NOT NULL AND delivered_at < datetime('now', ?)")
      : null;
    if (!oldestKept) {
      if (!alertCutoff) return empty;
      return { ...empty, removedAlerts: alertCutoff.run(`-${alertDays} days`).changes };
    }
    return database.transaction((): PruneResult => {
      const removedRows = SNAPSHOT_TABLES.reduce(
        (total, table) => total + database.prepare(`DELETE FROM ${table} WHERE snapshot_id<?`).run(oldestKept.id).changes,
        0
      );
      const removedSnapshots = database.prepare('DELETE FROM snapshot WHERE id<?').run(oldestKept.id).changes;
      const removedAlerts = alertCutoff ? alertCutoff.run(`-${alertDays} days`).changes : 0;
      return { removedSnapshots, removedRows, removedAlerts, keptFrom: oldestKept.id };
    })();
  } finally {
    lease?.release();
  }
}

/** Reclaims file space after a prune. Cannot run inside a transaction. */
export function compactDatabase(database: Database.Database = monitorDb()): void {
  database.exec('VACUUM');
  database.pragma('wal_checkpoint(TRUNCATE)');
}
