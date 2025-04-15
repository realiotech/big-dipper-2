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
import { readTokens } from "@/recoil/erc20";

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

const Erc20Item = ({ metadata, erc20 }) => {
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
                        {numeral(erc20.value).format('0,0.00')}
                    </Text>
                </Box>
            </HStack>
        </Flex>
    );
};

export default function Assets({ balances, erc20Balances }) {
    const { assetMap } = useRecoilValue(readAssets)
    const { tokenMap } = useRecoilValue(readTokens)

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
                )) : <></>}
                {erc20Balances?.length ? erc20Balances.map((erc20, i) => (
                    <Erc20Item key={`erc20-${i}`} erc20={erc20} metadata={tokenMap[erc20?.contract?.id]} />
                )) : <></> }
            </VStack>
        </Box>
    )
}