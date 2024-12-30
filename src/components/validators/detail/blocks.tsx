import React from "react";
import {
    Box,
    Center,
    Flex,
    Text,
} from "@chakra-ui/react";
import { BLOCK_DETAILS } from "@/utils";
import HelpLink from "@/components/helper/help_link";
import numeral from "numeral";
import { useBlocks } from "./hooks";
import { useProfileRecoil } from "@/recoil/profiles";
import { Tooltip } from "@/components/ui/tooltip";
import Proposer from "@/components/helper/proposer";
import { FaCheck } from "react-icons/fa6";

const BlockTooltip = ({ item }) => {
    const { address, imageUrl, name } = useProfileRecoil(item.proposer);
    return (
        <Box bg='white' color='black'>
            <Text>
                Proposer: <Proposer address={address} image={imageUrl} name={name} />
            </Text> 
            <Text>
                Block: <HelpLink href={BLOCK_DETAILS(item.height)} value={numeral(item.height).format('0,0')} />
            </Text> 
            <Text>
                Txs: {numeral(item.txs).format('0,0')}
            </Text>
            <Text>
                Signed: {item.signed ? 'yes' : 'no'}
            </Text> 
        </Box>
    )
}

const BlockBox = ({i, item, originAddr}) => {
    return (
        <Tooltip content={<BlockTooltip item={item}/>}>
            <Center
                key={i}
                w="20px"
                h="20px"
                bg={item.signed ? 'green' : 'red'}
                borderRadius="sm"
            >{originAddr === item.proposer && <FaCheck color="white"/>}</Center>
        </Tooltip>
    )
}

export default function Blocks({ address }) {
    const { state, loading } = useBlocks(address);

    return (
        <Box bg="#F6F7F8" p={6} borderRadius="md" boxShadow="sm" mb={8}>
            <Text fontSize="lg" fontWeight="bold" mb={4}>
                Last 100 Blocks
            </Text>
            <Flex wrap="wrap" gap={1}>
                {state.map((x, i) => (
                    <BlockBox key={x.height} i={i} item={x} originAddr={address} />
                ))}
            </Flex>
        </Box>
    );
}
