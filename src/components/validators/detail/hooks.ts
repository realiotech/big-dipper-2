import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useRecoilValue } from 'recoil';
import {
  useValidatorDelegationsQuery,
  useValidatorPageQuery,
  useValidatorProposedBlocksQuery,
  useValidatorUndelegationsQuery,
} from '@/graphql/types/general_types';
import { readAssets } from '@/recoil/asset';
import { formatTokenByExponent } from '@/utils';
import { formatValAddress } from '@/utils/format_address';
import { PAGE_SIZE } from '@/components/assets/parts';
import { useValidators } from '../hooks';

// "Blocks proposed (recent window)" counts over this many blocks.
export const PROPOSED_WINDOW = 150000;

export const useValidatorDetails = () => {
  const router = useRouter();
  const address = String(router.query.address ?? '');
  const { assetMap } = useRecoilValue(readAssets);

  const { data, loading } = useValidatorPageQuery({ variables: { address }, skip: !router.isReady });
  const { items, stats } = useValidators();

  const validator = data?.validator?.[0];
  const consensusAddress = validator?.validatorInfo?.consensusAddress ?? '';
  const latestHeight = Number(data?.latestBlock?.[0]?.height ?? 0);

  const { data: blocksData, loading: blocksLoading } = useValidatorProposedBlocksQuery({
    variables: { consensusAddress, sinceHeight: Math.max(latestHeight - PROPOSED_WINDOW, 0) },
    skip: !consensusAddress || !latestHeight,
  });

  return useMemo(() => {
    const description = validator?.validatorDescriptions?.[0];
    const status = validator?.validatorStatuses?.[0];
    const signing = validator?.validatorSigningInfos?.[0];
    const denom = data?.validatorDenom?.[0]?.denom ?? '';
    const asset = assetMap[denom];
    const votingPower = Number(validator?.validatorVotingPowers?.[0]?.votingPower ?? 0);
    // Rank within the active set, by voting power.
    const rankIndex = items.filter((item) => item.status === 3).findIndex((item) => item.validator === address);
    const largest = data?.largestDelegation?.[0]?.amount;

    return {
      address,
      loading,
      exists: loading || !router.isReady || Boolean(validator),
      moniker: description?.moniker || address,
      avatarUrl: description?.avatarUrl ?? undefined,
      website: description?.website ?? '',
      details: description?.details ?? '',
      identity: description?.identity ?? '',
      securityContact: description?.securityContact ?? '',
      selfDelegateAddress: validator ? formatValAddress(validator.validatorInfo?.operatorAddress ?? address) : '',
      status: status?.status ?? 0,
      jailed: status?.jailed ?? false,
      tombstoned: signing?.tombstoned ?? false,
      rank: rankIndex >= 0 ? rankIndex + 1 : null,
      denom,
      asset,
      votingPower,
      activeShare: stats.activePower && status?.status === 3 ? (votingPower / stats.activePower) * 100 : 0,
      commission: Number(validator?.validatorCommissions?.[0]?.commission ?? 0) * 100,
      maxRate: Number(validator?.validatorInfo?.maxRate ?? 0) * 100,
      maxChangeRate: Number(validator?.validatorInfo?.maxChangeRate ?? 0) * 100,
      missedBlocks: Number(signing?.missedBlocksCounter ?? 0),
      signedBlocksWindow: Number(data?.slashingParams?.[0]?.params?.signed_blocks_window ?? 0),
      delegators: data?.delegations?.aggregate?.count ?? 0,
      largestDelegation: largest ? parseFloat(formatTokenByExponent(largest, asset?.decimals ?? 18)) : 0,
      proposed: {
        loading: blocksLoading || (!blocksData && Boolean(validator)),
        recentCount: blocksData?.recent?.aggregate?.count ?? 0,
        blocks: (blocksData?.blocks ?? []).map((block) => ({
          height: Number(block.height),
          timestamp: block.timestamp,
          txs: block.txs ?? 0,
          gasUsed: Number(block.totalGas ?? 0),
        })),
      },
    };
  }, [address, assetMap, blocksData, blocksLoading, data, items, loading, router.isReady, stats.activePower, validator]);
};

export type DelegationRow = { rank: number; address: string; amount: number; bondWeight: number; power: number; share: number };
export type UnbondingRow = { address: string; amount: number; height: number };

/**
 * The validator's delegations and unbondings, one page each, largest first.
 * A delegation's voting power is amount × bond weight; these add up to the
 * validator's voting power, so `share` is each delegator's part of it.
 */
export const useValidatorStaking = (address: string, decimals: number, votingPower: number) => {
  const [delegationsPage, setDelegationsPage] = useState(1);
  const [unbondingsPage, setUnbondingsPage] = useState(1);
  const toTokens = (amount?: string | null) => Number(amount ?? 0) / 10 ** decimals;

  const delegations = useValidatorDelegationsQuery({
    variables: { validatorAddress: address, limit: PAGE_SIZE, offset: (delegationsPage - 1) * PAGE_SIZE },
    skip: !address,
  });
  const unbondings = useValidatorUndelegationsQuery({
    variables: { validatorAddress: address, limit: PAGE_SIZE, offset: (unbondingsPage - 1) * PAGE_SIZE },
    skip: !address,
  });

  return useMemo(
    () => ({
      delegations: {
        loading: delegations.loading,
        page: delegationsPage,
        setPage: setDelegationsPage,
        count: Number(delegations.data?.locks_count_by_val?.[0]?.count ?? 0),
        rows: (delegations.data?.get_ms_locks_sorted ?? []).map((row, index): DelegationRow => {
          const amount = toTokens(row.amount);
          const bondWeight = Number(row.bond_weight ?? 1);
          return {
            rank: (delegationsPage - 1) * PAGE_SIZE + index + 1,
            address: row.staker_addr,
            amount,
            bondWeight,
            power: amount * bondWeight,
            share: votingPower ? ((amount * bondWeight) / votingPower) * 100 : 0,
          };
        }),
      },
      unbondings: {
        loading: unbondings.loading,
        page: unbondingsPage,
        setPage: setUnbondingsPage,
        count: Number(unbondings.data?.unlocks_count_by_val?.[0]?.count ?? 0),
        rows: (unbondings.data?.get_ms_unlocks_sorted ?? []).map((row): UnbondingRow => ({
          address: row.staker_addr,
          amount: toTokens(row.amount),
          height: Number(row.creation_height ?? 0),
        })),
      },
    }),
    // toTokens only depends on decimals.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [decimals, delegations.data, delegations.loading, delegationsPage, unbondings.data, unbondings.loading, unbondingsPage, votingPower]
  );
};
