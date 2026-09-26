import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { readAssets } from '@/recoil/asset';
import { formatTokenByExponent } from '@/utils';
import { useTokenSupplies } from '@/components/home/hero/hooks';
import type { Balance } from './types';

type StakeRow = { amount?: string | null; denom?: string | null; val_addr: string };
type Erc20Balance = { value: string; contract?: { id: string } };

export type AssetRow = {
  denom: string;
  symbol: string;
  name: string;
  image?: string;
  spendable: number;
  delegated: number;
  unbonding: number;
  balance: number;
  price: number;
  value: number;
  shareOfSupply: number;
};

export type DelegationRow = { validator: string; symbol: string; amount: number; share: number };

const RIO = 'ario';

/**
 * Everything the account page shows about holdings, in whole tokens:
 * per-asset balances, the portfolio split and delegations per validator.
 */
export const usePortfolio = ({
  balances,
  erc20Balances,
  delegations,
  unbondings,
  rewards,
}: {
  balances: Balance[];
  erc20Balances: Erc20Balance[];
  delegations: StakeRow[];
  unbondings: StakeRow[];
  rewards: number;
}) => {
  const { assetArr } = useRecoilValue(readAssets);
  const { tokens } = useTokenSupplies();

  return useMemo(() => {
    const amount = (row: { amount?: string | null }, decimals: number) =>
      parseFloat(formatTokenByExponent(row.amount ?? '0', decimals)) || 0;
    const sumFor = (rows: StakeRow[], denom: string, decimals: number) =>
      rows.filter((row) => row.denom === denom).reduce((sum, row) => sum + amount(row, decimals), 0);

    const assets: AssetRow[] = assetArr
      .map((asset) => {
        const contract = asset.denom.startsWith('erc20:') ? asset.denom.slice(6).toLowerCase() : '';
        const bank = balances.find((row) => row.denom === asset.denom);
        const erc20 = contract ? erc20Balances.find((row) => row.contract?.id?.toLowerCase() === contract) : undefined;
        const spendable = bank ? amount(bank, asset.decimals) : Number(erc20?.value ?? 0);
        const delegated = sumFor(delegations, asset.denom, asset.decimals);
        const unbonding = sumFor(unbondings, asset.denom, asset.decimals);
        const balance = spendable + delegated + unbonding;
        const supply = tokens[asset.symbol]?.supply ?? 0;
        return {
          denom: asset.denom,
          symbol: asset.symbol,
          name: asset.name,
          image: asset.image,
          spendable,
          delegated,
          unbonding,
          balance,
          price: asset.price,
          value: balance * asset.price,
          shareOfSupply: supply ? (balance / supply) * 100 : 0,
        };
      })
      .filter((row) => row.balance > 0);

    const rioPrice = assetArr.find((asset) => asset.denom === RIO)?.price ?? 0;
    const inUsd = assets.some((row) => row.value > 0);
    // Without prices the split falls back to token amounts.
    const weigh = (row: AssetRow, part: number) => (inUsd ? part * row.price : part);
    const segments = [
      { label: 'Spendable', value: assets.reduce((sum, row) => sum + weigh(row, row.spendable), 0) },
      { label: 'Delegated', value: assets.reduce((sum, row) => sum + weigh(row, row.delegated), 0) },
      { label: 'Unbonding', value: assets.reduce((sum, row) => sum + weigh(row, row.unbonding), 0) },
      { label: 'Rewards', value: inUsd ? rewards * rioPrice : rewards },
    ];

    const byValidator = new Map<string, DelegationRow>();
    delegations.forEach((row) => {
      const asset = assetArr.find((item) => item.denom === row.denom);
      const key = `${row.val_addr}:${row.denom}`;
      const current = byValidator.get(key) ?? { validator: row.val_addr, symbol: asset?.symbol ?? '', amount: 0, share: 0 };
      current.amount += amount(row, asset?.decimals ?? 18);
      byValidator.set(key, current);
    });
    const delegatedTotal = [...byValidator.values()].reduce((sum, row) => sum + row.amount, 0);
    const delegationRows = [...byValidator.values()]
      .map((row) => ({ ...row, share: delegatedTotal ? (row.amount / delegatedTotal) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount);

    return {
      assets,
      segments,
      inUsd,
      totalValue: assets.reduce((sum, row) => sum + row.value, 0) + (inUsd ? rewards * rioPrice : 0),
      delegations: delegationRows,
    };
  }, [assetArr, balances, delegations, erc20Balances, rewards, tokens, unbondings]);
};
