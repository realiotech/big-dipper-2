import React, { useState } from "react";
import { Flex, Grid, Image, SimpleGrid, Stack } from "@chakra-ui/react";
import numeral from "numeral";
import { Panel } from "@/components/explorer/panel";
import { PageTitle } from "@/components/explorer/page_title";
import { StatCard } from "@/components/explorer/stat_card";
import { DataTable } from "@/components/explorer/data_table";
import { ExplorerTabs, TabPanel } from "@/components/explorer/tabs";
import { AddressLink } from "@/components/explorer/address_link";
import { StatusTag, ValidatorAvatar } from "@/components/explorer/badges";
import { formatPercent } from "@/components/explorer/format";
import { NotFound } from "@/components/explorer/not_found";
import { useAssetDetails } from "./hooks";
import { Paged, Segmented, SupplyComposition, TokenInformation, holderColumns, stakeColumns, tokens } from "./parts";

export default function AssetDetails() {
  const a = useAssetDetails();
  const [tab, setTab] = useState("holders");
  const [stakingView, setStakingView] = useState<"delegations" | "unbondings">("delegations");
  const symbol = a.asset?.symbol ?? a.denom.toUpperCase();

  if (!a.exists) return <NotFound />;

  return (
    <Stack gap="5">
      <PageTitle
        crumbs={[{ label: "Assets", href: "/assets" }, { label: symbol }]}
        title={
          <Flex as="span" align="center" gap="3">
            {a.asset?.image ? <Image src={a.asset.image} alt="" boxSize="40px" borderRadius="full" /> : <ValidatorAvatar name={symbol} size="40px" />}
            {a.asset?.name ?? symbol}
          </Flex>
        }
        subtitle="Token overview"
        actions={
          <Flex gap="2">
            <StatusTag tone="accent">{symbol}</StatusTag>
            <StatusTag tone="neutral">Native</StatusTag>
            {a.stakeable && <StatusTag tone="success">Stakeable</StatusTag>}
          </Flex>
        }
      />

      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap="4">
        <StatCard
          label="Price"
          loading={a.loading}
          value={a.asset?.price ? `$${numeral(a.asset.price).format("0,0.[000000]")}` : "—"}
          rows={[
            { label: "Market cap", value: a.asset?.price ? `$${numeral(a.asset.price * a.supply).format("0,0.00")}` : "—" },
            { label: "Denom", value: a.denom },
          ]}
        />
        <StatCard
          label="Total supply"
          loading={a.loading}
          value={tokens(a.supply)}
          suffix={symbol}
          rows={[
            { label: "Decimals", value: a.asset?.decimals ?? 18 },
            { label: "Symbol", value: symbol },
          ]}
        />
        <StatCard
          label="Holders"
          loading={a.loading}
          value={numeral(a.holderCount).format("0,0")}
          rows={[
            { label: "Top holder share", value: formatPercent(a.topHolderShare) },
            { label: "Top holder", value: a.topHolder ? <AddressLink address={a.topHolder} beginning={8} ending={6} /> : "—" },
          ]}
        />
        <StatCard
          label="Bonded"
          loading={a.loading}
          value={tokens(a.bonded)}
          suffix={symbol}
          rows={[
            { label: "Bonded ratio", value: formatPercent(a.supply ? (a.bonded / a.supply) * 100 : 0) },
            { label: "Delegations", value: numeral(a.delegations.count).format("0,0") },
          ]}
        />
      </SimpleGrid>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 444px" }} gap="5">
        <SupplyComposition
          supply={a.supply}
          bonded={a.bonded}
          unbonding={a.unbonding}
          symbol={symbol}
          footer={{ label: "Snapshot height", value: numeral(a.snapshotHeight).format("0,0") }}
        />
        <TokenInformation
          rows={[
            ["Denom", a.denom],
            ["Symbol", symbol],
            ["Name", a.asset?.name ?? "—"],
            ["Decimals", String(a.asset?.decimals ?? 18)],
            ["Type", "Native"],
            ["Stakeable", a.stakeable ? "Yes" : "No"],
          ]}
        />
      </Grid>

      <Panel>
        <ExplorerTabs
          value={tab}
          onChange={setTab}
          items={[
            { value: "holders", label: "Holders", count: a.holders.count },
            { value: "staking", label: "Staking", count: a.delegations.count },
          ]}
        >
          <TabPanel value="holders" pt="0">
            <DataTable columns={holderColumns} rows={a.holders.rows} rowKey={(row) => row.address} loading={a.holders.loading} emptyText="No holders" />
            <Paged count={a.holders.count} page={a.holders.page} setPage={a.holders.setPage} label="holders" />
          </TabPanel>
          <TabPanel value="staking" pt="2">
            <Segmented
              value={stakingView}
              onChange={setStakingView}
              items={[
                { value: "delegations", label: "Delegations", count: a.delegations.count },
                { value: "unbondings", label: "Unbondings", count: a.unbondings.count },
              ]}
            />
            {stakingView === "delegations" ? (
              <>
                <DataTable columns={stakeColumns(false)} rows={a.delegations.rows} rowKey={(row) => `${row.address}:${row.validator}`} loading={a.delegations.loading} emptyText="No delegations" />
                <Paged count={a.delegations.count} page={a.delegations.page} setPage={a.delegations.setPage} label="delegations" />
              </>
            ) : (
              <>
                <DataTable columns={stakeColumns(true)} rows={a.unbondings.rows} rowKey={(row) => `${row.address}:${row.validator}:${row.height}`} loading={a.unbondings.loading} emptyText="No unbondings" />
                <Paged count={a.unbondings.count} page={a.unbondings.page} setPage={a.unbondings.setPage} label="unbondings" />
              </>
            )}
          </TabPanel>
        </ExplorerTabs>
      </Panel>
    </Stack>
  );
}
