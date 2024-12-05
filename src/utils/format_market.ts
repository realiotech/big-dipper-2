import { formatNumber } from '@utils/format_token';

export const formatMarket = (data: {
    marketCap: number;
    communityPool: TokenUnit;
    supply: TokenUnit;
    inflation: number;
    apr: number;
}) => {
    return ({
        supply: `${formatNumber(data.supply.value, 2)} ${data.supply.displayDenom.toUpperCase()}`,
        communityPool: `${formatNumber(data.communityPool.value, 2)} ${data.communityPool.displayDenom.toUpperCase()}`
    })
};
