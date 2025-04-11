import { useEffect, useState } from "react";
import { OverviewState } from "./type";
import { useEvmAssetBurnsQuery, useEvmAssetHoldersQuery, useEvmAssetMintsQuery, useEvmAssetOverviewQuery, useEvmAssetTransfersQuery } from "@/graphql/types/subgraph_types";

export function useOverview() {
  const [state, setState] = useState<OverviewState>({ id: "", name: "", denom: "", supply: '0', holders: 0, decimals: 18 })
  useEvmAssetOverviewQuery({
    context: {
      apiName: "subgraph"
    },
    variables: {
      address: "0xcc2bcda0674252bc65b185eb25c31fe7157ad30a"
    },
    onCompleted: (data) => {
      setState({
        id: data.erc20Contract.id,
        name: data.erc20Contract.name,
        denom: data.erc20Contract.symbol,
        decimals: data.erc20Contract.decimals,
        supply: data.erc20Contract.totalSupply.value,
        holders: 100
      })
    },
  })
  return {
    state,
  }
}

export const useHolders = () => {
  const [page, setPage] = useState(0)
  const {
    data: balancesData,
    loading: balancesLoading,
    error: balancesErr,
    refetch,
  } = useEvmAssetHoldersQuery({
    context: {
      apiName: "subgraph"
    },
    variables: {
      limit: 20,
      offset: 20 * page,
    },
  });
  useEffect(() => {
    if (balancesLoading) return;
    if (balancesErr) {
      refetch();
    }

  }, [balancesErr, balancesLoading, refetch]);
  return {
    holderState: {
      loading: balancesLoading,
      count: 100,
      data: balancesData?.erc20Balances ?? [],
      error: balancesErr,
    },
    page,
    setPage,
  }
}

export const useActivities = () => {
  const [transferPage, setTransferPage] = useState(0)
  const [mintPage, setMintPage] = useState(0)
  const [burnPage, setBurnPage] = useState(0)

  const {
    data: transferData,
    loading: transferLoading,
    error: transferError,
    refetch: transferRefetch,
  } = useEvmAssetTransfersQuery({
    context: {
      apiName: "subgraph"
    },
    variables: {
      offset: transferPage * 10,
      limit: 20
    },
  });
  useEffect(() => {
    if (transferLoading) return;
    if (transferError) {
      transferRefetch();
    }
  }, [transferError, transferLoading, transferRefetch]);

  const {
    data: mintData,
    loading: mintLoading,
    error: mintError,
    refetch: mintRefetch,
  } = useEvmAssetMintsQuery({
    context: {
      apiName: "subgraph"
    },
    variables: {
      offset: mintPage * 10,
      limit: 20
    },
  });
  useEffect(() => {
    if (mintLoading) return;
    if (mintError) {
      mintRefetch();
    }
  }, [mintError, mintLoading, mintRefetch]);

  const {
    data: burnData,
    loading: burnLoading,
    error: burnError,
    refetch: burnRefetch,
  } = useEvmAssetBurnsQuery({
    context: {
      apiName: "subgraph"
    },
    variables: {
      offset: burnPage * 10,
      limit: 20
    },
  });
  useEffect(() => {
    if (burnLoading) return;
    if (burnError) {
      burnRefetch();
    }
  }, [burnError, burnLoading, burnRefetch]);

  return {
    transfer: {
      loading: transferLoading,
      count: 100,
      data: transferData?.erc20Transfers ?? [],
      error: transferError,
    },
    mint: {
      loading: mintLoading,
      count: 100,
      data: mintData?.erc20Transfers ?? [],
      error: mintError,
    },
    burn: {
      loading: burnLoading,
      count: 100,
      data: burnData?.erc20Transfers ?? [],
      error: burnError,
    },
    transferPage,
    mintPage,
    burnPage,
    setTransferPage,
    setMintPage,
    setBurnPage,
  };
};
