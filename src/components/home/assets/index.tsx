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
import { readTokens } from "@/recoil/erc20";
import Asset from "@/components/helper/asset";
import Erc20 from "@/components/helper/erc20";
import { useSupplies } from "./hooks";
import Loading from "@/components/helper/loading";
import numeral from "numeral";
import { formatTokenByExponent } from "@/utils";


const TokenItem = ({ data, metadata, burnedAmt, isErc20 = false }) => {
  if (isErc20) {
    // Handle ERC20 token display - use pre-loaded supply data
    const rawSupply = metadata.supply || '0';
    // The supply from subgraph is already formatted, so we don't need to apply decimals
    const supplyNumber = Number(rawSupply) || 0;
    const price = Number(metadata?.price) || 0;
    const supplyInUsd = supplyNumber * price;

    // If supply data is not loaded yet, show loading or fallback
    if (!metadata.supply && metadata.supply !== '0') {
      return (
        <Table.Row bg={{ base: "white", _dark: "#262626" }}>
          <Table.Cell borderBottomColor={{ base: "gray.200", _dark: "gray.700" }}>
            <HStack>
              <Erc20
                name={metadata.symbol}
                image={metadata.image}
                address={metadata.address}
              />
            </HStack>
          </Table.Cell>
          <Table.Cell borderBottomColor={{ base: "gray.200", _dark: "gray.700" }}>
            <Text fontWeight="bold">
              ${numeral(price).format("0.0000")}
            </Text>
          </Table.Cell>
          <Table.Cell borderBottomColor={{ base: "gray.200", _dark: "gray.700" }}>
            <VStack align="flex-end">
              <Text fontWeight="bold">Loading...</Text>
              <Text fontSize="sm" color="gray.500">
                Loading...
              </Text>
            </VStack>
          </Table.Cell>
        </Table.Row>
      );
    }

    return (
      <Table.Row bg={{ base: "white", _dark: "#262626" }}>
        <Table.Cell borderBottomColor={{ base: "gray.200", _dark: "gray.700" }}>
          <HStack>
            <Erc20
              name={metadata.symbol}
              image={metadata.image}
              address={metadata.address}
            />
          </HStack>
        </Table.Cell>

        <Table.Cell borderBottomColor={{ base: "gray.200", _dark: "gray.700" }}>
          <Text fontWeight="bold">
            ${numeral(price).format("0.0000")}
          </Text>
        </Table.Cell>

        <Table.Cell borderBottomColor={{ base: "gray.200", _dark: "gray.700" }}>
          <VStack align="flex-end">
            <Text fontWeight="bold">${numeral(supplyInUsd).format("0,0.00")}</Text>
            <Text fontSize="sm" color="gray.500">
              {numeral(supplyNumber).format("0,0.00")}
            </Text>
          </VStack>
        </Table.Cell>
      </Table.Row>
    );
  }

  // Handle native token display
  const supplyAmt = formatTokenByExponent(data?.amount, metadata.decimals);
  const realSupply = metadata.denom == "ario" ? parseFloat(supplyAmt) - parseFloat(burnedAmt) : parseFloat(supplyAmt)
  const supplyInUsd = realSupply * metadata?.price;
  return (
    <Table.Row bg={{ base: "white", _dark: "#262626" }}>
      <Table.Cell borderBottomColor={{ base: "gray.200", _dark: "gray.700" }}>
        <HStack>
          <Asset
            name={metadata.symbol}
            image={metadata.image}
            denom={metadata.denom}
          />
        </HStack>
      </Table.Cell>

      <Table.Cell borderBottomColor={{ base: "gray.200", _dark: "gray.700" }}>
        <Text fontWeight="bold">
          ${numeral(metadata.price).format("0.0000")}
        </Text>
      </Table.Cell>

      <Table.Cell borderBottomColor={{ base: "gray.200", _dark: "gray.700" }}>
        <VStack align="flex-end">
          <Text fontWeight="bold">${numeral(supplyInUsd).format("0,0.00")}</Text>
          <Text fontSize="sm" color="gray.500">
            {numeral(realSupply).format("0,0.00")}
          </Text>
        </VStack>
      </Table.Cell>
    </Table.Row>
  );
};

const FeaturedTokens = () => {
  const { items, loading } = useSupplies();
  const { assetMap, loaded, burnedSupply } = useRecoilValue(readAssets);
  const { tokenArr, loaded: tokensLoaded } = useRecoilValue(readTokens);
  const burnedAmt = formatTokenByExponent(burnedSupply, 18);


  const order = ["ario", "arst", "almx"];

  const sortedItems = [...items].sort((a, b) => {
    return order.indexOf(a.denom) - order.indexOf(b.denom);
  });

  return (
    <GridItem colSpan={2} h={"full"}>
      <Box
        bg={{ base: "#FAFBFC", _dark: "#0F0F0F" }}
        p={6}
        borderRadius="20px"
        h={"full"}
      >
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Network Tokens
        </Text>
        {!loading && loaded && tokensLoaded ? (
          <Table.ScrollArea border={"none"} rounded="lg">
            <Table.Root
              color={{ base: "black", _dark: "white" }}
              bg={{ base: "white", _dark: "black" }}
              borderRadius="md"
            >
              <Table.Header>
                <Table.Row bg={{ base: "#FAFBFC", _dark: "#0F0F0F" }}>
                  <TableColumnHeader>Token</TableColumnHeader>
                  <TableColumnHeader>Price</TableColumnHeader>
                  <TableColumnHeader textAlign={"right"}>
                    Total Supply
                  </TableColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {sortedItems.map((item, index) => (
                  <TokenItem
                    data={item}
                    key={`token-${index}`}
                    metadata={assetMap[item.denom]}
                    burnedAmt={burnedAmt}
                  />
                ))}
                {/* Add ERC20 tokens */}
                {tokenArr.map((token, index) => (
                  <TokenItem
                    key={`erc20-${index}`}
                    data={null}
                    metadata={token}
                    burnedAmt={null}
                    isErc20={true}
                  />
                ))}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        ) : (
          <Loading />
        )}
      </Box>
    </GridItem>
  );
};

export default FeaturedTokens;
