import type { AtomState } from '@/recoil/erc20/types';
import { useRecoilState, SetterOrUpdater } from 'recoil';
import { writeTokens } from './selectors';
import { useEffect, useState } from 'react';
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
          tokenMap[item.address.toLowerCase()] = convertedItem
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
          const tokenKey = supplyData.address.toLowerCase();
          if (tokenMap[tokenKey]) {
            const token = {
              ...tokenMap[tokenKey],
              supply: supplyData.supply,
              holders: supplyData.holders
            };
            tokenMap[token.address] = token;
            tokenMap[token.address.toLowerCase()] = token;
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

// Hook to ensure a specific token is loaded (for detail pages)
export const useEnsureTokenLoaded = (address: string) => {
  const [tokensState, setTokens] = useRecoilState(writeTokens) as [
    AtomState,
    SetterOrUpdater<AtomState>
  ];
  const apolloClient = useApolloClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;

    // Check if token is already loaded
    const existingToken = tokensState.tokenMap[address];
    if (existingToken) {
      // Token already exists, no need to load
      setLoading(false);
      setError(null);
      return;
    }

    const loadSingleToken = async () => {
      setLoading(true);
      setError(null);

      try {
        // First, try to fetch from the ERC20 API to get basic metadata
        const response = await fetch("/api/erc20");
        const tokensData = await response.json();
        const tokenMetadata = tokensData.find((token: any) =>
          token.address.toLowerCase() === address.toLowerCase()
        );

        if (!tokenMetadata) {
          throw new Error(`Token with address ${address} not found`);
        }

        // Fetch supply data from subgraph
        const result = await apolloClient.query({
          query: EvmAssetOverviewDocument,
          variables: { address: address },
          context: { apiName: "subgraph" },
          fetchPolicy: 'no-cache'
        });

        const supplyData = result.data?.erc20Contract ? {
          supply: result.data.erc20Contract.totalSupply.value,
          holders: result.data.erc20Contract.holders
        } : { supply: '0', holders: 0 };

        // Create the complete token item
        const tokenItem = {
          ...tokenMetadata,
          idx: 0, // Single token doesn't need proper index
          ...supplyData
        };

        // Update recoil state with this single token
        setTokens(prevState => ({
          ...prevState,
          tokenMap: {
            ...prevState.tokenMap,
            [address]: tokenItem
          },
          tokenArr: prevState.tokenArr.some(t => t.address === address)
            ? prevState.tokenArr
            : [...prevState.tokenArr, tokenItem]
        }));

      } catch (e) {
        console.error("Failed to load token data:", e);
        setError(e instanceof Error ? e.message : "Failed to load token data");
      } finally {
        setLoading(false);
      }
    };

    loadSingleToken();
  }, [address, apolloClient, setTokens, tokensState.tokenMap]);

  return { loading, error };
}
