import React from "react";
import { Box } from "@chakra-ui/react";
import { useTransactions } from "./hooks";
import TxTable from "@/components/transactions/table";

export default function Transactions() {
  const { state } = useTransactions();

  return (
    <Box bg="#FAFBFC" py={6} px={2} borderRadius="md" boxShadow="sm" mb={8}>
      <TxTable transactions={state.data} isLoading={false} />
    </Box>
  );
}
