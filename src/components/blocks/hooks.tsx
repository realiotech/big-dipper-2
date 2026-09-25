import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import numeral from 'numeral';
import {
  BlocksByHeightQuery,
  BlockDetailsQuery,
  useBlockDetailsQuery,
  useBlocksByHeightQuery,
  useLatestBlocksListenerSubscription,
  useOldestBlocksQuery,
} from '@/graphql/types/general_types';
import { usePageParam } from '@/components/explorer/pager';
import { formatTokenByExponent } from '@/utils';
import { txLabel } from '@/utils/tx_label';
import type { BlockType, BlockDetailState, BlockTransaction } from './types';

export const PAGE_SIZE = 25;
// Upper bound for "the newest blocks" before the latest height is known.
const NEWEST = '9223372036854775807';

const formatBlocks = (data?: BlocksByHeightQuery): BlockType[] =>
  data?.blocks.map((x) => ({
    height: Number(x.height),
    txs: x.txs ?? 0,
    hash: x.hash,
    timestamp: x.timestamp,
    gasUsed: Number(x.totalGas ?? 0),
    proposer: x?.validator?.validatorInfo?.operatorAddress ?? '',
  })) ?? [];

/**
 * Blocks are paged by height rather than offset: the indexer holds every
 * height from its oldest block on, so page N starts at
 * `anchor - (N - 1) * PAGE_SIZE`. That stays fast on the last page, where an
 * offset scan over millions of rows would not. The anchor is the newest height
 * seen, frozen while browsing older pages so rows do not shift as blocks arrive.
 */
export const useBlocks = () => {
  const { page, setPage } = usePageParam();
  const [live, setLive] = useState<BlockType[]>([]);
  const [anchor, setAnchor] = useState<number | null>(null);

  useLatestBlocksListenerSubscription({
    variables: { limit: PAGE_SIZE },
    onData: ({ data }) => setLive(formatBlocks(data.data)),
  });

  const maxHeight = page === 1 ? NEWEST : anchor === null ? null : String(anchor - (page - 1) * PAGE_SIZE);
  const { data, loading } = useBlocksByHeightQuery({
    variables: { maxHeight, limit: PAGE_SIZE },
    skip: maxHeight === null,
  });
  const queried = useMemo(() => formatBlocks(data), [data]);

  const newest = live[0]?.height ?? (page === 1 ? queried[0]?.height : undefined);
  useEffect(() => {
    // Follow the chain on page 1; keep the anchor fixed on older pages.
    if (newest && (page === 1 || anchor === null)) setAnchor(newest);
  }, [newest, page, anchor]);

  // The indexer does not start at genesis, so count from its oldest block.
  const { data: oldestData } = useOldestBlocksQuery({ variables: { limit: 1 } });
  const oldest = Number(oldestData?.blocks[0]?.height ?? 0);

  const items = page === 1 && live.length ? live : queried;

  return {
    items,
    loading: items.length === 0 && (loading || maxHeight === null),
    total: anchor && oldest ? anchor - oldest + 1 : 0,
    page,
    setPage,
  };
};

// ==========================
// Block detail
// ==========================
const FEE_DENOM = 'ario';
const FEE_DECIMALS = 18;

const formatTransactions = (data: BlockDetailsQuery): BlockTransaction[] =>
  data.transaction.map((x) => ({
    hash: x.hash,
    success: x.success,
    label: txLabel(x.messages),
    fee: (x.fee?.amount ?? [])
      .filter((coin) => coin.denom === FEE_DENOM)
      .reduce((sum, coin) => sum + parseFloat(formatTokenByExponent(coin.amount, FEE_DECIMALS)), 0),
    gasUsed: Number(x.gasUsed ?? 0),
    gasWanted: Number(x.gasWanted ?? 0),
  }));

export const useBlockDetails = () => {
  const router = useRouter();
  const height = numeral(router.query.height).value() ?? 0;
  const [state, setState] = useState<BlockDetailState>({
    loading: true,
    exists: true,
    overview: { height: 0, hash: '', txs: 0, timestamp: '', proposer: '', gasUsed: 0 },
    signatures: [],
    transactions: [],
  });

  useBlockDetailsQuery({
    variables: { height, signatureHeight: height + 1 },
    skip: !router.isReady,
    onCompleted: (data) => {
      const block = data.block[0];
      if (!block) {
        setState((prev) => ({ ...prev, loading: false, exists: false }));
        return;
      }
      setState({
        loading: false,
        exists: true,
        overview: {
          height: Number(block.height),
          hash: block.hash,
          txs: block.txs ?? 0,
          timestamp: block.timestamp,
          proposer: block.validator?.validatorInfo?.operatorAddress ?? '',
          gasUsed: Number(block.totalGas ?? 0),
        },
        signatures: data.preCommits
          .map((x) => x?.validator?.validatorInfo?.operatorAddress)
          .filter(Boolean) as string[],
        transactions: formatTransactions(data),
      });
    },
  });

  useEffect(() => {
    // Reset when moving to the previous or next block.
    setState((prev) => ({ ...prev, loading: true, exists: true }));
  }, [height]);

  return { state, height };
};
