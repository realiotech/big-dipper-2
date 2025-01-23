import { useRouter } from 'next/router';
import * as R from 'ramda';
import { useEffect, useState } from 'react';

import {
  GetMessagesByAddressQuery,
  useAccountDelegationsQuery,
  useAccountUndelegationsQuery,
  useBalancesByAddressQuery,
  useGetMessagesByAddressQuery,
} from '@/graphql/types/general_types';

import { convertMsgsToModels } from '@/components/msg/utils';
import type { TransactionState } from '@/components/validators/detail/types';
import { convertMsgType } from '@/utils/convert_msg_type';
import { useRecoilValue } from 'recoil';
import { readFilter } from '@/recoil/transactions_filter';
import type { OverviewType } from './types';
import { convertToEvmAddress } from './utils';

const LIMIT = 50;

const formatTransactions = (data: GetMessagesByAddressQuery): Transactions[] => {
  let formattedData = data.messagesByAddress;
  if (data.messagesByAddress.length === 51) {
    formattedData = data.messagesByAddress.slice(0, 51);
  }
  return formattedData.map((x) => {
    const { transaction } = x;
    const messages = convertMsgsToModels(transaction);
    const msgType = messages.map((eachMsg) => {
      const eachMsgType = eachMsg?.type ?? 'none type';
      return eachMsgType ?? '';
    });
    const convertedMsgType = convertMsgType(msgType);
    return {
      height: transaction?.height,
      hash: transaction?.hash ?? '',
      type: convertedMsgType,
      messages: {
        count: messages.length,
        items: messages,
      },
      success: transaction?.success ?? false,
      timestamp: transaction?.block.timestamp,
    };
  });
};

export function useTransactions() {
  const router = useRouter();
  const [state, setState] = useState<TransactionState>({
    data: [],
    hasNextPage: false,
    isNextPageLoading: true,
    offsetCount: 0,
  });
  const msgTypes = useRecoilValue(readFilter);

  useEffect(() => {
    setState((prevState) => ({
      ...prevState,
      data: [],
      hasNextPage: false,
      isNextPageLoading: true,
      offsetCount: 0,
    }));
  }, [router?.query?.address, msgTypes]);

  const handleSetState = (stateChange: (prevState: TransactionState) => TransactionState) => {
    setState((prevState) => {
      const newState = stateChange(prevState);
      return R.equals(prevState, newState) ? prevState : newState;
    });
  };

  const transactionQuery = useGetMessagesByAddressQuery({
    variables: {
      limit: LIMIT + 1, // to check if more exist
      offset: 0,
      address: `{${router?.query?.address ?? ''}}`,
      types: msgTypes,
    },
    onCompleted: (data) => {
      const itemsLength = data.messagesByAddress.length;
      const newItems = R.uniq([...state.data, ...formatTransactions(data)]);
      const stateChange: TransactionState = {
        data: newItems,
        hasNextPage: itemsLength === 51,
        isNextPageLoading: false,
        offsetCount: state.offsetCount + LIMIT,
      };

      handleSetState((prevState) => ({ ...prevState, ...stateChange }));
    },
  });

  const loadNextPage = async () => {
    handleSetState((prevState) => ({ ...prevState, isNextPageLoading: true }));
    // refetch query
    await transactionQuery
      .fetchMore({
        variables: {
          offset: state.offsetCount,
          limit: LIMIT + 1,
        },
      })
      .then(({ data }) => {
        const itemsLength = data.messagesByAddress.length;
        const newItems = R.uniq([...state.data, ...formatTransactions(data)]);
        const stateChange: TransactionState = {
          data: newItems,
          hasNextPage: itemsLength === 51,
          isNextPageLoading: false,
          offsetCount: state.offsetCount + LIMIT,
        };
        handleSetState((prevState) => ({ ...prevState, ...stateChange }));
      });
  };

  return {
    state,
    loadNextPage,
  };
}

export function useOverview(): OverviewType {
  const router = useRouter()
  const address = router?.query?.address as string

  const [balances, setBalances] = useState([])
  const [completed, setCompleted] = useState(false)

  useBalancesByAddressQuery({
    variables: {
      account: address
    },
    onCompleted: (data) => {
      setCompleted(true)
      setBalances(data.balance)
    },
    onError: (e) => {
      console.error(e)
    }
  })

  return {
    address,
    balances,
    completed,
    evmAddress: convertToEvmAddress(address)
  }
}

export const useStaking = (
  address?: string
) => {
  const [delegationsPage, setDelegationsPage] = useState(0)
  const [unbondingsPage, setUnboningsPage] = useState(0)

  const router = useRouter();

  const accountAddr =
    address ||
    (Array.isArray(router?.query?.address)
      ? router.query.address[0]
      : router?.query?.address ?? '');

  // =====================================
  // delegations
  // =====================================
  const {
    data: delegationsData,
    loading: delegationsLoading,
    error: delegationsError,
    refetch: delegationsRefetch,
  } = useAccountDelegationsQuery({
    variables: {
      address: accountAddr,
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
  } = useAccountUndelegationsQuery({
    variables: {
      address: accountAddr,
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
      count: delegationsData?.locks_count_by_del?.[0].count ?? 0,
      data: delegationsData?.ms_locks ?? [],
      error: delegationsError,
    },
    unbondings: {
      loading: undelegationsLoading,
      count: undelegationsData?.unlocks_count_by_del?.[0].count ?? 0,
      data: undelegationsData?.ms_unlocks ?? [],
      error: undelegationsError,
    },
    delegationsPage,
    unbondingsPage,
    setDelegationsPage,
    setUnboningsPage
  };
};
