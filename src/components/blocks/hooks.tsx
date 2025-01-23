import * as R from 'ramda';
import { useCallback, useState, useEffect } from 'react';
import {
  BlocksListenerSubscription,
  useBlocksListenerSubscription,
  useBlocksQuery,
  BlockDetailsQuery, useBlockDetailsQuery,
} from '@/graphql/types/general_types';
import { useRouter } from 'next/router';
import type { BlocksState, BlockType, BlockDetailState } from './types';
import numeral from 'numeral';
import { convertMsgsToModels } from '@/components/msg/utils';
import { convertMsgType } from '@/utils/convert_msg_type';
import { PageInfo } from "../layout/pagination";

const MAX_BLOCKS = 500 * 20
const PAGE_SIZE = 20

// This is a bandaid as it can get extremely
// expensive if there is too much data
/**
 * Helps remove any possible duplication
 * and sorts by height in case it bugs out
 */
const uniqueAndSort = R.pipe(
  R.uniqBy((r: BlockType) => r?.height),
  R.sort(R.descend((r) => r?.height))
);

const formatBlocks = (data: BlocksListenerSubscription): BlockType[] => {
  let formattedData = data.blocks;
  if (data.blocks.length === 51) {
    formattedData = data.blocks.slice(0, 51);
  }
  return (
    formattedData?.map((x) => {
      const proposerAddress = x?.validator?.validatorInfo?.operatorAddress ?? '';
      return {
        height: x.height,
        txs: x.txs ?? 0,
        hash: x.hash,
        timestamp: x.timestamp,
        proposer: proposerAddress,
      };
    }) ?? []
  );
};

export const useBlocks = () => {
  const [state, setState] = useState<BlocksState>({
    loading: true,
    exists: true,
    items: [],
    hasNextPage: false,
    isNextPageLoading: true,
    oldestHeight: null,
  });
  const [pageInfo, SetPageInfo] = useState<PageInfo>({
    count: MAX_BLOCKS,
    pageSize: 20,
    currentPage: 1,
  })

  const handlePageChange = (e) => {
    loadPage(e.page);
    SetPageInfo({
      ...pageInfo,
      currentPage: e.page,
    });
  }

  const handleSetState = useCallback((stateChange: (prevState: BlocksState) => BlocksState) => {
    setState((prevState) => {
      const newState = stateChange(prevState);
      return R.equals(prevState, newState) ? prevState : newState;
    });
  }, []);

  // ================================
  // block subscription
  // ================================
  useBlocksListenerSubscription({
    variables: {
      limit: 1,
      offset: 0,
    },
    onData: (data) => {
      if (pageInfo.currentPage === 1) {
        const newBlocks = data.data.data ? formatBlocks(data.data.data) : [];
        const newItems = uniqueAndSort([...newBlocks, ...state.items]);
  
        handleSetState((prevState) => ({
          ...prevState,
          loading: false,
          items: newItems.slice(0, PAGE_SIZE),
        }));
      }
    },
  });

  // ================================
  // block query
  // ================================
  let blockQuery = useBlocksQuery({
    variables: {
      limit: PAGE_SIZE,
      offset: 0,
    },
    onCompleted: (data) => {
      const blocks = formatBlocks(data);
      const oldestBlock = blocks[blocks.length - 1];
      handleSetState((prevState) => ({
        ...prevState,
        loading: false,
        items: uniqueAndSort([...blocks]),
        hasNextPage: blocks.length === PAGE_SIZE,
        isNextPageLoading: false,
        oldestHeight: oldestBlock?.height ?? null,
      }));
    },
    onError: () => {
      handleSetState((prevState) => ({ ...prevState, loading: false }));
    },
  });

  const loadPage = (page: number) => {
    handleSetState((prevState) => ({ ...prevState, loading: true, isNextPageLoading: true }));

    blockQuery.refetch({
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }).then(({ data }) => {
      const blocks = formatBlocks(data);
      const oldestBlock = blocks[blocks.length - 1];
      handleSetState((prevState) => ({
        ...prevState,
        loading: false,
        items: uniqueAndSort([...blocks]),
        hasNextPage: blocks.length === PAGE_SIZE,
        isNextPageLoading: false,
        oldestHeight: oldestBlock?.height ?? null,
      }));
    });
  };

  return {
    state,
    loadPage,
    pageInfo,
    handlePageChange,
    isItemLoaded: (index: number) =>
      !state.hasNextPage || index < state.items.length,
  };
};

export const useBlockDetails = () => {
  const router = useRouter();
  const [state, setState] = useState<BlockDetailState>({
    loading: true,
    exists: true,
    overview: {
      height: 0,
      hash: '',
      txs: 0,
      timestamp: '',
      proposer: '',
    },
    signatures: [],
    transactions: [],
  });

  const handleSetState = useCallback(
    (stateChange: (prevState: BlockDetailState) => BlockDetailState) => {
      setState((prevState) => {
        const newState = stateChange(prevState);
        return R.equals(prevState, newState) ? prevState : newState;
      });
    },
    []
  );

  // ==========================
  // Fetch Data
  // ==========================
  useBlockDetailsQuery({
    variables: {
      height: numeral(router.query.height).value(),
      signatureHeight: (numeral(router.query.height).value() ?? 0) + 1,
    },
    onCompleted: (data) => {
      handleSetState((prevState) => ({ ...prevState, ...formatRaws(data) }));
    },
  });

  useEffect(() => {
    // reset every call
    handleSetState((prevState) => ({
      ...prevState,
      loading: true,
      exists: true,
    }));
  }, [handleSetState]);

  return {
    state,
  };
};

// ==========================
// Overview
// ==========================
const formatOverview = (data: BlockDetailsQuery) => {
  const proposerAddress = data?.block?.[0]?.validator?.validatorInfo?.operatorAddress ?? '';
  const overview = {
    height: data.block[0].height,
    hash: data.block[0].hash,
    txs: data.block[0].txs ?? 0,
    timestamp: data.block[0].timestamp,
    proposer: proposerAddress,
  };
  return overview;
};

// ==========================
// Signatures
// ==========================
const formatSignatures = (data: BlockDetailsQuery) => {
  const signatures = data.preCommits
    .filter((x) => x?.validator?.validatorInfo)
    .map((x) => x?.validator?.validatorInfo?.operatorAddress ?? '');
  return signatures;
};

// ==========================
// Transactions
// ==========================
const formatTransactions = (data: BlockDetailsQuery, stateChange: Partial<BlockDetailState>) => {
  const transactions = data.transaction.map((x) => {
    const messages = convertMsgsToModels(x);
    const msgType = messages.map((eachMsg) => {
      const eachMsgType = eachMsg?.type ?? 'none type';
      return eachMsgType ?? '';
    });
    const convertedMsgType = convertMsgType(msgType);
    return {
      type: convertedMsgType,
      height: x.height,
      hash: x.hash,
      success: x.success,
      timestamp: stateChange.overview?.timestamp ?? '',
      messages: {
        count: x.messages.length,
        items: messages,
      },
    };
  });

  return transactions;
};

function formatRaws(data: BlockDetailsQuery) {
  const stateChange: Partial<BlockDetailState> = {
    loading: false,
  };

  if (!data.block.length) {
    stateChange.exists = false;
    return stateChange;
  }

  stateChange.overview = formatOverview(data);
  stateChange.signatures = formatSignatures(data);
  stateChange.transactions = formatTransactions(data, stateChange);

  return stateChange;
}
