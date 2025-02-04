import React, { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  Link,
  HStack,
  Icon,
  Tabs,
  Table,
  GridItem,
  Center,
} from "@chakra-ui/react";
import { IoCopyOutline } from "react-icons/io5";
import { useOverview } from "./hooks";
import { useRecoilValue } from "recoil";
import { readAsset } from "@/recoil/asset";
import numeral from "numeral";
import { formatTokenByExponent } from "@/utils";

export default function AssetOverview() {
  const { state, maxHolders } = useOverview();
  const metadata = useRecoilValue(readAsset(state.denom));

  const supplyAmt = formatTokenByExponent(state.supply, metadata?.decimals);
  const supplyInUsd = parseFloat(supplyAmt) * metadata?.price;
  return (
    <>
      <GridItem
        colSpan={{ base: 6, md: 2 }}
        bg={{ base: "white", _dark: "black" }}
        p={6}
        borderRadius="lg"
                 bgColor={{ base: "#FAFBFC", _dark: "#0F0F0F" }}
      >
        <Text>Overview</Text>
        <Flex direction={"column"} gap={10}>
          <Box>
            <Text fontSize="md" color="gray.500">
              Total Supply
            </Text>
            <Text fontSize="lg" fontWeight="bold">
              {numeral(supplyAmt).format("0,0")} {metadata?.symbol}
            </Text>
          </Box>
          <Box>
            <Text fontSize="md" color="gray.500">
              Holders
            </Text>
            <Text fontSize="lg" fontWeight="bold">
              {numeral(state.holders).format("0,0")}
            </Text>
          </Box>
        </Flex>
      </GridItem>
      <GridItem
        colSpan={{ base: 6, md: 2 }}
        bg={{ base: "white", _dark: "black" }}
        p={6}
        borderRadius="lg"
                 bgColor={{ base: "#FAFBFC", _dark: "#0F0F0F" }}
      >
        <Text>Market</Text>

        <Flex direction={"column"} gap={10}>
          <Box>
            <Text fontSize="md" color="gray.500">
              Price
            </Text>
            <Text fontSize="lg" fontWeight="bold">
              ${numeral(metadata?.price).format("0.00")}
            </Text>
          </Box>
          <Box>
            <Text fontSize="md" color="gray.500">
              Circulating Supply Market Cap
            </Text>
            <Text fontSize="lg" fontWeight="bold">
              ${numeral(supplyInUsd).format("0,0.00")}
            </Text>
          </Box>
        </Flex>
      </GridItem>
      <GridItem
        colSpan={{ base: 6, md: 2 }}
        bg={{ base: "white", _dark: "black" }}
        p={6}
        borderRadius="lg"
                 bgColor={{ base: "#FAFBFC", _dark: "#0F0F0F" }}
      >
        <Text>Other Info</Text>

        <Flex direction={"column"} gap={2}>
          <Text fontSize="md" color="gray.500">
            Token Contract
          </Text>

          <Flex gap={2} align={"center"}>
            <Text fontSize="md" color="blue.500">
              realio13zz4mg4r2x4uqtwf6ckzk
            </Text>
            <IoCopyOutline />
          </Flex>
          <Flex gap={2} align={"center"}>
            <Text fontSize="md" color="blue.500">
              realio13zz4mg4r2x4uqtwf6ckzk
            </Text>
            <IoCopyOutline />
          </Flex>
        </Flex>
      </GridItem>
    </>
  );
}
