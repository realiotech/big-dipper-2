import React from "react";
import {
  Box,
  Text,
  Table,
  HStack,
  VStack,
  TableColumnHeader,
  GridItem,
} from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import { readAssets } from "@/recoil/asset";
import Asset from "@/components/helper/asset";
import { useSupplies } from "./hooks";
import Loading from "@/components/helper/loading";
import numeral from "numeral";
import { formatTokenByExponent } from "@/utils";

const TokenItem = ({ data, metadata }) => {
  const amtStr = formatTokenByExponent(data?.amount, metadata.decimals)
  const amtInUsd = parseFloat(amtStr) * metadata.price
  return (
    <Table.Row bg={{ base: "white", _dark: "#262626" }}>
      <Table.Cell borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }}>
        <HStack>
          <Asset
            name={metadata.symbol}
            image={metadata.image}
            denom={metadata.denom}
          />
        </HStack>
      </Table.Cell>

      <Table.Cell borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }}>
        <Text fontWeight="bold">${numeral(metadata.price).format("0.0000")}</Text>
      </Table.Cell>

      <Table.Cell borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }}>
        <VStack align="flex-end">
          <Text fontWeight="bold">${numeral(amtInUsd).format("0,0.00")}</Text>
          <Text fontSize="sm" color="gray.500">
            {numeral(amtStr).format("0,0.00")}
          </Text>
        </VStack>
      </Table.Cell>
    </Table.Row>
  )
}

const FeaturedTokens = () => {
  const { items, loading } = useSupplies();
  const { assetMap, loaded } = useRecoilValue(readAssets);

  return (
    <GridItem colSpan={2} h={"full"}>
      <Box bg={{ base: "#FAFBFC", _dark: "#0F0F0F" }} p={6} borderRadius="20px" h={"full"}>
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Network Tokens
        </Text>
        {(!loading && loaded) ?
          <Table.ScrollArea border={"none"} rounded="lg">
            <Table.Root color={{ base: "black", _dark: "white" }} bg={{ base: "white", _dark: "black" }} borderRadius="md">
              <Table.Header>
                <Table.Row bg={{ base: "#FAFBFC", _dark: "#0F0F0F" }}>
                  <TableColumnHeader>Token</TableColumnHeader>
                  <TableColumnHeader>Price</TableColumnHeader>
                  <TableColumnHeader textAlign={"right"}>
                    Total Supply
                  </TableColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body >
                {items.map((item, index) =>
                  <TokenItem data={item} key={`token-${index}`} metadata={assetMap[item.denom]} />)
                }
              </Table.Body>
            </Table.Root >
          </Table.ScrollArea> : <Loading />}

      </Box>
    </GridItem>
  );
};

export default FeaturedTokens;