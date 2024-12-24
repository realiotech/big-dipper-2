import React from "react";
import { Box, Flex, Text, Table, Link } from "@chakra-ui/react";
import { useTransactionDetails } from './hooks';
import numeral from "numeral";
import { BLOCK_DETAILS, formatNumber } from "@/utils";
import NextLink from "next/link"
import dayjs, { formatDayJs } from "@/utils/dayjs";
import { Status } from "../ui/status";
import Messages from "./messages";

export default function TransactionDetails() {
    const { state, onMessageFilterCallback, toggleMessageDisplay, filterMessages } =
        useTransactionDetails();
    const { overview, logs, messages } = state;
    return (
        <Box p={6} minHeight="100vh">
            {/* Overview Section */}
            <Box bg="gray.50" p={6} borderRadius="md" boxShadow="sm" mb={8}>
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                    Overview
                </Text>
                <Table.Root>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell fontWeight="semibold">Hash</Table.Cell>
                            <Table.Cell textAlign="end">
                                {overview.hash}
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell fontWeight="semibold">Height</Table.Cell>
                            <Table.Cell textAlign="end">
                                <Link colorPalette={'blue'} asChild >
                                    <NextLink href={BLOCK_DETAILS(overview.height)}>
                                        {numeral(overview.height).format('0,0')}
                                    </NextLink>
                                </Link>
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell fontWeight="semibold">Time</Table.Cell>
                            <Table.Cell textAlign="end">{formatDayJs(dayjs.utc(overview.timestamp), "locale", "12-hour")}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell fontWeight="semibold">Fee</Table.Cell>
                            <Table.Cell textAlign="end">{formatNumber(
                                overview.fee.value,
                                overview.fee.exponent
                            )} {overview?.fee?.displayDenom?.toUpperCase()}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell fontWeight="semibold">Gas (used / wanted)</Table.Cell>
                            <Table.Cell textAlign="end">{numeral(overview.gasUsed).format('0,0.[00]')} / {numeral(overview.gasWanted).format(
                                '0,0.[00]'
                            )}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell fontWeight="semibold">Result</Table.Cell>
                            <Table.Cell textAlign="end">
                                <Status value={overview.success ? "success" : "error"}>{overview.success ? "Success" : "Failed"}</Status>
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell fontWeight="semibold">Memo</Table.Cell>
                            <Table.Cell textAlign="end">{overview.memo}</Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table.Root>
            </Box>
            <Messages messages={messages} />

            <Box bg="gray.50" p={6} mb={8} borderRadius="md" boxShadow="sm">
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                    Logs
                </Text>
                {logs && 
                    <Box
                        bg="white"
                        p={4}
                        borderRadius="md"
                        overflowY="auto"
                        fontSize={15}
                        fontFamily="monospace"
                        maxHeight={300}
                        whiteSpace='pre-wrap'
                    >

                        <code>{JSON.stringify(logs, null, 4)}</code>
                    </Box>
                }
            </Box>
        </Box>
    );
}