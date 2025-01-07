import { Box, Center, Text } from "@chakra-ui/react";
import { useTransactions } from "./hooks";
import Pagination from "../layout/pagination";
import TxTable from "./table";
import NoData from "../helper/nodata";

export function TransactionList() {
    const { state, pageInfo, handlePageChange } = useTransactions();

    if (!state?.items?.length) {
        return (
            <Center borderRadius="20px" bgColor="#F6F7F8" py="5" px="8" minH="65vh" w="full">
                <NoData />
            </Center>
        );
    }

    return (
        <Box borderRadius="20px" bgColor="#F6F7F8" py="5" px="8" overflow={'auto'} w="full">
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
