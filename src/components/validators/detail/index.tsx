import React, { useState } from "react";
import { Box, Flex, Grid, Link as ChakraLink, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import numeral from "numeral";
import { BLOCK_DETAILS, VALIDATOR_DETAILS } from "@/utils/go_to_page";
import { Panel } from "@/components/explorer/panel";
import { PageTitle } from "@/components/explorer/page_title";
import { StatCard } from "@/components/explorer/stat_card";
import { DataTable, Column } from "@/components/explorer/data_table";
import { CopyButton } from "@/components/explorer/copy_button";
import { AddressLink } from "@/components/explorer/address_link";
import { StatusTag, ValidatorAvatar, validatorStatus } from "@/components/explorer/badges";
import { formatPercent, timeAgo } from "@/components/explorer/format";
import { NotFound } from "@/components/explorer/not_found";
import { ExplorerTabs, TabPanel } from "@/components/explorer/tabs";
import { Paged, tokens } from "@/components/assets/parts";
import { DelegateDialog } from "../dialog";
import { DelegationRow, PROPOSED_WINDOW, UnbondingRow, useValidatorDetails, useValidatorStaking } from "./hooks";

type ProposedBlock = { height: number; timestamp: string; txs: number; gasUsed: number };

const blockColumns: Column<ProposedBlock>[] = [
  {
    key: "height",
    header: "Height",
    render: (row) => (
      <ChakraLink asChild color="explorer.link">
        <NextLink href={BLOCK_DETAILS(row.height)}>{numeral(row.height).format("0,0")}</NextLink>
      </ChakraLink>
    ),
  },
  { key: "age", header: "Age", render: (row) => <Text color="explorer.muted">{timeAgo(row.timestamp)}</Text> },
  { key: "txs", header: "Txns", align: "end", render: (row) => numeral(row.txs).format("0,0") },
  { key: "gas", header: "Gas used", align: "end", render: (row) => numeral(row.gasUsed).format("0,0") },
];

const delegationColumns = (symbol: string): Column<DelegationRow>[] => [
  { key: "rank", header: "#", width: "56px", align: "end", render: (row) => <Text color="explorer.muted">{row.rank}</Text> },
  { key: "delegator", header: "Delegator", render: (row) => <Box pl="4"><AddressLink address={row.address} beginning={14} ending={8} /></Box> },
  { key: "amount", header: `Amount (${symbol})`, align: "end", render: (row) => tokens(row.amount) },
  { key: "weight", header: "Bond weight", align: "end", render: (row) => numeral(row.bondWeight).format("0.0[0]") },
  { key: "power", header: "Voting power", align: "end", render: (row) => tokens(row.power) },
  { key: "share", header: "Share of validator", align: "end", render: (row) => formatPercent(row.share) },
];

const unbondingColumns = (symbol: string): Column<UnbondingRow>[] => [
  { key: "delegator", header: "Delegator", render: (row) => <AddressLink address={row.address} beginning={14} ending={8} /> },
  { key: "amount", header: `Amount (${symbol})`, align: "end", render: (row) => tokens(row.amount) },
  {
    key: "height",
    header: "Started at block",
    align: "end",
    render: (row) => (
      <ChakraLink asChild color="explorer.link">
        <NextLink href={BLOCK_DETAILS(row.height)}>{numeral(row.height).format("0,0")}</NextLink>
      </ChakraLink>
    ),
  },
];

const ProfileRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Flex justify="space-between" gap="4" py="3" borderTopWidth="1px" borderColor="explorer.border" fontSize="sm">
    <Text color="explorer.muted" flexShrink={0}>
      {label}
    </Text>
    <Box textAlign="end" minW="0" wordBreak="break-all">
      {children}
    </Box>
  </Flex>
);

const percent = (value: number) => formatPercent(value);

