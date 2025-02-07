import {
  Box,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@chakra-ui/react";
import { useStaking } from "./hooks";
import NoData from "@/components/helper/nodata";
import Delegations from "@/components/staking/delegations";
import Undelegations from "@/components/staking/undelegations";

export default function Staking({ denom }) {
  const { delegations, unbondings, delegationsPage, unbondingsPage, setDelegationsPage, setUnboningsPage, handleSort, sortDirection } =
    useStaking(denom);

  return (
    <Tabs.Root
      defaultValue={1}
      variant="subtle"
    >
      <TabsList>
        <TabsTrigger value={1}>Delegations ({delegations.count ?? 0})</TabsTrigger>
        <TabsTrigger value={2}>Unbondings ({unbondings.count ?? 0})</TabsTrigger>
      </TabsList>
      {delegations?.data ? (
        <Box bg={{ base: "#FAFBFC", _dark: "#0F0F0F" }} px={6} borderRadius="md" mb={4}>
          <TabsContent value={1}>
            <Delegations data={delegations} page={delegationsPage} setPage={setDelegationsPage} displayMode={0} handleSort={handleSort} sort={sortDirection} />
          </TabsContent>
          <TabsContent value={2}>
            <Undelegations data={unbondings} page={unbondingsPage} setPage={setUnboningsPage} displayMode={0} handleSort={handleSort} sort={sortDirection} />
          </TabsContent>
        </Box>
      ) : (
        <NoData />
      )}
    </Tabs.Root>
  );
}
