import React, { useEffect, useMemo, useState } from "react";
import { Box, Flex, Grid, Image, Link as ChakraLink, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import numeral from "numeral";
import { Doughnut } from "react-chartjs-2";
import { ArcElement, Chart as ChartJS, Tooltip } from "chart.js";
import { useRecoilValue } from "recoil";
import { readAssets } from "@/recoil/asset";
import { formatTokenByExponent } from "@/utils";
import { getMiddleEllipsis } from "@/utils/get_middle_ellipsis";
import { BLOCK_DETAILS, TRANSACTION_DETAILS } from "@/utils/go_to_page";
import { useColorModeValue } from "@/components/ui/color-mode";
import { Panel } from "@/components/explorer/panel";
import { PageTitle } from "@/components/explorer/page_title";
import { DataTable, Column } from "@/components/explorer/data_table";
import { ExplorerTabs, TabPanel } from "@/components/explorer/tabs";
import { Pager } from "@/components/explorer/pager";
import { CopyButton } from "@/components/explorer/copy_button";
import { TxNameTag, TxStatus, TxTypeTag } from "@/components/explorer/badges";
import { ValidatorName } from "@/components/explorer/validator_name";
import { TokenDot } from "@/components/explorer/token";
import { formatPercent, timeAgo } from "@/components/explorer/format";
import { PAGE_SIZE, useAccountInfo, useErc20Balances, useOverview, useStaking, useTransactions } from "./hooks";
import { AssetRow, DelegationRow, usePortfolio } from "./portfolio";
import type { AccountTransaction } from "./types";

ChartJS.register(ArcElement, Tooltip);

// Hex values of the explorer.chart* tokens; chart.js cannot read CSS variables.
const DONUT_COLORS = {
  light: ["#5D5FEF", "#BF4A86", "#7879F1", "#2E855F"],
  dark: ["#5D5FEF", "#EF5DA8", "#A5A6F6", "#8CA98E"],
};

const usd = (value: number) => `$${numeral(value).format("0,0.00")}`;
const tokens = (value: number) => numeral(Number(value.toFixed(6))).format("0,0.[00]");

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

const InfoItem = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Box flex="1" minW="140px" py="1" pr="4">
    <Text fontSize="xs" color="explorer.muted" mb="1">
      {label}
    </Text>
    <Box fontSize="sm" color="explorer.text">
      {children}
    </Box>
  </Box>
);

const assetColumns: Column<AssetRow>[] = [
  {
    key: "asset",
    header: "Asset",
    render: (row) => (
      <Flex align="center" gap="3">
        <Image src={row.image} alt="" boxSize="28px" borderRadius="full" />
        <Box>
          <Text color="explorer.text">{row.symbol}</Text>
          <Text fontSize="xs" color="explorer.muted">
            {row.name}
          </Text>
        </Box>
      </Flex>
    ),
  },
  {
    key: "balance",
    header: "Balance",
    align: "end",
    render: (row) => (
      <>
        {tokens(row.balance)}{" "}
        <Text as="span" color="explorer.muted" fontSize="xs">
          {row.symbol}
        </Text>
      </>
    ),
  },
  { key: "price", header: "Price", align: "end", render: (row) => (row.price ? `$${numeral(row.price).format("0,0.[000000]")}` : "—") },
  { key: "value", header: "Value", align: "end", render: (row) => (row.price ? usd(row.value) : "—") },
  { key: "share", header: "Share of supply", align: "end", render: (row) => formatPercent(row.shareOfSupply, 4) },
];

const activityColumns: Column<AccountTransaction>[] = [
  {
    key: "hash",
    header: "Transaction hash",
    render: (row) => (
      <Flex align="center" gap="1">
        <ChakraLink asChild color="explorer.link">
          <NextLink href={TRANSACTION_DETAILS(row.hash)}>{getMiddleEllipsis(row.hash, { beginning: 10, ending: 6 })}</NextLink>
        </ChakraLink>
        <CopyButton value={row.hash} label="Copy transaction hash" />
      </Flex>
    ),
  },
  { key: "type", header: "Type", render: (row) => <Flex><TxTypeTag kind={row.label.kind} /></Flex> },
  { key: "name", header: "Name", render: (row) => <Flex><TxNameTag label={row.label} /></Flex> },
  { key: "status", header: "Status", render: (row) => <TxStatus success={row.success} /> },
  {
    key: "block",
    header: "Block",
    align: "end",
    render: (row) => (
      <ChakraLink asChild color="explorer.link">
        <NextLink href={BLOCK_DETAILS(row.height)}>{numeral(row.height).format("0,0")}</NextLink>
      </ChakraLink>
    ),
  },
  {
    key: "fee",
    header: "Fee",
    align: "end",
    render: (row) => (
      <>
        {numeral(Number(row.fee.toFixed(6))).format("0,0.[000000]")}{" "}
        <Text as="span" color="explorer.muted" fontSize="xs">
          RIO
        </Text>
      </>
    ),
  },
  { key: "age", header: "Age", align: "end", render: (row) => <Text color="explorer.muted">{timeAgo(row.timestamp)}</Text> },
];

