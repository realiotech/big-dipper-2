import React from "react";
import {
    Box,
    Text,
    Flex,
    VStack,
    Badge,
    Stack,
    useBreakpointValue
} from "@chakra-ui/react";
import { useProposalDetails } from "./hooks";
import { useProfileRecoil } from "@/recoil/profiles";
import { formatNumber, formatToken } from "@/utils";
import useTranslation from "next-translate/useTranslation";
import { getStatusInfo } from "./utils";
import dayjs, { formatDayJs } from "@/utils/dayjs";
import VotesGraph from "./votes_graph";
import VotesTable from "./votes";
import { getMiddleEllipsis } from "@/utils";

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
    const isMobile = useBreakpointValue({base: true, md: false})
    return (
        <Box bg={{ base: "white", _dark: "black" }} minHeight="85vh">
            <Flex gap={'10'} align="center" mb={4}>
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
            <Box bg={{ base: "#FAFBFC", _dark: "#0F0F0F" }} py={6} px={3} borderRadius="md" boxShadow="sm" mb={8}>
                <VStack align="stretch" w='full'>
                    <Stack direction={{base: 'column', md:'row'}}>
                        <Text fontWeight="bold" w="150px">
                            Type:
                        </Text>
                        <Text>{overview.proposalType}</Text>
                    </Stack>
                    <Stack direction={{base: 'column', md:'row'}}>
                        <Text fontWeight="bold" w="150px">
                            Proposer:
                        </Text>
                        <Text color="blue.500" cursor="pointer">
                            {isMobile? getMiddleEllipsis(overview.proposer, {beginning: 9, ending: 5}): overview.proposer}
                        </Text>
                    </Stack>
                    <Stack direction={{base: 'column', md:'row'}}>
                        <Text fontWeight="bold" w="150px">
                            Submit Time:
                        </Text>
                        <Text>{formatDayJs(dayjs.utc(overview.submitTime), dateFormat, timeFormat)}</Text>
                    </Stack>
                    <Stack direction={{base: 'column', md:'row'}}>
                        <Text fontWeight="bold" w="150px">
                            Deposit End Time:
                        </Text>
                        <Text>{formatDayJs(dayjs.utc(overview.depositEndTime), dateFormat, timeFormat)}</Text>
                    </Stack>
                    <Stack direction={{base: 'column', md:'row'}}>
                        <Text fontWeight="bold" w="150px">
                            Voting Start Time:
                        </Text>
                        <Text>{formatDayJs(dayjs.utc(overview.votingStartTime), dateFormat, timeFormat)}</Text>
                    </Stack>
                    <Stack direction={{base: 'column', md:'row'}}>
                        <Text fontWeight="bold" w="150px">
                            Voting End Time:
                        </Text>
                        <Text>{formatDayJs(dayjs.utc(overview.votingEndTime), dateFormat, timeFormat)}</Text>
                    </Stack>
                    <Stack  direction={{base: 'column', md:'row'}} align={'start'} w={'full'}>
                        <Text fontWeight="bold" w="150px">
                            Description:
                        </Text>
                        <Text  w={{base: 'full', md:'80%'}}>{overview.description}</Text>
                    </Stack>
                </VStack>
            </Box>

            <VotesGraph statusInfo={statusInfo}/>

            {/* Votes Table */}
            <VotesTable />
        </Box>
    );
}
