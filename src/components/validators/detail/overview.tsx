import React from "react";
import {
  Box,
  Flex,
  Text,
  Link,
  VStack,
  Grid,
  GridItem,
} from "@chakra-ui/react";
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
import { formatValAddress } from "@/utils/format_address";
import Asset from "@/components/helper/asset";
import { useRecoilValue } from "recoil";
import { readAsset } from "@/recoil/asset";

function shortenText(text, maxLength = 40) {
  return text?.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

export default function Overview({ state }) {
  const { t } = useTranslation("validators");
  const { overview, status } = state;
  const asset = useRecoilValue(readAsset(overview?.denom));
  const { imageUrl, name, address } = useProfileRecoil(overview.validator);
  const statusTheme = getValidatorStatus(
    status.status,
    status.jailed,
    status.tombstoned
  );
  const condition = getCondition(status.condition, status.status);

  return (
    <Box
      bg={{ base: "#FAFBFC", _dark: "#0F0F0F" }}
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
          display={{ base: "none", md: "block" }}
        >
          Delegate
        </Box>
      </Flex>
      <Text color="gray.600" mb={4}>
        {overview.description}
      </Text>
      <Box mb={4}>
        <Flex w={"full"} fontSize="sm" justify={"space-between"}>
          <Grid templateColumns="1fr 1fr" gap={2} w="full">
            <GridItem>
              <Text>Operator Address:</Text>
            </GridItem>
            <GridItem textAlign="right">
              <HelpLink
                href={ADDRESS_DETAILS(overview.operatorAddress)}
                value={overview.operatorAddress}
              />
            </GridItem>

            <GridItem>
              <Text>Self Delegate Address:</Text>
            </GridItem>
            <GridItem textAlign="right">
              <HelpLink
                href={ADDRESS_DETAILS(
                  formatValAddress(overview?.operatorAddress)
                )}
                value={formatValAddress(overview?.operatorAddress)}
              />
            </GridItem>

            <GridItem>
              <Text>Web Site:</Text>
            </GridItem>
            <GridItem textAlign="right">
              <Link asChild colorPalette="blue">
                <NextLink href={overview.website}>
                  {shortenText(overview.website)}
                </NextLink>
              </Link>
            </GridItem>

            <GridItem>
              <Text>Staking Token:</Text>
            </GridItem>
            <GridItem textAlign="right">
              <Asset
                denom={asset?.denom}
                image={asset?.image}
                name={asset?.symbol}
              />
            </GridItem>
          </Grid>
        </Flex>
      </Box>
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        gap={"10px"}
        fontSize="sm"
      >
        <Box
          w={{ base: "full", md: "200" }}
          borderRadius={"lg"}
          padding="10px"
          bg={{ base: "white", _dark: "black" }}
        >
          <Flex direction="column">
            <Text>Commission</Text>
            <Text>{numeral(status.commission * 100).format("0.00")}%</Text>
          </Flex>
        </Box>
        <Box
          w={{ base: "full", md: "200" }}
          borderRadius={"lg"}
          padding="10px"
          bg={{ base: "white", _dark: "black" }}
        >
          <Flex direction="column">
            <Text>Condition</Text>
            <Text color={condition.color}>{t(condition.condition)}</Text>
          </Flex>
        </Box>
        <Box
          w={{ base: "full", md: "200" }}
          borderRadius={"lg"}
          padding="10px"
          bg={{ base: "white", _dark: "black" }}
        >
          <Flex direction="column">
            <Text>Max Commission Rate</Text>
            <Text>{numeral(status.maxRate * 100).format("0.00")}%</Text>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}