type StakeRow = { validator: string; denom: string; amount: number; height?: number };

const stakeColumns = (withHeight: boolean): Column<StakeRow>[] => [
  { key: "validator", header: "Validator", render: (row) => <ValidatorName address={row.validator} /> },
  { key: "token", header: "Token", render: (row) => <TokenDot denom={row.denom} /> },
  { key: "amount", header: "Amount", align: "end", render: (row) => tokens(row.amount) },
  ...(withHeight
    ? [{ key: "height", header: "Started at block", align: "end" as const, render: (row: StakeRow) => numeral(row.height).format("0,0") }]
    : []),
];

const Portfolio = ({ segments, inUsd, total, loading }: { segments: { label: string; value: number }[]; inUsd: boolean; total: string; loading: boolean }) => {
  const colors = useColorModeValue(DONUT_COLORS.light, DONUT_COLORS.dark);
  const border = useColorModeValue("#FFFFFF", "#0C1317");
  const sum = segments.reduce((acc, segment) => acc + segment.value, 0);

  return (
    <Panel>
      <PanelTitle title="Portfolio" subtitle={inUsd ? "By USD value" : "By token amount"} />
      <Flex gap="6" align="center" direction={{ base: "column", sm: "row" }}>
        <Box boxSize="168px" flexShrink={0}>
          {!loading && sum > 0 && (
            <Doughnut
              data={{
                labels: segments.map((segment) => segment.label),
                datasets: [{ data: segments.map((segment) => segment.value), backgroundColor: colors, borderColor: border, borderWidth: 2 }],
              }}
              options={{ cutout: "78%", plugins: { legend: { display: false } }, maintainAspectRatio: false }}
            />
          )}
        </Box>
        <Stack gap="3" flex="1" w="full">
          {segments.map((segment, index) => (
            <Flex key={segment.label} justify="space-between" gap="3" fontSize="sm">
              <Flex gap="2.5">
                <Box mt="1.5" w="7px" h="7px" borderRadius="full" bg={colors[index]} flexShrink={0} />
                <Box>
                  <Text color="explorer.muted" fontSize="xs">
                    {segment.label}
                  </Text>
                  <Text color="explorer.text">{inUsd ? usd(segment.value) : tokens(segment.value)}</Text>
                </Box>
              </Flex>
              <Text color="explorer.text">{formatPercent(sum ? (segment.value / sum) * 100 : 0)}</Text>
            </Flex>
          ))}
        </Stack>
      </Flex>
      <Flex justify="space-between" mt="5" pt="3" borderTopWidth="1px" borderColor="explorer.border" fontSize="sm">
        <Text color="explorer.muted">Total</Text>
        <Text color="explorer.text">{total}</Text>
      </Flex>
    </Panel>
  );
};

const Delegations = ({ rows }: { rows: DelegationRow[] }) => (
  <Panel>
    <PanelTitle title="Delegations" subtitle={`${rows.length} validator${rows.length === 1 ? "" : "s"}`} />
    {rows.map((row) => (
      <Flex key={`${row.validator}:${row.symbol}`} justify="space-between" align="center" gap="4" py="3" borderTopWidth="1px" borderColor="explorer.border">
        <Box minW="0">
          <ValidatorName address={row.validator} />
        </Box>
        <Box textAlign="end" flexShrink={0}>
          <Text fontSize="sm" color="explorer.text">
            {tokens(row.amount)} {row.symbol}
          </Text>
          <Text fontSize="xs" color="explorer.muted">
            {formatPercent(row.share)}
          </Text>
        </Box>
      </Flex>
    ))}
  </Panel>
);

