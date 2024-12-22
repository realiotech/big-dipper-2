import { GridItem, SimpleGrid, Text } from "@chakra-ui/react";
import Consensus from "@src/components/home/consensus";
import DataBlocks from "@src/components/home/data_blocks";
import PriceChart from "@src/components/home/price_chart";
import Tokenomics from "@src/components/home/tokenomics";
import Blocks from "@src/components/home/blocks";
import Transactions from "@src/components/home/transactions";
export default function Home() {
  return (
    <SimpleGrid columns={{ base: 2, lg: 4 }} gap='10'>
      <DataBlocks />
      <PriceChart />
      <Tokenomics />
      <Consensus />
      <Blocks />
      <Transactions />
    </SimpleGrid>
  );
}
