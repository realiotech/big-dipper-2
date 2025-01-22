import React from "react";
import {
  Box,
  Text,
  Table,
  HStack,
  VStack,
  TableColumnHeader,
  GridItem,
  Image,
} from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import { readAssets } from "@/recoil/asset";
import Asset from "@/components/helper/asset";


const FeaturedBlockchains = () => {
  const { assetMap, loaded } = useRecoilValue(readAssets);
  
  const supplementalData = {
    ario: {
      price: "$0.79",
      priceChange: "0.4%",
      totalSupply: "$421,706,688",
      circulatingSupply: "777,844,219",
    },
    arst: {
      price: "$0.70",
      priceChange: "0.4%",
      totalSupply: "$421,706,688",
      circulatingSupply: "777,844,219",
    },
    almx: {
      price: "$4.85",
      priceChange: "0.4%",
      totalSupply: "$421,706,688",
      circulatingSupply: "777,844,219",
    },
  };

  const blockchains = Object.keys(assetMap).map((key) => ({
    ...assetMap[key],
    ...supplementalData[key],
  }));

  return (
    <GridItem colSpan={2} h={"full"}>
      <Box bg="#FAFBFC" p={6} borderRadius="20px" h={"full"}>
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Featured Blockchains
        </Text>
        <Table.ScrollArea border={"none"} rounded="lg">
          <Table.Root bg="white" borderRadius="md">
            <Table.Header>
              <Table.Row bg="#FAFBFC">
                <TableColumnHeader>Token</TableColumnHeader>
                <TableColumnHeader>Price</TableColumnHeader>
                <TableColumnHeader textAlign={"right"}>
                  Total Supply
                </TableColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {blockchains.map((blockchain, index) => (
                <Table.Row key={index}>
                  {/* Token with Image */}
                  <Table.Cell>
                    <HStack>
                      <Asset
                        name={blockchain.symbol}
                        image={blockchain.image}
                        denom={blockchain.symbol.toLowerCase()}
                        />
                    </HStack>
                  </Table.Cell>

                  {/* Price */}
                  <Table.Cell>
                    <VStack align="flex-start">
                      <Text fontWeight="bold">{blockchain.price}</Text>
                      <Text fontSize="sm" color="green.500">
                        {blockchain.priceChange}
                      </Text>
                    </VStack>
                  </Table.Cell>

                  {/* Total Supply */}
                  <Table.Cell>
                    <VStack align="flex-end">
                      <Text fontWeight="bold">{blockchain.totalSupply}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {blockchain.circulatingSupply}
                      </Text>
                    </VStack>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      </Box>
    </GridItem>
  );
};

export default FeaturedBlockchains;