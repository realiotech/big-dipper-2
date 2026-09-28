import { useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useAssetsOverviewQuery } from '@/graphql/types/general_types';
import { readAssets } from '@/recoil/asset';

export type AssetKind = 'native' | 'ibc' | 'erc20' | 'other';

export type AssetListRow = {
  denom: string;
  kind: AssetKind;
  symbol: string;
  name: string;
  image?: string;
  href?: string;
  price: number;
  supply: number;
  marketCap: number;
  holders: number;
  stakeable: boolean;
};

// The bond denom is native but not in the priced asset list.
const STAKE = { denom: 'stake', symbol: 'STAKE', name: 'Bonded stake unit', decimals: 18 };

/** Links the existing asset pages: /assets/rio for ario, /erc20/0x… for ERC-20 tokens. */
export const assetHref = (denom: string) => {
  if (denom.startsWith('erc20:')) return `/erc20/${denom.slice(6)}`;
  return `/assets/${denom === STAKE.denom ? denom : denom.replace(/^a/, '')}`;
};

type IbcInfo = { symbol: string; name: string; decimals: number };

/**
 * Names for ibc/<hash> denoms. The chain lists each denom's base and channel
 * path; the hash is SHA-256 of "port/channel/…/base", computed here.
 */
const useIbcDenoms = () => {
  const [names, setNames] = useState<Record<string, IbcInfo>>({});

  useEffect(() => {
    const hex = (buffer: ArrayBuffer) => Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    fetch(`${process.env.NEXT_PUBLIC_RPC_API}/ibc/apps/transfer/v1/denoms?pagination.limit=200`)
      .then((res) => (res.ok ? res.json() : { denoms: [] }))
      .then(async ({ denoms = [] }) => {
        const entries = await Promise.all(
          denoms.map(async (denom: { base: string; trace: Array<{ port_id: string; channel_id: string }> }) => {
            const path = [...denom.trace.map((hop) => `${hop.port_id}/${hop.channel_id}`), denom.base].join('/');
            const hash = hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(path)));
            // "uatom" -> ATOM with 6 decimals, the Cosmos micro-unit convention.
            const base = denom.base.split(/[/:]/).pop() ?? denom.base;
            const micro = /^u[a-z]+$/.test(base);
            return [`ibc/${hash}`, { symbol: (micro ? base.slice(1) : base).toUpperCase(), name: `via ${denom.trace.map((hop) => hop.channel_id).join(' → ')}`, decimals: micro ? 6 : 0 }] as const;
          })
        );
        setNames(Object.fromEntries(entries));
      })
      .catch(() => setNames({}));
  }, []);

  return names;
};

export const useAssetList = () => {
  const { data, loading } = useAssetsOverviewQuery();
  const { assetArr } = useRecoilValue(readAssets);
  const ibc = useIbcDenoms();

  return useMemo(() => {
    const coins: Array<{ denom: string; amount: string }> = data?.supply?.[0]?.coins ?? [];
    const holders = new Map((data?.holders ?? []).map((h) => [h.denom ?? '', Number(h.count ?? 0)]));
    const stakeable = new Set((data?.bonded ?? []).map((b) => b.denom));
    const bondedTotal = (data?.bonded ?? [])
      .filter((b) => assetArr.some((asset) => asset.denom === b.denom))
      .reduce((sum, b) => sum + Number(b.amount ?? 0) / 1e18, 0);

    const rows: AssetListRow[] = coins.map((coin) => {
      const known = assetArr.find((asset) => asset.denom === coin.denom);
      const ibcInfo = ibc[coin.denom];
      const isStake = coin.denom === STAKE.denom;
      const kind: AssetKind = coin.denom.startsWith('ibc/') ? 'ibc' : coin.denom.startsWith('erc20:') ? 'erc20' : known || isStake ? 'native' : 'other';
      const decimals = known?.decimals ?? (isStake ? STAKE.decimals : ibcInfo?.decimals ?? 0);
      const supply = Number(coin.amount) / 10 ** decimals;
      const price = known?.price ?? 0;
      return {
        denom: coin.denom,
        kind,
        symbol: known?.symbol ?? (isStake ? STAKE.symbol : ibcInfo?.symbol ?? (kind === 'ibc' ? 'IBC' : coin.denom.toUpperCase())),
        name: known?.name ?? (isStake ? STAKE.name : ibcInfo?.name ?? (kind === 'ibc' ? `${coin.denom.slice(0, 16)}…` : 'Unlisted denom')),
        image: known?.image,
        href: known || isStake ? assetHref(coin.denom) : undefined,
        price,
        supply,
        marketCap: price * supply,
        holders: holders.get(coin.denom) ?? 0,
        stakeable: Boolean(known) && stakeable.has(coin.denom),
      };
    });

    const native = rows.filter((row) => row.kind === 'native');
    return {
      loading,
      rows,
      height: Number(data?.supply?.[0]?.height ?? 0),
      stats: {
        marketCap: rows.reduce((sum, row) => sum + row.marketCap, 0),
        priced: rows.filter((row) => row.price > 0).length,
        total: rows.length,
        native: native.length,
        stakeable: rows.filter((row) => row.stakeable).length,
        nativeSymbols: native.map((row) => row.symbol),
        ibc: rows.filter((row) => row.kind === 'ibc').length,
        erc20: rows.filter((row) => row.kind === 'erc20').length,
        bonded: bondedTotal,
        stakingDenoms: assetArr.filter((asset) => stakeable.has(asset.denom)).length,
        holders: [...holders.values()].reduce((sum, count) => sum + count, 0),
      },
    };
  }, [assetArr, data, ibc, loading]);
};
