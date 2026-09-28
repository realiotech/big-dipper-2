import { useMemo } from 'react';
import { useRouter } from 'next/router';
import dayjs from '@/utils/dayjs';
import {
  GovernanceProposalsQuery,
  useGovernanceProposalsQuery,
  useProposalPageQuery,
} from '@/graphql/types/general_types';
import type { StatusTone } from '@/components/explorer/badges';

type RawProposal = GovernanceProposalsQuery['proposals'][number];

export type Tally = { yes: number; no: number; noWithVeto: number; abstain: number; total: number };

export type Proposal = {
  id: number;
  title: string;
  description: string;
  status: string;
  submitTime: string;
  depositEndTime: string;
  votingStartTime: string;
  votingEndTime: string;
  proposer: string;
  tally: Tally;
};

const STATUS: Record<string, { label: string; tone: StatusTone }> = {
  PROPOSAL_STATUS_PASSED: { label: 'Passed', tone: 'success' },
  PROPOSAL_STATUS_REJECTED: { label: 'Rejected', tone: 'danger' },
  PROPOSAL_STATUS_FAILED: { label: 'Failed', tone: 'danger' },
  PROPOSAL_STATUS_VOTING_PERIOD: { label: 'Voting', tone: 'accent' },
  PROPOSAL_STATUS_DEPOSIT_PERIOD: { label: 'Deposit', tone: 'neutral' },
  DEPOSIT_EXPIRED: { label: 'Deposit expired', tone: 'neutral' },
  VOTING_ENDED: { label: 'Voting ended', tone: 'neutral' },
};

export const proposalStatus = (status: string) => STATUS[status] ?? { label: status.replace('PROPOSAL_STATUS_', ''), tone: 'neutral' as StatusTone };

// Tally amounts are in the bond denom's base unit (18 decimals).
const toPower = (value?: string) => Number(value ?? 0) / 1e18;

const formatProposal = (x: RawProposal): Proposal => {
  const content = Array.isArray(x.content) ? x.content[0]?.content : undefined;
  const tally = x.tally?.[0];
  const yes = toPower(tally?.yes);
  const no = toPower(tally?.no);
  const noWithVeto = toPower(tally?.noWithVeto);
  const abstain = toPower(tally?.abstain);
  const past = (time?: string | null) => Boolean(time && dayjs.utc(time).isBefore(dayjs.utc()));
  // A deposit period that ended without voting starting never reached voting.
  const depositExpired = x.status === 'PROPOSAL_STATUS_DEPOSIT_PERIOD' && !x.votingStartTime && past(x.depositEndTime);
  // The indexer can miss the final result (proposal #33), leaving a finished
  // vote marked as still voting.
  const votingEnded = x.status === 'PROPOSAL_STATUS_VOTING_PERIOD' && past(x.votingEndTime);

  return {
    id: x.id,
    title: x.title || content?.title || `Proposal #${x.id}`,
    // Descriptions are stored with escaped newlines.
    description: (x.description || content?.description || '').replace(/\\n/g, '\n'),
    status: depositExpired ? 'DEPOSIT_EXPIRED' : votingEnded ? 'VOTING_ENDED' : x.status ?? '',
    submitTime: x.submitTime ?? '',
    depositEndTime: x.depositEndTime ?? '',
    votingStartTime: x.votingStartTime ?? '',
    votingEndTime: x.votingEndTime ?? '',
    proposer: x.proposerAddress,
    tally: { yes, no, noWithVeto, abstain, total: yes + no + noWithVeto + abstain },
  };
};

export const useGovernance = () => {
  const { data, loading } = useGovernanceProposalsQuery();

  return useMemo(() => {
    const proposals = (data?.proposals ?? []).map(formatProposal);
    const count = (status: string) => proposals.filter((p) => p.status === status).length;
    const passed = count('PROPOSAL_STATUS_PASSED');
    const rejected = count('PROPOSAL_STATUS_REJECTED') + count('PROPOSAL_STATUS_FAILED');
    const latest = proposals[0];

    return {
      loading,
      proposals,
      stats: {
        total: proposals.length,
        passed,
        rejected,
        voting: count('PROPOSAL_STATUS_VOTING_PERIOD'),
        deposit: count('PROPOSAL_STATUS_DEPOSIT_PERIOD'),
        decided: passed + rejected,
        passRate: passed + rejected ? (passed / (passed + rejected)) * 100 : 0,
        latest,
        first: proposals[proposals.length - 1],
      },
    };
  }, [data, loading]);
};

export const useProposal = () => {
  const router = useRouter();
  const id = Number(router.query.id);
  const { data, loading } = useProposalPageQuery({ variables: { id }, skip: !router.isReady || !id });

  return useMemo(() => {
    const raw = data?.proposal?.[0];
    const proposal = raw ? formatProposal(raw) : undefined;
    const bonded = toPower(data?.stakingPool?.[0]?.bondedTokens);

    return {
      id,
      loading: loading || !router.isReady,
      exists: loading || !router.isReady || Boolean(raw),
      proposal,
      turnout: proposal && bonded ? (proposal.tally.total / bonded) * 100 : 0,
      votes: (data?.votes ?? []).map((vote) => ({
        voter: vote.voterAddress,
        option: vote.option,
        weight: Number(vote.weight ?? 1) * 100,
        height: Number(vote.height),
        timestamp: vote.timestamp ?? '',
      })),
    };
  }, [data, id, loading, router.isReady]);
};
