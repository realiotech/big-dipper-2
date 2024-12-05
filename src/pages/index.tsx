import { GridItem, SimpleGrid, Text } from "@chakra-ui/react";
import Consensus from "@src/components/home/consensus";
import DataBlocks from "@src/components/home/data_blocks";
import PriceChart from "@src/components/home/price_chart";
import Tokenomics from "@src/components/home/tokenomics";
// import TokenPriceChart from "@/components/dashboard/price-chart";
// import Blocks from "@/components/dashboard/blocks";

export default function Home() {
  return (
    <SimpleGrid columns={{ base: 2, lg: 4 }} gap='10'>
      <DataBlocks />
      <PriceChart />
      <Tokenomics />
      <Consensus />
      <GridItem borderRadius='20px' bgColor='#F6F7F8' py='5' px='8' colSpan={2}>
        <Text fontSize='24px' pb='6' fontWeight={400}>
          Latest Blocks
        </Text>
        {/* <Blocks /> */}
      </GridItem>
      <GridItem borderRadius='20px' bgColor='#F6F7F8' py='5' px='8' colSpan={2}>
        <Text fontSize='24px' pb='6' fontWeight={400}>
          Latest Transactions
        </Text>
        {/* <Blocks /> */}
      </GridItem>
    </SimpleGrid>
  );
}
