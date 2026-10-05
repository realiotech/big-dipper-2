import * as R from 'ramda';
import { useApolloClient } from '@apollo/client';
import {
  TransactionsExportDocument,
  TransactionsExportQuery,
  TransactionsFilteredDocument,
  TransactionsFilteredQuery,
  useLatestTransactionsListenerSubscription,
  useTransactionsCountQuery,
  useTransactionsFilteredCountQuery,
  useTransactionsFilteredQuery,
  useTransactionsPageQuery,
} from '@/graphql/types/general_types';
import { usePageParam } from '@/components/explorer/pager';
import { rangeFilePart, transactionWhere, TxFilters, useTxFilters } from '@/components/explorer/tx_filters';
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

/**
 * Count variables for the filters. Counting "not EVM" directly is slow, so
 * Cosmos counts are all matches minus the EVM ones.
 */
const countVariables = (filters: TxFilters) =>
  filters.source === 'cosmos'
    ? { where: transactionWhere(filters, 'all'), evmWhere: transactionWhere(filters, 'evm'), subtractEvm: true }
    : { where: transactionWhere(filters), subtractEvm: false };

/**
 * Transactions are paged with offsets below an anchor height: the newest
 * height seen, frozen while browsing older pages so rows do not shift as new
 * transactions arrive. Page 1 follows the chain live. With any filter set the
 * list comes from a filtered query instead.
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

  const where = useMemo(() => transactionWhere(filters), [filters]);
  const filtered = useTransactionsFilteredQuery({
    variables: { where, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE },
    skip: !active,
  });
  const filteredRows = useMemo(() => filtered.data?.transactions.map(toTxRow) ?? [], [filtered.data]);
  const filteredCount = useTransactionsFilteredCountQuery({ variables: countVariables(filters), skip: !active });
  const counts = filteredCount.data;
  const matching = counts ? (counts.total.aggregate?.count ?? 0) - (counts.evm?.aggregate?.count ?? 0) : null;

  if (active) {
    return {
      items: filteredRows,
      loading: filtered.loading,
      total: matching ?? 0,
      matching,
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
export const useTransactionsExport = (filters: TxFilters) => {
  const client = useApolloClient();

  return useCallback(async () => {
    const where = transactionWhere(filters);
    const top = await client.query<TransactionsFilteredQuery>({ query: TransactionsFilteredDocument, variables: { where, limit: 1 } });
    if (top.errors?.length) throw new Error(top.errors[0].message);
    const anchor = top.data.transactions[0]?.height;
    if (anchor === undefined) return 0;

    const pinned = { _and: [where, { height: { _lte: anchor } }] };
    const rows = await readAllPages(async (offset, limit) => {
      const result = await client.query<TransactionsExportQuery>({
        query: TransactionsExportDocument,
        variables: { where: pinned, limit, offset },
      });
      if (result.errors?.length) throw new Error(result.errors[0].message);
      return result.data.transactions;
    });

    const scope = [filters.source, filters.type].filter(Boolean).join('_');
    downloadCsv(buildTxCsv(rows), `transactions_${scope}_${rangeFilePart(filters.range)}.csv`);
    return rows.length;
  }, [client, filters]);
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
