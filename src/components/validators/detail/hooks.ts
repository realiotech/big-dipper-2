import { useRouter } from 'next/router';
import * as R from 'ramda';
import { useCallback, useEffect, useState, SyntheticEvent } from 'react';
import { chainConfig } from '@/configs';
import {
    useValidatorVotingPowersQuery,
    ValidatorVotingPowersQuery,
    useValidatorInfoQuery,
    ValidatorInfoQuery,
    ValidatorAddressQuery,
    useValidatorAddressQuery,
    LastHundredBlocksSubscription,
    useLastHundredBlocksSubscription,
    GetMessagesByAddressQuery,
    useGetMessagesByAddressQuery,
    useValidatorDelegationsQuery,
    useValidatorRedelegationsQuery,
    useValidatorUndelegationsQuery,
    OnlineVotingPowerQuery,
    useOnlineVotingPowerQuery
} from '@/graphql/types/general_types';
import { useDesmosProfile } from '@/hooks/use_desmos_profile';
import { SlashingParams } from '@/models';
import {
    StatusType,
    ValidatorVPState,
    ValidatorProfileState,
    ValidatorOverviewState,
    DelegationType,
    RedelegationType,
    StakingState,
    UnbondingType,
    Delegations,
    Redelegations,
    Undelegations,
} from '@/components/validators/detail/types';
import { formatToken } from '@/utils/format_token';
import { getValidatorCondition } from '@/utils/get_validator_condition';
import copy from 'copy-to-clipboard';
import { toast } from 'react-toastify';
import { convertMsgsToModels } from '@/components/msg/utils';
import type { TransactionState } from '@/components/validators/detail/types';
import { convertMsgType } from '@/utils/convert_msg_type';
import { useRecoilValue } from 'recoil';
import { readFilter } from '@/recoil/transactions_filter';
import Big from 'big.js';
import { getDenom } from '@/utils/get_denom';
import numeral from 'numeral';

const { extra, votingPowerTokenUnit } = chainConfig;

const initialTokenDenom: TokenUnit = {
    value: '0',
    displayDenom: '',
    baseDenom: '',
    exponent: 0,
};

const initialVotingPowerState: ValidatorVPState = {
    validatorVPExists: true,
    votingPower: {
        height: 0,
        overall: initialTokenDenom,
        self: 0,
        validatorStatus: 0,
    },
};

const initialValidatorOverviewState: ValidatorOverviewState = {
    exists: true,
    overview: {
        validator: '',
        operatorAddress: '',
        selfDelegateAddress: '',
        description: '',
        website: '',
    },
    status: {
        status: 0,
        jailed: false,
        tombstoned: false,
        condition: 0,
        commission: 0,
        missedBlockCounter: 0,
        signedBlockWindow: 0,
        maxRate: '0',
    },
};

const initialValidatorProfileState: ValidatorProfileState = {
    exists: true,
    desmosProfile: null,
    operatorAddress: '',
    selfDelegateAddress: '',
};

export const useValidatorVotingPowerDetails = () => {
    const router = useRouter();
    const [state, setState] = useState<ValidatorVPState>(initialVotingPowerState);

    const handleSetState = useCallback(
        (stateChange: (prevState: ValidatorVPState) => ValidatorVPState) => {
            setState(prevState => {
                const newState = stateChange(prevState);
                return R.equals(prevState, newState) ? prevState : newState;
            });
        },
        []
    );

    // ==========================
    // Fetch Data
    // ==========================
    const { loading } = useValidatorVotingPowersQuery({
        variables: {
            address: router.query.address as string,
        },
        onCompleted: data => {
            handleSetState(prevState => ({ ...prevState, ...formatValidatorVotingPower(data) }));
        },
    });

    return { state, loading };
};

export const useValidatorOverviewDetails = () => {
    const router = useRouter();
    const [state, setState] = useState<ValidatorOverviewState>(initialValidatorOverviewState);

    const handleSetState = useCallback(
        (stateChange: (prevState: ValidatorOverviewState) => ValidatorOverviewState) => {
            setState(prevState => {
                const newState = stateChange(prevState);
                return R.equals(prevState, newState) ? prevState : newState;
            });
        },
        []
    );

    // ==========================
    // Fetch Data
    // ==========================
    const { loading } = useValidatorInfoQuery({
        variables: {
            address: router.query.address as string,
        },
        onCompleted: data => {
            handleSetState(prevState => ({ ...prevState, ...formatValidatorOverview(data) }));
        },
    });

    return { state, loading };
};

