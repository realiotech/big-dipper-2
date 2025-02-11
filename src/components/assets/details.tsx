import React, { useState } from "react";
import {
  Flex,
  Text,
  VStack,
  HStack,
  Tabs,
  Center,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import AssetOverview from "./overview";
import Staking from "./staking";
import { useRouter } from "next/router";
import { useRecoilValue } from "recoil";
import { readAsset } from "@/recoil/asset";
import { Avatar } from "../ui/avatar";
import Holders from "./holders";

const AssetDetails = () => {
  const router = useRouter();
  const denom = router?.query?.denom as string
  const [selectedTab, setSelectedTab] = useState("holders");
  const assetDetail = useRecoilValue(readAsset(denom));

  return (
    <Grid templateColumns="repeat(6, 1fr)" gap={"1.5rem"} minH="auto">
      <GridItem
        colSpan={6}
        direction={"row"}
        bg={{ base: "white", _dark: "black" }}
        p={6}
        height={"auto"}
        borderRadius="lg"
        bgColor={"#FAFBFC"}
        maxH={"300px"}
      >
        <Flex justify="space-between">
          <HStack>
            <Avatar src={assetDetail?.image} size="xl" />
            <VStack align="flex-start" gap={0}>
              <Text fontSize="lg" fontWeight="bold">
                {`${assetDetail?.name} (${assetDetail?.symbol})`}
              </Text>
              <Text color="gray.500">Token Overview</Text>
            </VStack>
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
          <Tabs.List bg={{ base: "white", _dark: "black" }}>
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
      <GridItem
        borderRadius="lg"
        colSpan={6}
        bg={{ base: "#FAFBFC", _dark: "#0F0F0F" }}
      >
        <Tabs.Root
          value={selectedTab}
          onValueChange={(e) => setSelectedTab(e.value)}
          size="md"
        >
          <Tabs.ContentGroup>
            <Tabs.Content p={0} value="holders">
              <Holders denom={denom} />
            </Tabs.Content>
            <Tabs.Content
              bg={{ base: "#FAFBFC", _dark: "#0F0F0F" }}
              p={0}
              value="staking"
            >
              <Staking denom={denom} />
            </Tabs.Content>
          </Tabs.ContentGroup>
        </Tabs.Root>
      </GridItem>
    </Grid>
  );
};

export default AssetDetails;
