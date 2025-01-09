import React from "react";
import { Box, Flex, Text, Link, VStack } from "@chakra-ui/react";
import { useProfileRecoil } from "@/recoil/profiles";
import Proposer from "@/components/helper/proposer";
import {
  ADDRESS_DETAILS,
  getValidatorCondition,
  getValidatorStatus,
} from "@/utils";
import { getCondition } from "./utils";
import { Status } from "@/components/ui/status";
import useTranslation from "next-translate/useTranslation";
import HelpLink from "@/components/helper/help_link";
import numeral from "numeral";
import NextLink from "next/link";

function shortenText(text, maxLength = 40) {
  return text?.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

export default function Overview({ state }) {
  const { t } = useTranslation("validators");
  const { overview, status } = state;
  const { imageUrl, name, address } = useProfileRecoil(overview.validator);
  const statusTheme = getValidatorStatus(
    status.status,
    status.jailed,
    status.tombstoned
  );
  const condition = getCondition(status.condition, status.status);

  return (
    <Box
      bg="#FAFBFC"
      p={6}
      borderRadius="md"
      boxShadow="sm"
      flex="1"
      minW="320px"
    >
      <Flex justify="space-between" align="center" mb={4}>
        <Flex gap={8}>
          <Proposer address={address} name={name} image={imageUrl} />
          <Status colorPalette={statusTheme.theme} color={statusTheme.theme}>
            {t(statusTheme.status)}
          </Status>
        </Flex>
        <Box
          as="button"
          bg="blue.500"
          color="white"
          px={4}
          py={1}
          borderRadius="md"
          fontWeight="medium"
          _hover={{ bg: "blue.600" }}
          display={{base: 'none', md:'block'}}
        >
          Delegate
        </Box>
      </Flex>
      <Text color="gray.600" mb={4}>
        {overview.description}
      </Text>
      <Box mb={4}>
        <Flex fontSize="sm" gap={"10px"} >
          <VStack align="flex-start">
            <Text>Operator Address:</Text>
            <Text>Self Delegate Address:</Text>
            <Text>Web Site:</Text>
          </VStack>
          <VStack align="flex-start">
            <HelpLink
              href={ADDRESS_DETAILS(overview.operatorAddress)}
              value={overview.operatorAddress}
            />
            <HelpLink
              href={ADDRESS_DETAILS(overview.selfDelegateAddress)}
              value={overview.selfDelegateAddress}
            />

            <Link asChild colorPalette={"blue"}>
              <NextLink href={overview.website}>
                {shortenText(overview.website)}
              </NextLink>
            </Link>
          </VStack>
        </Flex>
      </Box>
      <Flex direction={{base: 'column', md: 'row'}} justify="space-between" gap={"10px"} fontSize="sm">
        <Box w = {{base: 'full', md: '200'}} borderRadius={'lg'} padding="10px" bg="white">
          <Flex direction="column">
            <Text>Commission</Text>
            <Text>{numeral(status.commission * 100).format("0.00")}%</Text>
          </Flex>
        </Box>
        <Box w = {{base: 'full', md: '200'}} borderRadius={'lg'} padding="10px" bg="white">
          <Flex direction="column">
            <Text>Condition</Text>
            <Text color={condition.color}>{t(condition.condition)}</Text>
          </Flex>
        </Box>
        <Box w = {{base: 'full', md: '200'}} borderRadius={'lg'} padding="10px" bg="white">
          <Flex direction="column">
            <Text>Max Commission Rate</Text>
            <Text>{numeral(status.maxRate * 100).format("0.00")}%</Text>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}
