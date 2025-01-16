import { useState } from "react";
import {
  Box,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@chakra-ui/react";
import { useStaking } from "./hooks";
import NoData from "@/components/helper/nodata";

export default function Staking({ address }) {
  const [delegationsPage, setDelegationsPage] = useState(0);
  const [redelegationsPage, setRedelegationsPage] = useState(0);
  const [unbondingsPage, setUnbondingsPage] = useState(0);
  const { state, delegations, unbondings, handleTabChange } =
    useStaking(delegationsPage, unbondingsPage, address);

  return (
    <Tabs.Root
      value={state.tab + 1}
      variant="subtle"
      handleTabChange={(e) => handleTabChange(e, e.value - 1)}
    >
      <TabsList mb={5}>
        <TabsTrigger value={1}>Delegations ({delegations.count})</TabsTrigger>
        <TabsTrigger value={3}>Unbondings ({unbondings.count})</TabsTrigger>
      </TabsList>
      {delegations?.data ? (
        <Box bg="#FAFBFC" p={6} borderRadius="md" boxShadow="sm" mb={8}>
          <TabsContent value={1}></TabsContent>
          <TabsContent value={3}></TabsContent>
        </Box>
      ) : (
        <NoData />
      )}
    </Tabs.Root>
  );
}
