import * as R from 'ramda';
import { useApolloClient } from '@apollo/client';
import {
  TransactionsByMessageDocument,
  TransactionsByMessageExportDocument,
  TransactionsByMessageExportQuery,
  TransactionsByMessageQuery,
  TransactionsExportDocument,
  TransactionsExportQuery,
  TransactionsFilteredDocument,
  TransactionsFilteredQuery,
  useLatestTransactionsListenerSubscription,
  useTransactionsByMessageCountQuery,
  useTransactionsByMessageQuery,
  useTransactionsCountQuery,
  useTransactionsFilteredCountQuery,
  useTransactionsFilteredQuery,
  useTransactionsPageQuery,
} from '@/graphql/types/general_types';
import { usePageParam } from '@/components/explorer/pager';
import {
  filtersByMessage,
  HeightRange,
  messageFilter,
  rangeFilePart,
  transactionFilter,
  TxFilters,
  useHeightRange,
  useTxFilters,
} from '@/components/explorer/tx_filters';
import { readAllPages } from '@/components/explorer/tx_export';
import { buildTxCsv, downloadCsv } from '@/utils/csv_export';
import { toTxRow, TxRow, txLabel } from '@/utils/tx_label';
import { convertMsgsToModels } from '@/components/msg/utils';
import { TransactionState } from './types';
import { useRouter } from 'next/router';
import { SyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { TransactionDetailsQuery, useTransactionDetailsQuery } from '@/graphql/types/general_types';
import { formatToken } from '@/utils/format_token';
import { load } from 'js-yaml';
import { canonicalizeTendermintTxHash } from '@/utils/canonicalize_tendermint_tx_hash';

export const PAGE_SIZE = 25;
// Upper bound for "the newest transactions" before the latest height is known.
const NEWEST = '9223372036854775807';

type MessageRows = { messages: Array<{ transaction?: Parameters<typeof toTxRow>[0] | null }> };
const messageTransactions = <T,>(data?: { messages: Array<{ transaction?: T | null }> }) =>
  (data?.messages ?? []).flatMap((row) => (row.transaction ? [row.transaction] : []));

/**
 * Transactions are paged with offsets below an anchor height: the newest
 * height seen, frozen while browsing older pages so rows do not shift as new
 * transactions arrive. Page 1 follows the chain live.
 *
 * With filters set, a type or source filter reads the `message` table (one row
 * per transaction) and a time range alone reads `transaction`; both compare
 * block heights resolved from the range.
 */
export const useTransactions = () => {
  const { page, setPage } = usePageParam();
  const { filters, setFilters, active } = useTxFilters();
  const [live, setLive] = useState<TxRow[]>([]);
  const [anchor, setAnchor] = useState<number | null>(null);

  useLatestTransactionsListenerSubscription({
    variables: { limit: PAGE_SIZE },
    skip: active,
    onData: ({ data }) => setLive(data.data?.transactions.map(toTxRow) ?? []),
  });

  const maxHeight = page === 1 ? NEWEST : anchor === null ? null : String(anchor);
  const { data, loading } = useTransactionsPageQuery({
    variables: { maxHeight, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE },
    skip: active || maxHeight === null,
  });
  const queried = useMemo(() => data?.transactions.map(toTxRow) ?? [], [data]);

  const newest = live[0]?.height ?? (page === 1 ? queried[0]?.height : undefined);
  useEffect(() => {
    if (newest && (page === 1 || anchor === null)) setAnchor(newest);
  }, [newest, page, anchor]);

  const { data: countData } = useTransactionsCountQuery({ skip: active });

  const { heights, ready } = useHeightRange(filters.range);
  const byMessage = filtersByMessage(filters);
  const offset = (page - 1) * PAGE_SIZE;
  const messageWhere = useMemo(() => messageFilter(filters, heights), [filters, heights]);
  const txWhere = useMemo(() => transactionFilter(heights), [heights]);
  const skipMessages = !active || !ready || !byMessage;
  const skipTransactions = !active || !ready || byMessage;

  const byMessagePage = useTransactionsByMessageQuery({ variables: { where: messageWhere, limit: PAGE_SIZE, offset }, skip: skipMessages });
  const byMessageCount = useTransactionsByMessageCountQuery({ variables: { where: messageWhere }, skip: skipMessages });
  const byTxPage = useTransactionsFilteredQuery({ variables: { where: txWhere, limit: PAGE_SIZE, offset }, skip: skipTransactions });
  const byTxCount = useTransactionsFilteredCountQuery({ variables: { where: txWhere }, skip: skipTransactions });

  const filteredRows = useMemo(
    () => (byMessage ? messageTransactions(byMessagePage.data as MessageRows | undefined) : byTxPage.data?.transactions ?? []).map(toTxRow),
    [byMessage, byMessagePage.data, byTxPage.data]
  );
  const countResult = byMessage ? byMessageCount.data?.matching : byTxCount.data?.total;
  const matching = countResult ? countResult.aggregate?.count ?? 0 : null;

  if (active) {
    return {
      items: filteredRows,
      loading: !ready || (byMessage ? byMessagePage.loading : byTxPage.loading),
      total: matching ?? 0,
      matching,
      heights,
      page,
      setPage,
      filters,
      setFilters,
    };
  }

  const items = page === 1 && live.length ? live : queried;
  const total = Number(countData?.txs_count?.[0]?.count ?? 0);
  return {
    items,
    loading: items.length === 0 && (loading || maxHeight === null),
    total,
    matching: countData ? total : null,
    heights,
    page,
    setPage,
    filters,
    setFilters,
  };
};

/**
 * Saves every transaction matching the filters as CSV. The newest matching
 * height is pinned first so the pages read stay consistent.
 */
export const useTransactionsExport = (filters: TxFilters, heights: HeightRange | null) => {
  const client = useApolloClient();

  return useCallback(async () => {
    if (filters.range && !heights) throw new Error('the time range is still loading, try again in a moment');
    const byMessage = filtersByMessage(filters);
    const read = async <Q, R>(query: any, variables: object, pick: (data: Q) => R[]) => {
      const result = await client.query<Q>({ query, variables });
      if (result.errors?.length) throw new Error(result.errors[0].message);
      return pick(result.data);
    };

    const where = byMessage ? messageFilter(filters, heights) : transactionFilter(heights);
    const top = byMessage
      ? await read<TransactionsByMessageQuery, { height: any }>(TransactionsByMessageDocument, { where, limit: 1 }, messageTransactions)
      : await read<TransactionsFilteredQuery, { height: any }>(TransactionsFilteredDocument, { where, limit: 1 }, (data) => data.transactions);
    const anchor = top[0]?.height;
    if (anchor === undefined) return 0;

    const pinned = { _and: [where, { height: { _lte: anchor } }] };
    const rows = await readAllPages((offset, limit) =>
      byMessage
        ? read<TransactionsByMessageExportQuery, NonNullable<TransactionsByMessageExportQuery['messages'][number]['transaction']>>(
          TransactionsByMessageExportDocument,
          { where: pinned, limit, offset },
          messageTransactions
        )
        : read<TransactionsExportQuery, TransactionsExportQuery['transactions'][number]>(
          TransactionsExportDocument,
          { where: pinned, limit, offset },
          (data) => data.transactions
        )
    );

    const scope = [filters.source, filters.type].filter(Boolean).join('_');
    downloadCsv(buildTxCsv(rows), `transactions_${scope}_${rangeFilePart(filters.range)}.csv`);
    return rows.length;
  }, [client, filters, heights]);
};

const formatOverview = (data: TransactionDetailsQuery) => {
  const { fee } = data.transaction[0];
  const feeAmount = fee?.amount?.[0] ?? {
    denom: '',
    amount: 0,
  };
  const { success } = data.transaction[0];
  const overview = {
    hash: data.transaction[0].hash,
    height: data.transaction[0].height,
    timestamp: data.transaction[0].block.timestamp,
    fee: formatToken(feeAmount.amount, feeAmount.denom),
    gasUsed: data.transaction[0].gasUsed,
    gasWanted: data.transaction[0].gasWanted,
    success,
    memo: data.transaction[0].memo ?? '',
    error: success ? '' : data.transaction[0].rawLog ?? '',
  };
  return overview;
};

// =============================
// logs
// =============================
const formatLogs = (data: TransactionDetailsQuery) => {
  const { logs } = data.transaction[0];
  return logs;
};

// =============================
// messages
// =============================
const formatMessages = (data: TransactionDetailsQuery) => {
  const messages = convertMsgsToModels(data.transaction[0]);
  return {
    filterBy: 'none',
    viewRaw: false,
    items: messages,
  };
};

// ===============================
// Parse data
// ===============================
const formatTransactionDetails = (data: TransactionDetailsQuery) => {
  const stateChange: Partial<TransactionState> = {
    loading: false,
  };

  if (!data.transaction.length) {
    stateChange.exists = false;
    return stateChange;
  }

  stateChange.overview = formatOverview(data);
  stateChange.logs = formatLogs(data);
  stateChange.messages = formatMessages(data);
  stateChange.rawMessages = data.transaction[0].messages ?? [];
  stateChange.label = txLabel(data.transaction[0].messages);
  return stateChange;
};

export const useTransactionDetails = () => {
  const router = useRouter();
  const txhash = router.query.tx as string;
  // 0x hashes are shown by the EVM transaction page instead.
  const isEvmHash = txhash?.startsWith('0x');

  const [state, setState] = useState<TransactionState>({
    exists: true,
    loading: true,
    overview: {
      hash: '',
      height: 0,
      timestamp: '',
      fee: {
        value: '0',
        displayDenom: '',
        baseDenom: '',
        exponent: 0,
      },
      gasUsed: 0,
      gasWanted: 0,
      success: false,
      memo: '',
      error: '',
    },
    logs: null,
    messages: {
      filterBy: 'none',
      viewRaw: false,
      items: [],
    },
    rawMessages: [],
  });

  const handleSetState = useCallback(
    (stateChange: (prevState: TransactionState) => TransactionState) => {
      setState((prevState) => {
        const newState = stateChange(prevState);
        return R.equals(prevState, newState) ? prevState : newState;
      });
    },
    []
  );

  useEffect(() => {
    handleSetState((prevState) => ({
      ...prevState,
      loading: true,
      exists: true,
    }));
  }, [handleSetState]);

  useTransactionDetailsQuery({
    variables: {
      hash: canonicalizeTendermintTxHash(txhash),
    },
    skip: !router.isReady || isEvmHash,
    onCompleted: (data) => {
      handleSetState((prevState) => ({ ...prevState, ...formatTransactionDetails(data) }));
    },
  });

  const onMessageFilterCallback = useCallback(
    (value: string) => {
      handleSetState((prevState) => ({
        ...prevState,
        messages: {
          filterBy: value,
          viewRaw: prevState.messages.viewRaw,
          items: prevState.messages.items,
        },
      }));
    },
    [handleSetState]
  );

  const toggleMessageDisplay = useCallback(
    (_: SyntheticEvent<HTMLInputElement>, checked: boolean) => {
      handleSetState((prevState) => ({
        ...prevState,
        messages: {
          filterBy: prevState.messages.filterBy,
          viewRaw: checked,
          items: prevState.messages.items,
        },
      }));
    },
    [handleSetState]
  );

  const filterMessages = useCallback(
    (messages: unknown[]) => messages.filter((x) => {
      if (state.messages.filterBy !== 'none') {
        return (x as { category: string }).category === state.messages.filterBy;
      }
      return true;
    }),
    [state.messages.filterBy]
  );

  return {
    state,
    onMessageFilterCallback,
    toggleMessageDisplay,
    filterMessages,
  };
};
