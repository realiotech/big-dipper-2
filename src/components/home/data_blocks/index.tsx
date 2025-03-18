import { Flex, GridItem, Text } from "@chakra-ui/react";
import { useDataBlocks } from "./hooks";
import { useDataStaking } from "../data_staking/hooks";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { Tooltip } from "@/components/ui/tooltip";
import numeral from "numeral";

export default function DataBlocks() {
  const { blockState } = useDataBlocks();
  const { stakingState } = useDataStaking();

  return (
    <GridItem colSpan={2}>
      <GridItem
        borderRadius="20px"
        bgColor={{ base: "#FAFBFC", _dark: "#0F0F0F" }}
        py="5"
        px="8"
        mb={3}
      >
        <Text fontSize="14px" pb="3">
          Latest Block
        </Text>
        <Text fontSize="32px" fontWeight={600}>
          {numeral(blockState.blockHeight).format("0,0")}
        </Text>
      </GridItem>
      <GridItem
        borderRadius="20px"
        bgColor={{ base: "#FAFBFC", _dark: "#0F0F0F" }}
        py="5"
        px="8"
        mb={3}
      >
        <Text fontSize="14px" pb="3">
          Active Validators
        </Text>
        <Text fontSize="32px" fontWeight={600}>
          {numeral(stakingState.validators.active).format("0,0")}
        </Text>
      </GridItem>
      <GridItem
        borderRadius="20px"
        bgColor={{ base: "#FAFBFC", _dark: "#0F0F0F" }}
        py="5"
        px="8"
      >
        <Text fontSize="14px" pb="3">
          <Flex gap='2' align="center">
          Inflation
          <Tooltip positioning={{ placement: "right-end" }} showArrow content={`${numeral(stakingState.inflation).format("0.0")}% of unminted RIO supply`}>
                <IoMdInformationCircleOutline />
              </Tooltip>
          </Flex>
        </Text>
        <Text fontSize="32px" fontWeight={600}>
            {numeral(stakingState.inflation).format("0.0")}%
        </Text>
      </GridItem>
    </GridItem>
  );
}