export const useValidatorProfileDetails = () => {
    const [state, setState] = useState<ValidatorProfileState>(initialValidatorProfileState);
    const router = useRouter();

    const handleSetState = useCallback(
        (stateChange: (prevState: ValidatorProfileState) => ValidatorProfileState) => {
            setState(prevState => {
                const newState = stateChange(prevState);
                return R.equals(prevState, newState) ? prevState : newState;
            });
        },
        []
    );

    // ==========================
    // Fetch Data
    // ==========================
    const { loading } = useValidatorAddressQuery({
        variables: {
            address: router.query.address as string,
        },
        onCompleted: data => {
            handleSetState(prevState => ({ ...prevState, ...formatValidatorAddress(data) }));
        },
    });

    // ==========================
    // Desmos Profile
    // ==========================
    const { data: dataDesmosProfile, loading: loadingDesmosProfile } = useDesmosProfile({
        addresses: [state.selfDelegateAddress],
        skip: !extra.profile || !state.selfDelegateAddress,
    });
    useEffect(
        () =>
            setState(prevState => ({
                ...prevState,
                desmosProfile: dataDesmosProfile?.[0],
                loading: loadingDesmosProfile,
            })),
        [dataDesmosProfile, loadingDesmosProfile]
    );
    return { state, loading };
};

function formatValidatorAddress(data: ValidatorAddressQuery): Partial<ValidatorProfileState> {
    const stateChange: Partial<ValidatorProfileState> = {};
    if (!data.validator.length) {
        stateChange.exists = false;
        return stateChange;
    }

    const operatorAddress = data?.validator?.[0]?.validatorInfo?.operatorAddress ?? '';
    const selfDelegateAddress = data?.validator?.[0]?.validatorInfo?.selfDelegateAddress ?? '';

    stateChange.operatorAddress = operatorAddress;
    stateChange.selfDelegateAddress = selfDelegateAddress;
    return stateChange;
}

function formatValidatorVotingPower(data: ValidatorVotingPowersQuery): Partial<ValidatorVPState> {
    const stateChange: Partial<ValidatorVPState> = {};
    if (!data.validator.length) {
        stateChange.validatorVPExists = false;
        return stateChange;
    }

    const selfVotingPower =
        (data.validator[0]?.validatorVotingPowers?.[0]?.votingPower ?? 0);

    const votingPower = {
        self: selfVotingPower,
        overall: formatToken(data?.stakingPool?.[0]?.bonded ?? 0, votingPowerTokenUnit),
        height: data.validator[0]?.validatorVotingPowers?.[0]?.height ?? 0,
        validatorStatus: data.validator[0]?.validatorStatuses[0]?.status,
    };

    stateChange.votingPower = votingPower;
    stateChange.validatorVPExists = true;

    return stateChange;
}

function formatValidatorOverview(data: ValidatorInfoQuery): Partial<ValidatorOverviewState> {
    const stateChange: Partial<ValidatorOverviewState> = {};
    if (!data.validator.length) {
        stateChange.exists = false;
        return stateChange;
    }

    const operatorAddress = data?.validator?.[0]?.validatorInfo?.operatorAddress ?? '';
    const selfDelegateAddress = data?.validator?.[0]?.validatorInfo?.selfDelegateAddress ?? '';
    const overview = {
        validator: operatorAddress,
        operatorAddress,
        selfDelegateAddress,
        description: data.validator[0]?.validatorDescriptions?.[0]?.details ?? '',
        website: data.validator[0]?.validatorDescriptions?.[0]?.website ?? '',
    };

    const slashingParams = SlashingParams.fromJson(data?.slashingParams?.[0]?.params ?? {});
    const missedBlockCounter =
        data.validator[0]?.validatorSigningInfos?.[0]?.missedBlocksCounter ?? 0;
    const { signedBlockWindow } = slashingParams;
    const condition = getValidatorCondition(signedBlockWindow, missedBlockCounter);

    const status: StatusType = {
        status: data.validator[0]?.validatorStatuses?.[0]?.status ?? 3,
        jailed: data.validator[0]?.validatorStatuses?.[0]?.jailed ?? false,
        tombstoned: data.validator[0]?.validatorSigningInfos?.[0]?.tombstoned ?? false,
        commission: data.validator[0]?.validatorCommissions?.[0]?.commission ?? 0,
        condition,
        missedBlockCounter,
        signedBlockWindow,
        maxRate: data?.validator?.[0]?.validatorInfo?.maxRate ?? '0',
    };

    stateChange.exists = true;
    stateChange.overview = overview;
    stateChange.status = status;
    return stateChange;
}

