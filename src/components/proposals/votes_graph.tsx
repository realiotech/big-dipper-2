import React from "react";
import {
    Box,
    Text,
    Flex,
    Grid
} from "@chakra-ui/react";
import useTranslation from "next-translate/useTranslation";
import { useVotesGraph } from "./hooks";
import numeral from "numeral";
import Big from "big.js";
import { formatGraphData } from "./utils";

export default function VotesGraph({ statusInfo }) {
    const { t } = useTranslation('proposals');

    const { state } = useVotesGraph();
    const { votes } = state;
    const { quorum } = state;

    const total = Big(votes.yes.value)
        .plus(votes.no.value)
        .plus(votes.veto.value)
        .plus(votes.abstain.value);

    const formattedData = formatGraphData({
        data: votes,
        total,
    });
    const bonded = Big(state.bonded?.value || 0);
    const totalVotedFormat = numeral(total.toFixed(2)).format('0,0.[00]');
    const totalBondedFormat = numeral(bonded.toNumber()).format('0,0.[00]');
    const totalVotedPercent =
        total.gt(0) && !bonded.eq(0)
            ? `${numeral(Big(total.toFixed(2)).div(bonded)?.times(100).toFixed(2)).format('0.[00]')}%`
            : '0%';

    return (
        <Box bg="#f9f9f9" p={6} borderRadius="md" boxShadow="sm" mb={8}>
            <Flex align="center" gap={10}>
                <Box>
                    <Text fontSize="lg" fontWeight="bold">
                        Proposal Result
                    </Text>
                    <Text fontWeight="bold" fontSize="2xl" color={statusInfo?.tag}>
                        {statusInfo.value}
                    </Text>
                </Box>
                <Box w={"2px"} bgColor={"black"} h={50}></Box>
                <Box>
                    <Text fontSize="lg" fontWeight="bold">
                        Voted / Total ({totalVotedPercent})
                    </Text>
                    <Text fontWeight="bold" fontSize="2xl">
                        {totalVotedFormat} / {totalBondedFormat}
                    </Text>
                </Box>
            </Flex>
            <Grid templateColumns="repeat(4, 1fr)" gap={4}>
                <Box p={'20px 5px'} bgColor={"white"} textAlign="center">
                    <Flex justify={'space-between'}>
                        <Text fontWeight="bold" color="green.500">
                            Yes <Box as='span' fontWeight={'light'}>{formattedData['yes'].percentage}</Box>
                        </Text>
                        <Text fontWeight="bold" color="green.500">{numeral(formattedData['yes'].display).format('0,0.[00]')}</Text>
                    </Flex>
                </Box>
                <Box p={'20px 5px'} bgColor={"white"} textAlign="center">
                    <Flex justify={'space-between'}>
                        <Text fontWeight="bold" color="red.500">
                            No <Box as='span' fontWeight={'light'}>{formattedData['no'].percentage}</Box>
                        </Text>
                        <Text fontWeight="bold" color="red.500">{numeral(formattedData['no'].display).format('0,0.[00]')}</Text>
                    </Flex>
                </Box>
                <Box p={'20px 5px'} bgColor={"white"} textAlign="center">
                    <Flex justify={'space-between'}>
                        <Text fontWeight="bold" color="yellow.500">
                            Veto <Box as='span' fontWeight={'light'}>{formattedData['veto'].percentage}</Box>
                        </Text>
                        <Text fontWeight="bold" color="yellow.500" >{numeral(formattedData['veto'].display).format('0,0.[00]')}</Text>
                    </Flex>
                </Box>
                <Box p={'20px 5px'} bgColor={"white"} textAlign="center">
                    <Flex justify={'space-between'}>
                        <Text fontWeight="bold" color="purple.500">
                            Abstain <Box as='span' fontWeight={'light'}>{formattedData['abstain'].percentage}</Box>
                        </Text>
                        <Text fontWeight="bold" color="purple.500">{numeral(formattedData['abstain'].display).format('0,0.[00]')}</Text>
                    </Flex>
                </Box>
            </Grid>
        </Box>
    );
}
