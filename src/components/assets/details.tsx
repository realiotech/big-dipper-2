import React, { useState } from "react";
import {
    Box,
    Flex,
    Text,
    Button,
    VStack,
    HStack,
    Tabs,
    Table,
    Center,
    Grid,
    GridItem,
} from "@chakra-ui/react";
import { FiShoppingCart } from "react-icons/fi";
import AssetOverview from "./overview";
import Staking from "./staking";
import { useRouter } from "next/router";

const AssetDetails = () => {
    const router = useRouter()

    const [selectedTab, setSelectedTab] = useState("staking");

    return (
        <Grid templateColumns="repeat(6, 1fr)" gap={"50px"} minH="auto">
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
            <GridItem borderRadius="lg" colSpan={6} bgColor={"#FAFBFC"}>
                <Tabs.Root
                    value={selectedTab}
                    onValueChange={(e) => setSelectedTab(e.value)}
                    size="md"
                >
                    <Tabs.List bg="white">

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
                            <Center w={'full'}>Holders</Center>
                        </Tabs.Trigger>
                        <Tabs.Trigger
                            _selected={{
                                bg: "#707D8A",
                                color: "white",
                                borderRadius: "100px",
                            }}
                            p={4}
                            w={{ base: "full", lg: "150px" }}
                            value="staking"
                        >
                            <Center w={'full'}>Staking</Center>
                        </Tabs.Trigger>
                        <Tabs.Indicator bg="#707D8A" borderRadius="100px" />

                    </Tabs.List>
                    <Box>
                        <Tabs.ContentGroup>
                            <Tabs.Content value="holders">
                                <Box p={6}>
                                    <Text fontSize="md" mb={4}>
                                        Top 1000 holders (from a total of 31,309 holders)
                                    </Text>
                                    <Table.Root variant="simple" colorScheme="gray">

                                    </Table.Root>
                                </Box>
                            </Tabs.Content>
                            <Tabs.Content value="staking">
                                <Staking denom={router?.query?.denom} />
                            </Tabs.Content>
                        </Tabs.ContentGroup>
                    </Box>
                </Tabs.Root>
            </GridItem>
        </Grid>
    );
};

export default AssetDetails;
