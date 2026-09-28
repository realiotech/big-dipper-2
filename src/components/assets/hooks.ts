import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useRecoilValue } from 'recoil';
import { chainConfig } from '@/configs';
import {
  useAssetDelegationsQuery,
  useAssetHoldersQuery,
  useAssetOverviewQuery,
  useAssetsOverviewQuery,
  useAssetUndelegationsQuery,
} from '@/graphql/types/general_types';
import { readAssets } from '@/recoil/asset';
import { PAGE_SIZE } from './parts';

// Module account names from the chain config: "Bonded_tokens_pool" -> "Bonded tokens pool Module".
export const MODULE_LABELS: Record<string, string> = Object.fromEntries(
  (chainConfig.moduleAccounts ?? []).map((m: { name: string; address: string }) => [m.address, `${m.name.replace(/_/g, ' ')} Module`])
);

/** The URL uses the display name (/assets/rio); the chain uses the base denom (ario). */
const useDenom = () => {
  const router = useRouter();
  const { assetArr } = useRecoilValue(readAssets);
  const param = String(router.query.denom ?? '');
  const prefixed = `a${param}`;
  return { ready: router.isReady && Boolean(param), denom: assetArr.some((a) => a.denom === prefixed) ? prefixed : param };
};

export const useAssetDetails = () => {
  const { denom, ready } = useDenom();
  const { assetMap } = useRecoilValue(readAssets);
  const asset = assetMap[denom];
  const decimals = asset?.decimals ?? 18;
  const toTokens = (amount?: string | number | null) => Number(amount ?? 0) / 10 ** decimals;

  const { data: overview, loading } = useAssetOverviewQuery({ variables: { denom }, skip: !ready });
  const { data: chain } = useAssetsOverviewQuery({ skip: !ready });

  const [holdersPage, setHoldersPage] = useState(1);
  const [delegationsPage, setDelegationsPage] = useState(1);
  const [unbondingsPage, setUnbondingsPage] = useState(1);

  const holders = useAssetHoldersQuery({
    variables: { denom, limit: PAGE_SIZE, offset: (holdersPage - 1) * PAGE_SIZE, order_by: 'desc' },
    skip: !ready,
  });
  const delegations = useAssetDelegationsQuery({
    variables: { denom, limit: PAGE_SIZE, offset: (delegationsPage - 1) * PAGE_SIZE, order: 'desc' },
    skip: !ready,
  });
  const unbondings = useAssetUndelegationsQuery({
    variables: { denom, limit: PAGE_SIZE, offset: (unbondingsPage - 1) * PAGE_SIZE, order: 'desc' },
    skip: !ready,
  });
  // The largest holder, for "top holder share", independent of the holders page shown.
  const top = useAssetHoldersQuery({ variables: { denom, limit: 1, offset: 0, order_by: 'desc' }, skip: !ready });

  return useMemo(() => {
    const supply = toTokens(overview?.supply_by_denom?.[0]?.amount);
    const bonded = toTokens(chain?.bonded?.find((b) => b.denom === denom)?.amount);
    const unbonding = toTokens(chain?.unbonding?.find((b) => b.denom === denom)?.amount);
    const topHolder = top.data?.get_balance_sorted?.[0];

    return {
      denom,
      asset,
      loading: loading || !ready,
      exists: loading || !ready || Boolean(asset) || Number(overview?.supply_by_denom?.[0]?.amount ?? 0) > 0,
      stakeable: bonded > 0,
      supply,
      holderCount: Number(overview?.token_holder?.[0]?.num_holder ?? 0),
      topHolderShare: supply ? (toTokens(topHolder?.amount) / supply) * 100 : 0,
      topHolder: topHolder?.address ?? '',
      bonded,
      unbonding,
      liquid: Math.max(supply - bonded - unbonding, 0),
      snapshotHeight: Number(chain?.supply?.[0]?.height ?? 0),
      holders: {
        loading: holders.loading,
        page: holdersPage,
        setPage: setHoldersPage,
        count: Number(holders.data?.balance_count?.[0]?.count ?? 0),
        rows: (holders.data?.get_balance_sorted ?? []).map((row) => ({
          address: row.address,
          label: MODULE_LABELS[row.address] ?? '',
          amount: toTokens(row.amount),
          share: supply ? (toTokens(row.amount) / supply) * 100 : 0,
        })),
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
    // toTokens only depends on decimals.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset, chain, decimals, delegations, delegationsPage, denom, holders, holdersPage, loading, overview, ready, top.data, unbondings, unbondingsPage]);
};
