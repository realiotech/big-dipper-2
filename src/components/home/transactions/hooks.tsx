import { useState } from 'react';
import {
  useLatestTransactionsListenerSubscription,
  LatestTransactionsListenerSubscription,
} from '@/graphql/types/general_types';
import { toTxRow } from '@/utils/tx_label';
import { TransactionsState } from './types';

export const useTransactions = (limit = 8) => {
  const [state, setState] = useState<TransactionsState>({
    loading: true,
    items: [],
  });

  // ================================
  // txs subscription
  // ================================
  useLatestTransactionsListenerSubscription({
    variables: { limit },
    onData: ({ data }) => {
      setState({
        loading: false,
        items: data.data ? formatTransactions(data.data) : [],
      });
    },
  });

  const formatTransactions = (data: LatestTransactionsListenerSubscription) => data.transactions.map(toTxRow);

  return {
    state,
  };
};
