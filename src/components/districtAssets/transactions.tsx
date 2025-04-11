import {
  Box,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@chakra-ui/react";
import { useStaking } from "./hooks";
import NoData from "@/components/helper/nodata";
import Delegations from "@/components/staking/delegations";
import Undelegations from "@/components/staking/undelegations";
import TransferTable from "../districtTransactions/transfer";
import MintTable from "../districtTransactions/mint";
import BurnTable from "../districtTransactions/burn";

export default function Transactions({ denom }) {
  const {
    delegations,
    unbondings,
    delegationsPage,
    unbondingsPage,
    setDelegationsPage,
    setUnboningsPage,
    handleSort,
    sortDirection,
  } = useStaking(denom);

  const mockTransferData = {
    loading: false,
    count: 25,
    data: [
      { from: "cosmos1abc...xyz1", to: "cosmos1def...uvw1", amount: "120.50" },
      { from: "cosmos1ghi...xyz2", to: "cosmos1jkl...uvw2", amount: "987.65" },
      { from: "cosmos1mno...xyz3", to: "cosmos1pqr...uvw3", amount: "43.00" },
      { from: "cosmos1stu...xyz4", to: "cosmos1vwx...uvw4", amount: "3000.00" },
      { from: "cosmos1yz1...xyz5", to: "cosmos1abc...uvw5", amount: "10.75" },
      { from: "cosmos1def...xyz6", to: "cosmos1ghi...uvw6", amount: "720.00" },
      { from: "cosmos1jkl...xyz7", to: "cosmos1mno...uvw7", amount: "55.25" },
      { from: "cosmos1pqr...xyz8", to: "cosmos1stu...uvw8", amount: "1100.00" },
      { from: "cosmos1vwx...xyz9", to: "cosmos1yz1...uvw9", amount: "66.60" },
      { from: "cosmos1abc...xyz0", to: "cosmos1def...uvw0", amount: "42.42" },
    ],
  };

  return (
    <Tabs.Root defaultValue={1} variant="subtle">
      <TabsList>
        <TabsTrigger value={1}>Transfer ({delegations.count ?? 0})</TabsTrigger>
        <TabsTrigger value={2}>Mint ({unbondings.count ?? 0})</TabsTrigger>
        <TabsTrigger value={3}>Burn ({unbondings.count ?? 0})</TabsTrigger>
      </TabsList>
      {delegations?.data ? (
        <Box
          bg={{ base: "#FAFBFC", _dark: "#0F0F0F" }}
          px={6}
          borderRadius="md"
          mb={4}
        >
          <TabsContent value={1}>
            <TransferTable
              data={mockTransferData}
              page={0}
              setPage={() => {}}
              sort={"asc"}
              setSort={() => {}}
            />
          </TabsContent>
          <TabsContent value={2}>
            <MintTable
              data={mockTransferData}
              page={unbondingsPage}
              setPage={setUnboningsPage}
              displayMode={0}
              handleSort={handleSort}
              sort={sortDirection}
            />
          </TabsContent>
          <TabsContent value={3}>
            <BurnTable
              data={mockTransferData}
              page={unbondingsPage}
              setPage={setUnboningsPage}
              displayMode={0}
              handleSort={handleSort}
              sort={sortDirection}
            />
          </TabsContent>
        </Box>
      ) : (
        <NoData />
      )}
    </Tabs.Root>
  );
}
