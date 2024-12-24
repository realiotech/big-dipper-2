import { type AtomState } from '@/recoil/market/types';
import { formatNumber } from '@/utils/format_token';

export const formatMarket = (data: AtomState) => {
    return {
        supply: `${formatNumber(data.supply.value, 2)} ${data.supply.displayDenom.toUpperCase()}`,
        communityPool: `${formatNumber(
            data.communityPool.value,
            2
        )} ${data.communityPool.displayDenom.toUpperCase()}`
    }
};
