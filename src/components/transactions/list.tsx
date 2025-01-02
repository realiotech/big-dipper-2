import { Box, Center, Text, Table, For } from "@chakra-ui/react";
import { useTransactions } from "./hooks";

import { Button } from "@/components/ui/button";
import TxItem from "./item";
import TxTable from "./table";

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
        <Box borderRadius="20px" bgColor="#F6F7F8" py="5" px="8" h="100vh" overflow={'auto'} w="full">
            <Text fontSize="2xl" fontWeight="bold" mb="4">
                Transactions
            </Text>
            <TxTable transactions={state.items} />
            <Center w='full' py='4'><Button variant={'plain'}>Load more</Button></Center>
        </Box>
    );
}
