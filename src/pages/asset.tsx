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
  TabsContent,
  Grid,
  GridItem,
  Center,
} from "@chakra-ui/react";
import { FiShoppingCart } from "react-icons/fi";
import { IoCopyOutline } from "react-icons/io5";

const mockTransactions = [
  {
    hash: "ACD55F7B...77DAF",
    method: "Swap",
    block: "56,001,123",
    time: "10h ago",
    from: "0x742...4E3D",
    to: "realio...42D1",
    amount: "100 RIO",
  },
  {
    hash: "ACD55F7B...77DAF",
    method: "Swap",
    block: "56,001,123",
    time: "10h ago",
    from: "0x742...4E3D",
    to: "realio...42D1",
    amount: "100 RIO",
  },
  {
    hash: "ACD55F7B...77DAF",
    method: "Swap",
    block: "56,001,123",
    time: "10h ago",
    from: "0x742...4E3D",
    to: "realio...42D1",
    amount: "100 RIO",
  },
  {
    hash: "ACD55F7B...77DAF",
    method: "Swap",
    block: "56,001,123",
    time: "10h ago",
    from: "0x742...4E3D",
    to: "realio...42D1",
    amount: "100 RIO",
  },
  {
    hash: "ACD55F7B...77DAF",
    method: "Swap",
    block: "56,001,123",
    time: "10h ago",
    from: "0x742...4E3D",
    to: "realio...42D1",
    amount: "100 RIO",
  },
  {
    hash: "ACD55F7B...77DAF",
    method: "Swap",
    block: "56,001,123",
    time: "10h ago",
    from: "0x742...4E3D",
    to: "realio...42D1",
    amount: "100 RIO",
  },
];

const mockHolders = [
  {
    rank: 1,
    address: "0x742...4E3D",
    quantity: "456,444,000 RIO",
    percentage: "19.34%",
    value: "$500,000.00",
  },
  {
    rank: 1,
    address: "0x742...4E3D",
    quantity: "456,444,000 RIO",
    percentage: "19.34%",
    value: "$500,000.00",
  },
  {
    rank: 1,
    address: "0x742...4E3D",
    quantity: "456,444,000 RIO",
    percentage: "19.34%",
    value: "$500,000.00",
  },
  {
    rank: 1,
    address: "0x742...4E3D",
    quantity: "456,444,000 RIO",
    percentage: "19.34%",
    value: "$500,000.00",
  },
  {
    rank: 1,
    address: "0x742...4E3D",
    quantity: "456,444,000 RIO",
    percentage: "19.34%",
    value: "$500,000.00",
  },
  {
    rank: 1,
    address: "0x742...4E3D",
    quantity: "456,444,000 RIO",
    percentage: "19.34%",
    value: "$500,000.00",
  },
];

