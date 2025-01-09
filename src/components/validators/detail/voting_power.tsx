import React from "react";
import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { BLOCK_DETAILS } from "@/utils";
import HelpLink from "@/components/helper/help_link";
import numeral from "numeral";
import { ProgressBar, ProgressRoot } from "@/components/ui/progress";

export default function VotingPower({ data, status }) {
  const validatorVotingPower =
    status === 3 ? numeral(data.self).format("0,0") : "0";
  const votingPowerPercent =
    status === 3
      ? numeral((data.self / (numeral(data.overall.value).value() ?? 0)) * 100)
      : numeral(0);
  return (
    <Box
      bg="#FAFBFC"
      p={6}
      borderRadius="md"
      boxShadow="sm"
      flex="1"
      minW="320px"
    >
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Voting Power
      </Text>
      <Text fontSize="2xl" fontWeight="bold" mb={10} color="blue.500">
        {votingPowerPercent.format("0,0.00")}%
        <Text as="span" fontSize="sm" color="gray.500" ml={2}>
          {validatorVotingPower} / {numeral(data.overall.value).format("0,0")}
        </Text>
        <ProgressRoot
          variant={"subtle"}
          shape={"full"}
          value={votingPowerPercent.value()}
        >
          <ProgressBar />
        </ProgressRoot>
      </Text>
      <VStack gap={5} align="flex-start">
        <Flex justify="space-between" w="100%">
          <Text>Block</Text>
          <HelpLink
            href={BLOCK_DETAILS(data.height)}
            value={numeral(data.height).format("0,0")}
          />
        </Flex>
        <Flex justify="space-between" w="100%">
          <Text>Voting Power</Text>
          <Text>{validatorVotingPower}</Text>
        </Flex>
        <Flex justify="space-between" w="100%">
          <Text>Voting Power %</Text>
          <Text>{votingPowerPercent.format("0,0.00")}%</Text>
        </Flex>
      </VStack>
    </Box>
  );
}
