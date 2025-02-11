import { useState } from 'react';
import * as R from 'ramda';
import numeral from 'numeral';
import {
  useLatestBlockHeightListenerSubscription,
  useAverageBlockTimeQuery,
  AverageBlockTimeQuery,
  useTokenPriceListenerSubscription,
  TokenPriceListenerSubscription,
  useActiveValidatorCountQuery,
  ActiveValidatorCountQuery,
  useTransactionsCountQuery,
} from '@/graphql/types/general_types';
import { chainConfig } from '@/configs';

export const useDataBlocks = () => {
  const [state, setState] = useState<{
    blockHeight: number;
    blockTime: number;
    txsCount: number;
  }>({
    blockHeight: 0,
    blockTime: 0,
    txsCount: 0
  });

  // ====================================
  // block height
  // ====================================

  useLatestBlockHeightListenerSubscription({
    onSubscriptionData: (data) => {
      setState((prevState) => ({
        ...prevState,
        blockHeight: R.pathOr(0, ['height', 0, 'height'], data.subscriptionData.data),
      }));
    },
  });

  // ====================================
  // block time
  // ====================================
  useAverageBlockTimeQuery({
    onCompleted: (data) => {
      setState((prevState) => ({
        ...prevState,
        blockTime: formatAverageBlockTime(data),
      }));
    },
  });

  const formatAverageBlockTime = (data: AverageBlockTimeQuery) => {
    return data.averageBlockTime[0]?.averageTime ?? state.blockTime;
  };
  // ====================================
  // validators
  // ====================================
  useTransactionsCountQuery({
    onCompleted: (data) => {
      setState((prevState) => ({
        ...prevState,
        txsCount: data.txs_count[0].count,
      }));
    },
  });

  return {
    state,
  };
};
