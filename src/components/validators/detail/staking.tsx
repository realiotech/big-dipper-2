import { useState } from "react";
import {
  Box,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Flex,
  Text,
} from "@chakra-ui/react";
import { useStaking } from "./hooks";

export default function Staking({ address }) {
  const [delegationsPage, setDelegationsPage] = useState(0);
  const [redelegationsPage, setRedelegationsPage] = useState(0);
  const [unbondingsPage, setUnbondingsPage] = useState(0);
  const { state, delegations, redelegations, unbondings, handleTabChange } =
    useStaking(delegationsPage, redelegationsPage, unbondingsPage, address);

  return (
    <Tabs.Root
      value={state.tab + 1}
      variant="subtle"
      handleTabChange={(e) => handleTabChange(e, e.value - 1)}
    >
      <TabsList mb={5}>
        <TabsTrigger value={1}>Delegations ({delegations.count})</TabsTrigger>
        <TabsTrigger value={2}>
          Redelegations ({redelegations.count})
        </TabsTrigger>
        <TabsTrigger value={3}>Unbondings ({unbondings.count})</TabsTrigger>
      </TabsList>
      {delegations?.data ? (
        <Box bg="#F6F7F8" p={6} borderRadius="md" boxShadow="sm" mb={8}>
          <TabsContent value={1}></TabsContent>
          <TabsContent value={2}></TabsContent>
          <TabsContent value={3}></TabsContent>
        </Box>
      ) : (
        <Box
          bg="#F6F7F8"
          p={6}
          borderRadius="md"
          textAlign={"center"}
          boxShadow="sm"
          mb={8}
        >
          <Text>Nothing to show</Text>
        </Box>
      )}
    </Tabs.Root>
  );
}
