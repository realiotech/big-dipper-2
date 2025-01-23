import { readAssets } from "@/recoil/asset";
import {
    Box,
    Text,
    Flex,
    VStack,
    HStack,
    Icon,
} from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import NoData from "../helper/nodata";
import { Avatar } from "../ui/avatar";
import numeral from "numeral";
import { formatTokenByExponent } from "@/utils";

const AssetItem = ({metadata, asset}) => {
    const amountStr = numeral(formatTokenByExponent(asset?.amount, metadata?.decimals)).format('0,0.000000')
    const amountInUsd = numeral(parseFloat(formatTokenByExponent(asset?.amount, metadata?.decimals)) * metadata?.price).format('0,0.00')
    return (
        <Flex
            bg="white"
            padding={2}
            borderRadius={4}
            justify="space-between"
            align="center"
        >
            <HStack>
                <Avatar src={metadata?.image} name={metadata?.symbol} />
                <Box>
                    <Text fontWeight={600} fontSize={'16px'}>
                        {metadata?.symbol}
                    </Text>
                    <Text fontSize="sm" color="green.500">
                        {amountStr} (${amountInUsd})
                    </Text>
                </Box>
            </HStack>
            <Box textAlign={'right'}>
                <Text fontSize={'14px'}>
                    Price
                </Text>
                <Text fontWeight={600} fontSize={'16px'}>
                    ${numeral(metadata?.price).format('0.00')}
                </Text>
            </Box>

        </Flex>
    )
}

export default function Assets({ balances }) {
    const { assetMap } = useRecoilValue(readAssets)

    return (
        <Box
            bg="#FAFBFC"
            p={6}
            borderRadius="md"
            boxShadow="sm"
            flex="2"
        >
            <Flex justify="space-between" align="center" mb={4}>
                <Text fontSize="lg" fontWeight="bold">
                    Assets
                </Text>
            </Flex>
            <VStack align="stretch">
                {balances?.length ? balances.map((asset, i) => (
                    <AssetItem key={`asset-${i}`} asset={asset} metadata={assetMap[asset?.denom]} />
                )) : <NoData />}
            </VStack>
        </Box>
    )
}