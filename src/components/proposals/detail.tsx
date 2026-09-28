import React from "react";
import { Box, Flex, Grid, Link as ChakraLink, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import numeral from "numeral";
import { BLOCK_DETAILS } from "@/utils/go_to_page";
import { Panel } from "@/components/explorer/panel";
import { PageTitle } from "@/components/explorer/page_title";
import { DataTable, Column } from "@/components/explorer/data_table";
import { StatusTag, Tag } from "@/components/explorer/badges";
import { AddressLink } from "@/components/explorer/address_link";
import { formatCompact, formatPercent, formatUtc as utc, timeAgo } from "@/components/explorer/format";
import { NotFound } from "@/components/explorer/not_found";
import { proposalStatus, useProposal } from "./hooks";
import { TallyBar } from "./tally";

type Vote = { voter: string; option: string; weight: number; height: number; timestamp: string };

const VOTE_LABEL: Record<string, { label: string; color: string }> = {
  VOTE_OPTION_YES: { label: "Yes", color: "explorer.success" },
  VOTE_OPTION_NO: { label: "No", color: "explorer.warning" },
  VOTE_OPTION_NO_WITH_VETO: { label: "No with veto", color: "explorer.critical" },
  VOTE_OPTION_ABSTAIN: { label: "Abstain", color: "explorer.muted" },
};

const voteColumns: Column<Vote>[] = [
  { key: "voter", header: "Voter", render: (row) => <AddressLink address={row.voter} /> },
  {
    key: "vote",
    header: "Vote",
    align: "end",
    render: (row) => {
      const vote = VOTE_LABEL[row.option] ?? { label: row.option, color: "explorer.muted" };
      return (
        <Flex justify="flex-end">
          <Tag color={vote.color}>{vote.label}</Tag>
        </Flex>
      );
    },
  },
  { key: "weight", header: "Weight", align: "end", render: (row) => formatPercent(row.weight) },
  {
    key: "height",
    header: "Height",
    align: "end",
    render: (row) => (
      <ChakraLink asChild color="explorer.link">
        <NextLink href={BLOCK_DETAILS(row.height)}>{numeral(row.height).format("0,0")}</NextLink>
      </ChakraLink>
    ),
  },
  { key: "time", header: "Time", align: "end", render: (row) => <Text color="explorer.muted">{row.timestamp ? timeAgo(row.timestamp) : "—"}</Text> },
];

const PanelTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <Box mb="4">
    <Text fontSize="md" fontWeight="600" color="explorer.text">
      {title}
    </Text>
    {subtitle && (
      <Text fontSize="sm" color="explorer.muted">
        {subtitle}
      </Text>
    )}
  </Box>
);

const TimelineRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Flex justify="space-between" gap="4" py="3" borderTopWidth="1px" borderColor="explorer.border" fontSize="sm" _first={{ borderTopWidth: 0 }}>
    <Text color="explorer.muted">{label}</Text>
    <Box textAlign="end" color="explorer.text">
      {children}
    </Box>
  </Flex>
);

export default function ProposalDetail() {
  const { id, proposal, votes, turnout, loading, exists } = useProposal();
  const crumbs = [{ label: "Governance", href: "/proposals" }, { label: `#${id || ""}` }];

  if (!exists || (!loading && !proposal)) {
    return <NotFound />;
  }

  const status = proposal ? proposalStatus(proposal.status) : undefined;

  return (
    <Stack gap="5">
      <PageTitle
        crumbs={crumbs}
        title={proposal?.title ?? " "}
        subtitle={
          status && (
            <Flex as="span" align="center" gap="3">
              <StatusTag tone={status.tone}>{status.label}</StatusTag>
              Submitted {utc(proposal?.submitTime ?? "")}
            </Flex>
          )
        }
      />

      <Grid templateColumns={{ base: "1fr", lg: "1fr 360px" }} gap="5" alignItems="start">
        <Stack gap="5" minW="0">
          <Panel>
            <PanelTitle title="Description" />
            <Text fontSize="sm" color="explorer.text" whiteSpace="pre-line" wordBreak="break-word">
              {proposal?.description || "—"}
            </Text>
          </Panel>
          <Panel>
            <PanelTitle title="Votes" subtitle={loading ? undefined : `${votes.length} recorded`} />
            <DataTable columns={voteColumns} rows={votes} rowKey={(row) => `${row.voter}:${row.height}`} loading={loading} skeletonRows={8} emptyText="No votes recorded" />
          </Panel>
        </Stack>

        <Stack gap="5">
          <Panel>
            <PanelTitle title="Proposal result" />
            {proposal && <TallyBar tally={proposal.tally} />}
            <Text mt="3" fontSize="xs" color="explorer.muted">
              {formatCompact(proposal?.tally.total ?? 0)} voting power counted
            </Text>
          </Panel>
          <Panel>
            <PanelTitle title="Timeline" />
            <TimelineRow label="Proposal ID">#{id}</TimelineRow>
            <TimelineRow label="Proposer">{proposal?.proposer ? <AddressLink address={proposal.proposer} beginning={8} /> : "—"}</TimelineRow>
            <TimelineRow label="Submitted">{utc(proposal?.submitTime ?? "")}</TimelineRow>
            <TimelineRow label="Deposit ends">{utc(proposal?.depositEndTime ?? "")}</TimelineRow>
            <TimelineRow label="Voting starts">{utc(proposal?.votingStartTime ?? "")}</TimelineRow>
            <TimelineRow label="Voting ends">{utc(proposal?.votingEndTime ?? "")}</TimelineRow>
            <TimelineRow label="Turnout">{formatPercent(turnout)}</TimelineRow>
          </Panel>
        </Stack>
      </Grid>
    </Stack>
  );
}
