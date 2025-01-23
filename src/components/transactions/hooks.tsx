import * as R from 'ramda';
import {
  useTransactionsQuery,
  useTransactionsListenerSubscription,
  TransactionsListenerSubscription,
} from '@/graphql/types/general_types';
import { convertMsgsToModels } from '@/components/msg/utils';
import { TransactionsState, TransactionState } from './types';
import { useRouter } from 'next/router';
import { SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { TransactionDetailsQuery, useTransactionDetailsQuery } from '@/graphql/types/general_types';
import { formatToken } from '@/utils/format_token';
import { PageInfo } from "../layout/pagination";
import { load } from 'js-yaml';

const MAX_TXS = 500 * 20
const PAGE_SIZE = 20

export const useTransactions = () => {
  const [state, setState] = useState<TransactionsState>({
    loading: true,
    exists: true,
    hasNextPage: true,
    isNextPageLoading: false,
    items: [],
    oldestHeight: null,
  });
  const [pageInfo, SetPageInfo] = useState<PageInfo>({
    count: MAX_TXS,
    pageSize: 20,
    currentPage: 1,
  })

  const handlePageChange = (e) => {
    loadPage(e.page);
    SetPageInfo({
      ...pageInfo,
      currentPage: e.page,
    });
  }


  const handleSetState = useCallback((stateChange: any) => {
    setState((prevState) => {
      const newState = stateChange(prevState);
      if (R.equals(prevState, newState)) {
        return prevState;
      }
      return newState;
    });
  }, []);

  // This is a bandaid as it can get extremely
  // expensive if there is too much data
  /**
   * Helps remove any possible duplication
   * and sorts by height in case it bugs out
   */
  const uniqueAndSort = R.pipe(
    R.uniqBy((r: Transactions) => r?.hash),
    R.sort(R.descend((r) => r?.height))
  );

  // ================================
  // tx subscription
  // ================================
  useTransactionsListenerSubscription({
    variables: {
      limit: 1,
      offset: 0,
    },
    onSubscriptionData: (data) => {
      if (pageInfo.currentPage === 1) {
        const newTransactions = formatTransactions(data.subscriptionData.data);
        handleSetState((prevState) => ({
          ...prevState,
          loading: false,
          items: uniqueAndSort([...newTransactions, ...prevState.items]).slice(0, PAGE_SIZE),
        }));
      }
    },
  });

  // ================================
  // tx query
  // ================================
  const transactionQuery = useTransactionsQuery({
    variables: {
      limit: PAGE_SIZE,
      offset: 0,
    },
    onError: () => {
      handleSetState((prevState) => ({ ...prevState, loading: false }));
    },
    onCompleted: (data) => {
      const transactions = formatTransactions(data);
      const oldestTx = transactions[transactions.length - 1];

      handleSetState((prevState) => ({
        ...prevState,
        loading: false,
        items: uniqueAndSort([...transactions]),
        hasNextPage: transactions.length === PAGE_SIZE,
        isNextPageLoading: false,
        oldestHeight: oldestTx?.height ?? null,
      }));
    },
  });

  const loadPage = (page: number) => {
    if (!state.oldestHeight) return;

    handleSetState((prevState) => ({
      ...prevState,
      isNextPageLoading: true,
      loading: true,
    }));

    // refetch query
    transactionQuery.refetch({
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }).then(({ data }) => {
      const transactions = formatTransactions(data);
      const oldestTx = transactions[transactions.length - 1];

      // set new state
      handleSetState((prevState) => ({
        ...prevState,
        items: uniqueAndSort([...transactions]),
        isNextPageLoading: false,
        loading: false,
        hasNextPage: transactions.length === MAX_TXS,
        oldestHeight: oldestTx?.height ?? null,
      }));
    });
  };

  const formatTransactions = (data: TransactionsListenerSubscription) => {
    let formattedData = data.transactions;
    if (data.transactions.length === 51) {
      formattedData = data.transactions.slice(0, 51);
    }

    return formattedData.map((x) => {
      const messages = convertMsgsToModels(x);
      return ({
        height: x.height,
        hash: x.hash,
        messages: {
          count: x.messages.length,
          items: messages,
        },
        success: x.success,
        timestamp: x.block.timestamp,
      });
    });
  };

  return {
    state,
    pageInfo,
    handlePageChange,
  };
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
  return stateChange;
};

export const useTransactionDetails = () => {
  const router = useRouter();
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

  // ===============================
  // Fetch data
  // ===============================
  useTransactionDetailsQuery({
    variables: {
      hash: router.query.tx as string,
    },
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
