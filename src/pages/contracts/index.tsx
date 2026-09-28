import React, { useMemo, useState } from "react";
import { Box, Flex, Input, Link as ChakraLink, SimpleGrid, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import numeral from "numeral";
import { NextSeo } from "next-seo";
import { Panel } from "@/components/explorer/panel";
import { PageTitle } from "@/components/explorer/page_title";
import { StatCard } from "@/components/explorer/stat_card";
import { DataTable, Column } from "@/components/explorer/data_table";
import { ExplorerTabs } from "@/components/explorer/tabs";
import { CursorPager } from "@/components/explorer/cursor_pager";
import { CopyButton } from "@/components/explorer/copy_button";
import { Tag } from "@/components/explorer/badges";
import { formatPercent, timeAgo } from "@/components/explorer/format";
import { CONTRACT_DETAILS } from "@/components/explorer/evm_address";
import { formatUnits, useBlockscout, useBlockscoutList } from "@/components/explorer/blockscout";
import { getMiddleEllipsis } from "@/utils/get_middle_ellipsis";

type VerifiedContract = {
  address: { hash: string; name?: string | null };
  compiler_version: string;
  language: string;
  license_type?: string | null;
  optimization_enabled?: boolean | null;
  transactions_count?: number | null;
  coin_balance?: string | null;
  verified_at: string;
};
type Counters = { smart_contracts: string; verified_smart_contracts: string };

const LANGUAGES = ["solidity", "vyper", "yul"] as const;
const shortCompiler = (version?: string) => version?.replace(/^v/, "").split("+")[0] ?? "—";
const license = (value?: string | null) => (!value || value === "none" ? "Not specified" : value.replace(/_/g, " "));

const columns: Column<VerifiedContract>[] = [
  {
    key: "contract",
    header: "Contract",
    render: (row) => (
      <Box>
        <Text color="explorer.text">{row.address.name ?? "Unnamed contract"}</Text>
        <Flex align="center" gap="1">
          <ChakraLink asChild color="explorer.link" fontSize="sm">
            <NextLink href={CONTRACT_DETAILS(row.address.hash)}>{getMiddleEllipsis(row.address.hash, { beginning: 10, ending: 8 })}</NextLink>
          </ChakraLink>
          <CopyButton value={row.address.hash} label="Copy contract address" />
        </Flex>
      </Box>
    ),
  },
  { key: "balance", header: "Balance (RIO)", align: "end", render: (row) => formatUnits(row.coin_balance) },
  { key: "txs", header: "Txns", align: "end", render: (row) => numeral(row.transactions_count ?? 0).format("0,0") },
  {
    key: "compiler",
    header: "Compiler",
    render: (row) => (
      <Flex align="center" gap="2" pl="4">
        <Tag color="explorer.link">{row.language.charAt(0).toUpperCase() + row.language.slice(1)}</Tag>
        <Text color="explorer.muted" fontSize="xs">
          {row.compiler_version}
        </Text>
      </Flex>
    ),
  },
  { key: "verified", header: "Verified", align: "end", render: (row) => <Text color="explorer.muted">{timeAgo(row.verified_at)}</Text> },
  { key: "license", header: "License", align: "end", render: (row) => license(row.license_type) },
];

export default function VerifiedContractsPage() {
  const [language, setLanguage] = useState<string>("all");
  const [query, setQuery] = useState("");
  const filters = useMemo(() => ({ filter: language === "all" ? null : language, q: query.trim() || null }), [language, query]);
  const list = useBlockscoutList<VerifiedContract>("smart-contracts", filters);
  // Unfiltered first page, for the summary cards and per-language counts.
  const all = useBlockscoutList<VerifiedContract>("smart-contracts");
  const { data: counters, loading: countersLoading } = useBlockscout<Counters>("smart-contracts/counters");

  const total = Number(counters?.smart_contracts ?? 0);
  const verified = Number(counters?.verified_smart_contracts ?? 0);
  const latest = all.items[0];
  const byLanguage = (lang: string) => all.items.filter((c) => c.language === lang).length;
  const topLanguage = [...LANGUAGES].sort((a, b) => byLanguage(b) - byLanguage(a))[0];

  return (
    <>
      <NextSeo title="Verified contracts" openGraph={{ title: "Verified contracts" }} />
      <PageTitle title="Verified contracts" subtitle="Smart contracts deployed on the Realio EVM with published, verified source code." />
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap="4" mb="5">
        <StatCard
          label="Total contracts"
          loading={countersLoading}
          value={numeral(total).format("0,0")}
          rows={[
            { label: "Verified", value: numeral(verified).format("0,0") },
            { label: "Unverified", value: numeral(total - verified).format("0,0") },
          ]}
        />
        <StatCard
          label="Verified contracts"
          loading={countersLoading}
          value={numeral(verified).format("0,0")}
          rows={[
            { label: "Share of total", value: formatPercent(total ? (verified / total) * 100 : 0) },
            { label: "Language", value: latest ? topLanguage.charAt(0).toUpperCase() + topLanguage.slice(1) : "—" },
          ]}
        />
        <StatCard
          label="Compiler in use"
          loading={all.loading}
          value={shortCompiler(latest?.compiler_version)}
          rows={[
            { label: "Full version", value: latest?.compiler_version ?? "—" },
            { label: "Optimization", value: latest?.optimization_enabled === null || latest?.optimization_enabled === undefined ? "Not reported" : latest.optimization_enabled ? "Enabled" : "Disabled" },
          ]}
        />
        <StatCard
          label="Last verification"
          loading={all.loading}
          value={latest ? timeAgo(latest.verified_at) : "—"}
          rows={[
            { label: "Contract", value: latest?.address.name ?? "—" },
            { label: "License", value: license(latest?.license_type) },
          ]}
        />
      </SimpleGrid>
      <Panel>
        <ExplorerTabs
          value={language}
          onChange={setLanguage}
          items={[
            { value: "all", label: "All", count: all.hasNext ? undefined : all.items.length },
            ...LANGUAGES.map((lang) => ({ value: lang, label: lang.charAt(0).toUpperCase() + lang.slice(1), count: all.hasNext ? undefined : byLanguage(lang) })),
          ]}
          actions={
            <Input
              size="sm"
              maxW="300px"
              mb="2"
              placeholder="Search by contract name or address"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              bg="explorer.card"
              borderColor="explorer.border"
              _placeholder={{ color: "explorer.muted" }}
            />
          }
        />
        <DataTable columns={columns} rows={list.items} rowKey={(row) => row.address.hash} loading={list.loading} skeletonRows={4} emptyText="No verified contracts match" />
        <Flex justify="space-between" align="center" mt="3" gap="3">
          <Text fontSize="sm" color="explorer.muted">
            Showing {list.items.length} verified contract{list.items.length === 1 ? "" : "s"}
          </Text>
          <CursorPager page={list.page} hasPrevious={list.hasPrevious} hasNext={list.hasNext} onPrevious={list.previous} onNext={list.next} />
        </Flex>
      </Panel>
    </>
  );
}
