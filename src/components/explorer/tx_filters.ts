import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { EVM_MSG_TYPES, txTypeOption } from '@/utils/tx_types';
import { useBlockHeightRangeQuery } from '@/graphql/types/general_types';

export type TxSource = 'all' | 'evm' | 'cosmos';

/** A picked time range. `to` is the last minute included, as set in the picker. */
export type TimeRange = { from: Date; to: Date };

export type TxFilters = {
  source: TxSource;
  /** A `TX_TYPE_GROUPS` option value, or null for all types. */
  type: string | null;
  range: TimeRange | null;
};

const parseDate = (value: unknown): Date | null => {
  if (typeof value !== 'string' || !value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toParam = (date: Date) => date.toISOString().replace(/\.\d{3}Z$/, 'Z');

/**
 * Transaction filters kept in the URL (`?source=&type=&from=&to=`), so a
 * filtered view can be linked and survives reloads.
 */
export const useTxFilters = () => {
  const router = useRouter();
  const { source: sourceParam, type: typeParam, from: fromParam, to: toQuery } = router.query;

  const filters = useMemo<TxFilters>(() => {
    const source: TxSource = sourceParam === 'evm' || sourceParam === 'cosmos' ? sourceParam : 'all';
    const type = txTypeOption(String(typeParam ?? '')) ? String(typeParam) : null;
    const from = parseDate(fromParam);
    const to = parseDate(toQuery);
    return { source, type, range: from && to && from <= to ? { from, to } : null };
  }, [sourceParam, typeParam, fromParam, toQuery]);

  const setFilters = useCallback(
    (patch: Partial<TxFilters>) => {
      const next = { ...filters, ...patch };
      const query = { ...router.query };
      delete query.page;
      if (next.source !== 'all') query.source = next.source;
      else delete query.source;
      if (next.type) query.type = next.type;
      else delete query.type;
      if (next.range) {
        query.from = toParam(next.range.from);
        query.to = toParam(next.range.to);
      } else {
        delete query.from;
        delete query.to;
      }
      router.push({ pathname: router.pathname, query }, undefined, { shallow: true, scroll: false });
    },
    [filters, router]
  );

  const active = filters.source !== 'all' || filters.type !== null || filters.range !== null;
  return { filters, setFilters, active };
};

// Block timestamps are stored as UTC without a zone.
const hasuraTime = (date: Date) => date.toISOString().replace(/Z$/, '');

/** Bounds for a `block.timestamp` comparison; the range's last minute is included. */
export const timestampBounds = (range: TimeRange) => ({
  _gte: hasuraTime(range.from),
  _lt: hasuraTime(dayjs(range.to).add(1, 'minute').toDate()),
});

/** Block heights a time range covers, inclusive (see `useHeightRange`). */
export type HeightRange = { from: number; to: number };

/** Variables for `BlockHeightRange`: the blocks just before each end of the range. */
export const heightRangeVariables = (range: TimeRange) => {
  const bounds = timestampBounds(range);
  return { before: bounds._gte, until: bounds._lt };
};

/**
 * Heights from `BlockHeightRange`: the range starts after the last block before
 * it and ends at the last block inside it. An empty range comes out with
 * `from > to`, which matches nothing.
 */
export const heightRangeFrom = (data: { before: { height: any }[]; last: { height: any }[] }): HeightRange => ({
  from: Number(data.before[0]?.height ?? 0) + 1,
  to: Number(data.last[0]?.height ?? 0),
});

/**
 * Message types a filter keeps, or null when it keeps every transaction. An
 * EVM transaction holds a single MsgEthereumTx, so the EVM tab is those types
 * and the Cosmos tab every other type.
 */
const messageTypeMatch = (filters: TxFilters): Record<string, string[]> | null => {
  const option = txTypeOption(filters.type);
  const isEvm = (type: string) => EVM_MSG_TYPES.includes(type);
  if (filters.source === 'evm') return { _in: option ? option.types.filter(isEvm) : EVM_MSG_TYPES };
  if (filters.source === 'cosmos') return option ? { _in: option.types.filter((type) => !isEvm(type)) } : { _nin: EVM_MSG_TYPES };
  return option ? { _in: option.types } : null;
};

/**
 * Whether the filters select by message (type or source). Those are read from
 * the `message` table, one row per transaction, through the `message ->
 * transaction` relationship every callisto Hasura has; a time range alone reads
 * `transaction` directly.
 */
export const filtersByMessage = (filters: TxFilters) => messageTypeMatch(filters) !== null;

const heightBounds = (heights: HeightRange) => ({ _gte: heights.from, _lte: heights.to });

/** `message` filter: the kept types, within the range's heights. */
export const messageFilter = (filters: TxFilters, heights: HeightRange | null) => {
  const where: Record<string, unknown> = {};
  const type = messageTypeMatch(filters);
  if (type) where.type = type;
  if (heights) where.height = heightBounds(heights);
  return where;
};

/** `transaction` filter for a time range alone. */
export const transactionFilter = (heights: HeightRange | null) => (heights ? { height: heightBounds(heights) } : {});

/**
 * The block heights a time range covers. Filters compare heights rather than
 * joining each row to its block's time: `block.timestamp` is not indexed on
 * every Hasura, and the join is several times slower on mainnet.
 */
export const useHeightRange = (range: TimeRange | null) => {
  const variables = useMemo(() => (range ? heightRangeVariables(range) : null), [range]);
  const { data } = useBlockHeightRangeQuery({ variables: variables ?? { before: '', until: '' }, skip: !variables });
  const heights = useMemo(() => (data ? heightRangeFrom(data) : null), [data]);
  return { heights, ready: !range || heights !== null };
};

/** `types` argument of `messages_by_address`, a Postgres text array literal. */
export const messageTypesArg = (filters: TxFilters) => `{${txTypeOption(filters.type)?.types.join(',') ?? ''}}`;

/** Extra `where` for `messages_by_address` rows. */
export const messageWhere = (filters: TxFilters) =>
  filters.range ? { transaction: { block: { timestamp: timestampBounds(filters.range) } } } : {};

/** "2026-09-29_to_2026-10-05", or "all" without a range. */
export const rangeFilePart = (range: TimeRange | null) =>
  range ? `${dayjs(range.from).format('YYYY-MM-DD')}_to_${dayjs(range.to).format('YYYY-MM-DD')}` : 'all';
