import React, { useState } from "react";
import { Flex, Grid, Image, Link as ChakraLink, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import numeral from "numeral";
import { Panel } from "@/components/explorer/panel";
import { PageTitle } from "@/components/explorer/page_title";
import { StatCard } from "@/components/explorer/stat_card";
import { Column, DataTable } from "@/components/explorer/data_table";
import { ExplorerTabs, TabPanel } from "@/components/explorer/tabs";
import { AddressLink } from "@/components/explorer/address_link";
import { StatusTag, ValidatorAvatar } from "@/components/explorer/badges";
import { CopyButton } from "@/components/explorer/copy_button";
import { CONTRACT_DETAILS } from "@/components/explorer/evm_address";
import { formatPercent, timeAgo } from "@/components/explorer/format";
import { NotFound } from "@/components/explorer/not_found";
import { Paged, Segmented, SupplyComposition, TokenInformation, holderColumns, stakeColumns, tokens } from "@/components/assets/parts";
import { getMiddleEllipsis } from "@/utils/get_middle_ellipsis";
import { TRANSACTION_DETAILS } from "@/utils/go_to_page";
import { TransferKind, TransferRow, useErc20Details } from "./hooks";

const ContractLink = ({ address, beginning = 8, ending = 6 }: { address: string; beginning?: number; ending?: number }) => (
  <AddressLink address={address} href={CONTRACT_DETAILS(address)} beginning={beginning} ending={ending} />
);

const Party = ({ address }: { address: string }) => (address ? <AddressLink address={address} beginning={8} ending={6} /> : <Text color="explorer.muted">—</Text>);

const transferColumns: Column<TransferRow>[] = [
  {
    key: "hash",
    header: "Tx hash",
    render: (row) => (
      <Flex as="span" display="inline-flex" align="center" gap="1">
        <ChakraLink asChild color="explorer.link">
          <NextLink href={TRANSACTION_DETAILS(row.hash)}>{getMiddleEllipsis(row.hash, { beginning: 10, ending: 6 })}</NextLink>
        </ChakraLink>
        <CopyButton value={row.hash} label="Copy hash" />
      </Flex>
    ),
  },
  { key: "from", header: "From", render: (row) => <Party address={row.from} /> },
  { key: "to", header: "To", render: (row) => <Party address={row.to} /> },
  { key: "amount", header: "Amount", align: "end", render: (row) => tokens(row.amount) },
  { key: "age", header: "Age", align: "end", render: (row) => <Text color="explorer.muted">{timeAgo(row.timestamp)}</Text> },
];

// Holders are EVM accounts, which carry no module labels.
const evmHolderColumns = holderColumns.filter((column) => column.key !== "label");

const TRANSFER_VIEWS: Array<{ value: TransferKind; label: string }> = [
  { value: "transfers", label: "Transfers" },
  { value: "mints", label: "Mints" },
  { value: "burns", label: "Burns" },
];

export default function Erc20Details() {
  const t = useErc20Details();
  const [tab, setTab] = useState("holders");
  const [transferView, setTransferView] = useState<TransferKind>("transfers");
  const [stakingView, setStakingView] = useState<"delegations" | "unbondings">("delegations");
  const symbol = t.asset?.symbol ?? "ERC-20";
  const price = t.asset?.price ?? 0;
  const activity = t.transfers[transferView];
  const activityCount = TRANSFER_VIEWS.reduce((sum, view) => sum + t.transfers[view.value].count, 0);

  if (!t.exists) return <NotFound />;

  return (
    <Stack gap="5">
      <PageTitle
        crumbs={[{ label: "Assets", href: "/assets" }, { label: symbol }]}
        title={
          <Flex as="span" align="center" gap="3">
            {t.asset?.image ? <Image src={t.asset.image} alt="" boxSize="40px" borderRadius="full" /> : <ValidatorAvatar name={symbol} size="40px" />}
            {t.asset?.name ?? symbol}
          </Flex>
        }
        subtitle="Token overview"
        actions={
          <Flex gap="2">
            <StatusTag tone="accent">{symbol}</StatusTag>
            <StatusTag tone="neutral">ERC-20</StatusTag>
            {t.stakeable && <StatusTag tone="success">Stakeable</StatusTag>}
          </Flex>
        }
      />

      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap="4">
        <StatCard
          label="Price"
          loading={t.loading}
          value={price ? `$${numeral(price).format("0,0.[000000]")}` : "—"}
          rows={[
            { label: "Market cap", value: price ? `$${numeral(price * t.supply).format("0,0.00")}` : "—" },
            { label: "Contract", value: <ContractLink address={t.address} /> },
          ]}
        />
        <StatCard
          label="Total supply"
          loading={t.loading}
          value={tokens(t.supply)}
          suffix={symbol}
          rows={[
            { label: "Decimals", value: t.asset?.decimals ?? 18 },
            { label: "Symbol", value: symbol },
          ]}
        />
        <StatCard
          label="Holders"
          loading={t.loading}
          value={numeral(t.holderCount).format("0,0")}
          rows={[
            { label: "Top holder share", value: formatPercent(t.topHolderShare) },
            { label: "Top holder", value: t.topHolder ? <AddressLink address={t.topHolder} beginning={8} ending={6} /> : "—" },
          ]}
        />
        <StatCard
          label="Bonded"
          loading={t.loading}
          value={tokens(t.bonded)}
          suffix={symbol}
          rows={[
            { label: "Bonded ratio", value: formatPercent(t.supply ? (t.bonded / t.supply) * 100 : 0) },
            { label: "Delegations", value: numeral(t.delegations.count).format("0,0") },
          ]}
        />
      </SimpleGrid>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 444px" }} gap="5">
        <SupplyComposition
          supply={t.supply}
          bonded={t.bonded}
          unbonding={t.unbonding}
          symbol={symbol}
          footer={{ label: "Token transfers", value: numeral(activityCount).format("0,0") }}
        />
        <TokenInformation
          rows={[
            ["Contract", <ContractLink key="contract" address={t.address} beginning={10} ending={8} />],
            ["Denom", <Text key="denom" title={t.denom}>{getMiddleEllipsis(t.denom, { beginning: 12, ending: 6 })}</Text>],
            ["Symbol", symbol],
            ["Name", t.asset?.name ?? "—"],
            ["Decimals", String(t.asset?.decimals ?? 18)],
            ["Type", "ERC-20"],
            ["Stakeable", t.stakeable ? "Yes" : "No"],
          ]}
        />
      </Grid>

      <Panel>
        <ExplorerTabs
          value={tab}
          onChange={setTab}
          items={[
            { value: "holders", label: "Holders", count: t.holders.count },
            { value: "transfers", label: "Transfers", count: activityCount },
            { value: "staking", label: "Staking", count: t.delegations.count },
          ]}
        >
          <TabPanel value="holders" pt="0">
            <DataTable columns={evmHolderColumns} rows={t.holders.rows} rowKey={(row) => row.address} loading={t.holders.loading} emptyText="No holders" />
            <Paged count={t.holders.count} page={t.holders.page} setPage={t.holders.setPage} label="holders" />
          </TabPanel>
          <TabPanel value="transfers" pt="2">
            <Segmented
              value={transferView}
              onChange={setTransferView}
              items={TRANSFER_VIEWS.map((view) => ({ ...view, count: t.transfers[view.value].count }))}
            />
            <DataTable
              columns={transferColumns}
              rows={activity.rows}
              rowKey={(row) => `${row.hash}:${row.from}:${row.to}:${row.amount}`}
              loading={activity.loading}
              emptyText={`No ${transferView}`}
            />
            <Paged count={activity.count} page={activity.page} setPage={activity.setPage} label={transferView} />
          </TabPanel>
          <TabPanel value="staking" pt="2">
            <Segmented
              value={stakingView}
              onChange={setStakingView}
              items={[
                { value: "delegations", label: "Delegations", count: t.delegations.count },
                { value: "unbondings", label: "Unbondings", count: t.unbondings.count },
              ]}
            />
            {stakingView === "delegations" ? (
              <>
                <DataTable columns={stakeColumns(false)} rows={t.delegations.rows} rowKey={(row) => `${row.address}:${row.validator}`} loading={t.delegations.loading} emptyText="No delegations" />
                <Paged count={t.delegations.count} page={t.delegations.page} setPage={t.delegations.setPage} label="delegations" />
              </>
            ) : (
              <>
                <DataTable columns={stakeColumns(true)} rows={t.unbondings.rows} rowKey={(row) => `${row.address}:${row.validator}:${row.height}`} loading={t.unbondings.loading} emptyText="No unbondings" />
                <Paged count={t.unbondings.count} page={t.unbondings.page} setPage={t.unbondings.setPage} label="unbondings" />
              </>
            )}
          </TabPanel>
        </ExplorerTabs>
      </Panel>
    </Stack>
  );
}
