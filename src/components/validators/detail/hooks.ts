import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useRecoilValue } from 'recoil';
import { useValidatorPageQuery, useValidatorProposedBlocksQuery } from '@/graphql/types/general_types';
import { readAssets } from '@/recoil/asset';
import { formatTokenByExponent } from '@/utils';
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
    const largest = data?.delegations?.aggregate?.max?.amount;

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
      selfDelegateAddress: validator?.validatorInfo?.selfDelegateAddress ?? '',
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
