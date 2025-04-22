import { useEffect, useState } from 'react';
import {
  useActiveValidatorCountQuery,
  ActiveValidatorCountQuery,
  useMarketDataQuery,
} from '@/graphql/types/general_types';
import { chainConfig } from '@/configs';
import numeral from 'numeral';
import { formatTokenByExponent } from '@/utils';
import Big from 'big.js';

export const useDataStaking = () => {
  const [stakingState, setState] = useState<{
    apr: string;
    inflation: number;
    communityPool: string;
    validators: {
      active: number;
      total: number;
    }
  }>({
    apr: "N/A",
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

  useEffect(() => {
    fetch("https://api.realio.network/realionetwork/mint/v1/annual_provisions")
      .then(res => res.json())
      .then(ap => {
        fetch("https://api.realio.network/cosmos/staking/v1beta1/pool")
          .then(res => res.json())
          .then(bp => {
            const annualProvisions = new Big(ap.annual_provisions)
            const bondedPool = new Big(bp.pool.bonded_tokens)
            setState((prevState) => ({
              ...prevState,
              apr: annualProvisions.div(bondedPool).times(100).toFixed(2),
            }))
          }).catch(e => console.log(e))
      }).catch(e => console.log(e))
  }, [])

  return {
    stakingState,
  };
};
