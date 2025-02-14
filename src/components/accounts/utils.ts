import { useEffect, useMemo } from 'react';
import {
  useAccountBalancesQuery,
  useAccountCommissionQuery,
  useAccountDelegationBalanceQuery,
  useAccountDelegationRewardsQuery,
  useAccountUnbondingBalanceQuery,
  useAccountWithdrawalAddressQuery,
} from '@/graphql/types/general_types';
import { toValidatorAddress } from '@/utils/prefix_convert';
import { bech32 } from 'bech32';
import { keccak256 } from 'ethereumjs-util';
import type { AssetBalance, AssetBalanceDetail, AssetBalanceMap, Balance } from './types';
import { AssetMap } from '@/recoil/asset/types';
import { formatTokenByExponent } from '@/utils';

export const backgroundColors = [
  "#364FC7",
  "#4C6EF5",
  "#5C7CFA",
  "#63E6BE",
  "#94D82D",
]

export const useCommission = (address?: string) => {
  /* Converting the address to a validator address. */
  let validatorAddress = '';
  try {
    if (address) validatorAddress = toValidatorAddress(address);
  } catch (e) {
    console.error(e);
  }

  const defaultReturnValue = useMemo(
    () => ({
      commission: {
        coins: [],
      },
    }),
    []
  );
  const { data, error, refetch } = useAccountCommissionQuery({
    variables: {
      validatorAddress,
    },
    skip: !address,
  });
  useEffect(() => {
    if (error) refetch();
  }, [error, refetch]);
  return data ?? defaultReturnValue;
};

export const useAccountWithdrawalAddress = (address?: string) => {
  const defaultReturnValue = useMemo(
    () => ({
      withdrawalAddress: {
        address,
      },
    }),
    [address]
  );
  const { data, error, refetch } = useAccountWithdrawalAddressQuery({
    variables: {
      address: address ?? '',
    },
    skip: !address,
  });
  useEffect(() => {
    if (error) refetch();
  }, [error, refetch]);
  return data ?? defaultReturnValue;
};

export const useAvailableBalances = (address?: string) => {
  const defaultReturnValue = useMemo(
    () => ({
      accountBalances: {
        coins: [],
      },
    }),
    []
  );
  const { data, error, refetch } = useAccountBalancesQuery({
    variables: {
      address: address ?? '',
    },
    skip: !address,
  });
  useEffect(() => {
    if (error) refetch();
  }, [error, refetch]);
  return data ?? defaultReturnValue;
};

export const useDelegationBalance = (address?: string) => {
  const defaultReturnValue = useMemo(
    () => ({
      delegationBalance: {
        coins: [],
      },
    }),
    []
  );
  const { data, error, refetch } = useAccountDelegationBalanceQuery({
    variables: {
      address: address ?? '',
    },
    skip: !address,
  });
  useEffect(() => {
    if (error) refetch();
  }, [error, refetch]);
  return data ?? defaultReturnValue;
};

export const useUnbondingBalance = (address?: string) => {
  const defaultReturnValue = useMemo(
    () => ({
      unbondingBalance: {
        coins: [],
      },
    }),
    []
  );
  const { data, error, refetch } = useAccountUnbondingBalanceQuery({
    variables: {
      address: address ?? '',
    },
    skip: !address,
  });
  useEffect(() => {
    if (error) refetch();
  }, [error, refetch]);
  return data ?? defaultReturnValue;
};

export const useRewards = (address?: string) => {
  const defaultReturnValue = useMemo(() => ({ delegationRewards: [] }), []);
  const { data, error, refetch } = useAccountDelegationRewardsQuery({
    variables: {
      address: address ?? '',
    },
    skip: !address,
  });
  useEffect(() => {
    if (error) refetch();
  }, [error, refetch]);
  return data ?? defaultReturnValue;
};

export function convertToEvmAddress(address: string) {
  try {
    // Decode the Realio (bech32) address
    const decoded = bech32.decode(address);
    const publicKeyHash = Buffer.from(bech32.fromWords(decoded.words));

    // Hash the public key hash using Keccak256
    const evmHash = keccak256(publicKeyHash);

    // Take the last 20 bytes to form the EVM address
    const evmAddress = `0x${evmHash.slice(-20).toString('hex')}`;

    return evmAddress;
  } catch (error) {
    console.error("Error converting address:", error);
    return '';
  }
}

export function convertToChartData(data: AssetBalanceDetail) {
  const labels = ['Spendable, Delegated, Unbondings']
  const datasets = [data.spendable, data.delegated, data.unbonding]

  return {
    labels: labels,
    datasets: [
      {
        data: datasets,
        backgroundColor: ["#364FC7","#5C7CFA","#63E6BE"],
      },
    ],
  };
}
