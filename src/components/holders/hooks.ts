import { useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { ethToRealionetwork } from '@realiotech/address-generator';
import { useAssetOverviewQuery, useBalancesOfQuery, useHolderListQuery } from '@/graphql/types/general_types';
import { useEvmTokenHoldersQuery } from '@/graphql/types/subgraph_types';
import { readAssets } from '@/recoil/asset';
import { MODULE_LABELS } from '@/components/assets/hooks';

/** Tokens the account rankings offer, in this order. */
export const HOLDER_TOKENS = ['RIO', 'RST', 'DSTRX'];

/**
 * ERC-20 tokens such as DSTRX live in EVM balances, which the indexer's
 * holder list does not see; their holders come from the token's subgraph.
 */
export const isErc20Denom = (denom: string) => denom.startsWith('erc20:');

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

type Holder = { address: string; amount: string; height?: number | string | null };

/**
 * Turns one page of holders into table rows: token amounts, share of supply,
 * module-account labels and each holder's other token balances (for the
 * "tokens held" icons).
 */
const useHolderRows = (denom: string, holders: Holder[], rankOffset: number, supplyOverride?: string) => {
  const { assetMap } = useRecoilValue(readAssets);
  const asset = assetMap[denom];
  const decimals = asset?.decimals ?? 18;
  const erc20 = isErc20Denom(denom);

  const { data: overview } = useAssetOverviewQuery({ variables: { denom }, skip: !denom || erc20 });
  const addresses = useMemo(() => holders.map((h) => h.address), [holders]);
  const { data: balances } = useBalancesOfQuery({ variables: { addresses }, skip: !addresses.length });

  return useMemo(() => {
    const supply = Number(supplyOverride ?? overview?.supply_by_denom?.[0]?.amount ?? 0) / 10 ** decimals;
    const held = new Map<string, string[]>();
    (balances?.balance ?? []).forEach((b) => {
      const symbol = assetMap[b.denom]?.symbol;
      if (symbol && Number(b.amount) > 0) held.set(b.address, [...(held.get(b.address) ?? []), symbol]);
    });
    // Bank balances miss the ERC-20 itself, which every row of its ranking holds.
    if (erc20 && asset) holders.forEach((h) => !held.get(h.address)?.includes(asset.symbol) && held.set(h.address, [...(held.get(h.address) ?? []), asset.symbol]));

    const rows: HolderRow[] = holders.map((h, index) => {
      const amount = Number(h.amount) / 10 ** decimals;
      return {
        rank: rankOffset + index + 1,
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

    return { asset, rows, supply, holders: Number(overview?.token_holder?.[0]?.num_holder ?? 0) };
  }, [asset, assetMap, balances, decimals, erc20, holders, overview, rankOffset, supplyOverride]);
};

// Largest first, as base-unit strings; realio1 addresses like the rest of the explorer.
const useErc20Holders = (denom: string) => {
  const enabled = isErc20Denom(denom);
  const { data, loading } = useEvmTokenHoldersQuery({
    context: { apiName: 'subgraph' },
    variables: { address: denom.slice('erc20:'.length).toLowerCase() },
    skip: !enabled,
  });
  return useMemo(
    () => ({
      loading: enabled && loading,
      supply: data?.erc20Contract?.totalSupply?.valueExact as string | undefined,
      holders: (data?.erc20Balances ?? [])
        .filter((b) => b.account?.id)
        .map((b): Holder => ({ address: ethToRealionetwork(String(b.account?.id)), amount: String(b.valueExact) })),
    }),
    [data, enabled, loading]
  );
};

/** One page of an asset's holders, largest first. */
export const useHolderList = (denom: string, page: number, pageSize: number) => {
  const erc20 = isErc20Denom(denom);
  const { data, loading: nativeLoading } = useHolderListQuery({
    variables: { denom, limit: pageSize, offset: (page - 1) * pageSize },
    skip: !denom || erc20,
  });
  // An ERC-20 has few holders (DSTRX: under 200), so they arrive at once and are paged here.
  const evm = useErc20Holders(denom);
  const holders = useMemo(
    () => (erc20 ? evm.holders.slice((page - 1) * pageSize, page * pageSize) : data?.holders ?? []),
    [data, erc20, evm.holders, page, pageSize]
  );
  const { asset, rows, supply, holders: holderCount } = useHolderRows(denom, holders, (page - 1) * pageSize, erc20 ? evm.supply : undefined);
  const loading = erc20 ? evm.loading : nativeLoading;

  return useMemo(() => {
    const heights = rows.map((r) => r.height).filter(Boolean);
    return {
      asset,
      loading,
      rows,
      supply,
      count: erc20 ? evm.holders.length : Number(data?.count?.[0]?.count ?? 0),
      holders: erc20 ? evm.holders.length : holderCount,
      pageTotal: rows.reduce((sum, r) => sum + r.amount, 0),
      heightSpread: heights.length ? Math.max(...heights) - Math.min(...heights) : 0,
    };
  }, [asset, data, erc20, evm.holders.length, holderCount, loading, rows, supply]);
};

/**
 * One page of the blacklisted accounts holding an asset, largest first. The
 * server keeps the blacklist and ranks it, so only this page reaches the browser.
 */
export const useBlacklistedHolderList = (denom: string, page: number, pageSize: number, enabled: boolean) => {
  const [state, setState] = useState<{ loading: boolean; total: number; holders: Holder[] }>({ loading: false, total: 0, holders: [] });

  useEffect(() => {
    if (!enabled || !denom) return;
    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true }));
    fetch(`/api/blacklist/holders?denom=${encodeURIComponent(denom)}&page=${page}&pageSize=${pageSize}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : { total: 0, rows: [] }))
      .then((body: { total: number; rows: Holder[] }) => setState({ loading: false, total: body.total, holders: body.rows }))
      .catch((error) => error?.name !== 'AbortError' && setState({ loading: false, total: 0, holders: [] }));
    return () => controller.abort();
  }, [denom, enabled, page, pageSize]);

  // Shares an ERC-20's supply with useHolderList through Apollo's cache.
  const evm = useErc20Holders(enabled ? denom : '');
  const { rows } = useHolderRows(denom, enabled ? state.holders : [], (page - 1) * pageSize, evm.supply);
  return { loading: state.loading, count: state.total, rows };
};
