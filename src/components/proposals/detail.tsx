import React from "react";
import {
    Box,
    Text,
    Flex,
    VStack,
    HStack,
    Button,
    Table,
    Grid,
    Badge,
} from "@chakra-ui/react";
import { useProposalDetails } from "./hooks";
import { useProfileRecoil } from "@/recoil/profiles";
import { formatNumber, formatToken } from "@/utils";
import useTranslation from "next-translate/useTranslation";
import { getStatusInfo } from "./utils";
import dayjs, { formatDayJs } from "@/utils/dayjs";
import VotesGraph from "./votes_graph";
import VotesTable from "./votes";

const dateFormat = 'locale'
const timeFormat = '12-hour'

export default function ProposalDetail() {
    const { t } = useTranslation('proposals');

    const { state } = useProposalDetails();
    const { overview } = state;
    const { address: proposerAddress, name: proposerName } = useProfileRecoil(overview?.proposer);

    const proposerMoniker = proposerName || overview.proposer;
    const amountRequested = overview.content?.amount
        ? formatToken(overview.content?.amount[0]?.amount, overview.content?.amount[0]?.denom)
        : null;
    const parsedAmountRequested = amountRequested
        ? `${formatNumber(
            amountRequested.value,
            amountRequested.exponent
        )} ${amountRequested.displayDenom.toUpperCase()}`
        : '';
    const statusInfo = getStatusInfo(overview.status, t);

    return (
        <Box p={6} bg="white" minHeight="100vh">
            <Flex justify="space-between" align="center" mb={4}>
                <Text fontSize="xl" fontWeight="bold">
                    #{overview.id} {overview.title}
                </Text>
                <Badge
                    colorPalette={statusInfo.tag}
                    px={3}
                    py={1}
                    w={"140px"}
                    height={"50px"}
                    textAlign={"center"}
                    justifyContent={"center"}
                    fontSize={"md"}
                    borderRadius="md"
                >
                    {statusInfo.value}
                </Badge>
            </Flex>

            {/* Proposal Details */}
            <Box bg="#f9f9f9" p={6} borderRadius="md" boxShadow="sm" mb={8}>
                <VStack align="stretch" w='full'>
                    <HStack>
                        <Text fontWeight="bold" w="150px">
                            Type:
                        </Text>
                        <Text>{overview.proposalType}</Text>
                    </HStack>
                    <HStack>
                        <Text fontWeight="bold" w="150px">
                            Proposer:
                        </Text>
                        <Text color="blue.500" cursor="pointer">
                            {overview.proposer}
                        </Text>
                    </HStack>
                    <HStack>
                        <Text fontWeight="bold" w="150px">
                            Submit Time:
                        </Text>
                        <Text>{formatDayJs(dayjs.utc(overview.submitTime), dateFormat, timeFormat)}</Text>
                    </HStack>
                    <HStack>
                        <Text fontWeight="bold" w="150px">
                            Deposit End Time:
                        </Text>
                        <Text>{formatDayJs(dayjs.utc(overview.depositEndTime), dateFormat, timeFormat)}</Text>
                    </HStack>
                    <HStack>
                        <Text fontWeight="bold" w="150px">
                            Voting Start Time:
                        </Text>
                        <Text>{formatDayJs(dayjs.utc(overview.votingStartTime), dateFormat, timeFormat)}</Text>
                    </HStack>
                    <HStack>
                        <Text fontWeight="bold" w="150px">
                            Voting End Time:
                        </Text>
                        <Text>{formatDayJs(dayjs.utc(overview.votingEndTime), dateFormat, timeFormat)}</Text>
                    </HStack>
                    <HStack align={'start'} w={'full'}>
                        <Text fontWeight="bold" w="150px">
                            Description:
                        </Text>
                        <Text w='full'>{overview.description}</Text>
                    </HStack>
                </VStack>
            </Box>

            <VotesGraph statusInfo={statusInfo}/>

            {/* Votes Table */}
            <VotesTable />
        </Box>
    );
}
