import { GridItem, SimpleGrid, Text } from "@chakra-ui/react";
import Consensus from "@/components/home/consensus";
import DataBlocks from "@/components/home/data_blocks";
import PriceChart from "@/components/home/price_chart";
import Tokenomics from "@/components/home/tokenomics";
import Blocks from "@/components/home/blocks";
import Transactions from "@/components/home/transactions";
import StakingChart from "@/components/home/stake_chart";

export default function Home() {
  return (
    <SimpleGrid columns={{ base: 2, lg: 4 }} gap='10'>
      <DataBlocks />
      <PriceChart />
      {/* <Tokenomics />
      <Consensus /> */}
      <StakingChart/>
      <Blocks />
      <Transactions />
    </SimpleGrid>
  );
}
