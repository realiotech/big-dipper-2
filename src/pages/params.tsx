import React from "react";
import { Box, Grid, Stack, Text } from "@chakra-ui/react";
import numeral from "numeral";
import { NextSeo } from "next-seo";
import { chainConfig } from "@/configs";
import { Panel } from "@/components/explorer/panel";
import { PageTitle } from "@/components/explorer/page_title";
import { DetailRows, DetailRow } from "@/components/explorer/detail_rows";
import { CodeBlock } from "@/components/explorer/code_block";
import { formatPercent, formatUtc } from "@/components/explorer/format";
import { useChainParams } from "@/components/params/hooks";

// Realio's EVM chain ID is the number in the Cosmos chain ID (realionetwork_3301-1).
const evmChainId = (chainId: string) => chainId.match(/_(\d+)-/)?.[1] ?? "—";

/** Parameter fractions are decimal strings: "0.334000000000000000" -> "33.4%". */
const pct = (value: unknown) => formatPercent(Number(value ?? 0) * 100);
const yesNo = (value: unknown) => (value ? "Yes" : "No");
const count = (value: unknown) => numeral(Number(value ?? 0)).format("0,0");

/** Durations are nanoseconds: 604800000000000 -> "7 days". */
const duration = (ns: unknown) => {
  const seconds = Number(ns ?? 0) / 1e9;
  const units: Array<[number, string]> = [[86400, "day"], [3600, "hour"], [60, "minute"], [1, "second"]];
  const [size, name] = units.find(([unit]) => seconds >= unit && seconds % unit === 0) ?? [1, "second"];
  const n = seconds / size;
  return `${numeral(n).format("0,0.[##]")} ${name}${n === 1 ? "" : "s"}`;
};

/** Coin lists: [{ denom: "ario", amount: "1000…" }] -> "1,000 RIO". */
const coins = (value: unknown) =>
  (Array.isArray(value) ? value : [])
    .map((coin) => {
      const unit = chainConfig.tokenUnits?.[coin.denom];
      const amount = Number(coin.amount) / 10 ** (unit?.exponent ?? 0);
      return `${numeral(amount).format("0,0.[######]")} ${(unit?.display ?? coin.denom).toUpperCase()}`;
    })
    .join(", ") || "—";

const ParamsPanel = ({
  title,
  height,
  rows,
  raw,
  loading,
}: {
  title: string;
  height?: number;
  rows: DetailRow[];
  raw?: unknown;
  loading?: boolean;
}) => (
  <Panel h="full">
    <Box mb="3">
      <Text fontSize="md" fontWeight="600" color="explorer.text">
        {title}
      </Text>
      {height ? (
        <Text fontSize="sm" color="explorer.muted">
          Last updated at height {numeral(height).format("0,0")}
        </Text>
      ) : null}
    </Box>
    <DetailRows rows={rows} loading={loading} />
    {raw !== undefined && raw !== null && (
      <Box mt="3">
        <CodeBlock label={`${title.toLowerCase()} raw`} value={raw} />
      </Box>
    )}
  </Panel>
);

