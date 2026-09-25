import { useMemo } from "react";
import { useRecoilValue } from "recoil";
import { useSuppliesQuery } from "@/graphql/types/general_types";
import { readAssets } from "@/recoil/asset";
import { readTokens } from "@/recoil/erc20";
import { formatTokenByExponent } from "@/utils";

export type TokenSupply = {
  symbol: string;
  image?: string;
  price: number;
  supply: number;
};

/**
 * Price and supply per token symbol. Native supplies come from the chain
 * (RIO minus the burn address balance), ERC-20 supplies from the subgraph.
 */
export const useTokenSupplies = () => {
  const { data, loading } = useSuppliesQuery();
  const { assetArr, loaded, burnedSupply } = useRecoilValue(readAssets);
  const { tokenArr, loaded: tokensLoaded } = useRecoilValue(readTokens);

  const tokens = useMemo(() => {
    const coins: Array<{ denom: string; amount: string }> = data?.supply?.[0]?.coins ?? [];
    const result: Record<string, TokenSupply> = {};

    assetArr.forEach((asset) => {
      const erc20 = tokenArr.find((token) => token.symbol === asset.symbol);
      let supply = Number(erc20?.supply ?? 0);
      const coin = coins.find((item) => item.denom === asset.denom);
      if (coin) {
        supply = parseFloat(formatTokenByExponent(coin.amount, asset.decimals));
        if (asset.denom === "ario") {
          supply -= parseFloat(formatTokenByExponent(burnedSupply, asset.decimals));
        }
      }
      result[asset.symbol] = { symbol: asset.symbol, image: asset.image, price: asset.price, supply };
    });
    return result;
  }, [data, assetArr, tokenArr, burnedSupply]);

  return { tokens, loading: loading || !loaded || !tokensLoaded };
};
