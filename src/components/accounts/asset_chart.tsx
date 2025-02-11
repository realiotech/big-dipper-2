import { readAssets } from "@/recoil/asset";
import {
    Box,
    Text,
    Flex,
    VStack,
    HStack,
    Link,
    Tabs,
    For
} from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import NoData from "../helper/nodata";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { backgroundColors, convertToChartData } from "./utils";
import Loading from "../helper/loading";
import { AssetBalanceDetail } from "./types";
import numeral from "numeral";
ChartJS.register(ArcElement, Tooltip, Legend);

type Props = {
    balances: AssetBalanceDetail[]
};
const AssetChart: React.FC<Props> = ({ balances }) => {
    const { assetMap, loaded } = useRecoilValue(readAssets)
    if (!loaded) return (
        <Box
            bg={{ base: "#FAFBFC", _dark: "#0F0F0F" }}
            p={6}
            borderRadius="md"
            boxShadow="sm"
            flex="1"
            minW="320px"
        >
            <Loading />
        </Box>
    )

    if (!assetMap || !balances?.length) return (
        <Box
            bg={{ base: "#FAFBFC", _dark: "#0F0F0F" }}
            p={6}
            borderRadius="md"
            boxShadow="sm"
            flex="1"
            minW="320px"
        >
            <NoData />
        </Box>
    )

    return (
        <Box
            bg={{ base: "#FAFBFC", _dark: "#0F0F0F" }}
            p={6}
            borderRadius="md"
            boxShadow="sm"
            flex="1"
            minW="320px"
        >
            <Tabs.Root defaultValue={'ario'} variant={'enclosed'}>
                <Flex justifyContent={'space-between'} align={'center'}>
                    <Text fontSize="lg" fontWeight="bold" mb={4}>
                        Portfolio / USD
                    </Text>
                    <Tabs.List>
                        <For each={balances}>
                            {(item, index) => (
                                <Tabs.Trigger key={`tab-${index}`} value={item?.denom}>{assetMap[item?.denom].symbol}</Tabs.Trigger>
                            )}
                        </For>
                    </Tabs.List>
                </Flex>
                <For each={balances}>
                    {(item, index) => (
                        <Tabs.Content key={`tab-content-${index}`} value={item?.denom}>
                            <Flex
                                direction={{ base: "column", md: "row" }}
                                align="center"
                                gap={10}
                                h="100%"
                            >
                                <VStack align="stretch">
                                    <Flex justify="center" align="center" mb={4}>
                                        <Box w="350px" h="350px">
                                            <Doughnut data={convertToChartData(item)}
                                                options={{
                                                    plugins: {
                                                        legend: { display: false },
                                                    },
                                                }} />
                                        </Box>
                                    </Flex>
                                </VStack>
                                <VStack w="100%" align="left" gap={4}>
                                    <HStack>
                                        <Box w='30px' h='30px' borderRadius={'5px'} bgColor={backgroundColors[0]} />
                                        <Text>
                                            Spendable - {" "}
                                            <Link fontWeight={600}>
                                                ${numeral(item.spendable * assetMap[item.denom].price).format('0,0.00')}
                                            </Link>{" "}
                                        </Text>
                                    </HStack>
                                    <HStack>
                                        <Box w='30px' h='30px' borderRadius={'5px'} bgColor={backgroundColors[2]} />
                                        <Text>
                                            Delegated - {" "}
                                            <Link fontWeight={600}>
                                                ${numeral(item.delegated * assetMap[item.denom].price).format('0,0.00')}
                                            </Link>{" "}
                                        </Text>
                                    </HStack>
                                    <HStack>
                                        <Box w='30px' h='30px' borderRadius={'5px'} bgColor={backgroundColors[3]} />
                                        <Text>
                                            Unbonding - {" "}
                                            <Link fontWeight={600}>
                                                ${numeral(item.unbonding * assetMap[item.denom].price).format('0,0.00')}
                                            </Link>{" "}
                                        </Text>
                                    </HStack>
                                </VStack>
                            </Flex>
                        </Tabs.Content>
                    )}
                </For>
            </Tabs.Root>
        </Box>
    )
}

export default AssetChart;