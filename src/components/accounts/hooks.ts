import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

import Big from 'big.js';
import {
  GetMessagesByAddressQuery,
  useAccountDelegationsQuery,
  useAccountUndelegationsQuery,
  useBalancesByAddressQuery,
  useGetMessagesByAddressQuery,
  useGetMessagesByAddressCountQuery,
} from '@/graphql/types/general_types';

import { txFeeInRio, txLabel } from '@/utils/tx_label';
import { useRecoilValue } from 'recoil';
import { readFilter } from '@/recoil/transactions_filter';
import type { AccountInfo, AccountTransaction, OverviewType } from './types';
import { realioNetworkToEth, ethToRealionetwork } from "@realiotech/address-generator"
import { ACCOUNT_DETAILS } from '@/utils/go_to_page'
import { readAssets } from '@/recoil/asset';
import { formatTokenByExponent } from '@/utils';

export const PAGE_SIZE = 20;
// Staking rewards are paid in RIO.
const REWARD_DENOM = 'ario';
const REWARD_DECIMALS = 18;

// messages_by_address returns one row per message, so a transaction with
// several messages for this account appears more than once.
const formatTransactions = (data?: GetMessagesByAddressQuery): AccountTransaction[] => {
  const seen = new Set<string>();
  const result: AccountTransaction[] = [];

  for (const { transaction } of data?.messagesByAddress ?? []) {
    const hash = transaction?.hash ?? '';
    if (!transaction || seen.has(hash)) continue;
    seen.add(hash);
    result.push({
      hash,
      height: Number(transaction.height),
      success: transaction.success,
      timestamp: transaction.block.timestamp,
      label: txLabel(transaction.messages),
      fee: txFeeInRio(transaction.fee),
    });
  }
  return result;
};

export function useTransactions(address?: string) {
  const msgTypes = useRecoilValue(readFilter);
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [address, msgTypes]);

  const variables = { address: `{${address ?? ''}}`, types: msgTypes };
  const { data: countData } = useGetMessagesByAddressCountQuery({ variables, skip: !address });
  const { data, loading } = useGetMessagesByAddressQuery({
    variables: { ...variables, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE },
    skip: !address,
  });

  return {
    items: formatTransactions(data),
    loading,
    total: countData?.messagesByAddressAggregate.aggregate?.count ?? 0,
    page,
    setPage,
  };
}

/** Account type, public key type and pending staking rewards, read from the chain's REST API. */
export function useAccountInfo(address?: string) {
  const [info, setInfo] = useState<AccountInfo>({ loading: true, accountType: '', publicKey: '', rewards: 0 });

  useEffect(() => {
    if (!address) return;
    const api = process.env.NEXT_PUBLIC_RPC_API;
    const shortType = (type?: string) => type?.slice(type.lastIndexOf('.') + 1) ?? '';
    const get = (path: string) => fetch(`${api}${path}`).then((res) => (res.ok ? res.json() : null)).catch(() => null);

    Promise.all([
      get(`/cosmos/auth/v1beta1/accounts/${address}`),
      get(`/cosmos/distribution/v1beta1/delegators/${address}/rewards`),
    ]).then(([auth, rewards]) => {
      const account = auth?.account;
      const pubKey = account?.pub_key ?? account?.base_account?.pub_key;
      const reward = (rewards?.total ?? []).find((coin) => coin.denom === REWARD_DENOM)?.amount ?? '0';
      setInfo({
        loading: false,
        accountType: shortType(account?.['@type']),
        // "/ethermint.crypto.v1.ethsecp256k1.PubKey" -> "eth_secp256k1"
        publicKey: pubKey ? shortType(pubKey['@type'].replace(/\.PubKey$/, '')).replace('ethsecp256k1', 'eth_secp256k1') : '',
        rewards: Big(reward.split('.')[0] || '0').div(Big(10).pow(REWARD_DECIMALS)).toNumber(),
      });
    });
  }, [address]);

  return info;
}

export function useOverview(): OverviewType {
  const router = useRouter()
  const rawAddress = router?.query?.address as string
  const isEvmAddress = rawAddress?.startsWith('0x') && rawAddress?.length === 42
  const address = isEvmAddress ? ethToRealionetwork(rawAddress) : rawAddress
  const evmAddress = isEvmAddress ? rawAddress : (address ? realioNetworkToEth(address) : undefined)

  useEffect(() => {
    if (isEvmAddress && address) {
      router.replace(ACCOUNT_DETAILS(address))
    }
  }, [isEvmAddress, address, router])

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
    evmAddress,
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

/**
 * ERC-20 balances in whole tokens, read from the chain with balanceOf for
 * each listed ERC-20 asset (DSTRX), in one batched JSON-RPC request.
 * Staking moves tokens out of the wallet without a Transfer event, so the
 * subgraph and Blockscout's cached token balances can keep showing a balance
 * the account has already staked; balanceOf is always current.
 */
export const useErc20Balances = (
  evmAddress?: string,
) => {
  const { assetArr } = useRecoilValue(readAssets);
  const tokens = useMemo(
    () => assetArr
      .filter((asset) => asset.denom.startsWith('erc20:'))
      .map((asset) => ({ contract: asset.denom.slice('erc20:'.length).toLowerCase(), decimals: asset.decimals })),
    [assetArr],
  );
  const [balances, setBalances] = useState<Array<{ value: string; contract: { id: string } }>>([]);
  const key = tokens.map((token) => token.contract).join(',');

  useEffect(() => {
    setBalances([]);
    if (!evmAddress || !tokens.length || !process.env.NEXT_PUBLIC_JSON_RPC_URL) return;
    const controller = new AbortController();
    // balanceOf(address): selector 0x70a08231 and the address padded to 32 bytes.
    const data = `0x70a08231${evmAddress.slice(2).toLowerCase().padStart(64, '0')}`;
    fetch(process.env.NEXT_PUBLIC_JSON_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokens.map((token, id) => ({ jsonrpc: '2.0', id, method: 'eth_call', params: [{ to: token.contract, data }, 'latest'] }))),
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((results: Array<{ id: number; result?: string }>) =>
        setBalances(
          results
            .filter((r) => r.result && r.result !== '0x')
            .map((r) => ({
              value: formatTokenByExponent(BigInt(r.result as string).toString(), tokens[r.id].decimals),
              contract: { id: tokens[r.id].contract },
            })),
        ),
      )
      .catch((error) => error?.name !== 'AbortError' && console.error('ERC-20 balanceOf failed:', error));
    return () => controller.abort();
    // tokens is derived from key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evmAddress, key]);

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