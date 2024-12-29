import { useState } from "react";
import {
    Box,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent
} from "@chakra-ui/react";
import { useStaking } from "./hooks";

export default function Staking({ address }) {
    const [delegationsPage, setDelegationsPage] = useState(0);
    const [redelegationsPage, setRedelegationsPage] = useState(0);
    const [unbondingsPage, setUnbondingsPage] = useState(0);
    const { state, delegations, redelegations, unbondings, handleTabChange } = useStaking(
        delegationsPage,
        redelegationsPage,
        unbondingsPage,
        address
    );
    return (
        <Box bg="#F6F7F8" p={6} borderRadius="md" boxShadow="sm" mb={8}>
            <Tabs.Root tab={state.tab + 1} handleTabChange={e => handleTabChange(e, e.value - 1)}>
                <TabsList>
                    <TabsTrigger value={1}>Delegations ({delegations.count})</TabsTrigger>
                    <TabsTrigger value={2}>Redelegations ({redelegations.count})</TabsTrigger>
                    <TabsTrigger value={3}>Unbondings ({unbondings.count})</TabsTrigger>
                </TabsList>
                <TabsContent value={1}>

                </TabsContent>
                <TabsContent value={2}>

                </TabsContent>
                <TabsContent value={3}>
                    
                </TabsContent>
            </Tabs.Root>
        </Box>
    )
}