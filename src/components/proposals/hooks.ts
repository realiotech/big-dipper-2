import { useRouter } from 'next/router';
import {
  ProposalsQuery, useProposalsQuery,
  ProposalDetailsQuery, useProposalDetailsQuery,
  ProposalDetailsTallyQuery, useProposalDetailsTallyQuery,
  ProposalDetailsVotesQuery, useProposalDetailsVotesQuery,
} from '@/graphql/types/general_types';
import type { ProposalsState, ProposalType, ProposalState, VotesGraphState, VoteState } from './types';
import * as R from 'ramda';
import { useCallback, useState, SyntheticEvent } from 'react';
import xss from 'xss';
import { chainConfig } from '@/configs';
import { formatToken } from '@/utils/format_token';
import { toValidatorAddress } from '@/utils/prefix_convert';
import Big from 'big.js';

const formatProposals = (data?: ProposalsQuery): ProposalType[] => {
  if (!data?.proposals) return [];

  return data.proposals.map((x) => ({
    description: xss(x?.description?.replace(/\\n\s?/g, '<br/>')) ?? '',
    id: x.proposalId,
    title: x.title ?? '',
    status: x.status ?? '',
  }));
};

export const useProposals = () => {
  const [state, setState] = useState<ProposalsState>({
    loading: true,
    exists: true,
    items: [],
    hasNextPage: false,
    isNextPageLoading: true,
    rawDataTotal: 0,
  });

  const handleSetState = useCallback(
    (stateChange: (prevState: ProposalsState) => ProposalsState) => {
      setState((prevState) => {
        const newState = stateChange(prevState);
        return R.equals(prevState, newState) ? prevState : newState;
      });
    },
    []
  );

  // ================================
  // proposals query
  // ================================

  const proposalQuery = useProposalsQuery({
    variables: {
      limit: 50,
      offset: 0,
    },
    onCompleted: (data) => {
      const newItems = R.uniq([...state.items, ...formatProposals(data)]);
      handleSetState((prevState) => ({
        ...prevState,
        loading: false,
        items: newItems,
        hasNextPage: newItems.length < (data.total?.aggregate?.count ?? 0),
        isNextPageLoading: false,
        rawDataTotal: data.total?.aggregate?.count ?? prevState.rawDataTotal,
      }));
    },
  });

  const loadNextPage = async () => {
    handleSetState((prevState) => ({ ...prevState, isNextPageLoading: true }));
    // refetch query
    await proposalQuery
      .fetchMore({
        variables: {
          offset: state.items.length,
          limit: 50,
        },
      })
      .then(({ data }) => {
        const newItems = R.uniq([...state.items, ...formatProposals(data)]);
        // set new state
        handleSetState((prevState) => ({
          ...prevState,
          items: newItems,
          isNextPageLoading: false,
          hasNextPage: newItems.length < (data.total?.aggregate?.count ?? 0),
          rawDataTotal: data.total?.aggregate?.count ?? prevState.rawDataTotal,
        }));
      });
  };

  const itemCount = state.hasNextPage ? state.items.length + 1 : state.items.length;
  const loadMoreItems = state.isNextPageLoading ? () => null : loadNextPage;
  const isItemLoaded = (index: number) => !state.hasNextPage || index < state.items.length;

  return {
    state,
    loadNextPage,
    itemCount,
    loadMoreItems,
    isItemLoaded,
  };
};

// =========================
// overview
// =========================
const formatOverview = (data: ProposalDetailsQuery) => {
  const DEFAULT_TIME = '0001-01-01T00:00:00';
  let votingStartTime = data?.proposal?.[0]?.votingStartTime ?? DEFAULT_TIME;
  votingStartTime = votingStartTime === DEFAULT_TIME ? '' : votingStartTime;
  let votingEndTime = data?.proposal?.[0]?.votingEndTime ?? DEFAULT_TIME;
  votingEndTime = votingEndTime === DEFAULT_TIME ? '' : votingEndTime;

  const overview = {
    proposer: data?.proposal?.[0]?.proposer ?? '',
    content: data?.proposal?.[0]?.content ?? '',
    title: data?.proposal?.[0]?.title ?? '',
    id: data?.proposal?.[0]?.proposalId ?? '',
    description: data?.proposal?.[0]?.description ?? '',
    status: data?.proposal?.[0]?.status ?? '',
    submitTime: data?.proposal?.[0]?.submitTime ?? '',
    proposalType: data?.proposal?.[0]?.proposalType ?? '',
    depositEndTime: data?.proposal?.[0]?.depositEndTime ?? '',
    votingStartTime,
    votingEndTime,
  };

  return overview;
};

// ==========================
// parsers
// ==========================
const formatProposalQuery = (data: ProposalDetailsQuery) => {
  const stateChange: Partial<ProposalState> = {
    loading: false,
  };

  if (!data.proposal.length) {
    stateChange.exists = false;
    return stateChange;
  }

  stateChange.overview = formatOverview(data);

  return stateChange;
};

