import { SimpleGrid } from "@chakra-ui/react";
import DataBlocks from "@/components/home/data_blocks";
import DataStaking from "@/components/home/data_staking";
import Blocks from "@/components/home/blocks";
import Transactions from "@/components/home/transactions";
import StakingChart from "@/components/home/stake_chart";
import FeaturedBlockchains from "@/components/home/assets";

export default function Home() {
  return (
    <SimpleGrid columns={{ base: 2, lg: 4 }} gap='10'>
      <FeaturedBlockchains/>
      <DataBlocks />
      <DataStaking />
      <StakingChart/>
      <Blocks />
      <Transactions />
    </SimpleGrid>
  );
}
