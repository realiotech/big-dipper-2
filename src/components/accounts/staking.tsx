import {
  Box,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@chakra-ui/react";
import NoData from "@/components/helper/nodata";
import Delegations from "@/components/staking/delegations";
import Undelegations from "@/components/staking/undelegations";

export default function Staking({ delegations, unbondings, handleSort, sortDirection }) {
  return (
    <Tabs.Root
      defaultValue={1}
      variant="subtle"
    >
      <TabsList mb={5}>
        <TabsTrigger value={1}>Delegations ({delegations.count ?? 0})</TabsTrigger>
        <TabsTrigger value={2}>Unbondings ({unbondings.count ?? 0})</TabsTrigger>
      </TabsList>
      {delegations?.data ? (
        <Box bg={{ base: "#FAFBFC", _dark: "#0F0F0F" }} p={6} borderRadius="md" boxShadow="sm" mb={8}>
          <TabsContent value={1}>
            <Delegations data={delegations} page={1} setPage={()=> {}} displayMode={2} handleSort={handleSort} sort={sortDirection} />
          </TabsContent>
          <TabsContent value={2}>
            <Undelegations data={unbondings} page={1} setPage={() => { }} displayMode={2} handleSort={handleSort} sort={sortDirection} />
          </TabsContent>
        </Box>
      ) : (
        <NoData />
      )}
    </Tabs.Root>
  );
}
