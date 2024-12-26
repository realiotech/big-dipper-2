import { useMemo } from "react";
import {
    Box,
    Text,
    Table,
    HStack,
    Flex,
    Tabs
} from "@chakra-ui/react";
import useTranslation from "next-translate/useTranslation";
import { useVotes } from "./hooks";
import numeral from "numeral";
import Big from "big.js";
import useShallowMemo from '@/hooks/useShallowMemo';
import { usePagination } from '@/hooks/use_pagination';
import { filterDataByTab, getVoteKey } from './utils';
import {
    PaginationItems,
    PaginationNextTrigger,
    PaginationPrevTrigger,
    PaginationRoot,
} from "@/components/ui/pagination"
import { useProfileRecoil } from "@/recoil/profiles";
import Proposer from "../helper/proposer";

const VoteItem = ({vote}) => {
    const { name, address, imageUrl } = useProfileRecoil(vote.user);
    return (
        <Table.Row>
            <Table.Cell><Proposer name={name} address={address} image={imageUrl} /></Table.Cell>
            <Table.Cell>{getVoteKey(vote.vote)}</Table.Cell>
        </Table.Row>
    )
}

export default function VotesTable() {
    const {
        page,
        handlePageChange,
        sliceItems,
        resetPagination,
    } = usePagination({});
    const { state, handleTabChange } = useVotes(resetPagination);
    const filteredItemsMemo = useShallowMemo(
        filterDataByTab({
            tab: state.tab,
            data: state.data,
            notVoted: state.validatorsNotVoted,
        })
    );
    const items = useMemo(() => sliceItems(filteredItemsMemo), [filteredItemsMemo, sliceItems]);

    return (
        <Box bg="#f9f9f9" p={6} borderRadius="md" boxShadow="sm">
            <Flex w='full' justifyContent={'space-between'} align={'center'} pb={4}>
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                    Votes
                </Text>
                <Tabs.Root value={state?.tab} variant="enclosed" onValueChange={(e) => handleTabChange(e, e.value)}>
                    <Tabs.List>
                        <Tabs.Trigger value={0}>
                            All
                        </Tabs.Trigger>
                        <Tabs.Trigger value={1}>
                            Yes
                        </Tabs.Trigger>
                        <Tabs.Trigger value={2}>
                            No
                        </Tabs.Trigger>
                        <Tabs.Trigger value={3}>
                            Veto
                        </Tabs.Trigger>
                        <Tabs.Trigger value={4}>
                            Abstain
                        </Tabs.Trigger>
                        <Tabs.Trigger value={5}>
                            Did not vote
                        </Tabs.Trigger>
                        <Tabs.Indicator />
                    </Tabs.List>
                </Tabs.Root>
            </Flex>

            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader>Block</Table.ColumnHeader>
                        <Table.ColumnHeader>Vote</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {items?.length && items.map((item, index) => (
                        <VoteItem vote={item} key={`vote-${index}`} />
                    ))}
                </Table.Body>
            </Table.Root>
            <PaginationRoot count={state.data.length} pageSize={10} page={page+1} onPageChange={(e) => handlePageChange(e, e.page -1)}>
                <HStack wrap="wrap">
                    <PaginationPrevTrigger />
                    <PaginationItems />
                    <PaginationNextTrigger />
                </HStack>
            </PaginationRoot>
        </Box>
    );
}
