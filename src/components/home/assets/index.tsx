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

const FeaturedBlockchains = () => {
  const blockchains = [
    {
      token: "RST",
      price: "$0.70",
      priceChange: "0.4%",
      totalSupply: "$421,706,688",
      circulatingSupply: "777,844,219",
      holders: "6,357,350",
      holdersChange: "0.4%",
    },
    {
      token: "LMX",
      price: "$4.85",
      priceChange: "0.4%",
      totalSupply: "$421,706,688",
      circulatingSupply: "777,844,219",
      holders: "6,357,350",
      holdersChange: "0.4%",
    },
    {
      token: "RIO",
      price: "$0.79",
      priceChange: "0.4%",
      totalSupply: "$421,706,688",
      circulatingSupply: "777,844,219",
      holders: "6,357,350",
      holdersChange: "0.4%",
    },
  ];

  return (
    <GridItem colSpan={2} h={'full'}>
      <Box bg="#f9f9f9" p={6} borderRadius="20px" h={'full'}>
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Featured Blockchains
        </Text>
        <Table.ScrollArea border={'none'}  rounded="lg" >
        <Table.Root bg="white" borderRadius="md" >
          <Table.Header>
            <Table.Row bg="#f9f9f9">
              <TableColumnHeader>Token</TableColumnHeader>
              <TableColumnHeader>Price</TableColumnHeader>
              <TableColumnHeader textAlign={'right'}>Total Supply</TableColumnHeader>
              {/* <TableColumnHeader>Holders</TableColumnHeader>
              <TableColumnHeader></TableColumnHeader> */}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {blockchains.map((blockchain, index) => (
              <Table.Row key={index}>
                <Table.Cell>
                  <HStack>
                    <Box
                      boxSize="30px"
                      bg="gray.100"
                      borderRadius="full"
                      overflow="hidden"
                    >
                      {/* Placeholder for token image */}
                      <Box bg="black" w="full" h="full" />
                    </Box>
                    <Text fontWeight="medium">{blockchain.token}</Text>
                  </HStack>
                </Table.Cell>
                <Table.Cell>
                  <VStack align="flex-start">
                    <Text fontWeight="bold">{blockchain.price}</Text>
                    <Text fontSize="sm" color="green.500">
                      {blockchain.priceChange}
                    </Text>
                  </VStack>
                </Table.Cell>
                <Table.Cell>
                  <VStack align="flex-end">
                    <Text fontWeight="bold">{blockchain.totalSupply}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {blockchain.circulatingSupply}
                    </Text>
                  </VStack>
                </Table.Cell>
                {/* <Table.Cell>
                  <VStack align="flex-start">
                    <Text fontWeight="bold">{blockchain.holders}</Text>
                    <Text fontSize="sm" color="green.500">
                      {blockchain.holdersChange}
                    </Text>
                  </VStack>
                </Table.Cell>
                <Table.Cell>
                  <Button colorScheme="blue" size="sm">
                    Stake
                  </Button>
                </Table.Cell> */}
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