export default function ValidatorDetails() {
  const v = useValidatorDetails();
  const staking = useValidatorStaking(v.address, v.asset?.decimals ?? 18, v.votingPower);
  const [tab, setTab] = useState("delegations");
  const symbol = v.asset?.symbol ?? "";
  const status = validatorStatus(v.status, v.jailed, v.tombstoned);
  const crumbs = [{ label: "Validators", href: "/validators" }, { label: v.loading ? "…" : v.moniker }];

  if (!v.exists) {
    return <NotFound />;
  }

  return (
    <Stack gap="5">
      <PageTitle
        crumbs={crumbs}
        title={v.loading ? " " : v.moniker}
        subtitle={
          <Flex as="span" align="center" gap="1">
            <Text as="span" color="explorer.link" wordBreak="break-all">
              {v.address}
            </Text>
            <CopyButton value={v.address} label="Copy operator address" />
          </Flex>
        }
        actions={
          !v.loading && (
            <Flex gap="2" align="center" flexShrink={0}>
              <StatusTag tone={status.tone}>{status.label}</StatusTag>
              {v.rank && <StatusTag tone="accent">Rank #{v.rank}</StatusTag>}
              {v.asset && (
                <DelegateDialog
                  denom={v.denom}
                  denomSymbol={v.asset.symbol}
                  decimal={v.asset.decimals}
                  operatorName={v.moniker}
                  operatorAddress={v.address}
                />
              )}
            </Flex>
          )
        }
      />

      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap="4">
        <StatCard
          label="Voting power"
          loading={v.loading}
          value={numeral(v.votingPower).format("0,0")}
          suffix={v.asset?.symbol}
          rows={[
            { label: "Share of active set", value: percent(v.activeShare) },
            { label: "Staking token", value: v.asset ? `${v.asset.symbol} · ${v.asset.name}` : "—" },
          ]}
        />
        <StatCard
          label="Commission"
          loading={v.loading}
          value={percent(v.commission)}
          rows={[
            { label: "Max rate", value: percent(v.maxRate) },
            { label: "Max change rate", value: percent(v.maxChangeRate) },
          ]}
        />
        <StatCard
          label="Missed blocks"
          loading={v.loading}
          value={numeral(v.missedBlocks).format("0,0")}
          rows={[
            { label: "Signing window", value: `${numeral(v.signedBlocksWindow).format("0,0")} blocks` },
            { label: "Tombstoned", value: v.tombstoned ? "Yes" : "No" },
          ]}
        />
        <StatCard
          label="Delegators"
          loading={v.loading}
          value={numeral(v.delegators).format("0,0")}
          rows={[
            { label: "Largest delegation", value: numeral(v.largestDelegation).format("0,0") },
            { label: "Blocks proposed (recent window)", value: v.proposed.loading ? "…" : numeral(v.proposed.recentCount).format("0,0") },
          ]}
        />
      </SimpleGrid>

      {/* minmax(0, …): a plain 1fr track would grow to the blocks table's minimum width on phones. */}
      <Grid templateColumns={{ base: "minmax(0, 1fr)", lg: "440px minmax(0, 1fr)" }} gap="5" alignItems="start">
        <Panel>
          <Text fontSize="md" fontWeight="600" mb="4">
            Profile
          </Text>
          <Flex gap="3" align="center" mb="4">
            <ValidatorAvatar name={v.moniker} src={v.avatarUrl} size="44px" />
            <Box minW="0">
              <Text fontSize="sm" color="explorer.text" truncate>
                {v.moniker}
              </Text>
              {v.website && (
                <ChakraLink href={v.website.startsWith("http") ? v.website : `https://${v.website}`} target="_blank" rel="noreferrer" fontSize="sm" color="explorer.link">
                  {v.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </ChakraLink>
              )}
            </Box>
          </Flex>
          {v.details && (
            <Text fontSize="sm" color="explorer.muted" mb="4" wordBreak="break-word">
              {v.details}
            </Text>
          )}
          <ProfileRow label="Operator address">
            <AddressLink href={VALIDATOR_DETAILS(v.address)} address={v.address} beginning={14} />
          </ProfileRow>
          <ProfileRow label="Self delegate">
            {v.selfDelegateAddress ? <AddressLink address={v.selfDelegateAddress} beginning={14} /> : "—"}
          </ProfileRow>
          <ProfileRow label="Identity">{v.identity || "—"}</ProfileRow>
          <ProfileRow label="Security contact">{v.securityContact || "—"}</ProfileRow>
          <ProfileRow label="Status">{v.jailed ? "Jailed" : v.status === 3 ? "Bonded" : status.label}</ProfileRow>
        </Panel>

        <Panel>
          <Text fontSize="md" fontWeight="600">
            Proposed blocks
          </Text>
          <Text fontSize="sm" color="explorer.muted" mb="3">
            {v.proposed.loading
              ? " "
              : `${numeral(v.proposed.recentCount).format("0,0")} in the last ${numeral(PROPOSED_WINDOW).format("0,0")} blocks`}
          </Text>
          <DataTable
            columns={blockColumns}
            rows={v.proposed.blocks}
            rowKey={(row) => row.height}
            loading={v.proposed.loading}
            skeletonRows={10}
          />
        </Panel>
      </Grid>

      <Panel>
        <Text fontSize="md" fontWeight="600">
          Delegations
        </Text>
        <Text fontSize="sm" color="explorer.muted" mb="3">
          Accounts staking {symbol || "tokens"} with this validator, largest first
        </Text>
        <ExplorerTabs
          value={tab}
          onChange={setTab}
          items={[
            { value: "delegations", label: "Delegations", count: staking.delegations.count },
            { value: "unbondings", label: "Unbondings", count: staking.unbondings.count },
          ]}
        >
          <TabPanel value="delegations" pt="0">
            <DataTable
              columns={delegationColumns(symbol)}
              rows={staking.delegations.rows}
              rowKey={(row) => row.address}
              loading={staking.delegations.loading}
              emptyText="No delegations"
            />
            <Paged count={staking.delegations.count} page={staking.delegations.page} setPage={staking.delegations.setPage} label="delegations" />
          </TabPanel>
          <TabPanel value="unbondings" pt="0">
            <DataTable
              columns={unbondingColumns(symbol)}
              rows={staking.unbondings.rows}
              rowKey={(row) => `${row.address}:${row.height}:${row.amount}`}
              loading={staking.unbondings.loading}
              emptyText="No unbondings"
            />
            <Paged count={staking.unbondings.count} page={staking.unbondings.page} setPage={staking.unbondings.setPage} label="unbondings" />
          </TabPanel>
        </ExplorerTabs>
      </Panel>
    </Stack>
  );
}
