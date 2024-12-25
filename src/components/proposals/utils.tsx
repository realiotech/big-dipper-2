import type { TFunction } from '@/hooks/useAppTranslation';
import Big from 'big.js';
import * as R from 'ramda';
import { formatNumber } from '@/utils/format_token';
import type { VotesType, VoteType } from './types';

export const getStatusInfo = (status: string, t: TFunction) => {
  const statusDict = {
    PROPOSAL_STATUS_DEPOSIT_PERIOD: {
      value: t('deposit'),
      tag: 'blue',
    },
    PROPOSAL_STATUS_INVALID: {
      value: t('invalid'),
      tag: 'gray',
    },
    PROPOSAL_STATUS_VOTING_PERIOD: {
      value: t('voting'),
      tag: 'yellow',
    },
    PROPOSAL_STATUS_PASSED: {
      value: t('passed'),
      tag: 'green',
    },
    PROPOSAL_STATUS_REJECTED: {
      value: t('rejected'),
      tag: 'purple',
    },
    PROPOSAL_STATUS_FAILED: {
      value: t('failed'),
      tag: 'red',
    },
  };

  if (statusDict[status as keyof typeof statusDict]) {
    return statusDict[status as keyof typeof statusDict];
  }
  return {
    value: status,
    tag: 'zero',
  };
};

export const getProposalType = (proposalType: string) => {
  let type = proposalType;
  if (proposalType === '/cosmos.gov.v1beta1.TextProposal') {
    type = 'textProposal';
  }

  if (proposalType === '/cosmos.params.v1beta1.ParameterChangeProposal') {
    type = 'parameterChangeProposal';
  }

  if (proposalType === '/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal') {
    type = 'softwareUpgradeProposal';
  }

  if (proposalType === '/cosmos.distribution.v1beta1.CommunityPoolSpendProposal') {
    type = 'communityPoolSpendProposal';
  }

  return type;
};

export const shouldShowData = (status: string) =>
  [
    'PROPOSAL_STATUS_VOTING_PERIOD',
    'PROPOSAL_STATUS_PASSED',
    'PROPOSAL_STATUS_REJECTED',
    'PROPOSAL_STATUS_FAILED',
  ].includes(status);


type FormatGraphType = {
  data: VotesType;
  total: Big;
};

type FormatGraphMapType = {
  [key: string]: FormatGraphMapItemType;
};

type FormatGraphMapItemType = {
  name: string;
  value: number;
  display: string;
  percentage: string;
};
export const formatGraphData = ({ data, total }: FormatGraphType) => {
  const keys = R.keys(data);
  const formattedData = keys.map((x, i) => {
    const selectedData = data[x];
    return {
      name: x as string,
      value: Big(selectedData.value).toNumber(),
      display: formatNumber(selectedData.value, selectedData.exponent),
      percentage: total.gt(0)
        ? `${Big(selectedData.value).div(total)?.times(100).toFixed(2)}%`
        : '0%',
    };
  });

  const notEmpty = formattedData.some((x) => x.value > 0);

  if (!notEmpty) {
    formattedData.push({
      name: 'empty',
      value: 2400,
      percentage: '0%',
      display: '',
    });
  }
  
  var formatedObj: FormatGraphMapType = {}
  formattedData.forEach(item => {
    formatedObj[item.name] = item
  })

  return formatedObj;
};

export const getVoteKey = (vote: string) => {
  const votes = {
    VOTE_OPTION_YES: 'yes',
    VOTE_OPTION_NO: 'no',
    VOTE_OPTION_NO_WITH_VETO: 'veto',
    VOTE_OPTION_ABSTAIN: 'abstain',
    NOT_VOTED: 'notVoted',
  };

  return votes[vote as keyof typeof votes] || vote;
};

export const filterDataByTab = (props: { data: VoteType[]; notVoted: VoteType[]; tab: number }) => {
  if (props.tab === 5) {
    return props.notVoted;
  }

  return props.data.filter((x) => {
    if (props.tab === 1) {
      return x.vote === 'VOTE_OPTION_YES';
    }

    if (props.tab === 2) {
      return x.vote === 'VOTE_OPTION_NO';
    }

    if (props.tab === 3) {
      return x.vote === 'VOTE_OPTION_NO_WITH_VETO';
    }

    if (props.tab === 4) {
      return x.vote === 'VOTE_OPTION_ABSTAIN';
    }

    return true;
  });
};
