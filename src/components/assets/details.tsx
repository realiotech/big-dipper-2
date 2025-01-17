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
import AssetOverview from "./overview";

const AssetDetails = () => {
    const [selectedTab, setSelectedTab] = useState("transfer");

    return (
        <Grid templateColumns="repeat(6, 1fr)" gap={"50px"} minH="auto">
            {/* Header */}
            <GridItem
                colSpan={6}
                direction={"row"}
                align="center"
                bg="white"
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
                    <HStack spacing={4}>
                        <Button
                            leftIcon={<FiShoppingCart />}
                            colorScheme="blue"
                            variant="solid"
                        >
                            Buy
                        </Button>
                        <Button variant="outline" colorScheme="blue">
                            Exchange
                        </Button>
                    </HStack>
                </Flex>
            </GridItem>
            <AssetOverview />
            {/* <GridItem borderRadius="lg" colSpan={6} bgColor={"#FAFBFC"}>
                <Tabs.Root
                    value={selectedTab}
                    onValueChange={(e) => setSelectedTab(e.value)}
                    size="md"
                >
                    <Box>
                        <Tabs.ContentGroup>
                            <Tabs.Content value="transfer">
                                <Box p={6}>
                                    <Text fontSize="md" mb={4}>
                                        A total of 6,732 transactions found
                                    </Text>
                                    <Table.Root variant="simple" colorScheme="gray">
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
                                        <Table.Body bg="white">
                                            <>
                                                {mockTransactions.map((tx, index) => (
                                                    <Table.Row key={index}>
                                                        <Table.Cell>
                                                            <Link color="blue.500">{tx.hash}</Link>
                                                        </Table.Cell>
                                                        <Table.Cell>{tx.method}</Table.Cell>
                                                        <Table.Cell>
                                                            <Link color="blue.500">{tx.block}</Link>
                                                        </Table.Cell>
                                                        <Table.Cell>{tx.time}</Table.Cell>
                                                        <Table.Cell>
                                                            <Link color="blue.500">{tx.from}</Link>
                                                        </Table.Cell>
                                                        <Table.Cell>
                                                            <Link color="blue.500">{tx.to}</Link>
                                                        </Table.Cell>
                                                        <Table.Cell>{tx.amount}</Table.Cell>
                                                    </Table.Row>
                                                ))}
                                            </>
                                        </Table.Body>
                                    </Table.Root>
                                </Box>
                            </Tabs.Content>

                            <Tabs.Content value="holders">
                                <Box p={6}>
                                    <Text fontSize="md" mb={4}>
                                        Top 1000 holders (from a total of 31,309 holders)
                                    </Text>
                                    <Table.Root variant="simple" colorScheme="gray">
                                        <Table.Header>
                                            <Table.Row>
                                                <Table.ColumnHeader>Rank</Table.ColumnHeader>
                                                <Table.ColumnHeader>Address</Table.ColumnHeader>
                                                <Table.ColumnHeader>Quantity</Table.ColumnHeader>
                                                <Table.ColumnHeader>Percentage</Table.ColumnHeader>
                                                <Table.ColumnHeader>Value</Table.ColumnHeader>
                                            </Table.Row>
                                        </Table.Header>
                                        <Table.Body bg="white">
                                            {mockHolders.map((holder, index) => (
                                                <Table.Row key={index}>
                                                    <Table.Cell>{holder.rank}</Table.Cell>
                                                    <Table.Cell>
                                                        <Link color="blue.500">{holder.address}</Link>
                                                    </Table.Cell>
                                                    <Table.Cell>{holder.quantity}</Table.Cell>
                                                    <Table.Cell>{holder.percentage}</Table.Cell>
                                                    <Table.Cell>{holder.value}</Table.Cell>
                                                </Table.Row>
                                            ))}
                                        </Table.Body>
                                    </Table.Root>
                                </Box>
                            </Tabs.Content>
                        </Tabs.ContentGroup>
                    </Box>
                </Tabs.Root>
            </GridItem> */}
        </Grid>
    );
};

export default AssetDetails;
