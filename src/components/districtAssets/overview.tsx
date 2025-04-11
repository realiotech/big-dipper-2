import React, { useState } from "react";
import {
  Box,
  Flex,
  Text,
  GridItem,
} from "@chakra-ui/react";
import { useOverview } from "./hooks";
import { useRecoilValue } from "recoil";
import { readAsset } from "@/recoil/asset";
import numeral from "numeral";
import { formatTokenByExponent } from "@/utils";

export default function AssetOverview() {
  const { state } = useOverview();
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
        <Text fontSize={'24px'} pb={'10px'}>Overview</Text>
        <Flex direction={"column"} gap={2}>
          <Box>
            <Text fontSize="14px" color="gray.500">
              Total Supply
            </Text>
            <Text fontSize="32px" fontWeight="bold" color={'#522B61'}>
              {numeral(supplyAmt).format("0,0")} {metadata?.symbol}
            </Text>
          </Box>
          <Box>
            <Text fontSize="14px" color="gray.500">
              Holders
            </Text>
            <Text fontSize="32px" fontWeight="bold" color={'#522B61'}>
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
        <Text fontSize={'24px'} pb={'10px'}>Market</Text>
        <Flex direction={"column"} gap={2}>
          <Box>
            <Text fontSize="14px" color="gray.500">
              Price
            </Text>
            <Text fontSize="32px" fontWeight="bold" color={'#522B61'}>
              ${numeral(metadata?.price).format("0.00")}
            </Text>
          </Box>
          <Box>
            <Text fontSize="14px" color="gray.500">
              Circulating Supply Market Cap
            </Text>
            <Text fontSize="32px" fontWeight="bold" color={'#522B61'}>
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

        <Flex direction={"column"} gap={2}>
          <Text fontSize="md">
            More Information
          </Text>
          <Text fontSize="md" color="gray.500">
            Denom: {metadata?.denom}
          </Text>
          <Text fontSize="md" color="gray.500">
            Symbol: {metadata?.symbol}
          </Text>
          <Text fontSize="md" color="gray.500">
            Name: {metadata?.name}
          </Text>
          <Text fontSize="md" color="gray.500">
            Decimals: {metadata?.decimals}
          </Text>
        </Flex>
      </GridItem>
    </>
  );
}
