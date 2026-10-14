import { useMemo } from 'react';
import numeral from 'numeral';
import { chainConfig } from '@/configs';
import { useTokenomicsQuery, useValidatorsQuery, ValidatorsQuery } from '@/graphql/types/general_types';
import { formatToken } from '@/utils/format_token';
import type { ValidatorType } from './types';

const { votingPowerTokenUnit } = chainConfig;
const ACTIVE = 3;

const formatValidators = (data?: ValidatorsQuery) => {
  const bonded = numeral(formatToken(data?.stakingPool?.[0]?.bondedTokens ?? 0, votingPowerTokenUnit).value).value() ?? 0;

  const items: ValidatorType[] = (data?.validator_denom ?? [])
    .filter((x) => x.validator.validatorInfo)
    .map((x) => {
      const votingPower = x.validator.validatorVotingPowers?.[0]?.votingPower ?? 0;
      const status = x.validator.validatorStatuses?.[0]?.status ?? 0;
      return {
        validator: x.validator.validatorInfo?.operatorAddress ?? '',
        votingPower,
        votingPowerPercent: bonded && status === ACTIVE ? (votingPower / bonded) * 100 : 0,
        commission: (x.validator.validatorCommissions?.[0]?.commission ?? 0) * 100,
        missedBlocks: x.validator.validatorSigningInfos?.[0]?.missedBlocksCounter ?? 0,
        status,
        jailed: x.validator.validatorStatuses?.[0]?.jailed ?? false,
        tombstoned: x.validator.validatorSigningInfos?.[0]?.tombstoned ?? false,
        denom: x.denom,
      };
    })
    .sort((a, b) => b.votingPower - a.votingPower);

  return { items, bonded };
};

const median = (values: number[]) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/** Validators sorted by voting power, plus the set-wide numbers for the summary cards. */
export const useValidators = () => {
  const { data, loading } = useValidatorsQuery();
  const { data: tokenomics } = useTokenomicsQuery();

  return useMemo(() => {
    const { items, bonded } = formatValidators(data);
    const active = items.filter((x) => x.status === ACTIVE);
    const activePower = active.reduce((sum, x) => sum + x.votingPower, 0);

    // Fewest validators that together hold more than a third of the active voting power.
    let cumulative = 0;
    let nakamoto = 0;
    for (const validator of active) {
      cumulative += validator.votingPower;
      nakamoto += 1;
      if (cumulative > activePower / 3) break;
    }
    const top10 = active.slice(0, 10).reduce((sum, x) => sum + x.votingPower, 0);
    const commissions = active.map((x) => x.commission);

    return {
      loading,
      items,
      stats: {
        active: active.length,
        maxValidators: tokenomics?.stakingParams?.[0]?.params?.max_validators ?? 0,
        known: items.length,
        jailed: items.filter((x) => x.jailed).length,
        bonded,
        activePower,
        stakingTokens: new Set(active.map((x) => x.denom)).size,
        nakamoto: activePower ? nakamoto : 0,
        top10Share: activePower ? (top10 / activePower) * 100 : 0,
        medianCommission: median(commissions),
        minCommission: commissions.length ? Math.min(...commissions) : 0,
        maxCommission: commissions.length ? Math.max(...commissions) : 0,
      },
    };
  }, [data, loading, tokenomics]);
};
