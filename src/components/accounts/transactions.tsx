import React from "react";
import { Box, Text, Center } from "@chakra-ui/react";
import { useTransactions } from "./hooks";
import TxTable from "@/components/transactions/table";
import Pagination from "@/components/layout/pagination";

export default function Transactions() {
  const { state, pageInfo, handlePageChange } = useTransactions();

  return (
    <Box bg={{ base: "#FAFBFC", _dark: "#0F0F0F" }} overflow={"auto"} py={6} px={2} borderRadius="md" boxShadow="sm" mb={8}>
      <Text fontSize="lg" px={4} fontWeight="bold" mb="4">
        Transactions
      </Text>
      <TxTable transactions={state.data} isLoading={state.isNextPageLoading} />

      {state.data.length > 0 && (
        <Center w="full" py="4">
          <Pagination
            pageInfo={pageInfo}
            pageChangeFunc={handlePageChange}
            pageSizeChangeFunc={() => {}}
          />
        </Center>
      )}
    </Box>
  );
}