export default function AccountDetail() {
  const { balances, address, evmAddress, completed } = useOverview();
  const erc20Balances = useErc20Balances(evmAddress);
  const { delegations, unbondings } = useStaking(address);
  const info = useAccountInfo(address);
  const activity = useTransactions(address);
  const [tab, setTab] = useState("activity");

  const portfolio = usePortfolio({
    balances,
    erc20Balances,
    delegations: delegations.data,
    unbondings: unbondings.data,
    rewards: info.rewards,
  });

  // The newest activity is the first row of the first page.
  const [lastActivity, setLastActivity] = useState<number>();
  useEffect(() => setLastActivity(undefined), [address]);
  useEffect(() => {
    if (activity.page === 1 && activity.items[0]) setLastActivity(activity.items[0].height);
  }, [activity.page, activity.items]);

  const { assetMap } = useRecoilValue(readAssets);
  const stakeRows = useMemo(() => {
    const amount = (row: { amount?: string | null; denom?: string | null }) =>
      parseFloat(formatTokenByExponent(row.amount ?? "0", assetMap[row.denom ?? ""]?.decimals ?? 18)) || 0;
    return {
      delegations: delegations.data.map((row) => ({ validator: row.val_addr, denom: row.denom ?? "", amount: amount(row) })),
      unbondings: unbondings.data.map((row) => ({
        validator: row.val_addr,
        denom: row.denom ?? "",
        amount: amount(row),
        height: Number(row.creation_height ?? 0),
      })),
    };
  }, [assetMap, delegations.data, unbondings.data]);

  const loading = !completed || delegations.loading;
  const singleAsset = portfolio.assets.length === 1 ? portfolio.assets[0] : undefined;
  const total = portfolio.inUsd
    ? `${singleAsset ? `${tokens(singleAsset.balance)} ${singleAsset.symbol}  ` : ""}${usd(portfolio.totalValue)}`
    : singleAsset
      ? `${tokens(singleAsset.balance)} ${singleAsset.symbol}`
      : "—";

  return (
    <Stack gap="5">
      <PageTitle
        crumbs={[{ label: "Accounts" }, { label: getMiddleEllipsis(address ?? "", { beginning: 10, ending: 6 }) }]}
        title="Account"
        subtitle={
          <Flex as="span" align="center" gap="1">
            <Text as="span" color="explorer.link" wordBreak="break-all">
              {address}
            </Text>
            {address && <CopyButton value={address} label="Copy address" />}
          </Flex>
        }
      />

      <Grid templateColumns={{ base: "1fr", lg: "1fr 444px" }} gap="5" alignItems="start">
        <Stack gap="5" minW="0">
          <Panel>
            <Text fontSize="xs" color="explorer.muted" mb="1">
              EVM address
            </Text>
            <Flex align="center" gap="1" mb="4">
              <Text fontSize="sm" color="explorer.link" wordBreak="break-all">
                {evmAddress}
              </Text>
              {evmAddress && <CopyButton value={evmAddress} label="Copy EVM address" />}
            </Flex>
            <Flex wrap="wrap" borderTopWidth="1px" borderColor="explorer.border" pt="3">
              <InfoItem label="Account type">{info.loading ? "…" : info.accountType || "—"}</InfoItem>
              <InfoItem label="Public key">{info.loading ? "…" : info.publicKey || "—"}</InfoItem>
              <InfoItem label="Last activity">
                {lastActivity ? (
                  <ChakraLink asChild color="explorer.text">
                    <NextLink href={BLOCK_DETAILS(lastActivity)}>Block {numeral(lastActivity).format("0,0")}</NextLink>
                  </ChakraLink>
                ) : activity.loading ? (
                  "…"
                ) : (
                  "—"
                )}
              </InfoItem>
            </Flex>
          </Panel>

          <Panel>
            <PanelTitle
              title="Assets"
              subtitle={loading ? undefined : `${portfolio.assets.length} denom${portfolio.assets.length === 1 ? "" : "s"} held`}
            />
            <DataTable columns={assetColumns} rows={portfolio.assets} rowKey={(row) => row.denom} loading={loading} skeletonRows={2} emptyText="No assets held" />
          </Panel>

          <Panel>
            <ExplorerTabs
              value={tab}
              onChange={setTab}
              items={[
                { value: "activity", label: "Activity", count: activity.total },
                { value: "staking", label: "Staking", count: delegations.count + unbondings.count },
              ]}
              actions={
                tab === "activity" &&
                address && (
                  <ChakraLink asChild fontSize="sm" color="explorer.link" mb="2">
                    <NextLink href={`/accounts/export?a=${address}`}>Export CSV</NextLink>
                  </ChakraLink>
                )
              }
            >
              <TabPanel value="activity" pt="0">
                <DataTable columns={activityColumns} rows={activity.items} rowKey={(row) => row.hash} loading={activity.loading} emptyText="No activity yet" />
                {activity.total > PAGE_SIZE && (
                  <Flex justify="space-between" align="center" mt="3" gap="3" wrap="wrap">
                    <Text fontSize="sm" color="explorer.muted">
                      {numeral(activity.total).format("0,0")} actions
                    </Text>
                    <Pager count={activity.total} pageSize={PAGE_SIZE} page={activity.page} onPageChange={activity.setPage} />
                  </Flex>
                )}
                {activity.total > 0 && activity.total <= PAGE_SIZE && (
                  <Text mt="3" fontSize="sm" color="explorer.muted">
                    Showing {activity.items.length} of {activity.total} actions
                  </Text>
                )}
              </TabPanel>
              <TabPanel value="staking" pt="0">
                <Text fontSize="sm" color="explorer.muted" mt="3">
                  Delegations ({delegations.count})
                </Text>
                <DataTable columns={stakeColumns(false)} rows={stakeRows.delegations} rowKey={(row) => `${row.validator}:${row.denom}`} loading={delegations.loading} skeletonRows={3} emptyText="No delegations" />
                <Text fontSize="sm" color="explorer.muted" mt="6">
                  Unbondings ({unbondings.count})
                </Text>
                <DataTable columns={stakeColumns(true)} rows={stakeRows.unbondings} rowKey={(row) => `${row.validator}:${row.denom}:${row.height}`} loading={unbondings.loading} skeletonRows={2} emptyText="No unbondings" />
              </TabPanel>
            </ExplorerTabs>
          </Panel>
        </Stack>

        <Stack gap="5">
          <Portfolio segments={portfolio.segments} inUsd={portfolio.inUsd} total={total} loading={loading} />
          {portfolio.delegations.length > 0 && <Delegations rows={portfolio.delegations} />}
        </Stack>
      </Grid>
    </Stack>
  );
}
