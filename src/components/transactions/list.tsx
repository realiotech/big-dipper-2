import { Box, Center, Text } from "@chakra-ui/react";
import { useTransactions } from "./hooks";
import Pagination from "../layout/pagination";
import TxTable from "./table";

export function TransactionList() {
    const { state, pageInfo, handlePageChange } = useTransactions();

    return (
        <Box borderRadius="20px" bgColor="#FAFBFC" py="5" px="8" overflow={'auto'} w="full" minH="85vh">
            <Text fontSize="2xl" fontWeight="bold" mb="4">
                Transactions
            </Text>
            <TxTable transactions={state.items} isLoading={state.loading} />
            <Center w='full' py='4'>
                <Pagination
                    pageInfo={pageInfo}
                    pageChangeFunc={handlePageChange}
                    pageSizeChangeFunc={() => { }}
                />
            </Center>
        </Box>
    );
}
