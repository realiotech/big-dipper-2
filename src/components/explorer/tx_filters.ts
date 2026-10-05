import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { EVM_MSG_TYPES, txTypeOption } from '@/utils/tx_types';

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

const EVM_MATCH = { messagesByPartitionIdTransactionHash: { type: { _in: EVM_MSG_TYPES } } };

/** `transaction` filter for the given filters. The source can be overridden, for counting. */
export const transactionWhere = (filters: TxFilters, source: TxSource = filters.source) => {
  const and: Record<string, unknown>[] = [];
  if (filters.range) and.push({ block: { timestamp: timestampBounds(filters.range) } });
  const option = txTypeOption(filters.type);
  if (option) and.push({ messagesByPartitionIdTransactionHash: { type: { _in: option.types } } });
  if (source === 'evm') and.push(EVM_MATCH);
  if (source === 'cosmos') and.push({ _not: EVM_MATCH });
  return { _and: and };
};

/** `types` argument of `messages_by_address`, a Postgres text array literal. */
export const messageTypesArg = (filters: TxFilters) => `{${txTypeOption(filters.type)?.types.join(',') ?? ''}}`;

/** Extra `where` for `messages_by_address` rows. */
export const messageWhere = (filters: TxFilters) =>
  filters.range ? { transaction: { block: { timestamp: timestampBounds(filters.range) } } } : {};

/** "2026-09-29_to_2026-10-05", or "all" without a range. */
export const rangeFilePart = (range: TimeRange | null) =>
  range ? `${dayjs(range.from).format('YYYY-MM-DD')}_to_${dayjs(range.to).format('YYYY-MM-DD')}` : 'all';
