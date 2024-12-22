import { Box, Center, Text, Table, Link as ChakraLink, For } from "@chakra-ui/react";
import { useTransactions } from "./hooks";
import Link from "next/link";
import { getMiddleEllipsis } from "@src/utils/get_middle_ellipsis";
import numeral from "numeral";
import dayjs from "@src/utils/dayjs";
import { Button } from "../ui/button";
import { Status } from "../ui/status";

const TxItem = ({ item, rowIndex }) => {

    return (
        <Table.Row key={`transaction-${rowIndex}`}>
            <Table.Cell>
                <ChakraLink asChild colorPalette='blue'>
                    <Link href={`/blocks/${item.height}`}>{numeral(item.height).format('0,0')}</Link>
                </ChakraLink>
            </Table.Cell>
            <Table.Cell>
                <ChakraLink asChild colorPalette='blue'>
                    <Link href={`/transactions/${item.hash}`}>{getMiddleEllipsis(item.hash, { beginning: 15, ending: 5 })}</Link>
                </ChakraLink>
            </Table.Cell>
            <Table.Cell>{numeral(item.messages).format('0,0')}</Table.Cell>
            <Table.Cell><Status value={item.success ? "success" : "error"}><Text>{item.success ? "Success" : "Failed"}</Text></Status></Table.Cell>
            <Table.Cell>{dayjs.utc(item.timestamp).fromNow()}</Table.Cell>
        </Table.Row>
    );
};

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
