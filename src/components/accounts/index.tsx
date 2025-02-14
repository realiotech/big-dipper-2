import { Box, Text, Flex, VStack, Center } from "@chakra-ui/react";
import { useBreakpointValue } from "@chakra-ui/react";
import {
  ClipboardRoot,
  ClipboardIconButton,
} from "@/components/ui/clipboard"
import Transactions from "./transactions";
import { useOverview } from "./hooks";
import Assets from "./assets";
import AssetChart from "./asset_chart";
import Staking from "./staking";
import { formatTokenByExponent, getMiddleEllipsis } from "@/utils";
import { useStaking } from "./hooks";
import { useMemo } from "react";
import { useRecoilValue } from "recoil";
import { readAssets } from "@/recoil/asset";

export default function AccountDetail() {
  const { balances, address, evmAddress, completed } = useOverview();
  const { assetMap, loaded } = useRecoilValue(readAssets)
  const { delegations, unbondings, handleSort, sortDirection } =
    useStaking(address);
  const isMobile = useBreakpointValue({ base: true, lg: false });

  const createFreshBalanceMap = () => {
    return {
      "ario": {
        spendable: 0.0,
        delegated: 0.0,
        unbonding: 0.0
      },
      "arst": {
        spendable: 0.0,
        delegated: 0.0,
        unbonding: 0.0
      },
      "almx": {
        spendable: 0.0,
        delegated: 0.0,
        unbonding: 0.0
      }
    };
  };

  const balancesMerged = useMemo(() => {
    if (!completed || delegations.loading || !loaded) {
      return [];
    }

    // Create a completely new balance map each time
    const balanceMap = createFreshBalanceMap();

    // Process balances with fresh starting values
    balances.forEach(item => {
      if (balanceMap[item.denom]) {
        balanceMap[item.denom].spendable = parseFloat(
          formatTokenByExponent(item?.amount, assetMap[item.denom]?.decimals)
        );
      }
    });


    // Process delegations with fresh starting values
    delegations.data.forEach(item => {
      balanceMap[item.denom].delegated = parseFloat(
        formatTokenByExponent(item?.amount, assetMap[item.denom]?.decimals)
      );
    });

    // Process unbondings with fresh starting values
    unbondings.data.forEach(item => {
      balanceMap[item.denom].unbonding = parseFloat(
        formatTokenByExponent(item?.amount, assetMap[item.denom]?.decimals)
      );
    });

    return Object.entries(balanceMap).map(([denom, data]) => ({
      denom,
      ...data
    }));
  }, [balances, delegations, unbondings, loaded, completed]);

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
            w={"auto"}
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
          <Assets balances={balancesMerged} />
        </Flex>
        <AssetChart balances={balancesMerged} />
      </Flex>
      <Staking 
        delegations={delegations}
        unbondings={unbondings}
        handleSort={handleSort} 
        sortDirection={sortDirection}
      />
      <Transactions />
    </Box>
  );
}
