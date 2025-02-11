import { useState } from 'react';
import {
  useActiveValidatorCountQuery,
  ActiveValidatorCountQuery,
  useMarketDataQuery,
} from '@/graphql/types/general_types';
import { chainConfig } from '@/configs';
import numeral from 'numeral';
import { formatToken, formatTokenByExponent } from '@/utils';

export const useDataStaking = () => {
  const [state, setState] = useState<{
    inflation: number;
    communityPool: string;
    validators: {
      active: number;
      total: number;
    }
  }>({
    inflation: 0.0,
    communityPool: "",
    validators: {
      active: 0,
      total: 0,
    },
  });

  useMarketDataQuery({
    onCompleted: (data) => {
      setState((prevState) => ({
        ...prevState,
        inflation: formatInflation(data?.inflation?.[0].params?.inflation_rate),
        communityPool: formatCommunityPool(data?.communityPool?.[0].coins?.[0])
      }));
    },
  });

  const formatInflation = (data) => {
    return parseFloat(data) * 100
  };

  const formatCommunityPool = (data) => {
    return `${numeral(formatTokenByExponent(data.amount, chainConfig.tokenUnits?.[data.denom]?.exponent)).format("0,0.00")} ${chainConfig.tokenUnits?.[data.denom]?.display?.toUpperCase()}`
  };

  useActiveValidatorCountQuery({
    onCompleted: (data) => {
      setState((prevState) => ({
        ...prevState,
        validators: formatActiveValidatorsCount(data),
      }));
    },
  });

  const formatActiveValidatorsCount = (data: ActiveValidatorCountQuery) => {
    return {
      active: data.activeTotal.aggregate.count,
      total: data.total.aggregate.count,
    };
  };

  return {
    state,
  };
};
