import { useEffect, useState, useCallback } from "react";
import { useAssetDelegationsQuery, useAssetHoldersQuery, useAssetOverviewQuery, useAssetUndelegationsQuery } from "@/graphql/types/general_types";
import { useRouter } from "next/router";
import { OverviewState } from "./type";

export function useOverview() {
  const router = useRouter()
  const denom = router?.query?.denom as string
  const [state, setState] = useState<OverviewState>({ denom, supply: '0', holders: 0 })

  useAssetOverviewQuery({
    variables: {
      denom
    },
    onCompleted: (data) => {
      setState({
        denom,
        supply: data.supply_by_denom?.[0].amount,
        holders: data.token_holder?.[0].num_holder
      })
    },
  })
  return {
    state,
    denom,
  }
}

export const useHolders = (denom: string) => {
  const [page, setPage] = useState(0)
  const [sortDirection, setSortDirection] = useState("desc")

  const {
    data: balancesData,
    loading: balancesLoading,
    error: balancesErr,
    refetch,
  } = useAssetHoldersQuery({
    variables: {
      denom,
      limit: 20,
      offset: 20 * page,
      order_by: sortDirection
    },
  });
  useEffect(() => {
    if (balancesLoading) return;
    if (balancesErr) {
      refetch();
    }
  }, [balancesErr, balancesLoading, refetch]);

  const handleSort = (sortDirt) => {
    setPage(0)
    setSortDirection(sortDirt)
  }

  return {
    holderState: {
      loading: balancesLoading,
      count: balancesData?.balance_count?.[0].count ?? 0,
      data: balancesData?.get_balance_sorted ?? [],
      error: balancesErr,
    },
    page,
    setPage,
    sortDirection,
    handleSort
  }
}

export const useStaking = (
  denom?: string
) => {
  const [delegationsPage, setDelegationsPage] = useState(0)
  const [unbondingsPage, setUnboningsPage] = useState(0)
  const [sortDirection, setSortDirection] = useState("desc")

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
