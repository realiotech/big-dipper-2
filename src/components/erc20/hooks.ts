import { useEffect, useState } from "react";
import { OverviewState } from "./type";
import { useEvmAssetBurnsQuery, useEvmAssetHoldersQuery, useEvmAssetMintsQuery, useEvmAssetOverviewQuery, useEvmAssetTransfersQuery } from "@/graphql/types/subgraph_types";
import { useAssetDelegationsQuery, useAssetUndelegationsQuery } from "@/graphql/types/general_types";

export function useOverview(address: string) {
  const [state, setState] = useState<OverviewState>({ id: "", name: "", denom: "", supply: '0', holders: 0, decimals: 18 })
  useEvmAssetOverviewQuery({
    context: {
      apiName: "subgraph"
    },
    variables: {
      address: address
    },
    onCompleted: (data) => {
      setState({
        id: data.erc20Contract.id,
        name: data.erc20Contract.name,
        denom: data.erc20Contract.symbol,
        decimals: data.erc20Contract.decimals,
        supply: data.erc20Contract.totalSupply.value,
        holders: data.erc20Contract.holders
      })
    },
  })
  return {
    state,
  }
}

export const useHolders = (address) => {
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
      address,
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
      count: balancesData?.erc20Contract?.holders ?? 0,
      data: balancesData?.erc20Balances ?? [],
      error: balancesErr,
    },
    page,
    setPage,
  }
}

export const useActivities = (address) => {
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
      address,
      offset: transferPage * 20,
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
      address,
      offset: mintPage * 20,
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
      address,
      offset: burnPage * 20,
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
      count: transferData?.erc20Contract?.transfersCount ?? 0,
      data: transferData?.erc20Transfers ?? [],
      error: transferError,
    },
    mint: {
      loading: mintLoading,
      count: mintData?.erc20Contract?.mintCount ?? 0,
      data: mintData?.erc20Transfers ?? [],
      error: mintError,
    },
    burn: {
      loading: burnLoading,
      count: burnData?.erc20Contract?.burnCount ?? 0,
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

export const useStaking = (
  address?: string
) => {
  const [delegationsPage, setDelegationsPage] = useState(0)
  const [unbondingsPage, setUnboningsPage] = useState(0)
  const [sortDirection, setSortDirection] = useState("desc")

  // For ERC20 tokens, format the denom as erc20:address
  const denom = address ? `erc20:${address}` : undefined;

  const {
    data: delegationsData,
    loading: delegationsLoading,
    error: delegationsError,
    refetch: delegationsRefetch,
  } = useAssetDelegationsQuery({
    variables: {
      denom,
      limit: 10,
      offset: delegationsPage * 10,
      order: sortDirection
    },
  });
  useEffect(() => {
    if (delegationsLoading) return;
    if (delegationsError) {
      delegationsRefetch();
    }
  }, [delegationsError, delegationsLoading, delegationsRefetch]);

  const {
    data: undelegationsData,
    loading: undelegationsLoading,
    error: undelegationsError,
    refetch: undelegationsRefetch,
  } = useAssetUndelegationsQuery({
    variables: {
      denom,
      limit: 10,
      offset: unbondingsPage * 10,
      order: sortDirection
    },
  });
  useEffect(() => {
    if (undelegationsLoading) return;
    if (undelegationsError) {
      undelegationsRefetch();
    }
  }, [undelegationsError, undelegationsLoading, undelegationsRefetch]);

  const handleSort = (sortDirt) => {
    setDelegationsPage(0)
    setUnboningsPage(0)
    setSortDirection(sortDirt)
  }

  return {
    delegations: {
      loading: delegationsLoading,
      count: delegationsData?.locks_count_by_denom?.[0].count ?? 0,
      data: delegationsData?.get_ms_locks_sorted ?? [],
      error: delegationsError,
    },
    unbondings: {
      loading: undelegationsLoading,
      count: undelegationsData?.unlocks_count_by_denom?.[0].count ?? 0,
      data: undelegationsData?.get_ms_unlocks_sorted ?? [],
      error: undelegationsError,
    },
    delegationsPage,
    unbondingsPage,
    setDelegationsPage,
    setUnboningsPage,
    sortDirection,
    handleSort
  };
};
