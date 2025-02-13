import { GridItem, Text } from "@chakra-ui/react";
import { useDataStaking } from "./hooks";
import numeral from "numeral";

export default function DataStaking() {
  const { state } = useDataStaking();

  return (
    <GridItem colSpan={2}>
      <GridItem borderRadius="20px" bgColor={{ base: "#FAFBFC", _dark: "#0F0F0F" }} py="5" px="8" mb={3}>
        <Text fontSize="14px" pb="3">
          Inflation
        </Text>
        <Text fontSize="32px" fontWeight={600}>
          {numeral(state.inflation).format("0.0")}% Unminted RIO
        </Text>
      </GridItem>
      <GridItem borderRadius="20px" bgColor={{ base: "#FAFBFC", _dark: "#0F0F0F" }} py="5" px="8" mb={3}>
        <Text fontSize="14px" pb="3">
          Community Pool
        </Text>
        <Text fontSize="32px" fontWeight={600}>
          {state.communityPool}
        </Text>
      </GridItem>
      <GridItem borderRadius="20px" bgColor={{ base: "#FAFBFC", _dark: "#0F0F0F" }} py="5" px="8">
        <Text fontSize="14px" pb="3">
          Active Validators
        </Text>
        <Text fontSize="32px" fontWeight={600}>
          {numeral(state.validators.active).format("0,0")}
        </Text>
      </GridItem>
    </GridItem>
  );
}