const formatLastHundredBlocks = (data: LastHundredBlocksSubscription) =>
    data.block.map((x) => ({
        height: x.height,
        txs: x.transactions.length,
        proposer: x.validator?.validatorInfo?.operatorAddress ?? '',
        signed: x.precommits.length === 1,
    }));

type BlocksState = {
    height: number;
    txs: number;
    proposer: string;
    signed: boolean;
}[];

export const useBlocks = (address?: string) => {
    const [state, setState] = useState<BlocksState>([]);

    const router = useRouter();

    const { loading } = useLastHundredBlocksSubscription({
        variables: {
            address: address ?? (router?.query?.address as string) ?? '',
        },
        onData: (data) => {
            if (!data.data.data) return;
            setState(formatLastHundredBlocks(data.data.data));
        },
    });

    return {
        state,
        loading,
    };
};

export const useAddress = (t: any) => {
    const handleCopyToClipboard = useCallback(
        (value: string) => {
            copy(value);
            toast<string>(t('common:copied'));
        },
        [t]
    );

    return {
        handleCopyToClipboard,
    };
};

const LIMIT = 50;

const formatTransactions = (data: GetMessagesByAddressQuery): Transactions[] => {
    let formattedData = data.messagesByAddress;
    if (data.messagesByAddress.length === 51) {
        formattedData = data.messagesByAddress.slice(0, 51);
    }
    return formattedData.map((x) => {
        const { transaction } = x;

        // =============================
        // messages
        // =============================
        const messages = convertMsgsToModels(transaction);
        const msgType = messages.map((eachMsg) => {
            const eachMsgType = eachMsg?.type ?? 'none type';
            return eachMsgType ?? '';
        });
        const convertedMsgType = convertMsgType(msgType);
        return {
            height: transaction?.height,
            hash: transaction?.hash ?? '',
            type: convertedMsgType,
            messages: {
                count: messages.length,
                items: messages,
            },
            success: transaction?.success ?? false,
            timestamp: transaction?.block.timestamp,
        };
    });
};

export function useTransactions() {
    const router = useRouter();
    const [state, setState] = useState<TransactionState>({
        data: [],
        hasNextPage: false,
        isNextPageLoading: true,
        offsetCount: 0,
    });
    const msgTypes = useRecoilValue(readFilter);

    useEffect(() => {
        setState((prevState) => ({
            ...prevState,
            data: [],
            hasNextPage: false,
            isNextPageLoading: true,
            offsetCount: 0,
        }));
    }, [router?.query?.address, msgTypes]);

    const handleSetState = (stateChange: (prevState: TransactionState) => TransactionState) => {
        setState((prevState) => {
            const newState = stateChange(prevState);
            return R.equals(prevState, newState) ? prevState : newState;
        });
    };

    const transactionQuery = useGetMessagesByAddressQuery({
        variables: {
            limit: LIMIT + 1, // to check if more exist
            offset: 0,
            address: `{${router?.query?.address ?? ''}}`,
            types: msgTypes,
        },
        onCompleted: (data) => {
            const itemsLength = data.messagesByAddress.length;
            const newItems = R.uniq([...state.data, ...formatTransactions(data)]);
            const stateChange: TransactionState = {
                data: newItems,
                hasNextPage: itemsLength === 51,
                isNextPageLoading: false,
                offsetCount: state.offsetCount + LIMIT,
            };

            handleSetState((prevState) => ({ ...prevState, ...stateChange }));
        },
    });

    const loadNextPage = async () => {
        handleSetState((prevState) => ({ ...prevState, isNextPageLoading: true }));
        // refetch query
        await transactionQuery
            .fetchMore({
                variables: {
                    offset: state.offsetCount,
                    limit: LIMIT + 1,
                },
            })
            .then(({ data }) => {
                const itemsLength = data.messagesByAddress.length;
                const newItems = R.uniq([...state.data, ...formatTransactions(data)]);
                const stateChange: TransactionState = {
                    data: newItems,
                    hasNextPage: itemsLength === 51,
                    isNextPageLoading: false,
                    offsetCount: state.offsetCount + LIMIT,
                };
                handleSetState((prevState) => ({ ...prevState, ...stateChange }));
            });
    };

    return {
        state,
        loadNextPage,
    };
}

