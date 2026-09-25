import { useState } from 'react';
import {
  useLatestTransactionsListenerSubscription,
  LatestTransactionsListenerSubscription,
} from '@/graphql/types/general_types';
import { formatTokenByExponent } from '@/utils';
import { txLabel } from '@/utils/tx_label';
import { TransactionsState } from './types';

const FEE_DENOM = 'ario';
const FEE_DECIMALS = 18;

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

  const formatTransactions = (data: LatestTransactionsListenerSubscription) => {
    return data.transactions.map((x) => {
      const fee = (x.fee?.amount ?? [])
        .filter((coin) => coin.denom === FEE_DENOM)
        .reduce((sum, coin) => sum + parseFloat(formatTokenByExponent(coin.amount, FEE_DECIMALS)), 0);
      return ({
        height: x.height,
        hash: x.hash,
        success: x.success,
        timestamp: x.block.timestamp,
        fee,
        label: txLabel(x.messages),
      });
    });
  };

  return {
    state,
  };
};
