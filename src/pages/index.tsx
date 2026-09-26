import { SimpleGrid, Stack } from "@chakra-ui/react";
import Hero from "@/components/home/hero";
import Stats from "@/components/home/stats";
import StakingChart from "@/components/home/stake_chart";
import Blocks from "@/components/home/blocks";
import Transactions from "@/components/home/transactions";

export default function Home() {
  return (
    <Stack gap={{ base: "6", md: "8" }}>
      <Hero />
      <Stats />
      <StakingChart />
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="5">
        <Blocks />
        <Transactions />
      </SimpleGrid>
    </Stack>
  );
}
