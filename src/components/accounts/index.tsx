import { Box, Text, Flex, VStack, Center } from "@chakra-ui/react";
import { Clipboard, useBreakpointValue } from "@chakra-ui/react";
import { IoCopyOutline } from "react-icons/io5";
import { IoMdCheckmark } from "react-icons/io";
import Transactions from "./transactions";
import { useOverview } from "./hooks";
import Assets from "./assets";
import AssetChart from "./asset_chart";
import Staking from "./staking";
import { getMiddleEllipsis } from "@/utils";

export default function AccountDetail() {
  const { balances, address, evmAddress, completed } = useOverview();
  const isMobile = useBreakpointValue({ base: true, lg: false });

  return (
    <Box minH="100vh">
      <Flex gap={6} flexWrap="wrap" mb={8}>
        {/* Portfolio Balance */}
        <Flex flex={1} gap={6} flexDirection="column">
          <Box
            bg="#FAFBFC"
            p={6}
            borderRadius="md"
            boxShadow="sm"
            flex="1"
            w={"autp"}
          >
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Portfolio
            </Text>
            <VStack gap={0} align={"left"}>
              <Text>Address: </Text>
              <Flex gap={2}>
                <Text>
                  {isMobile ? getMiddleEllipsis(address, { beginning: 9, ending: 20 }) : address}
                </Text>
                <Center>
                <Clipboard.Root value={address} timeout={1000}>
                  <Clipboard.Trigger asChild>
                      <Clipboard.Indicator copied={<IoMdCheckmark />}>
                      <div style= {{cursor: 'pointer'}}>
                        <IoCopyOutline />
                      </div>
                      </Clipboard.Indicator>
                  </Clipboard.Trigger>
                </Clipboard.Root>
                </Center>
              </Flex>
            </VStack>
            <VStack gap={0} align={"left"} mb={3}>
              <Text>EVM address: </Text>
              <Flex gap={2}>
                <Text>
                {isMobile ? getMiddleEllipsis(evmAddress, { beginning: 9, ending: 20 }) : evmAddress}
                </Text>
                <Center>
                <Clipboard.Root value={evmAddress} timeout={1000}>
                  <Clipboard.Trigger asChild>
                      <Clipboard.Indicator copied={<IoMdCheckmark />}>
                      <div style= {{cursor: 'pointer'}}>
                        <IoCopyOutline />
                      </div>
                      </Clipboard.Indicator>
                  </Clipboard.Trigger>
                </Clipboard.Root>
                </Center>
              </Flex>
            </VStack>
          </Box>
          <Assets balances={balances} />
        </Flex>

        <AssetChart balances={balances} />
      </Flex>
      <Staking address={address} />
      <Transactions />
    </Box>
  );
}
