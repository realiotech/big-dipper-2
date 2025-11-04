import { useRouter } from 'next/router';
import * as R from 'ramda';
import { useEffect, useState, useCallback } from 'react';

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
import { realioNetworkToEth } from "@realiotech/address-generator"
import { useEvmBalancesQuery } from '@/graphql/types/subgraph';
import { PageInfo } from '@/components/layout/pagination';

const PAGE_SIZE = 20;

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
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    count: 0, // Will be calculated dynamically
    pageSize: PAGE_SIZE,
    currentPage: 1,
  });
  const [totalCount, setTotalCount] = useState(0); // Track exact count
  const msgTypes = useRecoilValue(readFilter);

  useEffect(() => {
    setState((prevState) => ({
      ...prevState,
      data: [],
      hasNextPage: false,
      isNextPageLoading: true,
      offsetCount: 0,
    }));
    setPageInfo({
      count: 0,
      pageSize: PAGE_SIZE,
      currentPage: 1,
    });
    setTotalCount(0);
  }, [router?.query?.address, msgTypes]);

  const handleSetState = useCallback((stateChange: (prevState: TransactionState) => TransactionState) => {
    setState((prevState) => {
      const newState = stateChange(prevState);
      return R.equals(prevState, newState) ? prevState : newState;
    });
  }, []);

  const transactionQuery = useGetMessagesByAddressQuery({
    variables: {
      limit: PAGE_SIZE + 1, // to check if more exist
      offset: 0,
      address: `{${router?.query?.address ?? ''}}`,
      types: msgTypes,
    },
    onCompleted: (data) => {
      const itemsLength = data.messagesByAddress.length;
      const formattedData = formatTransactions(data);
      const hasNextPage = itemsLength === PAGE_SIZE + 1;

      // Calculate exact count: if we got PAGE_SIZE + 1 items, there are at least PAGE_SIZE + 1
      // Otherwise, the count is exactly what we got
      const exactCount = hasNextPage ? PAGE_SIZE + 1 : itemsLength;

      const stateChange: TransactionState = {
        data: formattedData.slice(0, PAGE_SIZE),
        hasNextPage: hasNextPage,
        isNextPageLoading: false,
        offsetCount: PAGE_SIZE,
      };

      setTotalCount(exactCount);
      setPageInfo((prevPageInfo) => ({
        ...prevPageInfo,
        count: exactCount,
      }));
      handleSetState((prevState) => ({ ...prevState, ...stateChange }));
    },
  });

  const loadPage = (page: number) => {
    handleSetState((prevState) => ({
      ...prevState,
      isNextPageLoading: true,
    }));

    // refetch query
    transactionQuery.refetch({
      offset: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE + 1,
    }).then(({ data }) => {
      const itemsLength = data.messagesByAddress.length;
      const formattedData = formatTransactions(data);
      const hasNextPage = itemsLength === PAGE_SIZE + 1;

      // Update total count based on current page and items found
      const currentPageStart = (page - 1) * PAGE_SIZE;
      const newTotalCount = hasNextPage
        ? currentPageStart + PAGE_SIZE + 1
        : currentPageStart + itemsLength;

      const stateChange: TransactionState = {
        data: formattedData.slice(0, PAGE_SIZE),
        hasNextPage: hasNextPage,
        isNextPageLoading: false,
        offsetCount: currentPageStart + PAGE_SIZE,
      };

      setTotalCount(newTotalCount);
      setPageInfo((prevPageInfo) => ({
        ...prevPageInfo,
        count: newTotalCount,
      }));
      handleSetState((prevState) => ({ ...prevState, ...stateChange }));
    }).catch((error) => {
      console.error('Error loading page:', error);
      handleSetState((prevState) => ({
        ...prevState,
        isNextPageLoading: false,
      }));
    });
  };

  const handlePageChange = (e: any) => {
    loadPage(e.page);
    setPageInfo((prevPageInfo) => ({
      ...prevPageInfo,
      currentPage: e.page,
    }));
  };

  return {
    state,
    pageInfo,
    handlePageChange,
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
    evmAddress: realioNetworkToEth(address)
  }
}

export const useStaking = (
  address?: string
) => {
  const [sortDirection, setSortDirection] = useState("desc")
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
      limit: 100,
      offset: 0,
      order: sortDirection
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
      limit: 100,
      offset: 0,
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
    setSortDirection(sortDirt)
  }

  return {
    delegations: {
      loading: delegationsLoading,
      count: delegationsData?.locks_count_by_del?.[0].count ?? 0,
      data: delegationsData?.get_ms_locks_sorted ?? [],
      error: delegationsError,
    },
    unbondings: {
      loading: undelegationsLoading,
      count: undelegationsData?.unlocks_count_by_del?.[0].count ?? 0,
      data: undelegationsData?.get_ms_unlocks_sorted ?? [],
      error: undelegationsError,
    },
    sortDirection,
    handleSort
  };
};

export const useErc20Balances = (
  evmAddress?: string
) => {
  const [balances, setBalances] = useState([])

  useEvmBalancesQuery({
    context: {
      apiName: "subgraph"
    },
    variables: {
      address: evmAddress
    },
    onCompleted: (data) => {
      setBalances(data.erc20Balances)
    },
    onError: (e) => {
      console.error(e)
    }
  })
  return balances;
};

// Hook to get ERC20 balance using direct balanceOf JSON RPC call
export const useErc20SpendableBalance = (
  evmAddress?: string,
  contractAddress?: string
) => {
  const [spendableBalance, setSpendableBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!evmAddress || !contractAddress) {
      setSpendableBalance('0');
      return;
    }

    const fetchBalanceOf = async () => {
      try {
        setLoading(true);
        setError(null);

        // ERC20 balanceOf function signature: balanceOf(address)
        const functionSignature = '0x70a08231'; // balanceOf(address)
        const paddedAddress = evmAddress.slice(2).padStart(64, '0'); // Remove 0x and pad to 32 bytes
        const data = functionSignature + paddedAddress;

        // Make JSON RPC call to the testnet endpoint
        const response = await fetch(process.env.NEXT_PUBLIC_JSON_RPC_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [
              {
                to: contractAddress,
                data: data,
              },
              'latest'
            ],
            id: 1,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.error) {
          throw new Error(result.error.message);
        }

        // Convert hex result to decimal string
        const balanceHex = result.result;
        const balanceDecimal = BigInt(balanceHex || '0x0').toString();

        setSpendableBalance(balanceDecimal);
      } catch (err) {
        console.error('Error fetching ERC20 balance:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setSpendableBalance('0');
      } finally {
        setLoading(false);
      }
    };

    fetchBalanceOf();
  }, [evmAddress, contractAddress]);

  return { balance: spendableBalance, loading, error };
};