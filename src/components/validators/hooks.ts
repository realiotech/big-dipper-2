import Big from 'big.js';
import { bech32 } from 'bech32';
import numeral from 'numeral';
import * as R from 'ramda';
import { SyntheticEvent, useCallback, ChangeEventHandler, KeyboardEventHandler, useState } from 'react';
import { chainConfig } from '@/configs';
import {
  useValidatorsQuery,
  useValidatorSelfStakesLazyQuery,
} from '@/graphql/types/general_types';
import type {
  Ms_Locks_Bool_Exp as MsLocksBoolExp,
  ValidatorSelfStakesQuery,
  ValidatorsQuery,
} from '@/graphql/types/general_types';
import { SlashingParams } from '@/models';
import type {
  ItemType,
  ValidatorsState,
  ValidatorType,
} from './types';
import { formatToken } from '@/utils/format_token';
import { getValidatorCondition } from '@/utils/get_validator_condition';

const { prefix, tokenUnits, votingPowerTokenUnit } = chainConfig;

const getSelfStakeKey = (validatorAddress: string, delegatorAddress: string) =>
  `${validatorAddress}:${delegatorAddress}`;

const validatorToDelegatorAddress = (validatorAddress: string) => {
  try {
    if (!validatorAddress) {
      return '';
    }

    return bech32.encode(prefix.account, bech32.decode(validatorAddress).words);
  } catch {
    return '';
  }
};

const formatSelfStake = (amount: string | null | undefined, denom: string | null | undefined) => {
  const exponent = tokenUnits?.[denom ?? '']?.exponent ?? (denom?.startsWith('erc20:') ? 18 : 0);

  return numeral(Big(amount ?? 0).div(Big(10).pow(exponent)).toFixed(exponent)).value() ?? 0;
};

// ==========================
// Parse data
// ==========================
const formatValidators = (data: ValidatorsQuery): Partial<ValidatorsState> => {
  const slashingParams = SlashingParams.fromJson(data?.slashingParams?.[0]?.params ?? {});
  const votingPowerOverall =
    numeral(
      formatToken(data?.stakingPool?.[0]?.bondedTokens ?? 0, votingPowerTokenUnit).value
    ).value() ?? 0;

  const { signedBlockWindow } = slashingParams;
  let formattedItems: ValidatorType[] = data.validator_denom
    .filter((x) => x.validator.validatorInfo)
    .map((x) => {
      const votingPower =
        (x?.validator?.validatorVotingPowers?.[0]?.votingPower ?? 0);
      const votingPowerPercent = votingPowerOverall
        ? numeral((votingPower / votingPowerOverall) * 100).value()
        : 0;

      const missedBlockCounter = x?.validator?.validatorSigningInfos?.[0]?.missedBlocksCounter ?? 0;
      const condition = getValidatorCondition(signedBlockWindow, missedBlockCounter);

      return {
        validator: x?.validator.validatorInfo?.operatorAddress ?? '',
        selfStake: 0,
        votingPower: votingPower ?? 0,
        votingPowerPercent: votingPowerPercent ?? 0,
        commission: (x?.validator?.validatorCommissions?.[0]?.commission ?? 0) * 100,
        condition,
        status: x?.validator?.validatorStatuses?.[0]?.status ?? 0,
        jailed: x?.validator?.validatorStatuses?.[0]?.jailed ?? false,
        tombstoned: x?.validator?.validatorSigningInfos?.[0]?.tombstoned ?? false,
        denom: x?.denom
      };
    });

  // get the top 34% validators
  formattedItems = formattedItems.sort((a, b) => (a.votingPower > b.votingPower ? -1 : 1));

  // add key to indicate they are part of top 34%
  let cumulativeVotingPower = Big(0);
  let reached = false;
  formattedItems.forEach((x) => {
    if (x.status === 3) {
      const totalVp = cumulativeVotingPower.add(x.votingPowerPercent);
      if (totalVp.lte(34) && !reached) {
        x.topVotingPower = true;
      }

      if (totalVp.gt(34) && !reached) {
        x.topVotingPower = true;
        reached = true;
      }

      cumulativeVotingPower = totalVp;
    }
  });

  return {
    votingPowerOverall,
    items: formattedItems,
  };
};

const getSelfStakeFilters = (items: ValidatorType[]): MsLocksBoolExp[] =>
  items
    .map((item) => ({
      validatorAddress: item.validator,
      delegatorAddress: validatorToDelegatorAddress(item.validator),
    }))
    .filter((item) => item.validatorAddress && item.delegatorAddress)
    .map((item) => ({
      staker_addr: { _eq: item.delegatorAddress },
      val_addr: { _eq: item.validatorAddress },
    }));

