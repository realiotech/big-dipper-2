import {
  Box,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@chakra-ui/react";
import { useActivities } from "./hooks";
import TransferTable from "../districtTransactions/transfer";
import MintTable from "../districtTransactions/mint";
import BurnTable from "../districtTransactions/burn";

export default function Activities({ denom }) {
  const {
    transfer,
    mint,
    burn,
    transferPage,
    mintPage,
    burnPage,
    setTransferPage,
    setMintPage,
    setBurnPage
  } = useActivities();
  console.log(mint.data)
  return (
    <Tabs.Root defaultValue={1} variant="subtle">
      <TabsList>
        <TabsTrigger value={1}>Transfer ({transfer.count ?? 0})</TabsTrigger>
        <TabsTrigger value={2}>Mint ({mint.count ?? 0})</TabsTrigger>
        <TabsTrigger value={3}>Burn ({burn.count ?? 0})</TabsTrigger>
      </TabsList>
      <Box
        bg={{ base: "#FAFBFC", _dark: "#0F0F0F" }}
        px={6}
        borderRadius="md"
        mb={4}
      >
        <TabsContent value={1}>
          <TransferTable
            data={transfer}
            page={transferPage}
            setPage={setTransferPage}
          />
        </TabsContent>
        <TabsContent value={2}>
          <MintTable
            data={mint}
            page={mintPage}
            setPage={setMintPage}
          />
        </TabsContent>
        <TabsContent value={3}>
          <BurnTable
            data={burn}
            page={burnPage}
            setPage={setBurnPage}
          />
        </TabsContent>
      </Box>
    </Tabs.Root>
  );
}
