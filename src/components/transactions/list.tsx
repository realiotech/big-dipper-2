import { Box, Center, Text, Table, For } from "@chakra-ui/react";
import { useTransactions } from "./hooks";

import { Button } from "../ui/button";
import TxItem from "./item";

export function TransactionList() {
    const { state } = useTransactions();

    if (!state?.items?.length) {
        return (
            <Center borderRadius="20px" bgColor="#F6F7F8" py="5" px="8" minH="65vh" w="full">
                <Text>Nothing to show</Text>
            </Center>
        );
    }

    return (
        <Box borderRadius="20px" bgColor="#F6F7F8" py="5" px="8" minH="85vh" w="full">
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
                    <For each={state.items}>
                        {(item, index) => (
                            <TxItem item={item} rowIndex={index} />
                        )}
                    </For>
                </Table.Body>
            </Table.Root>
            <Center w='full' py='4'><Button variant={'plain'}>Load more</Button></Center>
        </Box>
    );
}
