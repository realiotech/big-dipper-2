import React from "react";
import { Box, Text, Flex, Table, Image, For } from "@chakra-ui/react";
import TxItem from "@/components/transactions/item";

export default function TxTable({ transactions }) {
    if (!transactions?.length) return
    <Flex justify="center" align="center" h="100px">
        <Box textAlign="center" color="gray.400">
            <Box alignItems='center' boxSize="100px" >
                <Image src='/images/logo.svg' h={100} width={100} alt="test" />
            </Box>
            <Text mt={2}>Nothing to show</Text>
        </Box>
    </Flex>
    return (
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
        </Box>
    )
}