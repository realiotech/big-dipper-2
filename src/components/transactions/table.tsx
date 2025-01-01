import React from "react";
import { Box, Text, Flex, Table, Image, For, HStack } from "@chakra-ui/react";
import { PaginationRoot, PaginationItems, PaginationPrevTrigger, PaginationNextTrigger } from "@/components/ui/pagination";
import TxItem from "@/components/transactions/item";
import { usePagination } from "@/hooks/use_pagination";

export default function TxTable({ transactions }) {
    const {
        page,
        rowsPerPage,
        handlePageChange,
        sliceItems,
    } = usePagination({});

    const paginatedItems = sliceItems(transactions || []);
    
    if (!transactions?.length) {
        return (
            <Flex justify="center" align="center" h="100px">
                <Box textAlign="center" color="gray.400">
                    <Box alignItems='center' boxSize="100px">
                        <Image src='/images/logo.svg' h={100} width={100} alt="test" />
                    </Box>
                    <Text mt={2}>Nothing to show</Text>
                </Box>
            </Flex>
        );
    }

    return (
        <Box bg='white' borderRadius='md' p='3'>
            <Table.Root bgColor="inherit" showColumnBorder={false}>
                <Table.Header>
                    <Table.Row bgColor='inherit'>
                        <Table.ColumnHeader>Block</Table.ColumnHeader>
                        <Table.ColumnHeader>Hash</Table.ColumnHeader>
                        <Table.ColumnHeader>Messages</Table.ColumnHeader>
                        <Table.ColumnHeader>Result</Table.ColumnHeader>
                        <Table.ColumnHeader>Time</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    <For each={paginatedItems}>
                        {(item, index) => (
                            <TxItem key={item.hash} item={item} rowIndex={index} />
                        )}
                    </For>
                </Table.Body>
            </Table.Root>
            <Flex justify="center" mt={4}>
                <PaginationRoot 
                    count={transactions.length} 
                    pageSize={rowsPerPage} 
                    page={page + 1} 
                    onPageChange={(e) => handlePageChange(e, e.page - 1)}
                >
                    <HStack wrap="wrap">
                        <PaginationPrevTrigger />
                        <PaginationItems />
                        <PaginationNextTrigger />
                    </HStack>
                </PaginationRoot>
            </Flex>
        </Box>
    );
}