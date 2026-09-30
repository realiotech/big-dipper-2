import React, { useMemo, useState } from "react";
import { Box, Button, Flex, Image, Input, Link as ChakraLink, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import numeral from "numeral";
import { NextSeo } from "next-seo";
import { useRecoilValue } from "recoil";
import { ethToRealionetwork } from "@realiotech/address-generator";
import { useBalancesOfQuery } from "@/graphql/types/general_types";
import { readAssets } from "@/recoil/asset";
import { ACCOUNT_DETAILS } from "@/utils/go_to_page";
import { isValidAddress } from "@/utils/prefix_convert";
import { Panel } from "@/components/explorer/panel";
import { PageTitle } from "@/components/explorer/page_title";
import { DataTable, Column } from "@/components/explorer/data_table";
import { Pager } from "@/components/explorer/pager";
import { CopyButton } from "@/components/explorer/copy_button";
import { StatusTag } from "@/components/explorer/badges";
import { formatPercent } from "@/components/explorer/format";
import { MODULE_LABELS } from "@/components/assets/hooks";
import { HOLDER_TOKENS, HolderRow, useBlacklistedHolderList, useHolderList } from "@/components/holders/hooks";
import { useBlacklistCheck } from "@/components/accounts/blacklist";

const PAGE_SIZE = 50;
const STATUSES = ["all", "standard", "module", "blacklisted"] as const;
const STATUS_LABEL: Record<Status, string> = { all: "All accounts", standard: "Standard", module: "Module", blacklisted: "Blacklisted" };
type Status = (typeof STATUSES)[number];

// Status column: module accounts first, then the chain's blacklist, else a standard account.
const statusOf = (row: HolderRow, blacklisted: Set<string>) =>
  row.isModule ? { label: "Module", tone: "accent" as const } : blacklisted.has(row.address) ? { label: "Blacklisted", tone: "warning" as const } : { label: "Standard", tone: "neutral" as const };

const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <Button
    size="xs"
    h="28px"
    px="3"
    borderRadius="full"
    variant="outline"
    fontWeight="400"
    borderColor={active ? "explorer.accent" : "explorer.border"}
    bg={active ? "explorer.accentSubtle" : "transparent"}
    color={active ? "explorer.link" : "explorer.text"}
    onClick={onClick}
  >
    {children}
  </Button>
);

const FilterRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Flex align="center" gap="4" py="3" borderTopWidth="1px" borderColor="explorer.border" _first={{ borderTopWidth: 0 }} wrap="wrap">
    <Text fontSize="sm" color="explorer.muted" w="100px">
      {label}
    </Text>
    <Flex gap="2" wrap="wrap" flex="1" align="center">
      {children}
    </Flex>
  </Flex>
);

