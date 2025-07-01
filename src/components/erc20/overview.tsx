import React from "react";
import {
  Box,
  Flex,
  Text,
  GridItem,
} from "@chakra-ui/react";
import { useOverview } from "./hooks";
import numeral from "numeral";
import { useRecoilValue } from "recoil";
import { readToken } from "@/recoil/erc20";

export default function Erc20Overview({address, metadata}) {
  const { state } = useOverview(address);
  const supplyAmt = state.supply;
  const tokenDetails = useRecoilValue(readToken(address));
  const price = tokenDetails?.price || 0;
  const supplyInUsd = Number(supplyAmt) * Number(price);

  // Use default values when metadata is not available
  const safeMetadata = metadata || {
    symbol: 'N/A',
    name: 'N/A',
    decimals: 'N/A'
  };

  // Use default values for loading state
  const displaySupplyAmt = supplyAmt || '0';
  const displayHolders = state.holders || 0;
  const displayPrice = price || 0;
  const displaySupplyInUsd = supplyInUsd || 0;
  const displayContractId = state.id || 'N/A';

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
            <Text fontSize="32px" fontWeight="bold"color={{ base: "#522B61", _dark: "white" }}>
              {numeral(displaySupplyAmt).format("0,0")} {safeMetadata.symbol}
            </Text>
          </Box>
          <Box>
            <Text fontSize="14px" color="gray.500">
              Holders
            </Text>
            <Text fontSize="32px" fontWeight="bold"color={{ base: "#522B61", _dark: "white" }}>
              {numeral(displayHolders).format("0,0")}
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
            <Text fontSize="32px" fontWeight="bold" color={{ base: "#522B61", _dark: "white" }}>
              ${numeral(displayPrice).format("0.0000")}
            </Text>
          </Box>
          <Box>
            <Text fontSize="14px" color="gray.500">
              Circulating Supply Market Cap
            </Text>
            <Text fontSize="32px" fontWeight="bold"color={{ base: "#522B61", _dark: "white" }}>
              ${numeral(displaySupplyInUsd).format("0,0.00")}
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
            Contract: {displayContractId}
          </Text>
          <Text fontSize="md" color="gray.500">
            Symbol: {safeMetadata.symbol}
          </Text>
          <Text fontSize="md" color="gray.500">
            Name: {safeMetadata.name}
          </Text>
          <Text fontSize="md" color="gray.500">
            Decimals: {safeMetadata.decimals}
          </Text>
        </Flex>
      </GridItem>
    </>
  );
}