const AssetPage = () => {
  const [selectedTab, setSelectedTab] = useState("transfer");

  return (
    <Grid templateColumns="repeat(6, 1fr)" gap={"50px"} minH="auto">
      {/* Header */}
      <GridItem
        colSpan={6}
        direction={"row"}
        align="center"
        bg={{ base: "white", _dark: "black" }}
        p={6}
        height={"auto"}
        borderRadius="lg"
        bgColor={"#FAFBFC"}
        maxH={"300px"}
      >
        <Flex justify="space-between">
          <HStack>
            <Box bg="black" w="60px" h="60px" borderRadius="full" />
            <VStack align="flex-start" spacing={0}>
              <Text fontSize="lg" fontWeight="bold">
                Realio Network (RIO)
              </Text>
              <Text color="gray.500">Token Overview</Text>
            </VStack>
          </HStack>
        </Flex>
      </GridItem>

      {/* Stats Overview */}

      <GridItem
        colSpan={2}
        bg={{ base: "white", _dark: "black" }}
        p={6}
        borderRadius="lg"
                 bgColor={{ base: "#FAFBFC", _dark: "#0F0F0F" }}
      >
        <Text>Overview</Text>
        <Flex direction={"column"} gap={10}>
          <Box>
            <Text fontSize="md" color="gray.500">
              Max Total Supply
            </Text>
            <Text fontSize="lg" fontWeight="bold">
              56,268,560 RIO
            </Text>
          </Box>
          <Box>
            <Text fontSize="md" color="gray.500">
              Holders
            </Text>
            <Text fontSize="lg" fontWeight="bold">
              31,307{" "}
              <Text as="span" color="green.500">
                (↑ 2.3%)
              </Text>
            </Text>
          </Box>
        </Flex>
      </GridItem>
      <GridItem
        colSpan={2}
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
              $0.92{" "}
              <Text as="span" color="green.500">
                (↑ 2.3%)
              </Text>
            </Text>
          </Box>
          <Box>
            <Text fontSize="md" color="gray.500">
              Circulating Supply Market Cap
            </Text>
            <Text fontSize="lg" fontWeight="bold">
              $56,007,902.00
            </Text>
          </Box>
        </Flex>
      </GridItem>
      <GridItem
        colSpan={2}
        bg={{ base: "white", _dark: "black" }}
        p={6}
        borderRadius="lg"
                 bgColor={{ base: "#FAFBFC", _dark: "#0F0F0F" }}
      >
        <Text>Other Info</Text>

        <Flex direction={"column"} gap={2}>
          <Text fontSize="md" color="gray.500">
            Token URL
          </Text>

          <Flex  gap={2} align={"center"}>
            <Text fontSize="md" color="blue.500">
              realio13zz4mgwmppzlnve09zshqlf4r2x4uqtwf6ckzk
            </Text>
            <IoCopyOutline />
          </Flex>
          <Flex  gap={2} align={"center"}>
            <Text fontSize="md" color="blue.500">
              realio13zz4mgwmppzlnve09zshqlf4r2x4uqtwf6ckzk
            </Text>
            <IoCopyOutline />
          </Flex>
        </Flex>
      </GridItem>

      {/* Tabs */}
      <GridItem colSpan={6}>
        <Tabs.Root
          value={selectedTab}
          onValueChange={(e) => setSelectedTab(e.value)}
          size="md"
          variant="subtle"
        >
          <Tabs.List bg={{ base: "white", _dark: "black" }}>
            <Tabs.Trigger
              _selected={{
                bg: "#707D8A",
                color: "white",
                borderRadius: "100px",
              }}
              p={4}
              w={{ base: "full", lg: "150px" }}
              value="transfer"
            >
              <Center w={'full'}>Transfer</Center>
            </Tabs.Trigger>
            <Tabs.Trigger
              _selected={{
                bg: "#707D8A",
                color: "white",
                borderRadius: "100px",
              }}
              p={4}
              w={{ base: "full", lg: "150px" }}
              value="holders"
            >
              <Center  w={'full'}>Holders</Center>
            </Tabs.Trigger>
            <Tabs.Indicator bg="#707D8A" borderRadius="100px" />

          </Tabs.List>
        </Tabs.Root>
      </GridItem>
        <GridItem  borderRadius="lg" colSpan={6} bgColor={"#FAFBFC"}>
        <Tabs.Root
          value={selectedTab}
          onValueChange={(e) => setSelectedTab(e.value)}
          size="md"
        >
          <Box>
            <Tabs.ContentGroup>
              {/* Transfers Tab */}
              <Tabs.Content value="transfer">
                <Box p={6}>
                  <Text fontSize="md" mb={4}>
                    A total of 6,732 transactions found
                  </Text>
                  <Table.Root color={{ base: "black", _dark: "white" }}  variant="simple" colorScheme="gray">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader>Hash</Table.ColumnHeader>
                        <Table.ColumnHeader>Method</Table.ColumnHeader>
                        <Table.ColumnHeader>Block</Table.ColumnHeader>
                        <Table.ColumnHeader>Time</Table.ColumnHeader>
                        <Table.ColumnHeader>From</Table.ColumnHeader>
                        <Table.ColumnHeader>To</Table.ColumnHeader>
                        <Table.ColumnHeader>Amount</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body bg={{ base: "white", _dark: "#262626" }}>
                      <>
                        {mockTransactions.map((tx, index) => (
                          <Table.Row key={index}>
                            <Table.Cell borderBottomColor={{base: 'gray.200', _dark: 'gray.700'}}>
                              <Link color="blue.500">{tx.hash}</Link>
                            </Table.Cell>
                            <Table.Cell borderBottomColor={{base: 'gray.200', _dark: 'gray.700'}}>{tx.method}</Table.Cell>
                            <Table.Cell borderBottomColor={{base: 'gray.200', _dark: 'gray.700'}}>
                              <Link color="blue.500">{tx.block}</Link>
                            </Table.Cell>
                            <Table.Cell borderBottomColor={{base: 'gray.200', _dark: 'gray.700'}}>{tx.time}</Table.Cell>
                            <Table.Cell borderBottomColor={{base: 'gray.200', _dark: 'gray.700'}}>
                              <Link color="blue.500">{tx.from}</Link>
                            </Table.Cell>
                            <Table.Cell borderBottomColor={{base: 'gray.200', _dark: 'gray.700'}}>
                              <Link color="blue.500">{tx.to}</Link>
                            </Table.Cell>
                            <Table.Cell borderBottomColor={{base: 'gray.200', _dark: 'gray.700'}}>{tx.amount}</Table.Cell>
                          </Table.Row>
                        ))}
                      </>
                    </Table.Body>
                  </Table.Root >
                </Box>
              </Tabs.Content>

              {/* Holders Tab */}
              <Tabs.Content value="holders">
                <Box p={6}>
                  <Text fontSize="md" mb={4}>
                    Top 1000 holders (from a total of 31,309 holders)
                  </Text>
                  <Table.Root  color={{ base: "black", _dark: "white" }}  variant="simple" colorScheme="gray">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader>Rank</Table.ColumnHeader>
                        <Table.ColumnHeader>Address</Table.ColumnHeader>
                        <Table.ColumnHeader>Quantity</Table.ColumnHeader>
                        <Table.ColumnHeader>Percentage</Table.ColumnHeader>
                        <Table.ColumnHeader>Value</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body bg={{ base: "white", _dark: "#262626" }}>
                      {mockHolders.map((holder, index) => (
                        <Table.Row key={index}>
                          <Table.Cell borderBottomColor={{base: 'gray.200', _dark: 'gray.700'}}>{holder.rank}</Table.Cell>
                          <Table.Cell borderBottomColor={{base: 'gray.200', _dark: 'gray.700'}}>
                            <Link color="blue.500">{holder.address}</Link>
                          </Table.Cell>
                          <Table.Cell borderBottomColor={{base: 'gray.200', _dark: 'gray.700'}}>{holder.quantity}</Table.Cell>
                          <Table.Cell borderBottomColor={{base: 'gray.200', _dark: 'gray.700'}}>{holder.percentage}</Table.Cell>
                          <Table.Cell borderBottomColor={{base: 'gray.200', _dark: 'gray.700'}}>{holder.value}</Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root >
                </Box>
              </Tabs.Content>
            </Tabs.ContentGroup>
          </Box>
        </Tabs.Root>
      </GridItem>
    </Grid>
  );
};

export default AssetPage;
