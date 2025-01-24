import { useEffect, useState, useCallback } from "react";
import { AssetHoldersQuery, useAssetDelegationsQuery, useAssetHoldersQuery, useAssetOverviewQuery, useAssetUndelegationsQuery } from "@/graphql/types/general_types";
import { useRouter } from "next/router";
import { OverviewState, HolderState, Holder } from "./type";
import { PageInfo } from "../layout/pagination";
import * as R from 'ramda';

export function useOverview() {
  const router = useRouter()
  const denom = router?.query?.denom as string
  const [state, setState] = useState<OverviewState>({ denom, supply: '0', holders: 0 })
  const [maxHolders, setMaxHolders] = useState(0)

  useEffect(() => {
    if (state?.holders > 1000) {
        setMaxHolders(1000)
    } else {
        setMaxHolders(state?.holders)
    }
}, [state])

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
    maxHolders,
    denom,
  }
}

const formatHolders = (data: AssetHoldersQuery): Holder[] => {
  return data?.balance?.map((x) => {
    return {
      address: x?.address,
      balance: x?.amount,
    }
  }) ?? []
}

export const useHolders = (maxHolder: number) => {
  const router = useRouter()
  const denom = router?.query?.denom as string

  const [holderState, setHolderState] = useState<HolderState>({ loading: false,  holders: [] })
  const [pageInfo, SetPageInfo] = useState<PageInfo>({
    count: 0,
    pageSize: 20,
    currentPage: 1,
  })

  useEffect(() => {
    SetPageInfo({
      ...pageInfo,
      count: maxHolder,
    })
  }, [maxHolder])

  const handleSetState = useCallback((stateChange: (prevState: HolderState) => HolderState) => {
    setHolderState((prevState) => {
      const newState = stateChange(prevState);
      return R.equals(prevState, newState) ? prevState : newState;
    });
  }, []);

  const handlePageChange = (e) => {
    loadPage(e.page);
    SetPageInfo({
      ...pageInfo,
      currentPage: e.page,
    });
  }

  const holderQuery = useAssetHoldersQuery({
    variables: {
      denom,
      limit: 20,
      offset: 0,
    },
    onCompleted: (data) => {
      handleSetState((prevState) => ({
        ...prevState,
        loading: false,
        holders: [...formatHolders(data)],
      }));
    },
    onError: (e) => {
      handleSetState((prevState) => ({ ...prevState, loading: false }));
      console.log("error", e)
    }
  })

  const loadPage = (page: number) => {
    handleSetState((prevState) => ({ ...prevState, loading: true}));

    holderQuery.refetch({
      limit: 20,
      offset: (page - 1) * 20,
    }).then(({ data }) => {
      console.log(data, pageInfo)
      handleSetState((prevState) => ({
        ...prevState,
        loading: false,
        holders: [...formatHolders(data)],
      }));
    });
  }

  return {
    holderState,
    loadPage,
    pageInfo,
    handlePageChange,
  }
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