const { primaryTokenUnit } = chainConfig;

export const ROWS_PER_PAGE = 10;

export const formatDelegations = (data: Delegations[]) =>
    data
        .map<DelegationType>((x): UnbondingType => {
            const address = R.pathOr('', ['delegator_address'], x);
            const delegation = getDenom(x.coins, primaryTokenUnit);
            return {
                address,
                amount: formatToken(delegation.amount, delegation.denom),
            };
        })
        .sort(R.comparator((a, b) => Big(a.amount?.value).gt(b.amount?.value)));

export const formatRedelegations = (data: Redelegations[]) => {
    const results: RedelegationType[] = [];
    data.forEach((x) => {
        R.pathOr<NonNullable<(typeof x)['entries']>>([], ['entries'], x).forEach((y) => {
            results.push({
                address: x?.delegator_address ?? '',
                to: x?.validator_dst_address ?? '',
                amount: formatToken(y.balance, primaryTokenUnit),
                completionTime: R.pathOr('', ['completion_time'], y),
            });
        });
    });
    results.sort(R.comparator((a, b) => a.completionTime < b.completionTime));

    return results;
};

export const formatUnbondings = (data: Undelegations[]) => {
    const results: UnbondingType[] = [];
    data.forEach((x) => {
        x?.entries?.forEach((y) => {
            results.push({
                address: R.pathOr('', ['delegator_address'], x),
                amount: formatToken(y.balance, primaryTokenUnit),
                completionTime: R.pathOr('', ['completion_time'], y),
            });
        });
    });

    results.sort((a, b) => ((a.completionTime ?? '') < (b.completionTime ?? '') ? -1 : 1));

    return results;
};