const getSelfStakeByValidator = (data: ValidatorSelfStakesQuery) =>
  data.ms_locks.reduce<Record<string, number>>((acc, stake) => {
    const key = getSelfStakeKey(stake.val_addr, stake.staker_addr);

    acc[key] = formatSelfStake(stake.amount, stake.denom);
    return acc;
  }, {});

export const useValidators = () => {
  const [search, setSearch] = useState('');
  const [state, setState] = useState<ValidatorsState>({
    loading: true,
    exists: true,
    items: [],
    votingPowerOverall: 0,
    tab: 0,
    sortKey: '',
    sortDirection: 'asc',
  });

  const handleSetState = useCallback(
    (stateChange: (prevState: ValidatorsState) => ValidatorsState) => {
      setState((prevState) => {
        const newState = stateChange(prevState);
        return R.equals(prevState, newState) ? prevState : newState;
      });
    },
    []
  );

  const [fetchSelfStakes] = useValidatorSelfStakesLazyQuery({
    onCompleted: (data) => {
      const selfStakeByValidator = getSelfStakeByValidator(data);

      handleSetState((prevState) => ({
        ...prevState,
        items: prevState.items.map((item) => ({
          ...item,
          selfStake:
            selfStakeByValidator[
              getSelfStakeKey(item.validator, validatorToDelegatorAddress(item.validator))
            ] ?? 0,
        })),
      }));
    },
  });

  // ==========================
  // Fetch Data
  // ==========================
  useValidatorsQuery({
    onCompleted: (data) => {
      const formattedValidators = formatValidators(data);
      const selfStakeFilters = getSelfStakeFilters(formattedValidators.items ?? []);

      handleSetState((prevState) => ({
        ...prevState,
        loading: false,
        ...formattedValidators,
      }));

      if (selfStakeFilters.length) {
        fetchSelfStakes({
          variables: {
            where: selfStakeFilters,
          },
        });
      }
    },
    onError: () => {
      handleSetState((prevState) => ({
        ...prevState,
        loading: false,
        exists: false,
      }));
    },
  });

  const handleTabChange = useCallback(
    (_event: SyntheticEvent<Element, globalThis.Event>, newValue: number) => {
      setState((prevState) => ({
        ...prevState,
        tab: newValue,
      }));
    },
    []
  );

  const handleSort = useCallback(
    (key: string) => {
      if (key === state.sortKey) {
        setState((prevState) => ({
          ...prevState,
          sortDirection: prevState.sortDirection === 'asc' ? 'desc' : 'asc',
        }));
      } else {
        setState((prevState) => ({
          ...prevState,
          sortKey: key,
          sortDirection: 'asc', // new key so we start the sort by asc
        }));
      }
    },
    [state.sortKey]
  );

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const sortItems = useCallback(
    (items: ItemType[]) => {
      let sorted: ItemType[] = R.clone(items);

      if (state.tab === 0) {
        sorted = sorted.filter((x) => x.status === 3);
      }

      if (state.tab === 1) {
        sorted = sorted.filter((x) => x.status !== 3);
      }

      if (search) {
        sorted = sorted.filter((x) => {
          const formattedSearch = search.toLowerCase().replace(/ /g, '');
          return (
            x.validator.name.toLowerCase().replace(/ /g, '').includes(formattedSearch) ||
            x.validator.address.toLowerCase().includes(formattedSearch)
          );
        });
      }

      if (state.sortKey && state.sortDirection) {
        sorted.sort((a, b) => {
          let compareA = R.pathOr('', [...state.sortKey.split('.')], a);
          let compareB = R.pathOr('', [...state.sortKey.split('.')], b);

          if (typeof compareA === 'string' && typeof compareB === 'string') {
            compareA = compareA.toLowerCase();
            compareB = compareB.toLowerCase();
          }

          if (compareA < compareB) {
            return state.sortDirection === 'asc' ? -1 : 1;
          }
          if (compareA > compareB) {
            return state.sortDirection === 'asc' ? 1 : -1;
          }
          return 0;
        });
      }

      return sorted;
    },
    [search, state.sortDirection, state.sortKey, state.tab]
  );

  return {
    state,
    handleTabChange,
    handleSort,
    handleSearch,
    sortItems,
    search,
  };
};

export const useSearch = (callback: (value: string, clear?: () => void) => void) => {
  const [value, setValue] = useState('');
  const handleOnChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const newValue = e?.target?.value ?? '';
    setValue(newValue);
  };

  const handleOnSubmit = () => {
    callback(value, clear);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    const shift = e?.shiftKey;
    const isEnter = e?.keyCode === 13 || e?.key === 'Enter';
    if (isEnter && !shift) {
      e.preventDefault();
      callback(value, clear);
    }
  };

  const clear = () => {
    setValue('');
  };

  return {
    handleOnChange,
    handleOnSubmit,
    value,
    handleKeyDown,
  };
};
