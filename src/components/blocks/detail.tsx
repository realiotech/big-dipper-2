import { useBlockDetails } from "./hooks";
import React from "react";
import { Box, Text, Flex, Table, Center, Stack, StackSeparator, useBreakpointValue } from "@chakra-ui/react";
import numeral from "numeral";
import Proposer from "../helper/proposer";
import { useProfileRecoil } from '@/recoil/profiles/hooks';
import dayjs, { formatDayJs } from '@/utils/dayjs';
import TxTable from "../transactions/table";
import { getMiddleEllipsis } from "@/utils";
import NoData from "../helper/nodata";

const ProposerItem = ({ proposer }) => {
    const { name, address, imageUrl } = useProfileRecoil(proposer);

    return (
        <Proposer address={address} image={imageUrl} name={name} />
    );
};

export default function BlockDetails() {
    const { state } = useBlockDetails();
    const { overview, transactions, signatures } = state;
    const { address, imageUrl, name } = useProfileRecoil(overview.proposer);
    const isMobile = useBreakpointValue({ base: true, md: false });


    return (
        <Box minHeight="85vh">
            <Box bg="#FAFBFC" w={'full'} p={6} borderRadius="md" boxShadow="sm" mb={8}>
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                    Overview
                </Text>
                <Table.Root>
                    <Table.Body >
                        <Table.Row bg="#FAFBFC">
                            <Table.Cell px={0}  fontWeight="semibold" width="30%">
                                Height
                            </Table.Cell>
                            <Table.Cell textAlign="end" >{numeral(overview.height).format('0,0')}</Table.Cell>
                        </Table.Row>
                        <Table.Row bg="#FAFBFC">
                            <Table.Cell px={0}  fontWeight="semibold">Hash</Table.Cell>
                            <Table.Cell textAlign="end">
                                {isMobile ? getMiddleEllipsis(overview.hash, { beginning: 6, ending: 5 }) : overview.hash}
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row bg="#FAFBFC">
                            <Table.Cell px={0}  fontWeight="semibold">Proposer</Table.Cell>
                            <Table.Cell>
                                <Flex justify='end' w='full'>
                                    <Proposer address={address} name={name} image={imageUrl} />
                                </Flex>
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row bg="#FAFBFC">
                            <Table.Cell px={0}  fontWeight="semibold">Time</Table.Cell>
                            <Table.Cell textAlign="end" >{formatDayJs(dayjs.utc(overview.timestamp), 'locale')}</Table.Cell>
                        </Table.Row>
                        <Table.Row bg="#FAFBFC">
                            <Table.Cell px={0}  fontWeight="semibold">Txs</Table.Cell>
                            <Table.Cell textAlign="end">{overview.txs}</Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table.Root>
            </Box>
            <Box bg="#FAFBFC" p={6} borderRadius="md" boxShadow="sm" mb={8}>
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                    Validators
                </Text>
                {signatures?.length ?
                    <Box bg='white' borderRadius='md' padding='3' overflowY="auto" maxH="200px">
                        <Stack separator={<StackSeparator />} gap={2}>
                            {signatures.map(
                                (item, index) => (
                                    <ProposerItem key={`proposer-${index}`} proposer={item} />
                                )

                            )}
                        </Stack>
                    </Box> :
                    <NoData />
                }
            </Box>
            <Box bg="#FAFBFC" p={6} borderRadius="md" boxShadow="sm">
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                    Transactions
                </Text>
                {
                    transactions?.length ?
                        <TxTable transactions={transactions} isLoading={state.loading}/> :
                        <NoData />
                }
            </Box>
        </Box>
    )
}