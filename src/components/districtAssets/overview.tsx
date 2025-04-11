import React, { useState } from "react";
import {
  Box,
  Flex,
  Text,
  GridItem,
} from "@chakra-ui/react";
import { useOverview } from "./hooks";
import numeral from "numeral";

export default function AssetOverview() {
  const { state } = useOverview();
  const supplyAmt = state.supply;
  const supplyInUsd = parseFloat(supplyAmt) * 1.27;
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
              {numeral(supplyAmt).format("0,0")} {state.denom}
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
              ${numeral(1.27).format("0.00")}
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
            Contract: {state.id}
          </Text>
          <Text fontSize="md" color="gray.500">
            Symbol: {state.denom}
          </Text>
          <Text fontSize="md" color="gray.500">
            Name: {state.name}
          </Text>
          <Text fontSize="md" color="gray.500">
            Decimals: {state.decimals}
          </Text>
        </Flex>
      </GridItem>
    </>
  );
}
