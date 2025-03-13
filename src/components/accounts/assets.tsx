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
import Big from "big.js";
import numeral from "numeral";

const AssetItem = ({ metadata, asset }) => {
    // Convert all values to numbers safely
    const totalAmtBig = new Big(parseFloat(asset?.spendable || "0"))
        .plus(parseFloat(asset?.delegated || "0"))
        .plus(parseFloat(asset?.unbonding || "0"));

    const amountStr = totalAmtBig.toFixed(6); // Fixed decimal format
    const amountInUsd = totalAmtBig.times(new Big(metadata?.price || "0")).toFixed(2);

    return (
        <Flex
            bg={{ base: "white", _dark: "black" }}
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
                        {numeral(amountStr).format('0,0.00')} (${numeral(amountInUsd).format('0,0.00')})
                    </Text>
                </Box>
            </HStack>
            <Box textAlign={'right'}>
                <Text fontSize={'14px'}>
                    Price
                </Text>
                <Text fontWeight={600} fontSize={'16px'}>
                    ${numeral(metadata?.price || 0).format('0.00')}
                </Text>
            </Box>
        </Flex>
    );
};


export default function Assets({ balances }) {
    const { assetMap } = useRecoilValue(readAssets)
    return (
        <Box
            bg={{ base: "#FAFBFC", _dark: "#0F0F0F" }}
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