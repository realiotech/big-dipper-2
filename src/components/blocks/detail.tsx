import { useBlockDetails } from "./hooks";
import React from "react";
import { Box, Text, Flex, Table, Image, For, Center, Stack, StackSeparator } from "@chakra-ui/react";
import numeral from "numeral";
import Proposer from "../helper/proposer";
import { useProfileRecoil, useProfilesRecoil } from '@/recoil/profiles/hooks';
import dayjs, { formatDayJs } from '@/utils/dayjs';
import TxItem from "../transactions/item";

export default function BlockDetails() {
    const { state } = useBlockDetails();
    const { overview, transactions, signatures } = state;
    const { address, imageUrl, name } = useProfileRecoil(overview.proposer);
    const formattedSignatures = useProfilesRecoil(signatures);

    return (
        <Box p={4} minHeight="100vh">
            <Box bg="#F6F7F8" p={6} borderRadius="md" boxShadow="sm" mb={8}>
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                    Overview
                </Text>
                <Table.Root>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell fontWeight="semibold" width="30%">
                                Height
                            </Table.Cell>
                            <Table.Cell textAlign="end" >{numeral(overview.height).format('0,0')}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell fontWeight="semibold">Hash</Table.Cell>
                            <Table.Cell textAlign="end">
                                {overview.hash}
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell fontWeight="semibold">Proposer</Table.Cell>
                            <Table.Cell>
                                <Flex justify='end' w='full'>
                                    <Proposer address={address} name={name} image={imageUrl} />
                                </Flex>
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell fontWeight="semibold">Time</Table.Cell>
                            <Table.Cell textAlign="end" >{formatDayJs(dayjs.utc(overview.timestamp), 'locale')}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell fontWeight="semibold">Txs</Table.Cell>
                            <Table.Cell textAlign="end">{overview.txs}</Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table.Root>
            </Box>
            <Box bg="#F6F7F8" p={6} borderRadius="md" boxShadow="sm" mb={8}>
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                    Validators
                </Text>
                {signatures?.length ?
                    <Box bg='white' borderRadius='md' padding='3' overflowY="auto" maxH="200px">
                        <Stack separator={<StackSeparator />} gap={2}>
                            {formattedSignatures.map(
                                (item, index) => (
                                    <Proposer key={`proposer-${index}`} name={item.name} address={item.address} image={item.imageUrl} />
                                )

                            )}
                        </Stack>
                    </Box> :
                    <Center bg='white' borderRadius='md' padding='3' overflowY="auto" maxH="150px">Nothing to show</Center>
                }
            </Box>
            <Box bg="#F6F7F8" p={6} borderRadius="md" boxShadow="sm">
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                    Transactions
                </Text>
                {transactions?.length ?
                    <Box bg='white' borderRadius='md' padding='3' overflowY="auto" maxH="200px">
                        <Table.Root bgColor="inherit" showColumnBorder={false} h="full" w='full'>
                            <Table.Header>
                                <Table.Row bgColor='inherit'>
                                    <Table.ColumnHeader>
                                        Block
                                    </Table.ColumnHeader>
                                    <Table.ColumnHeader>
                                        Hash
                                    </Table.ColumnHeader>
                                    <Table.ColumnHeader>
                                        Messages
                                    </Table.ColumnHeader>
                                    <Table.ColumnHeader>
                                        Result
                                    </Table.ColumnHeader>
                                    <Table.ColumnHeader>
                                        Time
                                    </Table.ColumnHeader>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body >
                                <For each={transactions}>
                                    {(item, index) => (
                                        <TxItem item={item} rowIndex={index} />
                                    )}
                                </For>
                            </Table.Body>
                        </Table.Root>
                    </Box> :
                    <Flex justify="center" align="center" h="100px">
                        <Box textAlign="center" color="gray.400">
                            <Box alignItems='center' boxSize="100px" >
                                <Image src='/images/logo.svg' h={100} width={100} alt="test" />
                            </Box>
                            <Text mt={2}>Nothing to show</Text>
                        </Box>
                    </Flex>
                }
            </Box>
        </Box>
    )
}