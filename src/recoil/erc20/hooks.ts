import type { AtomState } from '@/recoil/erc20/types';
import { useRecoilState, SetterOrUpdater } from 'recoil';
import { writeTokens } from './selectors';
import { useEffect } from 'react';
import { useApolloClient } from '@apollo/client';
import { EvmAssetOverviewDocument } from '@/graphql/types/subgraph_types';

export const useTokenRecoil = () => {
  const [_, setTokens] = useRecoilState(writeTokens) as [
    AtomState,
    SetterOrUpdater<AtomState>
  ];
  const apolloClient = useApolloClient();

  useEffect(() => {
    const fetchTokensWithSupplyData = async () => {
      try {
        // First, fetch basic token metadata
        const response = await fetch("/api/erc20");
        const tokensData = await response.json();

        // Create initial token map and array
        var tokenMap = {}
        var newData = []
        tokensData.forEach((item: any, idx: number) => {
          let convertedItem = { ...item, idx: idx }
          tokenMap[item.address] = convertedItem
          newData.push(convertedItem)
        })

        // Fetch supply data for each token from subgraph in parallel
        const supplyPromises = tokensData.map(async (token: any) => {
          try {
            const result = await apolloClient.query({
              query: EvmAssetOverviewDocument,
              variables: { address: token.address },
              context: { apiName: "subgraph" },
              fetchPolicy: 'no-cache'
            });

            if (result.data?.erc20Contract) {
              return {
                address: token.address,
                supply: result.data.erc20Contract.totalSupply.value,
                holders: result.data.erc20Contract.holders
              };
            }
          } catch (error) {
            console.warn(`Failed to fetch supply data for ${token.address}:`, error);
          }
          return { address: token.address, supply: '0', holders: 0 };
        });

        // Wait for all supply data to be fetched
        const supplyResults = await Promise.all(supplyPromises);

        // Merge supply data with token metadata
        supplyResults.forEach(supplyData => {
          if (tokenMap[supplyData.address]) {
            tokenMap[supplyData.address] = {
              ...tokenMap[supplyData.address],
              supply: supplyData.supply,
              holders: supplyData.holders
            };
          }
        });

        // Update the array with the enhanced data
        newData = newData.map(token => tokenMap[token.address]);
        newData.sort((a, b) => a.idx - b.idx);

        setTokens({ tokenArr: newData, tokenMap: tokenMap, loaded: true });
      } catch (e) {
        console.log("can not fetch token data", e);
        setTokens({ tokenArr: [], tokenMap: {}, loaded: true });
      }
    };

    fetchTokensWithSupplyData();
  }, [apolloClient]);
}
