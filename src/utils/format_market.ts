import type { AtomState } from '@/recoil/market/types';
import { formatNumber } from './format_token';
import numeral from 'numeral';

export const formatMarket = (data: AtomState) => {
    return {
        supply: `${formatNumber(data.supply.value, 2)} ${data.supply.displayDenom.toUpperCase()}`,
        communityPool: `${numeral(data.communityPool.value).format(
            '0,0.00'
        )} ${data.communityPool.displayDenom.toUpperCase()}`
    }
};
