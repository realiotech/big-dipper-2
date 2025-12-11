import React from "react";
import { Box, Text, Center, Button, Flex, Link } from "@chakra-ui/react";
import { useTransactions } from "./hooks";
import TxTable from "@/components/transactions/table";
import Pagination from "@/components/layout/pagination";

interface TransactionsProps {
  onExportClick?: () => void;
}

export default function Transactions({ onExportClick }: TransactionsProps) {
  const { state, pageInfo, handlePageChange } = useTransactions();

  return (
    <Box bg={{ base: "#FAFBFC", _dark: "#0F0F0F" }} overflow={"auto"} py={6} px={2} borderRadius="md" boxShadow="sm" mb={8}>
        <Text fontSize="lg" fontWeight="bold">
          Transactions
        </Text>
      <TxTable transactions={state.data} isLoading={state.isNextPageLoading} />
      <Flex justifyContent="flex-end" alignItems="center" px={4} w={'full'} mt="4">

        {onExportClick && (
          <Text
            onClick={onExportClick}
          >
            [Download: <Link color="#1D86FF" cursor={'pointer'} onClick={onExportClick}>CSV Export</Link>]
          </Text>
        )}
      </Flex>

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