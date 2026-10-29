import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useRecoilValue } from 'recoil';
import {
  useEvmAssetBurnsQuery,
  useEvmAssetHoldersQuery,
  useEvmAssetMintsQuery,
  useEvmAssetOverviewQuery,
  useEvmAssetTransfersQuery,
} from '@/graphql/types/subgraph_types';
import { useAssetDelegationsQuery, useAssetsOverviewQuery, useAssetUndelegationsQuery } from '@/graphql/types/general_types';
import { readAssets } from '@/recoil/asset';
import { PAGE_SIZE } from '@/components/assets/parts';

export type TransferKind = 'transfers' | 'mints' | 'burns';

export type TransferRow = { hash: string; from: string; to: string; amount: number; timestamp: string };

const subgraph = { context: { apiName: 'subgraph' } };

type SubgraphTransfer = { value: unknown; timestamp: unknown; transaction: { id: string }; from?: { id: unknown } | null; to?: { id: unknown } | null };

const toTransferRow = (row: SubgraphTransfer): TransferRow => ({
  hash: row.transaction.id,
  from: String(row.from?.id ?? ''),
  to: String(row.to?.id ?? ''),
  amount: Number(row.value ?? 0),
  timestamp: new Date(Number(row.timestamp) * 1000).toISOString(),
});

/**
 * An ERC-20 token such as DSTRX. The EVM side (supply, holders, transfers)
 * comes from the token's subgraph, which already returns amounts in whole
 * tokens; staking comes from the indexer under the chain denom "erc20:0x…".
 */
export const useErc20Details = () => {
  const router = useRouter();
  const address = String(router.query.address ?? '').toLowerCase();
  const ready = router.isReady && Boolean(address);
  const { assetArr } = useRecoilValue(readAssets);
  // The chain denom keeps the checksum casing, and the indexer matches it exactly.
  const asset = assetArr.find((a) => a.denom.toLowerCase() === `erc20:${address}`);
  const denom = asset?.denom ?? `erc20:${address}`;
  const toTokens = (amount?: string | number | null) => Number(amount ?? 0) / 10 ** (asset?.decimals ?? 18);

  const [holdersPage, setHoldersPage] = useState(1);
  const [pages, setPages] = useState<Record<TransferKind, number>>({ transfers: 1, mints: 1, burns: 1 });
  const [delegationsPage, setDelegationsPage] = useState(1);
  const [unbondingsPage, setUnbondingsPage] = useState(1);
  const pageVars = (page: number) => ({ address, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });

  const { data: overview, loading } = useEvmAssetOverviewQuery({ ...subgraph, variables: { address }, skip: !ready });
  const { data: chain } = useAssetsOverviewQuery({ skip: !ready });
  const holders = useEvmAssetHoldersQuery({ ...subgraph, variables: pageVars(holdersPage), skip: !ready });
  const top = useEvmAssetHoldersQuery({ ...subgraph, variables: { address, limit: 1, offset: 0 }, skip: !ready });
  const transfers = useEvmAssetTransfersQuery({ ...subgraph, variables: pageVars(pages.transfers), skip: !ready });
  const mints = useEvmAssetMintsQuery({ ...subgraph, variables: pageVars(pages.mints), skip: !ready });
  const burns = useEvmAssetBurnsQuery({ ...subgraph, variables: pageVars(pages.burns), skip: !ready });
  const delegations = useAssetDelegationsQuery({
    variables: { denom, limit: PAGE_SIZE, offset: (delegationsPage - 1) * PAGE_SIZE, order: 'desc' },
    skip: !ready,
  });
  const unbondings = useAssetUndelegationsQuery({
    variables: { denom, limit: PAGE_SIZE, offset: (unbondingsPage - 1) * PAGE_SIZE, order: 'desc' },
    skip: !ready,
  });

  return useMemo(() => {
    const contract = overview?.erc20Contract;
    const supply = Number(contract?.totalSupply?.value ?? 0);
    const bonded = toTokens(chain?.bonded?.find((b) => b.denom === denom)?.amount);
    const unbonding = toTokens(chain?.unbonding?.find((b) => b.denom === denom)?.amount);
    const topHolder = top.data?.erc20Balances?.[0];
    const setPage = (kind: TransferKind) => (page: number) => setPages((prev) => ({ ...prev, [kind]: page }));

    return {
      address,
      denom,
      asset,
      loading: loading || !ready,
      exists: loading || !ready || Boolean(contract),
      stakeable: bonded > 0,
      supply,
      holderCount: Number(contract?.holders ?? 0),
      topHolder: String(topHolder?.account?.id ?? ''),
      topHolderShare: supply ? (Number(topHolder?.value ?? 0) / supply) * 100 : 0,
      bonded,
      unbonding,
      holders: {
        loading: holders.loading,
        page: holdersPage,
        setPage: setHoldersPage,
        count: Number(holders.data?.erc20Contract?.holders ?? 0),
        rows: (holders.data?.erc20Balances ?? []).map((row) => ({
          address: String(row.account?.id ?? ''),
          label: '',
          amount: Number(row.value ?? 0),
          share: supply ? (Number(row.value ?? 0) / supply) * 100 : 0,
        })),
      },
      transfers: {
        transfers: {
          loading: transfers.loading,
          page: pages.transfers,
          setPage: setPage('transfers'),
          count: Number(transfers.data?.erc20Contract?.transfersCount ?? 0),
          rows: (transfers.data?.erc20Transfers ?? []).map(toTransferRow),
        },
        mints: {
          loading: mints.loading,
          page: pages.mints,
          setPage: setPage('mints'),
          count: Number(mints.data?.erc20Contract?.mintCount ?? 0),
          rows: (mints.data?.erc20Transfers ?? []).map(toTransferRow),
        },
        burns: {
          loading: burns.loading,
          page: pages.burns,
          setPage: setPage('burns'),
          count: Number(burns.data?.erc20Contract?.burnCount ?? 0),
          rows: (burns.data?.erc20Transfers ?? []).map(toTransferRow),
        },
      },
      delegations: {
        loading: delegations.loading,
        page: delegationsPage,
        setPage: setDelegationsPage,
        count: Number(delegations.data?.locks_count_by_denom?.[0]?.count ?? 0),
        rows: (delegations.data?.get_ms_locks_sorted ?? []).map((row) => ({
          address: row.staker_addr,
          validator: row.val_addr,
          bondWeight: Number(row.bond_weight ?? 1),
          amount: toTokens(row.amount),
        })),
      },
      unbondings: {
        loading: unbondings.loading,
        page: unbondingsPage,
        setPage: setUnbondingsPage,
        count: Number(unbondings.data?.unlocks_count_by_denom?.[0]?.count ?? 0),
        rows: (unbondings.data?.get_ms_unlocks_sorted ?? []).map((row) => ({
          address: row.staker_addr,
          validator: row.val_addr,
          bondWeight: Number(row.bond_weight ?? 1),
          amount: toTokens(row.amount),
          height: Number(row.creation_height ?? 0),
        })),
      },
    };
    // toTokens only depends on the asset's decimals.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, asset, burns, chain, delegations, delegationsPage, denom, holders, holdersPage, loading, mints, overview, pages, ready, top.data, transfers, unbondings, unbondingsPage]);
};