export const useProposalDetails = () => {
  const router = useRouter();
  const [state, setState] = useState<ProposalState>({
    loading: true,
    exists: true,
    overview: {
      proposer: '',
      content: {
        recipient: '',
        amount: [],
      },
      title: '',
      id: 0,
      description: '',
      status: '',
      submitTime: '',
      proposalType: '',
      depositEndTime: '',
      votingStartTime: '',
      votingEndTime: '',
    },
  });

  const handleSetState = useCallback((stateChange: (prevState: ProposalState) => ProposalState) => {
    setState((prevState) => {
      const newState = stateChange(prevState);
      return R.equals(prevState, newState) ? prevState : newState;
    });
  }, []);

  // ==========================
  // fetch data
  // ==========================
  useProposalDetailsQuery({
    variables: {
      proposalId: parseFloat((router?.query?.id as string) ?? '0'),
    },
    onCompleted: (data) => {
      handleSetState((prevState) => ({ ...prevState, ...formatProposalQuery(data) }));
    },
  });

  return {
    state,
  };
};

const { votingPowerTokenUnit } = chainConfig;

const defaultTokenUnit: TokenUnit = {
  value: '0',
  baseDenom: '',
  displayDenom: '',
  exponent: 0,
};

export const useVotesGraph = () => {
  const router = useRouter();
  const [state, setState] = useState<VotesGraphState>({
    votes: {
      yes: defaultTokenUnit,
      no: defaultTokenUnit,
      abstain: defaultTokenUnit,
      veto: defaultTokenUnit,
    },
    bonded: defaultTokenUnit,
    quorum: '0',
  });

  const handleSetState = useCallback(
    (stateChange: (prevState: VotesGraphState) => VotesGraphState) => {
      setState((prevState) => {
        const newState = stateChange(prevState);
        return R.equals(prevState, newState) ? prevState : newState;
      });
    },
    []
  );

  useProposalDetailsTallyQuery({
    variables: {
      proposalId: parseFloat((router?.query?.id as string) ?? '0'),
    },
    onCompleted: (data) => {
      handleSetState((prevState) => ({ ...prevState, ...foramtProposalTally(data) }));
    },
  });

  const foramtProposalTally = (data: ProposalDetailsTallyQuery) => {
    const quorumRaw = data.quorum?.[0]?.tallyParams?.quorum ?? '0';

    return {
      votes: {
        yes: formatToken(data?.proposalTallyResult?.[0]?.yes ?? '0', votingPowerTokenUnit),
        no: formatToken(data?.proposalTallyResult?.[0]?.no ?? '0', votingPowerTokenUnit),
        veto: formatToken(data?.proposalTallyResult?.[0]?.noWithVeto ?? '0', votingPowerTokenUnit),
        abstain: formatToken(data?.proposalTallyResult?.[0]?.abstain ?? '0', votingPowerTokenUnit),
      },
      bonded: formatToken(data?.stakingPool?.[0]?.bondedTokens ?? '0', votingPowerTokenUnit),
      quorum: Big(quorumRaw)?.times(100).toFixed(2),
    };
  };

  return {
    state,
  };
};

const formatVotes = (data: ProposalDetailsVotesQuery) => {
  const validatorDict: { [key: string]: unknown } = {};
  const validators = data.validatorStatuses.map((x) => {
    const selfDelegateAddress = x?.validator?.validatorInfo?.selfDelegateAddress ?? '';
    validatorDict[selfDelegateAddress] = false;
    return selfDelegateAddress;
  });

  let yes = 0;
  let no = 0;
  let abstain = 0;
  let veto = 0;

  const votes = data.proposalVote.map((x) => {
    if (x.option === 'VOTE_OPTION_YES') {
      yes += 1;
    }
    if (x.option === 'VOTE_OPTION_ABSTAIN') {
      abstain += 1;
    }
    if (x.option === 'VOTE_OPTION_NO') {
      no += 1;
    }
    if (x.option === 'VOTE_OPTION_NO_WITH_VETO') {
      veto += 1;
    }
    if (validatorDict[x.voterAddress] === false) {
      validatorDict[x.voterAddress] = true;
    }

    return {
      user: x.voterAddress,
      vote: x.option,
    };
  });

  // =====================================
  // Get data for active validators that did not vote
  // =====================================
  const validatorsNotVoted = validators
    .filter((x) => validatorDict[x] === false)
    .map((address) => ({
      user: toValidatorAddress(address),
      vote: 'NOT_VOTED',
    }));

  return {
    data: votes,
    validatorsNotVoted,
    voteCount: {
      yes,
      no,
      veto,
      abstain,
      didNotVote: validatorsNotVoted.length,
    },
  };
};

export const useVotes = (resetPagination: () => void) => {
  const router = useRouter();
  const [state, setState] = useState<VoteState>({
    data: [],
    validatorsNotVoted: [],
    voteCount: {
      yes: 0,
      no: 0,
      abstain: 0,
      veto: 0,
      didNotVote: 0,
    },
    tab: 0,
  });

  const handleSetState = useCallback((stateChange: (prevState: VoteState) => VoteState) => {
    setState((prevState) => {
      const newState = stateChange(prevState);
      return R.equals(prevState, newState) ? prevState : newState;
    });
  }, []);

  const handleTabChange = useCallback(
    (_event: SyntheticEvent<Element, globalThis.Event>, newValue: number) => {
      if (resetPagination) {
        resetPagination();
      }
      handleSetState((prevState) => ({ ...prevState, tab: newValue }));
    },
    [handleSetState, resetPagination]
  );

  useProposalDetailsVotesQuery({
    variables: {
      proposalId: parseFloat((router?.query?.id as string) ?? '0'),
    },
    onCompleted: (data) => {
      handleSetState((prevState) => ({ ...prevState, ...formatVotes(data) }));
    },
  });

  return {
    state,
    handleTabChange,
  };
};