export const useStaking = (
    delegationsPage: number,
    redelegationsPage: number,
    unbondingsPage: number,
    address?: string
) => {
    const router = useRouter();
    const [state, setState] = useState<StakingState>({
        tab: 0,
    });
    const validatorAddress =
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
    } = useValidatorDelegationsQuery({
        variables: {
            validatorAddress,
            limit: ROWS_PER_PAGE,
            offset: delegationsPage * ROWS_PER_PAGE,
            pagination: false,
        },
    });
    useEffect(() => {
        if (delegationsLoading) return;
        if (delegationsError) {
            delegationsRefetch({ pagination: false });
        }
    }, [delegationsError, delegationsLoading, delegationsRefetch]);
    useValidatorDelegationsQuery({
        variables: {
            validatorAddress,
            limit: ROWS_PER_PAGE,
            offset: (delegationsPage + 1) * ROWS_PER_PAGE,
            pagination: false,
        },
    });

    const [delegationsPagination, setDelegationsPagination] = useState<number | undefined>();
    const {
        data: dData,
        error: dError,
        refetch: dRefetch,
    } = useValidatorDelegationsQuery({
        variables: {
            validatorAddress,
            limit: 0,
            offset: 0,
            pagination: true,
        },
        skip: delegationsPagination !== undefined,
    });
    useEffect(() => {
        if (dError) {
            dRefetch();
        } else if (dData) {
            setDelegationsPagination(dData?.delegations?.pagination?.total ?? 0);
        }
    }, [dData, dError, dRefetch]);

    // =====================================
    // redelegations
    // =====================================
    const {
        data: redelegationsData,
        loading: redelegationsLoading,
        error: redelegationsError,
        refetch: redelegationsRefetch,
    } = useValidatorRedelegationsQuery({
        variables: {
            validatorAddress,
            limit: ROWS_PER_PAGE,
            offset: redelegationsPage * ROWS_PER_PAGE,
        },
    });
    useEffect(() => {
        if (redelegationsLoading) return;
        if (redelegationsError) {
            redelegationsRefetch({ pagination: false });
        }
    }, [redelegationsError, redelegationsLoading, redelegationsRefetch]);
    useValidatorRedelegationsQuery({
        variables: {
            validatorAddress,
            limit: ROWS_PER_PAGE,
            offset: (redelegationsPage + 1) * ROWS_PER_PAGE,
        },
    });

    const [redelegationsPagination, setRedelegationsPagination] = useState<number | undefined>();
    const {
        data: rData,
        error: rError,
        refetch: rRefetch,
    } = useValidatorRedelegationsQuery({
        variables: {
            validatorAddress,
            limit: 0,
            offset: 0,
            pagination: true,
        },
        skip: redelegationsPagination !== undefined,
    });
    useEffect(() => {
        if (rError) {
            rRefetch();
        } else if (rData) {
            setRedelegationsPagination(rData?.redelegations?.pagination?.total ?? 0);
        }
    }, [rData, rError, rRefetch]);

    // =====================================
    // unbondings
    // =====================================
    const {
        data: undelegationsData,
        loading: undelegationsLoading,
        error: undelegationsError,
        refetch: undelegationsRefetch,
    } = useValidatorUndelegationsQuery({
        variables: {
            validatorAddress,
            limit: ROWS_PER_PAGE,
            offset: unbondingsPage * ROWS_PER_PAGE,
        },
    });
    useEffect(() => {
        if (undelegationsLoading) return;
        if (undelegationsError) {
            undelegationsRefetch({ pagination: false });
        }
    }, [undelegationsError, undelegationsLoading, undelegationsRefetch]);
    useValidatorUndelegationsQuery({
        variables: {
            validatorAddress,
            limit: ROWS_PER_PAGE,
            offset: (unbondingsPage + 1) * ROWS_PER_PAGE,
        },
    });

    const [undelegationsPagination, setUndelegationsPagination] = useState<number | undefined>();
    const {
        data: uData,
        error: uError,
        refetch: uRefetch,
    } = useValidatorUndelegationsQuery({
        variables: {
            validatorAddress,
            limit: 0,
            offset: 0,
            pagination: true,
        },
        skip: undelegationsPagination !== undefined,
    });
    useEffect(() => {
        if (uError) {
            uRefetch();
        } else if (uData) {
            setUndelegationsPagination(uData?.undelegations?.pagination?.total ?? 0);
        }
    }, [uData, uError, uRefetch]);

    const handleTabChange = useCallback(
        (_event: SyntheticEvent<Element, globalThis.Event>, newValue: number) => {
            setState((prevState) => {
                const newState = { ...prevState, tab: newValue };
                return R.equals(newState, prevState) ? prevState : newState;
            });
        },
        []
    );

    return {
        state,
        delegations: {
            loading: delegationsLoading,
            count: delegationsPagination,
            data: formatDelegations(delegationsData?.delegations?.delegations ?? []),
            error: delegationsError,
        },
        redelegations: {
            loading: redelegationsLoading,
            count: redelegationsPagination,
            data: formatRedelegations(redelegationsData?.redelegations?.redelegations ?? []),
            error: redelegationsError,
        },
        unbondings: {
            loading: undelegationsLoading,
            count: undelegationsPagination,
            data: formatUnbondings(undelegationsData?.undelegations?.undelegations ?? []),
            error: undelegationsError,
        },
        handleTabChange,
    };
};

type OnlineVotingPowerState = {
    votingPower: number;
    totalVotingPower: number;
    activeValidators: number;
};

const initialState: OnlineVotingPowerState = {
    votingPower: 0,
    totalVotingPower: 0,
    activeValidators: 0,
};

const formatOnlineVotingPower = (data: OnlineVotingPowerQuery) => {
    const votingPower = data?.validatorVotingPowerAggregate?.aggregate?.sum?.votingPower ?? 0;
    const bonded = data?.stakingPool?.[0]?.bonded ?? 0;
    const activeValidators = data?.activeTotal?.aggregate?.count ?? 0;

    return {
        activeValidators,
        votingPower,
        totalVotingPower: numeral(formatToken(bonded, votingPowerTokenUnit).value).value() ?? 0,
    };
};

export const useOnlineVotingPower = () => {
    const [onlineVPstate, setOnlineVPState] = useState(initialState);

    const handleSetState = useCallback(
        (stateChange: (prevState: OnlineVotingPowerState) => OnlineVotingPowerState) => {
            setOnlineVPState((prevState) => {
                const newState = stateChange(prevState);
                return R.equals(prevState, newState) ? prevState : newState;
            });
        },
        []
    );

    useOnlineVotingPowerQuery({
        onCompleted: (data) => {
            handleSetState((prevState) => ({
                ...prevState,
                ...formatOnlineVotingPower(data),
            }));
        },
    });

    return {
        onlineVPstate,
    };
};
