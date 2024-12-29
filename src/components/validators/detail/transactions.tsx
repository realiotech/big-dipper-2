import React from "react";
import {
    Box
} from "@chakra-ui/react";
import { useTransactions } from "./hooks";
import TxTable from "@/components/transactions/table";

export default function Transactions() {
    const { state, loadNextPage } = useTransactions();

    const loadMoreItems = state.isNextPageLoading ? () => null : loadNextPage;
    const isItemLoaded = (index: number) => !state.hasNextPage || index < state.data.length;
    const itemCount = state.hasNextPage ? state.data.length + 1 : state.data.length;
    return (
        <Box bg="#F6F7F8" p={6} borderRadius="md" boxShadow="sm" mb={8}>
            <TxTable transactions={state.data} />
        </Box>
    );
}
