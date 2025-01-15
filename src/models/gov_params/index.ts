import * as R from 'ramda';

class GovParams {
  public params: {
    minDeposit: Array<{
      denom: string;
      amount: string;
    }>;
    minDepositRatio: string;
    minInitialDepositRatio: string;
    proposalCancelRatio: string;
    maxDepositPeriod: number;
    quorum: string;
    threshold: string;
    vetoThreshold: string;
    votingPeriod: number;
    burnVoteVeto: boolean;
    expeditedMinDeposit: Array<{
      denom: string;
      amount: string;
    }>;
    expeditedThreshold: string;
    expeditedVotingPeriod: string;
  }
 

  constructor(payload: object) {
    this.params = R.pathOr(
      {
        minDeposit: [],
        maxDepositPeriod: 0,
        quorum: '',
        threshold: '',
        vetoThreshold: '',
        votingPeriod: 0,
        minDepositRatio: '',
        minInitialDepositRatio: '',
        proposalCancelRatio: '',
        expeditedMinDeposit: [],
        expeditedThreshold: '',
        expeditedVotingPeriod: '',
        burnVoteVeto: false,
      },
      ['params'],
      payload
    );
  }

  static fromJson(data: object): GovParams {
    return {
      params: {
        minDeposit: R.pathOr<GovParams['params']['minDeposit']>(
          [],
          ['params', 'min_deposit'],
          data
        ).map((x) => ({
          denom: x.denom,
          amount: String(x.amount),
        })),
        maxDepositPeriod: R.pathOr(0, ['params', 'max_deposit_period'], data),
        quorum: R.pathOr('0', ['params', 'quorum'], data),
        threshold: R.pathOr('0', ['params', 'threshold'], data),
        vetoThreshold: R.pathOr('0', ['params', 'veto_threshold'], data),
        votingPeriod: R.pathOr(0, ['params', 'voting_period'], data),
        minDepositRatio: R.pathOr('0', ['params', 'min_deposit_ratio'], data),
        minInitialDepositRatio: R.pathOr('0', ['params', 'min_initial_deposit_ratio'], data),
        proposalCancelRatio: R.pathOr('0', ['params', 'proposal_cancel_ratio'], data),
        expeditedMinDeposit: R.pathOr<GovParams['params']['minDeposit']>(
          [],
          ['params', 'expedited_min_deposit'],
          data
        ).map((x) => ({
          denom: x.denom,
          amount: String(x.amount),
        })),
        expeditedThreshold: R.pathOr('0', ['params', 'expedited_threshold'], data),
        expeditedVotingPeriod: R.pathOr('0', ['params', 'expedited_voting_period'], data),
        burnVoteVeto: R.pathOr(false, ['params', 'burn_vote_veto'], data),
      }
    };
  }
}

export default GovParams;
