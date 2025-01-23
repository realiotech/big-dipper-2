import React, { use, useEffect, useState } from "react";
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
  Skeleton,
} from "@chakra-ui/react";
import { FiShoppingCart } from "react-icons/fi";
import AssetOverview from "./overview";
import { useOverview, useHolders } from "./hooks";
import Staking from "./staking";
import { useRouter } from "next/router";
import Pagination from "../layout/pagination";
import HelpLink from "../helper/help_link";
import Asset from "../helper/asset";
import { useRecoilValue } from "recoil";
import { readAsset } from "@/recoil/asset";
import numeral from "numeral";
import { formatTokenByExponent } from "@/utils";
import { Avatar } from "../ui/avatar";

const denomToTokenMap = {
  rio: "Realio Network",
  rst: "Realio Security Token",
  lmx: "Liquid Mining Token",
};

const HolderItem = ({ item, denom }) => {
  const assetDetail = useRecoilValue(readAsset(denom));

  return (
    <Table.Row>
      <Table.Cell>
        <HelpLink href={`/accounts/${item.address}`} value={item.address} />
      </Table.Cell>
      <Table.Cell>
        {numeral(
          formatTokenByExponent(item.balance, assetDetail?.decimals)
        ).input()}
      </Table.Cell>
      <Table.Cell>
        <Asset
          name={assetDetail?.symbol}
          image={assetDetail?.image}
          denom={assetDetail?.denom}
        />
      </Table.Cell>
    </Table.Row>
  );
};

const SkeletonBlockItem = ({ index }) => {
  return (
    <Table.Row key={`transaction-${index}`}>
      <Table.Cell>
        <Skeleton h={"10px"} w="full" mb="2" />
      </Table.Cell>
      <Table.Cell>
        <Skeleton h={"10px"} w="full" mb="2" />
      </Table.Cell>
      <Table.Cell>
        <Skeleton h={"10px"} w="full" mb="2" />
      </Table.Cell>
    </Table.Row>
  );
};

const AssetDetails = () => {
  const router = useRouter();
  const { state, maxHolders, qdenom } = useOverview();
  const { holderState, pageInfo, handlePageChange } = useHolders(maxHolders);
  const [selectedTab, setSelectedTab] = useState("staking");
  const assetDetail = useRecoilValue(readAsset(qdenom));

  return (
    <Grid templateColumns="repeat(6, 1fr)" gap={"1.5rem"} minH="auto">
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
            <Avatar src={assetDetail?.image} size="xl" />
            <VStack align="flex-start" spacing={0}>
              <Text fontSize="lg" fontWeight="bold">
                {`${denomToTokenMap[state?.denom]} (${state?.denom.toUpperCase()})`}
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
      <Center>

      <Tabs.Root
        value={selectedTab}
        onValueChange={(e) => setSelectedTab(e.value)}
        size="md"
        variant={"subtle"}
      >
        <Tabs.List bg="white">
          <Tabs.Trigger
            _selected={{
              bg: "#707D8A",
              color: "white",
              borderRadius: "100px",
              border: "none",
            }}
            p={4}
            w={{ base: "full", lg: "150px" }}
            value="holders"
          >
            <Center w={"full"}>Holders</Center>
          </Tabs.Trigger>
          <Tabs.Trigger
            _selected={{
              bg: "#707D8A",
              color: "white",
              borderRadius: "100px",
              border: "none",
            }}
            p={4}
            w={{ base: "full", lg: "150px" }}
            value="staking"
          >
            <Center w={"full"}>Staking</Center>
          </Tabs.Trigger>
          <Tabs.Indicator bg="#707D8A" borderRadius="100px" />
        </Tabs.List>
      </Tabs.Root>
      </Center>
      <GridItem borderRadius="lg" colSpan={6} bgColor={"#FAFBFC"}>
        <Tabs.Root
          value={selectedTab}
          onValueChange={(e) => setSelectedTab(e.value)}
          size="md"
        >
          <Box>
            <Tabs.ContentGroup>
              <Tabs.Content value="holders">
                <Box overflow={"auto"} p={6}>
                  <Text fontSize="md" mb={4}>
                    Top {maxHolders} holders (from a total of{" "}
                    {`${state?.holders ?? 0}`} holders)
                  </Text>
                  <Table.Root colorScheme="gray">
                    <Table.Header bg="#FAFBFC">
                      <Table.Row bgColor="inherit">
                        <Table.ColumnHeader>Address</Table.ColumnHeader>
                        <Table.ColumnHeader>Amount</Table.ColumnHeader>
                        <Table.ColumnHeader>Denom</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {!holderState.loading ? (
                        holderState.holders.length === 0 ? (
                          <Center
                            borderRadius="20px"
                            bgColor="#FAFBFC"
                            py="5"
                            px="8"
                            minH="65vh"
                            w="full"
                          >
                            <Text>Nothing to show</Text>
                          </Center>
                        ) : (
                          holderState.holders.map((item, index) => (
                            <HolderItem item={item} denom={qdenom} key={`holder-${index}`} />
                          ))
                        )
                      ) : (
                        Array.from({ length: 20 }).map((_, index) => (
                          <SkeletonBlockItem index={index} />
                        ))
                      )}
                    </Table.Body>
                  </Table.Root>
                  <Center w="full" py="4">
                    <Pagination
                      pageInfo={pageInfo}
                      pageChangeFunc={handlePageChange}
                      pageSizeChangeFunc={() => {}}
                    />
                  </Center>
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