export default function AccountsPage() {
  const router = useRouter();
  const { assetArr } = useRecoilValue(readAssets);
  const tokens = HOLDER_TOKENS.flatMap((symbol) => assetArr.filter((asset) => asset.symbol === symbol));
  const [denom, setDenom] = useState("ario");
  const [status, setStatus] = useState<Status>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const list = useHolderList(denom, page, PAGE_SIZE);
  // Blacklisted accounts are spread across the whole ranking, so the server ranks them separately.
  const blacklistedList = useBlacklistedHolderList(denom, page, PAGE_SIZE, status === "blacklisted");
  const symbol = list.asset?.symbol ?? "";

  // Module accounts are a fixed, known set, so they can be listed directly.
  const moduleAddresses = useMemo(() => Object.keys(MODULE_LABELS), []);
  const { data: moduleBalances } = useBalancesOfQuery({ variables: { addresses: moduleAddresses }, skip: status !== "module" });

  const rows: HolderRow[] = useMemo(() => {
    let result = list.rows;
    if (status === "module") {
      const decimals = list.asset?.decimals ?? 18;
      result = (moduleBalances?.balance ?? [])
        .filter((b) => b.denom === denom && Number(b.amount) > 0)
        .map((b) => {
          const amount = Number(b.amount) / 10 ** decimals;
          return { rank: 0, address: b.address, label: MODULE_LABELS[b.address], isModule: true, amount, value: 0, share: list.supply ? (amount / list.supply) * 100 : 0, height: 0, tokens: [] };
        })
        .sort((a, b) => b.amount - a.amount)
        .map((row, index) => ({ ...row, rank: index + 1 }));
    } else if (status === "blacklisted") {
      result = blacklistedList.rows;
    }
    const q = query.trim().toLowerCase();
    return q ? result.filter((row) => row.address.toLowerCase().includes(q) || row.label.toLowerCase().includes(q)) : result;
  }, [blacklistedList.rows, denom, list.asset, list.rows, list.supply, moduleBalances, query, status]);

  // One check per loaded page of the ranking: search keystrokes and status
  // switches leave that page, and so the request, unchanged. The Blacklisted
  // view needs no check, since every row there is on the list.
  const checked = useBlacklistCheck(useMemo(() => list.rows.map((row) => row.address), [list.rows]));
  const blacklisted = useMemo(
    () => (status === "blacklisted" ? new Set(blacklistedList.rows.map((row) => row.address)) : checked),
    [blacklistedList.rows, checked, status]
  );
  // "Standard" leaves out module and blacklisted accounts; both are known once the page's check returns.
  const shown = status === "standard" ? rows.filter((row) => !row.isModule && !blacklisted.has(row.address)) : rows;

  const openAddress = () => {
    const value = query.trim();
    const address = /^0x[0-9a-fA-F]{40}$/.test(value) ? ethToRealionetwork(value) : value;
    if (isValidAddress(address)) router.push(ACCOUNT_DETAILS(address));
  };

  const columns: Column<HolderRow>[] = [
    { key: "rank", header: "#", width: "56px", align: "end", render: (row) => <Text color="explorer.muted">{row.rank}</Text> },
    {
      key: "account",
      header: "Account",
      render: (row) => (
        <Box pl="4" minW="0">
          <Flex align="center" gap="1">
            <ChakraLink asChild color="explorer.link">
              <NextLink href={ACCOUNT_DETAILS(row.address)}>{row.address}</NextLink>
            </ChakraLink>
            <CopyButton value={row.address} label="Copy address" />
          </Flex>
          {row.label && (
            <Text fontSize="xs" color="explorer.muted">
              {row.label}
            </Text>
          )}
        </Box>
      ),
    },
    {
      key: "tokens",
      header: "Tokens held",
      render: (row) => (
        <Flex gap="1">
          {row.tokens.map((token) => {
            const asset = assetArr.find((a) => a.symbol === token);
            return asset?.image ? <Image key={token} src={asset.image} alt={token} title={token} boxSize="18px" borderRadius="full" /> : null;
          })}
        </Flex>
      ),
    },
    {
      key: "balance",
      header: `Balance (${symbol})`,
      align: "end",
      // Drained accounts keep dust such as 0.002; "0" would read as empty.
      render: (row) => (row.amount > 0 && row.amount < 0.01 ? "< 0.01" : numeral(Number(row.amount.toFixed(2))).format("0,0.[00]")),
    },
    { key: "share", header: "Share at snapshot", align: "end", render: (row) => formatPercent(row.share, 4) },
    {
      key: "status",
      header: "Status",
      align: "end",
      render: (row) => (
        <Flex justify="flex-end">
          <StatusTag tone={statusOf(row, blacklisted).tone}>{statusOf(row, blacklisted).label}</StatusTag>
        </Flex>
      ),
    },
  ];

  return (
    <>
      <NextSeo title="Accounts" openGraph={{ title: "Accounts" }} />
      <PageTitle title="Accounts" subtitle="Accounts on Realio, ranked by the balance of the selected token, with their account type." />
      <Panel mb="5">
        <FilterRow label="Token held">
          {tokens.map((asset) => (
            <Chip
              key={asset.denom}
              active={denom === asset.denom}
              onClick={() => {
                setDenom(asset.denom);
                setPage(1);
              }}
            >
              <Image src={asset.image} alt="" boxSize="14px" borderRadius="full" />
              {asset.symbol}
            </Chip>
          ))}
        </FilterRow>
        <FilterRow label="Status">
          {STATUSES.map((value) => (
            <Chip
              key={value}
              active={status === value}
              onClick={() => {
                setStatus(value);
                setPage(1);
              }}
            >
              {STATUS_LABEL[value]}
            </Chip>
          ))}
        </FilterRow>
        <FilterRow label="Search">
          <Input
            size="sm"
            maxW="420px"
            placeholder="Filter by address or label, or paste an address and press Enter"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && openAddress()}
            bg="explorer.card"
            borderColor="explorer.border"
            _placeholder={{ color: "explorer.muted" }}
          />
          {(query || status !== "all" || denom !== "ario") && (
            <Button
              variant="plain"
              size="xs"
              color="explorer.link"
              fontWeight="400"
              onClick={() => {
                setQuery("");
                setStatus("all");
                setDenom("ario");
                setPage(1);
              }}
            >
              Reset filters
            </Button>
          )}
        </FilterRow>
      </Panel>
      <Panel>
        <DataTable
          columns={columns}
          rows={shown}
          rowKey={(row) => row.address}
          loading={status === "blacklisted" ? blacklistedList.loading : list.loading}
          skeletonRows={12}
          emptyText="No accounts match these filters"
        />
        <Flex justify="space-between" align="center" mt="3" gap="3" wrap="wrap">
          <Text fontSize="sm" color="explorer.muted">
            {status === "module"
              ? `${shown.length} module accounts hold ${symbol}`
              : status === "blacklisted"
                ? `Showing ${shown.length} of ${numeral(blacklistedList.count).format("0,0")} blacklisted accounts holding ${symbol}`
                : `Showing ${shown.length} of ${numeral(list.count).format("0,0")} accounts${status === "standard" ? " on this page" : ""}`}
          </Text>
          {status === "blacklisted"
            ? blacklistedList.count > PAGE_SIZE && <Pager count={blacklistedList.count} pageSize={PAGE_SIZE} page={page} onPageChange={setPage} />
            : status !== "module" && list.count > PAGE_SIZE && <Pager count={list.count} pageSize={PAGE_SIZE} page={page} onPageChange={setPage} />}
        </Flex>
      </Panel>
    </>
  );
}
