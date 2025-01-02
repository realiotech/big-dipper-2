import { Box, Center, Text, Table, For } from "@chakra-ui/react";
import { useTransactions } from "./hooks";

import { Button } from "@/components/ui/button";
import TxItem from "./item";
import TxTable from "./table";
import NoData from "../helper/nodata";

export function TransactionList() {
    const { state } = useTransactions();

    if (!state?.items?.length) {
        return (
            <Center borderRadius="20px" bgColor="#F6F7F8" py="5" px="8" minH="65vh" w="full">
                <NoData />
            </Center>
        );
    }

    return (
        <Box borderRadius="20px" bgColor="#F6F7F8" py="5" px="8" minH="85vh" w="full">
            <TxTable transactions={state.items} />
            <Center w='full' py='4'><Button variant={'plain'}>Load more</Button></Center>
        </Box>
    );
}
