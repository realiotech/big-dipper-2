import React, { useMemo, useState } from "react";
import { Box, Flex, Grid, Link as ChakraLink, SimpleGrid, Skeleton, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import dayjs from "@/utils/dayjs";
import { Panel } from "@/components/explorer/panel";
import { PageTitle } from "@/components/explorer/page_title";
import { StatCard } from "@/components/explorer/stat_card";
import { ExplorerTabs } from "@/components/explorer/tabs";
import { StatusTag } from "@/components/explorer/badges";
import { AddressLink } from "@/components/explorer/address_link";
import { formatPercent, formatUtc as utc, timeAgo } from "@/components/explorer/format";
import { Proposal, proposalStatus, useGovernance } from "./hooks";
import { TallyBar } from "./tally";

const TABS = {
  all: () => true,
  voting: (p: Proposal) => p.status === "PROPOSAL_STATUS_VOTING_PERIOD",
  passed: (p: Proposal) => p.status === "PROPOSAL_STATUS_PASSED",
  rejected: (p: Proposal) => p.status === "PROPOSAL_STATUS_REJECTED" || p.status === "PROPOSAL_STATUS_FAILED",
};
type Tab = keyof typeof TABS;

const ProposalRow = ({ proposal }: { proposal: Proposal }) => {
  const status = proposalStatus(proposal.status);
  const votingOver = proposal.votingEndTime && dayjs.utc(proposal.votingEndTime).isBefore(dayjs.utc());

  return (
    <Grid
      templateColumns={{ base: "1fr", lg: "1fr 320px" }}
      gap={{ base: "4", lg: "10" }}
      py="5"
      borderTopWidth="1px"
      borderColor="explorer.border"
      _first={{ borderTopWidth: 0 }}
    >
      <Box minW="0">
        <Flex align="center" gap="3" mb="2">
          <Text fontSize="sm" color="explorer.muted">
            #{proposal.id}
          </Text>
          <StatusTag tone={status.tone}>{status.label}</StatusTag>
        </Flex>
        <ChakraLink asChild color="explorer.link" fontSize="md" fontWeight="600">
          <NextLink href={`/proposals/${proposal.id}`}>{proposal.title}</NextLink>
        </ChakraLink>
        <Text mt="2" fontSize="sm" color="explorer.muted" lineClamp={2} whiteSpace="pre-line">
          {proposal.description}
        </Text>
        <Flex mt="3" gap={{ base: "2", md: "5" }} wrap="wrap" fontSize="xs" color="explorer.muted">
          <Text>Submitted {utc(proposal.submitTime)}</Text>
          {proposal.votingEndTime && (
            <Text>
              {votingOver ? "Voting ended" : "Voting ends"} {utc(proposal.votingEndTime)}
            </Text>
          )}
          {proposal.proposer && (
            <Flex gap="2" align="center">
              Proposer <AddressLink address={proposal.proposer} beginning={8} ending={8} />
            </Flex>
          )}
        </Flex>
      </Box>
      {proposal.tally.total > 0 ? (
        <Box pt={{ base: "0", lg: "1" }}>
          <TallyBar tally={proposal.tally} />
        </Box>
      ) : (
        <Text fontSize="xs" color="explorer.muted" pt={{ base: "0", lg: "1" }}>
          No votes yet
        </Text>
      )}
    </Grid>
  );
};

export default function ProposalList() {
  const { proposals, stats, loading } = useGovernance();
  const [tab, setTab] = useState<Tab>("all");
  const rows = useMemo(() => proposals.filter(TABS[tab]), [proposals, tab]);
  const counts = useMemo(
    () => Object.fromEntries(Object.entries(TABS).map(([key, match]) => [key, proposals.filter(match).length])),
    [proposals]
  );

  return (
    <>
      <PageTitle
        title="Governance"
        subtitle={loading ? " " : `Showing ${rows.length} of ${stats.total} proposals`}
      />
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap="4" mb="5">
        <StatCard
          label="Proposals"
          loading={loading}
          value={stats.total}
          rows={[
            { label: "Passed", value: stats.passed },
            { label: "Rejected or failed", value: stats.rejected },
          ]}
        />
        <StatCard
          label="In voting now"
          loading={loading}
          value={stats.voting}
          rows={[
            { label: "In deposit period", value: stats.deposit },
            { label: "Latest proposal", value: stats.latest ? `#${stats.latest.id}` : "—" },
          ]}
        />
        <StatCard
          label="Pass rate"
          loading={loading}
          value={formatPercent(stats.passRate)}
          rows={[
            { label: "Decided proposals", value: stats.decided },
            { label: "First proposal", value: stats.first ? `#${stats.first.id}` : "—" },
          ]}
        />
        <StatCard
          label="Latest activity"
          loading={loading}
          value={stats.latest?.submitTime ? timeAgo(stats.latest.submitTime) : "—"}
          rows={[
            { label: "Submitted", value: utc(stats.latest?.submitTime ?? "") },
            { label: "Status", value: stats.latest ? proposalStatus(stats.latest.status).label : "—" },
          ]}
        />
      </SimpleGrid>
      <Panel>
        <ExplorerTabs
          value={tab}
          onChange={(value) => setTab(value as Tab)}
          items={[
            { value: "all", label: "All", count: counts.all },
            { value: "voting", label: "Voting", count: counts.voting },
            { value: "passed", label: "Passed", count: counts.passed },
            { value: "rejected", label: "Rejected", count: counts.rejected },
          ]}
        />
        {loading ? (
          <Stack gap="4" pt="3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} h="96px" />
            ))}
          </Stack>
        ) : rows.length ? (
          rows.map((proposal) => <ProposalRow key={proposal.id} proposal={proposal} />)
        ) : (
          <Text py="6" textAlign="center" fontSize="sm" color="explorer.muted">
            No proposals
          </Text>
        )}
      </Panel>
    </>
  );
}
