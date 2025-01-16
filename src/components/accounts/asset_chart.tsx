import { readAssets } from "@/recoil/asset";
import {
    Box,
    Text,
    Flex,
    VStack,
    HStack,
    Link
} from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import NoData from "../helper/nodata";
import numeral from "numeral";
import { formatTokenByExponent } from "@/utils";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { backgroundColors, convertToChartData } from "./utils";
import Loading from "../helper/loading";
ChartJS.register(ArcElement, Tooltip, Legend);

const ItemNote = ({ metadata, asset, index }) => {
    const amountInUsd = numeral(parseFloat(formatTokenByExponent(asset?.amount, metadata?.decimals)) * metadata?.price).format('0,0.00')
    return (
        <HStack>
          <Box w='30px' h='30px' borderRadius={'5px'} bgColor={backgroundColors[index]}/>
            <Text>
                {metadata?.symbol} - {" "}
                <Link fontWeight={600}>
                    ${amountInUsd}
                </Link>{" "}
            </Text>
        </HStack>
    )
}

export default function AssetChart({ balances }) {
    const { assetMap, loaded } = useRecoilValue(readAssets)
    if (!loaded) return (
        <Box
            bg="#FAFBFC"
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
            bg="#FAFBFC"
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
            bg="#FAFBFC"
            p={6}
            borderRadius="md"
            boxShadow="sm"
            flex="1"
            minW="320px"
        >
            <Text fontSize="lg" fontWeight="bold" mb={4}>
                Portfolio / USD
            </Text>
            <Flex
                direction={{ base: "column", md: "row" }}
                align="center"
                gap={10}
                h="100%"
            >
                <VStack align="stretch">
                    <Flex justify="center" align="center" mb={4}>
                        <Box w="350px" h="350px">
                            <Doughnut data={convertToChartData(balances, assetMap)}
                                options={{
                                    plugins: {
                                        legend: { display: false },
                                    },
                                }} />
                        </Box>
                    </Flex>
                </VStack>
                <VStack w="100%" align="stretch" gap={4}>
                    {balances.map((item, index) => 
                        <ItemNote metadata={assetMap?.[item.denom]} key={`chart-item-${item.denom}`} asset={item} index={index} />
                    )}
                </VStack>
            </Flex>
        </Box>
    )
}