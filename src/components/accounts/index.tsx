import { Box, Text, Flex, VStack, Center } from "@chakra-ui/react";
import { useBreakpointValue } from "@chakra-ui/react";
import {
  ClipboardRoot,
  ClipboardIconButton,
} from "@/components/ui/clipboard"
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
            bg={{ base: "#FAFBFC", _dark: "#0F0F0F" }}
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
              <Flex gap={2} alignItems={'center'}>
                <Text>Address: {" "}
                  <Text as="span">
                    {isMobile ? getMiddleEllipsis(address, { beginning: 9, ending: 20 }) : address}
                  </Text> 
                </Text>
                <Center>
                  <ClipboardRoot value={address}>
                    <ClipboardIconButton variant={'plain'} />
                  </ClipboardRoot>
                </Center>
              </Flex>
            </VStack>
            <VStack gap={0} align={"left"} mb={3}>
              <Flex gap={2} alignItems={'center'}>
                <Text>EVM address: {" "}
                  <Text as="span">
                    {isMobile ? getMiddleEllipsis(evmAddress, { beginning: 9, ending: 20 }) : evmAddress}
                  </Text> 
                </Text>
                <Center>
                  <ClipboardRoot value={evmAddress}>
                    <ClipboardIconButton variant={'plain'} />
                  </ClipboardRoot>
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
