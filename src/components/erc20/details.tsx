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
  Spinner,
} from "@chakra-ui/react";
import Erc20Overview from "./overview";
import Activities from "./activities";
import Staking from "./staking";
import { Avatar } from "../ui/avatar";
import Holders from "./holders";
import { useRecoilValue } from "recoil";
import { readToken } from "@/recoil/erc20";
import { useRouter } from "next/router";
import { useEnsureTokenLoaded } from "@/recoil/erc20/hooks";

const Erc20Details = () => {
  const router = useRouter();
  const address = router.query.address as string;
  const [selectedTab, setSelectedTab] = useState("holders");

  // Get the token details from recoil state
  const erc20Details = useRecoilValue(readToken(address));

  // Ensure token data is loaded if not already available
  const { loading: tokenLoading, error: tokenError } = useEnsureTokenLoaded(address);

  // Show loading state while router is not ready or token is loading
  if (!router.isReady || !address) {
    return (
      <Center h="200px">
        <Spinner size="lg" />
      </Center>
    );
  }

  if (tokenError) {
    return (
      <Center h="200px">
        <VStack>
          <Text color="red.500" fontSize="lg" fontWeight="bold">
            Error loading token
          </Text>
          <Text color="gray.500">{tokenError}</Text>
        </VStack>
      </Center>
    );
  }

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
            <Avatar src={erc20Details?.image} size="xl" />
            <VStack align="flex-start" gap={0}>
              <Text fontSize="lg" fontWeight="bold">
                {`${erc20Details?.name} (${erc20Details?.symbol})`}
              </Text>
              <Text color="gray.500">Token Overview</Text>
            </VStack>
          </HStack>
        </Flex>
      </GridItem>
      <Erc20Overview address={address} metadata={erc20Details}/>
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
              value="transactions"
            >
              <Center w={"full"}>Transactions</Center>
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
              <Holders address={address} />
            </Tabs.Content>
            <Tabs.Content
              bg={{ base: "#FAFBFC", _dark: "#0F0F0F" }}
              p={0}
              value="transactions"
            >
              <Activities address={address} />
            </Tabs.Content>
            <Tabs.Content
              bg={{ base: "#FAFBFC", _dark: "#0F0F0F" }}
              p={0}
              value="staking"
            >
              <Staking address={address} />
            </Tabs.Content>
          </Tabs.ContentGroup>
        </Tabs.Root>
      </GridItem>
    </Grid>
  );
};

export default Erc20Details;
