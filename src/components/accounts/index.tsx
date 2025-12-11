import { Box, Text, Flex, VStack, Center } from "@chakra-ui/react";
import { useBreakpointValue } from "@chakra-ui/react";
import { ClipboardRoot, ClipboardIconButton } from "@/components/ui/clipboard";
import Transactions from "./transactions";
import { useErc20Balances, useOverview } from "./hooks";
import Assets from "./assets";
import AssetChart from "./asset_chart";
import Staking from "./staking";
import { formatTokenByExponent, getMiddleEllipsis } from "@/utils";
import { useStaking } from "./hooks";
import { useMemo } from "react";
import { useRecoilValue } from "recoil";
import { readAssets } from "@/recoil/asset";
import Big from "big.js";
import { useRouter } from "next/router";

export default function AccountDetail() {
  const { balances, address, evmAddress, completed } = useOverview();
  const { assetMap, loaded } = useRecoilValue(readAssets);
  const { delegations, unbondings, handleSort, sortDirection } =
    useStaking(address);
  const router = useRouter();

  const isMobile = useBreakpointValue({ base: true, lg: false });

  const handleExportClick = () => {
    router.push(`/accounts/export?a=${address}`);
  };

  const createFreshBalanceMap = () => {
    return {
      ario: {
        spendable: 0.0,
        delegated: 0.0,
        unbonding: 0.0,
      },
      arst: {
        spendable: 0.0,
        delegated: 0.0,
        unbonding: 0.0,
      },
      almx: {
        spendable: 0.0,
        delegated: 0.0,
        unbonding: 0.0,
      },
    };
  };

  const balancesMerged = useMemo(() => {
    if (!completed || delegations.loading || !loaded) {
      return [];
    }

    const balanceMap = createFreshBalanceMap();

    balances.forEach((item) => {
      if (balanceMap[item.denom]) {
        balanceMap[item.denom].spendable = formatTokenByExponent(
          item?.amount,
          assetMap[item.denom]?.decimals
        );
      }
    });

    delegations.data.forEach((item) => {
      if (balanceMap[item.denom]) {
        balanceMap[item.denom].delegated = new Big(
          balanceMap[item.denom].delegated || "0"
        )
          .plus(
            new Big(
              formatTokenByExponent(
                item?.amount,
                assetMap[item.denom]?.decimals
              ) || "0"
            )
          )
          .toString();
      }
    });

    unbondings.data.forEach((item) => {
      if (balanceMap[item.denom]) {
        balanceMap[item.denom].unbonding = new Big(
          balanceMap[item.denom].unbonding || "0"
        )
          .plus(
            new Big(
              formatTokenByExponent(
                item?.amount,
                assetMap[item.denom]?.decimals
              ) || "0"
            )
          )
          .toString();
      }
    });
    
    return Object.entries(balanceMap).map(([denom, data]) => ({
      denom,
      ...data,
    })).filter(item => item.spendable > 0 || item.delegated > 0 || item.unbonding > 0);
  }, [balances, delegations, unbondings, loaded, completed]);

  const erc20Balances = useErc20Balances(evmAddress)

  return (
    <Box minH="100vh">
      <Flex gap={6} flexWrap="wrap" mb={8}>
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
              <Flex gap={2} alignItems={"center"}>
                <Text>
                  Address:{" "}
                  <Text as="span">
                    {isMobile
                      ? getMiddleEllipsis(address, { beginning: 9, ending: 20 })
                      : address}
                  </Text>
                </Text>
                <Center>
                  <ClipboardRoot value={address}>
                    <ClipboardIconButton variant={"plain"} />
                  </ClipboardRoot>
                </Center>
              </Flex>
            </VStack>
            <VStack gap={0} align={"left"} mb={3}>
              <Flex gap={2} alignItems={"center"}>
                <Text>
                  EVM address:{" "}
                  <Text as="span">
                    {isMobile
                      ? getMiddleEllipsis(evmAddress, {
                          beginning: 9,
                          ending: 20,
                        })
                      : evmAddress}
                  </Text>
                </Text>
                <Center>
                  <ClipboardRoot value={evmAddress}>
                    <ClipboardIconButton variant={"plain"} />
                  </ClipboardRoot>
                </Center>
              </Flex>
            </VStack>
          </Box>
          <Assets balances={balancesMerged} erc20Balances={erc20Balances} />
        </Flex>
        <AssetChart balances={balancesMerged} />
      </Flex>
      <Transactions onExportClick={handleExportClick} />
      <Staking
        delegations={delegations}
        unbondings={unbondings}
        handleSort={handleSort}
        sortDirection={sortDirection}
      />
    </Box>
  );
}
