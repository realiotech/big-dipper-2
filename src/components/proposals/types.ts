export interface ProposalType {
  id: number;
  title: string;
  description: string;
  status: string;
}

export interface ProposalsState {
  loading: boolean;
  exists: boolean;
  hasNextPage: boolean;
  isNextPageLoading: boolean;
  rawDataTotal: number;
  items: ProposalType[];
}

export interface OverviewType {
  title: string;
  id: string | number;
  proposer: string;
  description: string;
  status: string;
  submitTime: string;
  proposalType: string;
  depositEndTime: string;
  votingStartTime: string | null;
  votingEndTime: string | null;
  content: {
    recipient: string;
    amount: Array<{
      amount: string;
      denom: string;
    }>;
  };
}

export interface ProposalState {
  loading: boolean;
  exists: boolean;
  overview: OverviewType;
}

export interface VotesType {
  yes: TokenUnit;
  no: TokenUnit;
  abstain: TokenUnit;
  veto: TokenUnit;
}
export interface VotesGraphState {
  votes: VotesType;
  bonded: TokenUnit;
  quorum: string;
}

export interface VoteType {
  vote: string;
  user: string;
}

export interface VoteCount {
  yes: number;
  no: number;
  veto: number;
  abstain: number;
  didNotVote: number;
}
export interface VoteState {
  data: VoteType[];
  voteCount: VoteCount;
  validatorsNotVoted: VoteType[];
  tab: number;
}

export type ItemType = VoteType;