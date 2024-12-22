import { useState } from 'react';
import * as R from 'ramda';
import {
  useTokenPriceHistoryQuery,
} from '@/graphql/types/general_types';
import { chainConfig } from '@/configs';
import dayjs from '@/utils/dayjs';
import numeral from 'numeral';
import { HeroState } from './types';

export const useHero = () => {
  const [state, setState] = useState<HeroState>({
    loading: true,
    exists: true,
    tokenPriceHistory: [],
  });

  const handleSetState = (stateChange: any) => {
    setState((prevState) => R.mergeDeepLeft(stateChange, prevState));
  };

  useTokenPriceHistoryQuery({
    variables: {
      limit: 10,
      denom: chainConfig?.tokenUnits[chainConfig.primaryTokenUnit]?.display,
    },
    onCompleted: (data) => {
      const newState: any = {
        loading: false,
      };

      if (data.tokenPrice.length === 10) {
        newState.tokenPriceHistory = data.tokenPrice.reverse().map((x) => {
          return ({
            time: x.timestamp,
            value: x.price,
          });
        });
      }
      handleSetState(newState);
    },
    onError: (() => {
      handleSetState({
        loading: false,
      });
    }),
  });

  return {
    state,
  };
};

export const usePrice = () => {
  const formatTime = (time: dayjs.Dayjs, mode: 'locale' | 'utc' = 'locale') => {
    if (mode === 'utc') {
      return time.format('HH:mm');
    }

    return time.local().format('HH:mm');
  };

  const tickPriceFormatter = (num: number) => {
    return `$${numeral(num).format('0,0.[00]')}`;
  };

  return {
    tickPriceFormatter,
    formatTime,
  };
};
