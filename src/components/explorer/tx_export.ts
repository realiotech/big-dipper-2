/** Most rows one CSV export may hold. */
export const EXPORT_LIMIT = 50_000;
const EXPORT_PAGE = 1000;

/**
 * Reads pages of `EXPORT_PAGE` rows until a short page comes back or
 * `EXPORT_LIMIT` rows are read. Callers pin the newest height first so rows
 * arriving mid-export do not shift the offsets.
 */
export async function readAllPages<T>(readPage: (offset: number, limit: number) => Promise<T[]>): Promise<T[]> {
  const rows: T[] = [];
  for (let offset = 0; offset < EXPORT_LIMIT; offset += EXPORT_PAGE) {
    const limit = Math.min(EXPORT_PAGE, EXPORT_LIMIT - offset);
    // Pages are read one at a time: each offset depends on the last page being full.
    // eslint-disable-next-line no-await-in-loop
    const page = await readPage(offset, limit);
    rows.push(...page);
    if (page.length < limit) break;
  }
  return rows;
}

/** Keeps the first row for each hash; account queries return one row per message. */
export const uniqueByHash = <T extends { hash: string }>(rows: T[]): T[] => {
  const seen = new Set<string>();
  return rows.filter((row) => !seen.has(row.hash) && seen.add(row.hash));
};
