import { GridItem, Text } from "@chakra-ui/react";
import { useDataStaking } from "./hooks";
import { useDataBlocks } from "../data_blocks/hooks";
import numeral from "numeral";

export default function DataStaking() {
  const { stakingState } = useDataStaking();
  const { blockState } = useDataBlocks();

  return (
    <GridItem colSpan={2}>
      <GridItem borderRadius="20px" bgColor={{ base: "#FAFBFC", _dark: "#0F0F0F" }} py="5" px="8" mb={3}>
        <Text fontSize="14px" pb="3">
          Total Transactions
        </Text>
        <Text fontSize="32px" fontWeight={600}>
          {numeral(blockState.txsCount).format("0,0")}
        </Text>
      </GridItem>
      <GridItem borderRadius="20px" bgColor={{ base: "#FAFBFC", _dark: "#0F0F0F" }} py="5" px="8" mb={3}>
        <Text fontSize="14px" pb="3">
          Average Block Time
        </Text>
        <Text fontSize="32px" fontWeight={600}>
          {numeral(blockState.blockTime).format("0.00")} s
        </Text>
      </GridItem>
      <GridItem borderRadius="20px" bgColor={{ base: "#FAFBFC", _dark: "#0F0F0F" }} py="5" px="8" >
        <Text fontSize="14px" pb="3">
          Community Pool
        </Text>
        <Text fontSize="32px" fontWeight={600}>
          {stakingState.communityPool}
        </Text>
      </GridItem>
    </GridItem>
  );
}
