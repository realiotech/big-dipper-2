import React, { useState } from "react";
import { Flex, Link as ChakraLink, SimpleGrid, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import numeral from "numeral";
import { NextSeo } from "next-seo";
import { useRecoilValue } from "recoil";
import { readAssets } from "@/recoil/asset";
import { BLOCK_DETAILS } from "@/utils/go_to_page";
import { Panel } from "@/components/explorer/panel";
import { PageTitle } from "@/components/explorer/page_title";
import { StatCard } from "@/components/explorer/stat_card";
import { DataTable, Column } from "@/components/explorer/data_table";
import { ExplorerTabs } from "@/components/explorer/tabs";
import { Pager } from "@/components/explorer/pager";
import { AddressLink } from "@/components/explorer/address_link";
import { Tag } from "@/components/explorer/badges";
import { formatCompact, formatPercent } from "@/components/explorer/format";
import { HOLDER_TOKENS, HolderRow, useHolderList } from "@/components/holders/hooks";

const PAGE_SIZE = 50;

export default function TopAccountsPage() {
  const { assetArr } = useRecoilValue(readAssets);
  // Bank-module tokens only: ERC-20 balances live in the EVM, not in these tables.
  const tokens = HOLDER_TOKENS.flatMap((symbol) => assetArr.filter((asset) => asset.symbol === symbol));
  const [denom, setDenom] = useState("ario");
  const [page, setPage] = useState(1);
  const list = useHolderList(denom, page, PAGE_SIZE);
  const symbol = list.asset?.symbol ?? "";
  const top = list.rows[0];

  const columns: Column<HolderRow>[] = [
    { key: "rank", header: "#", width: "56px", align: "end", render: (row) => <Text color="explorer.muted">{row.rank}</Text> },
    {
      key: "address",
      header: "Address",
      render: (row) => (
        <Flex align="center" gap="3" pl="4">
          <AddressLink address={row.address} beginning={12} ending={8} />
          {row.label && <Tag>{row.label}</Tag>}
        </Flex>
      ),
    },
    { key: "balance", header: `Balance (${symbol})`, align: "end", render: (row) => numeral(Number(row.amount.toFixed(4))).format("0,0.[0000]") },
    { key: "value", header: "Value", align: "end", render: (row) => (row.value ? `$${numeral(row.value).format("0,0.00")}` : "—") },
    { key: "share", header: "Share at snapshot", align: "end", render: (row) => formatPercent(row.share, 4) },
    {
      key: "seen",
      header: "Last seen",
      align: "end",
      // ERC-20 balances come from the token's subgraph, which records no snapshot height.
      render: (row) =>
        row.height ? (
          <ChakraLink asChild color="explorer.muted">
            <NextLink href={BLOCK_DETAILS(row.height)}>{numeral(row.height).format("0,0")}</NextLink>
          </ChakraLink>
        ) : (
          <Text color="explorer.muted">—</Text>
        ),
    },
  ];

  return (
    <>
      <NextSeo title="Top accounts" openGraph={{ title: "Top accounts" }} />
      <PageTitle
        title="Top accounts"
        subtitle={list.loading ? " " : `Showing ${list.rows.length} of ${numeral(list.count).format("0,0")} ${symbol} holders`}
      />
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap="4" mb="5">
        <StatCard
          label={`${symbol} holders`}
          loading={list.loading}
          value={numeral(list.holders).format("0,0")}
          rows={[
            { label: "Token", value: list.asset ? `${symbol} · ${list.asset.name}` : "—" },
            { label: "Price", value: list.asset?.price ? `$${numeral(list.asset.price).format("0,0.[000000]")}` : "—" },
          ]}
        />
        <StatCard
          label="Total supply"
          loading={list.loading}
          value={formatCompact(list.supply)}
          suffix={symbol}
          rows={[
            { label: "Market cap", value: list.asset?.price ? `$${formatCompact(list.asset.price * list.supply)}` : "—" },
            { label: "Decimals", value: list.asset?.decimals ?? 18 },
          ]}
        />
        <StatCard
          label="This page holds"
          loading={list.loading}
          value={formatCompact(list.pageTotal)}
          suffix={symbol}
          rows={[
            { label: "Rows", value: list.rows.length },
            { label: "Snapshot height spread", value: list.heightSpread || list.rows.some((row) => row.height) ? numeral(list.heightSpread).format("0,0") : "—" },
          ]}
        />
        <StatCard
          label="Top holder"
          loading={list.loading}
          value={top ? formatCompact(top.amount) : "—"}
          suffix={symbol}
          rows={[
            { label: "Share of supply", value: formatPercent(top?.share ?? 0) },
            { label: "Page", value: `${page} of ${Math.max(Math.ceil(list.count / PAGE_SIZE), 1)}` },
          ]}
        />
      </SimpleGrid>
      <Panel>
        <ExplorerTabs
          value={denom}
          onChange={(value) => {
            setDenom(value);
            setPage(1);
          }}
          items={tokens.map((asset) => ({ value: asset.denom, label: asset.symbol }))}
          actions={
            list.count > PAGE_SIZE && <Pager count={list.count} pageSize={PAGE_SIZE} page={page} onPageChange={setPage} />
          }
        />
        <DataTable columns={columns} rows={list.rows} rowKey={(row) => row.address} loading={list.loading} skeletonRows={12} emptyText="No holders" />
      </Panel>
    </>
  );
}
