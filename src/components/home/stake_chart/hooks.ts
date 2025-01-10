import { useState } from 'react';
import * as R from 'ramda';
import {
    useMultistakingQuery,
} from '@/graphql/types/general_types';
import { HeroState, StakeValueMap } from './types';

export const useHero = () => {
    const [state, setState] = useState<HeroState>({
        loading: true,
        bonded: {},
        unbonding: {},
    });

    useMultistakingQuery({
        onCompleted: (data) => {
            var bonded: StakeValueMap = {}
            var unbonding: StakeValueMap = {}
            data.token_bonded.forEach(item => {
                bonded[item.denom] = item.amount
            })
            data.token_unbonding.forEach(item => {
                unbonding[item.denom] = item.amount
            })
            const newState: HeroState = {
                loading: false,
                bonded: bonded,
                unbonding: unbonding
            };
            setState(newState);
        },
        onError: (() => {
            setState({
                loading: false,
                bonded: {},
                unbonding: {}
            });
        }),
    });

    return {
        state,
    };
};
