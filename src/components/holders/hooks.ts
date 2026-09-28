import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { useAssetOverviewQuery, useBalancesOfQuery, useHolderListQuery } from '@/graphql/types/general_types';
import { readAssets } from '@/recoil/asset';
import { MODULE_LABELS } from '@/components/assets/hooks';

export type HolderRow = {
  rank: number;
  address: string;
  label: string;
  isModule: boolean;
  amount: number;
  value: number;
  share: number;
  height: number;
  tokens: string[];
};

/**
 * One page of an asset's holders, largest first, with each holder's other
 * token balances (for the "tokens held" icons) and module-account labels.
 */
export const useHolderList = (denom: string, page: number, pageSize: number) => {
  const { assetMap } = useRecoilValue(readAssets);
  const asset = assetMap[denom];
  const decimals = asset?.decimals ?? 18;

  const { data, loading } = useHolderListQuery({
    variables: { denom, limit: pageSize, offset: (page - 1) * pageSize },
    skip: !denom,
  });
  const { data: overview } = useAssetOverviewQuery({ variables: { denom }, skip: !denom });
  const addresses = useMemo(() => (data?.holders ?? []).map((h) => h.address), [data]);
  const { data: balances } = useBalancesOfQuery({ variables: { addresses }, skip: !addresses.length });

  return useMemo(() => {
    const supply = Number(overview?.supply_by_denom?.[0]?.amount ?? 0) / 10 ** decimals;
    const held = new Map<string, string[]>();
    (balances?.balance ?? []).forEach((b) => {
      const symbol = assetMap[b.denom]?.symbol;
      if (symbol && Number(b.amount) > 0) held.set(b.address, [...(held.get(b.address) ?? []), symbol]);
    });

    const rows: HolderRow[] = (data?.holders ?? []).map((h, index) => {
      const amount = Number(h.amount) / 10 ** decimals;
      return {
        rank: (page - 1) * pageSize + index + 1,
        address: h.address,
        label: MODULE_LABELS[h.address] ?? '',
        isModule: Boolean(MODULE_LABELS[h.address]),
        amount,
        value: amount * (asset?.price ?? 0),
        share: supply ? (amount / supply) * 100 : 0,
        height: Number(h.height ?? 0),
        tokens: held.get(h.address) ?? [],
      };
    });
    const heights = rows.map((r) => r.height).filter(Boolean);

    return {
      asset,
      loading,
      rows,
      supply,
      count: Number(data?.count?.[0]?.count ?? 0),
      holders: Number(overview?.token_holder?.[0]?.num_holder ?? 0),
      pageTotal: rows.reduce((sum, r) => sum + r.amount, 0),
      heightSpread: heights.length ? Math.max(...heights) - Math.min(...heights) : 0,
    };
  }, [asset, assetMap, balances, data, decimals, loading, overview, page, pageSize]);
};
