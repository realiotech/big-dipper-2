import React, { useMemo, useState } from "react";
import { Box, Flex, Image, Link as ChakraLink, SimpleGrid, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import numeral from "numeral";
import { NextSeo } from "next-seo";
import { Panel } from "@/components/explorer/panel";
import { PageTitle } from "@/components/explorer/page_title";
import { StatCard } from "@/components/explorer/stat_card";
import { DataTable, Column } from "@/components/explorer/data_table";
import { ExplorerTabs } from "@/components/explorer/tabs";
import { StatusTag, Tag, ValidatorAvatar } from "@/components/explorer/badges";
import { formatCompact } from "@/components/explorer/format";
import { AssetListRow, useAssetList } from "@/components/assets/list_hooks";

const usd = (value: number) => (value ? `$${formatCompact(value)}` : "—");

const columns: Column<AssetListRow>[] = [
  {
    key: "asset",
    header: "Asset",
    render: (row) => (
      <Flex align="center" gap="3">
        {row.image ? <Image src={row.image} alt="" boxSize="28px" borderRadius="full" /> : <ValidatorAvatar name={row.symbol} size="28px" />}
        <Box minW="0">
          {row.href ? (
            <ChakraLink asChild color="explorer.link">
              <NextLink href={row.href}>{row.symbol}</NextLink>
            </ChakraLink>
          ) : (
            <Text color="explorer.text">{row.symbol}</Text>
          )}
          <Text fontSize="xs" color="explorer.muted" truncate maxW="320px">
            {row.name}
          </Text>
        </Box>
      </Flex>
    ),
  },
  { key: "type", header: "Type", render: (row) => <Flex><Tag color={row.kind === "native" ? "explorer.link" : "explorer.muted"}>{row.kind === "erc20" ? "ERC-20" : row.kind.toUpperCase()}</Tag></Flex> },
  { key: "price", header: "Price", align: "end", render: (row) => (row.price ? `$${numeral(row.price).format("0,0.[000000]")}` : "—") },
  { key: "cap", header: "Market cap", align: "end", render: (row) => usd(row.marketCap) },
  { key: "supply", header: "Total supply", align: "end", render: (row) => formatCompact(row.supply) },
  { key: "holders", header: "Holders", align: "end", render: (row) => numeral(row.holders).format("0,0") },
  {
    key: "stakeable",
    header: "Stakeable",
    align: "end",
    render: (row) => (
      <Flex justify="flex-end">
        <StatusTag tone={row.stakeable ? "success" : "neutral"}>{row.stakeable ? "Yes" : "No"}</StatusTag>
      </Flex>
    ),
  },
];

const TABS = { native: "native", ibc: "ibc", erc20: "erc20", all: "all" } as const;
type Tab = keyof typeof TABS;

export default function AssetsPage() {
  const { rows, stats, height, loading } = useAssetList();
  const [tab, setTab] = useState<Tab>("native");
  const visible = useMemo(() => (tab === "all" ? rows : rows.filter((row) => row.kind === tab)), [rows, tab]);
  const count = (kind: string) => rows.filter((row) => row.kind === kind).length;

  return (
    <>
      <NextSeo title="Assets" openGraph={{ title: "Assets" }} />
      <PageTitle title="Assets" subtitle={loading ? " " : `Showing ${visible.length} of ${stats.total} denoms`} />
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap="4" mb="5">
        <StatCard
          label="Total market cap"
          loading={loading}
          value={usd(stats.marketCap)}
          rows={[
            { label: "Priced assets", value: stats.priced },
            { label: "Total denoms on chain", value: stats.total },
          ]}
        />
        <StatCard
          label="Native tokens"
          loading={loading}
          value={stats.native}
          rows={[
            { label: "Stakeable", value: stats.stakeable },
            { label: "Symbols", value: stats.nativeSymbols.join(", ") || "—" },
          ]}
        />
        <StatCard
          label="IBC denoms"
          loading={loading}
          value={stats.ibc}
          rows={[
            { label: "ERC-20 assets", value: stats.erc20 },
            { label: "Supply snapshot height", value: numeral(height).format("0,0") },
          ]}
        />
        <StatCard
          label="Bonded"
          loading={loading}
          value={formatCompact(stats.bonded)}
          suffix="staked"
          rows={[
            { label: "Staking denoms", value: stats.stakingDenoms },
            { label: "Holders indexed", value: numeral(stats.holders).format("0,0") },
          ]}
        />
      </SimpleGrid>
      <Panel>
        <ExplorerTabs
          value={tab}
          onChange={(value) => setTab(value as Tab)}
          items={[
            { value: "native", label: "Native", count: count("native") },
            { value: "ibc", label: "IBC", count: count("ibc") },
            { value: "erc20", label: "ERC-20", count: count("erc20") },
            { value: "all", label: "All denoms", count: rows.length },
          ]}
        />
        <DataTable columns={columns} rows={visible} rowKey={(row) => row.denom} loading={loading} skeletonRows={4} emptyText="No denoms" />
      </Panel>
    </>
  );
}
