import { useEffect, useState } from "react";
import { useAssetDelegationsQuery, useAssetOverviewQuery, useAssetUndelegationsQuery } from "@/graphql/types/general_types";
import { useRouter } from "next/router";
import { OverviewState } from "./type";

export function useOverview() {
    const router = useRouter()
    const denom = router?.query?.denom as string
    const [state, setState] = useState<OverviewState>({ denom, supply: '0', holders: 0})

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
    return state
}

export const useStaking = (
    denom?: string
) => {
  const [delegationsPage, setDelegationsPage] = useState(0)
  const [unbondingsPage, setUnboningsPage] = useState(0)

  // =====================================
  // delegations
  // =====================================
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
    },
  });
  useEffect(() => {
    if (delegationsLoading) return;
    if (delegationsError) {
      delegationsRefetch();
    }
  }, [delegationsError, delegationsLoading, delegationsRefetch]);

  // =====================================
  // unbondings
  // =====================================
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
    },
  });
  useEffect(() => {
    if (undelegationsLoading) return;
    if (undelegationsError) {
      undelegationsRefetch();
    }
  }, [undelegationsError, undelegationsLoading, undelegationsRefetch]);
  return {
    delegations: {
      loading: delegationsLoading,
      count: delegationsData?.locks_count_by_denom?.[0].count ?? 0,
      data: delegationsData?.ms_locks ?? [],
      error: delegationsError,
    },
    unbondings: {
      loading: undelegationsLoading,
      count: undelegationsData?.unlocks_count_by_denom?.[0].count ?? 0,
      data: undelegationsData?.ms_unlocks ?? [],
      error: undelegationsError,
    },
    delegationsPage,
    unbondingsPage,
    setDelegationsPage,
    setUnboningsPage
  };
};