export default function ParamsPage() {
  const { loading, staking, slashing, mint, distribution, gov, nodeInfo, consensus } = useChainParams();
  const s = staking?.params ?? {};
  const sl = slashing?.params ?? {};
  const m = mint?.params ?? {};
  const d = distribution?.params ?? {};
  const g = gov?.params ?? {};
  const chainId = nodeInfo?.default_node_info?.network ?? chainConfig.network;

  return (
    <>
      <NextSeo title="Chain parameters" openGraph={{ title: "Chain parameters" }} />
      <PageTitle title="Chain parameters" />
      <Stack gap="5">
        <ParamsPanel
          title="Chain"
          rows={[
            { label: "Chain ID", value: chainId },
            { label: "EVM chain ID", value: evmChainId(chainId) },
            { label: "Address prefix", value: chainConfig.prefix.account },
            { label: "Application version", value: nodeInfo?.application_version?.version ?? "—" },
            { label: "Cosmos SDK version", value: nodeInfo?.application_version?.cosmos_sdk_version ?? "—" },
            { label: "CometBFT version", value: nodeInfo?.default_node_info?.version ?? "—" },
            { label: "Genesis time", value: formatUtc(chainConfig.genesis.time) },
            { label: "Initial height", value: count(chainConfig.genesis.height) },
          ]}
        />

        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="5" alignItems="start">
          <Stack gap="5">
            <ParamsPanel
              title="Staking"
              height={staking?.height}
              loading={loading}
              raw={staking?.params}
              rows={[
                { label: "Bond denom", value: s.bond_denom ?? "—" },
                { label: "Max entries", value: count(s.max_entries) },
                { label: "Max validators", value: count(s.max_validators) },
                { label: "Unbonding time", value: duration(s.unbonding_time) },
                { label: "Historical entries", value: count(s.historical_entries) },
                { label: "Min commission rate", value: pct(s.min_commission_rate) },
              ]}
            />
            <ParamsPanel
              title="Governance"
              height={gov?.height}
              loading={loading}
              raw={gov?.params}
              rows={[
                { label: "Quorum", value: pct(g.quorum) },
                { label: "Threshold", value: pct(g.threshold) },
                { label: "Min deposit", value: coins(g.min_deposit) },
                { label: "Voting period", value: duration(g.voting_period) },
                { label: "Burn vote veto", value: yesNo(g.burn_vote_veto) },
                { label: "Veto threshold", value: pct(g.veto_threshold) },
                { label: "Min deposit ratio", value: pct(g.min_deposit_ratio) },
                { label: "Max deposit period", value: duration(g.max_deposit_period) },
                { label: "Expedited threshold", value: pct(g.expedited_threshold) },
                { label: "Expedited min deposit", value: coins(g.expedited_min_deposit) },
                { label: "Proposal cancel ratio", value: pct(g.proposal_cancel_ratio) },
                { label: "Expedited voting period", value: duration(g.expedited_voting_period) },
                { label: "Min initial deposit ratio", value: pct(g.min_initial_deposit_ratio) },
              ]}
            />
          </Stack>
          <Stack gap="5">
            <ParamsPanel
              title="Slashing"
              height={slashing?.height}
              loading={loading}
              raw={slashing?.params}
              rows={[
                { label: "Signed blocks window", value: `${count(sl.signed_blocks_window)} blocks` },
                { label: "Min signed per window", value: pct(sl.min_signed_per_window) },
                { label: "Downtime jail duration", value: duration(sl.downtime_jail_duration) },
                { label: "Slash fraction downtime", value: pct(sl.slash_fraction_downtime) },
                { label: "Slash fraction double sign", value: pct(sl.slash_fraction_double_sign) },
              ]}
            />
            <ParamsPanel
              title="Distribution"
              height={distribution?.height}
              loading={loading}
              raw={distribution?.params}
              rows={[
                { label: "Community tax", value: pct(d.community_tax) },
                { label: "Base proposer reward", value: pct(d.base_proposer_reward) },
                { label: "Bonus proposer reward", value: pct(d.bonus_proposer_reward) },
                { label: "Withdraw addr enabled", value: yesNo(d.withdraw_addr_enabled) },
              ]}
            />
            <ParamsPanel
              title="Mint"
              height={mint?.height}
              loading={loading}
              raw={mint?.params}
              rows={[
                { label: "Mint denom", value: m.mint_denom ?? "—" },
                { label: "Inflation rate", value: pct(m.inflation_rate) },
                { label: "Blocks per year", value: count(m.blocks_per_year) },
              ]}
            />
          </Stack>
        </Grid>

        <ParamsPanel
          title="Consensus"
          raw={consensus}
          loading={!consensus}
          rows={Object.entries(consensus ?? { block: null, evidence: null, validator: null, version: null, abci: null }).map(([key, value]) => ({
            label: key.charAt(0).toUpperCase() + key.slice(1),
            value: (
              <Text fontFamily="mono" fontSize="xs">
                {JSON.stringify(value)}
              </Text>
            ),
          }))}
        />
      </Stack>
    </>
  );
}
