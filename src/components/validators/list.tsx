import React, { useMemo, useState } from "react";
import { Box, Flex, Input, SimpleGrid, Text } from "@chakra-ui/react";
import numeral from "numeral";
import { useProfilesRecoil } from "@/recoil/profiles/hooks";
import { Panel } from "@/components/explorer/panel";
import { PageTitle } from "@/components/explorer/page_title";
import { StatCard } from "@/components/explorer/stat_card";
import { DataTable, Column } from "@/components/explorer/data_table";
import { ExplorerTabs } from "@/components/explorer/tabs";
import { ValidatorName } from "@/components/explorer/validator_name";
import { StatusTag, validatorStatus } from "@/components/explorer/badges";
import { TokenDot } from "@/components/explorer/token";
import { formatCompact, formatPercent } from "@/components/explorer/format";
import { useValidators } from "./hooks";
import type { ValidatorType } from "./types";

type Row = ValidatorType & { barWidth: number; position?: number };

const VotingPower = ({ row }: { row: Row }) => (
  <Flex align="center" justify="flex-end" gap="3">
    <Text>{numeral(row.votingPower).format("0,0")}</Text>
    <Box w="96px" h="3px" borderRadius="full" bg="explorer.inset" hideBelow="md">
      <Box h="full" borderRadius="full" bg="explorer.accent" w={`${row.barWidth}%`} />
    </Box>
    <Text w="48px" textAlign="end" color="explorer.muted">
      {formatPercent(row.votingPowerPercent)}
    </Text>
  </Flex>
);

const columns: Column<Row>[] = [
  { key: "rank", header: "#", width: "48px", align: "end", render: (row) => <Text color="explorer.muted">{row.position}</Text> },
  { key: "validator", header: "Validator", render: (row) => <Box pl="4"><ValidatorName address={row.validator} /></Box> },
  { key: "token", header: "Staking token", width: "120px", render: (row) => <TokenDot denom={row.denom} /> },
  { key: "power", header: "Voting power", align: "end", width: "300px", render: (row) => <VotingPower row={row} /> },
  { key: "commission", header: "Commission", align: "end", width: "110px", render: (row) => formatPercent(row.commission) },
  { key: "missed", header: "Missed blocks", align: "end", width: "120px", render: (row) => numeral(row.missedBlocks).format("0,0") },
  {
    key: "status",
    header: "Status",
    align: "end",
    width: "110px",
    render: (row) => {
      const { label, tone } = validatorStatus(row.status, row.jailed, row.tombstoned);
      return (
        <Flex justify="flex-end">
          <StatusTag tone={tone}>{label}</StatusTag>
        </Flex>
      );
    },
  },
];

const TABS = ["active", "inactive", "all"] as const;
type Tab = (typeof TABS)[number];

export default function ValidatorList() {
  const { items, stats, loading } = useValidators();
  const [tab, setTab] = useState<Tab>("active");
  const [search, setSearch] = useState("");
  const addresses = useMemo(() => items.map((item) => item.validator), [items]);
  const { profiles } = useProfilesRecoil(addresses);

  const allRows = useMemo(() => {
    const top = items[0]?.votingPower || 1;
    return items.map((item) => ({ ...item, barWidth: (item.votingPower / top) * 100 }));
  }, [items]);
  const counts = {
    active: allRows.filter((x) => x.status === 3).length,
    inactive: allRows.filter((x) => x.status !== 3).length,
    all: allRows.length,
  };

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return allRows.filter((row, index) => {
      if (tab === "active" && row.status !== 3) return false;
      if (tab === "inactive" && row.status === 3) return false;
      if (!query) return true;
      const name = profiles[index]?.name ?? "";
      return name.toLowerCase().includes(query) || row.validator.toLowerCase().includes(query);
    }).map((row, index) => ({ ...row, position: index + 1 }));
  }, [allRows, tab, search, profiles]);

  return (
    <>
      <PageTitle
        title="Validators"
        subtitle={loading ? " " : `Showing ${counts.active} of ${counts.all} validators`}
      />
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap="4" mb="5">
        <StatCard
          label="Active set"
          loading={loading}
          value={stats.active}
          suffix={stats.maxValidators ? `of ${stats.maxValidators} slots` : undefined}
          rows={[
            { label: "Known validators", value: stats.known },
            { label: "Jailed", value: stats.jailed },
          ]}
        />
        <StatCard
          label="Bonded"
          loading={loading}
          value={formatCompact(stats.bonded)}
          suffix="staked"
          rows={[
            { label: "Active voting power", value: numeral(stats.activePower).format("0,0") },
            { label: "Staking tokens in use", value: stats.stakingTokens },
          ]}
        />
        <StatCard
          label="Nakamoto coefficient"
          loading={loading}
          value={stats.nakamoto}
          rows={[
            { label: "Validators holding over 1/3", value: `${stats.nakamoto} of ${stats.active}` },
            { label: "Top 10 share", value: formatPercent(stats.top10Share) },
          ]}
        />
        <StatCard
          label="Median commission"
          loading={loading}
          value={formatPercent(stats.medianCommission)}
          rows={[
            { label: "Lowest", value: formatPercent(stats.minCommission) },
            { label: "Highest", value: formatPercent(stats.maxCommission) },
          ]}
        />
      </SimpleGrid>
      <Panel>
        <ExplorerTabs
          value={tab}
          onChange={(value) => setTab(value as Tab)}
          items={[
            { value: "active", label: "Active", count: counts.active },
            { value: "inactive", label: "Inactive", count: counts.inactive },
            { value: "all", label: "All", count: counts.all },
          ]}
          actions={
            <Input
              size="sm"
              maxW="260px"
              mb="2"
              placeholder="Search validators"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              bg="explorer.card"
              borderColor="explorer.border"
              _placeholder={{ color: "explorer.muted" }}
            />
          }
        />
        <DataTable columns={columns} rows={rows} rowKey={(row) => row.validator} loading={loading} skeletonRows={12} />
      </Panel>
    </>
  );
}
