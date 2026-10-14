import { SimpleGrid } from "@chakra-ui/react";
import numeral from "numeral";
import { useRecoilValue } from "recoil";
import { StatCard } from "@/components/explorer/stat_card";
import { formatCompact } from "@/components/explorer/format";
import { readAssets } from "@/recoil/asset";
import { formatTokenByExponent } from "@/utils";
import { useDataBlocks } from "../data_blocks/hooks";
import { useDataStaking } from "../data_staking/hooks";
import { useTokenomics } from "../tokenomics/hooks";
import { useHero } from "../stake_chart/hooks";
import { useTokenSupplies } from "../hero/hooks";

export default function Stats() {
  const { blockState } = useDataBlocks();
  const { stakingState } = useDataStaking();
  const { state: pool } = useTokenomics();
  const { state: multistaking } = useHero();
  const { assetArr } = useRecoilValue(readAssets);
  const { tokens, loading: tokensLoading } = useTokenSupplies();

  const rio = tokens.RIO;
  const bondedRate = pool.bonded + pool.unbonding > 0 ? pool.bonded / (pool.bonded + pool.unbonding) : 0;

  // Only assets the explorer knows about: the multistaking tables also hold
  // junk denoms from invalid messages.
  const unbonding = assetArr.reduce(
    (sum, asset) =>
      sum + parseFloat(formatTokenByExponent(multistaking.unbonding[asset.denom.toLowerCase()] ?? "0", asset.decimals)),
    0
  );
  const stakingTokens = assetArr
    .filter((asset) => Number(multistaking.bonded[asset.denom.toLowerCase()] ?? 0) > 0)
    .map((asset) => asset.symbol)
    .join(", ");

  return (
    <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap="4">
      <StatCard
        label="RIO price"
        loading={tokensLoading}
        value={rio?.price ? `$${numeral(rio.price).format("0,0.[000000]")}` : "—"}
        rows={[
          { label: "Market cap", value: `$${formatCompact((rio?.price ?? 0) * (rio?.supply ?? 0))}` },
          { label: "Circulating supply", value: `${formatCompact(rio?.supply ?? 0)} RIO` },
        ]}
      />
      <StatCard
        label="Latest block"
        loading={!blockState.blockHeight}
        value={numeral(blockState.blockHeight).format("0,0")}
        rows={[
          { label: "Block time (1h avg)", value: `${numeral(blockState.blockTime).format("0.00")}s` },
          { label: "Total transactions", value: numeral(blockState.txsCount).format("0,0") },
        ]}
      />
      <StatCard
        label="Bonded"
        loading={!pool.bonded}
        value={formatCompact(pool.bonded)}
        suffix="staked"
        rows={[
          { label: "Bonded rate", value: numeral(bondedRate).format("0.0%") },
          { label: "Unbonding", value: formatCompact(unbonding) },
        ]}
      />
      <StatCard
        label="Active validators"
        loading={!stakingState.validators.active}
        value={numeral(stakingState.validators.active).format("0,0")}
        rows={[
          { label: "Community pool", value: stakingState.communityPool || "—" },
          { label: "Staking tokens", value: stakingTokens || "—" },
        ]}
      />
    </SimpleGrid>
  );
}
